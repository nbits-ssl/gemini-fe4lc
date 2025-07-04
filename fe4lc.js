// fe4lc.js - 追加機能用JavaScriptファイル

// トークン計算機能
const tokenUtils = {
    // セッション全体のトータルトークンを計算
    calculateTotalTokens(messages) {
        // 最後のメッセージのトータルカウントを使用
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.usageMetadata && typeof lastMessage.usageMetadata.totalTokenCount === 'number') {
                let totalTokens = lastMessage.usageMetadata.totalTokenCount;
                
                // thoughtsTokenCountがある場合は差し引く（thinking機能の影響を除去）
                if (typeof lastMessage.usageMetadata.thoughtsTokenCount === 'number') {
                    totalTokens -= lastMessage.usageMetadata.thoughtsTokenCount;
                }
                
                return totalTokens;
            }
        }
        
        return 0;
    },

    // トークン数をフォーマットして表示用文字列を生成
    formatTotalTokens(totalTokens) {
        if (totalTokens === 0) return '';
        return `Total ${totalTokens.toLocaleString('en-US')} Tokens`;
    },

    // トークン表示を更新
    updateTokenDisplay() {
        const tokenDisplay = document.getElementById('token-display');
        if (!tokenDisplay) return;

        const totalTokens = this.calculateTotalTokens(state.currentMessages);
        const formattedTokens = this.formatTotalTokens(totalTokens);
        
        tokenDisplay.textContent = formattedTokens;
        tokenDisplay.style.display = formattedTokens ? 'block' : 'none';
    }
};

// スクロール機能の要素を取得
const scrollElements = {
    scrollToTopBtn: document.getElementById('scroll-to-top-btn'),
    scrollToBottomBtn: document.getElementById('scroll-to-bottom-btn')
};

