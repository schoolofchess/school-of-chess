/**
 * analysis.js — School of Chess Analysis Board
 * ------------------------------------------------
 * Piece fix:    Wikimedia Commons SVG — public domain, zero CDN dependency
 * Features:     chessboard.js + chess.js + Stockfish engine
 *               PGN/FEN import, move navigation, notation,
 *               guess-the-move, board editor, classic games
 */

'use strict';

/* =====================================================
   PIECE IMAGES — Wikimedia Commons SVG (Wikipedia standard pieces)
   ---------------------------------------------------------------
   Root cause of broken pieces: the chessboard.js npm package does NOT
   bundle PNG image files, so any npm/CDN path returns 404.
   Fix: Use the actual Wikipedia chess piece SVGs hosted by the
   Wikimedia Foundation. These are public domain, permanently hosted,
   CORS-open (Access-Control-Allow-Origin: *), and used by Wikipedia
   on every chess diagram page.
   ===================================================== */
const PIECE_URLS = {
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
};

/** pieceTheme function for chessboard.js */
function getPieceUrl(piece) {
  return PIECE_URLS[piece] || '';
}

/* =====================================================
   CLASSIC GAMES DATA
   ===================================================== */
const CLASSIC_GAMES = [
  {
    id: 'opera',
    title: 'The Opera Game',
    white: 'Paul Morphy', black: 'Duke of Brunswick',
    year: 1858, event: 'Paris Opera',
    badge: 'Brilliant Attack',
    desc: 'The most famous attacking masterpiece in chess history. Morphy crushes with rapid development and a stunning queen sacrifice.',
    pgn: '[Event "Paris Opera"]\n[White "Paul Morphy"]\n[Black "Duke of Brunswick"]\n[Date "1858"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0'
  },
  {
    id: 'century',
    title: 'Game of the Century',
    white: 'Donald Byrne', black: 'Robert J. Fischer',
    year: 1956, event: 'Rosenwald Memorial',
    badge: 'Queen Sacrifice',
    desc: 'Fischer, aged 13, sacrifices his queen in a breathtaking combination to deliver checkmate against a strong master.',
    pgn: '[Event "Rosenwald Memorial"]\n[White "Donald Byrne"]\n[Black "Robert J. Fischer"]\n[Date "1956"]\n[Result "0-1"]\n\n1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1'
  },
  {
    id: 'capablanca',
    title: 'Endgame Perfection',
    white: 'José Capablanca', black: 'Savielly Tartakower',
    year: 1924, event: 'New York 1924',
    badge: 'Endgame Mastery',
    desc: 'Capablanca demonstrates flawless endgame technique, converting a tiny structural advantage into a full point.',
    pgn: '[Event "New York 1924"]\n[White "Jose Raul Capablanca"]\n[Black "Savielly Tartakower"]\n[Date "1924"]\n[Result "1-0"]\n\n1. d4 e6 2. Nf3 f5 3. c4 Nf6 4. Bg5 Be7 5. Nc3 O-O 6. e3 b6 7. Bd3 Bb7 8. O-O Qe8 9. Qe2 Ne4 10. Bxe7 Qxe7 11. Bxe4 fxe4 12. Nd2 Bxg2 13. Kxg2 Qg5+ 14. Kh1 Qh4 15. Qg4 Qxg4 16. Nxg4 d5 17. cxd5 exd5 18. Nf6+ Rxf6 19. Ne4+ Kf7 20. Nxf6 Kxf6 21. Rac1 Re8 22. Rc7 Ra8 23. Rfc1 a5 24. Rxc6+ Ke7 25. Rxb6 Rd8 26. Rc5 Rxd4 27. Rxa5 Rxe4 28. Ra7+ Kd6 29. Rxg7 Re2 30. Rxh7 d4 31. Rbb7 d3 32. Rd7+ Kc6 33. Rdc7+ Kd6 34. Rd7+ Kc6 35. Rdc7+ Kd6 36. Rxd3+ 1-0'
  },
  {
    id: 'alekhine',
    title: 'Evergreen Attack',
    white: 'Alexander Alekhine', black: 'Aaron Nimzowitsch',
    year: 1930, event: 'San Remo 1930',
    badge: 'Strategic Genius',
    desc: "Alekhine systematically outplays Nimzowitsch's solid defence with a powerful king-side pawn storm and tactical combinations.",
    pgn: '[Event "San Remo"]\n[White "Alexander Alekhine"]\n[Black "Aaron Nimzowitsch"]\n[Date "1930"]\n[Result "1-0"]\n\n1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 Bxc3+ 5. bxc3 d6 6. Qc2 Qe7 7. g3 O-O 8. Bg2 Nbd7 9. O-O e5 10. Ng5 Re8 11. Nxh7 Nxh7 12. dxe5 Nxe5 13. Bxb7 Bxb7 14. Qxh7+ Kf8 15. Bg5 Qd7 16. Bf6 Re6 17. c5 Nf3+ 18. Kg2 Qd8 19. Qh8+ Ke7 20. Bxd8# 1-0'
  },
  {
    id: 'morphy-paulsen',
    title: 'Immortal Queen Sacrifice',
    white: 'Paul Morphy', black: 'Louis Paulsen',
    year: 1857, event: 'First American Chess Congress',
    badge: 'Paul Morphy',
    desc: "Morphy's stunning queen sacrifice opens decisive lines for a mating attack that shocks even seasoned masters.",
    pgn: '[Event "First American Chess Congress"]\n[White "Paul Morphy"]\n[Black "Louis Paulsen"]\n[Date "1857"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0'
  },
  {
    id: 'fischer-spassky',
    title: 'WC 1972 — Game 6',
    white: 'Robert J. Fischer', black: 'Boris Spassky',
    year: 1972, event: 'World Championship, Reykjavik',
    badge: 'Positional Classic',
    desc: "Often called the greatest game ever played. Fischer's queenside expansion is a masterclass in positional chess strategy.",
    pgn: '[Event "World Championship"]\n[White "Robert James Fischer"]\n[Black "Boris Spassky"]\n[Date "1972"]\n[Result "1-0"]\n\n1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0'
  }
];

/* =====================================================
   STATE
   ===================================================== */
const state = {
  game:               null,   // chess.js game instance
  board:              null,   // chessboard.js instance
  engine:             null,   // Stockfish Worker
  engineEnabled:      false,
  engineReady:        false,
  notationHidden:     false,
  trainingMode:       false,
  gameMoves:          [],     // verbose move list from loaded PGN
  currentMoveIdx:     0,
  engineLines:        [],
  flipped:            false,
  boardEditorMode:    false,  // board editor active
  editorSelectedPiece: null,  // piece selected in editor palette (e.g. 'wQ')
  // ---- Train mode stats ----
  trainStats: { correct: 0, wrong: 0, streak: 0 },
};

/* =====================================================
   UTILITY
   ===================================================== */
function showToast(msg, type) {
  const toast = document.getElementById('analysisToast');
  toast.textContent = msg;
  toast.className = 'analysis-toast show' + (type ? ' ' + type : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'analysis-toast';
  }, 3200);
}

function openModal(id) {
  // If opening FEN modal, populate current FEN
  if (id === 'fenModal' && state.game) {
    const display = document.getElementById('fenCurrentDisplay');
    if (display) display.value = state.game.fen();
  }
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* =====================================================
   EVAL BAR
   ===================================================== */
function updateEvalBar(scoreWhite, isMate, rawScore) {
  const whiteFill = document.getElementById('evalWhiteFill');
  const blackFill = document.getElementById('evalBlackFill');
  const scoreTop  = document.getElementById('evalScoreTop');
  const scoreBot  = document.getElementById('evalScoreBot');

  let pct;

  if (isMate) {
    pct = scoreWhite > 0 ? 97 : 3;
  } else {
    // tanh sigmoid — maps centipawns to 0–100% smoothly
    pct = 50 + Math.tanh(scoreWhite / 400) * 50;
    pct = Math.max(3, Math.min(97, pct));
  }

  whiteFill.style.height = pct + '%';
  blackFill.style.height = (100 - pct) + '%';

  // Build score label
  let label = '';
  if (isMate) {
    label = 'M' + Math.abs(rawScore !== undefined ? rawScore : scoreWhite);
  } else {
    const absCp = Math.abs(scoreWhite);
    label = (absCp / 100).toFixed(1);
  }

  if (scoreWhite >= 0) {
    scoreTop.textContent = '';
    scoreBot.textContent = label;
  } else {
    scoreTop.textContent = label;
    scoreBot.textContent = '';
  }
}

function resetEvalBar() {
  const wf = document.getElementById('evalWhiteFill');
  const bf = document.getElementById('evalBlackFill');
  if (wf) wf.style.height = '50%';
  if (bf) bf.style.height = '50%';
  const st = document.getElementById('evalScoreTop');
  const sb = document.getElementById('evalScoreBot');
  if (st) st.textContent = '';
  if (sb) sb.textContent = '';
}

/* =====================================================
   BOARD STATUS BAR
   ===================================================== */
function updateBoardStatus() {
  const el = document.getElementById('boardStatus');
  const g  = state.game;
  if (!el || !g) return;

  if (g.in_checkmate()) {
    const winner = g.turn() === 'w' ? 'Black' : 'White';
    el.textContent = `Checkmate! ${winner} wins`;
    el.style.color = '#22c55e';
    return;
  }
  if (g.in_stalemate())            { el.textContent = 'Stalemate — Draw';           el.style.color = 'var(--gold)'; return; }
  if (g.in_threefold_repetition()) { el.textContent = 'Draw by threefold repetition'; el.style.color = 'var(--gold)'; return; }
  if (g.insufficient_material())   { el.textContent = 'Draw — insufficient material'; el.style.color = 'var(--gold)'; return; }
  if (g.in_draw())                 { el.textContent = 'Draw';                        el.style.color = 'var(--gold)'; return; }
  if (g.in_check())                {
    const side = g.turn() === 'w' ? 'White' : 'Black';
    el.textContent = `${side} is in Check!`;
    el.style.color = '#ef4444';
    return;
  }

  el.style.color = 'var(--gold)';

  if (state.boardEditorMode) {
    el.textContent = 'Editor Mode — drag or click to place pieces';
    el.style.color = 'rgba(245,158,11,0.8)';
    return;
  }

  const hist = g.history();
  if (hist.length === 0) {
    el.textContent = 'Starting position — White to move';
    return;
  }

  const lastMove = hist[hist.length - 1];
  const mover    = g.turn() === 'w' ? 'Black' : 'White';
  el.textContent  = `${mover} played ${lastMove}`;

  // On mobile — show eval score inline
  if (window.innerWidth <= 768 && state.engineEnabled && state.engineLines[0]) {
    const line = state.engineLines[0];
    const scoreStr = line.isMate
      ? 'M' + Math.abs(line.score)
      : (line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2);
    el.textContent += `   |   Eval: ${scoreStr}`;
  }
}

/* =====================================================
   SIDE TO MOVE INDICATOR
   ===================================================== */
function updateSideIndicator() {
  const turn   = state.game.turn();
  const circle = document.getElementById('sideCircle');
  const label  = document.getElementById('sideMoveLabel');
  const num    = document.getElementById('sideMoveNum');
  const badge  = document.getElementById('gameResultBadge');
  if (!circle) return;

  circle.className = 'side-circle ' + (turn === 'w' ? 'white-turn' : 'black-turn');
  label.textContent = turn === 'w' ? 'White to Move' : 'Black to Move';

  const fullMove = Math.floor(state.game.history().length / 2) + 1;
  num.textContent = 'Move ' + fullMove;

  if (state.game.game_over()) {
    let result = '';
    if (state.game.in_checkmate())          result = turn === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    else if (state.game.in_stalemate())      result = 'Draw — Stalemate';
    else if (state.game.in_threefold_repetition()) result = 'Draw — Repetition';
    else if (state.game.insufficient_material())  result = 'Draw — Insufficient Material';
    else                                     result = 'Draw';

    badge.textContent = result;
    badge.style.display = 'block';
    label.textContent = 'Game Over';
  } else {
    badge.style.display = 'none';
  }
}

/* =====================================================
   MOVE LIST / NOTATION
   ===================================================== */
/* Cached SAN list so we don't rebuild Chess() on every renderMoveList call */
var _cachedGameMovesSANs = null;
var _cachedGameMovesRef  = null; // reference check

function renderMoveList() {
  const container = document.getElementById('moveList');
  if (!container) return;

  // Collect moves from the FULL game history if we have loaded PGN
  // Otherwise use the current game's history
  let history;
  if (state.gameMoves.length > 0) {
    // Only rebuild SAN cache when gameMoves array changes (new game loaded)
    if (state.gameMoves !== _cachedGameMovesRef) {
      const tmp = new Chess();
      _cachedGameMovesSANs = [];
      for (const m of state.gameMoves) {
        const r = tmp.move(m);
        if (r) _cachedGameMovesSANs.push(r.san);
      }
      _cachedGameMovesRef = state.gameMoves;
    }
    history = _cachedGameMovesSANs;
  } else {
    // Free-play mode: clear cache
    _cachedGameMovesRef  = null;
    _cachedGameMovesSANs = null;
    history = state.game.history();
  }

  if (history.length === 0) {
    container.innerHTML = '<span class="move-list-empty">Make a move to start</span>';
    return;
  }

  let html = '';
  for (let i = 0; i < history.length; i++) {
    if (i % 2 === 0) {
      html += `<span class="move-num-cell">${Math.floor(i / 2) + 1}.</span>`;
    }

    // Determine active move index
    const activeIdx = (state.gameMoves.length > 0)
      ? state.currentMoveIdx - 1
      : state.game.history().length - 1;

    const isActive = (i === activeIdx);
    html += `<span class="move-cell${isActive ? ' active-move' : ''}" data-idx="${i}" onclick="navigateToMove(${i})">${history[i]}</span>`;
  }

  container.innerHTML = html;

  // Auto-scroll active move into view
  const active = container.querySelector('.active-move');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/**
 * Navigate to a specific half-move index (0-based).
 * Exposed globally so onclick handlers work.
 */
window.navigateToMove = function(idx) {
  if (state.gameMoves.length > 0) {
    // PGN replay mode
    state.game = new Chess();
    state.currentMoveIdx = 0;
    for (let i = 0; i <= idx; i++) {
      state.game.move(state.gameMoves[i]);
      state.currentMoveIdx++;
    }
  } else {
    // Free-play mode — rebuild from history up to idx
    const hist = state.game.history({ verbose: true });
    state.game = new Chess();
    for (let i = 0; i <= idx; i++) {
      state.game.move(hist[i]);
    }
  }
  state.board.position(state.game.fen(), false);
  updateAll();
};

/* =====================================================
   ENGINE (Stockfish via Blob Worker — avoids CORS)
   ===================================================== */
function initEngine() {
  try {
    // Blob Worker pattern: importScripts from jsDelivr (CORS: *)
    const workerCode = "importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');";
    const blob   = new Blob([workerCode], { type: 'application/javascript' });
    state.engine = new Worker(URL.createObjectURL(blob));

    state.engine.onmessage = handleEngineMessage;

    state.engine.onerror = function(e) {
      console.warn('Stockfish worker error:', e);
      showToast('Engine unavailable — try a different browser.', 'error');
      const toggle = document.getElementById('engineToggle');
      if (toggle) toggle.checked = false;
      state.engineEnabled = false;
      document.getElementById('engineDepthBadge').textContent = 'ERR';
    };

    state.engine.postMessage('uci');
    state.engine.postMessage('setoption name MultiPV value 3');
    state.engine.postMessage('isready');

  } catch (e) {
    console.warn('Engine init failed:', e);
    showToast('Engine could not load in this browser.', 'error');
  }
}

/* Debounce handle — prevents engine restart on every arrow-key press */
var _analyzeTimer;

function analyzePosition() {
  if (!state.engine || !state.engineEnabled || !state.engineReady) return;
  // Stop any in-flight search immediately
  state.engine.postMessage('stop');
  // Debounce: wait 300ms after last call before starting new search
  clearTimeout(_analyzeTimer);
  _analyzeTimer = setTimeout(function() {
    if (!state.engine || !state.engineEnabled) return;
    state.engineLines = [];
    state.engine.postMessage('position fen ' + state.game.fen());
    // movetime 3000ms — avoids burning CPU indefinitely while still reaching good depth
    state.engine.postMessage('go movetime 3000');
  }, 300);
}

function stopEngine() {
  if (state.engine) state.engine.postMessage('stop');
}

function handleEngineMessage(e) {
  const line = e.data;

  if (line === 'readyok') {
    state.engineReady = true;
    return;
  }

  // Route to training handler when in training engine mode
  if (TS.active && TS.engineMode !== 'analysis') {
    _tsHandleEngineMsg(line);
    return;
  }

  if (line.startsWith('info') && line.includes('score') && line.includes(' pv ')) {
    parseEngineLine(line);
  }

  if (line.startsWith('bestmove')) {
    renderEngineLines();
  }
}

/* rAF handle for throttled engine UI updates */
var _engineRafPending = false;

function parseEngineLine(line) {
  const depthMatch = line.match(/depth (\d+)/);
  const pvNumMatch = line.match(/multipv (\d+)/);
  const cpMatch    = line.match(/score cp (-?\d+)/);
  const mateMatch  = line.match(/score mate (-?\d+)/);
  const pvMatch    = line.match(/ pv (.+)/);

  if (!depthMatch || !pvMatch) return;

  const depth = parseInt(depthMatch[1]);
  const pvNum = pvNumMatch ? parseInt(pvNumMatch[1]) : 1;
  const moves = pvMatch[1].trim().split(/\s+/).slice(0, 5);

  let score, isMate = false;

  if (mateMatch) {
    isMate = true;
    score  = parseInt(mateMatch[1]);
  } else if (cpMatch) {
    score = parseInt(cpMatch[1]);
  } else {
    return;
  }

  // Normalize to White's perspective
  const isBlackTurn = state.game.turn() === 'b';
  const scoreWhite  = isBlackTurn ? -score : score;

  state.engineLines[pvNum - 1] = { depth, score: scoreWhite, rawScore: score, isMate, moves, pvNum };

  // Throttle UI updates to one per animation frame — prevents DOM thrashing from
  // the hundreds of 'info' messages Stockfish emits per second at depth 22.
  if (pvNum === 1) {
    document.getElementById('engineDepthBadge').textContent = 'd' + depth;
    updateEvalBar(scoreWhite, isMate, score);
  }
  if (!_engineRafPending) {
    _engineRafPending = true;
    requestAnimationFrame(function() {
      _engineRafPending = false;
      renderEngineLines();
    });
  }
}

function renderEngineLines() {
  const wrap = document.getElementById('engineLinesWrap');
  if (!wrap) return;

  if (!state.engineEnabled || state.engineLines.length === 0) {
    wrap.innerHTML = '<p class="engine-off-msg">Calculating…</p>';
    return;
  }

  const fen = state.game.fen();
  let html = '';

  state.engineLines.forEach((line, idx) => {
    if (!line) return;

    let scoreStr;
    if (line.isMate) {
      scoreStr = '#' + (line.score > 0 ? '+' : '') + line.rawScore;
    } else {
      scoreStr = (line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2);
    }

    const isNeg   = line.score < 0;
    const isFirst = idx === 0;

    // UCI → SAN conversion
    let sanMoves = '';
    try {
      const tmp = new Chess(fen);
      const sanList = [];
      for (const uci of line.moves) {
        if (uci.length < 4) break;
        const mv = tmp.move({ from: uci.slice(0,2), to: uci.slice(2,4), promotion: uci[4] || undefined });
        if (!mv) break;
        sanList.push(mv.san);
      }
      sanMoves = sanList.join(' ');
    } catch (e) {
      sanMoves = line.moves.join(' ');
    }

    html += `
      <div class="engine-line">
        ${isFirst ? '<span class="engine-best-arrow"><i class="fas fa-arrow-right"></i></span>' : ''}
        <span class="engine-line-score${isNeg ? ' negative' : ''}">${scoreStr}</span>
        <span class="engine-line-moves" title="${sanMoves}">${sanMoves}</span>
        <span class="engine-line-depth">d${line.depth}</span>
      </div>`;
  });

  wrap.innerHTML = html || '<p class="engine-off-msg">Calculating…</p>';
}

/* =====================================================
   PGN / FEN LOADING
   ===================================================== */
/* =====================================================
   MULTI-GAME PGN SYSTEM
   ===================================================== */

/**
 * Split a raw PGN string (possibly containing many games) into
 * an array of individual PGN strings.
 */
function splitPGN(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!text) return [];

  // Find every position where a new game header starts.
  // A game header is a line starting with '[' preceded by
  // at least one blank line (or at position 0).
  const games   = [];
  const lines   = text.split('\n');
  let   start   = null;   // line index where current game starts
  const RESULT_RE = /\b(1-0|0-1|1\/2-1\/2|\*)\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('[')) {
      if (start === null) {
        // First game
        start = i;
      } else {
        // Check: was the previous non-empty line a result token?
        let prev = i - 1;
        while (prev >= start && lines[prev].trim() === '') prev--;
        if (prev >= start && RESULT_RE.test(lines[prev].trim())) {
          games.push(lines.slice(start, i).join('\n').trim());
          start = i;
        }
      }
    }
  }
  if (start !== null) games.push(lines.slice(start).join('\n').trim());

  // Fallback: if no result tokens found, split on blank-line + '['
  if (games.length === 0) {
    text.split(/\n{2,}(?=\[)/).forEach(p => { if (p.trim()) games.push(p.trim()); });
  }

  return games.filter(g => g.length > 0);
}

