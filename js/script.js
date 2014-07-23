$(document).ready(function() {
  $('.overlay#log').overlay();
  $('.overlay#opts').overlay();
  var BoardObj;
  var White;
  var Black;
  var Turn;
  var active_piece;
  var h = 'abcdefgh'.split('');
  var v = '12345678'.split('');
  v.reverse();

  var reset = function(board) {
    $('.chess').html('<div class="board"></div>')

    $('.move').text('');

    for (var i = 0; i < v.length; i += 1) {
      var ver = v[i];
      $('.board').append('<div class="row" id="' + ver + '"></div>');
      for (var j = 0; j < h.length; j += 1) {
        var hor = h[j];
        $('.board .row#' + ver).append('<div class="square" id="' + (hor + ver) + '"></div>');
      }
    }

    BoardObj = board ? board : new Board();
    White = BoardObj.white;
    Black = BoardObj.black;
    Turn = BoardObj.turn;
    $('.board').addClass(Turn + '-move');

    for (var i = 0; i < BoardObj.spaces.length; i += 1) {
      j = BoardObj.spaces[i];

      if (j.is_occupied) {
        $('.board .square#' + (j.hor + j.ver)).addClass(j.is_occupied.army + '-' + j.is_occupied.type).addClass('piece');
      }
    }

    c(true);
  };

  var check_check = function() {
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
  }

  var c = function(init) {
    if (!init) {
      $('.board').removeClass(Turn + '-move');
      BoardObj.turn = BoardObj.turn == 'white' ? 'black' : 'white';
      Turn = BoardObj.turn;
      $('.board').addClass(Turn + '-move');
    }

    $('.move').text(Turn + ' to move.');

    $('.board .square').each(function() { sq = BoardObj.space_at(this.id); sq.is_guarded = []; if (!sq.is_occupied) { $(this).attr('class', 'square'); } })

    $('.board .piece').each(function() {
      pce = BoardObj.space_at(this.id).is_occupied;
      if (pce) {
        sps = pce.possible_moves();

        if (pce.army == Turn && sps[2].length > 0 && !$(this).hasClass('can-move')) {
          $(this).addClass('can-move')
        } else if (pce.army !== Turn || (!(sps[2].length > 0) && $(this).hasClass('can-move'))) {
          $(this).removeClass('can-move');
        }

        if (sps[2].length > 0 && !$(this).hasClass('can-move') && pce.army == Turn) {
          $(this).addClass('can-move');
        } else if (!(sps[2].length > 0) && $(this).hasClass('can-move') && pce.army !== Turn) {
          $(this).removeClass('can-move');
        }
      }
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

    check_check();

    $('.log').html('');
    if (BoardObj.log.length > 0) {
      for (var i = 0; i < BoardObj.log.length; i += 2) {
        $('.log').append('<li>' + BoardObj.log[i][0] + (BoardObj.log[i+1] ? ' ' + BoardObj.log[i+1][0] : '') + '</li>');
      }
    } else {
      $('.log').append('no moves.');
    }
  };

  reset();

  $(document).on('click', '.board .square.can-move:not(.possible-capture)', function() {
    $('.possible-move').removeClass('possible-move');
    $('.possible-capture').removeClass('possible-capture');

    active_piece = BoardObj.space_at(this.id).is_occupied;
    sps = active_piece.possible_moves();
    for (var i = 0; i < sps[0].length; i += 1) {
      $('.board .square#' + sps[0][i]).addClass('possible-move');
    }
    for (var i = 0; i < sps[1].length; i += 1) {
      $('.board .square#' + sps[1][i]).addClass('possible-capture');
    }
  });

  $(document).on('click', '.board .square.possible-capture', function() {
    if (active_piece.type == 'pawn' && !BoardObj.space_at(this.id).is_occupied && ((BoardObj.space_at(this.id.split('')[0] + BoardObj.prev(this.id.split('')[1])).is_occupied && BoardObj.space_at(this.id.split('')[0] + BoardObj.prev(this.id.split('')[1])).is_occupied.type == 'pawn') || (BoardObj.space_at(this.id.split('')[0] + BoardObj.next(this.id.split('')[1])).is_occupied && BoardObj.space_at(this.id.split('')[0] + BoardObj.next(this.id.split('')[1])).is_occupied.type == 'pawn'))) {
      captured_piece = BoardObj.space_at(this.id.split('')[0] + (active_piece.army == 'white' ? BoardObj.prev(this.id.split('')[1]) : BoardObj.next(this.id.split('')[1])));
      is_en_passant = true;
    } else {
      captured_piece = BoardObj.space_at(this.id).is_occupied;
      is_en_passant = false;
    }

    sq = active_piece.space;

    if (active_piece.takes(this.id, captured_piece, is_en_passant)) {
      $('.board .square#' + sq).attr('class', 'square');
      sq = active_piece.space;
      $('.board .square#' + sq).attr('class', 'square');
      $('.board .square#' + sq).addClass(active_piece.army + '-' + active_piece.type).addClass('piece');

      $('.possible-move').removeClass('possible-move');
      $('.possible-capture').removeClass('possible-capture');
      c();
    } 
  });

  $(document).on('click', '.board .square.possible-move', function() {
    sq = active_piece.space;
    var csl = [active_piece.can_castle('kingside'), active_piece.can_castle('queenside')];
    if (active_piece.move_to(this.id, false, false)) {
      $('.board .square#' + sq).attr('class', 'square');
      $('.board .square#' + active_piece.space).addClass(active_piece.army + '-' + active_piece.type).addClass('piece');

      if (active_piece.type == 'king') {
        if (active_piece.space.split('')[0] == 'g' && csl[0]) {

          $('.board .square#' + BoardObj.next(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).attr('class', 'square');
          pce = BoardObj.space_at(BoardObj.prev(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).is_occupied;
          $('.board .square#' + BoardObj.prev(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).addClass('piece').addClass(pce.army + '-' + pce.type);
          if (pce.can_move()) {
            $('.board .square#' + BoardObj.prev(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).addClass('can-move');
          }

        } else if (active_piece.space.split('')[0] == 'c' && csl[1]) {

          $('.board .square#' + BoardObj.prev(BoardObj.prev(active_piece.space.split('')[0])) + active_piece.space.split('')[1]).attr('class', 'square');
          pce = BoardObj.space_at(BoardObj.next(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).is_occupied;
          $('.board .square#' + BoardObj.next(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).addClass('piece').addClass(pce.army + '-' + pce.type);
          console.log(pce)
          if (pce.can_move()) {
            $('.board .square#' + BoardObj.next(active_piece.space.split('')[0]) + active_piece.space.split('')[1]).addClass('can-move');
          }
        }
      }

      $('.possible-move').removeClass('possible-move');
      $('.possible-capture').removeClass('possible-capture');
      c();
    }
  });

  $(document).on('mouseenter', '.board .square', function() {
    sq = BoardObj.space_at(this.id);

    sqs = sq.is_guarded;

    for (var i = 0; i < sqs.length; i += 1) {
      j = sqs[i];

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

    if (this.id == 'rotateBoard') {
      if ($('input#rotateBoard').is(':checked') && $('style#rotateBoard').length == 0) {
        $('body').append('<style id="rotateBoard">.board.black-move, .board.black-move .square {-webkit-transform: rotate(180deg); -moz-transform: rotate(180deg);}</style>');
      } else if (!$('input#rotateBoard').is(':checked') && $('style#rotateBoard').length != 0) {
        $('style#rotateBoard').remove();
      }
    }

    if (this.id == 'playWithFairies') {
      BoardObj.playing_with_fairies = $('input#playWithFairies').is(':checked');
    }
  })
});