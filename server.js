const express = require('express');
const path = require('path');

const { createCommitFeed } = require('./github');
const getCommits = createCommitFeed();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/github/commits', async (req, res) => {
  try {
    const feed = await getCommits();
    res.set('Cache-Control', feed.stale ? 'no-store' : 'public, max-age=60');
    res.json(feed);
  } catch {
    res.status(503).set('Cache-Control', 'no-store').json({ error: 'GitHub is temporarily unavailable.' });
  }
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.NO_OPEN === '1') return;
  try {
    const open = await import('open');
    await open.default(`http://localhost:${PORT}`);
    console.log('Open browser');
  } catch (err) {
    console.error('Error while opening browser:', err);
  }
});
