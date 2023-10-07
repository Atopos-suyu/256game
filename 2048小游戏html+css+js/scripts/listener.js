function Listener({ move: moveFn, start: startFn }) {//接受对象中的两个属性作为参数
  window.addEventListener('keyup', function(e) {
    switch (e.code) {//注册键盘监听器，按键后会触发指定的事件
      case 'ArrowUp':
        moveFn({ row: -1, column: 0 });
        break;
      case 'ArrowLeft':
        moveFn({ row: 0, column: -1 });
        break;
      case 'ArrowRight':
        moveFn({ row: 0, column: 1 });
        break;
      case 'ArrowDown':
        moveFn({ row: 1, column: 0 });
        break;
    }//条件分支结构，用于根据不同的表达式值执行不同的代码块
  });

  const buttons = document.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
      startFn();
    });
  }//遍历所有的 <button> 元素，并为它们添加一个点击事件监听器
}//点击每个按钮时都会触发 startFn() 函数的执行
