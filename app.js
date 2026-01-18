// Drinking Jenga - Game Logic with Interactive Components

// ===================================
// Game State
// ===================================
const gameState = {
  playerCount: 4,
  currentPlayer: 1,
  selectedDifficulties: ['calm'],
  taskPool: [],
  penaltyPool: [],
  currentTaskIndex: 0,
  tasksCompleted: 0,
  blocksRemaining: 54,
  isGameActive: false,
  currentTask: null
};

// ===================================
// DOM Elements
// ===================================
const elements = {
  // Screens
  setupScreen: document.getElementById('setup-screen'),
  gameScreen: document.getElementById('game-screen'),
  
  // Setup elements
  playerCountInput: document.getElementById('player-count'),
  minusBtn: document.querySelector('.number-btn.minus'),
  plusBtn: document.querySelector('.number-btn.plus'),
  calmToggle: document.getElementById('calm-toggle'),
  mildToggle: document.getElementById('mild-toggle'),
  crazyToggle: document.getElementById('crazy-toggle'),
  startBtn: document.getElementById('start-btn'),
  
  // Game elements
  currentPlayerDisplay: document.getElementById('current-player'),
  taskCard: document.getElementById('task-card'),
  taskText: document.getElementById('task-text'),
  taskDifficulty: document.getElementById('task-difficulty'),
  pullBtn: document.getElementById('pull-btn'),
  towerFellBtn: document.getElementById('tower-fell-btn'),
  newGameBtn: document.getElementById('new-game-btn'),
  tasksCompletedDisplay: document.getElementById('tasks-completed'),
  blocksRemainingDisplay: document.getElementById('blocks-remaining'),
  
  // Penalty Modal
  penaltyModal: document.getElementById('penalty-modal'),
  penaltyPlayer: document.getElementById('penalty-player'),
  penaltyText: document.getElementById('penalty-text'),
  penaltyDoneBtn: document.getElementById('penalty-done-btn'),

  // Fuse Timer Modal
  fuseModal: document.getElementById('fuse-modal'),
  fuseTaskTitle: document.getElementById('fuse-task-title'),
  fuseTaskText: document.getElementById('fuse-task-text'),
  fuseSpark: document.getElementById('fuse-spark'),
  fuseBurned: document.getElementById('fuse-burned'),
  fuseBomb: document.getElementById('fuse-bomb'),
  fuseWarning: document.getElementById('fuse-warning'),
  fuseControls: document.getElementById('fuse-controls'),
  fuseSkipBtn: document.getElementById('fuse-skip-btn'),
  fuseResult: document.getElementById('fuse-result'),
  fuseResultText: document.getElementById('fuse-result-text'),
  fuseDoneBtn: document.getElementById('fuse-done-btn'),

  // Countdown Modal
  countdownModal: document.getElementById('countdown-modal'),
  countdownTitle: document.getElementById('countdown-title'),
  countdownTaskText: document.getElementById('countdown-task-text'),
  countdownCircle: document.getElementById('countdown-circle'),
  countdownProgress: document.getElementById('countdown-progress'),
  countdownNumber: document.getElementById('countdown-number'),
  countdownStatus: document.getElementById('countdown-status'),
  countdownStartBtn: document.getElementById('countdown-start-btn'),
  countdownFailBtn: document.getElementById('countdown-fail-btn'),
  countdownDoneBtn: document.getElementById('countdown-done-btn'),

  // Voting Modal
  votingModal: document.getElementById('voting-modal'),
  votingQuestion: document.getElementById('voting-question'),
  votingGrid: document.getElementById('voting-grid'),
  voteCount: document.getElementById('vote-count'),
  voteTotal: document.getElementById('vote-total'),
  votingTally: document.getElementById('voting-tally'),
  votingResult: document.getElementById('voting-result'),
  winnerName: document.getElementById('winner-name'),
  winnerDrinks: document.getElementById('winner-drinks'),
  votingDoneBtn: document.getElementById('voting-done-btn'),

  // Spinner Modal
  spinnerModal: document.getElementById('spinner-modal'),
  spinnerTitle: document.getElementById('spinner-title'),
  spinnerTaskText: document.getElementById('spinner-task-text'),
  wheel: document.getElementById('wheel'),
  spinBtn: document.getElementById('spin-btn'),
  spinnerResult: document.getElementById('spinner-result'),
  spinnerWinnerName: document.getElementById('spinner-winner-name'),
  spinnerWinnerTask: document.getElementById('spinner-winner-task'),
  spinnerDoneBtn: document.getElementById('spinner-done-btn')
};

