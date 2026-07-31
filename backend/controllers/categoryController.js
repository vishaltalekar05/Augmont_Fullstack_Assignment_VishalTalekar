const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const category = await Category.create({ name });
    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating category', error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching category', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = req.body.name ?? category.name;
    await category.save();
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating category', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    return res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
};
