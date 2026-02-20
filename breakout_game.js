// 獲取canvas元素和上下文
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverElement = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");

// 遊戲元素初始位置和尺寸
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 遊戲狀態
let score = 0;
let lives = 3;
let bestTime = localStorage.getItem('breakout_best_time') ? parseFloat(localStorage.getItem('breakout_best_time')) : null;
let gameRunning = true;
let ballVisible = true;
let startTime = Date.now();
let gameEndTime = 0;

document.getElementById("bestTime").innerText = bestTime ? bestTime.toFixed(1) : "-";

// 創建磚塊數組
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// 輸入處理
let rightPressed = false;
let leftPressed = false;
let mouseX = 0;

// 事件監聽器
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
canvas.addEventListener("click", startGame, false);

// 鍵盤事件處理函數
function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// 鼠標移動事件處理函數
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        mouseX = relativeX;
        paddleX = mouseX - paddleWidth / 2;
    }
}

// 開始遊戲
function startGame() {
    if (!gameRunning) {
        // 重置遊戲狀態
        document.location.reload();
    }
}

// 重新開始遊戲
function restartGame() {
    // 隱藏遊戲結束畫面
    gameOverElement.style.display = "none";

    // 重置遊戲狀態
    score = 0;
    lives = 3;
    gameRunning = true;
    ballVisible = true;
    startTime = Date.now();
    gameEndTime = 0;

    // 重置球的位置
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;

    // 重置擋板位置
    paddleX = (canvas.width - paddleWidth) / 2;

    // 重置磚塊
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }

    // 更新UI
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = "❤️".repeat(Math.max(0, lives));
}

// 結束遊戲
function quitGame() {
    // 可以添加其他結束遊戲的邏輯
    gameOverElement.style.display = "none";
    alert("感謝遊玩！");
}

// 碰撞檢測
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    document.getElementById("score").innerText = score;

                    // 檢查是否贏得遊戲
                    if (score == brickRowCount * brickColumnCount) {
                        gameRunning = false;
                        gameEndTime = Date.now();
                        let finalTime = (gameEndTime - startTime) / 1000;
                        if (!bestTime || finalTime < bestTime) {
                            bestTime = finalTime;
                            localStorage.setItem('breakout_best_time', bestTime);
                            document.getElementById("bestTime").innerText = bestTime.toFixed(1);
                        }
                        alert("恭喜你贏得遊戲！過關時間: " + finalTime.toFixed(1) + " 秒");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// 繪制球
function drawBall() {
    if (!ballVisible) return;

    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 繪制擋板
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 繪制磚塊
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 繪制得分
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("得分: " + score, 8, 20);

    let timeToShow = gameRunning ? (Date.now() - startTime) / 1000 : (gameEndTime ? (gameEndTime - startTime) / 1000 : 0);
    ctx.fillText("時間: " + timeToShow.toFixed(1) + "s", canvas.width / 2 - 45, 20);
}

// 繪制生命
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("生命: " + "❤️".repeat(Math.max(0, lives)), canvas.width - 120, 20);
}

// 主繪制函數
function draw() {
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪制遊戲元素
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // 球與墻的碰撞檢測
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    }
    // 球與擋板的碰撞檢測
    else if (y + dy > canvas.height - ballRadius - paddleHeight) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            // 根據球擊中擋板的位置改變球的方向
            const hitPosition = (x - paddleX) / paddleWidth;
            dx = 4 * (hitPosition - 0.5); // 根據擊中位置調整水平速度
            dy = -Math.abs(dy); // 確保球向上反彈
        }
        else {
            // 球未擊中擋板
            lives--;
            document.getElementById("lives").innerText = "❤️".repeat(Math.max(0, lives));
            if (lives <= 0) {
                // 顯示遊戲結束畫面
                finalScoreElement.innerText = score;
                gameOverElement.style.display = "block";
                gameRunning = false;
                gameEndTime = Date.now();
                ballVisible = false;
            }
            else {
                // 重置球的位置
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
    // 球超出底部邊界
    else if (y + dy > canvas.height - ballRadius) {
        // 球未擊中擋板
        lives--;
        document.getElementById("lives").innerText = "❤️".repeat(Math.max(0, lives));
        if (lives <= 0) {
            // 顯示遊戲結束畫面
            finalScoreElement.innerText = score;
            gameOverElement.style.display = "block";
            gameRunning = false;
            gameEndTime = Date.now();
            ballVisible = false;
        }
        else {
            // 重置球的位置
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // 更新球的位置
    x += dx;
    y += dy;

    // 更新擋板位置
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // 請求下一幀動畫
    requestAnimationFrame(draw);
}

// 初始繪制
draw();
