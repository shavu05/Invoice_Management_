const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Get the header
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verifying token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    //  Attach only needed claims to req.user
    const { id, username, role } = payload;
    req.user = { id, username, role };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
