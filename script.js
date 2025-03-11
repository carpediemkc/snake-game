// 游戏常量
const GRID_SIZE = 20; // 网格大小
const BASE_GAME_SPEED = 150; // 基础游戏速度（毫秒）

// 关卡配置
const LEVELS = [
    { name: "第1关", speed: BASE_GAME_SPEED, targetScore: 50, obstacles: [] },
    { 
        name: "第2关", 
        speed: BASE_GAME_SPEED - 20, 
        targetScore: 100, 
        obstacles: [
            {x: 5, y: 5}, {x: 6, y: 5}, {x: 7, y: 5},
            {x: 14, y: 14}, {x: 14, y: 15}, {x: 14, y: 16}
        ] 
    },
    { 
        name: "第3关", 
        speed: BASE_GAME_SPEED - 40, 
        targetScore: 150, 
        obstacles: [
            {x: 0, y: 10}, {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10},
            {x: 16, y: 10}, {x: 17, y: 10}, {x: 18, y: 10}, {x: 19, y: 10}
        ] 
    },
    { 
        name: "第4关", 
        speed: BASE_GAME_SPEED - 60, 
        targetScore: 200, 
        obstacles: [
            {x: 5, y: 5}, {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5},
            {x: 5, y: 15}, {x: 6, y: 15}, {x: 7, y: 15}, {x: 8, y: 15},
            {x: 12, y: 5}, {x: 13, y: 5}, {x: 14, y: 5}, {x: 15, y: 5},
            {x: 12, y: 15}, {x: 13, y: 15}, {x: 14, y: 15}, {x: 15, y: 15}
        ] 
    },
    { 
        name: "第5关", 
        speed: BASE_GAME_SPEED - 80, 
        targetScore: 250, 
        obstacles: [
            // 十字形障碍
            {x: 10, y: 5}, {x: 10, y: 6}, {x: 10, y: 7}, {x: 10, y: 8},
            {x: 10, y: 12}, {x: 10, y: 13}, {x: 10, y: 14}, {x: 10, y: 15},
            {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10},
            {x: 12, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}, {x: 15, y: 10}
        ] 
    }
];

// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isPaused = false;
let isGameOver = false;
let currentLevel = parseInt(localStorage.getItem('snakeCurrentLevel') || 0);
let obstacles = [];
let levelCompleted = false;
let isReady = false; // 新增：准备状态变量，表示玩家是否准备好开始游戏

// DOM 元素
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const currentLevelElement = document.getElementById('current-level');
const levelsContainer = document.getElementById('levels-container');
const resetLevelsBtn = document.getElementById('reset-levels-btn');

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 确保从localStorage获取最新的关卡进度
    currentLevel = parseInt(localStorage.getItem('snakeCurrentLevel') || 0);
    
    // 初始化当前关卡的障碍物
    obstacles = LEVELS[currentLevel].obstacles.slice();
    
    // 根据关卡设置蛇的初始位置
    if (currentLevel === 4) { // 第5关
        // 避开十字形障碍物，将蛇放在左上角
        snake = [
            {x: 2, y: 2},
            {x: 1, y: 2},
            {x: 0, y: 2}
        ];
    } else {
        // 其他关卡使用默认位置
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
    }
    
    // 生成第一个食物
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    isPaused = false;
    isGameOver = false;
    levelCompleted = false;
    isReady = false; // 重置准备状态
    
    // 更新当前关卡显示
    currentLevelElement.textContent = LEVELS[currentLevel].name;
    
    // 绘制初始状态
    draw();
    
    // 显示准备信息
    showReadyMessage();
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        initGame();
    }
    
    if (!gameInterval && isReady) {
        gameInterval = setInterval(gameLoop, LEVELS[currentLevel].speed);
        isPaused = false;
        pauseBtn.textContent = '暂停';
    } else if (!isReady) {
        // 显示提示信息，告诉玩家按空格键或方向键开始游戏
        showReadyMessage();
    }
}

// 显示准备信息
function showReadyMessage() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`${LEVELS[currentLevel].name}`, canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('按空格键或方向键开始游戏', canvas.width / 2, canvas.height / 2 + 10);
}

// 暂停游戏
function pauseGame() {
    if (!isGameOver) {
        if (isPaused) {
            gameInterval = setInterval(gameLoop, LEVELS[currentLevel].speed);
            isPaused = false;
            pauseBtn.textContent = '暂停';
        } else {
            clearInterval(gameInterval);
            gameInterval = null;
            isPaused = true;
            pauseBtn.textContent = '继续';
            
            // 显示暂停文本
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '24px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('游戏已暂停', canvas.width / 2, canvas.height / 2);
        }
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    initGame();
    // 更新关卡选择面板和当前关卡显示
    initLevelSelection();
    startGame();
}

// 游戏主循环
function gameLoop() {
    update();
    draw();
}

// 更新游戏状态
function update() {
    // 更新方向
    direction = nextDirection;
    
    // 计算蛇头的下一个位置
    const head = {...snake[0]};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查是否游戏结束（撞墙或撞到自己）
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇身体
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 检查是否达到关卡目标分数
        if (score >= LEVELS[currentLevel].targetScore && !levelCompleted) {
            levelCompleted = true;
            levelComplete();
        }
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制食物
    ctx.fillStyle = '#FF5722';
    drawCell(food.x, food.y);
    
    // 绘制障碍物
    ctx.fillStyle = '#795548';
    obstacles.forEach(obstacle => {
        drawCell(obstacle.x, obstacle.y);
    });
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头用深色，身体用浅色
        ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50';
        drawCell(segment.x, segment.y);
    });
    
    // 显示当前关卡信息
    ctx.fillStyle = '#333';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText(`${LEVELS[currentLevel].name}`, 10, 20);
    ctx.fillText(`目标: ${score}/${LEVELS[currentLevel].targetScore}`, 10, 40);
    
    // 如果游戏结束，显示游戏结束文本
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText('按方向键或空格键重新开始', canvas.width / 2, canvas.height / 2 + 45);
    }
}

