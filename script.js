// Enhanced Game State
let gameState = {
  secretNumber: null,
  attempts: 0,
  gameActive: true,
  currentEra: "cosmic",
  power: 100,
  minRange: 1,
  maxRange: 100,
  xp: parseInt(localStorage.getItem("xp")) || 0,
  level: parseInt(localStorage.getItem("level")) || 1,
  totalGuesses: parseInt(localStorage.getItem("totalGuesses")) || 0,
  numbersFound: parseInt(localStorage.getItem("numbersFound")) || 0,
  unlockedSkills: JSON.parse(localStorage.getItem("unlockedSkills")) || [],
  collectedNumbers: JSON.parse(localStorage.getItem("collectedNumbers")) || [],
  currentTheme: localStorage.getItem("currentTheme") || "galaxy",
  currentStreak: parseInt(localStorage.getItem("currentStreak")) || 0,
  bestStreak: parseInt(localStorage.getItem("bestStreak")) || 0,
  difficulty: localStorage.getItem("difficulty") || "explorer",
  gameMode: "classic", // 'classic' or 'timeAttack'
  timeLeft: 60,
  timerInterval: null,
  timeAttackScore: 0,
  timeAttackDuration: 60,
  bestTimeAttackScore:
    parseInt(localStorage.getItem("bestTimeAttackScore")) || 0,
};

// Level progression system
const levelRequirements = [
  { xp: 0, title: "Number Novice" },
  { xp: 100, title: "Math Apprentice" },
  { xp: 300, title: "Numerical Scholar" },
  { xp: 600, title: "Cosmic Explorer" },
  { xp: 1000, title: "Math Mystic" },
  { xp: 1500, title: "Number Sage" },
  { xp: 2100, title: "Mathematical Master" },
  { xp: 2800, title: "Cosmic Numerologist" },
  { xp: 3600, title: "Infinity Walker" },
  { xp: 4500, title: "Number Deity" },
];

// Difficulty settings
const difficultySettings = {
  novice: { min: 1, max: 50, xpMultiplier: 0.8 },
  explorer: { min: 1, max: 100, xpMultiplier: 1.0 },
  master: { min: 1, max: 200, xpMultiplier: 1.3 },
  cosmic: { min: 1, max: 500, xpMultiplier: 1.7 },
};

// Special numbers collection
const specialNumbers = {
  7: {
    name: "Lucky Seven",
    description: "Considered lucky across cultures and mathematics",
  },
  42: {
    name: "Answer to Everything",
    description: "The answer to life, the universe, and everything",
  },
  137: {
    name: "Fine Structure",
    description: "Fine-structure constant approximation",
  },
  1729: {
    name: "Taxicab Number",
    description:
      "Smallest number expressible as sum of two cubes in two different ways",
  },
  6174: {
    name: "Kaprekar's Constant",
    description: "Magic constant in Kaprekar's routine",
  },
  8128: {
    name: "Perfect Number",
    description: "Fourth perfect number in mathematics",
  },
};

// Skill definitions
const skills = {
  "range-boost": {
    name: "Range Sense",
    cost: 5,
    description: "Get more accurate range hints",
    effect: "range_accuracy",
  },
  "prime-vision": {
    name: "Prime Vision",
    cost: 10,
    description: "Identify prime numbers in hints",
    effect: "prime_detection",
  },
  "time-warp": {
    name: "Time Warp",
    cost: 15,
    description: "Slow down cosmic energy depletion",
    effect: "power_conservation",
  },
  "cosmic-insight": {
    name: "Cosmic Insight",
    cost: 20,
    description: "Receive deeper mathematical insights",
    effect: "enhanced_hints",
  },
};

// DOM Elements
const guessInput = document.getElementById("guess-input");
const guessBtn = document.getElementById("guess-btn");
const hintText = document.getElementById("hint-text");
const hintEmoji = document.getElementById("hint-emoji");
const attemptsCount = document.getElementById("attempts-count");
const xpValue = document.getElementById("xp-value");
const levelValue = document.getElementById("level-value");
const rangeValue = document.getElementById("range-value");
const winMessage = document.getElementById("win-message");
const newGameBtn = document.getElementById("new-game-btn");
const storyFragment = document.getElementById("story-fragment");
const numberProperties = document.getElementById("number-properties");

// Menu Elements
const sideMenu = document.getElementById("side-menu");
const menuToggle = document.getElementById("menu-toggle");
const menuOverlay = document.getElementById("menu-overlay");
const mainContainer = document.getElementById("main-container");

// Progression Elements
const levelNumber = document.getElementById("level-number");
const levelTitle = document.getElementById("level-title");
const progressionFill = document.getElementById("progression-fill");
const menuTotalGuesses = document.getElementById("menu-total-guesses");
const menuNumbersFound = document.getElementById("menu-numbers-found");
const menuAccuracy = document.getElementById("menu-accuracy");
const menuStreak = document.getElementById("menu-streak");

// Background Elements
const bgParticles = document.getElementById("bg-particles");
const mathPattern = document.getElementById("math-pattern");

