// ============================================
// حقل الألغام - Dragon Ball Z Minesweeper Battle
// نظام الأدوار التبادلي - Pure Luck Edition
// ============================================

// ===== Audio Engine =====
class SoundEngine {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  play(type) {
    if (!this.ctx) return;
    try {
      switch (type) {
        case 'click':   this._osc(800, 'sine', 0.08, 0.10); break;
        case 'place':   this._osc(300, 'triangle', 0.15, 0.12);
                        setTimeout(() => this._osc(450, 'triangle', 0.1, 0.10), 50); break;
        case 'safe':    this._osc(660, 'sine', 0.2, 0.10);
                        setTimeout(() => this._osc(880, 'sine', 0.2, 0.10), 100); break;
        case 'explode': this._boom(); break;
        case 'win':     this._win(); break;
        case 'tick':    this._osc(1000, 'sine', 0.03, 0.05); break;
        case 'switch':  this._osc(400, 'triangle', 0.15, 0.08); break;
      }
    } catch (e) {}
  }
  _osc(freq, type, duration, gain = 0.15) {
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.type  = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + duration);
  }
  _boom() {
    const buf  = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.6, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    src.connect(g).connect(this.ctx.destination);
    src.start();
    this._osc(60, 'sine', 0.5, 0.3);
    this._osc(40, 'sine', 0.7, 0.2);
  }
  _win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this._osc(f, 'sine', 0.3, 0.12), i * 130));
    setTimeout(() => this._osc(1047, 'triangle', 0.7, 0.15), 600);
  }
}
const sound = new SoundEngine();

// ===== Game State =====
const G = {
  // Setup
  roomCode: null, isHost: false, vsAI: true,
  gridSize: 8, mineCount: 10,

  // Placement
  myMines: new Set(),        // mines I place ON opponent's board
  oppMines: new Set(),       // mines opponent placed ON my board
  minesRemaining: 0,
  placementDone: false, oppPlacementDone: false,

  // My board (I reveal, opponent's mines are hidden here)
  myRevealed:  new Set(),
  myExploded:  new Set(),

  // Opponent board (opponent reveals, my mines are hidden here) - for spectator view
  oppRevealed: new Set(),
  oppExploded: new Set(),

  // Turn
  myTurn: true,   // true = my turn to click, false = watching opponent
  gameOver: false, iWin: false,
  isWatching: false, // Are we currently in spectator mode?

  // Stats
  startTime: null, totalClicks: 0,

  // Timer (placement)
  timerInterval: null, timeLeft: 20,

  // Multiplayer
  channel: null, oppConnected: false, connectionTimeoutId: null,
};

// ===== Utilities =====
function genCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('');
}
function idx(r, c)   { return r * G.gridSize + c; }
function coord(i)    { return { r: Math.floor(i / G.gridSize), c: i % G.gridSize }; }
function adj(r, c) {
  const a = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < G.gridSize && nc >= 0 && nc < G.gridSize) a.push({r: nr, c: nc});
    }
  return a;
}
function showToast(msg, type = 'info') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById(id);
  if (s) s.classList.add('active');
}

// ===== Particles =====
function createParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration  = (5 + Math.random() * 10) + 's';
    p.style.animationDelay     = (Math.random() * 8) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    c.appendChild(p);
  }
}

// ===== Landing =====
function initLanding() {
  document.getElementById('btn-start').addEventListener('click', () => {
    sound.init(); sound.play('click');
    showScreen('screen-lobby');
  });
}

// ===== Lobby =====
function initLobby() {
  document.getElementById('btn-create-room').addEventListener('click', () => {
    sound.play('click'); showScreen('screen-create');
  });
  document.getElementById('btn-join-room').addEventListener('click', () => {
    sound.play('click');
    const jf = document.getElementById('join-form');
    jf.classList.toggle('active');
    if (jf.classList.contains('active')) document.getElementById('join-code-input').focus();
  });
  document.getElementById('join-code-input').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  });
  document.getElementById('btn-join-submit').addEventListener('click', () => {
    const code = document.getElementById('join-code-input').value.trim();
    if (code.length !== 6) { showToast('يرجى إدخال كود من 6 أحرف', 'error'); return; }
    sound.play('click'); joinRoom(code);
  });
  document.getElementById('join-code-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-join-submit').click();
  });
  document.getElementById('lobby-back').addEventListener('click', () => {
    sound.play('click'); cleanupChannel(); showScreen('screen-landing');
  });
}

