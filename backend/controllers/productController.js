const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'name, price and categoryId are required' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(400).json({ message: 'Invalid categoryId - category does not exist' });

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({ name, price, categoryId, image });
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, price, categoryId } = req.body;
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) return res.status(400).json({ message: 'Invalid categoryId' });
      product.categoryId = categoryId;
    }
    if (name) product.name = name;
    if (price) product.price = price;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

/**
 * GET /api/products
 * Query params:
 *  page (default 1), limit (default 10)
 *  sortBy=price, order=asc|desc
 *  category=<name>, search=<product name>
 */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // cap to avoid huge payloads
    const offset = (page - 1) * limit;

    const order = (req.query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const sortBy = req.query.sortBy === 'price' ? 'price' : 'createdAt';

    const where = {};
    if (req.query.search) {
      where.name = { [Op.like]: `%${req.query.search}%` };
    }

    const include = [{
      model: Category,
      ...(req.query.category ? { where: { name: { [Op.like]: `%${req.query.category}%` } } } : {})
    }];

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order: [[sortBy, order]],
      limit,
      offset,
      distinct: true // needed for correct count when using include
    });

    return res.json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};
