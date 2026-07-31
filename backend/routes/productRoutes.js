const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const bulkController = require('../controllers/bulkController');
const { imageUpload, bulkUpload } = require('../middleware/upload');

// Bulk upload & report routes are declared BEFORE '/:id' routes to avoid route collisions
router.post('/bulk-upload', bulkUpload.single('file'), bulkController.bulkUploadProducts);
router.get('/bulk-upload/status/:jobId', bulkController.getBulkUploadStatus);
router.get('/report', bulkController.generateProductReport);

router.post('/', imageUpload.single('image'), productController.createProduct);
router.get('/', productController.getProducts); // supports page, limit, sortBy, order, search, category
router.get('/:id', productController.getProductById);
router.put('/:id', imageUpload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