/**
 * Extract PGN tag headers into a plain object.
 * e.g. { White: 'Morphy', Black: 'Anderssen', Result: '1-0', ... }
 */
function parsePGNHeaders(gameStr) {
  const h   = {};
  const re  = /\[(\w+)\s+"([^"]*)"\]/g;
  let   m;
  while ((m = re.exec(gameStr)) !== null) h[m[1]] = m[2];
  return h;
}

/**
 * Count the number of full moves in a PGN string (rough estimate).
 */
function countPGNMoves(gameStr) {
  const movePart = gameStr.replace(/\[.*?\]\s*/gs, '').trim();
  return (movePart.match(/\d+\./g) || []).length;
}

/**
 * Result token → CSS class + display text.
 */
function resultInfo(result) {
  if (result === '1-0')       return { cls: 'r-white', label: '1-0' };
  if (result === '0-1')       return { cls: 'r-black', label: '0-1' };
  if (result === '1/2-1/2')   return { cls: 'r-draw',  label: '½-½' };
  return { cls: 'r-other', label: result || '?' };
}

/* ---- State extensions ---- */
// state.gameLibrary = [{ pgn, headers, moveCount }, ...]
// state.activeGameIdx = number | null

/**
 * Load a single game into the board (by raw PGN string).
 */
function loadPGN(pgn) {
  const tempGame = new Chess();
  if (!tempGame.load_pgn(pgn)) {
    showToast('Invalid PGN — please check the format.', 'error');
    return false;
  }

  state.gameMoves      = tempGame.history({ verbose: true });
  state.game           = new Chess();
  state.currentMoveIdx = 0;
  state.engineLines    = [];
  // Invalidate SAN cache so renderMoveList rebuilds for new game
  _cachedGameMovesRef  = null;
  _cachedGameMovesSANs = null;

  state.board.position('start', false);
  updateAll();
  return true;
}

/**
 * Load and parse a full PGN text (one or many games).
 * If multiple games found → render game list panel.
 * If one game → load directly.
 */
function loadPGNText(pgnText) {
  const raw = pgnText.trim();
  if (!raw) { showToast('Please provide a PGN.', 'error'); return false; }

  const parts = splitPGN(raw);
  if (parts.length === 0) { showToast('No valid games found in PGN.', 'error'); return false; }

  if (parts.length === 1) {
    // Single game — parse + load synchronously (fast)
    state.gameLibrary   = [{ pgn: parts[0], headers: parsePGNHeaders(parts[0]), moveCount: countPGNMoves(parts[0]) }];
    state.activeGameIdx = null;
    if (!loadPGN(parts[0])) return false;
    hideGameListPanel();
    showToast('Game loaded! Use ▶ to replay.', 'success');
    return true;
  }

  // Multiple games: parse metadata in chunks to avoid freezing the main thread
  showToast('Loading ' + parts.length + ' games…', '');
  state.gameLibrary   = new Array(parts.length);
  state.activeGameIdx = null;

  const CHUNK = 50; // parse 50 games per tick
  let idx = 0;

  function parseChunk() {
    const end = Math.min(idx + CHUNK, parts.length);
    for (; idx < end; idx++) {
      state.gameLibrary[idx] = {
        pgn:       parts[idx],
        headers:   parsePGNHeaders(parts[idx]),
        moveCount: countPGNMoves(parts[idx]),
      };
    }

    if (idx < parts.length) {
      // More chunks to process — yield to browser between chunks
      setTimeout(parseChunk, 0);
    } else {
      // All done — render the list and load first game
      renderGameList(state.gameLibrary);
      showGameListPanel();
      loadGameFromList(0);
      showToast(parts.length + ' games loaded — click any to switch.', 'success');
    }
  }

  // Load first game immediately while rest parse in background
  state.gameLibrary[0] = { pgn: parts[0], headers: parsePGNHeaders(parts[0]), moveCount: countPGNMoves(parts[0]) };
  loadGameFromList(0);
  idx = 1;
  setTimeout(parseChunk, 0);
  return true;
}

/**
 * Load a specific game from the library by index.
 */
function loadGameFromList(idx) {
  if (!state.gameLibrary || idx < 0 || idx >= state.gameLibrary.length) return;
  const entry = state.gameLibrary[idx];
  if (!loadPGN(entry.pgn)) return;

  state.activeGameIdx = idx;

  // Update active state in the game list
  document.querySelectorAll('.gl-game-card').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  // Scroll active card into view
  const activeCard = document.querySelector('.gl-game-card.active');
  if (activeCard) activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  // On mobile close the drawer after selection
  if (window.innerWidth <= 768) closeGameListDrawer();
}

/* ---- Panel show / hide ---- */

function showGameListPanel() {
  const col  = document.getElementById('gameListCol');
  const wrap = document.querySelector('.analysis-workspace');
  const btn  = document.getElementById('btnToggleGameList');
  if (col)  { col.style.display = ''; }
  if (wrap) wrap.classList.add('has-game-list');
  if (btn)  btn.style.display = '';
  setTimeout(() => { setLayoutVars(); syncBoardSize(); }, 80);
}

function hideGameListPanel() {
  const col  = document.getElementById('gameListCol');
  const wrap = document.querySelector('.analysis-workspace');
  const btn  = document.getElementById('btnToggleGameList');
  if (col)  col.style.display = 'none';
  if (wrap) wrap.classList.remove('has-game-list');
  if (btn)  btn.style.display = 'none';
  setTimeout(() => { setLayoutVars(); syncBoardSize(); }, 80);
}

window.toggleGameListPanel = function() {
  const col = document.getElementById('gameListCol');
  if (!col) return;
  if (window.innerWidth <= 768) {
    col.classList.toggle('drawer-open');
    const bd = document.getElementById('glDrawerBackdrop');
    if (bd) bd.classList.toggle('open', col.classList.contains('drawer-open'));
  } else {
    const wrap = document.querySelector('.analysis-workspace');
    if (col.style.display === 'none') {
      col.style.display = '';
      wrap.classList.add('has-game-list');
    } else {
      col.style.display = 'none';
      wrap.classList.remove('has-game-list');
    }
    setTimeout(() => { setLayoutVars(); syncBoardSize(); }, 80);
  }
};

function closeGameListDrawer() {
  const col = document.getElementById('gameListCol');
  const bd  = document.getElementById('glDrawerBackdrop');
  if (col) col.classList.remove('drawer-open');
  if (bd)  bd.classList.remove('open');
}

/* ---- Render game list ---- */

function renderGameList(library) {
  const list  = document.getElementById('glList');
  const count = document.getElementById('glCount');
  const badge = document.getElementById('topbarGamesBadge');

  if (count) count.textContent = library.length;
  if (badge) badge.textContent = library.length;

  if (!list) return;

  if (library.length === 0) {
    list.innerHTML = '<div class="gl-empty">No games found</div>';
    return;
  }

  // Cap at 500 visible entries for DOM performance; search still works on full library
  const MAX_VISIBLE = 500;
  const visible   = library.length > MAX_VISIBLE ? library.slice(0, MAX_VISIBLE) : library;
  const truncated = library.length > MAX_VISIBLE;

  list.innerHTML = visible.map((entry, idx) => {
    const h      = entry.headers;
    const white  = h.White  || 'Unknown';
    const black  = h.Black  || 'Unknown';
    const event  = h.Event  || '';
    const res    = resultInfo(h.Result);
    const moves  = entry.moveCount;

    // Truncate long names
    const wShort = white.length > 14 ? white.substring(0, 13) + '…' : white;
    const bShort = black.length > 14 ? black.substring(0, 13) + '…' : black;
    const eShort = event.length > 18 ? event.substring(0, 17) + '…' : event;

    return `<div class="gl-game-card" data-idx="${idx}">
      <div class="gl-card-num">#${idx + 1}</div>
      <div class="gl-card-players">${wShort} vs ${bShort}</div>
      <div class="gl-card-meta">
        ${eShort ? `<span class="gl-card-event" title="${event}">${eShort}</span>` : ''}
        <span class="gl-card-result ${res.cls}">${res.label}</span>
        ${moves ? `<span class="gl-card-moves">${moves}M</span>` : ''}
      </div>
    </div>`;
  }).join('') + (truncated ? `<div class="gl-empty">Showing first ${MAX_VISIBLE} of ${library.length} games — use search to find others.</div>` : '');

  // Event delegation — one listener on the list instead of N listeners on cards
  // Remove old listener first to prevent duplicates on re-render
  list.removeEventListener('click', list._glClickHandler);
  list._glClickHandler = function(e) {
    const card = e.target.closest('.gl-game-card');
    if (card) loadGameFromList(parseInt(card.dataset.idx, 10));
  };
  list.addEventListener('click', list._glClickHandler);
}

/* ---- Search / filter ---- */

function filterGameList(query) {
  if (!state.gameLibrary) return;
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.gl-game-card').forEach((card, idx) => {
    if (idx >= state.gameLibrary.length) return;
    const h = state.gameLibrary[idx].headers;
    const text = [h.White, h.Black, h.Event, h.Result, h.Date]
      .filter(Boolean).join(' ').toLowerCase();
    card.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
}

/* ---- File reading ---- */

function readPGNFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    // Pre-populate textarea with file content (visible feedback)
    const ta = document.getElementById('pgnInput');
    if (ta) ta.value = text;
    // Show file info in drop zone
    _showFileInfo(file.name, text);
  };
  reader.readAsText(file);
}

function _showFileInfo(filename, text) {
  const parts   = splitPGN(text);
  const info    = document.getElementById('pgnFileInfo');
  const nameEl  = document.getElementById('pgnFileName');
  const gamesEl = document.getElementById('pgnFileGames');
  const dz      = document.getElementById('pgnDropZone');
  if (info && nameEl && gamesEl) {
    nameEl.textContent  = filename;
    gamesEl.textContent = parts.length + ' game' + (parts.length !== 1 ? 's' : '') + ' detected';
    info.style.display  = '';
  }
  if (dz) {
    dz.classList.add('has-file');
    // Hide title/sub/browse when file loaded
    const title = dz.querySelector('.pgn-dz-title');
    const sub   = dz.querySelector('.pgn-dz-sub');
    const browse = dz.querySelector('.pgn-browse-btn');
    if (title)  title.style.display = 'none';
    if (sub)    sub.style.display   = 'none';
    if (browse) browse.style.display = 'none';
  }
}

function _resetDropZone() {
  const dz    = document.getElementById('pgnDropZone');
  const info  = document.getElementById('pgnFileInfo');
  if (!dz) return;
  dz.classList.remove('has-file', 'drag-over');
  const title  = dz.querySelector('.pgn-dz-title');
  const sub    = dz.querySelector('.pgn-dz-sub');
  const browse = dz.querySelector('.pgn-browse-btn');
  if (title)  title.style.display = '';
  if (sub)    sub.style.display   = '';
  if (browse) browse.style.display = '';
  if (info)   info.style.display  = 'none';
}

/* ---- Bind all PGN loader controls ---- */

function bindPGNLoader() {
  // Insert drawer backdrop into DOM (once)
  if (!document.getElementById('glDrawerBackdrop')) {
    const bd = document.createElement('div');
    bd.id        = 'glDrawerBackdrop';
    bd.className = 'gl-drawer-backdrop';
    bd.addEventListener('click', closeGameListDrawer);
    document.body.appendChild(bd);
  }

  /* ---- File input ---- */
  const fileInput = document.getElementById('pgnFileInput');
  const browseBtn = document.getElementById('btnBrowsePGN');
  if (browseBtn) browseBtn.addEventListener('click', () => fileInput.click());
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files[0]) readPGNFile(this.files[0]);
      this.value = ''; // reset so same file can be re-selected
    });
  }

  /* ---- Drop zone (inside modal) ---- */
  const dz = document.getElementById('pgnDropZone');
  if (dz) {
    dz.addEventListener('dragover', e => {
      e.preventDefault();
      dz.classList.add('drag-over');
    });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault();
      dz.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) readPGNFile(file);
    });
  }

  /* ---- Page-level drag and drop ---- */
  document.addEventListener('dragover', e => {
    if ([...e.dataTransfer.types].includes('Files')) {
      e.preventDefault();
      document.body.classList.add('pgn-page-drag-over');
    }
  });
  document.addEventListener('dragleave', e => {
    if (!e.relatedTarget) document.body.classList.remove('pgn-page-drag-over');
  });
  document.addEventListener('drop', e => {
    e.preventDefault();
    document.body.classList.remove('pgn-page-drag-over');
    const file = [...e.dataTransfer.files].find(f =>
      f.name.endsWith('.pgn') || f.type === 'text/plain'
    );
    if (file) {
      readPGNFile(file);
      openModal('pgnModal');
    }
  });

  /* ---- Load Game(s) button ---- */
  const btnLoad = document.getElementById('btnLoadPGN');
  if (btnLoad) {
    btnLoad.addEventListener('click', () => {
      const pgn = document.getElementById('pgnInput').value.trim();
      if (!pgn) { showToast('Please select a file or paste PGN.', 'error'); return; }
      if (loadPGNText(pgn)) {
        closeModal('pgnModal');
        document.getElementById('pgnInput').value = '';
        _resetDropZone();
      }
    });
  }

  /* ---- Close game list panel ---- */
  const closeBtn = document.getElementById('btnCloseGameList');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideGameListPanel();
      state.gameLibrary  = [];
      state.activeGameIdx = null;
    });
  }

  /* ---- Search ---- */
  const searchInput = document.getElementById('glSearchInput');
  if (searchInput) {
    let _searchTimer;
    searchInput.addEventListener('input', function() {
      const val = this.value;
      clearTimeout(_searchTimer);
      _searchTimer = setTimeout(function() { filterGameList(val); }, 150);
    });
  }

  /* ---- Reset drop zone when modal closes ---- */
  document.querySelectorAll('[data-close="pgnModal"]').forEach(el => {
    el.addEventListener('click', _resetDropZone);
  });
}

