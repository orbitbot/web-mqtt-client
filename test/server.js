var http     = require('http');
var httpServ = http.createServer();
var mosca    = require('mosca');
var server   = new mosca.Server({});
var db       = new mosca.persistence.Memory();

db.wire(server);
server.attachHttpServer(httpServ);
httpServ.listen(8080);

server.on('ready', function() {
  // console.log('ready');
});

server.on('published', function(packet, client) {
  // console.log('\ngot packet', packet.topic, '\n', packet);
});
