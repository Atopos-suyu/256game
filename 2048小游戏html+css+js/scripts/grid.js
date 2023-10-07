//grid.js
function Grid(size = 4, state) {
  this.size = size; 
  this.cells = [];  
  this.init(size);  //调用init方法进行初始化
    // 如果有之前的进度，则恢复
  if (state) {
    this.recover(state);
  }
}  //Grid对象表示一个游戏棋盘，大小为size*size的方格，参数state恢复游戏进度

Grid.prototype.recover = function({ size, cells }) {
  this.size = size;
//通过遍历cells二维数组，如果某个单元格存在内容，则新建一个Tile对象并放在Grid对象的位置上
  for (let row = 0; row < this.size; row++) {
    for (let column = 0; column < this.size; column++) {
      const cell = cells[row][column];
      if (cell) {
        this.cells[row][column] = new Tile(cell.position, cell.value);
      }
    }
  }
};//recover方法用于恢复Grid对象的状态

Grid.prototype.init = function(size) {
  for (let row = 0; row < size; row++) {
    this.cells.push([]);
    for (let column = 0; column < size; column++) {
      this.cells[row].push(null);
    }
  }
};//定义一个Grid对象的初始化方法，创建指定大小的二维数组，遍历循环将每个位置的值初始化为null

Grid.prototype.add = function(tile) {
  this.cells[tile.row][tile.column] = tile;
};//add方法将tile对象添加到网格的对应单元格，存储在对应位置的二维数组中

Grid.prototype.remove = function(tile) {
  this.cells[tile.row][tile.column] = null;
};//remove方法用于从网格中移除tile对象，将对应单元格的值设置为null

// 获取Grid所有可用方格的位置
Grid.prototype.availableCells = function() {
  const availableCells = [];
  for (let row = 0; row < this.cells.length; row++) {
    for (let column = 0; column < this.cells[row].length; column++) {
      // 如果当前方格没有内容，则其可用（空闲）
      if (!this.cells[row][column]) {
        availableCells.push({ row, column });
      }//将这个单元格的行和列的值作为一个对象推入'availableCells'数组
    }
  }
  return availableCells;//即所有空闲单元格的列表
};

//从给定的Grid对象中获取所有空闲方格并随机返回其中一个方格
Grid.prototype.randomAvailableCell = function() {
  // 获取到所有的空闲方格
  const cells = this.availableCells();
  if (cells.length > 0) {
    //如果存在空闲方格,利用Math.random()随机获取其中的某一个
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

// 获取某个位置的Tile
Grid.prototype.get = function(position) {
  if (this.outOfRange(position)) {
    return null;
  }
  return this.cells[position.row][position.column];
};

// 判断某个位置是否超出边界
Grid.prototype.outOfRange = function(position) {
  return (
    position.row < 0 ||
    position.row >= this.size ||
    position.column < 0 ||
    position.column >= this.size
  );
};//满足以下任何条件，则判断true

Grid.prototype.serialize = function() {
  const cellState = [];

  // cellState 是一个二维数组，分别存储整个Grid信息。
  // 如果该位置有Tile, 则返回 Tile序列化结果
  // 如果该位置没有Tile，则存储null
  for (let row = 0; row < this.size; row++) {
    cellState[row] = [];
    for (let column = 0; column < this.size; column++) {
      cellState[row].push(
        this.cells[row][column] ? this.cells[row][column].serialize() : null
      );//如果该位置有tile则调用Tile对象的serialize方法将Tile序列化的结果存入cellState
    }//如果没有则存储null
  }

  return {
    size: this.size,
    cells: cellState  //cells表示存储了所有格子状态的二维数组
  };
};
