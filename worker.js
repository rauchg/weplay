
var fs = require('fs');
var amp = require('amp');
var join = require('path').join;
var gameboy = require('gameboy');
var Canvas = require('canvas');
var debug = require('debug')('weplay:worker');

var file = process.env.WEPLAY_ROM;
if ('/' != file[0]) file = join(process.cwd(), file);
debug('rom %s', file);

var rom = fs.readFileSync(file);
var canvas = new Canvas(160, 144);
var gb = gameboy(canvas, rom, { drawEvents: true });
gb.stopEmulator = 1;
gb.start();

setInterval(function(){
  gb.run();
}, 8);

gb.on('draw', function(){
  canvas.toBuffer(function(err, buf){
    if (err) throw err;
    process.stdout.write(amp.encode([buf]));
  });
});

process.stdin.on('data', function(data){
  var key = Number(data.toString());
  if (key >= 0 && key < 8) {
    gb.JoyPadEvent(key, true);
    setTimeout(function(){
      gb.JoyPadEvent(key, false);
    }, 50);
  }
});
