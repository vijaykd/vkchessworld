# 👑 VK Chess World

A full-featured, modern Chess Web Application inspired by **Chess.com** and **Lichess**.

Built with pure vanilla HTML5, CSS3, modern JavaScript, and synthesized Web Audio API — lightning fast with zero npm build steps or external dependencies.

---

## 🌟 Key Features

### 1. 🤖 Play Against Bots (Personalities & Elo Ratings)
- **Coach Magnus** (Rating: 2500 GM): Deep Minimax search with Alpha-Beta pruning, Quiescence evaluation, Piece-Square Tables (PST), king safety, and endgame mastery.
- **Tactical Tina** (Rating: 1750): Dynamic tactical attacker specializing in double attacks, pins, and forks.
- **Nelson** (Rating: 1300): Aggressive early Queen attacks!
- **Martin** (Rating: 700): Friendly beginner bot who loves moving pieces around and makes occasional blunders.
- Select your color (**Play White** or **Play Black**).

### 2. 👥 Pass & Play (Local 2-Player)
- Play with a friend on the same device with interactive move highlighting and flip board support.

### 3. 🧩 Chess Puzzles & Tactics Trainer
- Curated tactical chess puzzles (Back-rank mates, Scholar's mate punishes, Philidor's Smothered Mate, Queen sacrifices, forks).
- Rating tracking and streak counter with instant interactive feedback and hint engine.

### 4. 🔍 Analysis Board & Live Evaluation Bar
- **Live Evaluation Bar** on the left side of the board showing real-time engine evaluation advantage (+1.5, -2.0, etc.) just like Chess.com and Lichess.
- Step through move history (`|<`, `<`, `>`, `>|`) or click on any past move in the SAN move table.

### 5. 📊 Game Review & Move Accuracy
- Post-game review calculating overall accuracy percentages for both White and Black.
- Move classification badges: Brilliant (!!), Great (!), Best (★), Inaccuracy (?!), and Blunder (??).

### 6. 🎨 Customization & Audio
- **5 Board Themes**: Classic Green (Chess.com style), Lichess Blue, Walnut Wood, Carbon Dark, and Cyber Neon.
- **Crisp Vector Pieces**: High-resolution SVG pieces that render sharply on any display.
- **Synthesized Chess Audio**: Web Audio API generated realistic sounds for piece moves, captures, checks, castling, game win/loss, and illegal moves (no missing audio files).
- **Time Controls**: 1 min Bullet, 3 min Blitz, 5 min Blitz, 10 min Rapid, or Unlimited.

---

## 🚀 How to Run

### Method 1: One-Click Run Script (Recommended)
In your terminal, simply run:
```bash
./run.sh
```
This automatically starts a local server on port 8080 and opens your browser directly to `http://localhost:8080`.

### Method 2: Python HTTP Server
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in Chrome, Safari, or Firefox.

### Method 3: Direct File Opening
You can also directly open `index.html` in any web browser!

---

## 📁 Project Structure

```
vkchessworld/
├── index.html            # Main UI, board container, sidebar panels, modals
├── run.sh                # Launcher script
├── README.md             # Project documentation
├── css/
│   └── style.css         # Modern dark theme, glassmorphism, responsive styles
└── js/
    ├── sound.js          # Web Audio API synthesized chess sounds
    ├── pieces.js         # Vector SVG chess pieces
    ├── chess-engine.js   # Complete chess rules engine (FEN, SAN, PGN, checks, castling, en-passant)
    ├── ai.js             # Minimax search, alpha-beta pruning, bot personalities, eval bar
    ├── puzzles.js        # Tactical puzzles database
    └── app.js            # App controller, drag-and-drop, clocks, game review
```
