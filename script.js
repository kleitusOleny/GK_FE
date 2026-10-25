const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const sidebar = document.getElementById("sidebar");
const btnBackMenu = document.getElementById("btn-back-menu");

function resizeCanvas() {
  const newWidth = canvas.clientWidth;
  const newHeight = canvas.clientHeight;
  if (canvas.width !== newWidth || canvas.height !== newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;
  }
}
resizeCanvas();

//game init
let gameState = "MENU"; // 'MENU', 'PLAYING', 'GAMEOVER', 'GAMEWON'
let selectedLevel = 1;

let lives = 3;
let score = 0;

// paddle
const paddleHeight = 15;
let basePaddleWidth = Math.max(110, canvas.width * 0.14);
let paddleWidth = basePaddleWidth;
let paddleX = (canvas.width - paddleWidth) / 2;


const paddleSpeed = 8;
const paddleBoostSpeed = 16;

let rightPressed = false;
let leftPressed = false;
let shiftPressed = false;

let paddleStunUntil = 0;

//Buff
let laserActiveUntil = 0;
let expandActiveUntil = 0;
let shrinkActiveUntil = 0;
let pierceActiveUntil = 0;

// ball
const ballRadius = 9;
const ballSpeed = 6;
let balls = [];
let lasers = [];
let powerups = [];
let bossBullets = [];


let bricks = [];
const brickOffsetTop = 75;
const brickOffsetLeft = 25;
const brickPadding = 10;
const brickHeight = 24;
let brickWidth = 80;

// Cơ chế đặc biệt theo màn
let windForce = 0;
let lastWindChange = 0;
let windDirName = "KHONG";
let patrols = [];
let boss = null;

const POWERUP_TYPES = [
  { type: "EXPAND", label: "+Len", color: "green" },
  { type: "MULTI", label: "Ball", color: "dodgerblue" },
  { type: "LASER", label: "Laser", color: "orangered" },
  { type: "LIFE", label: "Life", color: "red" },
  { type: "PIERCE", label: "Pierce", color: "darkmagenta" },
  { type: "SHRINK", label: "-Len", color: "slategray" }
];

let menuButtons = [];

btnBackMenu.addEventListener("click", () => {
  gameState = "MENU";
});

//Gameplay
//lv1
function loadLevel1() {
  const rowCount = 4;
  const colCount = 8;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];
  const colors = ["crimson", "darkorange", "gold", "forestgreen"];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = {
        x: 0, y: 0,
        hp: 1, maxHp: 1,
        type: "NORMAL",
        color: colors[r % colors.length],
        powerup: null
      };
    }
  }
}

//lv2
function loadLevel2() {
  const rowCount = 6;
  const colCount = 10;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      let hp = (r < 2) ? 2 : 1;
      let color = (r < 2) ? "purple" : (r < 4 ? "darkorange" : "forestgreen");
      let drop = null;
      if (Math.random() < 0.28) {
        const pool = [POWERUP_TYPES[0], POWERUP_TYPES[1], POWERUP_TYPES[2], POWERUP_TYPES[3]];
        drop = pool[Math.floor(Math.random() * pool.length)];
      }

      bricks[c][r] = {
        x: 0, y: 0,
        hp: hp, maxHp: hp,
        type: "NORMAL",
        color: color,
        powerup: drop
      };
    }
  }
}

//lv3
function loadLevel3() {
  const rowCount = 6;
  const colCount = 10;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      let type = "NORMAL";
      let hp = 1;
      let color = "dodgerblue";
      let drop = null;

      if ((c === 2 || c === 7) && (r === 1 || r === 2 || r === 3)) {
        type = "SOLID";
        hp = 999;
        color = "gray";
      } else if ((c === 4 || c === 5) && (r === 2 || r === 3)) {
        type = "BOMB";
        hp = 1;
        color = "darkred";
      } else {
        if (Math.random() < 0.25) {
          drop = POWERUP_TYPES[Math.floor(Math.random() * 4)];
        }
      }

      bricks[c][r] = {
        x: 0, y: 0,
        hp: hp, maxHp: hp,
        type: type,
        color: color,
        powerup: drop
      };
    }
  }
}

