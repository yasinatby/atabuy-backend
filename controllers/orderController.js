const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ message: 'Kundendaten unvollständig.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Bestellpositionen fehlen.' });
    }

    // Berechne Gesamtpreis und validiere, dass Produkte existieren
    let total = 0;
    const orderItems = [];

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) {
        return res.status(404).json({ message: `Produkt mit ID ${it.productId} nicht gefunden.` });
      }

      const quantity = parseInt(it.quantity, 10);
      if (quantity < 1) {
        return res.status(400).json({ message: 'Menge muss >= 1 sein.' });
      }

      // Prüfe Lager
      if (prod.stock < quantity) {
        return res.status(400).json({ message: `Nicht genügend Lagerbestand für ${prod.name}.` });
      }

      // Lager reduzieren
      prod.stock -= quantity;
      await prod.save();

      total += prod.price * quantity;
      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: prod.price,
        quantity,
      });
    }

    const newOrder = new Order({
      items: orderItems,
      total,
      customer,
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Erstellen der Bestellung.' });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name price');
    if (!order) return res.status(404).json({ message: 'Bestellung nicht gefunden.' });

    // Nur Admins oder Besteller dürfen die Bestellung sehen
    const isOwner = order.customer?.email === req.user?.email;
    if (!req.user?.isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Kein Zugriff auf diese Bestellung.' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Bestellung.' });
  }
};

// GET /api/orders?status=Pending
exports.getAllOrders = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    const allowedStatus = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const query = {};

    if (statusFilter) {
      if (!allowedStatus.includes(statusFilter)) {
        return res.status(400).json({ message: 'Ungültiger Bestellstatus für Filter.' });
      }
      query.status = statusFilter;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Bestellungen.' });
  }
};

// PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Ungültiger Bestellstatus.' });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Bestellung nicht gefunden.' });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Bestellstatus.' });
  }
};

// GET /api/orders/me?status=Pending
exports.getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const statusFilter = req.query.status;

    const allowedStatus = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const query = { 'customer.email': userEmail };

    if (statusFilter) {
      if (!allowedStatus.includes(statusFilter)) {
        return res.status(400).json({ message: 'Ungültiger Bestellstatus für Filter.' });
      }
      query.status = statusFilter;
    }

    const myOrders = await Order.find(query).sort({ createdAt: -1 });
    res.json(myOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen deiner Bestellungen.' });
  }
};
