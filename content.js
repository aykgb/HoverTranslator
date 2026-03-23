let mouseX = 0;
let mouseY = 0;
let tooltip = null;

// 实时记录鼠标位置，并检测是否移出弹窗范围
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // 如果弹窗存在，检测鼠标是否移出了弹窗的“安全范围”
    if (tooltip) {
        const rect = tooltip.getBoundingClientRect();

        // 设定一个 40px 的缓冲距离
        // 这允许鼠标在原本的文字和弹窗之间移动，并且防止手抖导致弹窗消失
        const buffer = 40;

        const isOutside =
            mouseX < rect.left - buffer ||
            mouseX > rect.right + buffer ||
            mouseY < rect.top - buffer ||
            mouseY > rect.bottom + buffer;

        // 如果鼠标移出了设定的范围，则移除弹窗
        if (isOutside) {
            tooltip.remove();
            tooltip = null;
        }
    }
});

// 监听键盘按下事件
document.addEventListener('keydown', (e) => {
    // 增加 !tooltip 判断，避免按住 Ctrl 键时疯狂重复请求
    if (e.key === 'Control' && !tooltip) {
        let textToTranslate = window.getSelection().toString().trim();

        if (!textToTranslate) {
            const element = document.elementFromPoint(mouseX, mouseY);
            if (element && element.innerText) {
                textToTranslate = element.innerText.trim().substring(0, 500);
            }
        }

        if (textToTranslate) {
            chrome.runtime.sendMessage({ type: 'translate', text: textToTranslate }, (response) => {
                if (response && response.translatedText) {
                    showTooltip(response.translatedText, mouseX, mouseY);
                }
            });
        }
    }
});

// 注释或删除了 keyup 事件，现在松开 Ctrl 键弹窗不会立刻消失了
/*
document.addEventListener('keyup', (e) => {
  if (e.key === 'Control' && tooltip) {
    tooltip.remove();
    tooltip = null;
  }
});
*/

// 显示翻译结果的弹窗
function showTooltip(text, x, y) {
    if (tooltip) {
        tooltip.remove();
    }

    tooltip = document.createElement('div');
    tooltip.className = 'hover-translator-tooltip';
    tooltip.innerText = text;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // 弹窗生成在鼠标右下方 15px 处
    tooltip.style.left = `${x + scrollX + 15}px`;
    tooltip.style.top = `${y + scrollY + 15}px`;

    document.body.appendChild(tooltip);
}
