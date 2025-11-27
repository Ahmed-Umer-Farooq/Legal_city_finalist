const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  if (user.registration_id) {
    payload.registration_id = user.registration_id;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
