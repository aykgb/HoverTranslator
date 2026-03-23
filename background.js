chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translate') {
        // 设置源语言为自动检测(auto)，目标语言为简体中文(zh-CN)
        const targetLang = 'zh-CN';
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(request.text)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let translatedText = '';
                // 拼接多段翻译结果
                if (data && data[0]) {
                    data[0].forEach(item => {
                        if (item[0]) translatedText += item[0];
                    });
                }
                sendResponse({ translatedText: translatedText || '翻译为空' });
            })
            .catch(error => {
                console.error('Translation error:', error);
                sendResponse({ translatedText: '翻译失败，请检查网络。' });
            });

        // 返回 true 表示 sendResponse 将异步调用
        return true;
    }
});
