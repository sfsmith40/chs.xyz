var BoardObj = undefined;

var next = function(p) {
  if (parseInt(p, 10)) {
    if (p !== '8') {
      return (parseInt(p, 10) + 1).toString();
    } 
  } else if ('abcdefgh'.split('').indexOf(p) > -1) {
    if (p !== 'h') {
      l = 'abcdefgh'.split('');
      return l[l.indexOf(p) + 1];
    } 
  }

  return false;
}

var last = function(p) {
  if (parseInt(p, 10)) {
    if (p !== '1') {
      return (parseInt(p, 10) - 1).toString();
    }
  } else if ('abcdefgh'.split('').indexOf(p) > -1) {
    if (p !== 'a') {
      l = 'abcdefgh'.split('');
      return l[l.indexOf(p) - 1];
    }
  }

  return false;
}

var log = [];

var loggify = function(obj) {
  console.log(obj)
  var p = obj.piece.type.toLowerCase();
  p = p == 'knight' ? 'N' : p == 'bishop' ? 'B' : p == 'rook' ? 'R' : p == 'queen' ? 'Q' : p == 'king' ? 'K' : '';

  var t = '';

  if (obj.check) {
    if (is_checkmate((obj.piece.army == 'white' ? 'black' : 'white'))) {
      t = '++';
    } else {
      t = '+';
    }
  }

  if (obj.type == 'move') {
    log.push([p + obj.to + (t), obj]);
  } else if (obj.type == 'capture') {
    p = p == '' ? obj.from[0] : p;
    log.push([p + 'x' + obj.to + (t), obj])
  }
}

var is_checkmate = function(army) {
  var sps = BoardObj.spaces.filter(function(s) { return s.is_occupied.army == army });

  for (var i = 0; i < sps.length; i += 1) {
    var pce = sps[i].is_occupied
    var mvs = sps[i].is_occupied.possible_moves()[2];

    for (var j = 0; j < mvs.length; j += 1) {
      if (pce.can_move_to(mvs[j])) {
        return false;
      }
    }
  }

  return true;
}

var kings_in_check = function(army) { 
  var kgs = BoardObj.spaces.filter(function(s) { return s.is_occupied.type == 'king' });
  var wkg = undefined;
  var bkg = undefined;

  for (var i = 0; i < kgs.length; i += 1) {
    if (kgs[i].is_occupied.army == 'white') {
      wkg = kgs[i].is_occupied.space;
    } else if (kgs[i].is_occupied.army == 'black') {
      bkg = kgs[i].is_occupied.space;
    }
  }

  BoardObj.update_guards();

  var ret = [BoardObj.space_at(wkg).guarded_by('black'), BoardObj.space_at(bkg).guarded_by('white')]
  if (!army) {
    return ret; 
  } else {
    return army == 'white' ? ret[0] : army == 'black' ? ret[1] : false;
  }
};

