function Manager(size = 4, aim = 256) {
  this.size = size;
  this.aim = aim;
  this.render = new Render(); //处理游戏界面的渲染
  this.storage = new Storage(); //处理游戏状态的存储
  let self = this; //便于在后续的回调函数内部访问到正确的this对象
  this.listener = new Listener({
    move: function (direction) {
      self.listenerFn(direction);
    }, //用户执行移动操作时调用方法
    start: function () {
      self.start(); //游戏开始时触发方法
    },
  });
  this.defaultStart(); //默认的初始化设置
} //以上为创建一个游戏管理器对象，方法绑定事件响应用户操作和游戏开始

Manager.prototype.defaultStart = function () {
  const state = this.storage.getCellState(); //获取储存对象的游戏状态
  let bestScore = this.storage.getBestScore(); //获取最佳得分
  if (!bestScore) {
    bestScore = 0;
  }
  this.bestScore = bestScore; //获取游戏管理器对象最佳得分
  // 如果存在缓存则恢复
  if (state) {
    this.score = state.score; //恢复游戏当前得分
    this.status = "DOING"; //游戏状态进行中
    this.grid = new Grid(this.size, state.grid);
    //传入游戏大小和从 state.grid 中获取的游戏棋盘格子状态
    //以恢复游戏棋盘
    this._render(); //进行页面渲染，将恢复的游戏状态显示在界面上
  } else {
    this.start();
  }
}; //根据存储的游戏状态或者新开始一个游戏，来进行默认的游戏初始化设置

Manager.prototype.start = function () {
  this.score = 0; //计分板清0
  this.status = "DOING"; //游戏状态设置为进行中
  this.grid = new Grid(this.size); //创建游戏盘面
  for (let i = 0; i < 2; i++) {
    //初始化
    this.addRandomTile();
  } //向盘面中添加两个数字方块
  this._render(); //渲染游戏盘面
};

Manager.prototype._render = function () {
  // 渲染之前调用存储
  this.storage.setCellState({ score: this.score, grid: this.grid });
  if (this.score > this.bestScore) {
    this.bestScore = this.score;
    this.storage.setBestScore(this.bestScore);
  }
  this.render.render(this.grid, {
    //调用render属性的render方法
    score: this.score,
    status: this.status,
    bestScore: this.bestScore,
  });
}; //将游戏盘面（grid）的状态渲染到前端界面上

// 随机添加一个节点
Manager.prototype.addRandomTile = function () {
  const position = this.grid.randomAvailableCell(); //获取可用的随机空白格子
  if (position) {
    // 90%概率为2，10%为4
    const value =
      Math.random() < 0.2
        ? 2
        : 4
    // 随机一个方格的位置
    const position = this.grid.randomAvailableCell();
    // 添加到grid中
    this.grid.add(new Tile(position, value));
  }
}; //该方法可在游戏盘面中随机生成一个新的数字方块

// 移动逻辑核心
Manager.prototype.listenerFn = function (direction) {
  // 定义一个变量，判断是否引起移动，初始值为false移动则为true
  let moved = false;
  //根据移动方向获取路径rowPath和columnPath
  const { rowPath, columnPath } = this.getPaths(direction);
  for (let i = 0; i < rowPath.length; i++) {
    for (let j = 0; j < columnPath.length; j++) {
      const position = { row: rowPath[i], column: columnPath[j] };
      const tile = this.grid.get(position);
      if (tile) {
        // 当此位置有Tile，根据移动方向获取最近可用位置和下一个位置
        const { aim, next } = this.getNearestAvaibleAim(position, direction);

        // 区分合并和移动，当next值和tile值相同的时候才进行合并
        if (next && next.value === tile.value) {
          // 合并位置是next的位置，合并的value是tile.value * 2
          const merged = new Tile(
            {
              row: next.row,
              column: next.column,
            },
            tile.value * 2
          );

          this.score += merged.value; //更新分数
          //将合并以后节点，加入grid
          this.grid.add(merged);
          //在grid中删除原始的节点
          this.grid.remove(tile);
          //判断游戏是否获胜
          if (merged.value === this.aim) {
            this.status = "WIN";
          } //将相邻的两个方块合并为一个，并进行相应的位置更新
          merged.mergedTiles = [tile, next];
          tile.updatePosition({ row: next.row, column: next.column });
          moved = true;
        } else {
          this.moveTile(tile, aim);
          moved = true; //表示进行了移动操作
        }
      }
    }
  }

  // 移动以后进行重新渲染
  if (moved) {
    this.addRandomTile(); //在游戏盘面上随机生成一个新的数字方块
    if (this.checkFailure()) {
      this.status = "FAILURE";
    }
    this._render(); //重新渲染游戏界面
  }
};

