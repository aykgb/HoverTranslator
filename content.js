// 初始化和设置部分
let currentTheme = 'theme-red';

try {
    // 捕获初始化时可能的上下文错误
    chrome.storage.sync.get({ theme: 'theme-red' }, (items) => {
        currentTheme = items.theme;
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.theme) {
            currentTheme = changes.theme.newValue;
        }
    });
} catch (e) {
    // 如果插件已失效，安静忽略
}

let mouseX = 0;
let mouseY = 0;
let tooltip = null;

// 定义具名函数，以便随时解除绑定
const onMouseMove = (e) => {
    // 【终极修复核心】：探测探测插件上下文是否存活
    try {
        chrome.runtime.id;
    } catch (error) {
        // 一旦抛出异常，说明插件已被重载。立刻解除绑定，自我销毁
        document.removeEventListener('mousemove', onMouseMove);
        return;
    }

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (tooltip) {
        const rect = tooltip.getBoundingClientRect();
        const buffer = 40;

        const isOutside =
            mouseX < rect.left - buffer ||
            mouseX > rect.right + buffer ||
            mouseY < rect.top - buffer ||
            mouseY > rect.bottom + buffer;

        if (isOutside) {
            tooltip.remove();
            tooltip = null;
        }
    }
};

const onKeyDown = (e) => {
    // 【终极修复核心】：探测插件上下文是否存活
    try {
        chrome.runtime.id;
    } catch (error) {
        // 自我销毁
        document.removeEventListener('keydown', onKeyDown);
        return;
    }

    if (e.key === 'Control' && !tooltip) {
        let textToTranslate = window.getSelection().toString().trim();

        if (!textToTranslate) {
            const element = document.elementFromPoint(mouseX, mouseY);
            if (element && element.innerText) {
                textToTranslate = element.innerText.trim().substring(0, 500);
            }
        }

        if (textToTranslate) {
            try {
                chrome.runtime.sendMessage({ type: 'translate', text: textToTranslate }, (response) => {
                    // 检查 lastError，防止后台没响应时控制台出现黄字警告
                    if (chrome.runtime.lastError) return;

                    if (response && response.translatedText) {
                        showTooltip(response.translatedText, mouseX, mouseY);
                    }
                });
            } catch (error) {
                // 忽略发送消息时的极限边缘报错
            }
        }
    }
};

// 绑定事件
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('keydown', onKeyDown);

// 显示翻译结果的弹窗
function showTooltip(text, x, y) {
    if (tooltip) {
        tooltip.remove();
    }

    tooltip = document.createElement('div');
    tooltip.className = `hover-translator-tooltip ${currentTheme}`;
    tooltip.innerText = text;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    tooltip.style.left = `${x + scrollX + 15}px`;
    tooltip.style.top = `${y + scrollY + 15}px`;

    document.body.appendChild(tooltip);
}