// Achievement Popup
const achievementPopup = document.getElementById("achievement-popup");
const achievementTitle = document.getElementById("achievement-title");
const achievementDesc = document.getElementById("achievement-desc");

// Add this to your DOM elements section
const userManualBtn = document.getElementById('user-manual-btn');
const userManualModal = document.getElementById('user-manual-modal');
const closeManualBtn = document.getElementById('close-manual');
const manualOverlay = document.getElementById('manual-overlay');

// Initialize Enhanced Game
function initEnhancedGame() {
  // Apply saved theme
  document.body.className = `theme-${gameState.currentTheme}`;

  // Set initial ranges based on difficulty
  const difficulty = difficultySettings[gameState.difficulty];
  gameState.minRange = difficulty.min;
  gameState.maxRange = difficulty.max;
  gameState.secretNumber = generateSecretNumber();
  gameState.attempts = 0;
  gameState.gameActive = true;
  gameState.power = 100;

  // Reset timer if switching from Time Attack
  resetTimer();

  // Reset timer only when starting a NEW Time Attack game
  if (
    gameState.gameMode === "timeAttack" &&
    (!gameState.timerInterval || gameState.timeLeft <= 0)
  ) {
    resetTimer();
    toggleTimeProgressBar(false); // Hide progress bar when initializing
    startTimeAttack();
  }

  // Update UI
  updateGameUI();
  updateProgressionUI();
  updatePowerDisplay();
  createDynamicBackground();

  // SHOW INITIAL HINT FROM THE START
  showInitialHint();

  console.log("Secret number:", gameState.secretNumber);
}

// Add this new function to generate initial hint
function showInitialHint() {
  const { hint, emoji, story } = generateInitialHint();
  showHint(hint, emoji);

  // Show the story fragment from the beginning
  showInitialStory(story);

  // Add to game log
  const attemptsList = document.getElementById("attempts-list");
  attemptsList.innerHTML = ""; // Clear any previous content

  const initialHintItem = document.createElement("div");
  initialHintItem.className = "attempt-item";
  initialHintItem.innerHTML = `
            <span class="attempt-number">-</span>
            <span class="attempt-hint">${hint}</span>
        `;
  attemptsList.prepend(initialHintItem);
}

// Add this new function for initial hint generation
function generateInitialHint() {
  let hint = "";
  let emoji = "🔮";
  let story = "";

  // Generate the detailed story based on number properties (without revealing the number)
  if (specialNumbers[gameState.secretNumber]) {
    const special = specialNumbers[gameState.secretNumber];
    story = `<strong>${special.name}</strong><p>${special.description}</p>`;
    hint = "A legendary mathematical constant awaits discovery!";
    emoji = "🌟";
  } else if (isPrime(gameState.secretNumber)) {
    story = `<strong>Prime Number</strong><p>A fundamental building block of mathematics, divisible only by 1 and itself.</p>`;
    hint = "Prime energy resonates through the cosmos!";
    emoji = "✨";
  } else if (isPerfectSquare(gameState.secretNumber)) {
    const root = Math.sqrt(gameState.secretNumber);
    story = `<strong>Perfect Square</strong><p>Forms a perfect geometric pattern in the cosmic grid.</p>`;
    hint = "Geometric harmony detected in the quantum field!";
    emoji = "🔷";
  } else if (isFibonacci(gameState.secretNumber)) {
    story = `<strong>Fibonacci Number</strong><p>Part of nature's favorite sequence, appearing in sunflowers and galaxies alike.</p>`;
    hint = "Golden ratio harmonics echo through space-time!";
    emoji = "📐";
  } else if (gameState.secretNumber % 2 === 0) {
    story = `<strong>Even Number</strong><p>Balanced cosmic energy flows through this number.</p>`;
    hint = "Even frequencies pulse through the universe!";
    emoji = "⚡";
  } else {
    story = `<strong>Odd Number</strong><p>Unique asymmetric vibrations characterize this cosmic value.</p>`;
    hint = "Odd resonances create complex cosmic patterns!";
    emoji = "🌀";
  }

  // Add range information to hint
  const difficulty = difficultySettings[gameState.difficulty];
  hint += ` Explore between ${difficulty.min} and ${difficulty.max}.`;

  return { hint, emoji, story };
}

