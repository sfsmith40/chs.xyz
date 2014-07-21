$(document).ready(function() {
  var BoardObj;
  var White;
  var Black;
  var Turn;
  var active_piece;

  var reset = function() {
    $('body').html('<h1></h1><div class="board"></div><ol class="log"></ol>')

    var h = 'abcdefgh'.split('');
    var v = '12345678'.split('');
    v.reverse();

    for (var i = 0; i < v.length; i += 1) {
      var ver = v[i];
      $('.board').append('<div class="row" id="' + ver + '"></div>');
      for (var j = 0; j < h.length; j += 1) {
        var hor = h[j];
        $('.board .row#' + ver).append('<div class="square" id="' + (hor + ver) + '"></div>');
      }
    }

    BoardObj = new Board();
    White = new Army('white', BoardObj);
    Black = new Army('black', BoardObj);
    Turn = 'white';
    for (var i = 0; i < BoardObj.spaces.length; i += 1) {
      j = BoardObj.spaces[i];

      if (j.is_occupied) {
        $('.board .square#' + (j.hor + j.ver)).addClass(j.is_occupied.army + '-' + j.is_occupied.type).addClass('piece');
      }
    }

    c(true);
  };

  var check_check = function() {
    var k = kings_in_check();

    if (k[0]) {
      White.in_check = true;
      $('.white-king').addClass('in-check');
      $('h1').append(' White in check!');

      if (is_checkmate('white')) {
        if (confirm('Checkmate! Black wins! Play Again?')) {
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
      $('h1').append(' Black in check!');

      if (is_checkmate('black')) {
        if (confirm('Checkmate! White wins! Play Again?')) {
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
      Turn = Turn == 'white' ? 'black' : 'white'; 
    }

    $('h1').text(Turn + ' to move.');

    $('.board .square').each(function() { sq = BoardObj.space_at(this.id); sq.is_guarded = []; })

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
    for (var i = 0; i < log.length; i += 2) {
      $('.log').append('<li>' + log[i][0] + (log[i+1] ? ' ' + log[i+1][0] : '') + '</li>');
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

  $(document).on('click', '.board .square.piece.possible-capture', function() {
    captured_piece = BoardObj.space_at(this.id).is_occupied;
    sq = active_piece.space;

    if (active_piece.takes(captured_piece)) {
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
    if (active_piece.move_to(this.id, false)) {
      $('.board .square#' + sq).attr('class', 'square');
      $('.board .square#' + active_piece.space).addClass(active_piece.army + '-' + active_piece.type).addClass('piece');

      $('.possible-move').removeClass('possible-move');
      $('.possible-capture').removeClass('possible-capture');
      c();
    }
  });
});