function loadFEN(fen) {
  const tempGame = new Chess();
  if (!tempGame.load(fen)) {
    showToast('Invalid FEN string. Please check and try again.', 'error');
    return false;
  }

  state.game           = new Chess(fen);
  state.gameMoves      = [];
  state.currentMoveIdx = 0;
  state.engineLines    = [];

  state.board.position(fen, false);
  updateAll();
  return true;
}

/* =====================================================
   MOVE NAVIGATION (PGN replay)
   ===================================================== */
function goNext() {
  if (state.gameMoves.length === 0) return; // free-play: no "next"
  if (state.currentMoveIdx >= state.gameMoves.length) return;
  state.game.move(state.gameMoves[state.currentMoveIdx]);
  state.currentMoveIdx++;
  state.board.position(state.game.fen(), false);
  updateAll();
}

function goPrev() {
  if (state.gameMoves.length > 0) {
    if (state.currentMoveIdx <= 0) return;
    state.game.undo();
    state.currentMoveIdx--;
    state.board.position(state.game.fen(), false);
    updateAll();
  } else {
    // Free-play undo
    if (state.game.history().length === 0) return;
    state.game.undo();
    state.board.position(state.game.fen(), false);
    updateAll();
  }
}

function goFirst() {
  if (state.currentMoveIdx === 0 && state.game.history().length === 0) return;
  state.game           = new Chess();
  state.currentMoveIdx = 0;
  state.board.position('start', false);
  updateAll();
}

function goLast() {
  if (state.gameMoves.length === 0) return;
  while (state.currentMoveIdx < state.gameMoves.length) {
    state.game.move(state.gameMoves[state.currentMoveIdx]);
    state.currentMoveIdx++;
  }
  state.board.position(state.game.fen(), false);
  updateAll();
}

/* =====================================================
   GUESS THE MOVE (training feedback)
   ===================================================== */
function showGuessResult(type, msg) {
  const el = document.getElementById('guessResult');
  if (!el) return;

  // Update train stats
  if (type === 'correct') {
    state.trainStats.correct++;
    state.trainStats.streak++;
  } else if (type === 'wrong') {
    state.trainStats.wrong++;
    state.trainStats.streak = 0;
  }
  _updateTrainStatsUI();

  el.textContent = msg;
  el.className   = 'guess-result ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.textContent = '';
    el.className   = 'guess-result';
  }, 2400);
}

/** Update the live train stats display */
function _updateTrainStatsUI() {
  const { correct, wrong, streak } = state.trainStats;
  const total    = correct + wrong;
  const accuracy = total > 0 ? Math.round(correct / total * 100) + '%' : '—';

  const streakEl   = document.getElementById('statStreak');
  const accEl      = document.getElementById('statAccuracy');
  const movesEl    = document.getElementById('statMoves');

  if (streakEl)   streakEl.textContent   = streak;
  if (accEl)      accEl.textContent      = accuracy;
  if (movesEl)    movesEl.textContent    = total;

  // Animate the streak value when it increases
  if (streak > 0 && streakEl) {
    streakEl.style.transform = 'scale(1.3)';
    setTimeout(() => { streakEl.style.transform = 'scale(1)'; }, 200);
  }
}

function resetTrainStats() {
  state.trainStats = { correct: 0, wrong: 0, streak: 0 };
  _updateTrainStatsUI();
}

/* =====================================================
   MASTER updateAll — called after every state change
   ===================================================== */
function updateAll() {
  updateSideIndicator();
  updateBoardStatus();
  renderMoveList();

  if (state.engineEnabled) {
    analyzePosition();
  } else {
    resetEvalBar();
  }
}

/* =====================================================
   BOARD EDITOR MODE
   ===================================================== */

/**
 * Convert chessboard.js position object → FEN piece-placement string.
 * chessboard.js uses e.g. { 'e1': 'wK', 'd8': 'bK' }
 * FEN expects 'K' for white king, 'k' for black king, etc.
 */
function boardPosToPiecePlacement(pos) {
  const ranks = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row   = '';
    let empty = 0;
    for (let fi = 0; fi < 8; fi++) {
      const sq    = 'abcdefgh'[fi] + rank;
      const piece = pos[sq];
      if (piece) {
        if (empty > 0) { row += empty; empty = 0; }
        // 'wK' → 'K', 'bK' → 'k'
        row += piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase();
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    ranks.push(row);
  }
  return ranks.join('/');
}

/**
 * Build the editor piece palette.
 */
function buildEditorPalette() {
  const container = document.getElementById('editorPaletteItems');
  if (!container) return;

  // Order: white pieces, separator, black pieces
  const whitePieces = ['wK','wQ','wR','wB','wN','wP'];
  const blackPieces = ['bK','bQ','bR','bB','bN','bP'];

  let html = '';

  whitePieces.forEach(p => {
    html += `<div class="editor-piece-item" data-piece="${p}" onclick="selectEditorPiece('${p}')" title="${pieceLabel(p)}">
      <img src="${PIECE_URLS[p]}" alt="${p}">
    </div>`;
  });

  html += `<div class="editor-piece-separator"></div>`;

  blackPieces.forEach(p => {
    html += `<div class="editor-piece-item" data-piece="${p}" onclick="selectEditorPiece('${p}')" title="${pieceLabel(p)}">
      <img src="${PIECE_URLS[p]}" alt="${p}">
    </div>`;
  });

  container.innerHTML = html;
}

function pieceLabel(code) {
  const color = code[0] === 'w' ? 'White' : 'Black';
  const names = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
  return color + ' ' + (names[code[1]] || code[1]);
}

window.selectEditorPiece = function(piece) {
  state.editorSelectedPiece = piece;
  document.querySelectorAll('.editor-piece-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.piece === piece);
  });
};

function handleEditorSquareClick(square) {
  if (!square || !state.boardEditorMode) return;

  const currentPos = state.board.position();

  if (state.editorSelectedPiece) {
    // Place the selected piece on this square
    currentPos[square] = state.editorSelectedPiece;
    state.board.position(currentPos, false);
  } else {
    // No piece selected — remove whatever is on the square
    if (currentPos[square]) {
      delete currentPos[square];
      state.board.position(currentPos, false);
    }
  }
}

function enterEditorMode() {
  if (state.boardEditorMode) return;
  state.boardEditorMode     = true;
  state.editorSelectedPiece = null;

  // Rebuild board without chess.js validation (free placement)
  const currentFEN = state.game.fen();
  state.board.destroy();

  const editorCfg = {
    draggable:    true,
    position:     currentFEN,
    pieceTheme:   getPieceUrl,
    orientation:  state.flipped ? 'black' : 'white',
    // In editor mode, allow dragging any piece freely
    onDragStart:  function() { return true; },
    onDrop:       function(source, target, piece, newPos) {
      // chessboard.js handles the visual; we just sync state
      // Nothing extra needed — exitEditorMode reads board.position()
    },
    onSnapEnd:    function() {},
  };

  state.board = Chessboard('chessboard', editorCfg);
  setTimeout(syncBoardSize, 100);

  // Add square click listeners for click-to-place
  $('#chessboard').on('click.editor', '.square-55d63', function() {
    const sq = $(this).data('square');
    handleEditorSquareClick(sq);
  });

  buildEditorPalette();

  // Show editor UI
  document.getElementById('editorPaletteWrap').style.display = 'block';
  document.getElementById('btnEditorMode').classList.add('editor-active');
  document.getElementById('btnEditorMode').innerHTML = '<i class="fas fa-times"></i> Exit';

  updateBoardStatus();
  showToast('Editor ON — select a piece, then click a square to place it', '');
}

/* --------------------------------------------------
   exitEditorMode — discard and close without saving
   -------------------------------------------------- */
function exitEditorMode() {
  if (!state.boardEditorMode) return;
  state.boardEditorMode     = false;
  state.editorSelectedPiece = null;

  $('#chessboard').off('click.editor');

  // Reinitialize normal board (restore last valid game state)
  state.board.destroy();
  _initChessboard(state.game.fen());

  document.getElementById('editorPaletteWrap').style.display = 'none';
  document.getElementById('btnEditorMode').classList.remove('editor-active');
  document.getElementById('btnEditorMode').innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';

  updateAll();
  setTimeout(syncBoardSize, 120);
}

/* --------------------------------------------------
   applyEditorPosition — save FEN and exit editor
   -------------------------------------------------- */
function applyEditorPosition(fen) {
  state.boardEditorMode     = false;
  state.editorSelectedPiece = null;

  $('#chessboard').off('click.editor');

  const tmpGame = new Chess();
  if (tmpGame.load(fen)) {
    state.game        = tmpGame;
    state.gameMoves      = [];
    state.currentMoveIdx = 0;
    state.engineLines    = [];
    showToast('Position applied! Analyse away.', 'success');
  } else {
    state.game = new Chess();
    showToast('Invalid FEN — reset to starting position.', 'error');
  }

  state.board.destroy();
  _initChessboard(state.game.fen());

  document.getElementById('editorPaletteWrap').style.display = 'none';
  document.getElementById('btnEditorMode').classList.remove('editor-active');
  document.getElementById('btnEditorMode').innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';

  updateAll();
  setTimeout(syncBoardSize, 120);
}

/* =====================================================
   POSITION SETUP MODAL
   Professional FEN configuration after Board Editor
   ===================================================== */

/* Saved board position while the Setup Modal is open */
let _setupBoardPos = null;

/* ---------- helpers ---------- */

/**
 * Count pieces matching a chessboard.js piece code (e.g. 'wK', 'bP').
 * pos = { 'e1': 'wK', ... }
 */
function _setupCount(pos, code) {
  return Object.values(pos).filter(p => p === code).length;
}

/**
 * Auto-detect which castling rights are geometrically possible
 * (king AND rook on original squares).  Returns e.g. ['K','Q','k','q'].
 */
function _setupAutocastling(pos) {
  const rights = [];
  if (pos['e1'] === 'wK' && pos['h1'] === 'wR') rights.push('K');
  if (pos['e1'] === 'wK' && pos['a1'] === 'wR') rights.push('Q');
  if (pos['e8'] === 'bK' && pos['h8'] === 'bR') rights.push('k');
  if (pos['e8'] === 'bK' && pos['a8'] === 'bR') rights.push('q');
  return rights;
}

/**
 * Return valid en-passant target squares for the given side and position.
 * White to move → EP on rank 6 (black just pushed a pawn from rank 7 to 5).
 * Black to move → EP on rank 3 (white just pushed a pawn from rank 2 to 4).
 */
function _setupValidEP(pos, side) {
  const files = 'abcdefgh';
  const squares = [];
  if (side === 'w') {
    // Black pawn on rank 5, white pawn adjacent on rank 5
    for (let fi = 0; fi < 8; fi++) {
      const f = files[fi];
      if (pos[f + '5'] !== 'bP') continue;
      const adj = (fi > 0 && pos[files[fi-1] + '5'] === 'wP') ||
                  (fi < 7 && pos[files[fi+1] + '5'] === 'wP');
      if (adj) squares.push(f + '6');
    }
  } else {
    // White pawn on rank 4, black pawn adjacent on rank 4
    for (let fi = 0; fi < 8; fi++) {
      const f = files[fi];
      if (pos[f + '4'] !== 'wP') continue;
      const adj = (fi > 0 && pos[files[fi-1] + '4'] === 'bP') ||
                  (fi < 7 && pos[files[fi+1] + '4'] === 'bP');
      if (adj) squares.push(f + '3');
    }
  }
  return squares;
}

/**
 * Validate the position; returns { ok, errors[], warnings[] }.
 */
function _setupValidate(pos, side) {
  const errors   = [];
  const warnings = [];

  const wKings = _setupCount(pos, 'wK');
  const bKings = _setupCount(pos, 'bK');

  if (wKings === 0) errors.push('No White King on the board.');
  if (wKings > 1)   errors.push('Multiple White Kings on the board.');
  if (bKings === 0) errors.push('No Black King on the board.');
  if (bKings > 1)   errors.push('Multiple Black Kings on the board.');

  // Pawns on forbidden ranks
  'abcdefgh'.split('').forEach(f => {
    if (pos[f + '1'] && pos[f + '1'].endsWith('P')) errors.push('Pawn on rank 1 (not allowed).');
    if (pos[f + '8'] && pos[f + '8'].endsWith('P')) errors.push('Pawn on rank 8 (not allowed).');
  });

  // De-duplicate errors
  const uniqueErrors = [...new Set(errors)];

  // Chess.js deeper validation — build a test FEN
  if (uniqueErrors.length === 0) {
    const piecePlacement = boardPosToPiecePlacement(pos);
    const testFEN = piecePlacement + ' ' + side + ' - - 0 1';
    const tmp = new Chess();
    if (!tmp.load(testFEN)) {
      uniqueErrors.push('chess.js: illegal position (e.g. side not to move is in check).');
    } else {
      // Warn if side-not-to-move king is in check (usually means EP target needed)
      // chess.js already rejects if truly illegal
    }
  }

  return { ok: uniqueErrors.length === 0, errors: uniqueErrors, warnings };
}

/**
 * Build the complete FEN string from the current modal state.
 * Returns null if required elements are missing.
 */
function _setupBuildFEN() {
  if (!_setupBoardPos) return null;

  const pos    = _setupBoardPos;
  const side   = document.getElementById('setupSideWhite').classList.contains('active') ? 'w' : 'b';

  const castleChecks = ['castleWK','castleWQ','castleBK','castleBQ'];
  const castleStr    = castleChecks
    .map(id => document.getElementById(id))
    .filter(el => el && el.checked)
    .map(el => el.value)
    .join('') || '-';

  const ep       = document.getElementById('setupEPSelect').value  || '-';
  const halfmove = parseInt(document.getElementById('setupHalfmove').value, 10) || 0;
  const fullmove = parseInt(document.getElementById('setupFullmove').value, 10) || 1;

  const piecePlacement = boardPosToPiecePlacement(pos);
  return [piecePlacement, side, castleStr, ep, halfmove, fullmove].join(' ');
}

/* ---------- open / close modal ---------- */

function openPositionSetupModal() {
  if (!state.boardEditorMode) return;

  // Snapshot current visual position
  _setupBoardPos = state.board.position();

  const pos  = _setupBoardPos;
  const side = 'w'; // default white to move

  /* -- Castling: auto-detect available rights, check all that qualify -- */
  const autoCastle = _setupAutocastling(pos);
  ['castleWK','castleWQ','castleBK','castleBQ'].forEach(id => {
    const el    = document.getElementById(id);
    const label = document.getElementById(id + '-label');
    if (!el || !label) return;
    el.checked = autoCastle.includes(el.value);
    // Mark unavailable if pieces are not on original squares
    const canCastle = autoCastle.includes(el.value) ||
      (el.value === 'K' && pos['e1'] === 'wK' && pos['h1'] === 'wR') ||
      (el.value === 'Q' && pos['e1'] === 'wK' && pos['a1'] === 'wR') ||
      (el.value === 'k' && pos['e8'] === 'bK' && pos['h8'] === 'bR') ||
      (el.value === 'q' && pos['e8'] === 'bK' && pos['a8'] === 'bR');
    label.classList.toggle('unavailable', !canCastle);
  });

  /* -- En passant dropdown -- */
  _setupRefreshEP(side);

  /* -- Move counters defaults -- */
  document.getElementById('setupHalfmove').value = 0;
  document.getElementById('setupFullmove').value = 1;

  /* -- Side buttons -- */
  document.getElementById('setupSideWhite').classList.add('active');
  document.getElementById('setupSideBlack').classList.remove('active');

  /* -- Validate and update -- */
  _setupRefreshAll();

  openModal('positionSetupModal');
}

function _setupRefreshEP(side) {
  const sel = document.getElementById('setupEPSelect');
  if (!sel || !_setupBoardPos) return;

  const validSquares = _setupValidEP(_setupBoardPos, side);
  sel.innerHTML = '<option value="-">— None —</option>';
  validSquares.forEach(sq => {
    const opt = document.createElement('option');
    opt.value       = sq;
    opt.textContent = sq + (side === 'w'
      ? ' (Black just pushed ' + sq[0] + '7→' + sq[0] + '5)'
      : ' (White just pushed ' + sq[0] + '2→' + sq[0] + '4)');
    sel.appendChild(opt);
  });
}

