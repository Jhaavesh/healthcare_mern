// middlewares/auth.js
const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
  const header = req.header('Authorization') || req.header('x-auth-token');
  const token = header ? (header.startsWith('Bearer ') ? header.split(' ')[1] : header) : null;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