// Show the initial story without revealing the number
function showInitialStory(story) {
  let propertiesHTML = "";

  // Add number properties tags
  if (isPrime(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag prime">Prime</span>`;
  }
  if (isPerfectSquare(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag square">Perfect Square</span>`;
  }
  if (isFibonacci(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag fibonacci">Fibonacci</span>`;
  }
  if (gameState.secretNumber % 2 === 0) {
    propertiesHTML += `<span class="property-tag even">Even</span>`;
  } else {
    propertiesHTML += `<span class="property-tag odd">Odd</span>`;
  }

  storyFragment.innerHTML = story;
  numberProperties.innerHTML = propertiesHTML;
  storyFragment.style.display = "block";
}

// Generate secret number with special properties
function generateSecretNumber() {
  const difficulty = difficultySettings[gameState.difficulty];
  const num =
    Math.floor(Math.random() * (difficulty.max - difficulty.min + 1)) +
    difficulty.min;

  // 20% chance for special number properties
  if (Math.random() < 0.2) {
    // Try to generate a number with interesting properties
    const specialCandidates = [];
    for (let i = difficulty.min; i <= difficulty.max; i++) {
      if (
        isPrime(i) ||
        isPerfectSquare(i) ||
        isFibonacci(i) ||
        Object.keys(specialNumbers).includes(i.toString())
      ) {
        specialCandidates.push(i);
      }
    }
    if (specialCandidates.length > 0) {
      return specialCandidates[
        Math.floor(Math.random() * specialCandidates.length)
      ];
    }
  }

  return num;
}

// Update game UI
function updateGameUI() {
  attemptsCount.textContent = gameState.attempts;
  xpValue.textContent = gameState.xp;
  levelValue.textContent = gameState.level;
  rangeValue.textContent = `${gameState.minRange} - ${gameState.maxRange}`;

  guessInput.value = "";
  guessInput.min = gameState.minRange;
  guessInput.max = gameState.maxRange;
  guessInput.placeholder = `Enter guess (${gameState.minRange}-${gameState.maxRange})`;

  winMessage.style.display = "none";
  newGameBtn.style.display = "none";
  storyFragment.style.display = "none";

  // Update difficulty buttons
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.difficulty === gameState.difficulty
    );
  });
}

// Update progression UI
function updateProgressionUI() {
  const currentLevel = levelRequirements[gameState.level - 1];
  const nextLevel =
    levelRequirements[gameState.level] ||
    levelRequirements[levelRequirements.length - 1];

  levelNumber.textContent = gameState.level;
  levelTitle.textContent = currentLevel.title;

  const xpProgress = gameState.xp - currentLevel.xp;
  const xpNeeded = nextLevel.xp - currentLevel.xp;
  const progressPercent = (xpProgress / xpNeeded) * 100;

  progressionFill.style.width = `${Math.min(progressPercent, 100)}%`;
  menuTotalGuesses.textContent = gameState.totalGuesses;
  menuNumbersFound.textContent = gameState.numbersFound;

  // Calculate accuracy
  const accuracy =
    gameState.totalGuesses > 0
      ? Math.round((gameState.numbersFound / gameState.totalGuesses) * 100)
      : 0;
  menuAccuracy.textContent = `${accuracy}%`;

  menuStreak.textContent = gameState.currentStreak;

  // Update skill tree
  updateSkillTree();

  // Update collection
  updateNumberCollection();
}

// Update skill tree
function updateSkillTree() {
  document.querySelectorAll(".skill-node").forEach((node) => {
    const skillId = node.dataset.skill;
    const skill = skills[skillId];

    node.classList.remove("unlocked", "available", "locked");

    if (gameState.unlockedSkills.includes(skillId)) {
      node.classList.add("unlocked");
    } else if (gameState.xp >= skill.cost) {
      node.classList.add("available");
    } else {
      node.classList.add("locked");
    }
  });
}

// Update number collection
function updateNumberCollection() {
  document.querySelectorAll(".collection-card").forEach((card) => {
    const number = card.dataset.number;

    card.classList.remove("unlocked", "locked");

    if (gameState.collectedNumbers.includes(number)) {
      card.classList.add("unlocked");
    } else {
      card.classList.add("locked");
    }
  });
}

