/**
 * Interactive Project Mini-Games & Widgets for Mausam Kumari's Portfolio
 * 1. Carbon Footprint Real-time Interactive Calculator
 * 2. Playable Cartoon Snake Bubble Game
 * 3. Playable Flappy Bubble Bird Arcade
 * 4. Screen-wide Floating Bubble Popper Easter Egg
 */

/* =========================================================
   1. CARBON FOOTPRINT CALCULATOR WIDGET
   ========================================================= */
class CarbonCalculator {
  constructor() {
    this.commuteSlider = document.getElementById('calc-commute');
    this.electricitySlider = document.getElementById('calc-elec');
    this.dietSelect = document.getElementById('calc-diet');
    this.recycleCheck = document.getElementById('calc-recycle');

    this.valCommute = document.getElementById('val-commute');
    this.valElec = document.getElementById('val-elec');
    this.co2Result = document.getElementById('result-co2');
    this.treeResult = document.getElementById('result-trees');
    this.ecoBadge = document.getElementById('result-badge');

    if (!this.commuteSlider) return;
    this.init();
  }

  init() {
    const update = () => this.calculate();
    this.commuteSlider.addEventListener('input', () => {
      this.valCommute.textContent = `${this.commuteSlider.value} km`;
      update();
    });
    this.electricitySlider.addEventListener('input', () => {
      this.valElec.textContent = `${this.electricitySlider.value} kWh`;
      update();
    });
    this.dietSelect.addEventListener('change', update);
    this.recycleCheck.addEventListener('change', update);

    this.calculate();
  }

  calculate() {
    const commuteKm = parseFloat(this.commuteSlider.value) || 0;
    const elecKwh = parseFloat(this.electricitySlider.value) || 0;
    const diet = this.dietSelect.value;
    const recycle = this.recycleCheck.checked;

    // Emissions factors (kg CO2 / day)
    const commuteCO2 = commuteKm * 0.17; // Avg vehicle emission
    const elecCO2 = elecKwh * 0.82;     // Grid electricity factor
    let dietCO2 = 4.2; // Balanced
    if (diet === 'plant') dietCO2 = 2.0;
    if (diet === 'meat') dietCO2 = 7.1;

    let dailyTotal = commuteCO2 + elecCO2 + dietCO2;
    if (recycle) dailyTotal *= 0.85; // 15% reduction

    const annualTonnes = ((dailyTotal * 365) / 1000).toFixed(2);
    // 1 mature tree absorbs ~22 kg CO2 per year
    const treesNeeded = Math.ceil((dailyTotal * 365) / 22);

    if (this.co2Result) this.co2Result.textContent = `${annualTonnes} T`;
    if (this.treeResult) this.treeResult.textContent = `${treesNeeded} 🌲`;

    if (this.ecoBadge) {
      if (annualTonnes < 2.5) {
        this.ecoBadge.innerHTML = '🌟 Eco Master! Planet Champ!';
        this.ecoBadge.className = 'eco-badge eco-master';
      } else if (annualTonnes < 5.0) {
        this.ecoBadge.innerHTML = '🌱 Conscious Eco Explorer';
        this.ecoBadge.className = 'eco-badge eco-conscious';
      } else {
        this.ecoBadge.innerHTML = '⚡ High Footprint - Needs Bubbles of Love';
        this.ecoBadge.className = 'eco-badge eco-heavy';
      }
    }
  }
}

/* =========================================================
   2. PLAYABLE CARTOON SNAKE BUBBLE GAME
   ========================================================= */
class SnakeGame {
  constructor(canvasId = 'snake-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.gridSize = 20;
    this.tileCount = 16;
    this.snake = [];
    this.food = { x: 5, y: 5 };
    this.dx = 1;
    this.dy = 0;
    this.nextDx = 1;
    this.nextDy = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('mausam_snake_hs') || '0', 10);
    this.isRunning = false;
    this.isPaused = false;
    this.timer = null;
    this.speed = 120;

    this.scoreEl = document.getElementById('snake-score');
    this.highScoreEl = document.getElementById('snake-high-score');
    this.startBtn = document.getElementById('snake-start-btn');
    this.pauseBtn = document.getElementById('snake-pause-btn');

    this.palette = ['#FF2D95', '#6F3DFF', '#007BA7', '#EAAA00', '#BFE9FF'];