//lv4
function loadLevel4() {
  const rowCount = 5;
  const colCount = 10;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];
  windForce = 0.08;
  windDirName = "PHAI ->";
  lastWindChange = Date.now();

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      let drop = null;
      if (Math.random() < 0.3) {
        drop = POWERUP_TYPES[Math.floor(Math.random() * 5)];
      }
      bricks[c][r] = {
        x: 0, y: 0,
        hp: 1, maxHp: 1,
        type: "NORMAL",
        color: (r % 2 === 0) ? "teal" : "royalblue",
        powerup: drop
      };
    }
  }
}

//lv5
function loadLevel5() {
  const rowCount = 5;
  const colCount = 9;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      let drop = null;
      if (Math.random() < 0.35) {
        drop = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      }
      bricks[c][r] = {
        x: 0, y: 0,
        hp: (r === 0) ? 2 : 1, maxHp: (r === 0) ? 2 : 1,
        type: "NORMAL",
        color: (r === 0) ? "purple" : "darkorange",
        powerup: drop
      };
    }
  }

  patrols = [
    { x: 50, y: canvas.height * 0.46, w: 85, h: 18, vx: 3.5, hp: 3 },
    { x: canvas.width / 2, y: canvas.height * 0.53, w: 85, h: 18, vx: -4, hp: 3 },
    { x: canvas.width - 160, y: canvas.height * 0.60, w: 85, h: 18, vx: 3, hp: 3 }
  ];
}

//lv6
function loadLevel6() {
  const rowCount = 3;
  const colCount = 10;
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
  bricks = [];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      let drop = null;
      if (Math.random() < 0.4) {
        drop = POWERUP_TYPES[Math.floor(Math.random() * 5)];
      }
      bricks[c][r] = {
        x: 0, y: 0,
        hp: 1, maxHp: 1,
        type: "NORMAL",
        color: "crimson",
        powerup: drop
      };
    }
  }

  boss = {
    x: canvas.width / 2 - 75,
    y: 35,
    w: 150,
    h: 22,
    vx: 4,
    hp: 20,
    maxHp: 20,
    lastShot: Date.now()
  };
}

function startLevel(lvl) {
  selectedLevel = lvl;
  lives = 3;
  score = 0;
  lasers = [];
  powerups = [];
  bossBullets = [];
  patrols = [];
  boss = null;
  windForce = 0;

  laserActiveUntil = 0;
  expandActiveUntil = 0;
  shrinkActiveUntil = 0;
  pierceActiveUntil = 0;
  paddleStunUntil = 0;

  basePaddleWidth = Math.max(110, canvas.width * 0.14);
  paddleWidth = basePaddleWidth;
  paddleX = (canvas.width - paddleWidth) / 2;

  resetBalls();

  if (lvl === 1) loadLevel1();
  else if (lvl === 2) loadLevel2();
  else if (lvl === 3) loadLevel3();
  else if (lvl === 4) loadLevel4();
  else if (lvl === 5) loadLevel5();
  else if (lvl === 6) loadLevel6();

  basePaddleWidth = Math.max(110, canvas.width * 0.14);
  paddleWidth = basePaddleWidth;
  paddleX = (canvas.width - paddleWidth) / 2;
  resetBalls();

  gameState = "PLAYING";
}

function resetBalls() {
  balls = [
    {
      x: canvas.width / 2,
      y: canvas.height - 50,
      dx: ballSpeed * Math.cos(-Math.PI / 4),
      dy: ballSpeed * Math.sin(-Math.PI / 4)
    }
  ];
  paddleX = (canvas.width - paddleWidth) / 2;
}

//Control
window.addEventListener("resize", () => {
  const oldWidth = canvas.width;
  resizeCanvas();

  basePaddleWidth = Math.max(110, canvas.width * 0.14);
  updatePaddleWidth();
  paddleX = (paddleX / oldWidth) * canvas.width;

  const colCount = (selectedLevel === 1) ? 8 : (selectedLevel === 5 ? 9 : 10);
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (colCount - 1) * brickPadding) / colCount;
});