// ===================================
// Interactive Component Controllers
// ===================================

// Fuse Timer Controller
const fuseController = {
  timer: null,
  sizzleSound: null,
  duration: 0,
  elapsed: 0,
  
  start(task, config) {
    // Calculate duration
    this.duration = this.calculateDuration(config.duration);
    this.elapsed = 0;
    this.config = config;
    
    // Setup UI
    elements.fuseTaskTitle.textContent = task.text.split('!')[0] + '!';
    elements.fuseTaskText.textContent = task.text;
    elements.fuseBurned.style.width = '0%';
    elements.fuseSpark.style.left = '0%';
    elements.fuseResult.classList.add('hidden');
    elements.fuseControls.classList.remove('hidden');
    elements.fuseWarning.textContent = 'Keep passing!';
    document.querySelector('.fuse-body').classList.remove('hidden');
    
    // Show modal
    elements.fuseModal.classList.add('active');
    
    // Start sound
    sounds.init();
    this.sizzleSound = sounds.startFuseSizzle();
    
    // Start timer
    const startTime = Date.now();
    this.timer = setInterval(() => {
      this.elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(this.elapsed / this.duration, 1);
      
      // Update fuse visual
      elements.fuseBurned.style.width = (progress * 100) + '%';
      elements.fuseSpark.style.left = (progress * 100) + '%';
      
      // Intensify sound as time progresses
      if (this.sizzleSound) {
        this.sizzleSound.intensify(1 + progress);
      }
      
      // Update warning text
      if (progress > 0.7) {
        elements.fuseWarning.textContent = 'HURRY!';
        elements.fuseWarning.style.color = '#FF0000';
      } else if (progress > 0.5) {
        elements.fuseWarning.textContent = 'FASTER!';
        elements.fuseWarning.style.color = '#FF6B00';
      }
      
      // Time's up!
      if (progress >= 1) {
        this.explode(config);
      }
    }, 50);
  },
  
  calculateDuration(formula) {
    if (typeof formula === 'number') return formula;
    
    // Parse formulas like "3+2n"
    const n = gameState.playerCount;
    if (formula.includes('n')) {
      const parts = formula.split('+');
      const base = parseInt(parts[0]) || 0;
      const multiplier = parseInt(parts[1]) || 0;
      return base + (multiplier * n);
    }
    return parseInt(formula) || 10;
  },
  
  explode(config) {
    clearInterval(this.timer);
    if (this.sizzleSound) this.sizzleSound.stop();
    
    // Play explosion sound
    if (config.sound === 'explosion') {
      sounds.explosion();
    } else {
      sounds.buzzer();
    }
    
    // Show result, hide controls
    document.querySelector('.fuse-body').classList.add('hidden');
    elements.fuseControls.classList.add('hidden');
    elements.fuseResult.classList.remove('hidden');
    elements.fuseResultText.textContent = config.resultText || 'BOOM! Time\'s up!';
    
    // Reset warning color
    elements.fuseWarning.style.color = '';
  },
  
  skip() {
    // Immediately explode
    this.explode(this.config);
  },
  
  close() {
    clearInterval(this.timer);
    if (this.sizzleSound) this.sizzleSound.stop();
    elements.fuseModal.classList.remove('active');
    advanceToNextPlayer();
  }
};