// Create dynamic background
function createDynamicBackground() {
  // Clear existing elements
  bgParticles.innerHTML = "";
  mathPattern.innerHTML = "";

  // Create particles based on theme
  const particleCount = gameState.currentTheme === "galaxy" ? 50 : 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random properties based on theme
    const size = Math.random() * 4 + 1;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const duration = Math.random() * 30 + 20;
    const delay = Math.random() * 20;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.top = `${top}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    // Theme-specific colors
    if (gameState.currentTheme === "nebula") {
      particle.style.background = `rgba(255, 182, 193, ${
        Math.random() * 0.3 + 0.1
      })`;
    } else if (gameState.currentTheme === "sunset") {
      particle.style.background = `rgba(255, 165, 0, ${
        Math.random() * 0.3 + 0.1
      })`;
    } else if (gameState.currentTheme === "forest") {
      particle.style.background = `rgba(34, 139, 34, ${
        Math.random() * 0.3 + 0.1
      })`;
    } else if (gameState.currentTheme === "ocean") {
      particle.style.background = `rgba(30, 144, 255, ${
        Math.random() * 0.3 + 0.1
      })`;
    } else if (gameState.currentTheme === "lava") {
      particle.style.background = `rgba(255, 69, 0, ${
        Math.random() * 0.3 + 0.1
      })`;
    } else {
      particle.style.background = `rgba(255, 255, 255, ${
        Math.random() * 0.2 + 0.1
      })`;
    }

    bgParticles.appendChild(particle);
  }

  // Create mathematical patterns
  createMathPatterns();
}

// Create mathematical background patterns
function createMathPatterns() {
  // Fibonacci spiral
  const spiral = document.createElement("div");
  spiral.className = "fibonacci-spiral";
  spiral.style.width = "200px";
  spiral.style.height = "200px";
  spiral.style.top = "10%";
  spiral.style.right = "10%";
  mathPattern.appendChild(spiral);

  // Prime number grid
  const grid = document.createElement("div");
  grid.className = "prime-grid";
  grid.style.width = "100%";
  grid.style.height = "100%";
  mathPattern.appendChild(grid);
}

// POWER SYSTEM FUNCTIONS
// Update power based on guess accuracy
function updatePower(guess) {
  const difference = Math.abs(gameState.secretNumber - guess);
  const maxDifference = gameState.maxRange - gameState.minRange;

  // Power change based on accuracy
  let powerChange = 0;

  if (difference === 0) {
    // Exact guess - big power boost
    powerChange = 30;
  } else if (difference <= Math.ceil(maxDifference * 0.05)) {
    // Very close (within 5%) - good power gain
    powerChange = 15;
  } else if (difference <= Math.ceil(maxDifference * 0.15)) {
    // Close (within 15%) - small power gain
    powerChange = 8;
  } else if (difference <= Math.ceil(maxDifference * 0.3)) {
    // Moderate distance - neutral
    powerChange = 0;
  } else if (difference <= Math.ceil(maxDifference * 0.5)) {
    // Far away - small power loss
    powerChange = -5;
  } else {
    // Very far away - significant power loss
    powerChange = -10;
  }

  // Apply power change with limits
  gameState.power = Math.max(0, Math.min(100, gameState.power + powerChange));

  // Update power display
  updatePowerDisplay();

  return powerChange;
}

// Update power display in UI
function updatePowerDisplay() {
  const powerBar = document.getElementById("power-bar");
  const powerText = document.getElementById("power-text");

  if (powerBar) {
    powerBar.style.width = `${gameState.power}%`;
  }
  if (powerText) {
    powerText.textContent = `${gameState.power}%`;
  }

  // Change color based on power level
  if (powerBar) {
    if (gameState.power > 70) {
      powerBar.style.background = "var(--success-color)";
    } else if (gameState.power > 30) {
      powerBar.style.background = "var(--warning-color)";
    } else {
      powerBar.style.background = "var(--accent-color)";
    }
  }
}

// Handle guess submission
function handleGuess() {
  if (!gameState.gameActive) {
    initEnhancedGame();
    return;
  }

  const guess = parseInt(guessInput.value);

  // Validate input
  if (
    isNaN(guess) ||
    guess < gameState.minRange ||
    guess > gameState.maxRange
  ) {
    showHint(
      `Please enter a valid number between ${gameState.minRange} and ${gameState.maxRange}`,
      "❌"
    );
    return;
  }

  gameState.attempts++;

  // Update power based on guess accuracy
  const powerChange = updatePower(guess);

  // Update game state
  updateGameUI();

  // Check for special number collection
  checkNumberCollection(guess);

  // Generate and show hint
  const { hint, emoji } = generateEnhancedHint(guess);

  // Add power feedback to hint
  let powerHint = "";
  if (powerChange > 0) {
    powerHint = ` +${powerChange}% power!`;
  } else if (powerChange < 0) {
    powerHint = ` ${powerChange}% power.`;
  }

  showHint(hint + powerHint, emoji);

  // Add to game log with power info
  addToGameLog(guess, hint, powerChange);

  // Check for win
  if (guess === gameState.secretNumber) {
    handleWin();
  }

  // Save progress
  saveGameState();
}

// Generate enhanced hint with skill effects
function generateEnhancedHint(guess) {
  const difference = Math.abs(gameState.secretNumber - guess);
  const maxDifference = gameState.maxRange - gameState.minRange;

  let hint = "";
  let emoji = "";

  // Exact match
  if (difference === 0) {
    return {
      hint: "🎉 COSMIC HARMONY ACHIEVED! You've found the number! 🎉",
      emoji: "🎊",
    };
  }

  // Distance-based hints with skill enhancements
  const rangeMultiplier = gameState.unlockedSkills.includes("range-boost")
    ? 0.8
    : 1;

  if (difference <= Math.ceil(maxDifference * 0.02 * rangeMultiplier)) {
    hint = "⚡ QUANTUM RESONANCE! You're within the atomic field!";
    emoji = "⚡";
  } else if (difference <= Math.ceil(maxDifference * 0.05 * rangeMultiplier)) {
    hint = "🌟 STELLAR CONVERGENCE! Cosmic forces align nearby!";
    emoji = "🌟";
  } else if (difference <= Math.ceil(maxDifference * 0.1 * rangeMultiplier)) {
    hint = "🌀 DIMENSIONAL ECHO! The number's vibration is strong!";
    emoji = "🌀";
  } else if (difference <= Math.ceil(maxDifference * 0.2 * rangeMultiplier)) {
    hint = "🔮 ORACLE'S WHISPER! You're on the right cosmic path...";
    emoji = "🔮";
  } else {
    hint = "🌌 COSMIC STATIC! The signal is faint across the void...";
    emoji = "🌌";
  }

  // Add mathematical insights if skills unlocked
  if (gameState.unlockedSkills.includes("prime-vision")) {
    if (isPrime(gameState.secretNumber)) {
      hint += " The number resonates with prime energy!";
    }
  }

  if (gameState.unlockedSkills.includes("cosmic-insight")) {
    if (isPerfectSquare(gameState.secretNumber)) {
      hint += " Geometric patterns detected!";
    } else if (isFibonacci(gameState.secretNumber)) {
      hint += " Golden ratio harmonics present!";
    }
  }

  // Add direction hint
  if (guess < gameState.secretNumber) {
    hint += " Ascend to higher frequencies!";
  } else {
    hint += " Descend to lower vibrations!";
  }

  return { hint, emoji };
}

// Show hint with animation
function showHint(text, emoji) {
  hintText.textContent = text;
  hintEmoji.textContent = emoji;

  // Animate hint section
  const hintSection = document.querySelector(".hint-section");
  hintSection.classList.remove("active");
  void hintSection.offsetWidth;
  hintSection.classList.add("active");
}

// Add to game log with power information
function addToGameLog(guess, hint, powerChange = 0) {
  const attemptsList = document.getElementById("attempts-list");

  // Remove placeholder
  if (gameState.attempts === 1) {
    attemptsList.innerHTML = "";
  }

  const attemptItem = document.createElement("div");
  attemptItem.className = "attempt-item";

  let powerIndicator = "";
  if (powerChange > 0) {
    powerIndicator = `<span style="color: var(--success-color); margin-left: 10px;">+${powerChange}% ⚡</span>`;
  } else if (powerChange < 0) {
    powerIndicator = `<span style="color: var(--accent-color); margin-left: 10px;">${powerChange}% 🔋</span>`;
  }

  attemptItem.innerHTML = `
            <span class="attempt-number">${guess}</span>
            <span class="attempt-hint">${
              hint.split("!")[0]
            }!${powerIndicator}</span>
        `;

  attemptsList.prepend(attemptItem);
}

// Check number collection
function checkNumberCollection(guess) {
  const guessStr = guess.toString();
  if (
    specialNumbers[guessStr] &&
    !gameState.collectedNumbers.includes(guessStr)
  ) {
    gameState.collectedNumbers.push(guessStr);
    showHint(
      `Discovered legendary number: ${specialNumbers[guessStr].name}!`,
      "🌟"
    );
  }
}
gameState.gameActive = false;

gameState.currentStreak++;

// Modify handleWin for Time Attack mode
function handleWin() {
  if (gameState.gameMode === "timeAttack") {
    // Time Attack mode handling
    // gameState.gameActive = false;

    gameState.currentStreak++;
    gameState.timeAttackScore++;
    gameState.numbersFound++;
    gameState.totalGuesses++;

    // Continue with new number immediately
    gameState.secretNumber = generateSecretNumber();
    gameState.attempts = 0;

    // Show quick success message
    showHint(`✅ Found! +1 point! Total: ${gameState.timeAttackScore}`, "⚡");

    // Reset story fragment
    storyFragment.style.display = "none";

    // Add bonus time for quick guesses
    if (gameState.attempts <= 3) {
      // Add bonus time (5 seconds or 5% of total duration, whichever is larger)
      const bonusTime = Math.max(
        5,
        Math.floor(gameState.timeAttackDuration * 0.05)
      );
      gameState.timeLeft = Math.min(
        gameState.timeAttackDuration,
        gameState.timeLeft + bonusTime
      );
      showHint(`⏱️ +${bonusTime} seconds bonus!`, "🎯");
    }
  } else {
    // Classic mode handling (your existing code)
    gameState.gameActive = false;
    gameState.numbersFound++;
    gameState.currentStreak++;
    gameState.totalGuesses++;

    if (gameState.currentStreak > gameState.bestStreak) {
      gameState.bestStreak = gameState.currentStreak;
    }

    // Calculate XP reward
    const difficulty = difficultySettings[gameState.difficulty];
    const baseXP =
      Math.max(50 - gameState.attempts, 10) * difficulty.xpMultiplier;
    const bonusXP = Object.keys(specialNumbers).includes(
      gameState.secretNumber.toString()
    )
      ? 25
      : 0;
    const streakBonus = Math.floor(gameState.currentStreak / 5) * 10;
    const totalXP = Math.round(baseXP + bonusXP + streakBonus);

    addXP(totalXP);

    // Show win message
    winMessage.textContent = `COSMIC VICTORY! Found in ${gameState.attempts} attempts! +${totalXP} XP`;
    if (streakBonus > 0) {
      winMessage.textContent += ` (+${streakBonus} streak bonus!)`;
    }
    winMessage.style.display = "block";
    newGameBtn.style.display = "block";

    // Show number story
    showNumberStory();

    // Create celebration effects
    createCelebration();
  }

  saveGameState();
}

// Show number story with the actual number revealed (only after winning)
function showNumberStory() {
  let story = "";
  let propertiesHTML = "";

  if (specialNumbers[gameState.secretNumber]) {
    const special = specialNumbers[gameState.secretNumber];
    story = `<strong>${special.name} ${gameState.secretNumber}</strong><p>${special.description}</p>`;
  } else if (isPrime(gameState.secretNumber)) {
    story = `<strong>Prime Number ${gameState.secretNumber}</strong><p>A fundamental building block of mathematics, divisible only by 1 and itself.</p>`;
  } else if (isPerfectSquare(gameState.secretNumber)) {
    const root = Math.sqrt(gameState.secretNumber);
    story = `<strong>Perfect Square ${gameState.secretNumber}</strong><p>Forms a perfect ${root}×${root} geometric pattern in the cosmic grid.</p>`;
  } else if (isFibonacci(gameState.secretNumber)) {
    story = `<strong>Fibonacci Number ${gameState.secretNumber}</strong><p>Part of nature's favorite sequence, appearing in sunflowers and galaxies alike.</p>`;
  } else {
    story = `<strong>Cosmic Number ${gameState.secretNumber}</strong><p>This number holds unique significance in the mathematical universe...</p>`;
  }

  // Add number properties (same as before)
  if (isPrime(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag prime">Prime</span>`;
  }
  if (isPerfectSquare(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag square">Perfect Square</span>`;
  }
  if (isFibonacci(gameState.secretNumber)) {
    propertiesHTML += `<span class="property-tag fibonacci">Fibonacci</span>`;
  }
  if (gameState.secretNumber % 2 === 0) {
    propertiesHTML += `<span class="property-tag even">Even</span>`;
  } else {
    propertiesHTML += `<span class="property-tag odd">Odd</span>`;
  }

  storyFragment.innerHTML = story;
  numberProperties.innerHTML = propertiesHTML;
  storyFragment.style.display = "block";
}

// Add XP and handle level ups
function addXP(amount) {
  gameState.xp += amount;

  // Check for level up
  let newLevel = 1;
  for (let i = 0; i < levelRequirements.length; i++) {
    if (gameState.xp >= levelRequirements[i].xp) {
      newLevel = i + 1;
    }
  }

  if (newLevel > gameState.level) {
    gameState.level = newLevel;
    showAchievement(
      "Level Up!",
      `Reached ${levelRequirements[gameState.level - 1].title}`
    );
  }

  updateProgressionUI();
}

// Show achievement popup
function showAchievement(title, description) {
  achievementTitle.textContent = title;
  achievementDesc.textContent = description;

  achievementPopup.classList.add("show");

  setTimeout(() => {
    achievementPopup.classList.remove("show");
  }, 3000);
}

// Create celebration effects
function createCelebration() {
  // Create floating numbers
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const number = document.createElement("div");
      number.textContent = Math.floor(Math.random() * 10);
      number.style.position = "fixed";
      number.style.fontSize = "24px";
      number.style.color = "#ff7e5f";
      number.style.pointerEvents = "none";
      number.style.zIndex = "1000";
      number.style.left = `${Math.random() * 100}%`;
      number.style.top = "100%";
      number.style.animation = `float 3s ease-in forwards`;

      document.body.appendChild(number);

      setTimeout(() => {
        number.remove();
      }, 3000);
    }, i * 150);
  }
}

