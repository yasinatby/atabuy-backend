const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

// Temporärer Speicher für 2FA-Codes
const active2FACodes = new Map();

// Registrierung
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Passwort muss mindestens 6 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'E-Mail ist bereits registriert.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      isAdmin: email === 'info@atabuy.de', // Nur diese Mail ist Admin
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('💥 Registrierung fehlgeschlagen:', error);
    res.status(500).json({ message: 'Serverfehler bei der Registrierung.' });
  }
};

// Login mit optionalem 2FA
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Benutzer nicht gefunden.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Falsches Passwort.' });

    // Wenn Admin mit 2FA → Code senden
    if (user.isAdmin) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      active2FACodes.set(email, { code, createdAt: Date.now() });

      await sendMail({
        to: email,
        subject: 'Dein 2FA-Code',
        text: `Dein Sicherheitscode lautet: ${code}`,
      });

      return res.status(200).json({ twoFA: true, email });
    }

    // Normale Nutzer → direkt einloggen
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('💥 Login-Fehler:', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Login.' });
  }
};

// ganz unten:
exports.verify2FA = async (req, res) => {
  const { email, code } = req.body;

  const entry = active2FACodes.get(email);
  if (!entry || entry.code !== code) {
    return res.status(401).json({ message: 'Ungültiger oder abgelaufener Code.' });
  }

  active2FACodes.delete(email);

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Benutzer nicht gefunden.' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      name: user.name,
    },
  });
};
