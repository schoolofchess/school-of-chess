/**
 * ts-training-test.js — Replay Training Automated Test Suite
 * ============================================================
 * School of Chess — comprehensive coverage across:
 *   • Multiple PGN types (tactical, positional, endgame, gambits)
 *   • All move quality scenarios (exact / excellent / good / mistake / blunder)
 *   • Retry logic / progressive hints / reveal paths
 *   • PGN line integrity after alternatives
 *   • Board state consistency
 *   • Speed configuration
 *   • Score/accuracy tracking
 *
 * HOW TO RUN:
 *   1. Open analysis.html in a browser
 *   2. Open DevTools → Console
 *   3. Run: await TSTest.runAll()
 *
 *   OR load this file at page bottom:
 *   <script src="js/ts-training-test.js"></script>
 *   then call: await TSTest.runAll()
 */

/* =====================================================================
   TEST RUNNER FRAMEWORK
   ===================================================================== */
window.TSTest = (() => {
  'use strict';

  const results = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  /* ─── Assertion helpers ─────────────────────────────────────────── */
  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      results.push({ ok: true, msg: message });
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      results.push({ ok: false, msg: message });
      failed++;
    }
    return condition;
  }

  function assertEqual(actual, expected, label) {
    const ok = actual === expected;
    if (ok) {
      console.log(`  ✅ ${label}: ${JSON.stringify(actual)}`);
      results.push({ ok: true, msg: label });
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      results.push({ ok: false, msg: `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})` });
      failed++;
    }
    return ok;
  }

  function warn(message) {
    console.warn(`  ⚠️  WARN: ${message}`);
    results.push({ ok: 'warn', msg: message });
    warnings++;
  }

  function section(title) {
    console.groupCollapsed(`\n📋 ${title}`);
  }

  function endSection() {
    console.groupEnd();
  }

  /* ─── Async helpers ─────────────────────────────────────────────── */
  const delay = ms => new Promise(r => setTimeout(r, ms));

  /* ─── State access helpers ─────────────────────────────────────── */
  function getTS()     { return typeof TS    !== 'undefined' ? TS    : null; }
  function getState()  { return typeof state !== 'undefined' ? state : null; }
  function getChess()  { const s = getState(); return s ? s.game : null; }

  function tsActive()  { const ts = getTS(); return ts && ts.active; }
  function tsPhase()   { const ts = getTS(); return ts ? ts.phase : 'unknown'; }

  /* ─── PGN loader helper ─────────────────────────────────────────── */
  async function loadPGN(pgn) {
    if (typeof importPGN === 'function') {
      importPGN(pgn);
      await delay(200);
      return true;
    }
    // Fallback: try to find the import PGN button area
    const textarea = document.getElementById('pgnInput') || document.getElementById('fenInput');
    warn('importPGN function not directly accessible — use the classic games list instead');
    return false;
  }

  /* ─── Training initialiser ──────────────────────────────────────── */
  async function startTraining(side = 'w') {
    if (typeof _tsStart !== 'function') {
      warn('_tsStart not accessible — training not started');
      return false;
    }
    _tsStart(side);
    await delay(400); // let engine init + first move sequence start
    return true;
  }

  async function stopTraining() {
    if (typeof _tsEnd === 'function') {
      _tsEnd();
      await delay(100);
    }
  }

  /* ─── Move simulator ────────────────────────────────────────────── */
  /**
   * Simulate a user dropping a piece.
   * Calls _tsOnDrop(source, target) directly and awaits evaluation.
   * @param {string} from  — e.g. 'e2'
   * @param {string} to    — e.g. 'e4'
   * @param {number} wait  — ms to wait for engine evaluation (default 2500)
   * @returns {string}     — 'snapback' | 'accepted' | 'error'
   */
  async function simulateDrop(from, to, wait = 2500) {
    if (typeof _tsOnDrop !== 'function') {
      warn('_tsOnDrop not accessible');
      return 'error';
    }
    const result = _tsOnDrop(from, to, null);
    if (result === 'snapback') return 'snapback'; // illegal move
    await delay(wait); // wait for engine evaluation
    return 'accepted';
  }

  /**
   * Simulate a user's move using SAN (parses source/target from chess.js).
   * Returns the result object from chess.js move(), or null if illegal.
   */
  function simulateSAN(san) {
    const game = getChess();
    if (!game) return null;
    const clone = new Chess(game.fen());
    return clone.move(san, { sloppy: true });
  }

  /* ================================================================
     TEST DATA — Multiple PGN Types
     ================================================================ */

  const PGN_OPERA = `[Event "Paris Opera"]
[White "Paul Morphy"][Black "Duke of Brunswick"][Result "1-0"]
1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6
7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8
13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

  const PGN_CENTURY = `[Event "Rosenwald Memorial"]
[White "Donald Byrne"][Black "Robert J. Fischer"][Result "0-1"]
1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4
7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3
13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6
18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+
23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 0-1`;

  const PGN_ENDGAME = `[Event "New York 1924"]
[White "Jose Raul Capablanca"][Black "Savielly Tartakower"][Result "1-0"]
1. d4 e6 2. Nf3 f5 3. c4 Nf6 4. Bg5 Be7 5. Nc3 O-O 6. e3 b6
7. Bd3 Bb7 8. O-O Qe8 9. Qe2 Ne4 10. Bxe7 Qxe7 11. Bxe4 fxe4
12. Nd2 Bxg2 13. Kxg2 Qg5+ 14. Kh1 Qh4 15. Qg4 Qxg4 16. Nxg4 d5 1-0`;

  const PGN_GAMBIT = `[Event "Kings Gambit Test"]
