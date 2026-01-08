const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

// lanes
const lanes = [80, 180, 280];
let currentLane = 1;

// physics
let gravity = 0.8;
let velocityY = 0;
let isJumping = false;
let isSliding = false;

// game state
let obstacles = [];
let money = [];
let speed = 6;
let score = 0;
let moneyCount = 0;
let running = false;

// images
const playerImages = {
  cyan: new Image(),
  pink: new Image(),
  purple: new Image()
};

playerImages.cyan.src = "player-cyan.png";
playerImages.pink.src = "player-pink.png";
playerImages.purple.src = "player-purple.png";

let currentPlayerImg = playerImages.cyan;

const blockImg = new Image();
blockImg.src = "block.png";

const moneyImg = new Image();
moneyImg.src = "money.png";

// 🔊 SOUNDS
const moneySound = new Audio("coin.mp3");
moneySound.volume = 0.5;

const hitSound = new Audio("hit.mp3");
hitSound.volume = 0.7;

// player
const player = {
  x: lanes[currentLane] - 24,
  y: 480,
  w: 48,
  h: 72,
  baseH: 72
};

// UI
const menu = document.getElementById("menu");
const gameoverUI = document.getElementById("gameover");
const finalScore = document.getElementById("finalScore");

/* ========== MENU ========= */
function selectSkin(color) {
  if (color === "#22d3ee") currentPlayerImg = playerImages.cyan;
  if (color === "#f43f5e") currentPlayerImg = playerImages.pink;
  if (color === "#a855f7") currentPlayerImg = playerImages.purple;
}

function startGame() {
  menu.style.display = "none";
  running = true;
  loop();
}

function restartGame() {
  obstacles = [];
  money = [];
  score = 0;
  moneyCount = 0;
  velocityY = 0;
  running = true;
  gameoverUI.style.display = "none";
  loop();
}

/* ========== CONTROLS ========= */
document.addEventListener("keydown", e => {
  if (!running) return;

  if (e.key === "ArrowLeft" && currentLane > 0) currentLane--;
  if (e.key === "ArrowRight" && currentLane < 2) currentLane++;

  if (e.key === "ArrowUp" && !isJumping) {
    velocityY = -15;
    isJumping = true;
  }

  if (e.key === "ArrowDown" && !isSliding && !isJumping) slide();

  player.x = lanes[currentLane] - player.w / 2;
});

// swipe
let sx = 0, sy = 0;
canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  sx = t.clientX;
  sy = t.clientY;
});

canvas.addEventListener("touchend", e => {
  if (!running) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && currentLane < 2) currentLane++;
    if (dx < -30 && currentLane > 0) currentLane--;
  } else {
    if (dy < -30 && !isJumping) {
      velocityY = -15;
      isJumping = true;
    }
    if (dy > 30 && !isSliding && !isJumping) slide();
  }

  player.x = lanes[currentLane] - player.w / 2;
});

/* ========== HELPERS ========= */
function slide() {
  isSliding = true;
  player.h = 40;
  setTimeout(() => {
    player.h = player.baseH;
    isSliding = false;
  }, 500);
}

function rectCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectCircleCollide(rect, circ) {
  const dx = Math.abs(circ.x - rect.x - rect.w / 2);
  const dy = Math.abs(circ.y - rect.y - rect.h / 2);
  return dx < rect.w / 2 + circ.r && dy < rect.h / 2 + circ.r;
}

/* ========== SPAWNERS ========= */
setInterval(() => {
  if (!running) return;
  const lane = Math.floor(Math.random() * 3);
  obstacles.push({
    x: lanes[lane] - 20,
    y: -80,
    w: 40,
    h: Math.random() > 0.5 ? 70 : 35
  });
}, 1400);

setInterval(() => {
  if (!running) return;
  const lane = Math.floor(Math.random() * 3);
  money.push({
    x: lanes[lane],
    y: -30,
    r: 14
  });
}, 900);

/* ========== NEON ROAD ========= */
function drawRoad() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(99,102,241,0.35)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(120, i * 80 + (score % 80));
    ctx.lineTo(120, i * 80 + 40 + (score % 80));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(240, i * 80 + (score % 80));
    ctx.lineTo(240, i * 80 + 40 + (score % 80));
    ctx.stroke();
  }
}

/* ========== GAME LOOP ========= */
function loop() {
  if (!running) return;

  drawRoad();
  score += 0.06;

  // gravity
  player.y += velocityY;
  velocityY += gravity;
  if (player.y >= 480) {
    player.y = 480;
    velocityY = 0;
    isJumping = false;
  }

  // player
  ctx.drawImage(currentPlayerImg, player.x, player.y, player.w, player.h);

  // obstacles
  obstacles.forEach(o => {
    o.y += speed;
    ctx.drawImage(blockImg, o.x, o.y, o.w, o.h);

    if (rectCollide(player, o)) {
      running = false;
      hitSound.currentTime = 0;
      hitSound.play();

      gameoverUI.style.display = "flex";
      finalScore.innerText =
        `Score: ${Math.floor(score)} | 🖕 ${moneyCount}`;
    }
  });

  // money 🖕
  money.forEach((m, i) => {
    m.y += speed;
    ctx.drawImage(moneyImg, m.x - 20, m.y - 20, 40, 40);

    if (rectCircleCollide(player, m)) {
      money.splice(i, 1);
      moneyCount++;

      moneySound.currentTime = 0;
      moneySound.play();
    }
  });

  // HUD
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "bold 16px Arial";
  ctx.fillText("Score: " + Math.floor(score), 10, 25);
  ctx.fillText("🖕 " + moneyCount, 10, 45);

  requestAnimationFrame(loop);
}