function updatePaddleWidth() {
  if (Date.now() < shrinkActiveUntil) {
    paddleWidth = basePaddleWidth * 0.7;
  } else if (Date.now() < expandActiveUntil) {
    paddleWidth = basePaddleWidth * 1.5;
  } else {
    paddleWidth = basePaddleWidth;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") shiftPressed = true;
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
  if (e.code === "Space") {
    if (gameState === "PLAYING" && selectedLevel >= 2 && Date.now() < laserActiveUntil) {
      fireLaser();
    }
  }
  if (e.key === "Escape" && gameState === "PLAYING") {
    gameState = "MENU";
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") shiftPressed = false;
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (gameState === "PLAYING" && Date.now() >= paddleStunUntil) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddleX = Math.min(Math.max(mouseX - paddleWidth / 2, 0), canvas.width - paddleWidth);
  }
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (gameState === "MENU") {
    menuButtons.forEach((btn) => {
      if (
        clickX >= btn.x &&
        clickX <= btn.x + btn.w &&
        clickY >= btn.y &&
        clickY <= btn.y + btn.h
      ) {
        startLevel(btn.level);
      }
    });
  } else if (gameState === "PLAYING") {
    if (selectedLevel >= 2 && Date.now() < laserActiveUntil) {
      fireLaser();
    }
  } else if (gameState === "GAMEOVER" || gameState === "GAMEWON") {
    gameState = "MENU";
  }
});

function fireLaser() {
  lasers.push({ x: paddleX + 15, y: canvas.height - paddleHeight - 20, vy: -10 });
  lasers.push({ x: paddleX + paddleWidth - 15, y: canvas.height - paddleHeight - 20, vy: -10 });
}

function spawnPowerUp(x, y, powerupData) {
  if (selectedLevel === 1) return;
  powerups.push({
    x: x + brickWidth / 2 - 25,
    y: y + brickHeight / 2,
    w: 50,
    h: 18,
    vy: 2.5,
    ...powerupData
  });
}

function applyPowerUp(type) {
  if (type === "EXPAND") {
    expandActiveUntil = Date.now() + 10000;
    shrinkActiveUntil = 0;
    updatePaddleWidth();
  } else if (type === "SHRINK") {
    shrinkActiveUntil = Date.now() + 7000;
    expandActiveUntil = 0;
    updatePaddleWidth();
  } else if (type === "PIERCE") {
    pierceActiveUntil = Date.now() + 6000;
  } else if (type === "MULTI") {
    const newBalls = [];
    balls.forEach((b) => {
      newBalls.push({
        x: b.x,
        y: b.y,
        dx: ballSpeed * Math.cos(-Math.PI / 6),
        dy: -ballSpeed * Math.sin(Math.PI / 6)
      });
      newBalls.push({
        x: b.x,
        y: b.y,
        dx: -ballSpeed * Math.cos(-Math.PI / 6),
        dy: -ballSpeed * Math.sin(-Math.PI / 6)
      });
    });
    balls.push(...newBalls);
    if (balls.length > 8) balls.length = 8;
  } else if (type === "LASER") {
    laserActiveUntil = Date.now() + 8000;
  } else if (type === "LIFE") {
    lives++;
  }
}

//
function triggerBomb(centerC, centerR) {
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      const nc = centerC + dc;
      const nr = centerR + dr;
      if (nc >= 0 && nc < bricks.length && nr >= 0 && nr < bricks[nc].length) {
        const nb = bricks[nc][nr];
        if (nb.type !== "SOLID" && nb.hp > 0) {
          nb.hp = 0;
          score += 10;
          if (nb.powerup) spawnPowerUp(nb.x, nb.y, nb.powerup);
        }
      }
    }
  }
}

