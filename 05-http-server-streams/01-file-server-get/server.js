const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const readStream = fs.createReadStream(filepath);
      if (pathname.includes('/')) {
        res.writeHead(400, 'Cant work with nested paths.');
        res.end();
      }
      readStream.on('error', function(error) {
        res.writeHead(404, 'File Not Found');
        res.end();
      });

      readStream.pipe(res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
