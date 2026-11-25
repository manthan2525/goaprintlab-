const Product = require('../models/Product');

function parseListField(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_err) {
      // Fall back to comma-separated string parsing
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

async function getProducts(req, res) {
  try {
    const { search, category, material, inStock } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (material && material !== 'All') {
      filter.materials = material;
    }
    if (inStock === 'true') {
      filter.inStock = true;
    }
    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch products.' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(product);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }
}

async function createProduct(req, res) {
  try {
    const { title, category, description, basePrice, materials, colors, sizes, images, inStock } =
      req.body;

    if (!title || !category || !description || basePrice === undefined) {
      return res.status(400).json({
        message: 'Title, category, description, and basePrice are required.',
      });
    }

    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];
    const providedImages = parseListField(images, []);
    const mergedImages = [...uploadedImages, ...providedImages];

    const product = await Product.create({
      title: String(title).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      basePrice: Number(basePrice),
      materials: parseListField(materials, ['PLA', 'PETG', 'ABS']),
      colors: parseListField(colors, ['Matte Black', 'Arctic White', 'Ocean Blue']),
      sizes: parseListField(sizes, ['Small', 'Medium', 'Large']),
      images:
        mergedImages.length > 0
          ? mergedImages
          : ['/uploads/products/default-3d-product.svg'],
      inStock: inStock === undefined ? true : inStock === true || inStock === 'true',
    });

    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create product.' });
  }
}

async function updateProduct(req, res) {
  try {
    const targetId = req.params.id || req.body._id || req.body.id;
    const product = await Product.findById(targetId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const { title, category, description, basePrice, materials, colors, sizes, images, inStock } =
      req.body;

    if (title !== undefined) product.title = String(title).trim();
    if (category !== undefined) product.category = String(category).trim();
    if (description !== undefined) product.description = String(description).trim();
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (materials !== undefined) product.materials = parseListField(materials, product.materials);
    if (colors !== undefined) product.colors = parseListField(colors, product.colors);
    if (sizes !== undefined) product.sizes = parseListField(sizes, product.sizes);
    if (inStock !== undefined) {
      product.inStock = inStock === true || inStock === 'true';
    }

    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];
    const providedImages = images !== undefined ? parseListField(images, []) : null;

    if (uploadedImages.length > 0 && providedImages) {
      product.images = [...uploadedImages, ...providedImages];
    } else if (uploadedImages.length > 0) {
      product.images = [...uploadedImages, ...product.images];
    } else if (providedImages && providedImages.length > 0) {
      product.images = providedImages;
    }

    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update product.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const targetId = req.params.id || req.body._id || req.body.id;
    const deleted = await Product.findByIdAndDelete(targetId);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ message: 'Product deleted successfully.', id: deleted._id });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete product.' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
