const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        return res.end('Nested folders aren\'t supported');
      }
      if (!fs.existsSync(filepath)) {
        res.statusCode = 404;
        return res.end('File doesn\'t exist.');
      }

      req.on('error', (err) => {
        res.statusCode = 500;
        res.end('Unexpected error');
      });

      fs.unlink(filepath, (e) => {});
      res.statusCode = 200;
      res.end('Deleted');
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