// ===== Create Room =====
function initCreate() {
  const gridSel = document.getElementById('grid-size');
  const mineSel = document.getElementById('mine-count');
  gridSel.addEventListener('change', () => updateMineOpts());
  document.getElementById('toggle-ai').addEventListener('click', () => {
    document.getElementById('toggle-ai').classList.add('active');
    document.getElementById('toggle-player').classList.remove('active');
    G.vsAI = true; sound.play('click');
  });
  document.getElementById('toggle-player').addEventListener('click', () => {
    document.getElementById('toggle-player').classList.add('active');
    document.getElementById('toggle-ai').classList.remove('active');
    G.vsAI = false; sound.play('click');
  });
  document.getElementById('btn-create-start').addEventListener('click', () => {
    G.gridSize   = parseInt(gridSel.value);
    G.mineCount  = parseInt(mineSel.value);
    G.isHost     = true;
    G.roomCode   = genCode();
    sound.play('click');
    if (G.vsAI) {
      startPlacement();
    } else {
      setupChannel(); showWaiting();
    }
  });
  document.getElementById('create-back').addEventListener('click', () => {
    sound.play('click'); showScreen('screen-lobby');
  });
  updateMineOpts();
}

function updateMineOpts() {
  const size  = parseInt(document.getElementById('grid-size').value);
  const total = size * size;
  const sel   = document.getElementById('mine-count');
  sel.innerHTML = '';
  [
    { l: `سهل (${Math.floor(total * 0.12)})`, v: Math.floor(total * 0.12) },
    { l: `متوسط (${Math.floor(total * 0.18)})`, v: Math.floor(total * 0.18) },
    { l: `صعب (${Math.floor(total * 0.25)})`, v: Math.floor(total * 0.25) },
    { l: `جهنم (${Math.floor(total * 0.35)})`, v: Math.floor(total * 0.35) },
  ].filter(o => o.v >= 1).forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.v; opt.textContent = o.l; sel.appendChild(opt);
  });
  if (sel.options.length >= 2) sel.selectedIndex = 1;
}

// ===== Channel (Multiplayer) =====
let G_FirebaseChannel = null;

function setupChannel() {
  cleanupChannel();
  
  // Check if Firebase is available
  if (typeof firebase === 'undefined' || !firebase.database) {
    console.warn('Firebase not available - using local BroadcastChannel fallback');
    setupLocalChannel();
    return;
  }

  try {
    const database = firebase.database();
    const roomRef = database.ref(`rooms/${G.roomCode}`);
    
    G_FirebaseChannel = {
      roomRef: roomRef,
      messagesRef: database.ref(`rooms/${G.roomCode}/messages`),
      database: database,
      listeners: [],
      isOpen: true
    };

    // Initialize room in database
    if (G.isHost) {
      roomRef.set({
        created: Date.now(),
        host: true,
        players: 1
      }).catch(err => {
        console.error('Failed to create room:', err);
        showToast('خطأ في إنشاء الغرفة', 'error');
      });
    } else {
      // Guest joining
      roomRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
          showToast('لم يُعثر على الغرفة. تحقق من الكود', 'error');
          G_FirebaseChannel.isOpen = false;
          return;
        }
        // Room exists, update player count
        roomRef.update({ players: 2 }).catch(err => console.error('Join error:', err));
      });
    }

    // Listen for messages
    const messagesRef = G_FirebaseChannel.messagesRef;
    messagesRef.limitToLast(50).on('child_added', (snapshot) => {
      const msg = snapshot.val();
      if (msg && G_FirebaseChannel && G_FirebaseChannel.isOpen) {
        handleChannelMsg(msg);
      }
    });

    G_FirebaseChannel.listeners.push({ ref: messagesRef, event: 'child_added' });
  } catch (error) {
    console.error('Firebase setup error:', error);
    showToast('خطأ في الاتصال بالخادم', 'error');
    setupLocalChannel();
  }
}