// Save game state to localStorage
function saveGameState() {
  localStorage.setItem("xp", gameState.xp.toString());
  localStorage.setItem("level", gameState.level.toString());
  localStorage.setItem("totalGuesses", gameState.totalGuesses.toString());
  localStorage.setItem("numbersFound", gameState.numbersFound.toString());
  localStorage.setItem(
    "unlockedSkills",
    JSON.stringify(gameState.unlockedSkills)
  );
  localStorage.setItem(
    "collectedNumbers",
    JSON.stringify(gameState.collectedNumbers)
  );
  localStorage.setItem("currentTheme", gameState.currentTheme);
  localStorage.setItem("currentStreak", gameState.currentStreak.toString());
  localStorage.setItem("bestStreak", gameState.bestStreak.toString());
  localStorage.setItem("difficulty", gameState.difficulty);
}

// Mathematical helper functions
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function isPerfectSquare(num) {
  return Math.sqrt(num) % 1 === 0;
}

function isFibonacci(num) {
  if (num < 0) return false;
  let a = 0,
    b = 1;
  while (b < num) {
    [a, b] = [b, a + b];
  }
  return b === num || num === 0;
}

// Menu functionality
function toggleMenu() {
  const isOpen = sideMenu.classList.toggle("active");
  menuOverlay.classList.toggle("active", isOpen);
  mainContainer.classList.toggle("menu-open", isOpen);

  if (isOpen) {
    updateProgressionUI();
  }
}