// Countdown Timer Controller
const countdownController = {
  timer: null,
  duration: 0,
  remaining: 0,
  isRunning: false,
  circumference: 2 * Math.PI * 45, // SVG circle radius is 45
  
  start(task, config) {
    this.duration = config.duration;
    this.remaining = config.duration;
    this.isRunning = false;
    
    // Setup UI
    elements.countdownTitle.textContent = 'Challenge Time!';
    elements.countdownTaskText.textContent = processTaskText(config.task, gameState.currentPlayer, gameState.playerCount);
    elements.countdownNumber.textContent = this.duration;
    elements.countdownStatus.textContent = 'Press Start when ready!';
    elements.countdownStatus.className = 'countdown-status';
    elements.countdownProgress.style.strokeDashoffset = '0';
    elements.countdownProgress.className = 'countdown-progress';
    elements.countdownStartBtn.classList.remove('hidden');
    elements.countdownDoneBtn.classList.add('hidden');
    
    // Show modal
    elements.countdownModal.classList.add('active');
    sounds.init();
  },
  
  begin() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    elements.countdownStartBtn.classList.add('hidden');
    elements.countdownFailBtn.classList.remove('hidden');
    elements.countdownStatus.textContent = 'GO!';
    
    sounds.chime();
    
    const startTime = Date.now();
    const totalMs = this.duration * 1000;
    
    this.timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.remaining = Math.ceil((totalMs - elapsed) / 1000);
      const progress = elapsed / totalMs;
      
      // Update circle
      const offset = this.circumference * progress;
      elements.countdownProgress.style.strokeDashoffset = offset;
      
      // Update number
      elements.countdownNumber.textContent = Math.max(0, this.remaining);
      
      // Update colors based on progress
      if (progress > 0.8) {
        elements.countdownProgress.className = 'countdown-progress danger';
      } else if (progress > 0.5) {
        elements.countdownProgress.className = 'countdown-progress warning';
      }
      
      // Tick sounds for last 5 seconds
      if (this.remaining <= 5 && this.remaining > 0 && elapsed % 1000 < 50) {
        sounds.countdownBeep(this.remaining === 1);
      }
      
      // Pulse animation
      if (elapsed % 1000 < 50) {
        elements.countdownNumber.classList.add('pulse');
        setTimeout(() => elements.countdownNumber.classList.remove('pulse'), 500);
      }
      
      // Complete
      if (progress >= 1) {
        this.complete();
      }
    }, 50);
  },
  
  complete() {
    clearInterval(this.timer);
    this.isRunning = false;
    
    sounds.fanfare();
    
    elements.countdownNumber.textContent = '✓';
    elements.countdownStatus.textContent = 'TIME! Great job!';
    elements.countdownStatus.className = 'countdown-status complete';
    elements.countdownFailBtn.classList.add('hidden');
    elements.countdownDoneBtn.classList.remove('hidden');
  },
  
  fail() {
    clearInterval(this.timer);
    this.isRunning = false;
    
    sounds.buzzer();
    
    elements.countdownNumber.textContent = '✗';
    elements.countdownStatus.textContent = 'FAILED! Take your penalty drinks!';
    elements.countdownStatus.className = 'countdown-status failed';
    elements.countdownFailBtn.classList.add('hidden');
    elements.countdownDoneBtn.classList.remove('hidden');
  },
  
  close() {
    clearInterval(this.timer);
    elements.countdownFailBtn.classList.add('hidden');
    elements.countdownModal.classList.remove('active');
    advanceToNextPlayer();
  }
};

