const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const totalItemsSold = orders.reduce((sum, o) => {
      return sum + o.items.reduce((sub, item) => sub + item.quantity, 0);
    }, 0);

    const uniqueCustomers = new Set(orders.map(o => o.customer.email)).size;

    res.json({
      totalOrders,
      totalRevenue,
      totalItemsSold,
      uniqueCustomers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Dashboard-Daten.' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const orders = await Order.find();

    const productMap = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!productMap[item.product]) {
          productMap[item.product] = { name: item.name, quantity: 0 };
        }
        productMap[item.product].quantity += item.quantity;
      }
    }

    const topProducts = Object.entries(productMap)
      .map(([id, data]) => ({ productId: id, name: data.name, quantity: data.quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Top-Produkte.' });
  }
};