function _setupRefreshAll() {
  const side = document.getElementById('setupSideWhite').classList.contains('active') ? 'w' : 'b';

  /* Validate */
  const { ok, errors } = _setupValidate(_setupBoardPos, side);
  const banner = document.getElementById('setupValidationBanner');
  const confirmBtn = document.getElementById('btnSetupConfirm');

  if (!ok) {
    banner.style.display = '';
    banner.className = 'setup-validation-banner error';
    banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>' +
      errors.join('<br>') + '</span>';
    confirmBtn.disabled = true;
  } else {
    banner.style.display = '';
    banner.className = 'setup-validation-banner ok';
    banner.innerHTML = '<i class="fas fa-check-circle"></i><span>Position is valid.</span>';
    confirmBtn.disabled = false;
  }

  /* Castling warnings */
  const castleWarning = document.getElementById('castlingWarning');
  const warnings = [];
  if (document.getElementById('castleWK').checked &&
      !((_setupBoardPos['e1'] === 'wK') && (_setupBoardPos['h1'] === 'wR')))
    warnings.push('White O-O: King or h1-Rook not on original square');
  if (document.getElementById('castleWQ').checked &&
      !((_setupBoardPos['e1'] === 'wK') && (_setupBoardPos['a1'] === 'wR')))
    warnings.push('White O-O-O: King or a1-Rook not on original square');
  if (document.getElementById('castleBK').checked &&
      !((_setupBoardPos['e8'] === 'bK') && (_setupBoardPos['h8'] === 'bR')))
    warnings.push('Black O-O: King or h8-Rook not on original square');
  if (document.getElementById('castleBQ').checked &&
      !((_setupBoardPos['e8'] === 'bK') && (_setupBoardPos['a8'] === 'bR')))
    warnings.push('Black O-O-O: King or a8-Rook not on original square');

  if (warnings.length) {
    castleWarning.style.display = '';
    castleWarning.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>' +
      warnings.join(' · ') + '</span>';
  } else {
    castleWarning.style.display = 'none';
  }

  /* FEN preview */
  const fen = _setupBuildFEN();
  const fenEl = document.getElementById('setupFENPreview');
  if (fenEl) fenEl.value = fen || '';
}

/* ---------- bind modal controls ---------- */

