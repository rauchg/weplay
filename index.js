
var fs = require('fs');
var join = require('path').join;
var emulator = require('./emulator');

if (!process.env.WEPLAY_ROM) {
  console.log('You must specify the ENV variable `WEPLAY_ROM` '
    + 'pointint to location of rom file to broadcast.');
  process.exit(1);
}

var io = require('./io');

function load(){
  var emu = emulator();
  emu.on('error', function(){
    console.log('restarting emulator');
    load();
  });

  io.controls.on('move', function(move){
    emu.move(move);
  });

  emu.on('frame', function(frame){
    io.sockets.sockets.forEach(function(socket){
      socket.emit('frame', frame);
    });
  });
}

load();