// Change background theme
function changeTheme(themeName) {
  gameState.currentTheme = themeName;
  document.body.className = `theme-${themeName}`;
  createDynamicBackground();
  saveGameState();

  // Update active theme button
  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === themeName);
  });
}

// Unlock skill
function unlockSkill(skillId) {
  const skill = skills[skillId];

  if (
    gameState.xp >= skill.cost &&
    !gameState.unlockedSkills.includes(skillId)
  ) {
    gameState.xp -= skill.cost;
    gameState.unlockedSkills.push(skillId);
    showAchievement("Skill Unlocked!", skill.name);
    updateProgressionUI();
    saveGameState();
  }
}

// Change difficulty
function changeDifficulty(difficulty) {
  gameState.difficulty = difficulty;
  localStorage.setItem("difficulty", difficulty);

  // Reset streak when changing difficulty
  gameState.currentStreak = 0;

  // Start new game with new difficulty
  initEnhancedGame();
}

// Setup event listeners
function setupEventListeners() {
  // Game controls
  guessBtn.addEventListener("click", handleGuess);
  guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleGuess();
  });
  newGameBtn.addEventListener("click", () => {
    // Reset game state and start new game
    gameState.gameActive = true;
    initEnhancedGame();
  });

  // Menu controls
  menuToggle.addEventListener("click", toggleMenu);
  menuOverlay.addEventListener("click", toggleMenu);

  // Theme selection
  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.addEventListener("click", () => changeTheme(btn.dataset.theme));
  });

  // Skill tree
  document.querySelectorAll(".skill-node").forEach((node) => {
    node.addEventListener("click", () => {
      if (!node.classList.contains("locked")) {
        unlockSkill(node.dataset.skill);
      }
    });
  });

  // Difficulty selection
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      changeDifficulty(btn.dataset.difficulty)
    );
  });

  // Powerups (placeholder functionality)
  document.querySelectorAll(".powerup-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showHint("Powerup activated! This feature is coming soon.", "✨");
    });
  });

  // Game mode selection - UPDATE THIS PART
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;

      // Update active button
      document.querySelectorAll(".mode-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });

      // Show/hide duration selector based on mode
      const durationSelector = document.getElementById("time-attack-duration");
      if (mode === "timeAttack") {
        durationSelector.style.display = "flex"; // Show when Time Attack is selected
      } else {
        durationSelector.style.display = "none"; // Hide for Classic mode
      }

      // Change game mode
      gameState.gameMode = mode;

      // Start new game with selected mode
      initEnhancedGame();
    });
  });

  // Duration selection - ADD THIS
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeTimeAttackDuration(btn.dataset.duration);
    });
  });

