
var spawn = require('child_process').spawn;
var join = require('path').join;
var node = process.argv[0];
var amp = require('amp');
var Emitter = require('events').EventEmitter;

module.exports = Emulator;

function Emulator(){
  if (!(this instanceof Emulator)) return new Emulator;
  this.load();
}

Emulator.prototype.__proto__ = Emitter.prototype;

Emulator.prototype.move = function(key){
  this.cmd.stdin.write('' + key);
};

Emulator.prototype.load = function(){
  var args = [join(__dirname, 'worker.js')];
  var cmd = spawn(node, args);
  var parser = new amp.Stream();
  var self = this;
  parser.on('data', function(buf){
    self.emit('frame', amp.decode(buf)[0]);
  });
  cmd.stdout.on('data', function(data){
    parser.write(data);
  });
  cmd.stderr.on('data', function(data){
    console.log('got error', data.toString());
  });
  cmd.on('exit', function(){
    self.emit('error', new Error('Process exit'));
  });
  this.cmd = cmd;
};