// 移动Tile，先将grid中老位置删除，再添加新位置
Manager.prototype.moveTile = function (tile, aim) {
  this.grid.cells[tile.row][tile.column] = null; //清除该位置上的方块
  tile.updatePosition(aim); //将方块位置更新为目标位置aim
  this.grid.cells[aim.row][aim.column] = tile; //将移动方块放置在游戏盘面上
};

// 根据方向，确定遍历的顺序
Manager.prototype.getPaths = function (direction) {
  let rowPath = [];
  let columnPath = []; //用于储存行和列的遍历顺序
  for (let i = 0; i < this.size; i++) {
    rowPath.push(i);
    columnPath.push(i);
  }

  // 向右的时候
  if (direction.column === 1) {
    columnPath = columnPath.reverse();
  } //将columnPath数组反转（倒序以便从右向左遍历游戏盘面的列

  // 向下的时候
  if (direction.row === 1) {
    rowPath = rowPath.reverse();
  } //将rowPath数组反转（倒序），以便从下往上遍历游戏盘面的行
  return {
    rowPath,
    columnPath,
  };
}; //根据给定的移动方向确定遍历游戏盘面的行和列的顺序

Manager.prototype.getNearestAvaibleAim = function (aim, direction) {
  // 寻找移动方向目标位置
  function addVector(position, direction) {
    return {
      row: position.row + direction.row,
      column: position.column + direction.column,
    };
  } // 位置 + 方向向量的计算公式
  aim = addVector(aim, direction);

  let next = this.grid.get(aim);
  // 获取游戏盘面上新目标位置的元素

  while (!this.grid.outOfRange(aim) && !next) {
    aim = addVector(aim, direction);
    next = this.grid.get(aim);
  } //判断新目标位置是否超出游戏边界且没有元素存在
  //满足条件则继续向移动方向前进一步,更新目标位置，并再次获取新位置上的元素。

  aim = {
    row: aim.row - direction.row,
    column: aim.column - direction.column,
  }; //目标位置（上述多计算的一步）减去移动方向向量，将其还原为最近可用的目标位置

  return {
    aim,
    next,
  };
};

// 判断游戏是否失败
Manager.prototype.checkFailure = function () {
  // 获取空白的Cell
  const emptyCells = this.grid.availableCells();
  // 如果存在空白，则游戏肯定没有失败
  if (emptyCells.length > 0) {
    return false;
  }

  for (let row = 0; row < this.grid.size; row++) {
    for (let column = 0; column < this.grid.size; column++) {
      let now = this.grid.get({ row, column });

      // 根据4个方向，判断临近的Tile的Value值是否相同
      let directions = [
        { row: 0, column: 1 },
        { row: 0, column: -1 },
        { row: 1, column: 0 },
        { row: -1, column: 0 },
      ];
      for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];
        const next = this.grid.get({
          row: row + direction.row,
          column: column + direction.column,
        }); //计算出下一个相邻方格的位置
        // 判断当前方块和相邻方块的Value是否相同
        if (next && next.value === now.value) {
          return false;
        }
      }
    }
  }
  return true;
};
