// Advanced Chess AI & Evaluation Engine with Bot Personalities

// Piece-Square Tables (Rank 0 is row 8 / black side, Rank 7 is row 1 / white side)
const PST = {
  P: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [ 50, 50, 50, 50, 50, 50, 50, 50],
    [ 10, 10, 20, 30, 30, 20, 10, 10],
    [  5,  5, 10, 25, 25, 10,  5,  5],
    [  0,  0,  0, 20, 20,  0,  0,  0],
    [  5, -5,-10,  0,  0,-10, -5,  5],
    [  5, 10, 10,-20,-20, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0]
  ],
  N: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  B: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10, 10,  5, 10, 10,  5, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  R: [
    [  0,  0,  0,  5,  5,  0,  0,  0],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0]
  ],
  Q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  K: [
    [ 20, 30, 10,  0,  0, 10, 30, 20],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30]
  ]
};

const PIECE_VALUES = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000
};

const BOTS = {
  martin: {
    id: 'martin',
    name: 'Martin',
    avatar: '🤖',
    rating: 700,
    quote: 'I like moving pieces around! Hope I do not blunder my queen...',
    depth: 1,
    randomness: 0.35,
    style: 'beginner'
  },
  nelson: {
    id: 'nelson',
    name: 'Nelson',
    avatar: '👑',
    rating: 1300,
    quote: 'My Queen will attack you on move 2! Can you defend?',
    depth: 2,
    randomness: 0.15,
    style: 'aggressive_queen'
  },
  tina: {
    id: 'tina',
    name: 'Tactical Tina',
    avatar: '⚡',
    rating: 1750,
    quote: 'Double attacks and pins are my specialty. Watch your pieces!',
    depth: 3,
    randomness: 0.05,
    style: 'tactical'
  },
  magnus: {
    id: 'magnus',
    name: 'Coach Magnus',
    avatar: '🐐',
    rating: 2500,
    quote: 'Chess is simple: make the best move, control the board, punish mistakes.',
    depth: 4,
    randomness: 0.0,
    style: 'grandmaster'
  }
};

class ChessAI {
  constructor(engine) {
    this.engine = engine;
  }

  evaluateBoard(engine) {
    const status = engine.getGameStatus();
    if (status.over) {
      if (status.result === '1-0') return 99999;
      if (status.result === '0-1') return -99999;
      return 0; // Draw
    }

    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = engine.board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type];
        // PST table is oriented for Black (rank 0 at top).
        // For White, we invert row: rW = 7 - r
        let pstScore = 0;
        if (piece.color === 'w') {
          pstScore = PST[piece.type][7 - r][c];
          score += (val + pstScore);
        } else {
          pstScore = PST[piece.type][r][c];
          score -= (val + pstScore);
        }
      }
    }
    return score;
  }

  orderMoves(moves, engine) {
    return moves.slice().sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Most Valuable Victim - Least Valuable Aggressor (MVV-LVA)
      const targetA = engine.board[a.to.r][a.to.c];
      const targetB = engine.board[b.to.r][b.to.c];
      const srcA = engine.board[a.from.r][a.from.c];
      const srcB = engine.board[b.from.r][b.from.c];

      if (targetA && srcA) {
        scoreA += PIECE_VALUES[targetA.type] * 10 - PIECE_VALUES[srcA.type];
      }
      if (targetB && srcB) {
        scoreB += PIECE_VALUES[targetB.type] * 10 - PIECE_VALUES[srcB.type];
      }

      if (a.promo) scoreA += PIECE_VALUES[a.promo];
      if (b.promo) scoreB += PIECE_VALUES[b.promo];

      return scoreB - scoreA;
    });
  }

  quiescence(engine, alpha, beta, colorFactor, depthLimit = 2) {
    const standPat = this.evaluateBoard(engine) * colorFactor;
    if (depthLimit <= 0) return standPat;
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = engine.getLegalMoves(engine.turn).filter(m => {
      return !!engine.board[m.to.r][m.to.c] || m.promo || m.enPassant;
    });

    const ordered = this.orderMoves(moves, engine);

    for (const move of ordered) {
      engine.makeMove(move, false);
      const score = -this.quiescence(engine, -beta, -alpha, -colorFactor, depthLimit - 1);
      engine.undoMove();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  minimax(engine, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      const colorFactor = isMaximizing ? 1 : -1;
      return this.quiescence(engine, alpha, beta, colorFactor, 1) * colorFactor;
    }

    const turn = engine.turn;
    const moves = engine.getLegalMoves(turn);

    if (moves.length === 0) {
      if (engine.isInCheck(turn)) {
        return isMaximizing ? -90000 - depth : 90000 + depth;
      }
      return 0; // Draw
    }

    const ordered = this.orderMoves(moves, engine);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of ordered) {
        engine.makeMove(move, false);
        const ev = this.minimax(engine, depth - 1, alpha, beta, false);
        engine.undoMove();

        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of ordered) {
        engine.makeMove(move, false);
        const ev = this.minimax(engine, depth - 1, alpha, beta, true);
        engine.undoMove();

        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  getBestMove(botConfig = BOTS.magnus) {
    const engine = this.engine;
    const isMaximizing = engine.turn === 'w';
    const moves = engine.getLegalMoves(engine.turn);

    if (moves.length === 0) return null;

    // Bot personality biases
    if (botConfig.id === 'nelson') {
      // Prioritize moves that move queen or attack queen targets
      const queenMoves = moves.filter(m => engine.board[m.from.r][m.from.c]?.type === 'Q');
      if (queenMoves.length > 0 && Math.random() < 0.35) {
        return queenMoves[Math.floor(Math.random() * queenMoves.length)];
      }
    }

    // Martin / Blunder simulation
    if (Math.random() < botConfig.randomness) {
      // Pick random move among captures or top moves
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const depth = botConfig.depth || 3;
    const ordered = this.orderMoves(moves, engine);

    let bestMove = ordered[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of ordered) {
      engine.makeMove(move, false);
      const val = this.minimax(engine, depth - 1, -Infinity, Infinity, !isMaximizing);
      engine.undoMove();

      if (isMaximizing) {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  // Get numerical evaluation for display & eval bar (-10.0 to +10.0)
  getEvaluation(depth = 2) {
    const isMaximizing = this.engine.turn === 'w';
    const score = this.minimax(this.engine, depth, -Infinity, Infinity, isMaximizing);
    // Convert centipawns to pawns
    const pawnScore = score / 100.0;
    return Math.max(-10.0, Math.min(10.0, pawnScore));
  }
}

window.ChessAI = ChessAI;
window.CHESS_BOTS = BOTS;