// Fallback to BroadcastChannel if Firebase unavailable
function setupLocalChannel() {
  try {
    G.channel = new BroadcastChannel(`minebattle-${G.roomCode}`);
    G.channel.onmessage = e => handleChannelMsg(e.data);
    console.log('Using local BroadcastChannel (same device only)');
  } catch (error) {
    console.error('BroadcastChannel not available:', error);
  }
}

function cleanupChannel() {
  if (G_FirebaseChannel) {
    try {
      if (G_FirebaseChannel.messagesRef) {
        G_FirebaseChannel.messagesRef.off('child_added');
      }
      G_FirebaseChannel.isOpen = false;
      G_FirebaseChannel = null;
    } catch (error) {
      console.error('Error cleaning up Firebase channel:', error);
    }
  }
  if (G.channel) {
    G.channel.close();
    G.channel = null;
  }
}

function send(msg) {
  if (G_FirebaseChannel && G_FirebaseChannel.isOpen) {
    // Send via Firebase
    try {
      msg.timestamp = Date.now();
      msg.sender = G.isHost ? 'host' : 'guest';
      G_FirebaseChannel.messagesRef.push(msg).catch(err => {
        console.error('Error sending message:', err);
      });
    } catch (error) {
      console.error('Send error:', error);
    }
  } else if (G.channel) {
    // Fallback to BroadcastChannel
    G.channel.postMessage(msg);
  }
}

function handleChannelMsg(msg) {
  // Ignore our own messages
  if (msg.sender === (G.isHost ? 'host' : 'guest')) {
    return;
  }

  switch (msg.type) {
    case 'join':
      clearTimeout(G.connectionTimeoutId); // Clear timeout on successful connection
      G.oppConnected = true;
      showToast('✅ انضم خصمك! جاهز للمعركة ⚡', 'success');
      send({ type: 'settings', gridSize: G.gridSize, mineCount: G.mineCount });
      setTimeout(() => startPlacement(), 800);
      break;
    case 'settings':
      clearTimeout(G.connectionTimeoutId); // Clear timeout on successful connection
      G.gridSize = msg.gridSize; G.mineCount = msg.mineCount;
      G.oppConnected = true;
      startPlacement();
      break;
    case 'mines-placed':
      G.oppMines = new Set(msg.mines);
      G.oppPlacementDone = true;
      if (G.placementDone) beginGame();
      break;
    case 'opp-move':
      // Opponent revealed a cell on THEIR board (which has MY mines)
      applyOppMove(msg.cellIndex, msg.isExploded);
      break;
    case 'game-over':
      if (!G.gameOver) endGame(msg.iWin); // if opponent says they won, I lost
      break;
  }
}

function joinRoom(code) {
  G.roomCode = code; G.isHost = false; G.vsAI = false;
  setupChannel();
  send({ type: 'join' });
  showToast('🔌 جاري الاتصال بالغرفة...', 'info');
  
  // Wait up to 10 seconds for connection
  const timeoutId = setTimeout(() => { 
    if (!G.oppConnected) {
      console.warn(`Connection timeout for room code: ${code}`);
      showToast('❌ لم يُعثر على الغرفة.\n\nتحقق من:\n✓ الكود صحيح (6 أحرف)\n✓ Firebase مهيأ\n✓ الخصم في الغرفة', 'error');
      cleanupChannel();
      resetGame();
      showScreen('screen-lobby');
    }
  }, 10000);
  
  // Store timeout ID so we can clear it when connection succeeds
  G.connectionTimeoutId = timeoutId;
}

