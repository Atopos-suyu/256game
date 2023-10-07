//render.js
function Render() {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".now .value");
  this.statusContainer = document.querySelector(".status");
  this.bestScoreContainer = document.querySelector(".best .value");
} //构造函数 Render()，用于初始化游戏界面的相关元素

// 渲染整个游戏界面
Render.prototype.render = function (grid, { score, status, bestScore }) {
  this.empty(); //用于清空游戏界面，即移除之前渲染的方块
  this.renderScore(score);
  this.renderBestScore(bestScore);
  this.renderStatus(status); //分别用于渲染得分、历史最高分和游戏状态
  for (let row = 0; row < grid.size; row++) {
    for (let column = 0; column < grid.size; column++) {
      // 如果grid中某个cell不为空，则渲染这个cell
      if (grid.cells[row][column]) {
        this.renderTile(grid.cells[row][column]);
      }
    }
  } //调用 this.renderTile(grid.cells[row][column]) 方法进行渲染，将方块显示在游戏界面上
};

Render.prototype.renderBestScore = function (bestScore) {
  this.bestScoreContainer.innerHTML = bestScore;
}; //用于渲染历史最高分，将传入的 bestScore 参数更新到界面上显示

Render.prototype.renderScore = function (score) {
  this.scoreContainer.innerHTML = score;
}; //用于渲染当前得分，将传入的 score 参数更新到界面上显示

Render.prototype.renderStatus = function (status) {
  if (status === "DOING") {
    //表示游戏正在进行中，此时隐藏游戏状态容器
    this.statusContainer.style.display = "none";
    return;
  } //用于渲染游戏状态，根据传入的 status 参数来显示相应的界面内容
  this.statusContainer.style.display = "flex";
  this.statusContainer.querySelector(".content").innerHTML =
    status === "WIN" ? "You Win!" : "Game Over!";
}; //表示游戏结束。此时显示游戏状态容器，并根据 status 的值设置状态内容

// 清空tileContainer
Render.prototype.empty = function () {
  this.tileContainer.innerHTML = "";
};

// 渲染单个tile
Render.prototype.renderTile = function (tile) {
  // 创建一个tile-inner
  const tileInner = document.createElement("div");
  tileInner.setAttribute("class", "tile-inner"); //设置类名
  tileInner.innerHTML = tile.value; //赋值

  // 创建一个tile
  const tileDom = document.createElement("div");
  let classList = [
    //数组中包含3个类名
    "tile",
    `tile-${tile.value}`, //根据方块的值动态生成,${}将包含变量或表达式
    `tile-position-${tile.row + 1}-${tile.column + 1}`, //根据方块的行和列值加1生成
  ];

  if (tile.prePosition) {
    // 先设置之前的位置
    classList[2] = `tile-position-${tile.prePosition.row + 1}-${
      tile.prePosition.column + 1
    }`;
    // 延迟设置当前的位置
    setTimeout(function () {
      classList[2] = `tile-position-${tile.row + 1}-${tile.column + 1}`;
      tileDom.setAttribute("class", classList.join(" "));
    }, 16); //将数组中的元素以空格分隔拼接成一个字符串：'tile tile-2 tile-position-3-4'
  } else if (tile.mergedTiles) {
    //表示该方块是由多个方块合并而成
    classList.push("tile-merged"); //添加类名
    //如果有mergedTiles，则渲染mergedTile的两个Tile
    tileDom.setAttribute("class", classList.join(" "));
    for (let i = 0; i < tile.mergedTiles.length; i++) {
      this.renderTile(tile.mergedTiles[i]);
    } //对合并的方块再调用renderTile方法进行渲染
  } else {
    classList.push("tile-new");
  }

  tileDom.setAttribute("class", classList.join(" "));
  tileDom.appendChild(tileInner); //将tileInner添加为tileDom的子元素
  this.tileContainer.appendChild(tileDom);
}; //这个方法通过创建和设置不同的类名来渲染方块的位置、合并状态和新创建状态
//并将渲染后的方块元素添加到指定的容器中
