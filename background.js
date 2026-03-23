chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translate') {
        const textToTranslate = request.text;

        // 使用正则表达式检测文本中是否包含汉字 (Unicode 范围 \u4e00-\u9fa5)
        const hasChinese = /[\u4e00-\u9fa5]/.test(textToTranslate);

        // 如果包含中文，则目标语言设为英文 'en'；否则设为中文 'zh-CN'
        const targetLang = hasChinese ? 'en' : 'zh-CN';

        // 拼接请求 URL，sl=auto (源语言自动检测) 保持不变
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;

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
