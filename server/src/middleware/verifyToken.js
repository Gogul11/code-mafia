import  jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY;

// Common middleware to verify token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const savedToken = await client.get(`token:${decoded.username}`);
    if (!savedToken || savedToken !== token) {
      return res.status(401).json({ message: 'Session invalid or expired. Please login again.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export default verifyToken;
