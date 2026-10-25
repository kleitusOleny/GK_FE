const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Cập nhật kích thước canvas theo cửa sổ
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

// Cấu hình bóng
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 50;
const ballSpeed = 4; // Tốc độ cố định của bóng
let dx = ballSpeed * Math.cos(-Math.PI / 4);
let dy = ballSpeed * Math.sin(-Math.PI / 4);

// Cấu hình thanh đỡ (Paddle)
const paddleHeight = 15;
let paddleWidth = Math.max(120, canvas.width * 0.12);
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 8;

// Điều khiển
let rightPressed = false;
let leftPressed = false;

// Cấu hình các khối gạch
const brickRowCount = 5;
const brickColumnCount = 10;
let brickPadding = 10;
let brickOffsetTop = 50;
let brickOffsetLeft = 30;

let brickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
let brickHeight = 25;

// Điểm số
let score = 0;

// Khởi tạo ma trận gạch
let bricks = [];
function initBricks() {
  bricks = [];
  brickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBricks();

window.addEventListener("resize", () => {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  resizeCanvas();

  paddleWidth = Math.max(120, canvas.width * 0.12);
  paddleX = (paddleX / oldWidth) * canvas.width;
  x = (x / oldWidth) * canvas.width;
  y = (y / oldHeight) * canvas.height;

  brickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
});

// Bắt sự kiện bàn phím & chuột
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = Math.min(Math.max(relativeX - paddleWidth / 2, 0), canvas.width - paddleWidth);
  }
}

// Kiểm tra va chạm với gạch
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("Chúc mừng! Bạn đã chiến thắng!");
            document.location.reload();
          }
        }
      }
    }
  }
}

// Vẽ bóng
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#00d2ff";
  ctx.fill();
  ctx.closePath();
}

// Vẽ thanh đỡ
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 15, paddleWidth, paddleHeight);
  ctx.fillStyle = "#3a7bd5";
  ctx.fill();
  ctx.closePath();
}

// Vẽ các khối gạch
const rowColors = ["#ff4b4b", "#ff8533", "#ffd000", "#2ed573", "#1e90ff"];
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = rowColors[r % rowColors.length];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Điểm: " + score, 30, 30);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - paddleHeight - 15 - ballRadius) {
    // Kiểm tra chạm thanh đỡ
    if (x > paddleX && x < paddleX + paddleWidth) {
      // Tính vị trí va chạm trên thanh (-1: ngoài cùng bên trái, 0: ở giữa, 1: ngoài cùng bên phải)
      const hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
      // Giới hạn góc nảy tối đa (khoảng 60 độ so với phương thẳng đứng)
      const maxBounceAngle = (60 * Math.PI) / 180;
      const bounceAngle = hitPoint * maxBounceAngle;

      // Cập nhật dx, dy nhưng luôn giữ nguyên tổng tốc độ (ballSpeed)
      dx = ballSpeed * Math.sin(bounceAngle);
      dy = -ballSpeed * Math.cos(bounceAngle);
    } else if (y + dy > canvas.height - ballRadius) {
      alert("Game Over!");
      document.location.reload();
      return;
    }
  }

  // Di chuyển bằng bàn phím
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleSpeed;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

draw();