// 圧縮機能
const compressionUtils = {
    // 設定に従ってメッセージを抽出
    extractMessagesForCompression(messages, keepFirst, keepLast) {
        // pwa.jsの共通フィルタリング関数を使用
        const selectedMessages = filterMessagesForApi(messages);
        
        if (selectedMessages.length <= keepFirst + keepLast) {
            // 圧縮する必要がない場合は空のオブジェクトを返す
            return {
                firstMessages: selectedMessages,
                middleMessages: [],
                lastMessages: [],
                totalMessages: selectedMessages.length,
                compressedCount: 0
            };
        }

        const firstMessages = selectedMessages.slice(0, keepFirst);
        const lastMessages = selectedMessages.slice(-keepLast);
        const middleMessages = selectedMessages.slice(keepFirst, -keepLast);

        return {
            firstMessages,
            middleMessages,
            lastMessages,
            totalMessages: selectedMessages.length,
            compressedCount: middleMessages.length
        };
    },

    // 圧縮用のメッセージ配列を構築
    buildCompressionMessages(middleMessages, compressionPrompt) {
        // 中間メッセージを通常の会話形式で構築
        const conversationMessages = middleMessages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        // 最後に圧縮指示メッセージを追加
        const compressionMessage = {
            role: 'user',
            parts: [{ text: compressionPrompt }]
        };

        return [...conversationMessages, compressionMessage];
    },

    // API用のメッセージ配列を構築（圧縮対応）
    buildMessagesForApi(messages, useCompression = true) {
        console.log('buildMessagesForApi 呼び出し');
        console.log('useCompression:', useCompression);
        console.log('state.compressedSummary:', state.compressedSummary);
        console.log('messages:', messages);
        
        if (!useCompression || !state.compressedSummary) {
            console.log('圧縮無効または圧縮データなし、通常のメッセージ配列を返す');
            return messages; // 通常のメッセージ配列
        }
        
        console.log('圧縮処理開始');
        console.log('圧縮範囲:', state.compressedSummary.startIndex, 'to', state.compressedSummary.endIndex);
        
        // 圧縮されたメッセージ群を検出して置換
        const result = [];
        let summaryInserted = false;
        
        messages.forEach((msg, index) => {
            if (index >= state.compressedSummary.startIndex && index <= state.compressedSummary.endIndex) {
                // 圧縮範囲内の最初のメッセージのみサマリを挿入
                if (!summaryInserted) {
                    console.log(`圧縮サマリを挿入: index ${index}`);
                    result.push({
                        role: 'user',
                        parts: [{ text: `[summary] ${state.compressedSummary.summary}` }]
                    });
                    summaryInserted = true;
                } else {
                    console.log(`圧縮範囲内のメッセージをスキップ: index ${index}`);
                }
            } else {
                console.log(`通常メッセージを追加: index ${index}`);
                result.push(msg);
            }
        });
        
        console.log('圧縮後のメッセージ配列:', result);
        return result;
    },

    // 圧縮を実行
    async compressMessages() {
        console.log('compressMessages開始');
        console.log('state.currentMessages:', state.currentMessages);
        
        if (!state.currentMessages || state.currentMessages.length === 0) {
            console.log('圧縮対象のメッセージがありません');
            return;
        }

        // 既存の圧縮があれば削除
        if (state.compressedSummary) {
            console.log('既存の圧縮を削除して新規圧縮を実行');
            delete state.compressedSummary;
        }

        const settings = state.settings;
        console.log('settings:', settings);
        const keepFirst = settings.keepFirstMessages;
        const keepLast = settings.keepLastMessages;
        const compressionPrompt = settings.compressionPrompt;

        console.log(`圧縮開始: 最初${keepFirst}件、最後${keepLast}件を保持`);
        console.log('compressionPrompt:', compressionPrompt);

        const extracted = this.extractMessagesForCompression(state.currentMessages, keepFirst, keepLast);
        console.log('extracted:', extracted);
        
        if (extracted.compressedCount === 0) {
            console.log('圧縮対象のメッセージがありません');
            alert('圧縮対象のメッセージがありません。メッセージ数が少ないか、設定値が大きすぎます。');
            return;
        }

        console.log(`圧縮対象: ${extracted.compressedCount}件のメッセージ`);

        // 圧縮用のメッセージ配列を構築
        const apiMessages = this.buildCompressionMessages(extracted.middleMessages, compressionPrompt);

        // 圧縮用のAPI呼び出し
        try {
            const generationConfig = {
                temperature: 0.3 // 要約なので低めの温度
            };

            console.log('圧縮API呼び出し準備完了');
            console.log('apiMessages:', apiMessages);
            console.log('generationConfig:', generationConfig);
            console.log('圧縮API呼び出し中...');
            
            // 圧縮処理では非ストリーミング固定、includeThoughtsオフ固定
            const originalStreaming = state.settings.streamingOutput;
            const originalIncludeThoughts = state.settings.includeThoughts;
            
            state.settings.streamingOutput = false;
            state.settings.includeThoughts = false;
            
            const response = await apiUtils.callGeminiApi(apiMessages, generationConfig, null);
            
            // 設定を元に戻す
            state.settings.streamingOutput = originalStreaming;
            state.settings.includeThoughts = originalIncludeThoughts;
            
            if (response) {
                const data = await response.json();
                const candidate = data.candidates?.[0];
                
                if (candidate && candidate.content?.parts) {
                    let compressedContent = '';
                    candidate.content.parts.forEach(part => {
                        if (typeof part.text === 'string') {
                            compressedContent += part.text;
                        }
                    });

                    // 圧縮結果をstateに保存
                    const { middleMessages } = extracted;
                    let compressedStartIndex = -1;
                    let compressedEndIndex = -1;
                    if (middleMessages.length > 0) {
                        // フィルタ済み配列でのインデックスを計算
                        const keepFirst = settings.keepFirstMessages;
                        compressedStartIndex = keepFirst;
                        compressedEndIndex = keepFirst + middleMessages.length - 1;
                    }
                    state.compressedSummary = {
                        startIndex: compressedStartIndex,
                        endIndex: compressedEndIndex,
                        summary: compressedContent,
                        timestamp: Date.now()
                    };

                    // 圧縮結果をログに表示
                    console.log('=== 圧縮結果 ===');
                    console.log('state.compressedSummary:', state.compressedSummary);
                    
                    // 圧縮データをIndexedDBに保存
                    try {
                        await dbUtils.saveChat();
                        console.log('圧縮データをIndexedDBに保存しました');
                    } catch (error) {
                        console.error('圧縮データの保存に失敗しました:', error);
                    }
                } else {
                    console.error('圧縮API応答に有効なコンテンツがありません');
                }
            }
        } catch (error) {
            console.error('圧縮処理中にエラーが発生しました:', error);
        }
    }
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
function setupEventListeners() {
    // スクロールボタン
    if (scrollElements.scrollToTopBtn) {
        scrollElements.scrollToTopBtn.addEventListener('click', () => scrollUtils.scrollToTop());
    }
    if (scrollElements.scrollToBottomBtn) {
        scrollElements.scrollToBottomBtn.addEventListener('click', () => scrollUtils.scrollToBottom());
    }

    // 圧縮ボタン
    const compressButton = document.getElementById('compress-context-btn');
    if (compressButton) {
        compressButton.addEventListener('click', () => {
            console.log('圧縮ボタンがクリックされました');
            compressionUtils.compressMessages();
        });
    }
}

// DOM読み込み完了後にイベントリスナーを設定
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
    });
} else {
    setupEventListeners();
} 