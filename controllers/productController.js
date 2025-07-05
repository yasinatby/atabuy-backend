const Product = require('../models/Product');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Produkte.' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produkt nicht gefunden.' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Produkts.' });
  }
};

// POST /api/products
exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, categories, image, stock } = req.body;

    if (!name || !price || !description || stock === undefined) {
      return res.status(400).json({ message: 'Name, Preis, Beschreibung und Lagerbestand sind erforderlich.' });
    }

    if (stock < 0) {
      return res.status(400).json({ message: 'Lagerbestand darf nicht negativ sein.' });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      categories: categories || [],
      image: image || '',
      stock,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Speichern des Produkts.' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Produkt nicht gefunden.' });
    res.json({ message: 'Produkt erfolgreich gelöscht.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Löschen des Produkts.' });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, categories, image, stock } = req.body;

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: 'Lagerbestand darf nicht negativ sein.' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, categories, image, stock },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Produkt nicht gefunden.' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Produkts.' });
  }
};
