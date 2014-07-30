$(document).ready(function() {
  dispatcher = new WebSocketRails('localhost:3000/websocket');
  var game_slug = window.location.pathname.split('/')[1];

  dispatcher.on_open = function(data) {
    dispatcher.trigger('set_board', { slug: game_slug })
  }

  dispatcher.bind('update_board', function(data) {
    if (data.player) {
      player = data.player;
      $('.board').attr('class', 'board').addClass(player + '-move');
    }

    if (data.slug == game_slug) {
      if (data.board == 'null') {
        dispatcher.trigger('update_board', { board: BoardObj.export() })
      } else {
        restore_state(JSON.parse(JSON.parse(data.board)));
      }
    }

    if (data.has_partner !== undefined) {
      if (!data.has_partner) {
        $('.connection').html('Waiting for opponent connection...&nbsp;<a class="clickable" id="switchPlayer">Switch Player?</a>');
      } else if (data.has_partner) {
        $('.connection').html('Connected!');
      }
    }
  });

  dispatcher.bind('goto_new_game', function(data) {
    window.location.href = window.location.origin;
  })

  dispatcher.bind('toggle_fairies', function(data) {
    if (data.slug == game_slug) {
      $('#playWithFairies').prop('checked', data.fairies);
      BoardObj.playing_with_fairies = data.fairies;
    }
  })

  dispatcher.bind('player_connected', function(data) {
    if (data.slug == game_slug) {
      if (data.player !== player) {
        $('.connection').html('Connected!');
      }
    }
  })

  dispatcher.bind('player_disconnected', function(data) {
    if (data.slug == game_slug) {
      $('.connection').html('Disconnected! Waiting for opponent connection...&nbsp;<a class="clickable" id="switchPlayer">Switch Player?</a>');
    }
  })

  dispatcher.bind('new_chat_message', function(data) {
    if (data.slug == game_slug) {
      update_chat(JSON.parse(data.log));
    }
  })

  dispatcher.bind('switch_player', function(data) {
    player = data.player;
    restore_state(JSON.parse(JSON.parse(data.board)));
  })

  $('.overlay#log').overlay();
  $('.overlay#opts').overlay();
  
  var White;
  var Black;
  var active_piece;
  var BoardObj;
  var restore_state;
  var player;
  var Turn;
  var h = 'abcdefgh'.split('');
  var v = '12345678'.split('');
  v.reverse();

  var move_callback = function(obj) {
    dispatcher.trigger('update_board', { board: BoardObj.export() })
    dispatcher.trigger('new_chat_message', { player: 'server', text: obj[1].piece.army + ' made a move: ' + obj[0] });
  }

  var reset = function() {
    if ($('.board .square').length !== 64) {
      $('.chess').html('<div class="board"></div>')

      for (var i = 0; i < v.length; i += 1) {
        var ver = v[i];
        $('.board').append('<div class="row" id="' + ver + '"></div>');
        for (var j = 0; j < h.length; j += 1) {
          var hor = h[j];
          $('.board .row#' + ver).append('<div class="square" id="' + (hor + ver) + '"></div>');
        }
      }
    }
    
    restore_state(new Board(move_callback))
  };

  restore_state = function(board) {
    BoardObj = new Board(move_callback);
    BoardObj.restore(board);

    White = BoardObj.white;
    Black = BoardObj.black;
    Turn = BoardObj.turn;
    active_piece = undefined;

    $('.move').text(Turn + ' to move.');

    if (Turn == player) {
      $('title').text('Your Turn!');
    } else {
      $('title').text(Turn[0].toUpperCase() + Turn.substr(1, Turn.length - 1) + '\'s Turn');
    }

    $('.board').attr('class', 'board').addClass(player + '-move');

    $('#playWithFairies').prop('checked', BoardObj.playing_with_fairies);

    $('.board .square').attr('class', 'square')

    $('.board .square').each(function() {
      sq = BoardObj.space_at(this.id);
      pce = sq.is_occupied;

      if (pce) {
        $(this).addClass(pce.army + '-' + pce.type).addClass('piece');
        if (pce.army == Turn && pce.can_move() && Turn == player) {
          $(this).addClass('can-move');
        }
      }

      sq.is_guarded = [];
    });

    BoardObj.update_guards();

    $('.white-guarding').removeClass('white-guarding');
    $('.black-guarding').removeClass('black-guarding');

    $('.board .square').each(function() {
      sq = BoardObj.space_at(this.id);

      if (sq.guarded_by('white')) {
        $(this).addClass('white-guarding');
      }

      if (sq.guarded_by('black')) {
        $(this).addClass('black-guarding');
      }
    });

    var k = BoardObj.kings_in_check();

    if (k[0]) {
      White.in_check = true;
      $('.white-king').addClass('in-check');

      if (BoardObj.is_checkmate('white')) {
        $('.move').html('checkmate! black wins! <a id="playAgain">play again?</a>');
      } else {
        $('.move').append(' white in check!');
      }
    } else {
      White.in_check = false;
      $('.white-king').removeClass('in-check');
    }

    if (k[1]) {
      Black.in_check = true;
      $('.black-king').addClass('in-check');

      if (BoardObj.is_checkmate('black')) {
        $('.move').html('checkmate! white wins! <a id="playAgain">play again?</a>');
      } else {
        $('.move').append(' black in check!');
      }
    } else {
      Black.in_check = false;
      $('.black-king').removeClass('in-check');
    }

    $('.log').html('');
    if (BoardObj.log.length > 0) {
      $('.board .square#' + BoardObj.log[BoardObj.log.length-1][1]['to']).addClass('last-moved')
      for (var i = 0; i < BoardObj.log.length; i += 2) {
        $('.log').append('<li>' + BoardObj.log[i][0] + (BoardObj.log[i+1] ? ' ' + BoardObj.log[i+1][0] : '') + '</li>');
      }
    } else {
      $('.log').append('no moves.');
    }

    show_possibilities();
  }

  var show_possibilities = function() {
    $('.possible-move').removeClass('possible-move');
    $('.possible-capture').removeClass('possible-capture');

    if (active_piece) {
      var sps = active_piece.possible_moves();

      for (var i = 0; i < sps[0].length; i += 1) {
        if (active_piece.can_move_to(sps[0][i])) {
          $('.board .square#' + sps[0][i]).addClass('possible-move');

        }
      }
      for (var i = 0; i < sps[1].length; i += 1) {
        if (active_piece.can_move_to(sps[1][i])) {
          $('.board .square#' + sps[1][i]).addClass('possible-capture');
        }
      }
    }
  }

  reset();

  var update_chat = function(chatObj) {
    $('.chat .chat-msg, .chat h2').remove();
    for (var i = 0; i < chatObj.included_msgs.length; i += 1) {
      var msg = chatObj.included_msgs[i];
      var date = new Date(msg.created_at);
      date = (date.getMonth() + 1).toString() + '/' + (date.getDate()).toString() + '/' + (date.getFullYear()).toString() + ' ' + (date.getHours()).toString() + ':' + (date.getMinutes()).toString() + ':' + (date.getSeconds()).toString();
      $('.chat-log ul').prepend('<li class="chat-msg ' + msg.player + '"><span class="time-stamp">[' + date + ']</span><span class="player">' + msg.player + '</span>&nbsp;: ' + msg.text + '</li>');
    }
    $('.chat-log ul').prepend('<h2>Chat</h2>')
    $('.chat a:not(.send)').each(function() {$(this).attr('target', '_blank')})
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
    $('#chatMsg').focus();
  }

  $(document).on('submit', '.chat form', function(e) {
    e.preventDefault();

    if ($('#chatMsg').val().length > 0) {
      dispatcher.trigger('new_chat_message', { player: player, text: $('#chatMsg').val() });
    }

    $('#chatMsg').val('');
  });

  $(document).on('click', '.chat a.send', function() {
    $('.chat form').submit();
  })

  $(document).on('click', '#switchPlayer', function() {
    dispatcher.trigger('switch_player');
  });

  $(document).on('click', '#playAgain', function() {
    dispatcher.trigger('record_log', { log: JSON.stringify(BoardObj.log) });
    reset();
    dispatcher.trigger('update_board', { board: BoardObj.export() });
    dispatcher.trigger('new_chat_message', { player: 'server', text: player + ' has started a new game.' });
  })

  $(document).on('click', '.board .square.can-move:not(.possible-capture)', function() {
    active_piece = BoardObj.space_at(this.id).is_occupied;
    show_possibilities();
  });

  $(document).on('click', '.board .square.possible-capture', function() {
    var move_is_en_passant = active_piece.move_is_en_passant(this.id);
    var captured_piece = BoardObj.space_at(this.id).is_occupied;

    if (move_is_en_passant) {
      var captured_piece = move_is_en_passant
      var is_en_passant = true;
    }

    var sq = active_piece.space;

    if (active_piece.takes(this.id, captured_piece, is_en_passant)) {
      active_piece = undefined;
      show_possibilities();
      restore_state(BoardObj);
    } 
  });

  $(document).on('click', '.board .square.possible-move', function() {
    var sq = active_piece.space;
    var csl = [active_piece.can_castle('kingside'), active_piece.can_castle('queenside')];
    if (active_piece.move_to(this.id, false, false)) {
      active_piece = undefined;
      show_possibilities();
      restore_state(BoardObj);
    }
  });

  $(document).on('click', '#hideChat', function() {
    $('#hideChat').hide();
    $('.chat').hide();
    $('#showChat').show();
  })

  $(document).on('click', '#showChat', function() {
    $('#showChat').hide();
    $('.chat').show();
    $('#hideChat').show();
  })

  $(document).on('mouseenter', '.board .square', function() {
    var sq = BoardObj.space_at(this.id);
    var sqs = sq.is_guarded;

    for (var i = 0; i < sqs.length; i += 1) {
      var j = sqs[i];

      $('.board .square#' + j.space).addClass('guarding');
    }
  });

  $(document).on('mouseleave', '.board .square', function() {
    $('.guarding').removeClass('guarding');
  })

  $(document).on('click', '.overlay#opts p input', function() {
    if (this.id == 'blackGuard') {
      if ($('input#blackGuard').is(':checked') && $('style#blackGuard').length == 0) {
        $('body').append('<style id="blackGuard">.black-guarding {background-color: orange !important;}</style>');
      } else if (!$('input#blackGuard').is(':checked') && $('style#blackGuard').length != 0) {
        $('style#blackGuard').remove();
      }
    }

    if (this.id == 'whiteGuard') {
      if ($('input#whiteGuard').is(':checked') && $('style#whiteGuard').length == 0) {
        $('body').append('<style id="whiteGuard">.white-guarding {background-color: purple !important;}</style>');
      } else if (!$('input#whiteGuard').is(':checked') && $('style#whiteGuard').length != 0) {
        $('style#whiteGuard').remove();
      }
    }

    if (this.id == 'hoverGuard') {
      if ($('input#hoverGuard').is(':checked') && $('style#hoverGuard').length == 0) {
        $('body').append('<style id="hoverGuard">.guarding {background-color: green !important;}</style>');
      } else if (!$('input#hoverGuard').is(':checked') && $('style#hoverGuard').length != 0) {
        $('style#hoverGuard').remove();
      }
    }

    if (this.id == 'canMove') {
      if ($('input#canMove').is(':checked') && $('style#canMove').length == 0) {
        $('body').append('<style id="canMove">.can-move {background-color: blue !important;}</style>');
      } else if (!$('input#canMove').is(':checked') && $('style#canMove').length != 0) {
        $('style#canMove').remove();
      }
    }

    if (this.id == 'playWithFairies') {
      BoardObj.playing_with_fairies = $('input#playWithFairies').is(':checked');
      dispatcher.trigger('toggle_fairies', { player: player, fairies: $('input#playWithFairies').is(':checked') });
    }
  })
});
