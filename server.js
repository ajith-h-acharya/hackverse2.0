import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Simulate authentication
  if (password === 'password123') {
    return res.json({ message: "Login successful" });
  } else {
    // In a real app, check DB. Here we just accept any non-empty password for mock purposes.
    if (password) {
        return res.json({ message: "Login successful" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post('/api/register', (req, res) => {
  const { email, phone, fullName, squadSize, expeditionDays, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Mobile number must be 10 digits" });
  }

  // Simulate successful registration
  return res.json({ message: "Registration successful" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
