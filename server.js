import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'public', 'data');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to get filepath
const getFilepath = (username) => path.join(DATA_DIR, `${username}.json`);

// GET worklogs for a user
app.get('/api/worklogs/:username', (req, res) => {
  const { username } = req.params;
  const filepath = getFilepath(username);

  if (!fs.existsSync(filepath)) {
    return res.json([]);
  }

  try {
    const data = fs.readFileSync(filepath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST worklogs for a user (Overwrite entirely, frontend manages append logic for simplicity, or we can handle append here if requested)
// The frontend currently sends the entire modified array to `StorageService.save`. So it will PUT/POST the whole array.
app.post('/api/worklogs/:username', (req, res) => {
  const { username } = req.params;
  const filepath = getFilepath(username);
  const data = req.body; // Expecting an array of entries

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Body must be an array of work entries' });
  }

  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
