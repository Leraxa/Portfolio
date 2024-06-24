const express = require('express');
const path = require('path');
const { promisify } = require('util');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    const open = await import('open');
    await open.default(`http://localhost:${PORT}`);
    console.log('Open browser');
  } catch (err) {
    console.error('Error while opening browser:', err);
  }
});
