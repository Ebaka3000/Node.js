const express = require('express');
const app = express();
const port = 3000;

let urlDatabase = {};

function generateShortUrl() {
  let shortUrl;
  do {
    shortUrl = Math.random().toString(36).substr(2, 6);
  } while (urlDatabase[shortUrl]);
  return shortUrl;
}

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

app.get('/api/create', (req, res) => {
  const originalUrl = req.query.url;

  if (!originalUrl || !isValidUrl(originalUrl)) {
    return res.status(400).send('Invalid URL');
  }

  const shortUrl = generateShortUrl();
  urlDatabase[shortUrl] = originalUrl;
  res.send(`Сокращенный URL: http://localhost:${port}/${shortUrl}`);
});

app.get('/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.status(404).send('URL not found');
  }

  res.redirect(originalUrl);
});

app.listen(port, () => {
  console.log(`Сервис сокращения URL запущен на http://localhost:${port}`);
});