function updateLasers() {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    l.y += l.vy;
    if (l.y < 0) {
      lasers.splice(i, 1);
      continue;
    }

    if (boss && boss.hp > 0) {
      if (l.x > boss.x && l.x < boss.x + boss.w && l.y > boss.y && l.y < boss.y + boss.h) {
        boss.hp--;
        score += 25;
        lasers.splice(i, 1);
        checkWin();
        continue;
      }
    }

    let hitPatrol = false;
    for (let p of patrols) {
      if (p.hp > 0 && l.x > p.x && l.x < p.x + p.w && l.y > p.y && l.y < p.y + p.h) {
        p.hp--;
        score += 20;
        lasers.splice(i, 1);
        hitPatrol = true;
        break;
      }
    }
    if (hitPatrol) continue;

    let hitBrick = false;
    for (let c = 0; c < bricks.length; c++) {
      for (let r = 0; r < bricks[c].length; r++) {
        const b = bricks[c][r];
        if (b.hp > 0) {
          if (l.x > b.x && l.x < b.x + brickWidth && l.y > b.y && l.y < b.y + brickHeight) {
            if (b.type === "BOMB") {
              b.hp = 0;
              triggerBomb(c, r);
            } else if (b.type !== "SOLID") {
              b.hp--;
              score += 10;
              if (b.hp <= 0 && b.powerup) spawnPowerUp(b.x, b.y, b.powerup);
            }
            lasers.splice(i, 1);
            hitBrick = true;
            checkWin();
            break;
          }
        }
      }
      if (hitBrick) break;
    }
  }
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.vy;

    if (
      p.y + p.h >= canvas.height - paddleHeight - 15 &&
      p.y <= canvas.height - 15 &&
      p.x + p.w >= paddleX &&
      p.x <= paddleX + paddleWidth
    ) {
      applyPowerUp(p.type);
      powerups.splice(i, 1);
      continue;
    }

    if (p.y > canvas.height) {
      powerups.splice(i, 1);
    }
  }
}

function updateBoss() {
  if (!boss || boss.hp <= 0) return;

  boss.x += boss.vx;
  if (boss.x <= 25 || boss.x + boss.w >= canvas.width - 25) {
    boss.vx = -boss.vx;
  }

  if (Date.now() - boss.lastShot > 3500) {
    boss.lastShot = Date.now();
    bossBullets.push({ x: boss.x + 20, y: boss.y + boss.h, vy: 4 });
    bossBullets.push({ x: boss.x + boss.w - 20, y: boss.y + boss.h, vy: 4 });
  }

  for (let i = bossBullets.length - 1; i >= 0; i--) {
    const bb = bossBullets[i];
    bb.y += bb.vy;

    if (
      bb.y >= canvas.height - paddleHeight - 20 &&
      bb.y <= canvas.height - 15 &&
      bb.x >= paddleX &&
      bb.x <= paddleX + paddleWidth
    ) {
      paddleStunUntil = Date.now() + 1200;
      bossBullets.splice(i, 1);
      continue;
    }

    if (bb.y > canvas.height) {
      bossBullets.splice(i, 1);
    }
  }
}

function updatePatrols() {
  patrols.forEach((p) => {
    if (p.hp > 0) {
      p.x += p.vx;
      if (p.x <= 25 || p.x + p.w >= canvas.width - 25) {
        p.vx = -p.vx;
      }
    }
  });
}

function collisionDetection(ball) {
  const isPiercing = Date.now() < pierceActiveUntil;

  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const b = bricks[c][r];
      if (b.hp > 0) {
        if (
          ball.x > b.x &&
          ball.x < b.x + brickWidth &&
          ball.y > b.y &&
          ball.y < b.y + brickHeight
        ) {
          if (!isPiercing || b.type === "SOLID") {
            ball.dy = -ball.dy;
          }

          if (b.type === "BOMB") {
            b.hp = 0;
            triggerBomb(c, r);
          } else if (b.type !== "SOLID") {
            b.hp--;
            score += 10;
            if (b.hp <= 0 && b.powerup) {
              spawnPowerUp(b.x, b.y, b.powerup);
            }
          }
          checkWin();
        }
      }
    }
  }

  patrols.forEach((p) => {
    if (p.hp > 0) {
      if (ball.x > p.x && ball.x < p.x + p.w && ball.y > p.y && ball.y < p.y + p.h) {
        ball.dy = -ball.dy;
        p.hp--;
        score += 25;
      }
    }
  });

  if (boss && boss.hp > 0) {
    if (ball.x > boss.x && ball.x < boss.x + boss.w && ball.y > boss.y && ball.y < boss.y + boss.h) {
      ball.dy = -ball.dy;
      boss.hp--;
      score += 50;
      checkWin();
    }
  }
}

