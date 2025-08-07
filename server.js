require('dotenv').config();
const ADMIN_KEY = process.env.ADMIN_KEY || "jamestechadmin";
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OTP_PATH = path.join(__dirname, 'data', 'otps.json');

// Utility to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// Admin login
app.post('/api/admin-login', (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Delete specific OTP
app.delete('/api/delete-otp/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let otps = [];
  if (fs.existsSync(OTP_PATH)) {
    otps = JSON.parse(fs.readFileSync(OTP_PATH));
  }
  otps.splice(index, 1);
  fs.writeFileSync(OTP_PATH, JSON.stringify(otps, null, 2));
  res.json({ success: true });
});

// Delete all OTPs
app.delete('/api/delete-all', (req, res) => {
  fs.writeFileSync(OTP_PATH, JSON.stringify([], null, 2));
  res.json({ success: true });
});
app.get('/api/inbox', (req, res) => {
  let otps = [];
  if (fs.existsSync(OTP_PATH)) {
    otps = JSON.parse(fs.readFileSync(OTP_PATH));
  }
  res.json(otps.slice(-10).reverse()); // last 10 OTPs
});
// Handle OTP requests
app.post('/api/request-otp', (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ message: "Number is required." });

  const otp = generateOTP();
  const timestamp = new Date().toISOString();

  let otps = [];
  if (fs.existsSync(OTP_PATH)) {
    otps = JSON.parse(fs.readFileSync(OTP_PATH));
  }

  otps.push({ number, otp, timestamp });

  fs.writeFileSync(OTP_PATH, JSON.stringify(otps, null, 2));
  res.json({ message: `OTP sent to ${number}.` });
});

app.listen(PORT, () => {
  console.log(`🌐 Jamestech running on port ${PORT}`);
});