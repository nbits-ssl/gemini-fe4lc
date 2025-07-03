// fe4lc.js - 追加機能用JavaScriptファイル

// スクロール機能の要素を取得
const scrollElements = {
    scrollToTopBtn: document.getElementById('scroll-to-top-btn'),
    scrollToBottomBtn: document.getElementById('scroll-to-bottom-btn')
};

// スクロール機能の実装
const scrollUtils = {
    // チャットコンテナの最上部へスクロール
    scrollToTop() {
        requestAnimationFrame(() => { // 次の描画タイミングで実行
            const mainContent = document.querySelector('#chat-screen .main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        });
    },

    // チャットコンテナの最下部へスクロール
    scrollToBottom() {
        requestAnimationFrame(() => { // 次の描画タイミングで実行
            const mainContent = document.querySelector('#chat-screen .main-content');
            if (mainContent) {
                mainContent.scrollTop = mainContent.scrollHeight;
            }
        });
    }
};



// イベントリスナーを設定
function setupScrollEventListeners() {
    if (scrollElements.scrollToTopBtn) {
        scrollElements.scrollToTopBtn.addEventListener('click', () => scrollUtils.scrollToTop());
    }
    if (scrollElements.scrollToBottomBtn) {
        scrollElements.scrollToBottomBtn.addEventListener('click', () => scrollUtils.scrollToBottom());
    }
}



// DOM読み込み完了後にイベントリスナーを設定
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupScrollEventListeners();
    });
} else {
    setupScrollEventListeners();
} 