// 绘制网格背景
function drawGrid() {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += canvas.width / GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += canvas.height / GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制单个网格单元
function drawCell(x, y) {
    const cellSize = canvas.width / GRID_SIZE;
    ctx.fillRect(
        x * cellSize, 
        y * cellSize, 
        cellSize, 
        cellSize
    );
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        // 确保食物不会生成在蛇身上或障碍物上
    } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
        obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y)
    );
    
    food = newFood;
}

// 检查碰撞
function isCollision(position) {
    // 检查是否撞墙
    if (
        position.x < 0 || 
        position.y < 0 || 
        position.x >= GRID_SIZE || 
        position.y >= GRID_SIZE
    ) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (position.x === snake[i].x && position.y === snake[i].y) {
            return true;
        }
    }
    
    // 检查是否撞到障碍物
    for (let i = 0; i < obstacles.length; i++) {
        if (position.x === obstacles[i].x && position.y === obstacles[i].y) {
            return true;
        }
    }
    
    return false;
}

// 关卡完成
// 关卡完成
function levelComplete() {
    clearInterval(gameInterval);
    gameInterval = null;
    
    // 显示关卡完成信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`${LEVELS[currentLevel].name}完成！`, canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2);
    
    // 检查是否还有下一关
    if (currentLevel < LEVELS.length - 1) {
        // 先更新currentLevel值，再保存到localStorage
        currentLevel++;
        localStorage.setItem('snakeCurrentLevel', currentLevel);
        
        // 更新关卡选择面板
        initLevelSelection();
        
        ctx.fillText('准备进入下一关...', canvas.width / 2, canvas.height / 2 + 30);
        
        // 3秒后自动初始化下一关，但需要玩家按键才能开始
        setTimeout(() => {
            // 确保使用最新的currentLevel值
            initGame();
            // 不自动开始游戏，等待玩家按键
            // startGame();
        }, 3000);
    } else {
        ctx.fillText('恭喜！你已完成所有关卡！', canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText('按"重新开始"按钮重玩游戏', canvas.width / 2, canvas.height / 2 + 60);
    }
}

// 初始化关卡选择面板
function initLevelSelection() {
    // 清空关卡容器
    levelsContainer.innerHTML = '';
    
    // 获取已解锁的最高关卡
    const unlockedLevel = parseInt(localStorage.getItem('snakeCurrentLevel') || 0);
    
    // 创建关卡按钮
    LEVELS.forEach((level, index) => {
        const levelBtn = document.createElement('button');
        levelBtn.textContent = level.name;
        levelBtn.classList.add('level-btn');
        
        // 如果关卡未解锁，添加锁定样式
        if (index > unlockedLevel) {
            levelBtn.classList.add('locked');
            levelBtn.disabled = true;
        } else {
            // 为已解锁的关卡添加点击事件
            levelBtn.addEventListener('click', () => {
                currentLevel = index;
                localStorage.setItem('snakeCurrentLevel', currentLevel);
                initGame();
                if (gameInterval) {
                    clearInterval(gameInterval);
                }
                startGame();
            });
        }
        
        levelsContainer.appendChild(levelBtn);
    });
}

// 重置所有关卡
function resetAllLevels() {
    localStorage.setItem('snakeCurrentLevel', 0);
    currentLevel = 0;
    initLevelSelection();
    initGame();
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    initGame();
    
    // 初始化关卡选择面板
    initLevelSelection();
    
    // 添加按钮事件监听
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    resetLevelsBtn.addEventListener('click', resetAllLevels);
    
    // 添加键盘控制
    document.addEventListener('keydown', (e) => {
        // 阻止方向键和空格键的默认行为
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // 如果游戏结束，按下方向键或空格键重新开始游戏
        if (isGameOver) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                isGameOver = false;
                isReady = true;
                initGame();
                startGame();
                // 如果是空格键，不改变方向
                if (e.key === ' ') return;
            }
            return;
        }
        
        // 如果游戏尚未准备好，按下方向键或空格键开始游戏
        if (!isReady && !isPaused) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                isReady = true;
                startGame();
                // 如果是空格键，不改变方向
                if (e.key === ' ') return;
            }
        }
        
        switch(e.key) {
            case 'ArrowUp':
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
            case ' ': // 空格键也可以暂停/继续游戏
                if (isReady && !isGameOver) {
                    pauseGame();
                }
                break;
        }
    });
});

// 游戏结束
function gameOver() {
    // 停止游戏循环
    clearInterval(gameInterval);
    gameInterval = null;
    
    // 设置游戏结束标志
    isGameOver = true;
    
    // 设置准备状态为false，需要玩家按键才能开始
    isReady = false;
    
    // 绘制游戏结束界面
    draw();
}