var Board = function() {
  this.spaces = new Array();
  this.turn = 'white';
  this.playing_with_fairies = false;
  this.log = [];
  var BoardObj = this;

  var Space = function(hor, ver, restore) {
    this.hor = hor;
    this.ver = ver;
    this.is_occupied = false;
    this.is_guarded = [];

    this.guarded_by = function(army) { return this.is_guarded.filter(function(a){ return a['army'] == army; }).length > 0; }

    if (restore) {
      this.hor = restore.hor;
      this.ver = restore.ver;
      this.is_guarded = restore.is_guarded;
    }
  };

  var Piece = function(type, space, army, board) {
    this.type = type;
    this.space = space;
    this.army = army;

    this.possible_moves = function(move_as) {
      var ret = [];
      var cap = [];
      var gua = [];
      var h = this.space.split('')[0]; // a-h
      var v = this.space.split('')[1]; // 0-8

      switch (move_as ? move_as : this.type) {
        case 'pawn': 
          switch (this.army) {
            case 'white':
              if (BoardObj.next(v) && !BoardObj.space_at(h + (BoardObj.next(v))).is_occupied) {
                ret.push(h + (BoardObj.next(v)));
                if (v == '2' && !BoardObj.space_at(h + (BoardObj.next(BoardObj.next(v)))).is_occupied) { ret.push(h + (BoardObj.next(BoardObj.next(v)))); }
              }

              if (BoardObj.next(h) && BoardObj.next(v)) {
                if (BoardObj.space_at(BoardObj.next(h) + BoardObj.next(v)).is_occupied && BoardObj.space_at(BoardObj.next(h) + BoardObj.next(v)).is_occupied.army !== this.army) {
                  cap.push(BoardObj.next(h) + BoardObj.next(v))
                }

                gua.push(BoardObj.next(h) + BoardObj.next(v));
              }

              if (BoardObj.prev(h) && BoardObj.next(v)) {
                if (BoardObj.space_at(BoardObj.prev(h) + BoardObj.next(v)).is_occupied && BoardObj.space_at(BoardObj.prev(h) + BoardObj.next(v)).is_occupied.army !== this.army) {
                  cap.push(BoardObj.prev(h) + BoardObj.next(v))
                }

                gua.push(BoardObj.prev(h) + BoardObj.next(v));
              }

              break;
            case 'black':
              if (BoardObj.prev(v) && !BoardObj.space_at(h + (BoardObj.prev(v))).is_occupied) {
                ret.push(h + (BoardObj.prev(v)))
                if (v == '7' && !BoardObj.space_at(h + (BoardObj.prev(BoardObj.prev(v)))).is_occupied) { ret.push(h + (BoardObj.prev(BoardObj.prev(v)))); }
              }

              if (BoardObj.next(h) && BoardObj.prev(v)) {
                if (BoardObj.space_at(BoardObj.next(h) + BoardObj.prev(v)).is_occupied && BoardObj.space_at(BoardObj.next(h) + BoardObj.prev(v)).is_occupied.army !== this.army) {
                  cap.push(BoardObj.next(h) + BoardObj.prev(v))
                }

                gua.push(BoardObj.next(h) + BoardObj.prev(v));
              }

              if (BoardObj.prev(h) && BoardObj.prev(v)) {
                if (BoardObj.space_at(BoardObj.prev(h) + BoardObj.prev(v)).is_occupied && BoardObj.space_at(BoardObj.prev(h) + BoardObj.prev(v)).is_occupied.army !== this.army) {
                  cap.push(BoardObj.prev(h) + BoardObj.prev(v))
                }
                
                gua.push(BoardObj.prev(h) + BoardObj.prev(v));
              }

              break;
          }

          var ep = this.can_en_passant();
          if (ep) {
            cap.push(ep);
          }

          break;
        case 'bishop':
          var uh = h.split()[0];
          var uv = v.split()[0];

          while (BoardObj.next(uh) && BoardObj.next(uv)) {
            var sp = BoardObj.next(uh) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.next(uh);
            var uv = BoardObj.next(uv);
          }

          var uh = h.split()[0];
          var uv = v.split()[0];

          while (BoardObj.next(uh) && BoardObj.prev(uv)) {
            var sp = BoardObj.next(uh) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.next(uh);
            var uv = BoardObj.prev(uv);
          }

          var uh = h.split()[0];
          var uv = v.split()[0];

          while (BoardObj.prev(uh) && BoardObj.next(uv)) {
            var sp = BoardObj.prev(uh) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.prev(uh);
            var uv = BoardObj.next(uv);
          }

          var uh = h.split()[0];
          var uv = v.split()[0];

          while (BoardObj.prev(uh) && BoardObj.prev(uv)) {
            var sp = BoardObj.prev(uh) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.prev(uh);
            var uv = BoardObj.prev(uv);
          }

          break;
        case 'knight':
          var uh = h.split()[0];
          var uv = v.split()[0];

          if (BoardObj.prev(BoardObj.prev(uh)) && BoardObj.prev(uv)) {
            var sp = BoardObj.prev(BoardObj.prev(uh)) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.prev(BoardObj.prev(uh)) && BoardObj.next(uv)) {
            var sp = BoardObj.prev(BoardObj.prev(uh)) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.prev(uh) && BoardObj.next(BoardObj.next(uv))) {
            var sp = BoardObj.prev(uh) + BoardObj.next(BoardObj.next(uv));

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.next(uh) && BoardObj.next(BoardObj.next(uv))) {
            var sp = BoardObj.next(uh) + BoardObj.next(BoardObj.next(uv));

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.next(BoardObj.next(uh)) && BoardObj.next(uv)) {
            var sp = BoardObj.next(BoardObj.next(uh)) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.next(BoardObj.next(uh)) && BoardObj.prev(uv)) {
            var sp = BoardObj.next(BoardObj.next(uh)) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.next(uh) && BoardObj.prev(BoardObj.prev(uv))) {
            var sp = BoardObj.next(uh) + BoardObj.prev(BoardObj.prev(uv));

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
            }
          }

          if (BoardObj.prev(uh) && BoardObj.prev(BoardObj.prev(uv))) {
            var sp = BoardObj.prev(uh) + BoardObj.prev(BoardObj.prev(uv));

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

          while (BoardObj.next(uv)) {
            var sp = uh + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uv = BoardObj.next(uv);
          }

          var uh = h.split('')[0];
          var uv = v.split('')[0];

          while (BoardObj.prev(uv)) {
            var sp = uh + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uv = BoardObj.prev(uv);
          }

          var uh = h.split('')[0];
          var uv = v.split('')[0];

          while (BoardObj.next(uh)) {
            var sp = BoardObj.next(uh) + uv;

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.next(uh);
          }

          var uh = h.split('')[0];
          var uv = v.split('')[0];

          while (BoardObj.prev(uh)) {
            var sp = BoardObj.prev(uh) + uv;

            gua.push(sp);

            if (!BoardObj.space_at(sp).is_occupied) {
              ret.push(sp);
            } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
              cap.push(sp);
              break;
            } else if (BoardObj.space_at(sp).is_occupied) {
              break;
            }

            var uh = BoardObj.prev(uh);
          }

          break;
        case 'queen':
          var bhp = this.possible_moves('bishop');
          var rk = this.possible_moves('rook');

          ret = ret.concat(bhp[0]).concat(rk[0]);
          cap = cap.concat(bhp[1]).concat(rk[1]);
          gua = gua.concat(bhp[3]).concat(rk[3]);

          break;
        case 'empress':
          var knt = this.possible_moves('knight');
          var rk = this.possible_moves('rook');

          ret = ret.concat(knt[0]).concat(rk[0]);
          cap = cap.concat(knt[1]).concat(rk[1]);
          gua = gua.concat(knt[3]).concat(rk[3]);

          break;
        case 'unicorn':
          var knt = this.possible_moves('knight');
          var qun = this.possible_moves('queen');

          ret = ret.concat(knt[0]).concat(qun[0]);
          cap = cap.concat(knt[1]).concat(qun[1]);
          gua = gua.concat(knt[3]).concat(qun[3]);
          break;
        case 'princess':
          var knt = this.possible_moves('knight');
          var bhp = this.possible_moves('bishop');

          ret = ret.concat(knt[0]).concat(bhp[0]);
          cap = cap.concat(knt[1]).concat(bhp[1]);
          gua = gua.concat(knt[3]).concat(bhp[3]);
          break;
        case 'king':
          var uh = h.split()[0];
          var uv = v.split()[0];
          var ar = this.army == 'white' ? 'black' : 'white';

          if (BoardObj.next(uh)) {
            var sp = BoardObj.next(uh) + uv;

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.prev(uh)) {
            var sp = BoardObj.prev(uh) + uv;

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.next(uv)) {
            var sp = uh + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.prev(uv)) {
            var sp = uh + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.next(uh) && BoardObj.next(uv)) {
            var sp = BoardObj.next(uh) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.next(uh) && BoardObj.prev(uv)) {
            var sp = BoardObj.next(uh) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.prev(uh) && BoardObj.prev(uv)) {
            var sp = BoardObj.prev(uh) + BoardObj.prev(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (BoardObj.prev(uh) && BoardObj.next(uv)) {
            var sp = BoardObj.prev(uh) + BoardObj.next(uv);

            gua.push(sp);

            if (!BoardObj.space_at(sp).guarded_by(ar)) {
              if (!BoardObj.space_at(sp).is_occupied) {
                ret.push(sp);
              } else if (BoardObj.space_at(sp).is_occupied.army !== this.army) {
                cap.push(sp);
              }
            }
          }

          if (this.can_castle('kingside')) {
            if (this.army == 'white') {
              ret.push('g1');
            } else if (this.army == 'black') {
              ret.push('g8');
            }
          }

          if (this.can_castle('queenside')) {
            if (this.army == 'white') {
              ret.push('c1');
            } else if (this.army == 'black') {
              ret.push('c8');
            }
          } 
          
          break;
      }

      return [ret, cap, ret.concat(cap), gua];
    }

    this.can_take = function(piece) { return this.possible_moves()[1].indexOf(piece.space) > -1; }

    this.takes = function(space, piece, is_en_passant) {
      if (this.can_take(piece) || (is_en_passant && this.can_move_to(space))) {
        return this.move_to(space, piece, is_en_passant)
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

        var k = BoardObj.kings_in_check();

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

    this.move_to = function(space, is_cap, is_en_passant) {
      if (this.can_move_to(space)) {

        if (is_en_passant && !BoardObj.space_at(space).is_occupied) {
          BoardObj.space_at(is_cap.is_occupied.space).is_occupied = false;
        }

        if (this.type == 'king') {
          if (space.split('')[0] == 'g' && this.can_castle('kingside')) {
            var castling = 'kingside';
          } else if (space.split('')[0] == 'c' && this.can_castle('queenside')) {
            var castling = 'queenside';
          }
        } else {
          var castling = false;
        }

        var os = this.space;
        var ns = space;

        this.force_move_to(space);

        if (this.type == 'pawn' && ((this.army == 'white' && ns.split('')[1] == '8') || (this.army == 'black' && ns.split('')[1] == '1'))) {
          var pawn_promotion = true;

          var new_piece;

          if (BoardObj.playing_with_fairies) {
            while (isNaN(parseInt(new_piece)) && [0,1,2,3,4,5,6,7].indexOf(parseInt(new_piece)) == -1) {
              new_piece = prompt('Pawn has reached the king row. Pawn may now be promoted to any of the following pieces (Input corresponding number for choice): \n  - 0: Pawn (stay the same) \n  - 1: Bishop \n  - 2: Knight \n  - 3: Rook \n  - 4: Queen \n  - 5: Empress (knight + rook) \n  - 6: Princess (knight + bishop) \n  - 7: Unicorn (knight + queen)')
            }
          } else {
            while (isNaN(parseInt(new_piece)) && [0,1,2,3,4].indexOf(parseInt(new_piece)) == -1) {
              new_piece = prompt('Pawn has reached the king row. Pawn may now be promoted to any of the following pieces (Input corresponding number for choice): \n  - 0: Pawn (stay the same) \n  - 1: Bishop \n  - 2: Knight \n  - 3: Rook \n  - 4: Queen')
            }
          }

          var old_type = this.type;
          var new_type = ['pawn', 'bishop', 'knight', 'rook', 'queen', 'empress', 'princess', 'unicorn'][new_piece];

          this.type = new_type;
        } else {
          var pawn_promotion = false
        }
        
        var k = BoardObj.kings_in_check();

        if (castling == 'kingside') {
          BoardObj.space_at(BoardObj.next(this.space.split('')[0]) + this.space.split('')[1]).is_occupied.force_move_to(BoardObj.prev(this.space.split('')[0]) + this.space.split('')[1])
        } else if (castling == 'queenside') {
          BoardObj.space_at(BoardObj.prev(BoardObj.prev(this.space.split('')[0])) + this.space.split('')[1]).is_occupied.force_move_to(BoardObj.next(this.space.split('')[0]) + this.space.split('')[1])
        }

        if (castling) {
          var logObj = BoardObj.loggify({
            type: 'castle',
            side: castling,
            from: os,
            to: ns,
            piece: this,
            check: (this.army == 'white' ? k[1] : this.army == 'black' ? k[0] : false),
            pawn_promotion: pawn_promotion,
            old_type: (old_type ? old_type : this.type)
          })
        } else if (is_cap) {
          var logObj = BoardObj.loggify({
            type: 'capture',
            from: os,
            to: ns,
            piece: this,
            cap_piece: is_cap,
            check: (this.army == 'white' ? k[1] : this.army == 'black' ? k[0] : false),
            pawn_promotion: pawn_promotion,
            old_type: (old_type ? old_type : this.type)
          });
        } else {
          var logObj = BoardObj.loggify({
            type: 'move',
            from: os,
            to: ns,
            piece: this,
            check: (this.army == 'white' ? k[1] : this.army == 'black' ? k[0] : false),
            pawn_promotion: pawn_promotion,
            old_type: (old_type ? old_type : this.type)
          });
        }

        BoardObj.turn = BoardObj.turn == 'white' ? 'black' : 'white';
        BoardObj.move_callback(logObj)

        return true;
      } else {
        alert('in check. please select a different move.');
        return false;
      }
    }

    this.force_move_to = function(space) {
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

      return true;
    }

    this.can_castle = function(side) {
      var ar = this.army == 'white' ? 'black' : 'white';

      if (this.type == 'king') {
        if (this.army == 'white' && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'e1' || i[1]['from'] == 'e1') }).length == 0) {
          if (side == 'kingside' && BoardObj.space_at('h1').is_occupied && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'h1' || i[1]['from'] == 'h1') }).length == 0) {
            if (!BoardObj.space_at('f1').is_occupied && !BoardObj.space_at('g1').is_occupied) {
              if (!BoardObj.space_at('e1').guarded_by(ar) && !BoardObj.space_at('f1').guarded_by(ar) && !BoardObj.space_at('g1').guarded_by(ar)) {
                return true;
              }
            }
          } else if (side == 'queenside' && BoardObj.space_at('a1').is_occupied && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'a1' || i[1]['from'] == 'a1') }).length == 0) {
            if (!BoardObj.space_at('b1').is_occupied && !BoardObj.space_at('c1').is_occupied && !BoardObj.space_at('d1').is_occupied) {
              if (!BoardObj.space_at('e1').guarded_by(ar) && !BoardObj.space_at('d1').guarded_by(ar) && !BoardObj.space_at('c1').guarded_by(ar)) {
                return true;
              }
            }
          }
        } else if (this.army == 'black' && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'e8' || i[1]['from'] == 'e8') }).length == 0) {
          if (side == 'kingside' && BoardObj.space_at('h8').is_occupied && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'h8' || i[1]['from'] == 'h8') }).length == 0) {
            if (!BoardObj.space_at('f8').is_occupied && !BoardObj.space_at('g8').is_occupied) {
              if (!BoardObj.space_at('e8').guarded_by(ar) && !BoardObj.space_at('f8').guarded_by(ar) && !BoardObj.space_at('g8').guarded_by(ar)) {
                return true;
              }
            } 
          } else if (side == 'queenside' && BoardObj.space_at('a8').is_occupied && BoardObj.log.filter(function(i) { return (i[1]['to'] == 'a8' || i[1]['from'] == 'a8') }).length == 0) {
            if (!BoardObj.space_at('b8').is_occupied && !BoardObj.space_at('c8').is_occupied && !BoardObj.space_at('d8').is_occupied) {
              if (!BoardObj.space_at('e8').guarded_by(ar) && !BoardObj.space_at('d8').guarded_by(ar) && !BoardObj.space_at('c8').guarded_by(ar)) {
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    this.can_en_passant = function() { 
      if (this.type == 'pawn' && BoardObj.log.length > 0) {
        var log_item = BoardObj.log[BoardObj.log.length - 1][1];
        if (log_item.to.split('')[0] == BoardObj.next(this.space.split('')[0]) || log_item.to.split('')[0] == BoardObj.prev(this.space.split('')[0])) {
          if (this.army == 'white' && this.space.split('')[1] == '5') {
            if (log_item.piece.type == 'pawn' && log_item.from.split('')[1] == '7' && log_item.to.split('')[1] == '5' && log_item.from.split('')[0] == log_item.to.split('')[0]) {
              return log_item.from.split('')[0] + BoardObj.next(log_item.to.split('')[1]);
            }
          } else if (this.army == 'black' && this.space.split('')[1] == '4') {
            if (log_item.piece.type == 'pawn' && log_item.from.split('')[1] == '2' && log_item.to.split('')[1] == '4' && log_item.from.split('')[0] == log_item.to.split('')[0]) {
              return log_item.from.split('')[0] + BoardObj.prev(log_item.to.split('')[1]);
            }
          }
        }
      }

      return false;
    }

    this.move_is_en_passant = function(space) {
      if (this.can_en_passant()) {
        if (!BoardObj.space_at(space).is_occupied) {
          if ((BoardObj.space_at(space.split('')[0] + BoardObj.prev(space.split('')[1])).is_occupied && 
               BoardObj.space_at(space.split('')[0] + BoardObj.prev(space.split('')[1])).is_occupied.type == 'pawn') ||
              (BoardObj.space_at(space.split('')[0] + BoardObj.next(space.split('')[1])).is_occupied &&
               BoardObj.space_at(space.split('')[0] + BoardObj.next(space.split('')[1])).is_occupied.type == 'pawn')) {
            return BoardObj.space_at(space.split('')[0] + (this.army == 'white' ? BoardObj.prev(space.split('')[1]) : BoardObj.next(space.split('')[1])));
          }
        }
      }

      return false;
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

  var Army = function(col, pieces, board) {
    this.pieces = [];
    this.in_check = false;

    this.init = function() {
      if (col == 'white') {
        var pieces_init = pieces ? pieces : [
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
        var pieces_init = pieces ? pieces : [
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
        this.pieces.push(new Piece(p[0], p[1], col));
      }
    };

    this.init();
  };

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

  this.kings_in_check = function(army) { 
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

  this.is_checkmate = function(army) {
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

  this.loggify = function(obj) {
    var p = obj.piece.type.toLowerCase();
    p = p == 'knight' ? 'N' : p == 'bishop' ? 'B' : p == 'rook' ? 'R' : p == 'queen' ? 'Q' : p == 'king' ? 'K' : p == 'empress' ? 'E' : p == 'princess' ? 'P' : p == 'Unicorn' ? 'U' : '';

    var o = obj.old_type.toLowerCase();
    o = o == 'knight' ? 'N' : o == 'bishop' ? 'B' : o == 'rook' ? 'R' : o == 'queen' ? 'Q' : o == 'king' ? 'K' : o == 'empress' ? 'E' : o == 'princess' ? 'P' : o == 'Unicorn' ? 'U' : '';

    var t = '';

    if (obj.check) {
      if (BoardObj.is_checkmate((obj.piece.army == 'white' ? 'black' : 'white'))) {
        t = '#';
      } else {
        t = '+';
      }
    }

    if (obj.pawn_promotion) {
      if (obj.type == 'move') {
        var logObj = [o + obj.to + '=' + p + t, obj]
      } else if (obj.type == 'capture') {
        o = o == '' ? obj.from[0] : o;
        var logObj = [o + 'x' + obj.to + '=' + p + t, obj]
      }
    } else {
      if (obj.type == 'move') {
        var logObj = [p + obj.to + t, obj];
      } else if (obj.type == 'capture') {
        p = p == '' ? obj.from[0] : p;
       var logObj = [p + 'x' + obj.to + t, obj]
      } else if (obj.type == 'castle') {
        p = 'O-O' + (obj.side == 'queenside' ? '-O' : '');
        var logObj = [p, obj];
      }
    }

    BoardObj.log.push(logObj)

    if (BoardObj.is_checkmate((obj.piece.army == 'white' ? 'black' : 'white'))) {
      if (BoardObj.log.length % 2 == 1) {
        BoardObj.log.push(['', obj]);
      }

      if (obj.piece.army == 'white') {
        BoardObj.log.push(['1-0', obj]);
      } else if (obj.piece.army == 'black') {
        BoardObj.log.push(['0-1', obj]);
      }
    }

    return logObj;
  }

  this.prev = function(p) {
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

  this.next = function(p) {
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

  this.restore = function(board) {
    this.turn = board.turn;
    this.black = board.black;
    this.white = board.white
    this.log = board.log;
    this.playing_with_fairies = board.playing_with_fairies;
    this.spaces = [];

    sps = JSON.parse(JSON.stringify(board.spaces))
    for (var i = 0; i < sps.length; i += 1) {
      this.spaces.push(new Space('', '', sps[i]));
      if (sps[i].is_occupied) {
        var pce = sps[i].is_occupied;
        this.spaces[i].is_occupied = new Piece(pce.type, pce.space, pce.army, BoardObj);
      }
    }    
  }

  this.export = function() {
    return JSON.stringify(this);
  }

  this.move_callback = function(obj) {
    dispatcher.trigger('update_board', { board: BoardObj.export() })
    dispatcher.trigger('new_chat_message', { player: 'server', text: obj[1].piece.army + ' made a move: ' + obj[0] });
  }

  this.init = function() {
    var hor = 'abcdefgh'.split('');
    var ver = '12345678'.split('');
    
    for (var i = 0; i < hor.length; i += 1) {
      var h = hor[i];
      for (var j = 0; j < ver.length; j += 1) {
        var v = ver[j];
        this.spaces.push(new Space(h, v));
      }
    }

    this.log = [];
    this.white = new Army('white');
    this.black = new Army('black');
  };

  this.init();
}