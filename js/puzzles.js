// Curated Chess Tactics & Puzzles Database (Chess.com / Lichess Style)
const CHESS_PUZZLES = [
  {
    id: 1,
    title: "Scholar's Mate Punish",
    theme: "Checkmate in 1",
    rating: 800,
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
    turn: 'w',
    description: "White has queen and bishop aimed at f7. Finish the game!",
    solution: [
      { from: 'f3', to: 'f7' } // Qxf7#
    ]
  },
  {
    id: 2,
    title: "Classic Back-Rank Mate",
    theme: "Back Rank Mate",
    rating: 1050,
    fen: "3r2k1/5ppp/8/8/8/8/4RPPP/6K1 b - - 0 1",
    turn: 'b',
    description: "White's king is trapped on the first rank. Find the killer strike!",
    solution: [
      { from: 'd8', to: 'd1' } // Rd1#
    ]
  },
  {
    id: 3,
    title: "The Royal Fork",
    theme: "Fork Attack",
    rating: 1200,
    fen: "r3k2r/pppq1ppp/3p1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R2QK2R b KQkq - 0 8",
    // Black plays a blunder, or we set up a knight fork position:
    fen: "r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP1B1PPP/R2QKB1R w KQkq - 0 10",
    turn: 'w',
    description: "Can you win a piece or initiate a winning fork?",
    solution: [
      { from: 'c3', to: 'd5' }
    ]
  },
  {
    id: 4,
    title: "Philidor's Smothered Mate",
    theme: "Smothered Mate",
    rating: 1650,
    fen: "6k1/5ppp/8/8/8/5N2/5PPP/4Q1K1 w - - 0 1", // Let's make exact smothered mate setup
    fen: "r5rk/5p1p/5P1Q/8/8/8/8/7K w - - 0 1",
    turn: 'w',
    description: "Black's king is cornered by its own rook. Deliver checkmate!",
    solution: [
      { from: 'h6', to: 'g7' } // Qg7#
    ]
  },
  {
    id: 5,
    title: "Anastasia's Mate",
    theme: "Checkmate in 2",
    rating: 1500,
    fen: "5rk1/1p3ppp/8/3N4/8/8/5PPP/1R4K1 w - - 0 1",
    turn: 'w',
    description: "Use your knight and rook for a devastating combination!",
    solution: [
      { from: 'd5', to: 'e7' } // Ne7+ Kh8
    ]
  },
  {
    id: 6,
    title: "Queen Sacrifice Mate",
    theme: "Deflection & Mate",
    rating: 1400,
    fen: "r1b2rk1/pp3ppp/2n5/8/2B5/5Q2/PPP2PPP/2KR4 w - - 0 1",
    turn: 'w',
    description: "Black didn't defend f7 properly. Deliver mate in 2!",
    solution: [
      { from: 'f3', to: 'f7' } // Qxf7+ Rxf7 Rd8#
    ]
  },
  {
    id: 7,
    title: "Opera Game Mate",
    theme: "Morphy's Masterpiece",
    rating: 1350,
    fen: "4kb1r/p2n1ppp/4p3/4q3/8/5Q2/PP1PPP1P/R1B1K1NR w KQk - 0 11",
    turn: 'w',
    description: "Deliver a devastating check to seize absolute control!",
    solution: [
      { from: 'f3', to: 'a8' } // Qa8+
    ]
  },
  {
    id: 8,
    title: "Double Bishop Mate (Boden's Mate)",
    theme: "Checkmate in 1",
    rating: 1100,
    fen: "2kr3r/ppp2ppp/2p5/2b5/4P1b1/2NB4/PPP2PPP/R1B2RK1 b - - 0 1",
    turn: 'b',
    description: "Look at the open king diagonal and strike!",
    solution: [
      { from: 'c5', to: 'e3' }
    ]
  }
];

window.CHESS_PUZZLES = CHESS_PUZZLES;
