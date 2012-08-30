var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var fs = require('fs');
var restify = require('restify');
var dino = require('./dino.js');

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  var server = restify.createServer({
    name: 'api',
    version: '1.0.0'
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.get('/models/:model/:resolution/verticalsectionpicture', dino.getverticalsectionpicture);
  server.get('/models/list', dino.listmodels);
  server.get('/models/:name/:resolution/describe', dino.modeldescribe);
  server.get('/cache/:filename', function (req, res, next){
      fs.readFile('./cache/' + req.params.filename , function(error, content) {
          if (error) {
              res.writeHead(500);
              res.end();
          }
          else {
              res.writeHead(200, { 'Content-Type': 'image/jpeg' });
              res.end(content);
          }
      });
  });

  server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
  });
}