// Voting Controller
const votingController = {
  votes: {},
  totalVotes: 0,
  config: null,
  
  start(task, config) {
    this.votes = {};
    this.totalVotes = 0;
    this.config = config;
    
    // Setup UI
    elements.votingQuestion.textContent = config.question;
    elements.voteCount.textContent = '0';
    elements.voteTotal.textContent = gameState.playerCount;
    elements.votingResult.classList.add('hidden');
    elements.votingTally.classList.remove('hidden');
    
    // Generate player buttons (anonymous voting - no counts shown)
    elements.votingGrid.innerHTML = '';
    for (let i = 1; i <= gameState.playerCount; i++) {
      const btn = document.createElement('button');
      btn.className = 'vote-btn';
      btn.dataset.player = i;
      btn.textContent = `Player ${i}`;
      btn.addEventListener('click', () => this.castVote(i));
      elements.votingGrid.appendChild(btn);
    }
    
    // Show modal
    elements.votingModal.classList.add('active');
    sounds.init();
  },
  
  castVote(playerNum) {
    sounds.vote();
    
    // Increment vote (anonymous - no count shown)
    this.votes[playerNum] = (this.votes[playerNum] || 0) + 1;
    this.totalVotes++;
    
    // Update vote progress only
    elements.voteCount.textContent = this.totalVotes;
    
    // Brief visual feedback without showing count
    const btn = elements.votingGrid.querySelector(`[data-player="${playerNum}"]`);
    btn.classList.add('voted');
    setTimeout(() => btn.classList.remove('voted'), 300);
    
    // Check if all votes are in
    if (this.totalVotes >= gameState.playerCount) {
      setTimeout(() => this.revealWinner(), 500);
    }
  },
  
  revealWinner() {
    // Find winner (most votes)
    let maxVotes = 0;
    let winners = [];
    
    for (const [player, votes] of Object.entries(this.votes)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winners = [player];
      } else if (votes === maxVotes) {
        winners.push(player);
      }
    }
    
    // Random tiebreaker
    const winner = winners[Math.floor(Math.random() * winners.length)];
    
    sounds.fanfare();
    
    // Show result
    elements.votingTally.classList.add('hidden');
    elements.votingResult.classList.remove('hidden');
    elements.winnerName.textContent = `Player ${winner}`;
    elements.winnerDrinks.textContent = this.config.resultText || 'drinks!';
  },
  
  close() {
    elements.votingModal.classList.remove('active');
    advanceToNextPlayer();
  }
};

// Spinner Controller
const spinnerController = {
  isSpinning: false,
  rotation: 0,
  config: null,
  
  start(task, config) {
    this.config = config;
    this.isSpinning = false;
    this.rotation = 0;
    
    // Setup UI
    elements.spinnerTitle.textContent = 'Spin the Wheel!';
    elements.spinnerTaskText.textContent = task.text;
    elements.wheel.style.transform = 'rotate(0deg)';
    elements.spinBtn.disabled = false;
    elements.spinBtn.classList.remove('hidden');
    elements.spinnerResult.classList.add('hidden');
    document.querySelector('.wheel-container').classList.remove('hidden');
    
    // Generate wheel segments
    this.generateWheel();
    
    // Show modal
    elements.spinnerModal.classList.add('active');
    sounds.init();
  },
  
  generateWheel() {
    elements.wheel.innerHTML = '';
    const segmentAngle = 360 / gameState.playerCount;
    
    for (let i = 0; i < gameState.playerCount; i++) {
      const segment = document.createElement('div');
      segment.className = 'wheel-segment';
      segment.style.setProperty('--segment-angle', segmentAngle + 'deg');
      segment.style.transform = `rotate(${i * segmentAngle - 90}deg) skewY(${90 - segmentAngle}deg)`;
      segment.innerHTML = `<span>P${i + 1}</span>`;
      elements.wheel.appendChild(segment);
    }
  },
  
  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    elements.spinBtn.disabled = true;
    
    sounds.drumroll(3);
    
    // Calculate spin
    const extraSpins = 5 + Math.random() * 3; // 5-8 full rotations
    const segmentAngle = 360 / gameState.playerCount;
    const winningSegment = Math.floor(Math.random() * gameState.playerCount);
    const targetAngle = (extraSpins * 360) + (winningSegment * segmentAngle) + (segmentAngle / 2);
    
    this.rotation = targetAngle;
    elements.wheel.style.transform = `rotate(${targetAngle}deg)`;
    
    // Click sounds during spin
    let clicks = 0;
    const clickInterval = setInterval(() => {
      sounds.spinnerClick();
      clicks++;
      if (clicks > 30) clearInterval(clickInterval);
    }, 100);
    
    // Reveal winner after spin
    setTimeout(() => {
      clearInterval(clickInterval);
      this.revealWinner(winningSegment + 1);
    }, 4000);
  },
  
  revealWinner(playerNum) {
    this.isSpinning = false;
    
    sounds.fanfare();
    
    // Show result
    elements.spinBtn.classList.add('hidden');
    elements.spinnerResult.classList.remove('hidden');
    elements.spinnerWinnerName.textContent = `Player ${playerNum}`;
    elements.spinnerWinnerTask.textContent = this.config.resultText || 'was chosen!';
  },
  
  close() {
    elements.spinnerModal.classList.remove('active');
    advanceToNextPlayer();
  }
};