// User Manual Event Listeners
  document.getElementById('user-manual-btn').addEventListener('click', openUserManual);
  document.getElementById('close-manual').addEventListener('click', closeUserManual);
  document.getElementById('manual-overlay').addEventListener('click', handleManualOverlayClick);
  document.addEventListener('keydown', handleEscapeKey);

}

// Simple Music System
const backgroundMusic = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");
let isMusicPlaying = false;

// Initialize music
function initMusic() {
  // Load saved music state
  const savedState = localStorage.getItem("musicEnabled");
  if (savedState === "true") {
    enableMusic();
  } else {
    disableMusic();
  }

  // Set initial volume
  backgroundMusic.volume = 0.5;

  // Click event for toggle
  musicToggle.addEventListener("click", toggleMusic);
}

function enableMusic() {
  backgroundMusic.play().catch((e) => {
    console.log("Auto-play prevented. Click the music button to start.");
  });
  musicToggle.classList.remove("muted");
  isMusicPlaying = true;
  localStorage.setItem("musicEnabled", "true");
}

function disableMusic() {
  backgroundMusic.pause();
  musicToggle.classList.add("muted");
  isMusicPlaying = false;
  localStorage.setItem("musicEnabled", "false");
}

function toggleMusic() {
  if (isMusicPlaying) {
    disableMusic();
  } else {
    enableMusic();
  }
}

// Initialize the game when page loads
window.addEventListener("load", () => {
  initEnhancedGame();
  setupEventListeners();
  initMusic();
});

