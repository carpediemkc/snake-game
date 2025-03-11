// 游戏结束函数
function gameOver() {
    // 停止游戏循环
    clearInterval(gameInterval);
    gameInterval = null;
    
    // 设置游戏结束标志
    isGameOver = true;
    
    // 绘制游戏结束界面
    draw();
}