// ===================================
// Utility Functions
// ===================================

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random other player number
 */
function getRandomOtherPlayer(currentPlayer, totalPlayers) {
  if (totalPlayers <= 1) return currentPlayer;
  let other;
  do {
    other = getRandomInt(1, totalPlayers);
  } while (other === currentPlayer);
  return other;
}

/**
 * Process task text by replacing placeholders
 */
function processTaskText(text, currentPlayer, totalPlayers) {
  let processed = text;
  processed = processed.replace(/\{player\}/gi, `Player ${currentPlayer}`);
  processed = processed.replace(/\{all\}/gi, 'everyone');
  while (processed.includes('{other}')) {
    const otherPlayer = getRandomOtherPlayer(currentPlayer, totalPlayers);
    processed = processed.replace('{other}', `Player ${otherPlayer}`);
  }
  return processed;
}

// ===================================
// Game Setup Functions
// ===================================

function updatePlayerCount(delta) {
  let newValue = parseInt(elements.playerCountInput.value) + delta;
  newValue = Math.max(2, Math.min(20, newValue));
  elements.playerCountInput.value = newValue;
  gameState.playerCount = newValue;
}

function getSelectedDifficulties() {
  const difficulties = [];
  if (elements.calmToggle.checked) difficulties.push('calm');
  if (elements.mildToggle.checked) difficulties.push('mild');
  if (elements.crazyToggle.checked) difficulties.push('crazy');
  return difficulties;
}

function validateSetup() {
  return getSelectedDifficulties().length > 0;
}

function buildTaskPool() {
  const difficulties = gameState.selectedDifficulties;
  let tasks = [];
  
  difficulties.forEach(difficulty => {
    if (TASKS[difficulty]) {
      TASKS[difficulty].forEach(task => {
        tasks.push({ 
          ...task, 
          difficulty: difficulty 
        });
      });
    }
  });
  
  return shuffleArray(tasks);
}

function buildPenaltyPool() {
  const difficulties = gameState.selectedDifficulties;
  let penalties = [];
  
  difficulties.forEach(difficulty => {
    if (PENALTIES[difficulty]) {
      PENALTIES[difficulty].forEach(penalty => {
        penalties.push({ 
          ...penalty, 
          difficulty: difficulty 
        });
      });
    }
  });
  
  return shuffleArray(penalties);
}

function startGame() {
  if (!validateSetup()) {
    alert('Please select at least one difficulty level!');
    return;
  }
  
  // Initialize sound system
  sounds.init();
  
  gameState.playerCount = parseInt(elements.playerCountInput.value);
  gameState.selectedDifficulties = getSelectedDifficulties();
  gameState.currentPlayer = 1;
  gameState.currentTaskIndex = 0;
  gameState.tasksCompleted = 0;
  gameState.blocksRemaining = 54;
  gameState.isGameActive = true;
  
  gameState.taskPool = buildTaskPool();
  gameState.penaltyPool = buildPenaltyPool();
  
  updateGameUI();
  
  elements.setupScreen.classList.remove('active');
  elements.gameScreen.classList.add('active');
}

