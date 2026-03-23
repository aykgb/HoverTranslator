// 当页面加载时，从 storage 读取当前设置并显示
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({ theme: 'theme-red' }, (items) => {
        document.getElementById('theme').value = items.theme;
    });
});

// 点击保存按钮时，将设置存入 storage
document.getElementById('save').addEventListener('click', () => {
    const selectedTheme = document.getElementById('theme').value;
    chrome.storage.sync.set({ theme: selectedTheme }, () => {
        // 显示“已保存”提示，1.5秒后消失
        const status = document.getElementById('status');
        status.style.opacity = '1';
        setTimeout(() => {
            status.style.opacity = '0';
        }, 1500);
    });
});
