$(document).ready(function() {
  dispatcher = new WebSocketRails(window.location.host.split(':')[0] + ':3000/websocket');

  dispatcher.on_open = function(data) {
    dispatcher.trigger('open_lobby')
  }

  dispatcher.bind('get_boards', function(data) {
    var boards = JSON.parse(data.boards)

    $('.live').html('')

    for (var i = 0; i < boards.length; i += 1) {
      var b = boards[i];
      $('.live').append('<a href="/' + b.slug + '"><li class="one-third column ' + (b.has_white_player ? 'white' : 'black') + '"><span class="' + (b.has_white_player ? 'black' : 'white') + '-knight icon"></span><span class="slug">' + b.slug + '</span><span class="tag">play as ' + (b.has_white_player ? 'black' : 'white') + '</span></li></a>')
    }


    $('title').text('chs.xyz ' + (boards.length > 0 ? '(' + boards.length + ')' : ''));
  })
});