// ===================================
// Game Play Functions
// ===================================

function updateGameUI() {
  elements.currentPlayerDisplay.textContent = `Player ${gameState.currentPlayer}`;
  elements.tasksCompletedDisplay.textContent = gameState.tasksCompleted;
  elements.blocksRemainingDisplay.textContent = gameState.blocksRemaining;
}

function getNextTask() {
  if (gameState.currentTaskIndex >= gameState.taskPool.length) {
    gameState.taskPool = shuffleArray(gameState.taskPool);
    gameState.currentTaskIndex = 0;
  }
  
  const task = gameState.taskPool[gameState.currentTaskIndex];
  gameState.currentTaskIndex++;
  
  return task;
}

function displayTask(task) {
  const processedText = processTaskText(
    task.text, 
    gameState.currentPlayer, 
    gameState.playerCount
  );
  
  sounds.cardFlip();
  elements.taskCard.classList.add('flip');
  
  setTimeout(() => {
    elements.taskText.textContent = processedText;
    elements.taskDifficulty.textContent = task.difficulty;
    elements.taskDifficulty.className = 'task-difficulty ' + task.difficulty;
  }, 300);
  
  setTimeout(() => {
    elements.taskCard.classList.remove('flip');
  }, 600);
}

function handleTask(task) {
  gameState.currentTask = task;
  
  // Display on main card first
  displayTask(task);
  
  // Then launch interactive component if needed
  setTimeout(() => {
    switch (task.type) {
      case 'timer':
        fuseController.start(task, task.config);
        break;
      case 'countdown':
        countdownController.start(task, task.config);
        break;
      case 'vote':
        votingController.start(task, task.config);
        break;
      case 'spinner':
        spinnerController.start(task, task.config);
        break;
      default:
        // Standard task - just advance after a moment
        break;
    }
  }, 700);
}

function pullBlock() {
  if (!gameState.isGameActive) return;
  
  sounds.init();
  
  const task = getNextTask();
  handleTask(task);
  
  gameState.tasksCompleted++;
  gameState.blocksRemaining = Math.max(0, gameState.blocksRemaining - 1);
  
  // Only advance player for standard tasks
  // Interactive tasks advance after completion
  if (task.type === 'standard') {
    gameState.currentPlayer++;
    if (gameState.currentPlayer > gameState.playerCount) {
      gameState.currentPlayer = 1;
    }
  }
  
  updateGameUI();
}

function advanceToNextPlayer() {
  gameState.currentPlayer++;
  if (gameState.currentPlayer > gameState.playerCount) {
    gameState.currentPlayer = 1;
  }
  updateGameUI();
}

function getRandomPenalty() {
  if (gameState.penaltyPool.length === 0) {
    gameState.penaltyPool = buildPenaltyPool();
  }
  const index = getRandomInt(0, gameState.penaltyPool.length - 1);
  return gameState.penaltyPool[index];
}

function towerFell() {
  if (!gameState.isGameActive) return;
  
  sounds.init();
  sounds.explosion();
  
  const penalty = getRandomPenalty();
  const processedText = processTaskText(
    penalty.text,
    gameState.currentPlayer,
    gameState.playerCount
  );
  
  elements.penaltyPlayer.textContent = `Player ${gameState.currentPlayer}`;
  elements.penaltyText.textContent = processedText;
  elements.penaltyModal.classList.add('active');
  
  gameState.isGameActive = false;
}

function closePenaltyModal() {
  elements.penaltyModal.classList.remove('active');
  resetToSetup();
}

