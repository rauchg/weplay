
var sio = require('socket.io');
var browserify = require('browserify-middleware');
var forwarded = require('forwarded-for');
var debug = require('debug');

var port = process.env.WEPLAY_PORT || 3001;
var io = module.exports = sio(port);
console.log('listening on *:' + port);

var redis = require('./redis')();
var pubsub = require('./redis')();

process.title = 'weplay-io';

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
  var req = socket.request;
  var ip = forwarded(req, req.headers);
  debug('client ip %s', ip);

  redis.lrange('weplay:log', 0, 20, function(err, log){
    if (!Array.isArray(log)) return;
    log.reverse().forEach(function(data){
      data = data.toString();
      socket.emit.apply(socket, JSON.parse(data));
    });
  });

  socket.on('move', function(key){
    if (null == keys[key]) return;
    redis.get('weplay:last:move:' + ip, function(err, last){
      if (last) {
        last = last.toString();
        if (Date.now() - last < 500) {
          return;
        }
      }
      redis.set('weplay:last:move:' + ip, Date.now());
      redis.publish('weplay:move', keys[key]);
      socket.emit('move', key, socket.nick);
      broadcast(socket, 'move', key, socket.nick);
    });
  });

  socket.on('message', function(msg){
    broadcast(socket, 'message', msg, socket.nick);
  });

  socket.on('join', function(nick){
    if (socket.nick) return;
    socket.nick = nick;
    socket.emit('joined');
    broadcast(socket, 'join', nick);
  });
});

// listen to messages from other processes
// or even redis-cli (for reloads)

pubsub.subscribe('weplay:frame');
pubsub.subscribe('weplay:reload-clients');

pubsub.on('message', function(channel, frame){
  switch (channel) {
    case 'weplay:frame':
      io.emit('frame', frame);
      return;

    case 'weplay:reload-clients':
      io.emit('reload');
  }
});

// broadcast events and persist them to redis

function broadcast(socket/*, …*/){
  var args = Array.prototype.slice.call(arguments, 1);
  redis.lpush('weplay:log', JSON.stringify(args));
  redis.ltrim('weplay:log', 0, 20);
  socket.broadcast.emit.apply(socket, args);
}
