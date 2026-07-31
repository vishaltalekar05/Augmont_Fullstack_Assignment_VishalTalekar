const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const Product = require('../models/Product');
const Category = require('../models/Category');

// In-memory job status tracker (fine for an assignment; use Redis/DB in production)
const bulkJobs = {};

/**
 * POST /api/products/bulk-upload
 * Accepts a CSV file with columns: name,price,categoryName
 *
 * Why this avoids 504 timeouts:
 * - We respond IMMEDIATELY with a jobId instead of waiting for the whole
 *   file to be parsed and inserted (which is what causes gateway timeouts
 *   on large files).
 * - The file is parsed via a STREAM (csv-parser), not loaded fully into
 *   memory - so even a very large CSV doesn't blow up RAM.
 * - Rows are inserted in BATCHES using bulkCreate (e.g. 500 at a time)
 *   instead of one-by-one, which is far faster and keeps DB round-trips low.
 * - The actual processing happens asynchronously after the response is sent;
 *   the client polls GET /api/products/bulk-upload/status/:jobId for progress.
 */
exports.bulkUploadProducts = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'CSV file is required (field name: file)' });

  const jobId = `job-${Date.now()}`;
  bulkJobs[jobId] = { status: 'processing', processed: 0, failed: 0, errors: [] };

  // Respond right away so the client/gateway never times out waiting
  res.status(202).json({ message: 'Bulk upload started', jobId });

  const filePath = req.file.path;
  const BATCH_SIZE = 500;
  let batch = [];
  const categoryCache = new Map();

  const flushBatch = async () => {
    if (batch.length === 0) return;
    try {
      await Product.bulkCreate(batch, { validate: true });
      bulkJobs[jobId].processed += batch.length;
    } catch (err) {
      bulkJobs[jobId].failed += batch.length;
      bulkJobs[jobId].errors.push(err.message);
    }
    batch = [];
  };

  const stream = fs.createReadStream(filePath).pipe(csv());

  stream.on('data', (row) => {
    // Pause the stream while we resolve category + push to batch,
    // then resume — keeps memory bounded on huge files.
    stream.pause();
    (async () => {
      try {
        const categoryName = row.categoryName?.trim();
        let categoryId = categoryCache.get(categoryName);

        if (!categoryId) {
          const [category] = await Category.findOrCreate({ where: { name: categoryName } });
          categoryId = category.id;
          categoryCache.set(categoryName, categoryId);
        }

        batch.push({
          name: row.name,
          price: parseFloat(row.price),
          categoryId
        });

        if (batch.length >= BATCH_SIZE) await flushBatch();
      } catch (err) {
        bulkJobs[jobId].failed += 1;
        bulkJobs[jobId].errors.push(err.message);
      } finally {
        stream.resume();
      }
    })();
  });

  stream.on('end', async () => {
    await flushBatch();
    bulkJobs[jobId].status = 'completed';
    fs.unlink(filePath, () => {}); // cleanup uploaded file
  });

  stream.on('error', (err) => {
    bulkJobs[jobId].status = 'failed';
    bulkJobs[jobId].errors.push(err.message);
  });
};

exports.getBulkUploadStatus = (req, res) => {
  const job = bulkJobs[req.params.jobId];
  if (!job) return res.status(404).json({ message: 'Job not found' });
  return res.json(job);
};

/**
 * GET /api/products/report?format=csv|xlsx
 *
 * Why this avoids 504 timeouts:
 * - Data is fetched from the DB in batches (findAll with limit/offset)
 *   rather than one giant SELECT * loaded fully into memory.
 * - The response is STREAMED to the client as rows are generated
 *   (res.write for CSV, workbook.xlsx.write(res) for Excel) instead of
 *   building the entire file in memory before sending - so the client
 *   starts receiving bytes immediately and the connection stays alive.
 */
exports.generateProductReport = async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const BATCH_SIZE = 1000;

  try {
    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=product-report.xlsx');

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
      const sheet = workbook.addWorksheet('Products');
      sheet.columns = [
        { header: 'UniqueID', key: 'uniqueId', width: 36 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Price', key: 'price', width: 12 },
        { header: 'Category', key: 'category', width: 20 }
      ];

      let offset = 0;
      while (true) {
        const rows = await Product.findAll({
          include: Category,
          limit: BATCH_SIZE,
          offset,
          order: [['id', 'ASC']]
        });
        if (rows.length === 0) break;

        rows.forEach((p) => {
          sheet.addRow({
            uniqueId: p.uniqueId,
            name: p.name,
            price: p.price,
            category: p.Category ? p.Category.name : ''
          }).commit();
        });

        offset += BATCH_SIZE;
      }

      sheet.commit();
      await workbook.commit();
    } else {
      // CSV - streamed row by row
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=product-report.csv');
      res.write('UniqueID,Name,Price,Category\n');

      let offset = 0;
      while (true) {
        const rows = await Product.findAll({
          include: Category,
          limit: BATCH_SIZE,
          offset,
          order: [['id', 'ASC']]
        });
        if (rows.length === 0) break;

        const csvChunk = rows
          .map((p) => `${p.uniqueId},"${p.name}",${p.price},"${p.Category ? p.Category.name : ''}"`)
          .join('\n');
        res.write(csvChunk + '\n');

        offset += BATCH_SIZE;
      }
      res.end();
    }
  } catch (err) {
    // If headers are already sent (streaming in progress), just end the connection
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating report', error: err.message });
    } else {
      res.end();
    }
  }
};
