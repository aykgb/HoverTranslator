let mouseX = 0;
let mouseY = 0;
let tooltip = null;

// 实时记录鼠标位置
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 监听键盘按下事件
document.addEventListener('keydown', (e) => {
  // 当按下 Ctrl 键时触发 (macOS 可以改为 Meta 键)
  if (e.key === 'Control') {
    // 优先获取用户选中的文字
    let textToTranslate = window.getSelection().toString().trim();

    // 如果没有选中文字，则获取鼠标悬停元素的文字
    if (!textToTranslate) {
      const element = document.elementFromPoint(mouseX, mouseY);
      if (element && element.innerText) {
        // 截取前 500 个字符，防止提取整个网页的文本导致翻译失败
        textToTranslate = element.innerText.trim().substring(0, 500); 
      }
    }

    if (textToTranslate) {
      // 发送消息给 background.js 请求翻译
      chrome.runtime.sendMessage({ type: 'translate', text: textToTranslate }, (response) => {
        if (response && response.translatedText) {
          showTooltip(response.translatedText, mouseX, mouseY);
        }
      });
    }
  }
});

// 监听键盘抬起事件，松开 Ctrl 隐藏翻译结果
document.addEventListener('keyup', (e) => {
  if (e.key === 'Control' && tooltip) {
    tooltip.remove();
    tooltip = null;
  }
});

// 显示翻译结果的弹窗
function showTooltip(text, x, y) {
  if (tooltip) {
    tooltip.remove();
  }

  tooltip = document.createElement('div');
  tooltip.className = 'hover-translator-tooltip';
  tooltip.innerText = text;

  // 确保弹窗在页面可见范围内
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  tooltip.style.left = `${x + scrollX + 15}px`;
  tooltip.style.top = `${y + scrollY + 15}px`;

  document.body.appendChild(tooltip);
}
