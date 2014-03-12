
var sio = require('socket.io');
var browserify = require('browserify-middleware');
var forwarded = require('forwarded-for');
var debug = require('debug');

process.title = 'weplay-io';

var port = process.env.WEPLAY_PORT || 3001;
var io = module.exports = sio(port);
console.log('listening on *:' + port);

var throttle = process.env.WEPLAY_IP_THROTTLE || 100;

// redis socket.io adapter
var uri = process.env.WEPLAY_REDIS || 'localhost:6379';
io.adapter(require('socket.io-redis')(uri));

// redis queries instance
var redis = require('./redis')();

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

var uid = process.env.WEPLAY_SERVER_UID || port;
debug('server uid %s', uid);

io.total = 0;
io.on('connection', function(socket){
  var req = socket.request;
  var ip = forwarded(req, req.headers);
  debug('client ip %s', ip);

  // keep track of connected clients
  updateCount(++io.total);
  socket.on('disconnect', function(){
    updateCount(--io.total);
  });

  // send events log so far
  redis.lrange('weplay:log', 0, 20, function(err, log){
    if (!Array.isArray(log)) return;
    log.reverse().forEach(function(data){
      data = data.toString();
      socket.emit.apply(socket, JSON.parse(data));
    });
  });

  // broadcast moves, throttling them first
  socket.on('move', function(key){
    if (null == keys[key]) return;
    redis.get('weplay:move-last:' + ip, function(err, last){
      if (last) {
        last = last.toString();
        if (Date.now() - last < throttle) {
          return;
        }
      }
      redis.set('weplay:move-last:' + ip, Date.now());
      redis.publish('weplay:move', keys[key]);
      socket.emit('move', key, socket.nick);
      broadcast(socket, 'move', key, socket.nick);
    });
  });

  // send chat mesages
  socket.on('message', function(msg){
    broadcast(socket, 'message', msg, socket.nick);
  });

  // broadcast user joining
  socket.on('join', function(nick){
    if (socket.nick) return;
    socket.nick = nick;
    socket.emit('joined');
    broadcast(socket, 'join', nick);
  });
});

// sends connections count to everyone
// by aggregating all servers
function updateCount(total){
  redis.hset('weplay:connections', uid, total);
}

// broadcast events and persist them to redis

function broadcast(socket/*, …*/){
  var args = Array.prototype.slice.call(arguments, 1);
  redis.lpush('weplay:log', JSON.stringify(args));
  redis.ltrim('weplay:log', 0, 20);
  socket.broadcast.emit.apply(socket, args);
}
