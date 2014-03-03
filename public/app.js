/*global $,io,Blob,URL*/

var socket = io();
socket.on('connect', function(){
  document.body.className = 'ready';
});

function resize(){
  if ($(window).width() <= 500) {
    $('#chat, #game').css('height', $(window).height() / 2);
    $('.input input').css('width', $(window).width());
    $('.messages').css('height', $(window).height() / 2 - 70);
  } else {
    $('#chat, #game').css('height', $(window).height());
    $('.input input').css('width', $('.input').width());
    $('.messages').css('height', $('#chat').height() - 70);
  }
  scrollMessages();
}
$(window).resize(resize);
resize();

var joined = false;
var input = $('.input input');
var nick;
$('.input form').submit(function(ev){
  ev.preventDefault();
  var data = input.val();
  if ('' === data) return;
  input.val('');
  if (joined) {
    message(data, nick);
    socket.emit('message', data);
  } else {
    nick = data;
    socket.emit('join', data);
    $('body').addClass('joined');
    $('.input').addClass('joined');
    input
    .attr('placeholder', 'type in to chat')
    .blur();
    joined = true;
  }
});

input.focus(function(){
  $('body').addClass('input_focus');
});

input.blur(function(){
  $('body').removeClass('input_focus');
});

socket.on('joined', function(){
  $('.messages').append(
    $('<p>').text('You have joined. Keys are as follows: ')
    .append(
    $('<table class="keys">').append(
      $('<tr><td>left</td><td>←</td>'),
      $('<tr><td>right</td><td>→</td>'),
      $('<tr><td>up</td><td>↑</td>'),
      $('<tr><td>down</td><td>↓</td>'),
      $('<tr><td>select</td><td>o</td>'),
      $('<tr><td>A</td><td>a</td>'),
      $('<tr><td>B</td><td>s</td>'),
      $('<tr><td>start</td><td>enter</td>')
    ))
    .append('<br>Make sure the chat input is not focused.<br> '
      + 'Input is throttled server side to prevent abuse. Catch \'em all!')
  );
  scrollMessages();
});

var map = {
  37: 'left',
  39: 'right',
  65: 'a',
  83: 'b',
  66: 'b',
  38: 'up',
  40: 'down',
  79: 'select',
  13: 'start'
};

var reverseMap = {};
for (var i in map) reverseMap[map[i]] = i;

$(document).on('keydown', function(ev){
  if (null == nick) return;
  var code = ev.keyCode;
  if ($('body').hasClass('input_focus')) return;
  if (map[code]) {
    ev.preventDefault();
    socket.emit('move', map[code]);
  }
});

// Listener to fire up keyboard events on mobile devices for control overlay
$('table.screen-keys td').click(function() {
  var id = $(this).attr('id');
  var code = reverseMap[id];
  var e = $.Event('keydown');
  e.keyCode = code;
  $(document).trigger(e);

  $(this).addClass('pressed');
  var self = this;
  setTimeout(function() {
    $(self).removeClass('pressed');
  }, 1000);
});

socket.on('join', function(nick, loc){
  message(nick + (loc ? ('(' + loc + ')') : '') + ' joined.');
});

socket.on('move', function(move, by){
  var p = $('<p class="move">');
  $('.messages').append(p.text(by + ' pressed ' + move));
  scrollMessages();
});

socket.on('message', function(msg, by){
  message(msg, by);
});

function message(msg, by){
  var p = $('<p>').text(msg);
  if (by) {
    p.prepend($('<em>').text(by + ': '));
  } else {
    p.addClass('server');
  }
  $('.messages').append(p);
  scrollMessages();
}

function scrollMessages(){
  $('.messages')[0].scrollTop = 10000000;
}

var image = $('<img>').appendTo('#game')[0];
var last;
socket.on('frame', function(data){
  var blob = new Blob([data], { type: 'image/png' });
  var url = URL.createObjectURL(blob);
  image.src = url;
  if (last) URL.revokeObjectURL(URL.revokeObjectURL);
  last = url;
});

// Highlights controls when image or button pressed
function highlightControls() {
  $('table.screen-keys td:not(.empty-cell)').addClass('highlight');

  setTimeout(function() {
    $('table.screen-keys td').removeClass('highlight');
  }, 1000);

}

$('img').click(highlightControls);
$('table.screen-keys td').click(highlightControls);