// Time Attack Functions
function startTimeAttack() {
  gameState.timeLeft = gameState.timeAttackDuration; // Use selected duration
  gameState.timeAttackScore = 0;
  updateTimerDisplay();
  updateTimeProgressBar();

  // Show timer
  document.getElementById("timer-display").style.display = "block";
  toggleTimeProgressBar(true);

  // Start timer
  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateTimerDisplay();
    updateTimeProgressBar();

    if (gameState.timeLeft <= 0) {
      endTimeAttack();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerValue = document.getElementById("timer-value");
  if (timerValue) {
    // Format time as MM:SS
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerValue.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Change color based on time left (using percentages)
    timerValue.classList.remove("timer-warning", "timer-critical");

    const timePercentage =
      (gameState.timeLeft / gameState.timeAttackDuration) * 100;
    if (timePercentage <= 25) {
      timerValue.classList.add("timer-critical");
    } else if (timePercentage <= 50) {
      timerValue.classList.add("timer-warning");
    }
  }
}

function endTimeAttack() {
  clearInterval(gameState.timerInterval);
  gameState.gameActive = false;

  // Hide progress bar when game ends
  toggleTimeProgressBar(false); // Add this

  // Update best score
  if (gameState.timeAttackScore > gameState.bestTimeAttackScore) {
    gameState.bestTimeAttackScore = gameState.timeAttackScore;
    localStorage.setItem(
      "bestTimeAttackScore",
      gameState.timeAttackScore.toString()
    );

    // Show duration in achievement message
    const durationText = getDurationText(gameState.timeAttackDuration);
    showAchievement(
      "New Record!",
      `Time Attack Score: ${gameState.timeAttackScore} in ${durationText}`
    );
  }

  // Show results
  const durationText = getDurationText(gameState.timeAttackDuration);

  winMessage.innerHTML = `
        <h3>⏰ TIME'S UP! ⏰</h3>
        <p>Numbers Found in ${durationText}: ${gameState.timeAttackScore}</p>
        <p>Best Score: ${gameState.bestTimeAttackScore}</p>
        ${
          gameState.timeAttackScore > 0
            ? "<p>⚡ Amazing speed! ⚡</p>"
            : "<p>Keep practicing!</p>"
        }
    `;
  winMessage.style.display = "block";
  newGameBtn.style.display = "block";

  // Hide timer
  document.getElementById("timer-display").style.display = "none";
}

function resetTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  document.getElementById("timer-display").style.display = "none";
  toggleTimeProgressBar(false);
}

// Helper function to convert duration to readable text
function getDurationText(duration) {
  if (duration === 60) return "1 minute";
  if (duration === 120) return "2 minutes";
  if (duration === 300) return "5 minutes";
  return `${duration} seconds`;
}

// Change time attack duration
function changeTimeAttackDuration(duration) {
  gameState.timeAttackDuration = parseInt(duration);

  // Update active duration button
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.duration === duration);
  });

  // Update progress bar if visible
  if (
    gameState.gameMode === "timeAttack" &&
    document.getElementById("time-progress-container").style.display !== "none"
  ) {
    updateTimeProgressBar();
  }

  // Update timer display if we're in time attack mode
  if (gameState.gameMode === "timeAttack") {
    // If game is active, restart with new duration
    if (gameState.gameActive) {
      clearInterval(gameState.timerInterval);
      startTimeAttack();
    } else {
      // If game hasn't started yet, just update the display
      gameState.timeLeft = gameState.timeAttackDuration;
      updateTimerDisplay();
    }
  }
}

// Game mode selection
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;

    // Update active button
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });

    // Show/hide duration selector based on mode
    const durationSelector = document.getElementById("time-attack-duration");
    if (mode === "timeAttack") {
      durationSelector.style.display = "flex"; // Show when Time Attack is selected
    } else {
      durationSelector.style.display = "none"; // Hide for Classic mode
    }

    // Change game mode
    gameState.gameMode = mode;

    // Start new game with selected mode
    initEnhancedGame();
  });
});

// Update time progress bar
function updateTimeProgressBar() {
  const progressFill = document.getElementById("time-progress-fill");
  const progressText = document.getElementById("time-progress-text");
  const progressContainer = document.getElementById("time-progress-container");

  if (!progressFill || !progressText) return;

  const percentage = (gameState.timeLeft / gameState.timeAttackDuration) * 100;

  // Update width
  progressFill.style.width = `${percentage}%`;

  // Update text
  progressText.textContent = `${Math.round(percentage)}%`;

  // Update colors based on time remaining
  progressFill.classList.remove("warning", "critical");
  if (percentage <= 25) {
    progressFill.classList.add("critical");
  } else if (percentage <= 50) {
    progressFill.classList.add("warning");
  }
}

// Show/hide progress bar
function toggleTimeProgressBar(show) {
  const progressContainer = document.getElementById("time-progress-container");
  if (progressContainer) {
    progressContainer.style.display = show ? "block" : "none";
  }
}

// ////////////////////////////////////////////      User Manual     ////////////////////////////////////////////

// User Manual Functions
function openUserManual() {
  const manualModal = document.getElementById("user-manual-modal");
  const manualOverlay = document.getElementById("manual-overlay");

  manualModal.classList.add("active");
  manualOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

function closeUserManual() {
  const manualModal = document.getElementById("user-manual-modal");
  const manualOverlay = document.getElementById("manual-overlay");

  manualModal.classList.remove("active");
  manualOverlay.classList.remove("active");
  document.body.style.overflow = ""; // Re-enable scrolling
}

// Close manual when clicking overlay
function handleManualOverlayClick(e) {
  if (e.target.id === "manual-overlay") {
    closeUserManual();
  }
}

// Close manual with Escape key
function handleEscapeKey(e) {
  if (e.key === "Escape") {
    closeUserManual();
  }
}