function checkWin() {
  if (selectedLevel === 6) {
    if (boss && boss.hp <= 0) {
      gameState = "GAMEWON";
    }
    return;
  }

  let remaining = 0;
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      if (bricks[c][r].type !== "SOLID" && bricks[c][r].hp > 0) remaining++;
    }
  }
  if (remaining === 0) {
    gameState = "GAMEWON";
  }
}

// ==========================================
// VẼ GIAO DIỆN BẰNG TÊN MÀU CHỮ (COLOR NAMES)
// ==========================================

function drawMenu() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BREAKOUT GAME", canvas.width / 2, 70);

    const btnWidth = Math.min(260, canvas.width * 0.42);
    const btnHeight = 55;
    const gapY = 15;
    const startY = 135;

    const col1X = canvas.width / 2 - btnWidth - 12;
    const col2X = canvas.width / 2 + 12;

    menuButtons = [
        {
            x: col1X,
            y: startY,
            w: btnWidth,
            h: btnHeight,
            level: 1,
            title: "MAN 1: CO BAN",
            sub: "Logic thuan tuy, 4 hang gach",
            color: "steelblue"
        },
        {
            x: col1X,
            y: startY + (btnHeight + gapY),
            w: btnWidth,
            h: btnHeight,
            level: 2,
            title: "MAN 2: NANG CAP",
            sub: "Vat pham roi, gach 2 mau",
            color: "purple"
        },
        {
            x: col1X,
            y: startY + (btnHeight + gapY) * 2,
            w: btnWidth,
            h: btnHeight,
            level: 3,
            title: "MAN 3: CHIEN THUAT",
            sub: "Gach bat tu [X] & Gach no [NO]",
            color: "chocolate"
        },

        {
            x: col2X,
            y: startY,
            w: btnWidth,
            h: btnHeight,
            level: 4,
            title: "MAN 4: GIO & XUYEN",
            sub: "Gio thoi lech huong, bong XUYEN",
            color: "teal"
        },
        {
            x: col2X,
            y: startY + (btnHeight + gapY),
            w: btnWidth,
            h: btnHeight,
            level: 5,
            title: "MAN 5: DI DONG",
            sub: "3 quai tuan tra, bay NGAN",
            color: "darkorange"
        },
        {
            x: col2X,
            y: startY + (btnHeight + gapY) * 2,
            w: btnWidth,
            h: btnHeight,
            level: 6,
            title: "MAN 6: DAU TRUM",
            sub: "Boss 20 HP, tha dan choang",
            color: "crimson"
        }
    ];

    menuButtons.forEach((btn) => {
        ctx.fillStyle = btn.color;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = "white";
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(btn.title, btn.x + btn.w / 2, btn.y + 22);

        ctx.font = "12px Arial";
        ctx.fillStyle = "lightgray";
        ctx.fillText(btn.sub, btn.x + btn.w / 2, btn.y + 42);
    });

}

