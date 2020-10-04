const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);
  switch (req.method) {
    case 'POST':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        return res.end('Nested folders aren\'t supported');
      }
      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        return res.end('File exists already.');
      }
      const writeStream = fs.createWriteStream(filepath);
      const limitStream = new LimitSizeStream({limit: 2 ** 20});

      req.pipe(limitStream).pipe(writeStream);
      writeStream.on('close', function() {
        res.statusCode = 201;
        return res.end('Finished');
      });
      limitStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File is too big');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
        }
        fs.unlink(filepath, (e) => {});
      });

      res.on('close', () => {
        if (!res.writableEnded) {
          fs.unlink(filepath, (e) => {});
        }
      });

      writeStream.on('error', (err) => {
        res.statusCode = 500;
        res.end('Unexpected error');
        fs.unlink(filepath, (e) => {});
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
