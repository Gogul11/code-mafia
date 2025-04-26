import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import client from '../config/redisdb.js';

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
        team_name: team.name,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '6h' }
    );

    await client.set(`token:${username}`, token, 'EX', 6 * 60 * 60); 

    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verify = async (req, res) => {
  try {
    const decoded = req.user;
    res.json({ valid: true, username: decoded.username, team_name: decoded.team_name, role: decoded.role });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

const logout = async (req, res) => {
  const username = req.user.username;
  
  await redisClient.del(`token:${username}`);

  res.json({ message: 'Logged out successfully' });
}


const signup = async (req, res) => {
  const { username, password, confirmPassword, team_name } = req.body;

  if (!username || !password || !confirmPassword || !team_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ message: 'Error fetching user' });
    }

    // Check if team exists
    let { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('name', team_name)
      .single();

    let teamId;

    if (teamError && teamError.code !== 'PGRST116') {
      console.error('Error fetching team:', teamError);
      return res.status(500).json({ message: 'Error checking team' });
    }

    if (team) {
      teamId = team.id;
    } else {
      // Create team if not exists
      const { data: newTeam, error: createTeamError } = await supabase
        .from('teams')
        .insert([{ name: team_name }])
        .select()
        .single();

      if (createTeamError) {
        console.error('Error creating team:', createTeamError);
        return res.status(500).json({ message: 'Team creation failed', error: createTeamError });
      }

      teamId = newTeam.id;
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    // Insert new user
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: hashedPassword,
          team_id: teamId,
          role: 'user'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insertion error:', insertError);
      return res.status(500).json({ message: 'Signup failed', error: insertError });
    }

    if (!insertedUser) {
      console.error('User insertion failed: No user returned');
      return res.status(500).json({ message: 'Signup failed: User not inserted' });
    }

    console.log('User created:', { username: insertedUser.username, team_id: insertedUser.team_id, role: insertedUser.role });
    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error', err });
  }
};

export { login, verify, logout, signup };