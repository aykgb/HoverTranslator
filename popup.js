document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme');
    const statusText = document.getElementById('status');

    // 1. 打开弹窗时，读取当前保存的设置并选中
    chrome.storage.sync.get({ theme: 'theme-light' }, (items) => {
        themeSelect.value = items.theme;
    });

    // 2. 监听下拉框改变，实时生效并显示提示
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        chrome.storage.sync.set({ theme: selectedTheme }, () => {
            statusText.style.opacity = '1';
            setTimeout(() => {
                statusText.style.opacity = '0';
            }, 1000);
        });
    });

    // 3. 【全新逻辑】监听整个面板的单击事件来关闭窗口
    document.addEventListener('click', (e) => {
        // 非常重要：必须排除掉点击 <select> 下拉框本身的情况
        // 否则用户一点击下拉框，还没来得及选，面板就消失了
        if (e.target.tagName.toLowerCase() !== 'select') {
            window.close();
        }
    });
});