function bindPositionSetupModal() {
  /* Side to move buttons */
  ['setupSideWhite','setupSideBlack'].forEach(id => {
    document.getElementById(id).addEventListener('click', function() {
      document.getElementById('setupSideWhite').classList.remove('active');
      document.getElementById('setupSideBlack').classList.remove('active');
      this.classList.add('active');
      const side = this.dataset.side;
      _setupRefreshEP(side);
      _setupRefreshAll();
    });
  });

  /* Castling checkboxes */
  ['castleWK','castleWQ','castleBK','castleBQ'].forEach(id => {
    document.getElementById(id).addEventListener('change', _setupRefreshAll);
  });

  /* EP select */
  document.getElementById('setupEPSelect').addEventListener('change', _setupRefreshAll);

  /* Move counters */
  ['setupHalfmove','setupFullmove'].forEach(id => {
    document.getElementById(id).addEventListener('input', _setupRefreshAll);
  });

  /* Copy FEN */
  document.getElementById('btnSetupCopyFEN').addEventListener('click', function() {
    const fen = document.getElementById('setupFENPreview').value;
    if (!fen) return;
    navigator.clipboard.writeText(fen).then(() => {
      this.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => { this.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
    });
  });

  /* Confirm — apply position */
  document.getElementById('btnSetupConfirm').addEventListener('click', function() {
    const fen = _setupBuildFEN();
    if (!fen) return;
    closeModal('positionSetupModal');
    applyEditorPosition(fen);
  });

  /* Back to Editor */
  document.getElementById('btnSetupBackEdit').addEventListener('click', function() {
    closeModal('positionSetupModal');
    // Stay in editor mode — palette remains visible
  });

  /* Cancel — discard editor entirely */
  document.getElementById('btnSetupCancel').addEventListener('click', function() {
    closeModal('positionSetupModal');
    exitEditorMode();
  });

  /* X close button */
  document.getElementById('btnSetupClose').addEventListener('click', function() {
    closeModal('positionSetupModal');
    exitEditorMode();
  });
}

/* =====================================================
   CLASSIC GAMES
   ===================================================== */
function renderClassicGames() {
  const grid = document.getElementById('classicGamesGrid');
  if (!grid) return;

  grid.innerHTML = CLASSIC_GAMES.map(g => `
    <div class="classic-card" onclick="loadClassicGame('${g.id}')">
      <span class="classic-card-badge">${escHtml(g.badge)}</span>
      <div class="classic-card-players">
        ${escHtml(g.white)} <span>vs</span> ${escHtml(g.black)}
      </div>
      <div class="classic-card-event">${escHtml(g.event)} &middot; ${g.year}</div>
      <div class="classic-card-desc">${escHtml(g.desc)}</div>
      <span class="classic-card-btn">Load &amp; Study <i class="fas fa-arrow-right"></i></span>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.loadClassicGame = function(id) {
  const game = CLASSIC_GAMES.find(g => g.id === id);
  if (!game) return;
  if (!loadPGN(game.pgn)) return;
  document.getElementById('workspaceOuter').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`Loaded: ${game.white} vs ${game.black} (${game.year})`, 'success');
};

/* =====================================================
   LAYOUT VARIABLES — measure DOM, write CSS vars
   Called on load + every resize. Guards against 0-height
   reads that happen before CSS is fully applied.
   ===================================================== */
function setLayoutVars() {
  const nav    = document.getElementById('navbar');
  const topbar = document.getElementById('analysisTopbar');
  // Only update if we get a real measurement (> 0)
  if (nav && nav.offsetHeight > 0) {
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  }
  if (topbar && topbar.offsetHeight > 0) {
    document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
  }
}

/* =====================================================
   WINDOW-BASED BOARD SIZE — reliable fallback when DOM
   dimensions aren't ready yet (grid not laid out, fonts
   still loading, etc). Uses only window dimensions which
   are always available immediately.
   ===================================================== */
function _getWindowBasedBoardSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (w <= 768) {
    // Mobile stacked layout — board fills available width
    return Math.max(260, Math.min(w - 28, 520));
  }

  // Desktop / tablet — estimate from window dimensions.
  // Right-panel and eval-bar widths mirror the CSS grid breakpoints exactly.
  const navEl    = document.getElementById('navbar');
  const topbarEl = document.getElementById('analysisTopbar');
  const navH     = (navEl    && navEl.offsetHeight    > 0) ? navEl.offsetHeight    : 68;
  const topbarH  = (topbarEl && topbarEl.offsetHeight > 0) ? topbarEl.offsetHeight : 56;

  // These match the grid-template-columns values at each breakpoint:
  // ≥1400px: 22px eval + 320px right  |  1024–1399: 18px + 276px  |  etc.
  const evalW   = w >= 1400 ? 22 : w >= 1024 ? 18 : w >= 900 ? 16 : 14;
  const rightW  = w >= 1400 ? 320 : w >= 1200 ? 300 : w >= 1024 ? 276 : w >= 900 ? 256 : 230;

  // Grid gap (2×) + workspace padding (2× horizontal) + card padding (2×)
  const gap     = w >= 1400 ? 32 : w >= 1024 ? 24 : w >= 900 ? 20 : 16;  // 2 gaps
  const wsPad   = w >= 1400 ? 48 : w >= 1024 ? 28 : 24;  // 2× horizontal workspace padding
  const cardPad = 20;  // board-card padding (2× sides)

  // Workspace is centred with max-width:1400px — subtract any centering margin
  const wsWidth = Math.min(w, 1400);
  const boardColW = wsWidth - evalW - rightW - gap - wsPad;

  const availW  = Math.max(0, boardColW - cardPad);

  // Vertical: viewport minus navbar, topbar, status bar, controls, padding
  const chromH  = navH + topbarH + 32 + 52 + 24;  // nav+topbar+status+controls+gaps
  const wsPadV  = w >= 1400 ? 32 : 24;             // 2× vertical workspace padding
  const availH  = Math.max(0, h - chromH - wsPadV - cardPad);

  const size = Math.min(availW, availH, 720);
  return Math.max(240, isFinite(size) && size > 0 ? size : 400);
}

/* =====================================================
   COMPUTE BOARD SIZE — pure calculation, no side effects
   Returns the correct pixel size for the board square.
   NEVER returns 0, NaN, or Infinity.
   ===================================================== */
function _computeBoardSize() {
  const card = document.querySelector('.board-card');
  if (!card) return _getWindowBasedBoardSize();

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: stacked layout, board fills card width
    const pad    = 14;
    const raw    = card.clientWidth - pad;
    const availW = isFinite(raw) && raw > 0 ? raw : 0;
    if (availW < 80) return Math.max(260, Math.min(window.innerWidth - 28, 520));
    return Math.max(260, Math.min(availW, 520));
  }

  // Desktop / tablet: board must fit inside card both W and H.
  // Guard against impossible values that can appear during layout transitions:
  // - clientWidth/Height = 0 (card not yet laid out)
  // - clientHeight > window.innerHeight (stale measurement from previous layout)
  const pad    = 20;
  const rawW   = card.clientWidth;
  const rawH   = card.clientHeight;

  // Sanity-clamp height: card can never legitimately exceed the viewport
  const maxCardH = window.innerHeight;
  const safeH    = (isFinite(rawH) && rawH > 0 && rawH <= maxCardH) ? rawH : 0;
  const safeW    = (isFinite(rawW) && rawW > 0)                      ? rawW : 0;

  const availW = Math.max(0, safeW - pad);
  const availH = Math.max(0, safeH - pad);

  // If card not laid out yet (either dimension < 80), use window-based fallback
  if (availW < 80 || availH < 80) return _getWindowBasedBoardSize();

  const size = Math.min(availW, availH, 720);

  // Final guard: result must be a finite positive number ≥ 240
  if (!isFinite(size) || size <= 0) return _getWindowBasedBoardSize();

  return Math.max(240, size);
}

/* =====================================================
   BOARD SIZE SYNC — applies computed size to board
   Safe to call any time; guards against bad layout state.

   CRITICAL: state._syncBoardBusy MUST be cleared in a
   finally block. If board.resize() ever throws (e.g., on
   a specific viewport size or board state), the flag would
   stay true forever — every subsequent call would silently
   bail, leaving the board frozen at the wrong size
   permanently. The try/finally below prevents this.
   ===================================================== */
function syncBoardSize() {
  if (!state.board) return;
  if (state._syncBoardBusy) return;               // re-entry guard

  const chessEl = document.getElementById('chessboard');
  if (!chessEl) return;

  const size = _computeBoardSize();

  // 1px threshold (was 2px) — applies resize whenever size has meaningfully
  // changed. Catches floating-point drift and subpixel mismatches.
  if (Math.abs(chessEl.offsetWidth - size) > 1) {
    state._syncBoardBusy = true;
    try {
      chessEl.style.width = size + 'px';
      // Force synchronous layout flush so chessboard.js reads the correct
      // width when board.resize() calls $(...).width() internally.
      void chessEl.offsetWidth;
      state.board.resize();
    } catch (e) {
      // board.resize() failed — log but never let it corrupt _syncBoardBusy
      if (typeof console !== 'undefined') console.warn('[Chess] board.resize() error:', e);
    } finally {
      // ALWAYS clear the flag, even if resize threw.
      state._syncBoardBusy = false;
    }
  }

  syncEvalBarHeight();
}

/* =====================================================
   EVAL BAR HEIGHT SYNC — matches eval bar to board
   ===================================================== */
function syncEvalBarHeight() {
  const chessEl = document.getElementById('chessboard');
  const evalBar = document.getElementById('evalBar');
  const evalCol = document.querySelector('.eval-bar-col');

  if (!evalBar || !chessEl) return;

  const boardH = chessEl.offsetHeight;
  if (boardH > 0) {
    evalBar.style.height = boardH + 'px';
  }

  // Align eval bar top edge with board top edge (card has centered board)
  if (evalCol) {
    const evalColTop = evalCol.getBoundingClientRect().top;
    const boardTop   = chessEl.getBoundingClientRect().top;
    const offset     = Math.max(0, Math.round(boardTop - evalColTop));
    evalCol.style.paddingTop = offset + 'px';
  }
}

/* =====================================================
   BOARD INIT
   ROOT-CAUSE FIX: chessboard.js reads container width
   at construction time. If width = 0, board renders at
   0px and is invisible. We MUST set an explicit width
   BEFORE calling Chessboard(), then use ResizeObserver
   for all subsequent size changes.
   ===================================================== */
function _initChessboard(fen) {
  const chessEl = document.getElementById('chessboard');

  // ── Step 1: Set explicit initial size BEFORE Chessboard() init ──
  // This is the root-cause fix. Without this, chessboard.js reads
  // offsetWidth = 0 and renders an invisible 0×0 board.
  const initialSize = _computeBoardSize();
  if (chessEl) {
    chessEl.style.width = (initialSize > 0 ? initialSize : 400) + 'px';
    // Force a synchronous layout flush so the browser computes the new
    // width immediately. chessboard.js calls $(...).width() right inside
    // Chessboard() — without this flush, it can still read 0 on some
    // real-device rendering paths (race between style-set and layout).
    void chessEl.offsetWidth;
  }

  // ── Step 2: Build and mount the board ──
  const cfg = {
    draggable:      true,
    position:       fen || 'start',
    orientation:    state.flipped ? 'black' : 'white',
    pieceTheme:     getPieceUrl,
    appearSpeed:    180,
    moveSpeed:      120,
    snapbackSpeed:  80,
    snapSpeed:      60,
    onDragStart:    onDragStart,
    onDrop:         onDrop,
    onSnapEnd:      onSnapEnd,
  };

  try {
    state.board = Chessboard('chessboard', cfg);
  } catch (e) {
    console.error('[Analysis] Chessboard() init error:', e);
    // Retry once after 300ms (handles race where jQuery/chessboard.js
    // wasn't fully ready despite script order)
    setTimeout(function() {
      try { state.board = Chessboard('chessboard', cfg); } catch (e2) { /* silent */ }
      if (state.board) { syncBoardSize(); _ensureBoardVisible(); }
    }, 300);
    return;
  }

  // ── Step 3: ResizeObserver on board-card for reactive sizing ──
  // Fires whenever the card changes size (window resize, font load,
  // panel toggle, orientation change). This replaces brittle timeouts.
  const card = document.querySelector('.board-card');
  if (card && window.ResizeObserver) {
    let _roTimer;
    const ro = new ResizeObserver(function() {
      // Debounce 80ms — prevents infinite loop: board.resize() → card reflow → observer fires again
      clearTimeout(_roTimer);
      _roTimer = setTimeout(function() {
        if (state.board) syncBoardSize();
      }, 80);
    });
    ro.observe(card);
    // Store reference for cleanup
    state._resizeObserver = ro;
  }

  // ── Step 4: Double-rAF correction pass ──
  // First rAF: browser recalculates layout after our width set.
  // Second rAF: browser has painted — all dimensions now accurate.
  requestAnimationFrame(function() {
    setLayoutVars();
    requestAnimationFrame(function() {
      syncBoardSize();
    });
  });

  // ── Step 5: Safety fallback (250ms covers font-load + sticky settle) ──
  setTimeout(function() { setLayoutVars(); syncBoardSize(); }, 250);

  // ── Step 6: Board visibility guard ──
  // Polls every 120ms for up to 3s. If the board rendered at 0×0 (race
  // condition between JS init and CSS grid layout), this forces a resize.
  // Stops as soon as the board is visibly rendered (offsetWidth > 50).
  _ensureBoardVisible();
}

/* =====================================================
   VISIBLE-RECT HELPER
   Computes the actual visible dimensions of an element by
   intersecting its bounding rect with every overflow:hidden
   ancestor up to <body>. Returns {width, height}.
   Unlike getBoundingClientRect() alone (which returns the
   element's OWN size even when clipped), this correctly
   returns 0 when a parent overflow:hidden collapses the
   visible area to nothing.
   ===================================================== */
function _getVisibleRect(el) {
  var r = el.getBoundingClientRect();
  var rect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  var node = el.parentElement;
  while (node && node !== document.documentElement) {
    var cs = window.getComputedStyle(node);
    var ov = cs.overflow + ' ' + cs.overflowX + ' ' + cs.overflowY;
    if (/hidden|clip/.test(ov)) {
      var nr = node.getBoundingClientRect();
      rect.left   = Math.max(rect.left,   nr.left);
      rect.top    = Math.max(rect.top,    nr.top);
      rect.right  = Math.min(rect.right,  nr.right);
      rect.bottom = Math.min(rect.bottom, nr.bottom);
    }
    node = node.parentElement;
  }
  return {
    width:  Math.max(0, rect.right  - rect.left),
    height: Math.max(0, rect.bottom - rect.top)
  };
}

/* =====================================================
   BOARD VISIBILITY GUARD — production reliability fix
   Handles two failure modes:
   1. chessboard.js initialized with 0×0 (CSS grid race)
   2. Board rendered correctly but clipped to 0 by an
      ancestor overflow:hidden whose height collapsed
      (detected via _getVisibleRect walking the DOM).
   Polls every 125ms for up to 5 seconds, then stops.
   ===================================================== */
function _ensureBoardVisible() {
  var MAX_ATTEMPTS = 40;   // 40 × 125ms = 5 seconds
  var INTERVAL_MS  = 125;
  var attempts     = 0;

  function check() {
    if (!state.board) return;

    var chessEl = document.getElementById('chessboard');
    if (!chessEl) return;

    // ── A: Force workspace-outer height if CSS calc collapsed it ──
    // This should never happen (calc is always > 200px on any real device)
    // but acts as an absolute last-resort safety net.
    var wo = document.getElementById('workspaceOuter');
    if (wo && window.innerWidth > 768 && wo.clientHeight < 150) {
      setLayoutVars();
      var navEl2    = document.getElementById('navbar');
      var topbarEl2 = document.getElementById('analysisTopbar');
      var navH2   = (navEl2    && navEl2.offsetHeight    > 0) ? navEl2.offsetHeight    : 68;
      var topbarH2= (topbarEl2 && topbarEl2.offsetHeight > 0) ? topbarEl2.offsetHeight : 56;
      wo.style.height = Math.max(400, window.innerHeight - navH2 - topbarH2) + 'px';
    }

    // ── B: Check actual visible area of the board element ──
    // _getVisibleRect() intersects with all overflow:hidden ancestors,
    // returning 0×0 if the board is clipped to invisible by any parent.
    var vis = _getVisibleRect(chessEl);
    if (vis.width > 100 && vis.height > 100) {
      // Board IS visible — ensure it's also the right size (not just
      // any non-zero size from CSS default). syncBoardSize() will
      // resize from e.g. 400px (CSS fallback) to the computed 640px.
      syncBoardSize();
      return;                                       // ✅ done
    }

    // ── C: Board is not visible — force-resize ──
    // Either the board element itself is 0×0 (chessboard.js init race)
    // or a parent overflow:hidden is clipping it.
    setLayoutVars();
    var size = _computeBoardSize();
    chessEl.style.width = size + 'px';
    void chessEl.offsetWidth;                       // sync layout flush
    if (state.board) {
      state.board.resize();
      syncEvalBarHeight();
    }

    attempts++;
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(check, INTERVAL_MS);
    }
    // After 5 seconds, stop polling gracefully.
    // Window resize listener will still correct on any user interaction.
  }

  // First check after 200ms — enough time for first paint + CSS grid layout.
  setTimeout(check, 200);
}

/* =====================================================
   BOARD SETUP ENTRY POINT
   ===================================================== */
function initBoard() {
  state.game = new Chess();

  // Measure navbar/topbar heights immediately (best-effort first pass)
  setLayoutVars();

  // Use double-rAF so the browser computes the full layout
  // (flexbox/grid heights, sticky positioning, font sizes)
  // BEFORE we read dimensions for board sizing.
  requestAnimationFrame(function() {
    setLayoutVars();                   // re-measure after first paint
    requestAnimationFrame(function() {
      setLayoutVars();                 // re-measure after second paint
      _initChessboard('start');        // NOW safe to init board
    });
  });

  // ── Window resize — debounced ──
  var _resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function() {
      setLayoutVars();
      syncBoardSize();
    }, 60);
  });

  // ── Scroll — update --nav-h after navbar transition (shrinks/grows on scroll) ──
  // The navbar changes height when the .scrolled class is added/removed.
  // We re-measure 300 ms after scroll stops (after the CSS transition completes).
  var _scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(_scrollTimer);
    _scrollTimer = setTimeout(setLayoutVars, 300);
  }, { passive: true });

  // ── Orientation change (mobile rotation) ──
  window.addEventListener('orientationchange', function() {
    // Wait for the browser to finish rotating before measuring
    setTimeout(function() {
      setLayoutVars();
      syncBoardSize();
    }, 350);
  });

  // ── Visibility change — re-sync when tab becomes active again ──
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && state.board) {
      setLayoutVars();
      syncBoardSize();
    }
  });

  // ── window.load — all resources (images, fonts) fully loaded ──
  // Fonts affect navbar height. Images affect layout. This is the final
  // reliable moment to correct the board size on slow connections.
  window.addEventListener('load', function() {
    setLayoutVars();
    syncBoardSize();
  });

  // ── Belt-and-suspenders: staggered re-sync after init ──
  // Real devices (especially mobile) can have slow/complex rendering
  // pipelines where the grid doesn't finalise until 500–2000ms after
  // DOMContentLoaded. These catches cover every known timing scenario.
  [500, 1000, 2000, 4000].forEach(function(ms) {
    setTimeout(function() {
      if (!state.board) return;
      setLayoutVars();
      syncBoardSize();
    }, ms);
  });
}

/* ---- Drag handlers ---- */
function onDragStart(source, piece) {
  if (state.boardEditorMode) return true; // allow any drag in editor mode

  if (state.game.game_over()) return false;

  // ── REPLAY TRAINING: strict board lock ──
  // Dragging is only allowed during the 'waiting' phase (user's guess turn).
  // Locking during auto_play / evaluating / feedback prevents two critical bugs:
  //   (a) user drags opponent's piece during the opponent's auto-play window
  //   (b) drop falls through to free-play handler which destroys state.gameMoves
  if (TS.active) {
    if (TS.phase !== 'waiting' && TS.phase !== 'retry') return false;          // board locked — not user's turn
    if (TS.side === 'w') return piece.search(/^w/) !== -1;  // only user's own colour
    return piece.search(/^b/) !== -1;
  }

  // Normal mode: only the side to move can drag
  if (state.game.turn() === 'w' && piece.search(/^b/) !== -1) return false;
  if (state.game.turn() === 'b' && piece.search(/^w/) !== -1) return false;
  return true;
}

function onDrop(source, target) {
  if (state.boardEditorMode) { return; }

  // ── REPLAY TRAINING intercept ──
  // ONLY process drops during the 'waiting' phase (user's guess turn).
  // All other phases (auto_play, evaluating, feedback) must hard-block here —
  // if we fall through to the free-play handler it calls state.gameMoves = []
  // which destroys the loaded PGN and breaks the rest of the training session.
  if (TS.active) {
    if (TS.phase === 'waiting' || TS.phase === 'retry') return _tsOnDrop(source, target);
    return 'snapback'; // hard block — protect game state at all costs
  }

  // Attempt chess.js move validation
  const moveObj = { from: source, to: target, promotion: 'q' };

  // ===== GUESS THE MOVE mode =====
  if (state.notationHidden && state.gameMoves.length > 0) {
    const expectedMove = state.gameMoves[state.currentMoveIdx];
    if (!expectedMove) {
      showToast('Game complete!', '');
      return 'snapback';
    }

    const isCorrect = (source === expectedMove.from && target === expectedMove.to);

    if (isCorrect) {
      const result = state.game.move(moveObj);
      if (!result) return 'snapback';
      state.currentMoveIdx++;
      showGuessResult('correct', '✓ Correct! Well done.');
      updateAll();
      return; // piece stays
    } else {
      showGuessResult('wrong', '✗ Try again!');
      return 'snapback';
    }
  }

  // ===== FREE PLAY / ANALYSIS mode =====
  const move = state.game.move(moveObj);

  if (move === null) return 'snapback'; // illegal

  // If we played a move in PGN replay mode, exit PGN mode
  if (state.gameMoves.length > 0) {
    state.gameMoves      = [];
    state.currentMoveIdx = 0;
  }

  updateAll();
}

function onSnapEnd() {
  if (!state.boardEditorMode && state.board && state.game) {
    state.board.position(state.game.fen());
  }
}

/* =====================================================
   BUTTON HANDLERS
   ===================================================== */
function bindControls() {

  // ---- Navigation ----
  document.getElementById('btnFirst').addEventListener('click', goFirst);
  document.getElementById('btnPrev').addEventListener('click', goPrev);
  document.getElementById('btnNext').addEventListener('click', goNext);
  document.getElementById('btnLast').addEventListener('click', goLast);

  // ---- Flip board ----
  document.getElementById('btnFlip').addEventListener('click', () => {
    state.flipped = !state.flipped;
    state.board.flip();
    setTimeout(syncBoardSize, 150);
  });

  // ---- Undo ----
  document.getElementById('btnUndo').addEventListener('click', goPrev);

  // ---- Reset ----
  document.getElementById('btnReset').addEventListener('click', () => {
    if (state.boardEditorMode) exitEditorMode();
    state.game           = new Chess();
    state.gameMoves      = [];
    state.currentMoveIdx = 0;
    state.engineLines    = [];
    state.board.start(false);
    resetEvalBar();
    const wrap = document.getElementById('engineLinesWrap');
    if (wrap) wrap.innerHTML = '<p class="engine-off-msg">Enable engine for analysis</p>';
    document.getElementById('engineDepthBadge').textContent = state.engineEnabled ? '—' : 'OFF';
    updateAll();
    showToast('Board reset to starting position', '');
  });

  // ---- Fullscreen ----
  document.getElementById('btnFullscreen').addEventListener('click', () => {
    const outer = document.getElementById('workspaceOuter');
    outer.classList.toggle('fullscreen');
    const icon = document.querySelector('#btnFullscreen i');
    icon.className = outer.classList.contains('fullscreen') ? 'fas fa-compress' : 'fas fa-expand';
    setTimeout(() => {
      setLayoutVars();
      syncBoardSize();
    }, 160);
  });

  // ---- Engine toggle ----
  document.getElementById('engineToggle').addEventListener('change', function() {
    state.engineEnabled = this.checked;
    const badge = document.getElementById('engineDepthBadge');
    const wrap  = document.getElementById('engineLinesWrap');
    const card  = document.getElementById('engineCard');

    if (state.engineEnabled) {
      card.classList.add('active');
      badge.textContent = '—';
      wrap.innerHTML    = '<p class="engine-off-msg">Calculating…</p>';
      if (!state.engine) {
        initEngine();
        setTimeout(analyzePosition, 900);
      } else {
        analyzePosition();
      }
    } else {
      card.classList.remove('active');
      stopEngine();
      badge.textContent = 'OFF';
      wrap.innerHTML    = '<p class="engine-off-msg">Enable engine for analysis</p>';
      state.engineLines = [];
      resetEvalBar();
    }
  });

  // ---- Hide/show notation ----
  document.getElementById('toggleNotationBtn').addEventListener('click', () => {
    state.notationHidden = !state.notationHidden;
    _syncNotationUI();
  });

  // ---- Train mode (now opens Replay Training setup) ----
  document.getElementById('btnTrainMode').addEventListener('click', () => {
    if (TS.active) {
      _tsEnd();
      return;
    }
    if (state.gameMoves.length === 0) {
      showToast('Load a master game first, then activate Replay Training!', 'error');
      return;
    }
    _tsOpenSetup();
  });

  // ---- Board Editor ----
  document.getElementById('btnEditorMode').addEventListener('click', () => {
    if (state.boardEditorMode) {
      exitEditorMode();
    } else {
      enterEditorMode();
    }
  });

  // ---- Editor: Clear board ----
  document.getElementById('btnEditorClearBoard').addEventListener('click', () => {
    if (!state.boardEditorMode) return;
    state.board.position({}, false);
    showToast('Board cleared', '');
  });

  // ---- Editor: Starting position ----
  document.getElementById('btnEditorStartPos').addEventListener('click', () => {
    if (!state.boardEditorMode) return;
    state.board.start(false);
    showToast('Starting position loaded', '');
  });

  // ---- Editor: Done → open Position Setup Modal ----
  document.getElementById('btnEditorDone').addEventListener('click', openPositionSetupModal);

  // ---- FEN import button ----
  document.getElementById('btnImportFEN').addEventListener('click', () => openModal('fenModal'));

  // ---- PGN import button ----
  document.getElementById('btnImportPGN').addEventListener('click', () => openModal('pgnModal'));

  // ---- Load FEN ----
  document.getElementById('btnLoadFEN').addEventListener('click', () => {
    const fen = document.getElementById('fenInput').value.trim();
    if (!fen) { showToast('Please paste a FEN string.', 'error'); return; }
    if (loadFEN(fen)) {
      closeModal('fenModal');
      document.getElementById('fenInput').value = '';
      showToast('Position loaded!', 'success');
    }
  });

  // ---- Copy current FEN ----
  document.getElementById('btnCopyFEN').addEventListener('click', () => {
    const fen = state.game.fen();
    navigator.clipboard.writeText(fen).then(() => {
      showToast('FEN copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Copy failed — please copy manually.', 'error');
    });
  });

  // ---- Copy PGN ----
  document.getElementById('btnCopyPGN').addEventListener('click', () => {
    let text;
    if (state.gameMoves.length > 0) {
      const tmp = new Chess();
      state.gameMoves.forEach(m => tmp.move(m));
      text = tmp.pgn();
    } else {
      text = state.game.pgn() || state.game.fen();
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('PGN copied!', 'success');
    }).catch(() => {
      showToast('Copy failed — please copy manually.', 'error');
    });
  });

  // ---- Modal close handlers ----
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });

  document.querySelectorAll('.analysis-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal(this.id);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.analysis-modal-overlay.open')
        .forEach(m => m.classList.remove('open'));
    }
  });
}

/** Helper — sync notation card UI to state.notationHidden */
function _syncNotationUI() {
  const scroll = document.getElementById('moveListScroll');
  const hint   = document.getElementById('guessHint');
  const btn    = document.getElementById('toggleNotationBtn');

  scroll.style.display = state.notationHidden ? 'none' : '';
  hint.style.display   = state.notationHidden ? 'block' : 'none';
  btn.innerHTML = state.notationHidden
    ? '<i class="fas fa-eye"></i> Show'
    : '<i class="fas fa-eye-slash"></i> Hide';
  btn.classList.toggle('hidden-active', state.notationHidden);
}

/* =====================================================
   KEYBOARD SHORTCUTS
   ===================================================== */
function bindKeyboard() {
  document.addEventListener('keydown', function(e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goNext();
        break;
      case 'Home':
        e.preventDefault();
        goFirst();
        break;
      case 'End':
        e.preventDefault();
        goLast();
        break;
      case 'f':
      case 'F':
        state.flipped = !state.flipped;
        state.board.flip();
        break;
    }
  });
}

/* =====================================================
   ██████╗ ███████╗██████╗ ██╗      █████╗ ██╗   ██╗
   REPLAY TRAINING SYSTEM — ChessBase-style engine scoring
   =====================================================

   ARCHITECTURE:
   TS  = Training Session singleton (all mutable state)
   TS.engineMode: 'analysis' | 'train_pre' | 'train_post'
     • train_pre  = engine analyzes BEFORE user move → gets preEval + bestMove
     • train_post = engine analyzes AFTER  user move → gets postEval

   SCORING (engine-quality based, NOT exact-match-only):
     cpLoss = preEval(player) - postEval(player)   [centipawns]
     • cpLoss ≤ 0   → Excellent (no loss, often better than game!)
     • cpLoss ≤ 10  → Excellent
     • cpLoss ≤ 30  → Good
     • cpLoss ≤ 60  → Inaccuracy
     • cpLoss ≤ 120 → Mistake
     • cpLoss > 120 → Blunder
   ===================================================== */

/* ---- Replay speed configuration ---- */
const TS_SPEEDS = { fast: 800, normal: 1800, slow: 3000 };
const TS_SPEED_KEY = 'ts_replay_speed'; // localStorage key

function _tsGetDelay() {
  const saved = localStorage.getItem(TS_SPEED_KEY) || 'normal';
  return TS_SPEEDS[saved] || TS_SPEEDS.normal;
}

function _tsSetSpeed(speedName) {
  if (!TS_SPEEDS[speedName]) return;
  localStorage.setItem(TS_SPEED_KEY, speedName);
  // Update active button highlight
  document.querySelectorAll('.tp-speed-btn').forEach(btn => {
    btn.classList.toggle('tp-speed-active', btn.dataset.speed === speedName);
  });
}

function _tsInitSpeedBtns() {
  const saved = localStorage.getItem(TS_SPEED_KEY) || 'normal';
  document.querySelectorAll('.tp-speed-btn').forEach(btn => {
    btn.classList.toggle('tp-speed-active', btn.dataset.speed === saved);
    btn.addEventListener('click', () => _tsSetSpeed(btn.dataset.speed));
  });
}

/* ---- Training Session State ---- */
const TS = {
  active:         false,
  side:           null,       // 'w' | 'b'
  whiteName:      '',
  blackName:      '',
  phase:          'idle',     // idle|waiting|evaluating|feedback|auto_play|complete

  // Engine mode for routing in handleEngineMessage
  engineMode:     'analysis', // 'analysis'|'train_pre'|'train_post'

  // Pre-move engine data (before user moves)
  preEval:        0,          // centipawns from player's perspective
  preIsMate:      false,
  preEvalReady:   false,
  engineBestUCI:  null,
  engineBestSAN:  null,

  // Post-move engine data (after user moves)
  postEval:       0,          // centipawns from player's perspective
  postIsMate:     false,

  // Current move data
  userMoveSAN:    null,
  gameMoveSAN:    null,
  gameMoveObj:    null,       // verbose move object from gameMoves
  isExactMatch:   false,

  // Running stats
  results:        [],         // [{moveNum, userSAN, gameSAN, engineSAN, cpLoss, quality, label, points, color}]
  totalPoints:    0,
  maxPoints:      0,
  totalCpLoss:    0,
  counts:         { exact:0, excellent:0, good:0, inaccuracy:0, mistake:0, blunder:0 },

  // Hint system
  hintLevel:      0,          // 0=none, 1=piece type, 2=from-square, 3=full move revealed
  hintPenalty:    0,          // penalty points for current move's hints
};

/* =====================================================
   SETUP MODAL
   ===================================================== */
function _tsOpenSetup() {
  // Populate modal with game info
  const firstMove   = state.gameMoves[0];
  const tempParse   = new Chess();
  state.gameMoves.forEach(m => tempParse.move(m));
  const header      = tempParse.header();
  const whiteName   = header.White  || 'White';
  const blackName   = header.Black  || 'Black';
  const eventName   = header.Event  || 'Loaded Game';
  const dateStr     = header.Date   ? ' · ' + header.Date.split('.')[0] : '';

  TS.whiteName = whiteName;
  TS.blackName = blackName;

  const gameCard    = document.getElementById('tsmGameCard');
  const gamePlayers = document.getElementById('tsmGamePlayers');
  const gameEvent   = document.getElementById('tsmGameEvent');
  if (gameCard)    gameCard.style.display    = '';
  if (gamePlayers) gamePlayers.textContent   = `${whiteName}  vs  ${blackName}`;
  if (gameEvent)   gameEvent.textContent     = eventName + dateStr;

  const wPl = document.getElementById('tsmWhitePlayer');
  const bPl = document.getElementById('tsmBlackPlayer');
  if (wPl) wPl.textContent = whiteName;
  if (bPl) bPl.textContent = blackName;

  openModal('trainSetupModal');
}

/* =====================================================
   START SESSION
   ===================================================== */
function _tsStart(side) {
  closeModal('trainSetupModal');

  // Init TS state
  TS.active        = true;
  TS.side          = side;
  TS.phase         = 'idle';
  TS.results       = [];
  TS.totalPoints   = 0;
  TS.maxPoints     = 0;
  TS.totalCpLoss   = 0;
  TS.counts        = { exact:0, excellent:0, good:0, inaccuracy:0, mistake:0, blunder:0 };
  TS.hintLevel     = 0;
  TS.hintPenalty   = 0;
  TS.preEvalReady      = false;
  TS.engineBestUCI     = null;
  TS.engineBestSAN     = null;
  TS.engineMode        = 'analysis';
  TS._postEvalPending  = false;
  TS._revealedMode     = false;
  TS.preFen            = null;   // FEN snapshot at pre-eval time (for safe SAN conversion)
  TS.retryCount           = 0;   // bad-move attempts on current user turn
  TS.maxRetries           = 2;   // after this, force show answer
  TS.retryPenalty         = 0;   // score hit from retries on this move
  TS._lastCpLoss          = 0;   // last evaluated cpLoss (for "Show Answer" path)
  TS._lastCls             = null;// last classification
  TS._retryRevealRecorded = false; // prevents double-recording when revealed from retry
  TS._autoContTimer       = null;  // timer handle for auto-continue on good moves
  TS._pendingRevealPlay   = null;  // { needUndo } when reveal-play timer is active

  // Stop regular engine (training uses engine internally)
  if (state.engineEnabled) {
    stopEngine();
  }
  // Always ensure engine is loaded for training
  if (!state.engine) {
    initEngine();
  }

  // Reset game to start
  goFirst();

  // Show training panel, hide normal panel
  document.getElementById('rpNormalWrap').style.display  = 'none';
  document.getElementById('rpTrainingWrap').style.display = '';

  // Update topbar train button
  const btn = document.getElementById('btnTrainMode');
  if (btn) {
    btn.innerHTML    = '<i class="fas fa-times"></i> Exit Training';
    btn.classList.add('train-active');
  }

  // Update side display
  _tsUpdateSideBadge();

  // Hide comparison, show waiting
  _tsShowPhase('waiting_pre'); // waiting for pre-eval

  // Start the first move sequence
  setTimeout(_tsNextMove, 300);

  showToast('🎯 Replay Training started! Guess moves as ' + (side === 'w' ? 'White' : 'Black'), 'success');
}

/* =====================================================
   MOVE SEQUENCER — called after every completed move
   ===================================================== */
function _tsNextMove() {
  // Check if game is over or all moves exhausted
  if (state.game.game_over() || state.currentMoveIdx >= state.gameMoves.length) {
    _tsComplete();
    return;
  }

  const currentTurn = state.game.turn(); // 'w' or 'b'

  if (currentTurn !== TS.side) {
    // Opponent's turn — auto-play from PGN
    _tsAutoPlayOpponent();
  } else {
    // User's turn — set up for guessing
    _tsSetupUserTurn();
  }
}

/* =====================================================
   USER TURN SETUP — run pre-eval, wait for drop
   ===================================================== */
function _tsSetupUserTurn() {
  TS.phase         = 'waiting';
  TS.hintLevel     = 0;
  TS.hintPenalty   = 0;
  TS.preEvalReady  = false;
  TS.engineBestUCI = null;
  TS.engineBestSAN = null;
  TS.retryCount    = 0;
  TS.retryPenalty  = 0;

  // Store game move for this position
  const gm = state.gameMoves[state.currentMoveIdx];
  TS.gameMoveObj = gm;
  const tmpG = new Chess(state.game.fen());
  const gmResult = tmpG.move(gm);
  TS.gameMoveSAN = gmResult ? gmResult.san : (gm.san || '?');

  // Show waiting UI
  _tsShowPhase('waiting');

  // Clear hint UI
  const hintArea = document.getElementById('tpHintReveal');
  const hintText = document.getElementById('tpHintText');
  if (hintArea) hintArea.style.display = 'none';
  if (hintText) hintText.textContent   = '';
  _tsClearSquareHints();

  // Reset "Show Move" button text (may have been "Show Answer" during retry)
  const revBtn = document.getElementById('btnTpReveal');
  if (revBtn) revBtn.innerHTML = '<i class="fas fa-eye"></i> Show Move';

  // Hide Retry & Continue, show Hint & Reveal
  _tsSetActionBtns({ hint:true, reveal:true, retry:false, continue:false });

  // Run pre-evaluation
  _tsRunPreEval();
}

/* =====================================================
   AUTO-PLAY OPPONENT MOVE
   Sequence:
     0 ms  — show panel text  "Black plays e5"
   250 ms  — animate piece on board (chessboard.js smooth slide)
   350 ms  — flash destination square (indigo glow)
   850 ms  — call _tsNextMove for user's next turn
   ===================================================== */
function _tsAutoPlayOpponent() {
  TS.phase = 'auto_play';

  const oppMove = state.gameMoves[state.currentMoveIdx];
  if (!oppMove) { _tsNextMove(); return; }

  // Preview the SAN before applying (need original FEN)
  const tmpG      = new Chess(state.game.fen());
  const oppResult = tmpG.move(oppMove);
  const oppSAN    = oppResult ? oppResult.san : '?';
  const oppColor  = TS.side === 'w' ? 'Black' : 'White';

  // ── Step 1: Show "Black plays e5" indicator immediately ──
  _tsShowPhase('auto_play');
  const autoText = document.getElementById('tpAutoPlayText');
  if (autoText) autoText.textContent = `${oppColor} plays ${oppSAN}`;

  // Capture destination for flash (before move is applied)
  const destSquare = oppMove.to;

  // ── Step 2 (250 ms): apply to chess.js + animate board ──
  setTimeout(() => {
    state.game.move(oppMove);
    state.currentMoveIdx++;

    // Smooth piece slide (chessboard.js built-in animation ~300 ms)
    state.board.position(state.game.fen(), true);
    updateSideIndicator();
    updateBoardStatus();
    renderMoveList();

    // ── Step 3 (350 ms after board update): flash destination square ──
    setTimeout(() => _tsFlashOpponentSquare(destSquare), 100);

    // ── Step 4 (600 ms after board update): proceed to next move ──
    setTimeout(_tsNextMove, 600);

  }, 250);
}

/* Flash the opponent's landing square with a short indigo glow.
   Uses the same square-55d63 convention chessboard.js uses. */
function _tsFlashOpponentSquare(square) {
  const sq = document.querySelector(`.square-55d63[data-square="${square}"]`);
  if (!sq) return;
  sq.classList.add('ts-opp-flash');
  setTimeout(() => sq.classList.remove('ts-opp-flash'), 750);
}

/* =====================================================
   USER DROP HANDLER (called from onDrop when TS.active)
   ===================================================== */
function _tsOnDrop(source, target) {
  // Must be user's colour
  if (state.game.turn() !== TS.side) return 'snapback';

  // Try the move
  const tmpG     = new Chess(state.game.fen());
  const tryMove  = tmpG.move({ from: source, to: target, promotion: 'q' });
  if (!tryMove) return 'snapback'; // illegal

  TS.userMoveSAN = tryMove.san;
  TS.isExactMatch = (TS.gameMoveObj &&
    source === TS.gameMoveObj.from &&
    target === TS.gameMoveObj.to);

  // Apply move to main chess.js
  state.game.move({ from: source, to: target, promotion: 'q' });
  state.currentMoveIdx++;
  state.board.position(state.game.fen(), false);

  TS.phase = 'evaluating';
  _tsShowPhase('evaluating');
  _tsClearSquareHints();

  // If pre-eval already done, run post immediately; else queue it
  if (TS.preEvalReady) {
    _tsRunPostEval();
  } else {
    // Pre-eval still running — wait for it (engine will call _tsRunPostEval when done)
    TS._postEvalPending = true;
  }

  return; // don't snapback — move accepted
}

/* =====================================================
   ENGINE: PRE-EVAL (position BEFORE user move)
   ===================================================== */
function _tsRunPreEval() {
  if (!state.engineReady) {
    setTimeout(_tsRunPreEval, 300);
    return;
  }
  TS.engineMode = 'train_pre';
  TS.preEval    = 0;
  TS.preIsMate  = false;
  // Snapshot the FEN NOW so SAN conversion uses the right position
  // even if the user moves before the engine finishes responding.
  TS.preFen = state.game.fen();
  state.engine.postMessage('stop');
  state.engine.postMessage('position fen ' + TS.preFen);
  state.engine.postMessage('go depth 18');
}

/* =====================================================
   ENGINE: POST-EVAL (position AFTER user move)
   ===================================================== */
function _tsRunPostEval() {
  if (!state.engineReady) {
    setTimeout(_tsRunPostEval, 300);
    return;
  }
  TS.engineMode  = 'train_post';
  TS.postEval    = 0;
  TS.postIsMate  = false;
  state.engine.postMessage('stop');
  state.engine.postMessage('position fen ' + state.game.fen()); // after user's move
  state.engine.postMessage('go depth 16');
}

/* =====================================================
   ENGINE MESSAGE HANDLER (training-specific routing)
   ===================================================== */
function _tsHandleEngineMsg(line) {
  // Parse score from info lines
  if (line.startsWith('info') && line.includes('score') && line.includes(' pv ')) {
    const depthM  = line.match(/depth (\d+)/);
    const cpM     = line.match(/score cp (-?\d+)/);
    const mateM   = line.match(/score mate (-?\d+)/);
    const pvM     = line.match(/ pv (\S+)/);   // first UCI move only

    if (!depthM) return;
    const depth = parseInt(depthM[1]);
    if (depth < 8) return; // ignore shallow depths for accuracy

    let rawScore, isMate = false;
    if (mateM)    { isMate = true; rawScore = parseInt(mateM[1]); }
    else if (cpM) { rawScore = parseInt(cpM[1]); }
    else return;

    // ── Stockfish always reports score from the SIDE-TO-MOVE's perspective ──
    //
    // Pre-eval:  we sent a position where IT IS THE PLAYER'S TURN.
    //   rawScore > 0 → good for the player.  No adjustment needed.
    //   preEval = rawScore (player's advantage before their move).
    //
    // Post-eval: we sent a position where IT IS THE OPPONENT'S TURN (after player moved).
    //   rawScore > 0 → good for the opponent = BAD for the player.
    //   postEval = -rawScore (player's advantage after their move).
    //
    // Crucially we do NOT read state.game.turn() here — by the time the engine
    // responds that value may have been changed by the user's drop, causing both
    // scores to be flipped in the same direction and the cpLoss to vanish to zero.

    if (TS.engineMode === 'train_pre') {
      TS.preEval   = rawScore;   // player is to move; positive = player has advantage
      TS.preIsMate = isMate;
      if (pvM) TS.engineBestUCI = pvM[1];
    } else if (TS.engineMode === 'train_post') {
      TS.postEval  = -rawScore;  // opponent is to move; negate so positive still = player good
      TS.postIsMate = isMate;
    }
  }

  if (line.startsWith('bestmove')) {
    const bm = line.split(' ')[1];

    if (TS.engineMode === 'train_pre') {
      // Store engine's best move
      TS.engineBestUCI = bm;
      if (bm && bm !== '(none)' && bm.length >= 4) {
        // Convert UCI → SAN using the FEN snapshot taken at pre-eval time.
        // TS.preFen is always the correct pre-move position regardless of
        // whether the user has already dropped a piece (state.game.fen() would
        // be wrong in that case, and reconstructing from state.gameMoves is
        // also wrong because the user may have played a different move).
        const tmpConv = new Chess(TS.preFen || state.game.fen());
        const mv = tmpConv.move({ from: bm.slice(0,2), to: bm.slice(2,4), promotion: bm[4] || undefined });
        TS.engineBestSAN = mv ? mv.san : bm;
      } else {
        TS.engineBestSAN = '—';
      }

      TS.preEvalReady = true;
      TS.engineMode   = 'analysis';

      // If user already moved while pre-eval was running, fire post-eval now
      if (TS._postEvalPending) {
        TS._postEvalPending = false;
        _tsRunPostEval();
      }

    } else if (TS.engineMode === 'train_post') {
      TS.engineMode = 'analysis';
      _tsCompleteEvaluation();
    }
  }
}

/* =====================================================
   COMPLETE EVALUATION — score the move
   ===================================================== */
function _tsCompleteEvaluation() {
  // ── Calculate centipawn loss ──
  let cpLoss = 0;

  if (TS.isExactMatch) {
    cpLoss = 0;
  } else if (TS.preIsMate && !TS.postIsMate) {
    cpLoss = 1500;
  } else if (!TS.preIsMate && TS.postIsMate) {
    cpLoss = -50;
  } else if (TS.preIsMate && TS.postIsMate) {
    cpLoss = TS.preEval > TS.postEval ? 0 : 200;
  } else {
    cpLoss = Math.max(0, TS.preEval - TS.postEval);
  }
  cpLoss = Math.round(Math.min(cpLoss, 1500));

  // ── Classify ──
  const cls = _tsClassify(cpLoss, TS.isExactMatch);

  // ── Retry path: Mistake or Blunder within retry limit ──
  const requiresRetry = (cls.quality === 'mistake' || cls.quality === 'blunder');
  if (requiresRetry && TS.retryCount < TS.maxRetries) {
    _tsHandleRetry(cpLoss, cls);
    return; // don't record result yet — player may improve
  }

  // ── Apply all penalties ──
  const basePts  = Math.max(0, cls.points - TS.hintPenalty);
  const finalPts = Math.max(0, basePts - TS.retryPenalty);

  // ── Store result ──
  const moveNum = Math.ceil(state.currentMoveIdx / 2);
  TS.results.push({
    moveNum,
    userSAN:   TS.userMoveSAN,
    gameSAN:   TS.gameMoveSAN,
    engineSAN: TS.engineBestSAN || '—',
    cpLoss,
    quality:   cls.quality,
    label:     cls.label,
    points:    finalPts,
    color:     cls.color,
  });

  TS.totalPoints  += finalPts;
  TS.maxPoints    += 100;
  TS.totalCpLoss  += cpLoss;
  TS.counts[cls.quality] = (TS.counts[cls.quality] || 0) + 1;

  // ── Show feedback ──
  _tsShowComparison(cpLoss, cls, finalPts);
  _tsUpdateLiveStats();
  _tsUpdateQualityStrip();

  TS.phase = 'feedback';
  _tsSetActionBtns({ hint:false, reveal:false, retry:false, continue:true });

  // ── Auto-continue or auto-reveal-play ──
  if (!requiresRetry) {
    // Good move (Excellent/Good/Inaccuracy) — auto-continue normally
    _tsStartAutoContTimer();
  } else {
    // Retries exhausted — board has player's wrong move on it.
    // Reveal answer, then undo wrong move + play actual game move automatically.
    _tsStartRevealPlayTimer(true); // needUndo = true
  }
}

/* =====================================================
   AUTO-CONTINUE TIMER
   For Excellent / Good / Inaccuracy moves: show feedback briefly,
   then continue automatically — no manual click needed.
   The Continue button shows a progress bar counting down.
   ===================================================== */
function _tsStartAutoContTimer() {
  const DELAY = _tsGetDelay(); // ms — reads user's saved speed preference

  // Clear any previous timer (safety)
  if (TS._autoContTimer) {
    clearTimeout(TS._autoContTimer);
    TS._autoContTimer = null;
  }

  // Animate the Continue button as a progress bar (duration matches delay)
  const contBtn = document.getElementById('btnTpContinue');
  if (contBtn) {
    contBtn.style.setProperty('--tp-auto-dur', DELAY + 'ms');
    contBtn.classList.add('tp-auto-cont');
    contBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next move…';
  }

  TS._autoContTimer = setTimeout(function () {
    TS._autoContTimer = null;
    if (contBtn) contBtn.classList.remove('tp-auto-cont');
    _tsContinue();
  }, DELAY);
}

/* =====================================================
   REVEAL-PLAY TIMER
   Used when the answer must be shown and the game move auto-played:
     • Max retries exhausted (needUndo=true  — wrong move still on board)
     • "Show Answer" clicked during retry   (needUndo=false — board already clean)
   Shows a countdown on the Continue button; player can click to skip.
   ===================================================== */
function _tsStartRevealPlayTimer(needUndo) {
  // At least 2.5 s so the player can actually read the comparison card
  const DELAY = Math.max(_tsGetDelay(), 2500);

  if (TS._autoContTimer) { clearTimeout(TS._autoContTimer); TS._autoContTimer = null; }
  TS._pendingRevealPlay = { needUndo: needUndo };

  const contBtn = document.getElementById('btnTpContinue');
  if (contBtn) {
    contBtn.style.setProperty('--tp-auto-dur', DELAY + 'ms');
    contBtn.classList.add('tp-auto-cont');
    contBtn.innerHTML = '<i class="fas fa-chess-king"></i> Playing answer…';
    contBtn.style.display = '';
  }
  const actions = document.getElementById('tpActions');
  if (actions) actions.style.display = '';

  TS._autoContTimer = setTimeout(function () {
    TS._autoContTimer = null;
    if (contBtn) contBtn.classList.remove('tp-auto-cont');
    const action = TS._pendingRevealPlay;
    TS._pendingRevealPlay = null;
    _tsPlayGameMoveAndContinue(action ? action.needUndo : false);
  }, DELAY);
}

/* =====================================================
   PLAY GAME MOVE AND CONTINUE
   Undoes wrong move if needed, then animates the actual PGN
   game move on the board and calls _tsNextMove.
   ===================================================== */
function _tsPlayGameMoveAndContinue(needUndo) {
  TS.phase = 'auto_play';
  _tsClearSquareHints();

  // Undo the player's wrong move when called from max-retry path
  if (needUndo) {
    state.game.undo();
    state.currentMoveIdx--;
  }

  const gm = TS.gameMoveObj;
  if (!gm) { setTimeout(_tsNextMove, 300); return; }

  // Show "Game: Nf3" in the auto-play indicator so player knows what's happening
  _tsShowPhase('auto_play');
  const autoText = document.getElementById('tpAutoPlayText');
  if (autoText) autoText.textContent = `Game: ${TS.gameMoveSAN}`;

  const destSquare = gm.to;
  setTimeout(function () {
    state.game.move(gm);
    state.currentMoveIdx++;
    state.board.position(state.game.fen(), true); // animated slide
    updateSideIndicator();
    updateBoardStatus();
    renderMoveList();
    setTimeout(function () { _tsFlashOpponentSquare(destSquare); }, 100);
    setTimeout(_tsNextMove, 600);
  }, 300);
}

/* =====================================================
   RETRY HANDLER — undo bad move, show retry prompt
   Called when player plays Mistake/Blunder within retry limit.
   ===================================================== */
function _tsHandleRetry(cpLoss, cls) {
  TS.retryCount++;
  const penaltyPerRetry = cls.quality === 'blunder' ? 30 : 20;
  TS.retryPenalty += penaltyPerRetry;

  // Save for "Show Answer" path
  TS._lastCpLoss = cpLoss;
  TS._lastCls    = cls;

  // Undo the bad move — restore board to pre-move state
  state.game.undo();
  state.currentMoveIdx--;
  state.board.position(state.game.fen(), false);
  updateAll();

  // Switch to retry phase (allows drag/drop)
  TS.phase = 'retry';
  _tsShowRetryPrompt();
}

/* =====================================================
   SHOW RETRY PROMPT — encouraging message, no answer revealed
   ===================================================== */
function _tsShowRetryPrompt() {
  // Hide all other panels, show retry panel
  ['tpComparison','tpWaiting','tpEvaluating','tpAutoPlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const retryDiv = document.getElementById('tpRetryPrompt');
  const actions  = document.getElementById('tpActions');
  if (retryDiv) retryDiv.style.display = '';
  if (actions)  actions.style.display  = '';

  // Message content
  const title = document.getElementById('tpRetryTitle');
  const sub   = document.getElementById('tpRetrySub');
  const dots  = document.getElementById('tpRetryDots');
  const triesLeft   = TS.maxRetries - TS.retryCount;
  const isBlunder   = TS._lastCls && TS._lastCls.quality === 'blunder';

  const titleOptions = [
    'There\'s a stronger move here!',
    'Keep thinking — you can find it!',
  ];
  const subOptions = isBlunder ? [
    'That move seriously damages the position. Look harder for a better option!',
    'The engine sees a much stronger continuation. One more try!',
  ] : [
    'That move weakens your position. There\'s a better continuation available.',
    'Consider your opponent\'s threats and your piece activity.',
  ];

  const idx = Math.min(TS.retryCount - 1, titleOptions.length - 1);
  if (title) title.textContent = titleOptions[idx];
  if (sub) {
    const s = subOptions[Math.min(TS.retryCount - 1, subOptions.length - 1)];
    sub.textContent = triesLeft > 0
      ? s + ` (${triesLeft} tr${triesLeft === 1 ? 'y' : 'ies'} remaining)`
      : s;
  }

  // Attempt indicator dots
  if (dots) {
    dots.innerHTML = '';
    for (let i = 0; i < TS.maxRetries; i++) {
      const dot = document.createElement('span');
      dot.className = 'tp-retry-dot' + (i < TS.retryCount ? ' tp-retry-dot-used' : '');
      dots.appendChild(dot);
    }
  }

  // Buttons: Hint + Show Answer; hide Continue/Retry
  const hintBtn = document.getElementById('btnTpHint');
  const revBtn  = document.getElementById('btnTpReveal');
  const retBtn  = document.getElementById('btnTpRetry');
  const contBtn = document.getElementById('btnTpContinue');

  if (hintBtn) { hintBtn.style.display = '';     hintBtn.disabled = false; hintBtn.style.opacity = ''; }
  if (revBtn)  { revBtn.style.display  = '';     revBtn.disabled  = false; revBtn.style.opacity  = '';
                 revBtn.innerHTML = '<i class="fas fa-eye"></i> Show Answer'; }
  if (retBtn)  retBtn.style.display  = 'none';
  if (contBtn) contBtn.style.display = 'none';
}

/* =====================================================
   FORCE REVEAL FROM RETRY — "Show Answer" clicked during retry
   Records 0-pt result, shows comparison, sets up Continue.
   ===================================================== */
function _tsForceRevealFromRetry() {
  const cpLoss  = TS._lastCpLoss || 0;
  const cls     = TS._lastCls    || _tsClassify(cpLoss, false);
  const finalPts = 0; // gave up = 0 points

  // Record result now so live stats update immediately
  TS.results.push({
    moveNum:   Math.ceil((state.currentMoveIdx + 1) / 2),
    userSAN:   '— (revealed)',
    gameSAN:   TS.gameMoveSAN,
    engineSAN: TS.engineBestSAN || '—',
    cpLoss,
    quality:   cls.quality,
    label:     '🔍 Revealed',
    points:    finalPts,
    color:     '#6b7280',
  });
  TS.totalPoints  += finalPts;
  TS.maxPoints    += 100;
  TS.totalCpLoss  += cpLoss;
  TS.counts[cls.quality] = (TS.counts[cls.quality] || 0) + 1;

  _tsUpdateLiveStats();
  _tsUpdateQualityStrip();

  // Show comparison card
  _tsShowComparison(cpLoss, cls, finalPts);

  // Highlight game move on board
  const gm = TS.gameMoveObj;
  if (gm) {
    _tsClearSquareHints();
    const sqFrom = document.querySelector(`.square-55d63[data-square="${gm.from}"]`);
    const sqTo   = document.querySelector(`.square-55d63[data-square="${gm.to}"]`);
    if (sqFrom) sqFrom.classList.add('sq-hint-from');
    if (sqTo)   sqTo.classList.add('sq-hint-to');
  }

  TS.phase = 'feedback';
  _tsSetActionBtns({ hint:false, reveal:false, retry:false, continue:true });

  // Board is at the pre-move position (undo already happened in _tsHandleRetry).
  // Start the reveal-play timer: show comparison for a moment, then animate
  // the actual game move onto the board automatically (needUndo = false).
  _tsStartRevealPlayTimer(false);
}

/* =====================================================
   MOVE CLASSIFICATION (engine-quality scoring)
   ===================================================== */
function _tsClassify(cpLoss, isExactMatch) {
  if (isExactMatch)   return { quality:'exact',      label:'⭐ Exact Match!',    points:100, color:'#f59e0b' };
  if (cpLoss <= 0)    return { quality:'excellent',  label:'✓ Excellent!',       points:100, color:'#22c55e' };
  if (cpLoss <= 30)   return { quality:'excellent',  label:'✓ Excellent',        points: 95, color:'#22c55e' };
  if (cpLoss <= 80)   return { quality:'good',       label:'✓ Good Move',        points: 80, color:'#86efac' };
  if (cpLoss <= 150)  return { quality:'inaccuracy', label:'?! Inaccuracy',      points: 55, color:'#fb923c' };
  if (cpLoss <= 300)  return { quality:'mistake',    label:'? Mistake',          points: 20, color:'#f97316' };
  return                     { quality:'blunder',    label:'?? Blunder',         points:  0, color:'#dc2626' };
}

/* =====================================================
   FEEDBACK TEXT (rich commentary based on context)
   ===================================================== */
function _tsFeedbackText(cpLoss, cls, isExact, engineSAN, gameSAN, userSAN) {
  const sameAsEngine = engineSAN && engineSAN === userSAN;

  const preStr  = TS.preIsMate  ? 'M' + Math.abs(TS.preEval)
    : (TS.preEval  >= 0 ? '+' : '') + (TS.preEval  / 100).toFixed(2);
  const postStr = TS.postIsMate ? 'M' + Math.abs(TS.postEval)
    : (TS.postEval >= 0 ? '+' : '') + (TS.postEval / 100).toFixed(2);
  const evalChange = `(eval: ${preStr} → ${postStr})`;

  if (isExact && sameAsEngine) return `Perfect — you found both the game move and the engine's top choice! ${evalChange}`;
  if (isExact)    return `You matched the master's move. Well played! ${evalChange}`;
  if (cpLoss <= 0 && sameAsEngine) return `Even stronger than the game! The engine agrees — your move is best here. ${evalChange}`;
  if (cpLoss <= 0)  return `Your move is at least as strong as the game move — no disadvantage. ${evalChange}`;
  if (cpLoss <= 30) return `Excellent choice! Only ${cpLoss}cp difference — practically equivalent to the game move. ${evalChange}`;
  if (cpLoss <= 80) return `Good move! The game's ${gameSAN} was slightly better by ${cpLoss}cp, but yours is solid. ${evalChange}`;
  if (cpLoss <= 150) return `Inaccuracy — ${gameSAN} keeps a clearer advantage. Your move cost ${cpLoss}cp, but the game continues. ${evalChange}`;
  if (cpLoss <= 300) return `Mistake — this weakens the position (${cpLoss}cp lost). You needed ${TS.retryCount} attempt(s). The game played ${gameSAN}. ${evalChange}`;
  return `Blunder — this severely damages the position (${cpLoss}cp lost). You needed ${TS.retryCount} attempt(s). Study what ${gameSAN} accomplished. ${evalChange}`;
}

/* =====================================================
   HINT SYSTEM
   ===================================================== */
function _tsHint() {
  if (TS.phase !== 'waiting' && TS.phase !== 'retry') return;
  TS.hintLevel++;

  const gm       = TS.gameMoveObj;
  const hintArea = document.getElementById('tpHintReveal');
  const hintText = document.getElementById('tpHintText');
  if (!hintArea || !hintText) return;

  hintArea.style.display = '';

  if (TS.hintLevel === 1) {
    // Piece type hint — 10pt penalty
    TS.hintPenalty += 10;
    const pieceNames = { p:'Pawn', n:'Knight', b:'Bishop', r:'Rook', q:'Queen', k:'King' };
    const pieceType  = gm ? pieceNames[gm.piece] || 'Piece' : 'Piece';
    hintText.textContent = `💡 Hint: A ${pieceType} makes the best move here.`;

  } else if (TS.hintLevel === 2) {
    // Highlight from-square — 20pt penalty
    TS.hintPenalty += 20;
    if (gm) {
      _tsClearSquareHints();
      const sq = document.querySelector(`.square-55d63[data-square="${gm.from}"]`);
      if (sq) sq.classList.add('sq-hint-from');
    }
    hintText.textContent = '💡 Hint: The highlighted square shows which piece to move.';

  } else if (TS.hintLevel === 3) {
    // Full reveal — 40pt penalty (move is forced as reveal)
    TS.hintPenalty += 40;
    if (gm) {
      const sq2 = document.querySelector(`.square-55d63[data-square="${gm.to}"]`);
      if (sq2) sq2.classList.add('sq-hint-to');
    }
    hintText.textContent = `💡 Move: ${TS.gameMoveSAN} — the game move revealed.`;
    // Disable further hints
    const hintBtn = document.getElementById('btnTpHint');
    if (hintBtn) { hintBtn.disabled = true; hintBtn.style.opacity = '0.4'; }
  }
}

/* =====================================================
   REVEAL GAME MOVE (user requests to see it)
   ===================================================== */
function _tsReveal() {
  // During retry mode, "Show Answer" reveals the full comparison
  if (TS.phase === 'retry') {
    _tsForceRevealFromRetry();
    return;
  }

  if (TS.phase !== 'waiting') return;

  const gm = TS.gameMoveObj;
  if (!gm) return;

  _tsClearSquareHints();

  // Set hint level to 3 to show full move
  TS.hintLevel  = 3;
  TS.hintPenalty = 60; // maximum penalty — they gave up

  const hintArea = document.getElementById('tpHintReveal');
  const hintText = document.getElementById('tpHintText');
  if (hintArea) hintArea.style.display = '';
  if (hintText) hintText.innerHTML = `<strong>Game move: ${TS.gameMoveSAN}</strong><br>Click Continue to proceed (score: 0 for this move).`;

  // Highlight the full move path
  const sqFrom = document.querySelector(`.square-55d63[data-square="${gm.from}"]`);
  const sqTo   = document.querySelector(`.square-55d63[data-square="${gm.to}"]`);
  if (sqFrom) sqFrom.classList.add('sq-hint-from');
  if (sqTo)   sqTo.classList.add('sq-hint-to');

  // Disable hint buttons
  const hintBtn   = document.getElementById('btnTpHint');
  const revealBtn = document.getElementById('btnTpReveal');
  if (hintBtn)   { hintBtn.disabled = true;   hintBtn.style.opacity   = '0.4'; }
  if (revealBtn) { revealBtn.disabled = true; revealBtn.style.opacity = '0.4'; }

  // Show a Continue button that plays the game move
  _tsSetActionBtns({ hint:false, reveal:false, retry:false, continue:true });
  const contBtn = document.getElementById('btnTpContinue');
  if (contBtn) contBtn.textContent = '▶ Play Game Move';

  // Wire continue to auto-play the game move
  TS._revealedMode = true;
}

/* =====================================================
   RETRY
   ===================================================== */
function _tsRetry() {
  if (TS.phase !== 'feedback') return;

  // Pop last result
  const last = TS.results.pop();
  if (last) {
    TS.totalPoints -= last.points;
    TS.maxPoints   -= 100;
    TS.totalCpLoss -= last.cpLoss;
    TS.counts[last.quality] = Math.max(0, (TS.counts[last.quality] || 1) - 1);
  }

  // Go back one move
  state.game.undo();
  state.currentMoveIdx--;
  state.board.position(state.game.fen(), false);
  updateAll();

  // Add retry penalty upfront
  TS.hintPenalty = 15; // penalty for retrying

  _tsSetupUserTurn();
}

/* =====================================================
   CONTINUE after feedback
   ===================================================== */
function _tsContinue() {
  // Cancel auto-continue timer if user clicks manually (or timer fires itself)
  if (TS._autoContTimer) {
    clearTimeout(TS._autoContTimer);
    TS._autoContTimer = null;
  }
  const contBtn = document.getElementById('btnTpContinue');
  if (contBtn) contBtn.classList.remove('tp-auto-cont');

  // Reveal-play pending (max-retry or "Show Answer" path) — skip countdown
  if (TS._pendingRevealPlay !== null) {
    const action = TS._pendingRevealPlay;
    TS._pendingRevealPlay = null;
    _tsPlayGameMoveAndContinue(action.needUndo);
    return;
  }

  if (TS._revealedMode) {
    // "Show Move" from waiting phase — play game move for them (score = 0)
    TS._revealedMode = false;

    if (!TS._retryRevealRecorded) {
      // Normal reveal from waiting phase — record 0-point result now
      const cls = { quality:'blunder', label:'🔍 Revealed', points:0, color:'#6b7280' };
      TS.results.push({
        moveNum:   Math.ceil(state.currentMoveIdx / 2),
        userSAN:   TS.gameMoveSAN + ' (revealed)',
        gameSAN:   TS.gameMoveSAN,
        engineSAN: TS.engineBestSAN || '—',
        cpLoss:    999,
        quality:   'blunder',
        label:     '🔍 Revealed',
        points:    0,
        color:     '#6b7280',
      });
      TS.maxPoints += 100;
      TS.counts['blunder'] = (TS.counts['blunder'] || 0) + 1;
      _tsUpdateLiveStats();
    }
    TS._retryRevealRecorded = false; // always reset

    // Apply the game move
    const gm = TS.gameMoveObj;
    state.game.move(gm);
    state.currentMoveIdx++;
    state.board.position(state.game.fen(), true);
    updateAll();
    _tsClearSquareHints();

    setTimeout(_tsNextMove, 600);
    return;
  }

  if (TS.phase !== 'feedback') return;
  TS.phase = 'auto_play'; // suppress further interaction
  _tsClearSquareHints();

  // Hide comparison, show waiting
  _tsShowPhase('waiting_pre');

  setTimeout(_tsNextMove, 300);
}

/* =====================================================
   TRAINING COMPLETE
   ===================================================== */
function _tsComplete() {
  TS.phase = 'complete';
  _tsShowPhase('complete');
  showToast('Training complete! Generating report…', 'success');
  setTimeout(_tsShowReport, 800);
}

/* =====================================================
   END TRAINING (user exits early)
   ===================================================== */
function _tsEnd() {
  if (!TS.active) return;
  TS.active     = false;
  TS.phase      = 'idle';
  TS.engineMode = 'analysis';

  // Restore normal panel
  document.getElementById('rpNormalWrap').style.display   = '';
  document.getElementById('rpTrainingWrap').style.display = 'none';

  // Reset train button
  const btn = document.getElementById('btnTrainMode');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-graduation-cap"></i> Replay Training';
    btn.classList.remove('train-active');
  }

  // Restore engine display if it was on
  if (state.engineEnabled) {
    analyzePosition();
  }

  _tsClearSquareHints();
  updateAll();
  showToast('Training session ended.', '');
}

/* =====================================================
   FINAL REPORT MODAL
   ===================================================== */
function _tsShowReport() {
  const totalMoves  = TS.results.length;
  const accuracy    = totalMoves > 0 ? Math.round(TS.totalPoints / TS.maxPoints * 100) : 0;
  const avgCpl      = totalMoves > 0 ? Math.round(TS.totalCpLoss / totalMoves) : 0;

  // Grade
  const grade  = _tsGrade(accuracy);

  // Populate accuracy ring
  const circumference = 314.16; // 2π×50
  const ringFill = document.getElementById('trmRingFill');
  const pctEl    = document.getElementById('trmPct');
  const gradeEl  = document.getElementById('trmGrade');
  const gradeLbl = document.getElementById('trmGradeLbl');

  if (pctEl)    pctEl.textContent    = accuracy + '%';
  if (gradeEl)  { gradeEl.textContent = grade.letter; gradeEl.style.color = grade.color; }
  if (gradeLbl) { gradeLbl.textContent = grade.label;  gradeLbl.style.color = grade.color; }

  // Animate ring
  if (ringFill) {
    ringFill.style.stroke = grade.color;
    setTimeout(() => {
      ringFill.style.strokeDashoffset = circumference * (1 - accuracy / 100);
    }, 200);
  }

  // Stats row
  const statsRow = document.getElementById('trmStatsRow');
  if (statsRow) {
    statsRow.innerHTML = [
      { val: totalMoves,                              lbl: 'Moves' },
      { val: avgCpl + ' cp',                          lbl: 'Avg Loss' },
      { val: (TS.counts.exact || 0) + (TS.counts.excellent || 0), lbl: 'Excellent' },
      { val: (TS.counts.blunder || 0) + (TS.counts.mistake || 0), lbl: 'Mistakes' },
    ].map(s => `
      <div class="trm-stat-item">
        <span class="trm-stat-val">${s.val}</span>
        <span class="trm-stat-lbl">${s.lbl}</span>
      </div>`).join('');
  }

  // Quality bars
  const qualityBars = document.getElementById('trmQualityBars');
  if (qualityBars) {
    const breakdown = [
      { key:'exact',      name:'Exact Match', color:'#f59e0b' },
      { key:'excellent',  name:'Excellent',   color:'#22c55e' },
      { key:'good',       name:'Good',        color:'#86efac' },
      { key:'inaccuracy', name:'Inaccuracy',  color:'#fb923c' },
      { key:'mistake',    name:'Mistake',     color:'#f97316' },
      { key:'blunder',    name:'Blunder',     color:'#ef4444' },
    ];
    const maxCount = totalMoves || 1;
    qualityBars.innerHTML = breakdown.map(b => {
      const cnt = TS.counts[b.key] || 0;
      const pct = Math.round(cnt / maxCount * 100);
      return `
        <div class="trm-quality-row">
          <span class="trm-quality-name">${b.name}</span>
          <div class="trm-quality-bar-bg">
            <div class="trm-quality-bar-fill" style="width:0%;background:${b.color}"
                 data-target="${pct}%"></div>
          </div>
          <span class="trm-quality-count">${cnt}</span>
        </div>`;
    }).join('');
    // Animate bars after paint
    setTimeout(() => {
      qualityBars.querySelectorAll('.trm-quality-bar-fill').forEach(el => {
        el.style.width = el.dataset.target;
      });
    }, 300);
  }

  // Notable moments
  const momentsWrap = document.getElementById('trmMoments');
  const momentsList = document.getElementById('trmMomentsList');
  if (momentsList) {
    const best    = TS.results.filter(r => r.quality === 'exact' || r.quality === 'excellent').slice(0,3);
    const worst   = TS.results.filter(r => r.quality === 'blunder' || r.quality === 'mistake').slice(-3);
    const moments = [...best, ...worst].slice(0,5);

    if (moments.length > 0) {
      momentsWrap.style.display = '';
      momentsList.innerHTML = moments.map(m => `
        <div class="trm-moment-item">
          <span class="trm-moment-move">${m.moveNum}. ${m.userSAN || '?'}</span>
          <span class="trm-moment-desc">${m.label}</span>
          <span class="trm-moment-badge" style="background:${m.color}22;color:${m.color};border:1px solid ${m.color}44">
            ${m.points}pts
          </span>
        </div>`).join('');
    } else {
      momentsWrap.style.display = 'none';
    }
  }

  openModal('trainReportModal');
}

function _tsGrade(accuracy) {
  if (accuracy >= 95) return { letter:'A+', label:'Grandmaster Performance', color:'#f59e0b' };
  if (accuracy >= 88) return { letter:'A',  label:'Master Performance',      color:'#22c55e' };
  if (accuracy >= 78) return { letter:'B+', label:'Expert Level',            color:'#4ade80' };
  if (accuracy >= 68) return { letter:'B',  label:'Strong Club Player',      color:'#86efac' };
  if (accuracy >= 55) return { letter:'C',  label:'Good Practice',           color:'#fb923c' };
  if (accuracy >= 40) return { letter:'D',  label:'Keep Studying!',          color:'#f97316' };
  return                     { letter:'F',  label:'Study This Position',     color:'#ef4444' };
}

/* =====================================================
   UI HELPERS
   ===================================================== */
function _tsShowPhase(phase) {
  const comp      = document.getElementById('tpComparison');
  const waiting   = document.getElementById('tpWaiting');
  const evalDiv   = document.getElementById('tpEvaluating');
  const autoPlay  = document.getElementById('tpAutoPlay');
  const actions   = document.getElementById('tpActions');
  const retryDiv  = document.getElementById('tpRetryPrompt');
  const hintReveal = document.getElementById('tpHintReveal');

  if (comp)       comp.style.display      = 'none';
  if (waiting)    waiting.style.display   = 'none';
  if (evalDiv)    evalDiv.style.display   = 'none';
  if (autoPlay)   autoPlay.style.display  = 'none';
  if (retryDiv)   retryDiv.style.display  = 'none';
  if (hintReveal) hintReveal.style.display = 'none';

  if (phase === 'waiting' || phase === 'waiting_pre') {
    if (waiting) waiting.style.display = '';
    if (actions) actions.style.display = '';
    const sub = document.getElementById('tpWaitingSub');
    if (sub) sub.textContent = phase === 'waiting_pre'
      ? 'Engine analyzing position…'
      : 'Drag your piece on the board';
  } else if (phase === 'evaluating') {
    if (evalDiv) evalDiv.style.display = '';
    if (actions) actions.style.display = 'none';
  } else if (phase === 'auto_play') {
    if (autoPlay) autoPlay.style.display = '';
    if (actions)  actions.style.display  = 'none';
  } else if (phase === 'retry') {
    if (retryDiv) retryDiv.style.display = '';
    if (actions)  actions.style.display  = '';
  } else if (phase === 'complete') {
    if (waiting) {
      waiting.style.display = '';
      const wt = document.getElementById('tpWaitingTitle');
      const ws = document.getElementById('tpWaitingSub');
      if (wt) wt.textContent = 'Training Complete!';
      if (ws) ws.textContent = 'Generating your report…';
    }
    if (actions) actions.style.display = 'none';
  }
}

function _tsShowComparison(cpLoss, cls, finalPts) {
  const comp = document.getElementById('tpComparison');
  if (!comp) return;

  // Quality banner
  const banner = document.getElementById('tpQualityBanner');
  const icon   = document.getElementById('tpQualityIcon');
  const label  = document.getElementById('tpQualityLabel');
  if (banner) {
    banner.className = 'tp-quality-banner q-' + cls.quality;
    if (label) label.textContent = cls.label;
    if (icon)  icon.className = cls.quality === 'blunder' ? 'fas fa-times-circle tp-quality-icon'
      : cls.quality === 'mistake' ? 'fas fa-exclamation-circle tp-quality-icon'
      : cls.quality === 'inaccuracy' ? 'fas fa-question-circle tp-quality-icon'
      : cls.quality === 'exact' ? 'fas fa-star tp-quality-icon'
      : 'fas fa-check-circle tp-quality-icon';
  }

  // Moves
  const userSAN   = document.getElementById('tpUserSAN');
  const gameSAN   = document.getElementById('tpGameSAN');
  const engineSAN = document.getElementById('tpEngineSAN');
  const engineEv  = document.getElementById('tpEngineEval');
  const userTag   = document.getElementById('tpUserTag');
  const gameTag   = document.getElementById('tpGameTag');

  if (userSAN)   userSAN.textContent   = TS.userMoveSAN || '—';
  if (gameSAN)   gameSAN.textContent   = TS.gameMoveSAN || '—';
  if (engineSAN) engineSAN.textContent = TS.engineBestSAN || '—';

  // Engine eval display
  const preEvStr = TS.preIsMate ? 'M' + Math.abs(TS.preEval)
    : (TS.preEval >= 0 ? '+' : '') + (TS.preEval / 100).toFixed(2);
  if (engineEv) engineEv.textContent = preEvStr;

  // Tags for user/game moves
  const isSameAsEngine = TS.engineBestSAN && TS.engineBestSAN === TS.userMoveSAN;
  if (userTag) {
    if (TS.isExactMatch && isSameAsEngine) {
      userTag.textContent = '⭐ Best';
      userTag.style.cssText = 'background:rgba(245,158,11,0.15);color:#f59e0b';
    } else if (isSameAsEngine) {
      userTag.textContent = '⚡ Engine';
      userTag.style.cssText = 'background:rgba(34,197,94,0.12);color:#22c55e';
    } else if (TS.isExactMatch) {
      userTag.textContent = '♟ Game';
      userTag.style.cssText = 'background:rgba(37,99,235,0.15);color:#60a5fa';
    } else if (cpLoss <= 30) {
      userTag.textContent = '✓ Strong';
      userTag.style.cssText = 'background:rgba(74,222,128,0.1);color:#4ade80';
    } else {
      userTag.textContent = '';
      userTag.style.cssText = '';
    }
  }

  if (gameTag) {
    if (TS.isExactMatch) {
      gameTag.textContent = '= Same';
      gameTag.style.cssText = 'background:rgba(37,99,235,0.1);color:#60a5fa';
    } else {
      gameTag.textContent = '';
      gameTag.style.cssText = '';
    }
  }

  // CPL display
  const cplVal    = document.getElementById('tpCplVal');
  const ptsChange = document.getElementById('tpPtsChange');
  if (cplVal) {
    cplVal.textContent = cpLoss <= 0 ? '0 (improved!)' : cpLoss;
    cplVal.style.color = cpLoss > 150 ? '#ef4444' : cpLoss > 80 ? '#fb923c' : '#22c55e';
  }
  if (ptsChange) {
    ptsChange.textContent = `+${finalPts} pts`;
    ptsChange.style.color = finalPts >= 80 ? '#22c55e' : finalPts >= 55 ? '#fb923c' : '#ef4444';
  }

  // Feedback text
  const feedbackEl = document.getElementById('tpFeedbackText');
  if (feedbackEl) {
    feedbackEl.textContent = _tsFeedbackText(
      cpLoss, cls, TS.isExactMatch,
      TS.engineBestSAN, TS.gameMoveSAN, TS.userMoveSAN
    );
  }

  // Show the comparison card; hide spinner + waiting
  const evalDiv = document.getElementById('tpEvaluating');
  const waiting  = document.getElementById('tpWaiting');
  if (evalDiv) evalDiv.style.display = 'none';
  if (waiting)  waiting.style.display  = 'none';
  comp.style.display = '';
}

function _tsUpdateLiveStats() {
  const totalMoves = TS.results.length;
  const accuracy   = TS.maxPoints > 0
    ? Math.round(TS.totalPoints / TS.maxPoints * 100) + '%'
    : '—';
  const avgCpl     = totalMoves > 0 ? Math.round(TS.totalCpLoss / totalMoves) : 0;
  const excellent  = (TS.counts.exact || 0) + (TS.counts.excellent || 0);

  const accEl  = document.getElementById('tpsAccuracy');
  const cplEl  = document.getElementById('tpsCpl');
  const movEl  = document.getElementById('tpsMoves');
  const excEl  = document.getElementById('tpsExcellent');
  const ringSVG = document.getElementById('tpRingFill');
  const scoreEl = document.getElementById('tpScoreVal');

  if (accEl)   accEl.textContent   = accuracy;
  if (cplEl)   cplEl.textContent   = avgCpl;
  if (movEl)   movEl.textContent   = totalMoves;
  if (excEl)   excEl.textContent   = excellent;

  // Update ring
  const pctNum = TS.maxPoints > 0 ? Math.round(TS.totalPoints / TS.maxPoints * 100) : 100;
  if (scoreEl) scoreEl.textContent = pctNum;
  if (ringSVG) {
    const circ = 113.1; // 2π×18
    ringSVG.style.strokeDashoffset = circ * (1 - pctNum / 100);
    ringSVG.style.stroke = pctNum >= 80 ? '#22c55e' : pctNum >= 55 ? '#fb923c' : '#ef4444';
  }
}

function _tsUpdateQualityStrip() {
  const strip = document.getElementById('tpQualityStrip');
  if (!strip) return;
  const colors = {
    exact:'#f59e0b', excellent:'#22c55e', good:'#86efac',
    inaccuracy:'#fb923c', mistake:'#f97316', blunder:'#ef4444', blunder2:'#dc2626'
  };
  strip.innerHTML = TS.results.map(r => {
    const w = Math.max(4, Math.floor(strip.clientWidth / Math.max(TS.results.length, 1)));
    return `<div class="tp-strip-seg" style="width:${w}px;background:${r.color}" title="${r.userSAN}: ${r.label}"></div>`;
  }).join('');
}

function _tsUpdateSideBadge() {
  const circle = document.getElementById('tpSideCircle');
  const role   = document.getElementById('tpSideRole');
  const player = document.getElementById('tpSidePlayer');
  if (circle) circle.className = 'tp-side-circle ' + (TS.side === 'w' ? 'tp-white' : 'tp-black');
  if (role)   role.textContent   = 'Playing as ' + (TS.side === 'w' ? 'White' : 'Black');
  if (player) player.textContent = TS.side === 'w' ? TS.whiteName : TS.blackName;
}

function _tsSetActionBtns({ hint, reveal, retry, continue: cont }) {
  const hintBtn  = document.getElementById('btnTpHint');
  const revBtn   = document.getElementById('btnTpReveal');
  const retBtn   = document.getElementById('btnTpRetry');
  const contBtn  = document.getElementById('btnTpContinue');
  const actions  = document.getElementById('tpActions');

  if (hintBtn)  { hintBtn.style.display  = hint    ? '' : 'none'; hintBtn.disabled = false; hintBtn.style.opacity = ''; }
  if (revBtn)   { revBtn.style.display   = reveal  ? '' : 'none'; revBtn.disabled  = false; revBtn.style.opacity  = ''; }
  if (retBtn)   { retBtn.style.display   = retry   ? '' : 'none'; }
  if (contBtn)  {
    contBtn.style.display = cont ? '' : 'none';
    contBtn.innerHTML     = '<i class="fas fa-arrow-right"></i> Continue';
  }
  if (actions)  actions.style.display = (hint || reveal || retry || cont) ? '' : 'none';
}

function _tsClearSquareHints() {
  document.querySelectorAll('.sq-hint-from, .sq-hint-to').forEach(el => {
    el.classList.remove('sq-hint-from', 'sq-hint-to');
  });
}

/* =====================================================
   BIND TRAINING BUTTONS
   ===================================================== */
function bindTrainingControls() {
  // Setup modal side buttons
  document.getElementById('tsmBtnWhite').addEventListener('click', () => _tsStart('w'));
  document.getElementById('tsmBtnBlack').addEventListener('click', () => _tsStart('b'));

  // In-session controls
  document.getElementById('btnTpHint').addEventListener('click',    _tsHint);
  document.getElementById('btnTpReveal').addEventListener('click',  _tsReveal);
  document.getElementById('btnTpRetry').addEventListener('click',   _tsRetry);
  document.getElementById('btnTpContinue').addEventListener('click', _tsContinue);
  document.getElementById('btnTpEnd').addEventListener('click',     _tsEnd);

  // Speed selector (reads localStorage; persists across sessions)
  _tsInitSpeedBtns();

  // Report modal — train again
  document.getElementById('btnTrainAgain').addEventListener('click', () => {
    closeModal('trainReportModal');
    if (state.gameMoves.length > 0) {
      _tsEnd();
      setTimeout(_tsOpenSetup, 200);
    }
  });

  // Also wire topbar Train button (already handled in bindControls via btnTrainMode)
  // Wire classic game cards to suggest training after load
  // (handled in loadClassicGame via showToast)
}

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', function() {
  // Initialise game library state
  state.gameLibrary   = [];
  state.activeGameIdx = null;

  initBoard();          // handles all board init + ResizeObserver internally
  bindControls();
  bindKeyboard();
  bindTrainingControls();
  bindPositionSetupModal();
  bindPGNLoader();      // file picker, drop zone, game list panel
  renderClassicGames();
  updateAll();

  // Extra sync after web fonts load (Inter / Playfair Display affect navbar height)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      setLayoutVars();
      syncBoardSize();
    });
  }
});