var Piece = function(type, space, army, board) {
  this.type = type;
  this.space = space;
  this.army = army;

  this.possible_moves = function() {
    var ret = [];
    var cap = [];
    var gua = [];
    var h = this.space.split('')[0]; // a-h
    var v = this.space.split('')[1]; // 0-8

    switch (this.type) {
      case 'pawn': 
        switch (this.army) {
          case 'white':
            if (next(v) && !BoardObj.space_at(h + (next(v))).is_occupied) {
              ret.push(h + (next(v)));
              if (v == '2' && !BoardObj.space_at(h + (next(next(v)))).is_occupied) { ret.push(h + (next(next(v)))); }
            }

            if (next(h) && next(v)) {
              if (BoardObj.space_at(next(h) + next(v)).is_occupied && BoardObj.space_at(next(h) + next(v)).is_occupied.army !== this.army) {
                cap.push(next(h) + next(v))
              }

              gua.push(next(h) + next(v));
            }

            if (last(h) && next(v)) {
              if (BoardObj.space_at(last(h) + next(v)).is_occupied && BoardObj.space_at(last(h) + next(v)).is_occupied.army !== this.army) {
                cap.push(last(h) + next(v))
              }

              gua.push(last(h) + next(v));
            }

            break;
          case 'black':
            if (!BoardObj.space_at(h + (last(v))).is_occupied) {
              ret.push(h + (last(v)))
              if (v == '7' && !BoardObj.space_at(h + (last(last(v)))).is_occupied) { ret.push(h + (last(last(v)))); }
            }

            if (next(h) && last(v)) {
              if (BoardObj.space_at(next(h) + last(v)).is_occupied && BoardObj.space_at(next(h) + last(v)).is_occupied.army !== this.army) {
                cap.push(next(h) + last(v))
              }

              gua.push(next(h) + last(v));
            }

            if (last(h) && last(v)) {
              if (BoardObj.space_at(last(h) + last(v)).is_occupied && BoardObj.space_at(last(h) + last(v)).is_occupied.army !== this.army) {
                cap.push(last(h) + last(v))
              }
              
              gua.push(last(h) + last(v));
            }

            break;
        }

        break;
      case 'bishop':
        var uh = h.split()[0];
        var uv = v.split()[0];

        while (next(uh) && next(uv)) {
          var sp = next(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
          var uv = next(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (next(uh) && last(uv)) {
          var sp = next(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
          var uv = last(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (last(uh) && next(uv)) {
          var sp = last(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
          var uv = next(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (last(uh) && last(uv)) {
          var sp = last(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
          var uv = last(uv);
        }

        break;
      case 'knight':
        var uh = h.split()[0];
        var uv = v.split()[0];

        if (last(last(uh)) && last(uv)) {
          var sp = last(last(uh)) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (last(last(uh)) && next(uv)) {
          var sp = last(last(uh)) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (last(uh) && next(next(uv))) {
          var sp = last(uh) + next(next(uv));

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (next(uh) && next(next(uv))) {
          var sp = next(uh) + next(next(uv));

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (next(next(uh)) && next(uv)) {
          var sp = next(next(uh)) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (next(next(uh)) && last(uv)) {
          var sp = next(next(uh)) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (next(uh) && last(last(uv))) {
          var sp = next(uh) + last(last(uv));

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        if (last(uh) && last(last(uv))) {
          var sp = last(uh) + last(last(uv));

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
          }
        }

        break;
      case 'rook':
        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (next(uv)) {
          var sp = uh + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uv = next(uv);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (last(uv)) {
          var sp = uh + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uv = last(uv);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (next(uh)) {
          var sp = next(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (last(uh)) {
          var sp = last(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
        }

        break;
      case 'queen':
        var uh = h.split()[0];
        var uv = v.split()[0];

        while (next(uh) && next(uv)) {
          var sp = next(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
          var uv = next(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (next(uh) && last(uv)) {
          var sp = next(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
          var uv = last(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (last(uh) && next(uv)) {
          var sp = last(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
          var uv = next(uv);
        }

        var uh = h.split()[0];
        var uv = v.split()[0];

        while (last(uh) && last(uv)) {
          var sp = last(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
          var uv = last(uv);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (next(uv)) {
          var sp = uh + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uv = next(uv);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (last(uv)) {
          var sp = uh + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uv = last(uv);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (next(uh)) {
          var sp = next(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = next(uh);
        }

        var uh = h.split('')[0];
        var uv = v.split('')[0];

        while (last(uh)) {
          var sp = last(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).is_occupied) {
            ret.push(sp);
          } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
            cap.push(sp);
            break;
          } else if (BoardObj.space_at(sp).is_occupied) {
            break;
          }

          var uh = last(uh);
        }

        break;
      case 'king':
        var uh = h.split()[0];
        var uv = v.split()[0];
        var ar = this.army == 'white' ? 'black' : 'white';

        if (next(uh)) {
          var sp = next(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (last(uh)) {
          var sp = last(uh) + uv;

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (next(uv)) {
          var sp = uh + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (last(uv)) {
          var sp = uh + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (next(uh) && next(uv)) {
          var sp = next(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (next(uh) && last(uv)) {
          var sp = next(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (last(uh) && last(uv)) {
          var sp = last(uh) + last(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        if (last(uh) && next(uv)) {
          var sp = last(uh) + next(uv);

          gua.push(sp);

          if (!BoardObj.space_at(sp).guarded_by(ar)) {
            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }
        }

        break;
    }

    return [ret, cap, ret.concat(cap), gua];
  }

  this.can_take = function(piece) { return this.possible_moves()[1].indexOf(piece.space) > -1; }

  this.takes = function(piece) {
    if (this.can_take(piece)) {
      return this.move_to(piece.space, piece)
    }
  }

  this.can_move = function() { return this.possible_moves()[2].length > 0; };

  this.can_move_to = function(space) { 
    var ret = false;

    if (this.possible_moves()[2].indexOf(space) > -1) {
      ret = true;

      BoardObj.space_at(this.space).is_occupied = false;

      var os = this.space;
      var op = BoardObj.space_at(space).is_occupied;

      this.space = space;
      BoardObj.space_at(space).is_occupied = this;

      var k = kings_in_check();

      if ((this.army == 'white' && k[0]) || (this.army == 'black' && k[1])) {
        ret = false;
      } else {
        ret = true;
      }

      BoardObj.space_at(this.space).is_occupied = op;
      this.space = os;
      BoardObj.space_at(this.space).is_occupied = this;
    }

    return ret;
  };

  this.move_to = function(space, is_cap) {
    if (this.can_move_to(space)) {
      var os = this.space;
      var ns = space;
      var sps = this.possible_moves()[2];

      BoardObj.space_at(this.space).is_occupied = false;
      this.space = space;
      BoardObj.space_at(this.space).is_occupied = this;

      for (var i = 0; i < sps.length; i += 1) {
        BoardObj.space_at(sps[i]).is_guarded = BoardObj.space_at(sps[i]).is_guarded.filter(function(s){ return s !== this; });
      }

      var sps = this.possible_moves()[3];

      for (var i = 0; i < sps.length; i += 1) {
        BoardObj.space_at(sps[i]).is_guarded.push(this);
      }
      
      var k = kings_in_check();

      if (!is_cap) {
        loggify({
          type: 'move',
          from: os,
          to: ns,
          piece: this,
          check: (this.army == 'white' ? k[1] : this.army == 'black' ? k[0] : false)
        });
      } else if (is_cap) {
        loggify({
          type: 'capture',
          from: os,
          to: ns,
          piece: this,
          cap_piece: is_cap,
          check: (this.army == 'white' ? k[1] : this.army == 'black' ? k[0] : false)
        });
      }

      return true;
    } else {
      alert('in check. please select a different move.');
      return false;
    }
  }

  this.update_guard = function() {
    var sps = this.possible_moves()[3];
    for (var i = 0; i < sps.length; i += 1) {
      BoardObj.space_at(sps[i]).is_guarded.push(this);
    }
  }

  this.init = function() {
    BoardObj.space_at(this.space).is_occupied = this;
  };

  this.init();
};

var Army = function(col, board) {
  this.pieces = [];
  this.in_check = false;

  this.init = function() {
    if (col == 'white') {
      var pieces_init = [
        [ 'pawn', 'a2' ],
        [ 'pawn', 'b2' ],
        [ 'pawn', 'c2' ],
        [ 'pawn', 'd2' ],
        [ 'pawn', 'e2' ],
        [ 'pawn', 'f2' ],
        [ 'pawn', 'g2' ],
        [ 'pawn', 'h2' ],
        [ 'rook', 'a1' ],
        [ 'knight', 'b1' ],
        [ 'bishop', 'c1' ],
        [ 'queen', 'd1' ],
        [ 'king', 'e1' ],
        [ 'bishop', 'f1' ],
        [ 'knight', 'g1' ],
        [ 'rook', 'h1' ],
      ];
    } else if (col == 'black') {
      var pieces_init = [
        [ 'pawn', 'a7' ],
        [ 'pawn', 'b7' ],
        [ 'pawn', 'c7' ],
        [ 'pawn', 'd7' ],
        [ 'pawn', 'e7' ],
        [ 'pawn', 'f7' ],
        [ 'pawn', 'g7' ],
        [ 'pawn', 'h7' ],
        [ 'rook', 'a8' ],
        [ 'knight', 'b8' ],
        [ 'bishop', 'c8' ],
        [ 'queen', 'd8' ],
        [ 'king', 'e8' ],
        [ 'bishop', 'f8' ],
        [ 'knight', 'g8' ],
        [ 'rook', 'h8' ],
      ];
    }

    if (!pieces_init) {
      console.log('Please input the names of the colors of the armies.');
      return;
    }
    for (var i = 0; i < pieces_init.length; i += 1) {
      p = pieces_init[i];
      this.pieces.push(new Piece(p[0], p[1], col, board));
    }
  };

  this.init();
};

var Board = function() {
  this.spaces = [];

  this.space_at = function(coor) {
    var h = coor.split('')[0],
        v = coor.split('')[1];
    for (var i = 0; i < this.spaces.length; i += 1) {
      j = this.spaces[i];
      if (j.hor == h && j.ver == v) {
        return j;
      }
    }
  }

  this.update_guards = function() {
    var sps = this.spaces;
    for (var i = 0; i < sps.length; i += 1) {
      sps[i].is_guarded = [];
    }
    for (var i = 0; i < sps.length; i += 1) {
      if (sps[i].is_occupied) {
        sps[i].is_occupied.update_guard();
      }
    }
  }

  var Space = function(hor, ver) {
    this.hor = hor;
    this.ver = ver;
    this.is_occupied = false;
    this.is_guarded = [];

    this.guarded_by = function(army) { return this.is_guarded.filter(function(a){ return a['army'] == army; }).length > 0; }
  };

  this.init = function() {
    var hor = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var ver = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    for (var i = 0; i < hor.length; i += 1) {
      var h = hor[i];
      for (var j = 0; j < ver.length; j += 1) {
        var v = ver[j];
        this.spaces.push(new Space(h, v));
      }
    }

    BoardObj = this;
  };

  this.init();
}