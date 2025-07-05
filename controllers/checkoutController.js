// backend/controllers/checkoutController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items,
      success_url: 'http://localhost:3000/bestellung-erfolgreich',
      cancel_url: 'http://localhost:3000/cart',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe-Fehler:', error.message);
    res.status(500).json({ message: 'Fehler beim Erstellen der Checkout-Session' });
  }
};
