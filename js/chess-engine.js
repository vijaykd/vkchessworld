// Robust Classical Chess Rules Engine
class ChessEngine {
  constructor(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w';
    this.castling = { K: true, Q: true, k: true, q: true };
    this.enPassant = null; // { r, c }
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = [];
    this.positionCounts = new Map();
    this.loadFen(fen);
  }

  reset() {
    this.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  loadFen(fen) {
    const parts = fen.trim().split(/\s+/);
    const ranks = parts[0].split('/');

    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of ranks[r]) {
        if (/\d/.test(char)) {
          c += parseInt(char, 10);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toUpperCase();
          this.board[r][c] = { color, type };
          c++;
        }
      }
    }

    this.turn = parts[1] || 'w';
    const castlingStr = parts[2] || '-';
    this.castling = {
      K: castlingStr.includes('K'),
      Q: castlingStr.includes('Q'),
      k: castlingStr.includes('k'),
      q: castlingStr.includes('q')
    };

    if (parts[3] && parts[3] !== '-') {
      const file = parts[3].charCodeAt(0) - 97;
      const rank = 8 - parseInt(parts[3][1], 10);
      this.enPassant = { r: rank, c: file };
    } else {
      this.enPassant = null;
    }

    this.halfmoveClock = parseInt(parts[4] || '0', 10);
    this.fullmoveNumber = parseInt(parts[5] || '1', 10);
    this.history = [];
    this.positionCounts = new Map();
    this.recordPosition();
  }

  getFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece.color === 'w' ? piece.type : piece.type.toLowerCase();
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${this.turn} `;
    let castling = '';
    if (this.castling.K) castling += 'K';
    if (this.castling.Q) castling += 'Q';
    if (this.castling.k) castling += 'k';
    if (this.castling.q) castling += 'q';
    fen += castling || '-';

    if (this.enPassant) {
      const file = String.fromCharCode(97 + this.enPassant.c);
      const rank = 8 - this.enPassant.r;
      fen += ` ${file}${rank} `;
    } else {
      fen += ' - ';
    }

    fen += `${this.halfmoveClock} ${this.fullmoveNumber}`;
    return fen;
  }

  getPositionKey() {
    // Generate key for threefold repetition (board + turn + castling + enPassant)
    let s = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        s += p ? (p.color + p.type) : '.';
      }
    }
    s += `_${this.turn}_${this.castling.K?'K':''}${this.castling.Q?'Q':''}${this.castling.k?'k':''}${this.castling.q?'q':''}`;
    if (this.enPassant) {
      s += `_${this.enPassant.r},${this.enPassant.c}`;
    }
    return s;
  }

  recordPosition() {
    const key = this.getPositionKey();
    const count = (this.positionCounts.get(key) || 0) + 1;
    this.positionCounts.set(key, count);
  }

  unrecordPosition() {
    const key = this.getPositionKey();
    const count = this.positionCounts.get(key) || 1;
    if (count <= 1) {
      this.positionCounts.delete(key);
    } else {
      this.positionCounts.set(key, count - 1);
    }
  }

  squareToCoords(sq) {
    if (typeof sq === 'object') return sq;
    const c = sq.charCodeAt(0) - 97;
    const r = 8 - parseInt(sq[1], 10);
    return { r, c };
  }

  coordsToSquare(r, c) {
    return String.fromCharCode(97 + c) + (8 - r);
  }

  getPiece(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return this.board[r][c];
  }

  isSquareAttacked(r, c, attackerColor) {
    // Check pawns
    const pawnDir = attackerColor === 'w' ? 1 : -1;
    const attackerPawnRow = r + pawnDir;
    for (const dc of [-1, 1]) {
      const pc = c + dc;
      if (attackerPawnRow >= 0 && attackerPawnRow < 8 && pc >= 0 && pc < 8) {
        const p = this.board[attackerPawnRow][pc];
        if (p && p.color === attackerColor && p.type === 'P') return true;
      }
    }

    // Check knights
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = this.board[nr][nc];
        if (p && p.color === attackerColor && p.type === 'N') return true;
      }
    }

    // Check sliding directions (Rook / Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const p = this.board[nr][nc];
        if (p) {
          if (p.color === attackerColor && (p.type === 'R' || p.type === 'Q')) return true;
          break;
        }
        step++;
      }
    }

    // Check diagonal directions (Bishop / Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const p = this.board[nr][nc];
        if (p) {
          if (p.color === attackerColor && (p.type === 'B' || p.type === 'Q')) return true;
          break;
        }
        step++;
      }
    }

    // Check king (1 step around)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const p = this.board[nr][nc];
          if (p && p.color === attackerColor && p.type === 'K') return true;
        }
      }
    }

    return false;
  }

  findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === color && p.type === 'K') {
          return { r, c };
        }
      }
    }
    return null;
  }

  isInCheck(color = this.turn) {
    const king = this.findKing(color);
    if (!king) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(king.r, king.c, opponent);
  }

  generatePseudoLegalMoves(color = this.turn) {
    const moves = [];
    const opp = color === 'w' ? 'b' : 'w';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece || piece.color !== color) continue;

        switch (piece.type) {
          case 'P': {
            const dir = color === 'w' ? -1 : 1;
            const startRank = color === 'w' ? 6 : 1;
            const promoRank = color === 'w' ? 0 : 7;

            // 1 square forward
            const nr = r + dir;
            if (nr >= 0 && nr < 8 && !this.board[nr][c]) {
              if (nr === promoRank) {
                for (const promo of ['Q', 'R', 'B', 'N']) {
                  moves.push({ from: { r, c }, to: { r: nr, c }, promo });
                }
              } else {
                moves.push({ from: { r, c }, to: { r: nr, c } });

                // 2 squares forward
                const nnr = r + 2 * dir;
                if (r === startRank && !this.board[nnr][c]) {
                  moves.push({ from: { r, c }, to: { r: nnr, c }, doublePawn: true });
                }
              }
            }

            // Diagonal captures
            for (const dc of [-1, 1]) {
              const nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const target = this.board[nr][nc];
                if (target && target.color === opp) {
                  if (nr === promoRank) {
                    for (const promo of ['Q', 'R', 'B', 'N']) {
                      moves.push({ from: { r, c }, to: { r: nr, c: nc }, promo, captured: target });
                    }
                  } else {
                    moves.push({ from: { r, c }, to: { r: nr, c: nc }, captured: target });
                  }
                } else if (this.enPassant && this.enPassant.r === nr && this.enPassant.c === nc) {
                  moves.push({ from: { r, c }, to: { r: nr, c: nc }, enPassant: true });
                }
              }
            }
            break;
          }

          case 'N': {
            const offsets = [
              [-2, -1], [-2, 1], [-1, -2], [-1, 2],
              [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [dr, dc] of offsets) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const target = this.board[nr][nc];
                if (!target || target.color === opp) {
                  moves.push({ from: { r, c }, to: { r: nr, c: nc }, captured: target });
                }
              }
            }
            break;
          }

          case 'B':
          case 'R':
          case 'Q': {
            const dirs = [];
            if (piece.type === 'B' || piece.type === 'Q') {
              dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
            }
            if (piece.type === 'R' || piece.type === 'Q') {
              dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
            }

            for (const [dr, dc] of dirs) {
              let step = 1;
              while (true) {
                const nr = r + dr * step;
                const nc = c + dc * step;
                if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
                const target = this.board[nr][nc];
                if (!target) {
                  moves.push({ from: { r, c }, to: { r: nr, c: nc } });
                } else {
                  if (target.color === opp) {
                    moves.push({ from: { r, c }, to: { r: nr, c: nc }, captured: target });
                  }
                  break;
                }
                step++;
              }
            }
            break;
          }

          case 'K': {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                  const target = this.board[nr][nc];
                  if (!target || target.color === opp) {
                    moves.push({ from: { r, c }, to: { r: nr, c: nc }, captured: target });
                  }
                }
              }
            }

            // Castling
            if (color === 'w' && r === 7 && c === 4) {
              // White Kingside
              if (this.castling.K && !this.board[7][5] && !this.board[7][6]) {
                if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
                  moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 6 }, castle: 'K' });
                }
              }
              // White Queenside
              if (this.castling.Q && !this.board[7][3] && !this.board[7][2] && !this.board[7][1]) {
                if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
                  moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 2 }, castle: 'Q' });
                }
              }
            } else if (color === 'b' && r === 0 && c === 4) {
              // Black Kingside
              if (this.castling.k && !this.board[0][5] && !this.board[0][6]) {
                if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
                  moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 6 }, castle: 'k' });
                }
              }
              // Black Queenside
              if (this.castling.q && !this.board[0][3] && !this.board[0][2] && !this.board[0][1]) {
                if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
                  moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 2 }, castle: 'q' });
                }
              }
            }
            break;
          }
        }
      }
    }

    return moves;
  }

  makeMove(move, validate = true) {
    if (validate) {
      const legalMoves = this.getLegalMoves(this.turn);
      const matched = legalMoves.find(m =>
        m.from.r === move.from.r &&
        m.from.c === move.from.c &&
        m.to.r === move.to.r &&
        m.to.c === move.to.c &&
        (!move.promo || m.promo === move.promo)
      );
      if (!matched) return null;
      move = matched; // Use rich properties
    }

    const { from, to, promo, castle, enPassant } = move;
    const piece = this.board[from.r][from.c];
    let captured = this.board[to.r][to.c];

    // Compute SAN representation before making the move
    const san = this.moveToSan(move);

    // Save previous state for undo
    const prevState = {
      from: { ...from },
      to: { ...to },
      piece: { ...piece },
      captured: captured ? { ...captured } : null,
      castling: { ...this.castling },
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
      turn: this.turn,
      san: san,
      promo: promo || null,
      castle: castle || null,
      enPassantMove: !!enPassant
    };

    // Update halfmove clock
    if (piece.type === 'P' || captured || enPassant) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    if (this.turn === 'b') {
      this.fullmoveNumber++;
    }

    // Move piece on board
    this.board[from.r][from.c] = null;

    if (enPassant) {
      const epCapturedRank = piece.color === 'w' ? to.r + 1 : to.r - 1;
      captured = this.board[epCapturedRank][to.c];
      prevState.captured = captured ? { ...captured } : null;
      prevState.epCapturedPos = { r: epCapturedRank, c: to.c };
      this.board[epCapturedRank][to.c] = null;
    }

    if (promo) {
      this.board[to.r][to.c] = { color: piece.color, type: promo };
    } else {
      this.board[to.r][to.c] = piece;
    }

    // Handle Castling Rook movements
    if (castle) {
      if (castle === 'K') {
        this.board[7][5] = this.board[7][7];
        this.board[7][7] = null;
      } else if (castle === 'Q') {
        this.board[7][3] = this.board[7][0];
        this.board[7][0] = null;
      } else if (castle === 'k') {
        this.board[0][5] = this.board[0][7];
        this.board[0][7] = null;
      } else if (castle === 'q') {
        this.board[0][3] = this.board[0][0];
        this.board[0][0] = null;
      }
    }

    // Update castling rights
    if (piece.type === 'K') {
      if (piece.color === 'w') {
        this.castling.K = false;
        this.castling.Q = false;
      } else {
        this.castling.k = false;
        this.castling.q = false;
      }
    } else if (piece.type === 'R') {
      if (from.r === 7 && from.c === 7) this.castling.K = false;
      if (from.r === 7 && from.c === 0) this.castling.Q = false;
      if (from.r === 0 && from.c === 7) this.castling.k = false;
      if (from.r === 0 && from.c === 0) this.castling.q = false;
    }

    if (captured && captured.type === 'R') {
      if (to.r === 7 && to.c === 7) this.castling.K = false;
      if (to.r === 7 && to.c === 0) this.castling.Q = false;
      if (to.r === 0 && to.c === 7) this.castling.k = false;
      if (to.r === 0 && to.c === 0) this.castling.q = false;
    }

    // Update enPassant target
    if (piece.type === 'P' && Math.abs(to.r - from.r) === 2) {
      this.enPassant = { r: (from.r + to.r) / 2, c: from.c };
    } else {
      this.enPassant = null;
    }

    // Toggle turn
    this.turn = this.turn === 'w' ? 'b' : 'w';

    this.history.push(prevState);
    this.recordPosition();

    return prevState;
  }

  undoMove() {
    if (this.history.length === 0) return null;

    this.unrecordPosition();
    const last = this.history.pop();
    const { from, to, piece, captured, castling, enPassant, halfmoveClock, fullmoveNumber, turn, promo, castle, enPassantMove, epCapturedPos } = last;

    this.board[from.r][from.c] = piece;
    this.board[to.r][to.c] = null;

    if (enPassantMove && epCapturedPos && captured) {
      this.board[epCapturedPos.r][epCapturedPos.c] = captured;
    } else if (captured) {
      this.board[to.r][to.c] = captured;
    }

    if (castle) {
      if (castle === 'K') {
        this.board[7][7] = this.board[7][5];
        this.board[7][5] = null;
      } else if (castle === 'Q') {
        this.board[7][0] = this.board[7][3];
        this.board[7][3] = null;
      } else if (castle === 'k') {
        this.board[0][7] = this.board[0][5];
        this.board[0][5] = null;
      } else if (castle === 'q') {
        this.board[0][0] = this.board[0][3];
        this.board[0][3] = null;
      }
    }

    this.castling = castling;
    this.enPassant = enPassant;
    this.halfmoveClock = halfmoveClock;
    this.fullmoveNumber = fullmoveNumber;
    this.turn = turn;

    return last;
  }

  getLegalMoves(color = this.turn) {
    const pseudoMoves = this.generatePseudoLegalMoves(color);
    const legal = [];

    for (const move of pseudoMoves) {
      // Execute move speculatively without validation
      const state = this.makeMove(move, false);
      // If our king is NOT in check, move is legal
      if (!this.isInCheck(color)) {
        legal.push(move);
      }
      this.undoMove();
    }

    return legal;
  }

  moveToSan(move) {
    const { from, to, promo, castle, enPassant } = move;
    const piece = this.board[from.r][from.c];
    if (!piece) return '';

    if (castle) {
      return (castle === 'K' || castle === 'k') ? 'O-O' : 'O-O-O';
    }

    const toSq = this.coordsToSquare(to.r, to.c);
    const isCapture = !!this.board[to.r][to.c] || !!enPassant;

    let san = '';
    if (piece.type === 'P') {
      if (isCapture) {
        san += String.fromCharCode(97 + from.c) + 'x' + toSq;
      } else {
        san += toSq;
      }
      if (promo) {
        san += '=' + promo;
      }
    } else {
      san += piece.type;

      // Disambiguation
      const pseudo = this.generatePseudoLegalMoves(piece.color);
      const candidates = pseudo.filter(m =>
        m.to.r === to.r &&
        m.to.c === to.c &&
        (m.from.r !== from.r || m.from.c !== from.c) &&
        this.board[m.from.r][m.from.c]?.type === piece.type
      );

      // Check if any candidate is legal
      const ambiguousLegals = candidates.filter(cand => {
        this.makeMove(cand, false);
        const legal = !this.isInCheck(piece.color);
        this.undoMove();
        return legal;
      });

      if (ambiguousLegals.length > 0) {
        const sameFile = ambiguousLegals.some(m => m.from.c === from.c);
        const sameRank = ambiguousLegals.some(m => m.from.r === from.r);

        if (!sameFile) {
          san += String.fromCharCode(97 + from.c);
        } else if (!sameRank) {
          san += (8 - from.r);
        } else {
          san += String.fromCharCode(97 + from.c) + (8 - from.r);
        }
      }

      if (isCapture) san += 'x';
      san += toSq;
    }

    // Check check / checkmate suffix
    // Make move speculatively to test opponent's status
    this.makeMove(move, false);
    const opponent = piece.color === 'w' ? 'b' : 'w';
    if (this.isInCheck(opponent)) {
      const oppLegal = this.getLegalMoves(opponent);
      san += oppLegal.length === 0 ? '#' : '+';
    }
    this.undoMove();

    return san;
  }

  isCheckmate() {
    return this.isInCheck(this.turn) && this.getLegalMoves(this.turn).length === 0;
  }

  isStalemate() {
    return !this.isInCheck(this.turn) && this.getLegalMoves(this.turn).length === 0;
  }

  isThreefoldRepetition() {
    const key = this.getPositionKey();
    return (this.positionCounts.get(key) || 0) >= 3;
  }

  isFiftyMoveRule() {
    return this.halfmoveClock >= 100;
  }

  isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push({ ...p, r, c });
      }
    }

    // King vs King
    if (pieces.length === 2) return true;

    // King + Bishop / Knight vs King
    if (pieces.length === 3) {
      return pieces.some(p => p.type === 'B' || p.type === 'N');
    }

    // King + Bishop vs King + Bishop (same color squares)
    if (pieces.length === 4) {
      const wB = pieces.find(p => p.color === 'w' && p.type === 'B');
      const bB = pieces.find(p => p.color === 'b' && p.type === 'B');
      if (wB && bB) {
        const wSquareColor = (wB.r + wB.c) % 2;
        const bSquareColor = (bB.r + bB.c) % 2;
        return wSquareColor === bSquareColor;
      }
    }

    return false;
  }

  getGameStatus() {
    if (this.isCheckmate()) {
      const winner = this.turn === 'w' ? 'Black' : 'White';
      return { over: true, result: winner === 'White' ? '1-0' : '0-1', reason: `Checkmate! ${winner} wins!` };
    }
    if (this.isStalemate()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Stalemate' };
    }
    if (this.isThreefoldRepetition()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Threefold Repetition' };
    }
    if (this.isFiftyMoveRule()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by 50-Move Rule' };
    }
    if (this.isInsufficientMaterial()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Insufficient Material' };
    }
    return { over: false, check: this.isInCheck(this.turn) };
  }

  getPgn(event = 'VK Chess World Match', site = 'VK Chess', white = 'Player', black = 'Opponent') {
    let pgn = `[Event "${event}"]\n[Site "${site}"]\n[Date "${new Date().toISOString().slice(0, 10)}"]\n`;
    pgn += `[White "${white}"]\n[Black "${black}"]\n`;

    const status = this.getGameStatus();
    pgn += `[Result "${status.over ? status.result : '*'}"]\n\n`;

    let moveNum = 1;
    for (let i = 0; i < this.history.length; i++) {
      if (i % 2 === 0) {
        pgn += `${moveNum}. `;
      }
      pgn += `${this.history[i].san} `;
      if (i % 2 === 1) {
        moveNum++;
      }
    }

    if (status.over) {
      pgn += status.result;
    } else {
      pgn += '*';
    }

    return pgn.trim();
  }
}

window.ChessEngine = ChessEngine;