// ===== Waiting Room =====
function showWaiting() {
  document.getElementById('waiting-room-code').textContent = G.roomCode;
  showScreen('screen-waiting');
  document.getElementById('waiting-room-code').addEventListener('click', () => {
    navigator.clipboard.writeText(G.roomCode).then(() => showToast('تم نسخ الكود!', 'success'))
      .catch(() => showToast('الكود: ' + G.roomCode, 'info'));
  });
}
function initWaiting() {
  document.getElementById('waiting-back').addEventListener('click', () => {
    sound.play('click'); cleanupChannel(); resetGame(); showScreen('screen-lobby');
  });
}

// ===== Placement Phase =====
function startPlacement() {
  G.myMines.clear(); G.minesRemaining = G.mineCount;
  G.placementDone = false; G.oppPlacementDone = false;
  if (G.vsAI) { generateAIMines(); G.oppPlacementDone = true; }
  showScreen('screen-placement');
  buildPlacementGrid();
  updateMineCtr();
  startPlacementTimer();
}

function generateAIMines() {
  const total = G.gridSize * G.gridSize;
  G.oppMines.clear();
  while (G.oppMines.size < G.mineCount) G.oppMines.add(Math.floor(Math.random() * total));
}

function buildPlacementGrid() {
  const grid = document.getElementById('placement-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${G.gridSize},1fr)`;
  for (let i = 0; i < G.gridSize * G.gridSize; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell cell-placement';
    cell.dataset.index = i;
    cell.addEventListener('click', () => onPlacementClick(i, cell));
    grid.appendChild(cell);
  }
}

function onPlacementClick(i, cell) {
  if (G.placementDone) return;
  if (G.myMines.has(i)) {
    G.myMines.delete(i);
    cell.className = 'cell cell-placement';
    G.minesRemaining++;
    sound.play('click');
  } else if (G.minesRemaining > 0) {
    G.myMines.add(i);
    cell.className = 'cell cell-mine-placed';
    G.minesRemaining--;
    sound.play('place');
  } else {
    showToast('وضعت كل الألغام! اضغط على لغم لإزالته', 'warning');
  }
  updateMineCtr();
}

function updateMineCtr() {
  const el = document.getElementById('mines-remaining');
  if (el) el.textContent = G.minesRemaining;
}

function startPlacementTimer() {
  G.timeLeft = 20;
  clearInterval(G.timerInterval);
  const vEl = document.getElementById('placement-timer-value');
  const cEl = document.getElementById('placement-timer-circle');
  updateTimerEl(vEl, cEl);
  G.timerInterval = setInterval(() => {
    G.timeLeft--;
    updateTimerEl(vEl, cEl);
    if (G.timeLeft <= 5) sound.play('tick');
    if (G.timeLeft <= 0) { clearInterval(G.timerInterval); finishPlacement(); }
  }, 1000);
}

function updateTimerEl(vEl, cEl) {
  if (vEl) {
    vEl.textContent = G.timeLeft;
    vEl.className = 'timer-value';
    if (G.timeLeft <= 5)  vEl.classList.add('critical');
    else if (G.timeLeft <= 10) vEl.classList.add('warning');
  }
  if (cEl) cEl.style.setProperty('--timer-progress', (G.timeLeft / 20 * 100) + '%');
}

function finishPlacement() {
  clearInterval(G.timerInterval);
  G.placementDone = true;
  // Auto-fill remaining
  if (G.myMines.size < G.mineCount) {
    const total = G.gridSize * G.gridSize;
    while (G.myMines.size < G.mineCount) {
      const r = Math.floor(Math.random() * total);
      if (!G.myMines.has(r)) G.myMines.add(r);
    }
    showToast('تم ملء الألغام المتبقية تلقائياً', 'info');
  }
  send({ type: 'mines-placed', mines: [...G.myMines] });
  if (G.oppPlacementDone) beginGame();
  else showToast('بانتظار الخصم لوضع ألغامه...', 'info');
}

function initPlacement() {
  document.getElementById('btn-finish-placement').addEventListener('click', () => {
    if (G.myMines.size < G.mineCount) {
      showToast(`ضع ${G.mineCount - G.myMines.size} ألغام إضافية أو انتظر الوقت`, 'warning'); return;
    }
    sound.play('click'); finishPlacement();
  });
  document.getElementById('placement-back').addEventListener('click', () => {
    sound.play('click'); clearInterval(G.timerInterval); resetGame(); showScreen('screen-lobby');
  });
}

// ===== Begin Game =====
function beginGame() {
  G.myRevealed.clear();  G.myExploded.clear();
  G.oppRevealed.clear(); G.oppExploded.clear();
  G.gameOver = false; G.iWin = false;
  G.myTurn = G.isHost || G.vsAI; // host / player1 goes first
  G.startTime = Date.now(); G.totalClicks = 0;
  G.isWatching = false;
  showScreen('screen-game');
  renderBoard();
  updateTurnUI();
}

// ===== Render Board =====
function renderBoard() {
  const grid = document.getElementById('game-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${G.gridSize},1fr)`;

  // Decide which board to show: my board (G.myTurn && !G.isWatching) OR opponent board (G.isWatching)
  const total    = G.gridSize * G.gridSize;
  const showOpp  = G.isWatching;
  const mines    = showOpp ? G.myMines    : G.oppMines;
  const revealed = showOpp ? G.oppRevealed: G.myRevealed;
  const exploded = showOpp ? G.oppExploded: G.myExploded;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement('button');
    cell.id = `cell-${i}`;

    if (exploded.has(i)) {
      cell.className = 'cell cell-exploded';
      cell.disabled  = true;
    } else if (revealed.has(i)) {
      cell.className = 'cell cell-revealed';
      cell.disabled  = true;
    } else {
      cell.className = showOpp ? 'cell cell-hidden cell-opp-view' : 'cell cell-hidden';
      cell.disabled  = showOpp; // disable clicks when watching opp
      if (!showOpp && !G.isWatching && G.myTurn && !G.gameOver)
        cell.addEventListener('click', () => onMyClick(i));
    }
    grid.appendChild(cell);
  }
}

// ===== My Turn: Click a cell on MY board =====
function onMyClick(i) {
  if (G.gameOver || !G.myTurn || G.isWatching) return;
  if (G.myRevealed.has(i) || G.myExploded.has(i)) return;

  G.totalClicks++;
  const isMine = G.oppMines.has(i);

  if (isMine) {
    // Explode!
    G.myExploded.add(i);
    sound.play('explode');
    triggerExplosionFX();
    updateCellUI(i, 'cell-exploded', false);

    const remaining = G.oppMines.size - G.myExploded.size;
    if (remaining <= 0) {
      // All MY mines exploded → I LOSE
      setTimeout(() => endGame(false), 1000);
      return;
    }
    showToast(`💥 انفجر لغم! المتبقية: ${remaining}`, 'warning');
  } else {
    G.myRevealed.add(i);
    sound.play('safe');
    updateCellUI(i, 'cell-revealed', false);
    showToast('✅ مربع آمن!', 'success');
    // Note: removed flood reveal — only the clicked cell is revealed
  }

  // Notify opponent about my move
  send({ type: 'opp-move', cellIndex: i, isExploded: isMine });

  // Disable my board, switch to watch opponent
  G.myTurn = false;
  setTimeout(() => switchToOppTurn(), 900);
}

function floodReveal(i, mines, revealed, exploded, isOpp) {
  // If chosen cell has 0 adjacent mines, auto reveal neighbors
  const {r, c} = coord(i);
  const adjacentMines = adj(r, c).filter(a => mines.has(idx(a.r, a.c))).length;
  if (adjacentMines > 0) return;

  adj(r, c).forEach(a => {
    const ai = idx(a.r, a.c);
    if (!revealed.has(ai) && !exploded.has(ai) && !mines.has(ai)) {
      revealed.add(ai);
      updateCellUI(ai, 'cell-revealed', isOpp);
      floodReveal(ai, mines, revealed, exploded, isOpp);
    }
  });
}

// ===== Switch to Opponent Turn =====
function switchToOppTurn() {
  G.isWatching = true;
  updateTurnUI();
  renderBoard(); // Show OPP board in spectator mode

  if (G.vsAI) {
    // AI picks after a short delay
    setTimeout(() => doAITurn(), 1200);
  }
  // For multiplayer: wait for 'opp-move' message from channel
}

// ===== AI Turn =====
function doAITurn() {
  if (G.gameOver) return;
  const total     = G.gridSize * G.gridSize;
  const available = [];
  for (let i = 0; i < total; i++) {
    if (!G.oppRevealed.has(i) && !G.oppExploded.has(i)) available.push(i);
  }
  if (!available.length) { switchBackToMyTurn(); return; }

  const chosen  = available[Math.floor(Math.random() * available.length)];
  const isMine  = G.myMines.has(chosen);

  if (isMine) {
    G.oppExploded.add(chosen);
    sound.play('explode');
    triggerExplosionFX();
    updateCellUI(chosen, 'cell-exploded', true);

    const remaining = G.myMines.size - G.oppExploded.size;
    if (remaining <= 0) {
      // All OPP mines exploded → OPP LOSES → I WIN
      setTimeout(() => endGame(true), 1000);
      return;
    }
    showToast(`💥 الخصم فجّر لغم! المتبقية: ${remaining}`, 'info');
  } else {
    G.oppRevealed.add(chosen);
    updateCellUI(chosen, 'cell-revealed', true);
    // Note: removed flood reveal — AI reveals only the chosen cell
    showToast('الخصم كشف مربعاً آمناً', 'info');
  }

  setTimeout(() => switchBackToMyTurn(), 1200);
}

// ===== Opponent move received (Multiplayer) =====
function applyOppMove(i, isExploded) {
  if (!G.isWatching) { G.isWatching = true; renderBoard(); updateTurnUI(); }

  if (isExploded) {
    G.oppExploded.add(i);
    sound.play('explode');
    triggerExplosionFX();
    updateCellUI(i, 'cell-exploded', true);

    const remaining = G.myMines.size - G.oppExploded.size;
    if (remaining <= 0) { setTimeout(() => endGame(true), 900); return; }
    showToast(`💥 الخصم فجّر لغم! المتبقية: ${remaining}`, 'info');
  } else {
    G.oppRevealed.add(i);
    updateCellUI(i, 'cell-revealed', true);
    // Note: removed flood reveal — opponent reveal affects only that cell
  }

  setTimeout(() => switchBackToMyTurn(), 1200);
}

// ===== Switch Back to My Turn =====
function switchBackToMyTurn() {
  if (G.gameOver) return;
  G.isWatching = false;
  G.myTurn     = true;
  sound.play('switch');
  renderBoard();
  updateTurnUI();
}

// ===== Update Single Cell UI =====
function updateCellUI(i, cls, isOpp) {
  // If currently showing the right board, update in place
  const el = document.getElementById(`cell-${i}`);
  if (!el) return;
  const showingOpp = G.isWatching;
  if ((isOpp && showingOpp) || (!isOpp && !showingOpp)) {
    el.className = `cell ${cls}`;
    el.disabled  = true;
  }
}

// ===== Turn UI =====
function updateTurnUI() {
  const label  = document.getElementById('turn-label');
  const subLbl = document.getElementById('board-sublabel');
  const badge  = document.getElementById('turn-badge');

  if (G.isWatching) {
    label.textContent  = '👁️ تشاهد الخصم';
    subLbl.textContent = '📡 شاشة الخصم - ضع عينيك!';
    badge.className    = 'turn-badge watching';
    badge.textContent  = 'مشاهدة';
  } else {
    label.textContent  = '⚔️ دورك!';
    subLbl.textContent = '🪐 شبكتك - اختر كوكباً بحذر!';
    badge.className    = 'turn-badge my-turn';
    badge.textContent  = 'دورك';
  }

  // Update mine counters
  const myLeft  = G.oppMines.size - G.myExploded.size;
  const oppLeft = G.myMines.size  - G.oppExploded.size;
  const myEl    = document.getElementById('my-mines-left');
  const oppEl   = document.getElementById('opp-mines-left');
  if (myEl)  myEl.textContent  = myLeft  < 0 ? 0 : myLeft;
  if (oppEl) oppEl.textContent = oppLeft < 0 ? 0 : oppLeft;
}

// ===== Explosion FX =====
function triggerExplosionFX() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
  const ov = document.createElement('div');
  ov.className = 'explosion-overlay';
  document.body.appendChild(ov);
  setTimeout(() => ov.remove(), 800);
}