function resetToSetup() {
  gameState.isGameActive = false;
  
  elements.taskText.textContent = 'Pull a block to reveal your task!';
  elements.taskDifficulty.textContent = '';
  elements.taskDifficulty.className = 'task-difficulty';
  
  elements.gameScreen.classList.remove('active');
  elements.setupScreen.classList.add('active');
}

// ===================================
// Event Listeners
// ===================================

// Player count controls
elements.minusBtn.addEventListener('click', () => updatePlayerCount(-1));
elements.plusBtn.addEventListener('click', () => updatePlayerCount(1));
elements.playerCountInput.addEventListener('change', (e) => {
  let value = parseInt(e.target.value);
  if (isNaN(value)) value = 4;
  value = Math.max(2, Math.min(20, value));
  e.target.value = value;
  gameState.playerCount = value;
});

elements.playerCountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    startGame();
  }
});

// Start game
elements.startBtn.addEventListener('click', startGame);

// Game controls
elements.pullBtn.addEventListener('click', pullBlock);
elements.towerFellBtn.addEventListener('click', towerFell);
elements.newGameBtn.addEventListener('click', resetToSetup);

// Penalty modal
elements.penaltyDoneBtn.addEventListener('click', closePenaltyModal);
elements.penaltyModal.querySelector('.modal-overlay').addEventListener('click', closePenaltyModal);

// Fuse modal
elements.fuseDoneBtn.addEventListener('click', () => fuseController.close());
elements.fuseSkipBtn.addEventListener('click', () => fuseController.skip());

// Countdown modal
elements.countdownStartBtn.addEventListener('click', () => countdownController.begin());
elements.countdownFailBtn.addEventListener('click', () => countdownController.fail());
elements.countdownDoneBtn.addEventListener('click', () => countdownController.close());

// Voting modal
elements.votingDoneBtn.addEventListener('click', () => votingController.close());

// Spinner modal
elements.spinBtn.addEventListener('click', () => spinnerController.spin());
elements.spinnerDoneBtn.addEventListener('click', () => spinnerController.close());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    // Check if any modal is open
    const modalsOpen = 
      elements.penaltyModal.classList.contains('active') ||
      elements.fuseModal.classList.contains('active') ||
      elements.countdownModal.classList.contains('active') ||
      elements.votingModal.classList.contains('active') ||
      elements.spinnerModal.classList.contains('active');
    
    if (!modalsOpen && gameState.isGameActive) {
      e.preventDefault();
      pullBlock();
    }
  }
  
  if (e.code === 'Escape') {
    if (elements.penaltyModal.classList.contains('active')) {
      closePenaltyModal();
    } else if (elements.fuseModal.classList.contains('active')) {
      fuseController.close();
    } else if (elements.countdownModal.classList.contains('active')) {
      countdownController.close();
    } else if (elements.votingModal.classList.contains('active')) {
      votingController.close();
    } else if (elements.spinnerModal.classList.contains('active')) {
      spinnerController.close();
    } else if (elements.gameScreen.classList.contains('active')) {
      resetToSetup();
    }
  }
});

// ===================================
// Initialization
// ===================================

gameState.playerCount = parseInt(elements.playerCountInput.value);

// Count tasks
const countTasks = (tasks) => {
  let counts = { standard: 0, timer: 0, countdown: 0, vote: 0, spinner: 0 };
  Object.values(tasks).forEach(arr => {
    arr.forEach(t => {
      counts[t.type || 'standard']++;
    });
  });
  return counts;
};

const taskCounts = countTasks(TASKS);
console.log('🏗️ Drinking Jenga loaded!');
console.log(`📋 Tasks: ${Object.values(TASKS).reduce((a, b) => a + b.length, 0)} total`);
console.log(`   Standard: ${taskCounts.standard}, Timer: ${taskCounts.timer}, Countdown: ${taskCounts.countdown}, Vote: ${taskCounts.vote}, Spinner: ${taskCounts.spinner}`);
console.log(`⚠️ Penalties: ${Object.values(PENALTIES).reduce((a, b) => a + b.length, 0)} total`);
