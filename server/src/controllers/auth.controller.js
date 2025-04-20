import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.SECRET_KEY;

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.log('Invalid credentials: user not found or error occurred');
      console.error('User error:', userError);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid credentials: password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', user.team_id)
      .single();

    if (teamError || !team) {
      console.log('Team not found or error occurred');
      return res.status(500).json({ message: 'Team not found' });
    }

    const token = jwt.sign(
      { 
        username, 
        team_id: user.team_id, 
        team_name: team.name 
      }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
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
    res.json({ valid: true, username: decoded.username, team_name: decoded.team_name });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

export {
  login,
  verify
};