function drawBricks() {
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const b = bricks[c][r];
      if (b.hp > 0) {
        const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const by = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = bx;
        b.y = by;

        if (b.type === "SOLID") {
          ctx.fillStyle = "gray";
        } else if (b.type === "BOMB") {
          ctx.fillStyle = "darkred";
        } else if (b.maxHp === 2 && b.hp === 1) {
          ctx.fillStyle = "mediumpurple";
        } else {
          ctx.fillStyle = b.color;
        }

        ctx.fillRect(bx, by, brickWidth, brickHeight);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        if (b.type === "SOLID") {
          ctx.fillText("[X]", bx + brickWidth / 2, by + brickHeight / 2 + 3);
        } else if (b.type === "BOMB") {
          ctx.fillText("[NO]", bx + brickWidth / 2, by + brickHeight / 2 + 3);
        } else if (b.hp > 1) {
          ctx.fillText(`[${b.hp}]`, bx + brickWidth / 2, by + brickHeight / 2 + 3);
        } else if (b.powerup && selectedLevel >= 2) {
          ctx.fillText("*", bx + brickWidth / 2, by + brickHeight / 2 + 4);
        }
      }
    }
  }
}

function drawPatrols() {
  patrols.forEach((p) => {
    if (p.hp > 0) {
      ctx.fillStyle = "darkorange";
      ctx.fillRect(p.x, p.y, p.w, p.h);

      ctx.fillStyle = "white";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`QUAI [${p.hp}]`, p.x + p.w / 2, p.y + p.h / 2 + 4);
    }
  });
}

function drawBoss() {
  if (!boss || boss.hp <= 0) return;

  ctx.fillStyle = "dimgray";
  ctx.fillRect(canvas.width / 2 - 130, 10, 260, 12);
  ctx.fillStyle = "crimson";
  ctx.fillRect(canvas.width / 2 - 130, 10, (boss.hp / boss.maxHp) * 260, 12);

  ctx.fillStyle = "crimson";
  ctx.fillRect(boss.x, boss.y, boss.w, boss.h);

  ctx.fillStyle = "white";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`TRUM CUOI [HP: ${boss.hp}/${boss.maxHp}]`, boss.x + boss.w / 2, boss.y + 15);

  ctx.fillStyle = "orangered";
  bossBullets.forEach((bb) => {
    ctx.fillRect(bb.x - 2, bb.y, 4, 12);
  });
}

function drawBalls() {
  const isPiercing = Date.now() < pierceActiveUntil;
  ctx.fillStyle = isPiercing ? "darkmagenta" : "white";
  balls.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

function drawPaddle() {
  const py = canvas.height - paddleHeight - 15;
  const isStunned = Date.now() < paddleStunUntil;

  if (isStunned) {
    ctx.fillStyle = "crimson";
  } else if (selectedLevel >= 2 && Date.now() < laserActiveUntil) {
    ctx.fillStyle = "orangered";
  } else {
    ctx.fillStyle = "dodgerblue";
  }

  ctx.fillRect(paddleX, py, paddleWidth, paddleHeight);

  if (isStunned) {
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CHOANG", paddleX + paddleWidth / 2, py + 11);
  }

  if (selectedLevel >= 2 && Date.now() < laserActiveUntil && !isStunned) {
    ctx.fillStyle = "white";
    ctx.fillRect(paddleX + 8, py - 4, 4, 4);
    ctx.fillRect(paddleX + paddleWidth - 12, py - 4, 4, 4);
  }
}

function drawLasers() {
  ctx.fillStyle = "red";
  lasers.forEach((l) => {
    ctx.fillRect(l.x - 2, l.y, 4, 14);
  });
}

function drawPowerups() {
  powerups.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(p.label, p.x + p.w / 2, p.y + p.h / 2 + 3);
  });
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "bold 15px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`MAN: ${selectedLevel}`, 25, 32);
  ctx.fillText(`DIEM: ${score}`, 115, 32);
  ctx.fillText(`MANG: ${lives}`, 220, 32);

  let statusX = 315;
  const now = Date.now();

  if (selectedLevel === 4) {
    ctx.fillStyle = "teal";
    ctx.fillText(`[GIO: ${windDirName}]`, statusX, 32);
    statusX += 135;
  }

  if (selectedLevel >= 2) {
    if (now < expandActiveUntil) {
      ctx.fillStyle = "green";
      ctx.fillText(`[+Len: ${Math.ceil((expandActiveUntil - now) / 1000)}s]`, statusX, 32);
      statusX += 85;
    }
    if (now < shrinkActiveUntil) {
      ctx.fillStyle = "gray";
      ctx.fillText(`[-Len: ${Math.ceil((shrinkActiveUntil - now) / 1000)}s]`, statusX, 32);
      statusX += 90;
    }
    if (now < pierceActiveUntil) {
      ctx.fillStyle = "darkmagenta";
      ctx.fillText(`[Pierce: ${Math.ceil((pierceActiveUntil - now) / 1000)}s]`, statusX, 32);
      statusX += 100;
    }
    if (now < laserActiveUntil) {
      ctx.fillStyle = "orangered";
      ctx.fillText(`[Ball: ${Math.ceil((laserActiveUntil - now) / 1000)}s]`, statusX, 32);
    }
  }
}