// ===== Victory FX =====
function createVictoryFX() {
  const ov     = document.createElement('div');
  ov.className = 'victory-overlay';
  document.body.appendChild(ov);
  const colors = ['#ffd740','#ff6d00','#00e676','#42a5f5','#7c4dff','#ff1744'];
  for (let i = 0; i < 80; i++) {
    const k = document.createElement('div');
    k.className = 'confetti';
    k.style.left            = Math.random() * 100 + '%';
    k.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    k.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    k.style.animationDelay    = Math.random() * 0.5 + 's';
    k.style.width = k.style.height = (6 + Math.random() * 8) + 'px';
    k.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    ov.appendChild(k);
  }
  setTimeout(() => ov.remove(), 4000);
}

// ===== End Game =====
function endGame(iWin) {
  G.gameOver = true; G.iWin = iWin;
  clearInterval(G.timerInterval);

  if (iWin) { sound.play('win'); createVictoryFX(); }
  else       { sound.play('explode'); }

  send({ type: 'game-over', iWin: !iWin }); // tell opponent the opposite

  const elapsed = Math.floor((Date.now() - G.startTime) / 1000);
  const min     = Math.floor(elapsed / 60);
  const sec     = elapsed % 60;

  document.getElementById('result-icon').textContent = iWin ? '🏆' : '💥';
  const title = document.getElementById('result-title');
  title.textContent = iWin ? '🎉 فوز ساحق!' : '💀 انفجرت كل ألغامك!';
  title.className   = `result-title ${iWin ? 'win' : 'lose'}`;
  document.getElementById('result-message').textContent = iWin
    ? 'خصمك فجّر آخر لغم في شبكته! أنت البطل!'
    : 'انفجر آخر لغم في شبكتك! حاول مرة أخرى!';
  document.getElementById('stat-time').textContent     = `${min}:${sec.toString().padStart(2,'0')}`;
  document.getElementById('stat-revealed').textContent = G.totalClicks;
  document.getElementById('stat-mines').textContent    = G.oppMines.size;

  setTimeout(() => showScreen('screen-result'), iWin ? 1800 : 1200);
}

// ===== Result Screen =====
function initResult() {
  document.getElementById('btn-play-again').addEventListener('click', () => {
    sound.play('click'); resetGame(); showScreen('screen-lobby');
  });
  document.getElementById('btn-back-home').addEventListener('click', () => {
    sound.play('click'); resetGame(); showScreen('screen-landing');
  });
}

// ===== Reset =====
function resetGame() {
  clearInterval(G.timerInterval); cleanupChannel();
  G.roomCode = null; G.isHost = false;
  G.myMines.clear(); G.oppMines.clear();
  G.myRevealed.clear(); G.myExploded.clear();
  G.oppRevealed.clear(); G.oppExploded.clear();
  G.gameOver = false; G.iWin = false;
  G.myTurn = true; G.isWatching = false;
  G.oppConnected = false; G.placementDone = false; G.oppPlacementDone = false;
  G.totalClicks = 0;
  const jf = document.getElementById('join-form');
  if (jf) jf.classList.remove('active');
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initLanding();
  initLobby();
  initCreate();
  initPlacement();
  initWaiting();
  initResult();
  showScreen('screen-landing');
});
