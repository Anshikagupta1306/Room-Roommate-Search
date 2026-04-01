import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());

// File path
const USER_FILE = './data/user.json';

// Helper: Read users
const getUsers = () => {
  const data = fs.readFileSync(USER_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper: Save users
const saveUsers = (users) => {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
};

app.get('/', (req, res) => {
  res.send('Server running');
});


// ✅ REGISTER
app.post('/register', (req, res) => {
  try {
    const { name, email, password, user_type } = req.body;

    const users = getUsers();

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      user_type: user_type || 'seeker',
      created_at: new Date().toISOString(),
      status: 'active'
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: "User created" });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


// ✅ LOGIN
app.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const users = getUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: "dummy-token",
      user_type: user.user_type
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});