function drawEndScreen(isWin) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.font = "bold 32px Arial";
  if (isWin) {
    ctx.fillStyle = "limegreen";
    ctx.fillText(`Chiến thắng level ${selectedLevel}!`, canvas.width / 2, canvas.height / 2 - 20);
  } else {
    ctx.fillStyle = "crimson";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
  }

  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Diem cua ban: ${score}`, canvas.width / 2, canvas.height / 2 + 25);

  ctx.font = "14px Arial";
  ctx.fillStyle = "silver";
  ctx.fillText("Nhan chuot bat ky de quay ve Menu chon man", canvas.width / 2, canvas.height / 2 + 65);
}

// ==========================================
// VÒNG LẶP CHÍNH CỦA GAME
// ==========================================
function gameLoop() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "MENU") {
    drawMenu();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameState === "GAMEOVER") {
    drawEndScreen(false);
    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameState === "GAMEWON") {
    drawEndScreen(true);
    requestAnimationFrame(gameLoop);
    return;
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePaddleWidth();

  if (selectedLevel === 4) {
    if (Date.now() - lastWindChange > 8000) {
      lastWindChange = Date.now();
      windForce = -windForce;
      windDirName = windForce > 0 ? "PHAI ->" : "<- TRAI";
    }
  }

  if (selectedLevel === 5) {
    updatePatrols();
  } else if (selectedLevel === 6) {
    updateBoss();
  }

  drawBricks();
  if (selectedLevel === 5) drawPatrols();
  if (selectedLevel === 6) drawBoss();

  if (selectedLevel >= 2) {
    drawLasers();
    drawPowerups();
    updateLasers();
    updatePowerups();
  }

  drawPaddle();
  drawBalls();
  drawUI();

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];

    if (selectedLevel === 4) {
      b.x += windForce * 8;
    }

    collisionDetection(b);

    if (b.x + b.dx > canvas.width - ballRadius || b.x + b.dx < ballRadius) {
      b.dx = -b.dx;
    }

    const topLimit = (selectedLevel === 6) ? 25 : 45;
    if (b.y + b.dy < ballRadius + topLimit) {
      b.dy = -b.dy;
    } else if (b.y + b.dy > canvas.height - paddleHeight - 15 - ballRadius) {
      if (b.x > paddleX && b.x < paddleX + paddleWidth) {
        const hitPoint = (b.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        const maxBounceAngle = (60 * Math.PI) / 180;
        const bounceAngle = hitPoint * maxBounceAngle;

        b.dx = ballSpeed * Math.sin(bounceAngle);
        b.dy = -ballSpeed * Math.cos(bounceAngle);
      } else if (b.y + b.dy > canvas.height - ballRadius) {
        balls.splice(i, 1);
        continue;
      }
    }

    b.x += b.dx;
    b.y += b.dy;
  }

  if (balls.length === 0) {
    lives--;
    if (lives <= 0) {
      gameState = "GAMEOVER";
    } else {
      resetBalls();
    }
  }

  if (Date.now() >= paddleStunUntil) {
    const currentSpeed = shiftPressed ? paddleBoostSpeed : paddleSpeed;
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += currentSpeed;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= currentSpeed;
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
