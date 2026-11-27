// LaunchLab server
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = 'flags.json';

app.use(express.json());           // lets the server read JSON data
app.use(express.static('public')); // shows web pages from the "public" folder

// Read all flags from the file
function readFlags() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save all flags to the file
function saveFlags(flags) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(flags, null, 2));
}

// Issue #1: Create a flag
app.post('/api/flags', (req, res) => {
  const name = (req.body.name || '').trim();

  // Error check: name must not be empty
  if (!name) {
    return res.status(400).json({ error: 'Flag name is required' });
  }

  const flags = readFlags();

  // Error check: no two flags with the same name
  if (flags.some(f => f.name === name)) {
    return res.status(409).json({ error: 'A flag with this name already exists' });
  }

  const newFlag = {
    id: Date.now(),
    name: name,
    description: req.body.description || '',
    enabled: false,   // new flags start OFF
    rollout: 100,     // percentage of users (used later in Issue #5)
    createdAt: new Date().toISOString()
  };

  flags.push(newFlag);
  saveFlags(flags);
  res.status(201).json(newFlag);
});

app.listen(PORT, () => {
  console.log(`LaunchLab running at http://localhost:${PORT}`);
});