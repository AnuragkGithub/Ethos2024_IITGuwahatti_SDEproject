const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// 👉 Consistent Key and IV (just for demo – NEVER hardcode in production)
const SECRET_KEY = crypto.createHash('sha256').update('my_secret_password').digest(); // 32 bytes
const IV = Buffer.from('a2xhcgAAAAAAAAAA'); // 16 bytes (example IV, base64-encoded string to buffer)

// Encrypt
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Routes
app.post('/encrypt', (req, res) => {
  const { message } = req.body;
  try {
    const encryptedMessage = encrypt(message);
    res.json({ encryptedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Encryption failed', details: error.message });
  }
});

app.post('/decrypt', (req, res) => {
  const { encryptedMessage } = req.body;
  try {
    const decryptedMessage = decrypt(encryptedMessage);
    res.json({ decryptedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Decryption failed', details: error.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