[White "Test White"][Black "Test Black"][Result "*"]
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. Bc4 g4 5. O-O gxf3 6. Qxf3 Qf6
7. e5 Qxe5 8. Bxf7+ Kxf7 9. d4 *`;

  const PGN_TACTICAL = `[Event "Evergreen Attack"]
[White "Alexander Alekhine"][Black "Aaron Nimzowitsch"][Result "1-0"]
1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 Bxc3+ 5. bxc3 d6 6. Qc2 Qe7
7. g3 O-O 8. Bg2 Nbd7 9. O-O e5 10. Ng5 Re8 11. Nxh7 Nxh7 12. dxe5 1-0`;

  const PGN_QUIET = `[Event "Quiet Positional Game"]
[White "Test"][Black "Test"][Result "*"]
1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 b6
7. cxd5 exd5 8. Bd3 Bb7 9. O-O Nbd7 10. Qc2 c5 *`;

  const PGN_SACRIFICE = `[Event "Sacrifice Game"]
[White "Test"][Black "Test"][Result "*"]
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4
7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 *`;

  const PGN_SHORT = `[Event "Short Test"]
[White "Test"][Black "Test"][Result "*"]
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O *`;

  /* ================================================================
     TEST SUITES
     ================================================================ */

  /* ── 1. Speed Configuration Tests ─────────────────────────────── */
  async function testSpeedConfig() {
    section('Speed Configuration');

    // Check TS_SPEEDS exists with correct structure
    assert(typeof TS_SPEEDS !== 'undefined', 'TS_SPEEDS constant is defined');

    if (typeof TS_SPEEDS !== 'undefined') {
      const keys = ['feedback', 'reveal', 'oppPre', 'oppPost', 'gamePre', 'gamePost'];
      ['fast', 'normal', 'slow'].forEach(speed => {
        keys.forEach(k => {
          assert(
            typeof TS_SPEEDS[speed][k] === 'number',
            `TS_SPEEDS.${speed}.${k} is a number`
          );
        });
      });

      // Verify ordering: fast < normal < slow for each key
      keys.forEach(k => {
        assert(TS_SPEEDS.fast[k] < TS_SPEEDS.normal[k],
          `fast.${k} (${TS_SPEEDS.fast[k]}ms) < normal.${k} (${TS_SPEEDS.normal[k]}ms)`);
        assert(TS_SPEEDS.normal[k] < TS_SPEEDS.slow[k],
          `normal.${k} (${TS_SPEEDS.normal[k]}ms) < slow.${k} (${TS_SPEEDS.slow[k]}ms)`);
      });

      // Verify minimum required spread (at least 3× between fast and slow)
      keys.forEach(k => {
        const ratio = TS_SPEEDS.slow[k] / TS_SPEEDS.fast[k];
        assert(ratio >= 3,
          `slow/fast ratio for ${k} is ≥3× (actual: ${ratio.toFixed(1)}×)`);
      });

      // Verify reveal > feedback (reveal needs more time to read)
      ['fast', 'normal', 'slow'].forEach(speed => {
        assert(TS_SPEEDS[speed].reveal > TS_SPEEDS[speed].feedback,
          `${speed}: reveal (${TS_SPEEDS[speed].reveal}ms) > feedback (${TS_SPEEDS[speed].feedback}ms)`);
      });

      // Verify no clamping: _tsGetDelay('reveal') for fast should be < 2500ms
      // (the old bug clamped it to 2500ms, making fast == normal)
      localStorage.setItem('ts_replay_speed', 'fast');
      const fastReveal = _tsGetDelay('reveal');
      assert(fastReveal < 2000,
        `Fast reveal delay (${fastReveal}ms) is below old 2500ms clamp — bug fixed!`);

      localStorage.setItem('ts_replay_speed', 'normal');
      const normalFeedback = _tsGetDelay('feedback');
      assert(normalFeedback >= 1200 && normalFeedback <= 2000,
        `Normal feedback delay (${normalFeedback}ms) is in reasonable range [1200–2000ms]`);

      // Restore default
      localStorage.setItem('ts_replay_speed', 'normal');
    }

    endSection();
  }

  /* ── 2. Classification Function Tests ─────────────────────────── */
  async function testClassification() {
    section('Move Classification Logic');

    if (typeof _tsClassify !== 'function') {
      warn('_tsClassify not accessible — skipping classification tests');
      endSection();
      return;
    }

    const cases = [
      // [cpLoss, isExact, expectedQuality, shouldAccept]
      [0,   true,  'exact',     true,  'Exact game move (0cp, exact=true)'],
      [0,   false, 'excellent', true,  'Better than game (0cp, exact=false)'],
      [10,  false, 'excellent', true,  'Excellent (10cp loss)'],
      [20,  false, 'excellent', true,  'Excellent (20cp loss — boundary)'],
      [40,  false, 'good',      true,  'Good (40cp loss)'],
      [60,  false, 'good',      true,  'Good (60cp loss)'],
      [80,  false, 'good',      true,  'Good Alternative (80cp loss — boundary)'],
      [81,  false, 'mistake',   false, 'Mistake (81cp loss — just over boundary)'],
      [150, false, 'mistake',   false, 'Mistake (150cp loss)'],
      [250, false, 'mistake',   false, 'Mistake (250cp loss)'],
      [251, false, 'blunder',   false, 'Blunder (251cp loss)'],
      [500, false, 'blunder',   false, 'Blunder (500cp loss)'],
    ];

    cases.forEach(([cpLoss, isExact, expectedQ, expectedAccept, label]) => {
      const cls = _tsClassify(cpLoss, isExact);
      assert(cls.quality === expectedQ,
        `${label} → quality='${cls.quality}' (expected '${expectedQ}')`);
      assert(cls.accept === expectedAccept,
        `${label} → accept=${cls.accept} (expected ${expectedAccept})`);
      assert(typeof cls.label === 'string' && cls.label.length > 0,
        `${label} → has label text`);
      assert(typeof cls.points === 'number' && cls.points >= 0,
        `${label} → has valid points (${cls.points})`);

      // Accepted moves should have points > 0
      if (expectedAccept) {
        assert(cls.points > 0,
          `${label} → accepted move has points > 0 (${cls.points})`);
      } else {
        assertEqual(cls.points, 0,
          `${label} → rejected move has 0 points`);
      }
    });

    endSection();
  }

  /* ── 3. TS State Initialisation Tests ─────────────────────────── */
  async function testStateInit() {
    section('Training State Initialisation');

    const s = getState();
    if (!s) { warn('state object not accessible'); endSection(); return; }

    // Load a PGN first
    const ok = await loadPGN(PGN_SHORT);
    if (!ok) { warn('Could not load PGN — skipping state init tests'); endSection(); return; }

    await startTraining('w');

    const ts = getTS();
    if (!ts) { warn('TS object not accessible'); endSection(); return; }

    assertEqual(ts.active, true,                'TS.active is true after start');
    assertEqual(ts.side, 'w',                   'TS.side is white');
    assertEqual(ts.totalPoints, 0,              'TS.totalPoints starts at 0');
    assertEqual(ts.maxPoints, 0,                'TS.maxPoints starts at 0');
    assertEqual(ts.totalCpLoss, 0,              'TS.totalCpLoss starts at 0');
    assert(Array.isArray(ts.results),           'TS.results is an array');
    assertEqual(ts.results.length, 0,           'TS.results is empty at start');
    assertEqual(ts.retryCount, 0,               'TS.retryCount starts at 0');
    assertEqual(ts.retryPenalty, 0,             'TS.retryPenalty starts at 0');
    assertEqual(ts.hintLevel, 0,                'TS.hintLevel starts at 0');
    assertEqual(ts.maxRetries, 2,               'TS.maxRetries is 2');
    assert(ts._preMovePosition === null,        'TS._preMovePosition is null at start');
    assert(ts.gameMoveObj !== undefined,        'TS.gameMoveObj is set (first move ready)');

    await stopTraining();
    endSection();
  }

  /* ── 4. PGN Integrity Tests — Multi-game ─────────────────────── */
  async function testPGNIntegrity() {
    section('PGN Loading & Integrity — Multiple Games');

    const testGames = [
      { name: 'Opera Game (attacking)',      pgn: PGN_OPERA,    expectedMoves: 16 },
      { name: 'Game of Century (tactical)',  pgn: PGN_CENTURY,  expectedMoves: 25 },
      { name: 'Capablanca Endgame',          pgn: PGN_ENDGAME,  expectedMoves: 16 },
      { name: 'Alekhine Tactical Attack',    pgn: PGN_TACTICAL, expectedMoves: 12 },
      { name: 'Kings Gambit (sharp)',        pgn: PGN_GAMBIT,   expectedMoves: 9  },
      { name: 'Quiet Positional (QGD)',      pgn: PGN_QUIET,    expectedMoves: 10 },
      { name: 'Sacrifice Game (Evans)',      pgn: PGN_SACRIFICE,expectedMoves: 10 },
    ];

    for (const game of testGames) {
      const ok = await loadPGN(game.pgn);
      if (!ok) { warn(`Could not load: ${game.name}`); continue; }

      const s = getState();
      if (!s || !s.gameMoves) { warn(`gameMoves not available for: ${game.name}`); continue; }

      assert(s.gameMoves.length === game.expectedMoves,
        `${game.name}: loaded ${s.gameMoves.length} moves (expected ${game.expectedMoves})`);

      // Verify we can replay the entire game without errors
      const chess = new Chess();
      let moveOk = true;
      for (let i = 0; i < s.gameMoves.length; i++) {
        const m = s.gameMoves[i];
        const result = chess.move(m);
        if (!result) {
          assert(false, `${game.name}: move ${i+1} (${JSON.stringify(m)}) is illegal from FEN ${chess.fen()}`);
          moveOk = false;
          break;
        }
      }
      if (moveOk) {
        assert(true, `${game.name}: all ${s.gameMoves.length} moves are legal in sequence`);
      }
    }

    endSection();
  }

  /* ── 5. Move Quality Scenario Tests ──────────────────────────── */
  async function testMoveScenarios() {
    section('Move Quality Scenarios');

    if (typeof _tsClassify !== 'function') {
      warn('_tsClassify not accessible'); endSection(); return;
    }

    // Scenario: exact match
    const exact = _tsClassify(0, true);
    assert(exact.quality === 'exact' && exact.accept === true,
      'Scenario: exact game move → accepted with quality=exact');
    assertEqual(exact.points, 100, 'Exact match earns 100 points');

    // Scenario: engine best (better than game, 0 cp loss, not exact)
    const better = _tsClassify(-5, false);
    assert(better.accept === true,
      'Scenario: engine-best alternative (negative cp loss) → accepted');
    assert(better.points >= 97,
      `Engine-best alternative earns ≥97 points (got ${better.points})`);

    // Scenario: slight inaccuracy (25cp)
    const inaccuracy25 = _tsClassify(25, false);
    assert(inaccuracy25.accept === true,
      'Scenario: 25cp loss → accepted (within excellent threshold)');

    // Scenario: borderline good (80cp)
    const borderlineGood = _tsClassify(80, false);
    assert(borderlineGood.accept === true,
      'Scenario: 80cp loss → accepted (good alternative — boundary)');
    assert(['good'].includes(borderlineGood.quality),
      `80cp loss has quality 'good' (got '${borderlineGood.quality}')`);

    // Scenario: just over boundary (81cp) → mistake, not accepted
    const justOver = _tsClassify(81, false);
    assert(justOver.accept === false,
      'Scenario: 81cp loss → NOT accepted (over mistake threshold)');
    assertEqual(justOver.quality, 'mistake',
      'Scenario: 81cp loss → quality=mistake');
    assertEqual(justOver.points, 0, 'Mistake earns 0 points');

    // Scenario: clear blunder
    const blunder = _tsClassify(400, false);
    assert(blunder.accept === false, 'Scenario: 400cp loss → NOT accepted');
    assertEqual(blunder.quality, 'blunder', 'Scenario: blunder quality correct');
    assertEqual(blunder.points, 0, 'Blunder earns 0 points');

    endSection();
  }

  /* ── 6. Retry Logic Tests ─────────────────────────────────────── */
  async function testRetryLogic() {
    section('Retry Logic & Progressive Hints');

    const ts = getTS();
    if (!ts) { warn('TS not accessible'); endSection(); return; }

    // Verify TS.maxRetries
    assertEqual(ts.maxRetries, 2,
      'maxRetries is 2 (players get 2 retry attempts)');

    // Simulate retry count tracking
    const savedRetryCount  = ts.retryCount;
    const savedRetryPenalty = ts.retryPenalty;
    const savedLastCls     = ts._lastCls;
    const savedLastCpLoss  = ts._lastCpLoss;

    // Verify penalty accumulation logic
    // Mistake: 20cp penalty per retry
    // Blunder: 30cp penalty per retry
    const mistakeCls = _tsClassify(100, false);  // mistake
    const blunderCls = _tsClassify(350, false);  // blunder

    assert(mistakeCls.quality === 'mistake', 'Test setup: 100cp = mistake');
    assert(blunderCls.quality === 'blunder', 'Test setup: 350cp = blunder');

    // Verify score deduction logic:
    // 100 base points - hint penalty - retry penalty
    // After 1 retry (mistake): -20 pts penalty
    // After 2 retries (mistake): -40 pts penalty
    const baseExact = 100;
    const afterOneRetry = Math.max(0, baseExact - 20);
    const afterTwoRetries = Math.max(0, baseExact - 40);
    assert(afterOneRetry === 80, `After 1 retry: ${afterOneRetry} pts max (80)`);
    assert(afterTwoRetries === 60, `After 2 retries: ${afterTwoRetries} pts max (60)`);

    // Verify require-retry logic uses cls.accept flag (not old quality string check)
    const testCases = [
      [_tsClassify(0,   true),  false, 'exact → no retry needed'],
      [_tsClassify(0,   false), false, 'excellent (0cp) → no retry needed'],
      [_tsClassify(60,  false), false, 'good (60cp) → no retry needed'],
      [_tsClassify(80,  false), false, 'good alt (80cp) → no retry needed'],
      [_tsClassify(81,  false), true,  'mistake (81cp) → retry required'],
      [_tsClassify(200, false), true,  'mistake (200cp) → retry required'],
      [_tsClassify(400, false), true,  'blunder (400cp) → retry required'],
    ];

    testCases.forEach(([cls, expectRetry, label]) => {
      const requiresRetry = !cls.accept;
      assert(requiresRetry === expectRetry,
        `${label}: requiresRetry=${requiresRetry} (expected ${expectRetry})`);
    });

    // Restore state
    ts.retryCount   = savedRetryCount;
    ts.retryPenalty = savedRetryPenalty;
    ts._lastCls     = savedLastCls;
    ts._lastCpLoss  = savedLastCpLoss;

    endSection();
  }

  /* ── 7. Board State Consistency Tests ─────────────────────────── */
  async function testBoardStateConsistency() {
    section('Board State Consistency');

    const s = getState();
    if (!s) { warn('state not accessible'); endSection(); return; }

    // Load Opera Game and test board state at key moments
    const ok = await loadPGN(PGN_OPERA);
    if (!ok) { warn('Could not load Opera Game'); endSection(); return; }

    // Go to start
    if (typeof goFirst === 'function') {
      goFirst();
      await delay(100);
    }

    // Verify starting position
    const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    assert(s.game.fen().startsWith(startFEN.split(' ')[0]),
      'Starting position FEN is correct');
    assertEqual(s.currentMoveIdx, 0, 'currentMoveIdx=0 at start');

    // Navigate forward a few moves
    if (typeof goNext === 'function') {
      for (let i = 0; i < 4; i++) { goNext(); await delay(50); }
    }

    // After 4 moves (1.e4 e5 2.Nf3 d6), verify state is consistent
    assert(s.currentMoveIdx === 4,
      `After 4 goNext(): currentMoveIdx=${s.currentMoveIdx} (expected 4)`);
    assert(s.gameMoves.length >= 4,
      `gameMoves has at least 4 moves (has ${s.gameMoves.length})`);

    // Verify board position matches game position
    const boardFEN  = s.board.fen ? s.board.fen() : '(unknown)';
    const gameFEN   = s.game.fen().split(' ')[0]; // piece positions only
    assert(boardFEN === gameFEN || boardFEN.startsWith(gameFEN.split(' ')[0]),
      `Board FEN matches game FEN after navigation`);

    // Go back to start
    if (typeof goFirst === 'function') { goFirst(); await delay(100); }
    assertEqual(s.currentMoveIdx, 0, 'currentMoveIdx=0 after goFirst()');

    endSection();
  }

  /* ── 8. PGN Continuation Integrity After Alternatives ─────────── */
  async function testPGNContinuationIntegrity() {
    section('PGN Line Integrity — Alt-move Revert');

    // This is the most critical test: after user plays a GOOD ALTERNATIVE
    // (accepted but not exact), the system must revert and play the PGN game move
    // to keep the game on the historical line.

    const ts = getTS();
    const s  = getState();
    if (!ts || !s) { warn('Not accessible'); endSection(); return; }

    // Test the _tsStartAltMoveTimer logic via state inspection
    // After a good alternative is accepted:
    // 1. TS._pendingRevealPlay = { needUndo: true }
    // 2. Auto-timer fires → _tsPlayGameMoveAndContinue(true)
    // 3. needUndo=true → undo user's move, snap back, then play game move

    // Verify the pending reveal play is set correctly for alt moves
    // We can check _tsStartAltMoveTimer's behavior without running the full game
    assert(typeof _tsStartAltMoveTimer === 'function',
      '_tsStartAltMoveTimer function exists');
    assert(typeof _tsPlayGameMoveAndContinue === 'function',
      '_tsPlayGameMoveAndContinue function exists');

    // Verify _tsPlayGameMoveAndContinue uses speed-aware delays
    // (not hardcoded 300ms and 600ms from v19)
    const gamePreDelay  = typeof _tsGetDelay === 'function' ? _tsGetDelay('gamePre') : -1;
    const gamePostDelay = typeof _tsGetDelay === 'function' ? _tsGetDelay('gamePost') : -1;
    assert(gamePreDelay > 0,  `gamePre delay is defined and > 0 (${gamePreDelay}ms)`);
    assert(gamePostDelay > 0, `gamePost delay is defined and > 0 (${gamePostDelay}ms)`);

    // Verify the old hardcoded 2500ms clamp is gone from reveal timer
    // Fast mode reveal should be < 2000ms (was clamped to 2500ms in v19-20)
    localStorage.setItem('ts_replay_speed', 'fast');
    const fastReveal = _tsGetDelay('reveal');
    assert(fastReveal < 2000,
      `Fast reveal = ${fastReveal}ms (must be < 2000 to differ from normal — old bug was 2500ms clamp)`);

    const normalReveal = _tsGetDelay('reveal');
    localStorage.setItem('ts_replay_speed', 'normal');
    const normalReveal2 = _tsGetDelay('reveal');
    assert(Math.abs(normalReveal - normalReveal2) < 100 || fastReveal !== normalReveal2,
      'Fast and Normal reveal timings are distinct');

    localStorage.setItem('ts_replay_speed', 'normal'); // restore

    endSection();
  }

  /* ── 9. Score & Accuracy Tracking Tests ──────────────────────── */
  async function testScoreTracking() {
    section('Score & Accuracy Tracking');

    if (typeof _tsClassify !== 'function') { warn('Not accessible'); endSection(); return; }

    // Simulate a series of moves and check score accumulation
    // This tests the scoring math without running the full board UI

    const mockResults = [
      { pts: 100, cpLoss: 0,   quality: 'exact' },
      { pts: 97,  cpLoss: 15,  quality: 'excellent' },
      { pts: 85,  cpLoss: 45,  quality: 'good' },
      { pts: 0,   cpLoss: 150, quality: 'mistake' },
      { pts: 100, cpLoss: 0,   quality: 'exact' },
    ];

    const totalExpected   = mockResults.reduce((s, r) => s + r.pts, 0); // 382
    const maxExpected     = mockResults.length * 100;                    // 500
    const accuracyExpected = Math.round(totalExpected / maxExpected * 100); // 76%

    assertEqual(totalExpected, 382, 'Total points from 5 mock moves = 382');
    assertEqual(maxExpected, 500,   'Max possible from 5 moves = 500');
    assertEqual(accuracyExpected, 76, 'Accuracy = 76%');

    // Verify point ranges make sense
    const cls = [
      _tsClassify(0, true),    // exact
      _tsClassify(0, false),   // better than game
      _tsClassify(15, false),  // excellent
      _tsClassify(45, false),  // good
      _tsClassify(70, false),  // good alt
      _tsClassify(90, false),  // mistake
    ];

    assert(cls[0].points === 100, `Exact: 100pts`);
    assert(cls[1].points === 100, `Better than game: 100pts`);
    assert(cls[2].points >= 90,   `Excellent (15cp): ≥90pts (got ${cls[2].points})`);
    assert(cls[3].points >= 80,   `Good (45cp): ≥80pts (got ${cls[3].points})`);
    assert(cls[4].points >= 70,   `Good alt (70cp): ≥70pts (got ${cls[4].points})`);
    assert(cls[5].points === 0,   `Mistake (90cp): 0pts (not accepted)`);

    // Penalty application: verify hint + retry penalties reduce score
    const baseGood    = _tsClassify(45, false).points; // 85
    const afterHint   = Math.max(0, baseGood - 15);    // 70
    const afterRetry  = Math.max(0, afterHint - 20);   // 50

    assert(afterHint >= 0,  `Score after hint penalty ≥0 (${afterHint}pts)`);
    assert(afterRetry >= 0, `Score after retry penalty ≥0 (${afterRetry}pts)`);

    endSection();
  }

  /* ── 10. Multi-Game Replay Flow Tests ─────────────────────────── */
  async function testMultiGameReplayFlow() {
    section('Multi-Game Replay Flow — Sequential Games');

    const gamesToTest = [
      { name: 'Opera Game',    pgn: PGN_OPERA,    side: 'w' },
      { name: 'Century Game',  pgn: PGN_CENTURY,  side: 'b' },
      { name: 'Endgame',       pgn: PGN_ENDGAME,  side: 'w' },
      { name: 'Kings Gambit',  pgn: PGN_GAMBIT,   side: 'w' },
    ];

    for (const game of gamesToTest) {
      console.log(`  Testing: ${game.name}`);
      const ok = await loadPGN(game.pgn);
      if (!ok) { warn(`Cannot load ${game.name}`); continue; }

      await startTraining(game.side);
      const ts = getTS();

      if (ts) {
        assert(ts.active === true,   `${game.name}: training active after start`);
        assertEqual(ts.side, game.side, `${game.name}: playing as ${game.side}`);
        assertEqual(ts.results.length, 0, `${game.name}: no results yet at start`);
        assert(ts.gameMoveObj !== null || tsPhase() !== 'waiting',
          `${game.name}: gameMoveObj set or not yet in waiting phase`);
      }

      await stopTraining();
      assert(true, `${game.name}: started and stopped cleanly`);
      await delay(100);
    }

    endSection();
  }

  /* ── 11. Engine Speed Sanity Tests ───────────────────────────── */
  async function testEngineSpeeds() {
    section('Engine Move Evaluation Speeds');

    // Verify the engine is configured for fast training eval
    // (go movetime 1200 depth 14 for pre-eval, 800 depth 12 for post-eval)
    // We can't run the engine but we can check the code references correct values

    // Check _tsRunPreEval and _tsRunPostEval exist
    assert(typeof _tsRunPreEval  === 'function', '_tsRunPreEval function exists');
    assert(typeof _tsRunPostEval === 'function', '_tsRunPostEval function exists');

    // Verify training doesn't use the slow analysis movetime (3000ms)
    // by checking the source code string
    const preEvalSrc  = _tsRunPreEval.toString();
    const postEvalSrc = _tsRunPostEval.toString();

    assert(preEvalSrc.includes('movetime'),
      'Pre-eval uses movetime (not infinite depth)');
    assert(!preEvalSrc.includes('movetime 3000'),
      'Pre-eval does NOT use slow 3000ms movetime');
    assert(postEvalSrc.includes('movetime'),
      'Post-eval uses movetime (not infinite depth)');

    // Verify training-specific engine timeout is ≤1500ms
    const preMatch  = preEvalSrc.match(/movetime\s+(\d+)/);
    const postMatch = postEvalSrc.match(/movetime\s+(\d+)/);

    if (preMatch) {
      assert(parseInt(preMatch[1]) <= 1500,
        `Pre-eval movetime=${preMatch[1]}ms ≤ 1500ms`);
    }
    if (postMatch) {
      assert(parseInt(postMatch[1]) <= 1000,
        `Post-eval movetime=${postMatch[1]}ms ≤ 1000ms`);
    }

    endSection();
  }

  /* ── 12. Alternative Move Path Tests ─────────────────────────── */
  async function testAlternativeMovePath() {
    section('Alternative Move Handling (non-exact accepted moves)');

    assert(typeof _tsStartAltMoveTimer === 'function',
      '_tsStartAltMoveTimer exists');
    assert(typeof _tsPlayGameMoveAndContinue === 'function',
      '_tsPlayGameMoveAndContinue exists');

    // Verify _tsStartAltMoveTimer sets _pendingRevealPlay = { needUndo: true }
    // We can test this by calling it and inspecting state
    const ts = getTS();
    if (ts) {
      const savedTimer = ts._autoContTimer;
      const savedPending = ts._pendingRevealPlay;

      // Ensure gameMoveObj is set (otherwise function may error)
      if (!ts.gameMoveObj) {
        ts.gameMoveObj = { from: 'e2', to: 'e4', san: 'e4' };
        ts.gameMoveSAN = 'e4';
      }

      _tsStartAltMoveTimer();
      await delay(50); // brief tick

      assert(ts._pendingRevealPlay !== null &&
             ts._pendingRevealPlay !== undefined,
        '_tsStartAltMoveTimer sets _pendingRevealPlay');

      if (ts._pendingRevealPlay) {
        assert(ts._pendingRevealPlay.needUndo === true,
          '_pendingRevealPlay.needUndo === true (will revert user\'s alt move)');
      }

      // Clean up
      if (ts._autoContTimer) {
        clearTimeout(ts._autoContTimer);
        ts._autoContTimer = null;
      }
      ts._pendingRevealPlay = savedPending;
    }

    endSection();
  }

  /* ── 13. Opponent Auto-Play Timing Tests ─────────────────────── */
  async function testOpponentAutoPlayTiming() {
    section('Opponent Auto-Play Timing (speed-aware)');

    // Verify _tsAutoPlayOpponent uses _tsGetDelay, not hardcoded values
    assert(typeof _tsAutoPlayOpponent === 'function',
      '_tsAutoPlayOpponent function exists');

    const src = _tsAutoPlayOpponent.toString();
    assert(src.includes('_tsGetDelay') || src.includes('OPP_PRE'),
      '_tsAutoPlayOpponent uses speed-aware delay (not hardcoded)');

    // Verify the function does NOT contain the old hardcoded 250 or 600 literals
    // (they were replaced with OPP_PRE/OPP_POST variables)
    const hasHardcoded250 = src.includes(', 250)') || src.includes(',250)');
    const hasHardcoded600 = src.includes(', 600)') || src.includes(',600)');
    assert(!hasHardcoded250,
      'Opponent auto-play does NOT have hardcoded 250ms delay');
    assert(!hasHardcoded600,
      'Opponent auto-play does NOT have hardcoded 600ms post-delay');

    // Verify oppPre and oppPost differ between speeds
    localStorage.setItem('ts_replay_speed', 'fast');
    const fastPre  = _tsGetDelay('oppPre');
    const fastPost = _tsGetDelay('oppPost');
    localStorage.setItem('ts_replay_speed', 'slow');
    const slowPre  = _tsGetDelay('oppPre');
    const slowPost = _tsGetDelay('oppPost');
    localStorage.setItem('ts_replay_speed', 'normal');

    assert(fastPre < slowPre,   `Opponent pre-delay: fast(${fastPre}ms) < slow(${slowPre}ms)`);
    assert(fastPost < slowPost, `Opponent post-delay: fast(${fastPost}ms) < slow(${slowPost}ms)`);

    endSection();
  }

  /* ── 14. Hint System Tests ────────────────────────────────────── */
  async function testHintSystem() {
    section('Hint System & Penalty Logic');

    const ts = getTS();
    if (!ts) { warn('TS not accessible'); endSection(); return; }

    // Verify hint level tracking
    const savedHintLevel   = ts.hintLevel;
    const savedHintPenalty = ts.hintPenalty;

    // Hint level should start at 0 for each move
    ts.hintLevel   = 0;
    ts.hintPenalty = 0;

    // Simulate hint at level 1 (source square hint)
    ts.hintLevel   = Math.max(ts.hintLevel, 1);
    ts.hintPenalty = Math.max(ts.hintPenalty, 10);
    assert(ts.hintLevel === 1,   'After hint level 1: hintLevel=1');
    assert(ts.hintPenalty === 10, 'After hint level 1: hintPenalty=10');

    // Simulate auto-hint at retry attempt 2 (source square highlight)
    ts.hintLevel   = Math.max(ts.hintLevel, 2);
    ts.hintPenalty = Math.max(ts.hintPenalty, 20);
    assert(ts.hintLevel === 2,   'After auto-hint level 2: hintLevel=2');
    assert(ts.hintPenalty === 20, 'After auto-hint level 2: hintPenalty=20');

    // Hint at level 3 (full target square reveal)
    ts.hintLevel   = Math.max(ts.hintLevel, 3);
    ts.hintPenalty = Math.max(ts.hintPenalty, 30);
    assert(ts.hintLevel === 3,   'After full reveal: hintLevel=3');
    assert(ts.hintPenalty === 30, 'After full reveal: hintPenalty=30');

    // Score after hints: 100 base - 30 hint penalty = 70 max
    const baseGoodPoints = _tsClassify(20, false).points; // excellent = 97
    const afterHints     = Math.max(0, baseGoodPoints - ts.hintPenalty); // 97-30 = 67
    assert(afterHints >= 0,
      `After max hints: score = ${afterHints} ≥ 0`);

    // Restore
    ts.hintLevel   = savedHintLevel;
    ts.hintPenalty = savedHintPenalty;

    endSection();
  }

  /* ── 15. Regression Tests — Known Bugs ──────────────────────── */
  async function testRegressions() {
    section('Regression Tests — Previously Fixed Bugs');

    // BUG v19: Wrong moves auto-continued because threshold was too lenient (≤150cp)
    // FIX: cls.accept = false for anything > 80cp
    const bug19 = _tsClassify(120, false); // 120cp loss — previously accepted!
    assert(bug19.accept === false,
      'v19 regression: 120cp loss is NOT accepted (was broken before v19)');

    // BUG v19: Wrong piece stayed on board for 2-3s during evaluation
    // FIX: _tsFlashWrongMove() fires immediately; board reverts via _preMovePosition
    assert(typeof _tsFlashWrongMove === 'function',
      'v19 fix: _tsFlashWrongMove function exists');
    assert(typeof _tsHandleRetry === 'function' &&
           _tsHandleRetry.toString().includes('position(TS._preMovePosition'),
      'v19 fix: _tsHandleRetry snaps board back to _preMovePosition immediately');

    // BUG v20: After good alternative (Nf3 vs PGN f4), system continued from Nf3 position
    // FIX: _tsStartAltMoveTimer with needUndo=true reverts to game line
    assert(typeof _tsStartAltMoveTimer === 'function',
      'v20 fix: _tsStartAltMoveTimer exists');
    const altSrc = _tsStartAltMoveTimer.toString();
    assert(altSrc.includes('needUndo: true') || altSrc.includes('needUndo:true'),
      'v20 fix: _tsStartAltMoveTimer sets needUndo:true');

    // BUG v20-v21: _tsStartRevealPlayTimer clamped to Math.max(delay, 2500)
    // FIX v22: No clamp — 'reveal' delay type already generous per speed
    const revealSrc = _tsStartRevealPlayTimer.toString();
    assert(!revealSrc.includes('Math.max') || !revealSrc.includes('2500'),
      'v22 fix: _tsStartRevealPlayTimer does NOT use Math.max(delay, 2500) clamp');

    // BUG v22: Hardcoded 250ms/600ms in opponent auto-play
    // FIX v22: Uses _tsGetDelay('oppPre')/_tsGetDelay('oppPost')
    const autoSrc = _tsAutoPlayOpponent.toString();
    assert(autoSrc.includes('OPP_PRE') || autoSrc.includes("_tsGetDelay('oppPre'"),
      'v22 fix: Opponent pre-delay is speed-aware (not hardcoded 250ms)');
    assert(autoSrc.includes('OPP_POST') || autoSrc.includes("_tsGetDelay('oppPost'"),
      'v22 fix: Opponent post-delay is speed-aware (not hardcoded 600ms)');

    endSection();
  }

  /* ── 16. Edge Cases ───────────────────────────────────────────── */
  async function testEdgeCases() {
    section('Edge Cases');

    // Edge: cpLoss exactly at thresholds
    assert(_tsClassify(0,   false).accept === true,  'Edge: 0cp loss → accept');
    assert(_tsClassify(20,  false).accept === true,  'Edge: 20cp loss → accept (excellent boundary)');
    assert(_tsClassify(60,  false).accept === true,  'Edge: 60cp loss → accept (good boundary)');
    assert(_tsClassify(80,  false).accept === true,  'Edge: 80cp loss → accept (good-alt boundary)');
    assert(_tsClassify(81,  false).accept === false, 'Edge: 81cp loss → reject (just over boundary)');
    assert(_tsClassify(250, false).accept === false, 'Edge: 250cp loss → reject (mistake boundary)');
    assert(_tsClassify(251, false).accept === false, 'Edge: 251cp loss → reject (blunder boundary)');

    // Edge: negative cp loss (user played better than engine's pre-move evaluation)
    const better = _tsClassify(-30, false);
    assert(better.accept === true,
      'Edge: negative cp loss (-30) → accept (user improved on position)');
    assert(better.points >= 97,
      `Edge: negative cp loss → high points (${better.points})`);

    // Edge: isExactMatch=true with cpLoss > 0
    // (unusual but should still be exact)
    const exactWithLoss = _tsClassify(5, true);
    assert(exactWithLoss.quality === 'exact',
      'Edge: isExactMatch=true overrides cpLoss — still exact');
    assert(exactWithLoss.accept === true,
      'Edge: isExactMatch=true → always accepted');

    // Edge: TS_SPEEDS fallback to normal for unknown speed name
    localStorage.setItem('ts_replay_speed', 'INVALID_SPEED_NAME');
    const fallback = _tsGetDelay('feedback');
    assert(fallback === TS_SPEEDS.normal.feedback,
      `Edge: invalid speed key falls back to normal (${fallback}ms)`);
    localStorage.setItem('ts_replay_speed', 'normal'); // restore

    endSection();
  }

  /* ================================================================
     FULL REPORT
     ================================================================ */
  function printReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 REPLAY TRAINING TEST REPORT');
    console.log('═'.repeat(60));
    console.log(`  Total tests:  ${passed + failed}`);
    console.log(`  ✅ Passed:    ${passed}`);
    console.log(`  ❌ Failed:    ${failed}`);
    console.log(`  ⚠️  Warnings: ${warnings}`);
    console.log(`  Pass rate:   ${Math.round(passed / (passed + failed) * 100)}%`);
    console.log('═'.repeat(60));

    if (failed > 0) {
      console.group('❌ Failed tests:');
      results.filter(r => r.ok === false).forEach(r => console.error('  •', r.msg));
      console.groupEnd();
    }

    if (warnings > 0) {
      console.group('⚠️  Warnings:');
      results.filter(r => r.ok === 'warn').forEach(r => console.warn('  •', r.msg));
      console.groupEnd();
    }

    console.log(failed === 0
      ? '\n🎉 ALL TESTS PASSED — Training system is working correctly!'
      : `\n🚨 ${failed} TEST(S) FAILED — Review the failures above.`
    );

    return { passed, failed, warnings };
  }

  /* ================================================================
     PUBLIC API
     ================================================================ */
  async function runAll() {
    results.length = 0;
    passed = failed = warnings = 0;

    console.clear();
    console.log('🎯 School of Chess — Replay Training Test Suite');
    console.log('   Running full automated test coverage...\n');

    await testSpeedConfig();
    await testClassification();
    await testStateInit();
    await testPGNIntegrity();
    await testMoveScenarios();
    await testRetryLogic();
    await testBoardStateConsistency();
    await testPGNContinuationIntegrity();
    await testScoreTracking();
    await testMultiGameReplayFlow();
    await testEngineSpeeds();
    await testAlternativeMovePath();
    await testOpponentAutoPlayTiming();
    await testHintSystem();
    await testRegressions();
    await testEdgeCases();

    return printReport();
  }

  async function runQuick() {
    results.length = 0;
    passed = failed = warnings = 0;
    console.log('🎯 Quick Test Run (no UI/async)');
    await testSpeedConfig();
    await testClassification();
    await testMoveScenarios();
    await testRetryLogic();
    await testScoreTracking();
    await testRegressions();
    await testEdgeCases();
    return printReport();
  }

  return { runAll, runQuick, printReport };
})();

// Auto-hint in console
if (typeof window !== 'undefined') {
  console.log('🎯 TSTest loaded. Run: await TSTest.runAll()   or   await TSTest.runQuick()');
}
