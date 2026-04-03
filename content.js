// 初始化和设置部分
let currentTheme = 'theme-light';

try {
    // 捕获初始化时可能的上下文错误
    chrome.storage.sync.get({ theme: 'theme-light' }, (items) => {
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

// 用于临时存储被移除的 title 属性和所属元素
let hiddenTitleElement = null;
let originalTitleText = '';

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
            if (hiddenTitleElement) {
                hiddenTitleElement.setAttribute('title', originalTitleText);
                hiddenTitleElement = null; // 清空记录
                originalTitleText = '';
            }

            tooltip.remove();
            tooltip = null;
        }
    }
};

const onKeyDown = (e) => {
    try {
        chrome.runtime.id;
    } catch (error) {
        document.removeEventListener('keydown', onKeyDown);
        return;
    }

    // 焦点检测确保当前网页是激活状态，且用户没有在操作地址栏或其他窗口
    if (!document.hasFocus()) return;

    if (e.key === 'Control' && !tooltip) {
        const element = document.elementFromPoint(mouseX, mouseY);
        if (element) {
            // 使用 closest 向上查找，因为 title 有时写在父级 <a> 标签上
            const titleElem = element.closest('[title]');
            if (titleElem) {
                hiddenTitleElement = titleElem; // 记录是哪个元素
                originalTitleText = titleElem.getAttribute('title'); // 保存 title 内容
                titleElem.removeAttribute('title'); // 临时移除，阻止浏览器原生弹窗！
            }
        }

        let textToTranslate = window.getSelection().toString().trim();
        if (!textToTranslate && element && element.innerText) {
            textToTranslate = element.innerText.trim().substring(0, 500);
        }

        if (textToTranslate) {
            try {
                // 【新增：立刻显示加载状态】发送请求前，先在鼠标位置生成一个“翻译中...”的弹窗
                showTooltip("⏳ 翻译中...", mouseX, mouseY, true);

                chrome.runtime.sendMessage({ type: 'translate', text: textToTranslate }, (response) => {
                    if (chrome.runtime.lastError) return;

                    // 【新增：更新翻译结果】收到回复后，如果弹窗还没被鼠标移出关掉，就更新它的内容
                    if (tooltip && response && response.translatedText) {
                        tooltip.classList.remove('is-loading'); // 移除加载动画类名
                        tooltip.innerText = response.translatedText; // 替换为真实翻译内容
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
// 支持加载状态的 showTooltip 函数
function showTooltip(text, x, y, isLoading = false) {
    if (tooltip) {
        tooltip.remove();
    }

    tooltip = document.createElement('div');
    // 根据是否处于加载状态，添加额外的 is-loading 类名
    tooltip.className = `hover-translator-tooltip ${currentTheme} ${isLoading ? 'is-loading' : ''}`;
    tooltip.innerText = text;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    tooltip.style.left = `${x + scrollX + 15}px`;
    tooltip.style.top = `${y + scrollY + 15}px`;

    document.body.appendChild(tooltip);
}
