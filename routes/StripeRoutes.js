// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res, next) => {
  try {
    const { items, customer } = req.body;
    // items: [{ productId, quantity, price, name }, ...]
    // customer: { name, email, address, phone? }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Warenkorb darf nicht leer sein.' });
    }
    if (!customer?.email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich.' });
    }

    // Mappe Cart-Items zu Stripe Line Items
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Cent‐Währung
      },
      quantity: item.quantity,
    }));

    // Erstelle Stripe‐Checkout‐Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      customer_email: customer.email,
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        name: customer.name,
        address: JSON.stringify(customer.address),
        phone: customer.phone || '',
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe-Fehler:', err);
    next(err);
  }
});

module.exports = router;
