
var http = require('http').Server;
var sio = require('socket.io');
var browserify = require('browserify-middleware');
var express = require('express');
var redis = require('./redis');
var request = require('superagent');
var app = express();
var Emitter = require('events').EventEmitter;

var srv = http(app);
var io = module.exports = sio(srv);
io.controls = new Emitter;
var port = process.env.WEPLAY_PORT || 3000;

srv.listen(port);
console.log('listening on *:' + port);

app.use(express.static(__dirname + '/public'));

if (process.env.NODE_ENV == 'development') {
  app.use('/main.js', browserify('./client/app.js'));
}

app.use(function(req, res, next){
  req.socket.on('error', function(err){
    console.error(err.stack);
  });
  next();
});

var keys = {
  right: 0,
  left: 1,
  up: 2,
  down: 3,
  a: 4,
  b: 5,
  select: 6,
  start: 7
};

io.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;

  redis.lrange('weplay:log', 0, 20, function(err, log){
    if (!Array.isArray(log)) return;
    log.reverse().forEach(function(data){
      socket.emit.apply(socket, JSON.parse(data));
    });
  });

  socket.on('move', function(key){
    if (null == keys[key]) return;
    redis.get('last:move:' + ip, function(err, last){
      if (last) {
        if (Date.now() - last < 500) {
          return;
        }
      }
      redis.set('last:move:' + ip, Date.now());
      io.controls.emit('move', keys[key]);
      socket.emit('move', key, socket.nick);
      broadcast(socket, 'move', key, socket.nick);
    });
  });

  socket.on('message', function(msg){
    broadcast(socket, 'message', msg, socket.nick);
  });

  socket.on('join', function(nick){
    request
    .get('http://freegeoip.net/json/' + ip)
    .timeout(500)
    .once('error', function(){
      join(nick);
    })
    .end(function(res){
      var location = null;

      if (res && res.ok && res.body.city) {
        location = res.body.city
          + ', ' + res.body.country_name;
      }

      join(nick, location);
    });

    function join(nick, location){
      if (socket.nick) return;
      socket.nick = nick;
      socket.emit('joined');
      broadcast(socket, 'join', nick, location);
    }
  });
});

// broadcast events and persist them to redis

function broadcast(socket/*, …*/){
  var args = Array.prototype.slice.call(arguments, 1);
  redis.lpush('weplay:log', JSON.stringify(args));
  redis.ltrim('weplay:log', 0, 20);
  socket.broadcast.emit.apply(socket, args);
}
