// 历史最高分
const BestScoreKey = "2048BestScore";
// 方格状态和分数
const CellStateKey = "2048CellState";

function Storage() {}
//为 Storage 对象提供构造函数，并为该构造函数创建的对象实例提供方法
Storage.prototype.setBestScore = function (bestScore) {
  window.localStorage.setItem(BestScoreKey, bestScore);
}; //将指定键名和键值作为参数来设置本地存储

Storage.prototype.getBestScore = function () {
  return window.localStorage.getItem(BestScoreKey);
}; //返回本地存储中键名为BestScoresKey的值，即最高分

// 存储方格状态和分数
Storage.prototype.setCellState = function ({ score, grid }) {
  window.localStorage.setItem(
    CellStateKey,
    JSON.stringify({
      //转换为JSON字符串
      score,
      grid: grid.serialize(),
    })
  ); //以便下一次打开游戏页面时可以恢复之前的状态
}; //将方格状态和得分序列化成 JSON 字符串并将其保存到浏览器的本地存储中

// 获取方格信息
Storage.prototype.getCellState = function () {
  const cellState = window.localStorage.getItem(CellStateKey);
  return cellState ? JSON.parse(cellState) : null;
};
//从本地存储中获取之前保存的方格状态和得分，并将其解析为对象后返回
//如果之前没有保存过数据，则返回 null