    this.setupControls();
    this.updateScoreUI();
    this.drawIntroScreen();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (['ArrowUp', 'KeyW'].includes(e.code) && this.dy === 0) {
        this.nextDx = 0; this.nextDy = -1; e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && this.dy === 0) {
        this.nextDx = 0; this.nextDy = 1; e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && this.dx === 0) {
        this.nextDx = -1; this.nextDy = 0; e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && this.dx === 0) {
        this.nextDx = 1; this.nextDy = 0; e.preventDefault();
      }
    });

    // Touch D-Pad buttons
    const btnUp = document.getElementById('snake-btn-up');
    const btnDown = document.getElementById('snake-btn-down');
    const btnLeft = document.getElementById('snake-btn-left');
    const btnRight = document.getElementById('snake-btn-right');

    if (btnUp) btnUp.addEventListener('click', () => { if (this.dy === 0) { this.nextDx = 0; this.nextDy = -1; } });
    if (btnDown) btnDown.addEventListener('click', () => { if (this.dy === 0) { this.nextDx = 0; this.nextDy = 1; } });
    if (btnLeft) btnLeft.addEventListener('click', () => { if (this.dx === 0) { this.nextDx = -1; this.nextDy = 0; } });
    if (btnRight) btnRight.addEventListener('click', () => { if (this.dx === 0) { this.nextDx = 1; this.nextDy = 0; } });

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        if (window.sounds) window.sounds.click();
        this.start();
      });
    }

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
      });
    }
  }

  updateScoreUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
  }

  start() {
    clearInterval(this.timer);
    this.snake = [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 }
    ];
    this.dx = 1;
    this.dy = 0;
    this.nextDx = 1;
    this.nextDy = 0;
    this.score = 0;
    this.speed = 120;
    this.isRunning = true;
    this.isPaused = false;
    this.updateScoreUI();
    this.spawnFood();

    if (this.startBtn) this.startBtn.textContent = '🔄 Restart';
    if (this.pauseBtn) this.pauseBtn.style.display = 'inline-flex';

    this.timer = setInterval(() => this.tick(), this.speed);
  }

  spawnFood() {
    let valid = false;
    while (!valid) {
      this.food.x = Math.floor(Math.random() * this.tileCount);
      this.food.y = Math.floor(Math.random() * this.tileCount);
      valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
    }
  }

  tick() {
    if (this.isPaused || !this.isRunning) return;

    this.dx = this.nextDx;
    this.dy = this.nextDy;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      return this.gameOver();
    }

    // Self collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      return this.gameOver();
    }

    this.snake.unshift(head);

    // Food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mausam_snake_hs', this.highScore.toString());
      }
      this.updateScoreUI();
      if (window.sounds) window.sounds.pop(620);
      this.spawnFood();

      // Slightly increase speed
      if (this.speed > 60) {
        this.speed -= 2;
        clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), this.speed);
      }
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cell = w / this.tileCount;

    // Background checkerboard
    for (let r = 0; r < this.tileCount; r++) {
      for (let c = 0; c < this.tileCount; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#E6E0F0' : '#DDE3E8';
        ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }

    // Draw cartoon food (Shiny Golden Apple / Star Bubble)
    const fx = this.food.x * cell + cell / 2;
    const fy = this.food.y * cell + cell / 2;
    const fr = cell * 0.42;

    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fillStyle = '#EAAA00';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0A0A0A';
    ctx.stroke();

    // Food highlight
    ctx.beginPath();
    ctx.arc(fx - fr * 0.35, fy - fr * 0.35, fr * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw Bubble Snake
    this.snake.forEach((seg, index) => {
      const cx = seg.x * cell + cell / 2;
      const cy = seg.y * cell + cell / 2;
      const radius = cell * 0.46;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.palette[index % this.palette.length];
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0A0A0A';
      ctx.stroke();

      // Bubble highlight
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();

      // Snake Head Cute Eyes!
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.25, cy - radius * 0.15, radius * 0.3, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.25, cy - radius * 0.15, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#0A0A0A';
        ctx.stroke();

        ctx.fillStyle = '#0A0A0A';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.25 + this.dx * 2, cy - radius * 0.15 + this.dy * 2, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.25 + this.dx * 2, cy - radius * 0.15 + this.dy * 2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  drawIntroScreen() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#E6E0F0';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#3A0F34';
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐍 Bubble Snake!', w / 2, h / 2 - 20);

    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#6F3DFF';
    ctx.fillText('Press "Start Game" to play', w / 2, h / 2 + 15);
    ctx.fillText('Eat golden bubbles & grow!', w / 2, h / 2 + 38);
  }

  gameOver() {
    this.isRunning = false;
    clearInterval(this.timer);
    if (window.sounds) window.sounds.boing();

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(58, 15, 52, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FF2D95';
    ctx.font = 'bold 26px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💥 Pop! Game Over', w / 2, h / 2 - 15);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Outfit, sans-serif';
    ctx.fillText(`Final Score: ${this.score}`, w / 2, h / 2 + 18);
    ctx.fillText('Click Restart to try again!', w / 2, h / 2 + 45);

    if (this.startBtn) this.startBtn.textContent = '🚀 Play Again';
  }
}

/* =========================================================
   3. PLAYABLE FLAPPY BIRD BUBBLE ARCADE
   ========================================================= */
class FlappyBirdGame {
  constructor(canvasId = 'flappy-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.bird = { x: 50, y: 150, vy: 0, radius: 16, jump: -6.5 };
    this.gravity = 0.32;
    this.pipes = [];
    this.pipeWidth = 44;
    this.pipeGap = 110;
    this.pipeSpeed = 2.4;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('mausam_flappy_hs') || '0', 10);
    this.isRunning = false;
    this.animId = null;
    this.frameCount = 0;

    this.scoreEl = document.getElementById('flappy-score');
    this.highScoreEl = document.getElementById('flappy-high-score');
    this.startBtn = document.getElementById('flappy-start-btn');

    this.setupEvents();
    this.updateScoreUI();
    this.drawIntroScreen();
  }

  setupEvents() {
    const flap = (e) => {
      if (e) e.preventDefault();
      if (!this.isRunning) {
        this.start();
        return;
      }
      this.bird.vy = this.bird.jump;
      if (window.sounds) window.sounds.pop(700);
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        flap(e);
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => flap(e));

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        if (window.sounds) window.sounds.click();
        this.start();
      });
    }
  }

  updateScoreUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
  }

  start() {
    cancelAnimationFrame(this.animId);
    this.bird.y = 150;
    this.bird.vy = 0;
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.isRunning = true;
    this.updateScoreUI();

    if (this.startBtn) this.startBtn.textContent = '🔄 Restart';
    this.loop();
  }

  loop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  update() {
    this.frameCount++;

    // Bird gravity
    this.bird.vy += this.gravity;
    this.bird.y += this.bird.vy;

    // Floor & Ceiling collision
    if (this.bird.y + this.bird.radius >= this.canvas.height || this.bird.y - this.bird.radius <= 0) {
      return this.gameOver();
    }

    // Spawn pipes every 85 frames
    if (this.frameCount % 85 === 0) {
      const topHeight = Math.floor(Math.random() * (this.canvas.height - this.pipeGap - 60)) + 30;
      this.pipes.push({
        x: this.canvas.width,
        topHeight: topHeight,
        passed: false
      });
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= this.pipeSpeed;

      // Score check
      if (!p.passed && p.x + this.pipeWidth < this.bird.x) {
        p.passed = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('mausam_flappy_hs', this.highScore.toString());
        }
        this.updateScoreUI();
        if (window.sounds) window.sounds.sparkle();
      }

      // Bird collision
      const inX = this.bird.x + this.bird.radius > p.x && this.bird.x - this.bird.radius < p.x + this.pipeWidth;
      const inTop = this.bird.y - this.bird.radius < p.topHeight;
      const inBottom = this.bird.y + this.bird.radius > p.topHeight + this.pipeGap;

      if (inX && (inTop || inBottom)) {
        return this.gameOver();
      }

      // Remove offscreen
      if (p.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Sky gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#BFE9FF');
    grad.addColorStop(1, '#E6E0F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fluffy cartoon clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(80, 50, 24, 0, Math.PI * 2);
    ctx.arc(110, 45, 30, 0, Math.PI * 2);
    ctx.arc(140, 50, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(260, 90, 20, 0, Math.PI * 2);
    ctx.arc(290, 85, 26, 0, Math.PI * 2);
    ctx.arc(320, 90, 20, 0, Math.PI * 2);
    ctx.fill();

    // Pipes (Candy Striped Bubble Pipes)
    this.pipes.forEach(p => {
      // Top pipe
      ctx.fillStyle = '#6F3DFF';
      ctx.fillRect(p.x, 0, this.pipeWidth, p.topHeight);
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x, 0, this.pipeWidth, p.topHeight);

      // Pipe cap
      ctx.fillStyle = '#FF2D95';
      ctx.fillRect(p.x - 4, p.topHeight - 16, this.pipeWidth + 8, 16);
      ctx.strokeRect(p.x - 4, p.topHeight - 16, this.pipeWidth + 8, 16);

      // Bottom pipe
      const bottomY = p.topHeight + this.pipeGap;
      const bottomHeight = h - bottomY;
      ctx.fillStyle = '#6F3DFF';
      ctx.fillRect(p.x, bottomY, this.pipeWidth, bottomHeight);
      ctx.strokeRect(p.x, bottomY, this.pipeWidth, bottomHeight);

      // Bottom pipe cap
      ctx.fillStyle = '#FF2D95';
      ctx.fillRect(p.x - 4, bottomY, this.pipeWidth + 8, 16);
      ctx.strokeRect(p.x - 4, bottomY, this.pipeWidth + 8, 16);
    });

    // Draw Pink Flappy Bubble Bird
    ctx.save();
    ctx.translate(this.bird.x, this.bird.y);
    const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.bird.vy * 0.08));
    ctx.rotate(angle);

    // Bird Body (Glossy Bubblegum Pink)
    ctx.beginPath();
    ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF2D95';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0A0A0A';
    ctx.stroke();

    // Belly (Warm yellow)
    ctx.beginPath();
    ctx.arc(3, 4, this.bird.radius * 0.6, 0, Math.PI);
    ctx.fillStyle = '#EAAA00';
    ctx.fill();

    // Bird Eye
    ctx.beginPath();
    ctx.arc(6, -5, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(8, -5, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();

    // Beak
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(22, 2);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fillStyle = '#EAAA00';
    ctx.fill();
    ctx.stroke();

    // Wing
    const wingFlap = Math.sin(this.frameCount * 0.3) * 5;
    ctx.beginPath();
    ctx.ellipse(-6, 2 + wingFlap, 9, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#007BA7';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawIntroScreen() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#BFE9FF';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#3A0F34';
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐦 Flappy Bubble Bird!', w / 2, h / 2 - 25);

    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#FF2D95';
    ctx.fillText('Click / Spacebar to Flap', w / 2, h / 2 + 10);
    ctx.fillText('Dodge candy pipes & soar high!', w / 2, h / 2 + 35);
  }

  gameOver() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
    if (window.sounds) window.sounds.boing();

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(58, 15, 52, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FF2D95';
    ctx.font = 'bold 26px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💥 Pop! Bird Crashed!', w / 2, h / 2 - 15);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Outfit, sans-serif';
    ctx.fillText(`Pipes Cleared: ${this.score}`, w / 2, h / 2 + 18);
    ctx.fillText('Tap to Flap Again!', w / 2, h / 2 + 45);

    if (this.startBtn) this.startBtn.textContent = '🚀 Fly Again';
  }
}

/* =========================================================
   4. SCREEN-WIDE FLOATING BUBBLE POPPER EASTER EGG
   ========================================================= */
class BubblePopperEasterEgg {
  constructor() {
    this.container = document.getElementById('bubble-pop-overlay');
    this.toggleBtn = document.getElementById('btn-bubble-mode');
    this.scoreBadge = document.getElementById('bubble-pop-score');
    this.score = 0;
    this.isActive = false;
    this.spawnTimer = null;

    this.palette = ['#FF2D95', '#6F3DFF', '#007BA7', '#BFE9FF', '#EAAA00', '#E6E0F0'];

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.toggleBtn.classList.add('active');
      this.toggleBtn.innerHTML = `🫧 Pop Party ON! (<span id="bubble-pop-score">${this.score}</span>)`;
      this.startSpawning();
      if (window.sounds) window.sounds.sparkle();
    } else {
      this.toggleBtn.classList.remove('active');
      this.toggleBtn.innerHTML = '🫧 Bubble Party Mode';
      this.stopSpawning();
    }
  }

  startSpawning() {
    this.spawnTimer = setInterval(() => {
      if (!this.isActive) return;
      this.spawnFloatingBubble();
    }, 800);
    // Spawn 4 initial bubbles
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.spawnFloatingBubble(), i * 200);
    }
  }

  stopSpawning() {
    clearInterval(this.spawnTimer);
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  spawnFloatingBubble() {
    if (!this.container) return;

    const b = document.createElement('div');
    b.className = 'screen-floating-bubble';

    const size = 40 + Math.random() * 50;
    const startX = 5 + Math.random() * 90;
    const color = this.palette[Math.floor(Math.random() * this.palette.length)];
    const duration = 5 + Math.random() * 4;

    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${startX}vw`;
    b.style.bottom = '-80px';
    b.style.background = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), ${color} 70%)`;
    b.style.borderColor = '#0A0A0A';
    b.style.animationDuration = `${duration}s`;

    b.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.popBubble(b, e.clientX, e.clientY);
    });

    this.container.appendChild(b);

    setTimeout(() => {
      if (b.parentNode) b.parentNode.removeChild(b);
    }, duration * 1000);
  }

  popBubble(el, x, y) {
    this.score++;
    const scoreSpan = document.getElementById('bubble-pop-score');
    if (scoreSpan) scoreSpan.textContent = this.score;

    if (window.sounds) window.sounds.pop(550 + Math.random() * 250);

    // Create particle sparkles
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.className = 'bubble-pop-particle';
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 30;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }

    el.classList.add('popping');
    setTimeout(() => el.remove(), 120);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.carbonCalc = new CarbonCalculator();
  window.snakeGame = new SnakeGame('snake-canvas');
  window.flappyGame = new FlappyBirdGame('flappy-canvas');
  window.bubbleParty = new BubblePopperEasterEgg();
});
