import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.SECRET_KEY;


const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verify = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ valid: true, username: decoded.username });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

export {
  login,
  verify
};
