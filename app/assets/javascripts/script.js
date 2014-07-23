var BoardObj;
var restore_state;
var player;

$(document).ready(function() {

  dispatcher = new WebSocketRails('chess-js.herokuapp.com/websocket');
  var game_slug = window.location.pathname.split('/')[2];

  dispatcher.on_open = function(data) {
    dispatcher.trigger('set_board', { slug: game_slug })
  }

  dispatcher.bind('update_board', function(data) {
    if (data.slug == game_slug) {
      if (data.board == 'null') {
        dispatcher.trigger('update_board', { board: BoardObj.export() })
      } else {
        b = data.board;
        restore_state(JSON.parse(JSON.parse(data.board)));
      }
    }

    if (data.player) {
      console.log(data.player)
      player = data.player == 1 ? 'white' : data.player == 2 ? 'black' : data.player
      $('.board').attr('class', 'board').addClass(player + '-move');
      console.log(player)
    }
  });

  dispatcher.bind('goto_new_game', function(data) {
    window.location.href = window.location.origin;
  })


  $('.overlay#log').overlay();
  $('.overlay#opts').overlay();
  
  var White;
  var Black;
  var Turn;
  var active_piece;
  var h = 'abcdefgh'.split('');
  var v = '12345678'.split('');
  v.reverse();

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
    
    restore_state(new Board())
  };

  restore_state = function(board) {
    BoardObj = new Board();
    BoardObj.restore(board);

    White = BoardObj.white;
    Black = BoardObj.black;
    Turn = BoardObj.turn;
    active_piece = undefined;

    $('.move').text(Turn + ' to move.');

    $('.board').attr('class', 'board').addClass(player + '-move');

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
      $('.move').append(' white in check!');

      if (BoardObj.is_checkmate('white')) {
        if (confirm('checkmate! black wins! play again?')) {
          reset();
        }
      }
    } else {
      White.in_check = false;
      $('.white-king').removeClass('in-check');
    }

    if (k[1]) {
      Black.in_check = true;
      $('.black-king').addClass('in-check');
      $('.move').append(' black in check!');

      if (BoardObj.is_checkmate('black')) {
        if (confirm('checkmate! white wins! play again?')) {
          reset();
        }
      }
    } else {
      Black.in_check = false;
      $('.black-king').removeClass('in-check');
    }

    $('.log').html('');
    if (BoardObj.log.length > 0) {
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
        $('.board .square#' + sps[0][i]).addClass('possible-move');
      }
      for (var i = 0; i < sps[1].length; i += 1) {
        $('.board .square#' + sps[1][i]).addClass('possible-capture');
      }
    }
  }

  reset();

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

    // if (this.id == 'rotateBoard') {
    //   if ($('input#rotateBoard').is(':checked') && $('style#rotateBoard').length == 0) {
    //     $('body').append('<style id="rotateBoard"></style>');
    //   } else if (!$('input#rotateBoard').is(':checked') && $('style#rotateBoard').length != 0) {
    //     $('style#rotateBoard').remove();
    //   }
    // }

    if (this.id == 'playWithFairies') {
      BoardObj.playing_with_fairies = $('input#playWithFairies').is(':checked');
    }
  })
});