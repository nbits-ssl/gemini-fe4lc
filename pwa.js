// --- 定数 ---
const DB_NAME = 'GeminiPWA_DB';
const DB_VERSION = 9; // ContextNote機能追加のためスキーマ更新
const SETTINGS_STORE = 'settings';
const CHATS_STORE = 'chats';
const CHAT_UPDATEDAT_INDEX = 'updatedAtIndex';
const CHAT_CREATEDAT_INDEX = 'createdAtIndex';
const CHAT_TITLE_LENGTH = 15;
const TEXTAREA_MAX_HEIGHT = 120;
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
const DUPLICATE_SUFFIX = ' (コピー)';
const IMPORT_PREFIX = '(取込) ';
const LIGHT_THEME_COLOR = '#4a90e2';
const DARK_THEME_COLOR = '#007aff';
const APP_VERSION = "0.26"; // Thought summaries対応、streamingのバグ修正
const FE4LC_APP_VERSION = "202507-CC"; 
const APP_NAME = "Gemini FE4LC";
const SWIPE_THRESHOLD = 50; // スワイプ判定の閾値 (px)
const ZOOM_THRESHOLD = 1.01; // ズーム状態と判定するスケールの閾値 (誤差考慮)
const OMISSION_TEXT = '...[省略]...'; // 省略表示用テキスト
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 最大ファイルサイズ (例: 10MB)
const MAX_TOTAL_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 1メッセージあたりの合計添付ファイルサイズ上限 (例: 50MB) - API制限も考慮

const CONTEXT_NOTE_ROLE = 'contextmessage';
const REFERENCE_TAG_START = '<reference>';
const REFERENCE_TAG_END = '</reference>';

// 添付を確定する処理
const extensionToMimeTypeMap = {
    // Text Data
    'pdf': 'application/pdf',
    'js': 'text/javascript',   // 一般的な方を選択
    'py': 'text/x-python',     // 一般的な方を選択
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',        // .htm も考慮
    'css': 'text/css',
    'md': 'text/md',
    'csv': 'text/csv',
    'xml': 'text/xml',
    'rtf': 'text/rtf',

    // Image Data
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',

    // Video Data
    'mp4': 'video/mp4',
    'mpeg': 'video/mpeg',
    'mov': 'video/mov',
    'avi': 'video/avi',
    'flv': 'video/x-flv',
    'mpg': 'video/mpg',
    'webm': 'video/webm',
    'wmv': 'video/wmv',
    '3gp': 'video/3gpp',
    '3gpp': 'video/3gpp',

    // Audio Data
    'wav': 'audio/wav',
    'mp3': 'audio/mp3',
    'aiff': 'audio/aiff',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',        // OGG Vorbis
    'flac': 'audio/flac',
};

// --- DOM要素 ---
const elements = {
    appContainer: document.querySelector('.app-container'),
    chatScreen: document.getElementById('chat-screen'),
    historyScreen: document.getElementById('history-screen'),
    promptCheckScreen: document.getElementById('prompt-check-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    chatTitle: document.getElementById('chat-title'),
    messageContainer: document.getElementById('message-container'),
    userInput: document.getElementById('user-input'),
    sendButton: document.getElementById('send-button'),
    loadingIndicator: document.getElementById('loading-indicator'),
    historyList: document.getElementById('history-list'),
    historyTitle: document.getElementById('history-title'), // 履歴画面タイトル要素
    noHistoryMessage: document.getElementById('no-history-message'),
    historyItemTemplate: document.querySelector('.js-history-item-template'),
    themeColorMeta: document.getElementById('theme-color-meta'),
    // システムプロンプトUI
    systemPromptArea: document.getElementById('system-prompt-area'),
    systemPromptDetails: document.getElementById('system-prompt-details'),
    systemPromptEditor: document.getElementById('system-prompt-editor'),
    saveSystemPromptBtn: document.getElementById('save-system-prompt-btn'),
    cancelSystemPromptBtn: document.getElementById('cancel-system-prompt-btn'),
    // 設定要素
    apiKeyInput: document.getElementById('api-key'),
    modelNameSelect: document.getElementById('model-name'),
    userDefinedModelsGroup: document.getElementById('user-defined-models-group'), // ユーザー指定モデルのoptgroup
    streamingOutputCheckbox: document.getElementById('streaming-output'),
    streamingSpeedInput: document.getElementById('streaming-speed'),
    systemPromptDefaultTextarea: document.getElementById('system-prompt-default'), // デフォルト用
    temperatureInput: document.getElementById('temperature'),
    maxTokensInput: document.getElementById('max-tokens'),
    topKInput: document.getElementById('top-k'),
    topPInput: document.getElementById('top-p'),
    presencePenaltyInput: document.getElementById('presence-penalty'),
    frequencyPenaltyInput: document.getElementById('frequency-penalty'),
    thinkingBudgetInput: document.getElementById('thinking-budget'),
    includeThoughtsToggle: document.getElementById('include-thoughts-toggle'), // Include Thoughts トグル
    dummyUserInput: document.getElementById('dummy-user'),
    dummyModelInput: document.getElementById('dummy-model'),
    enableDummyUserToggle: document.getElementById('enable-dummy-user-toggle'), // ダミーUser有効化チェックボックス
    enableDummyModelToggle: document.getElementById('enable-dummy-model-toggle'), // ダミーModel有効化チェックボックス
    concatDummyModelCheckbox: document.getElementById('concat-dummy-model'), // ダミーモデル連結チェックボックス
    additionalModelsTextarea: document.getElementById('additional-models'), // 追加モデル入力
    debugVirtualSendToggle: document.getElementById('debug-virtual-send-toggle'), // デバッグ用仮想送信トグル
    debugVirtualResponseTextarea: document.getElementById('debug-virtual-response'), // デバッグ用仮想送信の返答
    pseudoStreamingCheckbox: document.getElementById('pseudo-streaming'),
    enterToSendCheckbox: document.getElementById('enter-to-send'),
    historySortOrderSelect: document.getElementById('history-sort-order'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    fontFamilyInput: document.getElementById('font-family-input'), // フォント指定入力
    hideSystemPromptToggle: document.getElementById('hide-system-prompt-toggle'), // SP非表示トグル
    enableGroundingToggle: document.getElementById('enable-grounding-toggle'), // ネット検索トグル
    // コンテキスト圧縮設定要素
    compressionPromptTextarea: document.getElementById('compression-prompt'),
    keepFirstMessagesInput: document.getElementById('keep-first-messages'),
    keepLastMessagesInput: document.getElementById('keep-last-messages'),
    // ContextNote設定要素
    contextNoteRandomFrequencyInput: document.getElementById('context-note-random-frequency'),
    contextNoteRandomCountInput: document.getElementById('context-note-random-count'),
    contextNoteMessageCountInput: document.getElementById('context-note-message-count'),
    contextNoteMaxCharsInput: document.getElementById('context-note-max-chars'),
    contextNoteInsertionPriorityInput: document.getElementById('context-note-insertion-priority'),
    appVersionSpan: document.getElementById('app-version'),
    // 背景画像設定要素
    backgroundImageInput: document.getElementById('background-image-input'),
    uploadBackgroundBtn: document.getElementById('upload-background-btn'),
    backgroundThumbnail: document.getElementById('background-thumbnail'),
    deleteBackgroundBtn: document.getElementById('delete-background-btn'),
    promptContent: document.getElementById('prompt-content'),
    // タブUI要素
    tabButtons: document.querySelectorAll('.tab-button'),
    promptTab: document.getElementById('prompt-tab'),
    compressionStatusTab: document.getElementById('compression-status-tab'),
    responseReplacementsTab: document.getElementById('response-replacements-tab'),
    addResponseReplacementBtn: document.getElementById('add-response-replacement-btn'),
    responseReplacementsList: document.getElementById('response-replacements-list'),
    // ContextNote関連要素
    contextNotesTab: document.getElementById('context-notes-tab'),
    addContextNoteBtn: document.getElementById('add-context-note-btn'),
    contextNotesList: document.getElementById('context-notes-list'),
    // 直接編集モーダル要素
    directEditModal: document.getElementById('direct-edit-modal'),
    editContextNotesDirectlyBtn: document.getElementById('edit-context-notes-directly-btn'),
    closeDirectEditModal: document.getElementById('close-direct-edit-modal'),
    yamlEditor: document.getElementById('yaml-editor'),
    yamlErrorMessage: document.getElementById('yaml-error-message'),
    saveYamlBtn: document.getElementById('save-yaml-btn'),
    cancelYamlBtn: document.getElementById('cancel-yaml-btn'),
    
    // レスポンス置き換え直接編集モーダル要素
    responseReplacementsDirectEditModal: document.getElementById('response-replacements-direct-edit-modal'),
    editResponseReplacementsDirectlyBtn: document.getElementById('edit-response-replacements-directly-btn'),
    closeResponseReplacementsDirectEditModal: document.getElementById('close-response-replacements-direct-edit-modal'),
    responseReplacementsYamlEditor: document.getElementById('response-replacements-yaml-editor'),
    responseReplacementsYamlErrorMessage: document.getElementById('response-replacements-yaml-error-message'),
    saveResponseReplacementsYamlBtn: document.getElementById('save-response-replacements-yaml-btn'),
    cancelResponseReplacementsYamlBtn: document.getElementById('cancel-response-replacements-yaml-btn'),
    // ボタン
    gotoHistoryBtn: document.getElementById('goto-history-btn'),
    gotoSettingsBtn: document.getElementById('goto-settings-btn'),
    backToChatFromHistoryBtn: document.getElementById('back-to-chat-from-history'),
    backToChatFromPromptCheckBtn: document.getElementById('back-to-chat-from-prompt-check'),
    backToChatFromSettingsBtn: document.getElementById('back-to-chat-from-settings'),
    newChatBtn: document.getElementById('new-chat-btn'),
    promptCheckBtn: document.getElementById('prompt-check-btn'),
    compressContextBtn: document.getElementById('compress-context-btn'),
    clearCompressionBtn: document.getElementById('clear-compression-btn'),

    saveSettingsBtns: document.querySelectorAll('.js-save-settings-btn'),
    updateAppBtn: document.getElementById('update-app-btn'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    
    // データバックアップ・復元ボタン
    backupDataBtn: document.getElementById('backup-data-btn'),
    restoreDataBtn: document.getElementById('restore-data-btn'),
    restoreDataInput: document.getElementById('restore-data-input'),
    
    importJsonBtn: document.getElementById('import-json-btn'), // JSON履歴インポートボタン
    importJsonInput: document.getElementById('import-json-input'), // JSONインポートファイル入力
    // カスタムダイアログ
    alertDialog: document.getElementById('alertDialog'),
    alertMessage: document.getElementById('alertDialog').querySelector('.dialog-message'),
    alertOkBtn: document.getElementById('alertDialog').querySelector('.dialog-ok-btn'),
    confirmDialog: document.getElementById('confirmDialog'),
    confirmMessage: document.getElementById('confirmDialog').querySelector('.dialog-message'),
    confirmOkBtn: document.getElementById('confirmDialog').querySelector('.dialog-ok-btn'),
    confirmCancelBtn: document.getElementById('confirmDialog').querySelector('.dialog-cancel-btn'),
    yesNoDialog: document.getElementById('yesNoDialog'),
    yesNoMessage: document.getElementById('yesNoDialog').querySelector('.dialog-message'),
    yesNoYesBtn: document.getElementById('yesNoDialog').querySelector('.dialog-ok-btn'),
    yesNoNoBtn: document.getElementById('yesNoDialog').querySelector('.dialog-cancel-btn'),
    promptDialog: document.getElementById('promptDialog'),
    promptMessage: document.getElementById('promptDialog').querySelector('.dialog-message'),
    promptInput: document.getElementById('promptDialog').querySelector('.dialog-input'),
    promptOkBtn: document.getElementById('promptDialog').querySelector('.dialog-ok-btn'),
    promptCancelBtn: document.getElementById('promptDialog').querySelector('.dialog-cancel-btn'),
    swipeNavigationToggle: document.getElementById('swipe-navigation-toggle'),
    attachFileBtn: document.getElementById('attach-file-btn'),
    fileUploadDialog: document.getElementById('fileUploadDialog'),
    fileInput: document.getElementById('file-input'),
    selectFilesBtn: document.getElementById('select-files-btn'),
    selectedFilesList: document.getElementById('selected-files-list'),
    confirmAttachBtn: document.getElementById('confirm-attach-btn'),
    cancelAttachBtn: document.getElementById('cancel-attach-btn'),
};

const dbAdapter = new IndexedDBAdapter(DB_NAME, DB_VERSION);
const appConfig = new AppConfig({}, dbAdapter, SETTINGS_STORE);

// --- アプリ状態 ---
const state = {
    db: null,
    currentChatId: null,
    currentMessages: [], // { role: 'user'|'model'|'error', content: string, timestamp: number, attachments?: { name: string, base64Data: string, mimeType: string }[], ... }
    currentSystemPrompt: '', // 現在のチャットのシステムプロンプト
    settings: { ...AppConfig.DEFAULTS },
    backgroundImageUrl: null, // 生成されたオブジェクトURL (DBには保存しない)
    isSending: false,
    abortController: null,
    partialStreamContent: '',
    partialThoughtStreamContent: '', // Thought Summary ストリーミング用バッファ
    editingMessageIndex: null,
    isEditingSystemPrompt: false, // システムプロンプト編集中フラグ
    touchStartX: 0, // スワイプ開始X座標
    touchStartY: 0, // スワイプ開始Y座標
    touchEndX: 0,   // スワイプ終了X座標
    touchEndY: 0,   // スワイプ終了Y座標
    isSwiping: false, // スワイプ中フラグ
    isZoomed: false, // ズーム状態フラグ
    currentScreen: 'chat', // 現在表示中の画面名 (戻るボタン制御用)
    // ファイルアップロード用状態
    selectedFilesForUpload: [], // { file: File, base64Data?: string, error?: string } ダイアログで選択中のファイル
    pendingAttachments: [], // { name: string, base64Data: string, mimeType: string } 送信時にメッセージに添付されるファイル
    lastSentRequest: null, // 最後に送信したリクエスト内容（プロンプト確認用）
    // コンテキスト圧縮用状態
    isCompressionMode: true, // 圧縮モードの状態
    compressedSummary: null, // 1セッション1圧縮のデータ { messageIds: [], summary: string, timestamp: number }
    // ContextNote機能用状態
    contextNote: null, // ContextNoteインスタンス
};

function updateMessageMaxWidthVar() {
    const container = elements.messageContainer; // messageContainer要素を取得
    if (!container) return;

    // コンテナ幅に基づいて最大幅を計算
    let maxWidthPx = container.clientWidth * 0.8;

    // 計算したピクセル値をCSS変数に設定
    document.documentElement.style.setProperty('--message-max-width', `${maxWidthPx}px`);
    // console.log(`CSS Variable --message-max-width updated to: ${maxWidthPx}px`); // ログ削減
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    // Debounce処理: リサイズ完了後に一度だけ実行
    resizeTimer = setTimeout(updateMessageMaxWidthVar, 150);
});

// --- ユーティリティ関数 ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// メッセージフィルタリング関数（圧縮機能とAPI送信で共通使用）
function filterMessagesForApi(messages) {
    return messages.filter(msg => {
        if (msg.role === 'user') return true;
        if (msg.role === 'model') return !msg.isCascaded || (msg.isCascaded && msg.isSelected);
        return false;
    });
}

// ContextNote挿入位置を計算する関数
function calculateInsertionIndex(priority, baseMessages) {
    // priority: 1-5の値
    // baseMessages: 現在のメッセージ配列
    
    if (priority <= 0 || priority > 5) {
        return baseMessages.length; // デフォルトは最後に追加
    }
    
    // ユーザーメッセージのインデックスを取得
    const userMessageIndices = [];
    for (let i = 0; i < baseMessages.length; i++) {
        if (baseMessages[i] && baseMessages[i].role === 'user') {
            userMessageIndices.push(i);
        }
    }
    
    if (userMessageIndices.length === 0) {
        return baseMessages.length; // ユーザーメッセージがない場合は最後に追加
    }
    
    // 優先度に基づいて挿入位置を決定（ユーザーメッセージの上のみ）
    // 1=最新ユーザーの上、2=2番目のユーザーの上、3=3番目のユーザーの上...
    // ただし、第1投の上には配置しない（最高でも2投目の上まで）
    // システムメッセージが挿入されているため、実際の挿入位置を調整
    const maxPriority = Math.min(priority, userMessageIndices.length - 1);
    const targetIndex = Math.min(maxPriority - 1, userMessageIndices.length - 2);
    const baseInsertionIndex = userMessageIndices[userMessageIndices.length - targetIndex - 1];
    
    // 第1投の場合は、システムメッセージの直後（第1投の直後）に挿入
    if (targetIndex === userMessageIndices.length - 2) {
        // システムメッセージの位置を探す
        for (let i = baseInsertionIndex + 1; i < baseMessages.length; i++) {
            if (baseMessages[i] && baseMessages[i].role === 'system') {
                return i + 1; // システムメッセージの直後
            }
        }
        return baseInsertionIndex + 1; // システムメッセージが見つからない場合は第1投の直後
    }
    
    return baseInsertionIndex;
}

// ファイルサイズを読みやすい形式にフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// FileオブジェクトをBase64文字列に変換 (Promise)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // result は "data:mime/type;base64,..." の形式なので、ヘッダー部分を除去
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file); // Base64形式で読み込む
    });
}

// --- Service Worker関連 ---
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker登録成功 スコープ: ', registration.scope);
                    // Service Workerからのメッセージ受信
                    navigator.serviceWorker.addEventListener('message', event => {
                        if (event.data && event.data.action === 'reloadPage') {
                            window.location.reload();
                        }
                    });
                })
                .catch(err => {
                    console.error('ServiceWorker登録失敗: ', err);
                });
        });
    } else {
        console.warn('このブラウザはService Workerをサポートしていません。');
    }
}

// --- IndexedDBユーティリティ (dbUtils) ---
const dbUtils = {
    openDB() {
        return new Promise((resolve, reject) => {
            if (state.db) {
                resolve(state.db);
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDBエラー:", event.target.error);
                reject(`IndexedDBエラー: ${event.target.error}`);
            };

            request.onsuccess = (event) => {
                state.db = event.target.result;
                console.log("IndexedDBオープン成功");
                // DB全体のエラーハンドリング
                state.db.onerror = (event) => {
                    console.error(`データベースエラー: ${event.target.error}`);
                };
                resolve(state.db);
            };

            // DBバージョン更新時 (スキーマ変更)
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const transaction = event.target.transaction;
                console.log(`IndexedDBをバージョン ${event.oldVersion} から ${event.newVersion} へアップグレード中...`);

                // 設定ストア (変更なし)
                if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                    db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
                    console.log(`オブジェクトストア ${SETTINGS_STORE} 作成`);
                }

                // チャットストア & インデックス (変更なし、新しいフラグは動的に追加される)
                let chatStore;
                if (!db.objectStoreNames.contains(CHATS_STORE)) {
                    chatStore = db.createObjectStore(CHATS_STORE, { keyPath: 'id', autoIncrement: true });
                    console.log(`オブジェクトストア ${CHATS_STORE} 作成`);
                } else {
                        if (transaction) {
                        try { chatStore = transaction.objectStore(CHATS_STORE); } catch (e) { console.error("チャットストアの取得中にエラー(アップグレード):", e); return; }
                    } else { console.warn("チャットストアのアップグレード用トランザクション取得失敗"); }
                }

                // インデックスが存在することを確認
                if (chatStore && !chatStore.indexNames.contains(CHAT_UPDATEDAT_INDEX)) {
                    chatStore.createIndex(CHAT_UPDATEDAT_INDEX, 'updatedAt', { unique: false });
                    console.log(`インデックス ${CHAT_UPDATEDAT_INDEX} を ${CHATS_STORE} に作成`);
                }
                if (chatStore && !chatStore.indexNames.contains(CHAT_CREATEDAT_INDEX)) {
                    chatStore.createIndex(CHAT_CREATEDAT_INDEX, 'createdAt', { unique: false });
                    console.log(`インデックス ${CHAT_CREATEDAT_INDEX} を ${CHATS_STORE} に作成`);
                }

                // V8以降: 新しいフラグ (isCascaded, isSelected, siblingGroupId) は
                // スキーマレスなIndexedDBの特性により、保存時に自動的に追加される。
                // 読み込み時に存在しない場合はデフォルト値として扱う。
                if (event.oldVersion < 8) { // 以前のバージョンからのアップグレードの場合
                    console.log("DBアップグレード: 新しいメッセージフラグは動的に処理されます。");
                }

                // V9以降: ContextNote機能追加
                // contextNotesフィールドはスキーマレスなIndexedDBの特性により、
                // 保存時に自動的に追加される。読み込み時に存在しない場合は
                // デフォルト値（空配列）として扱う。
                if (event.oldVersion < 9) { // 以前のバージョンからのアップグレードの場合
                    console.log("DBアップグレード: ContextNote機能が追加されました。");
                }
            };
        });
    },

    // 指定されたストアを取得する内部関数
    _getStore(storeName, mode = 'readonly') {
        if (!state.db) throw new Error("データベースが開かれていません");
        const transaction = state.db.transaction([storeName], mode);
        return transaction.objectStore(storeName);
    },

    // 設定を保存
    async saveSetting(key, value) {
        await this.openDB();
        return new Promise((resolve, reject) => {
                try {
                const store = this._getStore(SETTINGS_STORE, 'readwrite');
                // IndexedDBはBlobを直接扱える
                const request = store.put({ key, value });
                request.onsuccess = () => {
                        // console.log(`設定 '${key}' 保存成功`); // ログは必要に応じて
                        resolve();
                };
                request.onerror = (event) => {
                        console.error(`設定 ${key} の保存エラー:`, event.target.error);
                        reject(`設定 ${key} の保存エラー: ${event.target.error}`);
                };
            } catch (error) {
                console.error(`設定 ${key} 保存のためのストアアクセスエラー:`, error);
                reject(`設定 ${key} 保存のためのストアアクセスエラー: ${error}`);
            }
        });
    },

    // 全設定を読み込み
    async loadSettings() {
        await appConfig.load();
		
        // ダークモードのOS設定を初期適用
        if (appConfig.get('darkMode') !== true && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            appConfig.set('darkMode', true);
        }
        state.settings = { ...appConfig.config };
    },

    // チャットを保存 (タイトル指定可)
    async saveChat(optionalTitle = null) {
        await this.openDB();
        // メッセージもシステムプロンプトもコンテキストノートもレスポンス置き換えもない場合は保存しない
        const hasContextNotes = state.contextNote && state.contextNote.getAllNotes().length > 1; // デフォルト仕様以外
        const hasResponseReplacements = state.responseReplacer && state.responseReplacer.getReplacements().length > 0;
        
        if ((!state.currentMessages || state.currentMessages.length === 0) && 
            !state.currentSystemPrompt && 
            !hasContextNotes && 
            !hasResponseReplacements) {
            if(state.currentChatId) console.log(`saveChat: 既存チャット ${state.currentChatId} に保存する内容がないため保存せず`);
            else console.log("saveChat: 新規チャットに保存する内容がないため保存せず");
            return Promise.resolve(state.currentChatId); // 現在のIDを返す
        }

        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE, 'readwrite');
            const now = Date.now();
            // 保存するメッセージデータを作成 (必要なプロパティのみ + 新しいフラグ)
            const messagesToSave = state.currentMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                thoughtSummary: msg.thoughtSummary || null, // Thought Summary を保存
                ...(msg.finishReason && { finishReason: msg.finishReason }),
                ...(msg.safetyRatings && { safetyRatings: msg.safetyRatings }),
                ...(msg.error && { error: msg.error }),
                // 新しいフラグを追加 (存在すれば)
                ...(msg.isCascaded !== undefined && { isCascaded: msg.isCascaded }),
                ...(msg.isSelected !== undefined && { isSelected: msg.isSelected }),
                ...(msg.siblingGroupId !== undefined && { siblingGroupId: msg.siblingGroupId }),
                ...(msg.groundingMetadata && { groundingMetadata: msg.groundingMetadata }),
                // 添付ファイル情報を追加 (存在すれば)
                ...(msg.attachments && msg.attachments.length > 0 && { attachments: msg.attachments }),
                // usageMetadata を追加 (存在すれば)
                ...(msg.usageMetadata && { usageMetadata: msg.usageMetadata }),
            }));

            // タイトルを決定して保存を実行する内部関数
            const determineTitleAndSave = (existingChatData = null) => {
                let title;
                if (optionalTitle !== null) { // 引数でタイトルが指定されていればそれを使う
                    title = optionalTitle;
                } else if (existingChatData && existingChatData.title) { // 既存データにタイトルがあればそれを使う
                    title = existingChatData.title;
                } else { // それ以外は最初のユーザーメッセージから生成
                    const firstUserMessage = state.currentMessages.find(m => m.role === 'user');
                    title = firstUserMessage ? firstUserMessage.content.substring(0, 50) : "無題のチャット";
                }

                const chatIdForOperation = existingChatData ? existingChatData.id : state.currentChatId;
                
                const chatData = {
                    messages: messagesToSave,
                    systemPrompt: state.currentSystemPrompt, // システムプロンプトを保存
                    updatedAt: now,
                    createdAt: existingChatData ? existingChatData.createdAt : now, // 新規なら現在時刻
                    title: title,
                    // 圧縮データを保存
                    ...(state.compressedSummary && { compressedSummary: state.compressedSummary }),
                    // 最後に送信したリクエスト内容を保存
                    ...(state.lastSentRequest && { lastSentRequest: state.lastSentRequest }),
                    // レスポンス置換データを保存
                    ...(state.responseReplacer && { responseReplacements: state.responseReplacer.getSaveData() }),
					                    // ContextNoteデータを保存
                    ...(state.contextNote && { contextNotes: state.contextNote.getSaveData() }),
                };
                if (chatIdForOperation) { // IDがあれば更新なのでIDを付与
                    chatData.id = chatIdForOperation;
                }

                const request = store.put(chatData); // putは新規・更新両対応
                request.onsuccess = (event) => {
                    const savedId = event.target.result;
                    if (!state.currentChatId && savedId) { // 新規保存でIDが確定したらstateに反映
                        state.currentChatId = savedId;
                    }
                    console.log(`チャット ${state.currentChatId ? '更新' : '保存'} 完了 ID:`, state.currentChatId || savedId, 'タイトル:', chatData.title);
                    // 保存したチャットが現在表示中のものなら、タイトルをUIに反映
                    if ((state.currentChatId || savedId) === (chatIdForOperation || savedId)) {
                        uiUtils.updateChatTitle(chatData.title);
                    }
                    resolve(state.currentChatId || savedId); // 保存/更新後のIDを返す
                };
                request.onerror = (event) => reject(`チャット保存エラー: ${event.target.error}`);
            };

            // 現在のチャットIDがあるか (更新か新規か)
            if (state.currentChatId) {
                // 更新の場合、既存のデータを取得してcreatedAtを引き継ぐ
                const getRequest = store.get(state.currentChatId);
                getRequest.onsuccess = (event) => {
                    const existingChat = event.target.result;
                        if (!existingChat) { // IDはあるがデータがない場合 (削除されたなど) は新規として保存
                            console.warn(`ID ${state.currentChatId} のチャットが見つかりません(保存時)。新規として保存します。`);
                            state.currentChatId = null; // IDをリセット
                            determineTitleAndSave(null);
                    } else {
                        determineTitleAndSave(existingChat); // 既存データを使って保存
                    }
                };
                getRequest.onerror = (event) => {
                    // 既存データの取得に失敗した場合も、とりあえず新規として保存を試みる
                    console.error("既存チャットの取得エラー(更新用):", event.target.error);
                    console.warn("既存チャット取得エラーのため、新規として保存を試みます。");
                    state.currentChatId = null; // IDをリセット
                    determineTitleAndSave(null);
                };
            } else {
                // 新規保存の場合
                determineTitleAndSave(null);
            }

            // トランザクション全体のエラーハンドリング
            store.transaction.onerror = (event) => {
                console.error("チャット保存トランザクション失敗:", event.target.error);
                reject(`チャット保存トランザクション失敗: ${event.target.error}`);
            };
            // store.transaction.oncomplete = () => { console.log("チャット保存トランザクション完了"); };
        });
    },

    // チャットタイトルをDBで更新
    async updateChatTitleDb(id, newTitle) {
        await this.openDB();
        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE, 'readwrite');
            const getRequest = store.get(id);
            getRequest.onsuccess = (event) => {
                const chatData = event.target.result;
                if (chatData) {
                    chatData.title = newTitle;
                    chatData.updatedAt = Date.now(); // 更新日時も更新
                    const putRequest = store.put(chatData);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = (event) => reject(`タイトル更新エラー: ${event.target.error}`);
                } else {
                    reject(`チャットが見つかりません: ${id}`);
                }
            };
            getRequest.onerror = (event) => reject(`タイトル更新用チャット取得エラー: ${event.target.error}`);
            store.transaction.onerror = (event) => reject(`タイトル更新トランザクション失敗: ${event.target.error}`);
        });
    },

    // 指定IDのチャットを取得
    async getChat(id) {
        await this.openDB();
        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE);
            const request = store.get(id);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(`チャット ${id} 取得エラー: ${event.target.error}`);
        });
    },

    // 全チャットを取得 (ソート順指定可)
    async getAllChats(sortBy = 'updatedAt') {
        await this.openDB();
        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE);
            const indexName = sortBy === 'createdAt' ? CHAT_CREATEDAT_INDEX : CHAT_UPDATEDAT_INDEX;
            // インデックスが存在するか確認
            if (!store.indexNames.contains(indexName)) {
                    console.error(`インデックス "${indexName}" が見つかりません。主キー順でフォールバックします。`);
                    // フォールバック: 主キー順で取得して逆順にする
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = (event) => resolve(event.target.result.reverse()); // 新しいものが上に来るように
                    getAllRequest.onerror = (event) => reject(`全チャット取得エラー(フォールバック): ${event.target.error}`);
                    return;
            }
            // インデックスを使ってカーソルを開く (降順)
            const index = store.index(indexName);
            const request = index.openCursor(null, 'prev'); // 'prev'で降順
            const chats = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    chats.push(cursor.value);
                    cursor.continue();
                } else {
                    // カーソル終了
                    resolve(chats);
                }
            };
            request.onerror = (event) => reject(`全チャット取得エラー (${sortBy}順): ${event.target.error}`);
        });
    },

    // 指定IDのチャットを削除
    async deleteChat(id) {
        await this.openDB();
        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE, 'readwrite');
            const request = store.delete(id);
            request.onsuccess = () => { console.log("チャット削除:", id); resolve(); };
            request.onerror = (event) => reject(`チャット ${id} 削除エラー: ${event.target.error}`);
        });
    },

    // 全データ (設定とチャット) をクリア
    async clearAllData() {
        await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction([SETTINGS_STORE, CHATS_STORE], 'readwrite');
            let storesCleared = 0;
            const totalStores = 2;

            const onComplete = () => {
                if (++storesCleared === totalStores) {
                    console.log("IndexedDBの全データ削除完了");
                    resolve();
                }
            };
            const onError = (storeName, event) => reject(`${storeName} クリアエラー: ${event.target.error}`);

            const settingsStore = transaction.objectStore(SETTINGS_STORE);
            const chatsStore = transaction.objectStore(CHATS_STORE);

            const clearSettingsReq = settingsStore.clear();
            const clearChatsReq = chatsStore.clear();

            clearSettingsReq.onsuccess = onComplete;
            clearSettingsReq.onerror = (e) => onError(SETTINGS_STORE, e);
            clearChatsReq.onsuccess = onComplete;
            clearChatsReq.onerror = (e) => onError(CHATS_STORE, e);

            transaction.onerror = (event) => reject(`データクリアトランザクション失敗: ${event.target.error}`);
        });
    },



    // チャットをテキストファイルとしてエクスポート
    async exportChatAsText(chatId, chatTitle) {
        try {
            const chat = await this.getChat(chatId);
            if (!chat || ((!chat.messages || chat.messages.length === 0) && !chat.systemPrompt)) {
                await uiUtils.showCustomAlert("チャットデータが空です。");
                return;
            }
            // エクスポート用テキスト生成
            let exportText = '';
            // システムプロンプトを出力
            if (chat.systemPrompt) {
                exportText += `<|#|system|#|>\n${chat.systemPrompt}\n<|#|/system|#|>\n\n`;
            }
            // メッセージを出力
            if (chat.messages) {
                chat.messages.forEach(msg => {
                    // userとmodelのメッセージのみ出力
                    if (msg.role === 'user' || msg.role === 'model') {
                        let attributes = '';
                        if (msg.role === 'model') {
                            if (msg.isCascaded) attributes += ' isCascaded';
                            if (msg.isSelected) attributes += ' isSelected';
                            // siblingGroupId はエクスポートしない方針
                        }
                        // 添付ファイル情報を属性として追加 (ファイル名のみ)
                        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
                            const fileNames = msg.attachments.map(a => a.name).join(';'); // ファイル名をセミコロン区切りで
                            attributes += ` attachments="${fileNames.replace(/"/g, '&quot;')}"`; // 属性値としてエンコード
                        }
                        exportText += `<|#|${msg.role}|#|${attributes}>\n${msg.content}\n<|#|/${msg.role}|#|>\n\n`;
                    }
                });
            }
            // Blobを作成してダウンロードリンクを生成
            const blob = new Blob([exportText.trim()], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            // ファイル名を生成 (不正文字を置換)
            const safeTitle = (chatTitle || `chat_${chatId}_export`).replace(/[<>:"/\\|?*\s]/g, '_');
            a.href = url;
            a.download = `${safeTitle}.txt`;
            document.body.appendChild(a); // bodyに追加してクリック可能に
            a.click(); // ダウンロード実行
            document.body.removeChild(a); // 要素削除
            URL.revokeObjectURL(url); // URL破棄
            console.log("チャットテキストエクスポート完了:", chatId);
        } catch (error) {
            await uiUtils.showCustomAlert(`エクスポートエラー: ${error}`);
        }
    },

    // チャットデータをJSON形式でエクスポート用に準備
    async prepareChatForExport(chatId) {
        const chat = await this.getChat(chatId);
        if (!chat) {
            throw new Error("チャットデータが見つかりません。");
        }

        return {
            version: "1.0",
            exportDate: new Date().toISOString(),
            appVersion: APP_VERSION,
            fe4lcVersion: FE4LC_APP_VERSION,
            chat: {
                id: chat.id,
                title: chat.title,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                systemPrompt: chat.systemPrompt || '',
                messages: chat.messages || [],
                compressedSummary: chat.compressedSummary || null,
                lastSentRequest: chat.lastSentRequest || null,
                responseReplacements: chat.responseReplacements || [],
                contextNotes: chat.contextNotes || []
            }
        };
    },

    // 全データをJSON形式でエクスポート用に準備
    async prepareAllDataForExport() {
        // 全チャットデータを取得
        const allChats = await this.getAllChats();
        
        // 全設定を取得（APIキー以外）
        const allSettings = await this.loadSettings();
        const exportSettings = { ...allSettings };
        delete exportSettings.apiKey; // APIキーは除外
        
        return {
            version: "1.0",
            exportDate: new Date().toISOString(),
            appVersion: APP_VERSION,
            fe4lcVersion: FE4LC_APP_VERSION,
            dataType: "full_backup",
            chats: allChats,
            settings: exportSettings
        };
    },

    // JSONデータをファイルとしてダウンロード
    downloadJSONFile(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // JSONファイルを読み込んでパース
    parseJSONFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.name.endsWith('.json')) {
                reject(new Error("JSONファイル (.json) を選択してください。"));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = event.target.result;
                    if (!jsonContent) {
                        reject(new Error("ファイルの内容が空です。"));
                        return;
                    }
                    const parsedData = JSON.parse(jsonContent);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`JSONファイルのパースに失敗しました: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました。"));
            reader.readAsText(file);
        });
    },

    // チャットデータをDBに保存
    async saveChatData(chatData) {
        const newChatData = {
            title: chatData.title,
            createdAt: chatData.createdAt,
            updatedAt: chatData.updatedAt,
            systemPrompt: chatData.systemPrompt || '',
            messages: chatData.messages || [],
            compressedSummary: chatData.compressedSummary || null,
            lastSentRequest: chatData.lastSentRequest || null,
            responseReplacements: chatData.responseReplacements || [],
            contextNotes: chatData.contextNotes || []
        };

        return new Promise((resolve, reject) => {
            const store = this._getStore(CHATS_STORE, 'readwrite');
            const request = store.add(newChatData);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // チャットデータをインポート用に検証
    validateChatImportData(importData) {
        if (!importData.version || !importData.chat) {
            throw new Error("無効なJSONファイルです。正しいチャットエクスポートファイルを選択してください。");
        }

        const chatData = importData.chat;
        if (!chatData.title || !chatData.createdAt || !chatData.updatedAt) {
            throw new Error("チャットデータが不完全です。正しいエクスポートファイルを選択してください。");
        }

        return chatData;
    },

    // 全データインポート用に検証
    validateAllDataImportData(importData) {
        if (!importData.version || !importData.dataType || importData.dataType !== "full_backup") {
            throw new Error("無効なJSONファイルです。正しいバックアップファイルを選択してください。");
        }
        return importData;
    },

    // 全データを復元
    async restoreAllDataFromImport(importData) {
        // 既存データをクリア
        await this.clearAllData();
        
        // チャットデータを復元
        let restoredChatCount = 0;
        if (importData.chats && Array.isArray(importData.chats)) {
            for (const chatData of importData.chats) {
                try {
                    await this.saveChatData(chatData);
                    restoredChatCount++;
                } catch (error) {
                    console.warn("チャット復元エラー:", chatData.title, error);
                }
            }
        }
        
        // 設定データを復元（APIキー以外）
        if (importData.settings && typeof importData.settings === 'object') {
            for (const [key, value] of Object.entries(importData.settings)) {
                if (key !== 'apiKey') { // APIキーは復元しない
                    await this.saveSetting(key, value);
                }
            }
        }

        return { success: true, chatCount: restoredChatCount };
    },


};

// --- UIユーティリティ (uiUtils) ---
const uiUtils = {
    // チャットメッセージをレンダリング
    renderChatMessages() {
        // 編集中ならキャンセル
        if (state.editingMessageIndex !== null) {
            const messageElement = elements.messageContainer.querySelector(`.message[data-index="${state.editingMessageIndex}"]`);
            if(messageElement) appLogic.cancelEditMessage(state.editingMessageIndex, messageElement);
            else state.editingMessageIndex = null; // 要素が見つからない場合もインデックスをリセット
        }
        elements.messageContainer.innerHTML = ''; // コンテナをクリア

        // メッセージをループして表示
        let currentSiblingGroupId = null;
        let siblingsInGroup = [];
        let siblingIndex = 0;

        for (let i = 0; i < state.currentMessages.length; i++) {
            const msg = state.currentMessages[i];

            if (msg.role === 'model' && msg.isCascaded && msg.siblingGroupId) {
                // カスケード応答グループの開始または継続
                if (msg.siblingGroupId !== currentSiblingGroupId) {
                    // 新しいグループの開始
                    currentSiblingGroupId = msg.siblingGroupId;
                    // このグループに属するすべてのメッセージを取得
                    siblingsInGroup = state.currentMessages.filter(m => m.role === 'model' && m.isCascaded && m.siblingGroupId === currentSiblingGroupId);
                    siblingIndex = 0; // グループ内のインデックスをリセット
                }

                // グループ内の現在のメッセージのインデックスを見つける
                const currentIndexInGroup = siblingsInGroup.findIndex(m => m === msg);
                if (currentIndexInGroup !== -1) {
                    siblingIndex = currentIndexInGroup + 1; // 1ベースのインデックス
                }

                // isSelected が true のメッセージのみ表示
                if (msg.isSelected) {
                    this.appendMessage(msg.role, msg.content, i, false, {
                        currentIndex: siblingIndex,
                        total: siblingsInGroup.length,
                        siblingGroupId: currentSiblingGroupId
                    }, msg.attachments); // attachments を渡す
                } else {
                    // isSelected でないカスケードメッセージはDOMに追加しないか、hiddenクラスを付与
                    // ここではDOMに追加しない方針とする
                    console.log(`Skipping render for non-selected cascaded message index ${i}`);
                }
            } else {
                // 通常のメッセージ (user, error, または非カスケード model)
                currentSiblingGroupId = null; // グループをリセット
                siblingsInGroup = [];
                this.appendMessage(msg.role, msg.content, i, false, null, msg.attachments); // attachments を渡す
            }
        }
        //this.scrollToBottom(); // 最下部へスクロールは削除、呼び出し元の責任で行う
        
        // トークン表示を更新
        if (typeof tokenUtils !== 'undefined') {
            tokenUtils.updateTokenDisplay();
        }
        
        // ContextNoteシステムメッセージを表示
        try {
            appLogic.displayContextNoteSystemMessage();
        } catch (error) {
            console.warn('ContextNoteシステムメッセージ表示エラー:', error);
        }
    },

    // メッセージをコンテナに追加
    appendMessage(role, content, index, isStreamingPlaceholder = false, cascadeInfo = null, attachments = null, skipStateUpdate = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        messageDiv.dataset.index = index; // state.currentMessages 内のインデックス

        const messageData = skipStateUpdate ? undefined : state.currentMessages[index]; // メッセージデータを取得
        
        // Safety Ratings用のクラスを追加
        if (role === 'model' && messageData && messageData.safetyRatings) {
            const sexuallyExplicitRating = messageData.safetyRatings.find(
                rating => rating.category === 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
            );
            
            if (sexuallyExplicitRating) {
                switch (sexuallyExplicitRating.probability) {
                    case 'HIGH':
                        messageDiv.classList.add('safety-high');
                        break;
                    case 'MEDIUM':
                        messageDiv.classList.add('safety-medium');
                        break;
                    case 'LOW':
                        messageDiv.classList.add('safety-low');
                        break;
                    // NEGLIGIBLE, UNSPECIFIED の場合はクラスを追加しない
                }
            }
        }
        
        // Thought Summary 表示エリア (モデル応答で thoughtSummary がある場合)
        if (role === 'model' && messageData && messageData.thoughtSummary) {
            const thoughtDetails = document.createElement('details');
            thoughtDetails.classList.add('thought-summary-details');
            // thoughtDetails.open = false; // 初期は閉じている (デフォルト)

            const thoughtSummaryElem = document.createElement('summary');
            thoughtSummaryElem.textContent = '思考プロセス';
            thoughtDetails.appendChild(thoughtSummaryElem);

            const thoughtContentDiv = document.createElement('div');
            thoughtContentDiv.classList.add('thought-summary-content');
            if (isStreamingPlaceholder) {
                thoughtContentDiv.id = `streaming-thought-summary-${index}`; // ストリーミング用ID
                thoughtContentDiv.innerHTML = ''; // 初期は空
            } else {
                try {
                    thoughtContentDiv.innerHTML = marked.parse(messageData.thoughtSummary || '');
                } catch (e) {
                    console.error("Thought Summary Markdownパースエラー:", e);
                    thoughtContentDiv.textContent = messageData.thoughtSummary || '';
                }
            }
            thoughtDetails.appendChild(thoughtContentDiv);
            messageDiv.appendChild(thoughtDetails); // メッセージ本文より前に追加
        }

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        // ユーザーメッセージで添付ファイルがある場合の処理
        if (role === 'user' && attachments && attachments.length > 0) {
            const details = document.createElement('details');
            details.classList.add('attachment-details');

            const summary = document.createElement('summary');
            summary.textContent = `添付ファイル (${attachments.length}件)`;
            details.appendChild(summary);

            const list = document.createElement('ul');
            list.classList.add('attachment-list');
            attachments.forEach(att => {
                const listItem = document.createElement('li');
                listItem.textContent = att.name;
                listItem.title = `${att.name} (${att.mimeType})`; // ホバーで詳細表示
                list.appendChild(listItem);
            });
            details.appendChild(list);
            contentDiv.appendChild(details); // 最初に添付ファイル情報を追加

            // テキストコンテンツがあれば <pre> で追加
            if (content && content.trim() !== '') {
                const pre = document.createElement('pre');
                pre.textContent = content;
                // 添付ファイル情報とテキストの間に少しマージンを追加
                pre.style.marginTop = '8px';
                contentDiv.appendChild(pre);
            }
        } else {
            // 通常のコンテンツ処理 (既存ロジック)
            try {
                if (role === 'model' && !isStreamingPlaceholder && typeof marked !== 'undefined') {
                    contentDiv.innerHTML = marked.parse(content || '');
                } else if (role === 'user') { // 添付ファイルがないユーザーメッセージ
                    const pre = document.createElement('pre'); pre.textContent = content; contentDiv.appendChild(pre);
                } else if (role === 'error') {
                        const p = document.createElement('p'); p.textContent = content; contentDiv.appendChild(p);
                } else if (isStreamingPlaceholder) {
                    contentDiv.innerHTML = '';
                } else {
                    const pre = document.createElement('pre'); pre.textContent = content; contentDiv.appendChild(pre);
                }
            } catch (e) {
                    console.error("Markdownパースエラー:", e);
                    const pre = document.createElement('pre'); pre.textContent = content; contentDiv.innerHTML = ''; contentDiv.appendChild(pre);
            }
        }
        messageDiv.appendChild(contentDiv);
        
        if (role === 'model' && messageData && messageData.groundingMetadata &&
            ( (messageData.groundingMetadata.groundingChunks && messageData.groundingMetadata.groundingChunks.length > 0) ||
                (messageData.groundingMetadata.webSearchQueries && messageData.groundingMetadata.webSearchQueries.length > 0) )
            )
        {
            try {
                const details = document.createElement('details');
                details.classList.add('citation-details'); // 既存のクラスを使用

                const summary = document.createElement('summary');
                // summary.textContent = '引用元と検索クエリを表示'; // テキスト変更も検討
                summary.textContent = '引用元/検索クエリ'; // より短く
                details.appendChild(summary);

                let detailsHasContent = false; // detailsに何か追加されたか追跡

                // --- 引用元リストの生成---
                if (messageData.groundingMetadata.groundingChunks && messageData.groundingMetadata.groundingChunks.length > 0) {
                    const citationList = document.createElement('ul');
                    citationList.classList.add('citation-list'); // 既存のクラス

                    const citationMap = new Map();
                    let displayIndexCounter = 1;
                    if (messageData.groundingMetadata.groundingSupports) {
                        messageData.groundingMetadata.groundingSupports.forEach(support => {
                            if (support.groundingChunkIndices) {
                                support.groundingChunkIndices.forEach(chunkIndex => {
                                    if (!citationMap.has(chunkIndex) && chunkIndex >= 0 && chunkIndex < messageData.groundingMetadata.groundingChunks.length) {
                                        const chunk = messageData.groundingMetadata.groundingChunks[chunkIndex];
                                        if (chunk?.web?.uri) {
                                            citationMap.set(chunkIndex, {
                                                uri: chunk.web.uri,
                                                title: chunk.web.title || 'タイトル不明',
                                                displayIndex: displayIndexCounter++
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }

                    const sortedCitations = Array.from(citationMap.entries())
                                                .sort(([, a], [, b]) => a.displayIndex - b.displayIndex);

                    sortedCitations.forEach(([chunkIndex, citationInfo]) => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = citationInfo.uri;
                        link.textContent = `[${citationInfo.displayIndex}] ${citationInfo.title}`;
                        link.title = citationInfo.title;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        listItem.appendChild(link);
                        citationList.appendChild(listItem);
                    });

                    // フォールバック
                    if (sortedCitations.length === 0) {
                            messageData.groundingMetadata.groundingChunks.forEach((chunk, idx) => {
                                if (chunk?.web?.uri) {
                                    const listItem = document.createElement('li');
                                    const link = document.createElement('a');
                                    link.href = chunk.web.uri;
                                    link.textContent = chunk.web.title || `ソース ${idx + 1}`;
                                    link.title = chunk.web.title || 'タイトル不明';
                                    link.target = '_blank';
                                    link.rel = 'noopener noreferrer';
                                    listItem.appendChild(link);
                                    citationList.appendChild(listItem);
                                }
                            });
                    }

                    if (citationList.hasChildNodes()) {
                        details.appendChild(citationList);
                        detailsHasContent = true;
                    }
                }
                // --- 引用元リストここまで ---

                // 検索クエリリストの生成
                if (messageData.groundingMetadata.webSearchQueries && messageData.groundingMetadata.webSearchQueries.length > 0) {
                    // 引用元リストとクエリリストの間に区切り線を追加 (引用元がある場合のみ)
                    if (detailsHasContent) {
                        const separator = document.createElement('hr');
                        separator.style.marginTop = '10px';
                        separator.style.marginBottom = '8px';
                        separator.style.border = 'none'; // デフォルトの線を消す
                        separator.style.borderTop = '1px dashed var(--border-tertiary)'; // 破線に変更
                        details.appendChild(separator);
                    }

                    const queryHeader = document.createElement('div');
                    queryHeader.textContent = '検索に使用されたクエリ:';
                    queryHeader.style.fontWeight = '500'; // 少し太く
                    queryHeader.style.marginTop = detailsHasContent ? '0' : '8px'; // 上マージン調整
                    queryHeader.style.marginBottom = '4px';
                    queryHeader.style.fontSize = '11px';
                    queryHeader.style.color = 'var(--text-secondary)';
                    details.appendChild(queryHeader);

                    const queryList = document.createElement('ul');
                    queryList.classList.add('search-query-list'); // スタイル用クラス
                    queryList.style.listStyle = 'none'; // リストマーカーなし
                    queryList.style.paddingLeft = '0'; // パディングなし
                    queryList.style.margin = '0'; // マージンなし
                    queryList.style.fontSize = '11px';
                    queryList.style.color = 'var(--text-secondary)';

                    messageData.groundingMetadata.webSearchQueries.forEach(query => {
                        const queryItem = document.createElement('li');
                        queryItem.textContent = `• ${query}`; // ビュレットを手動で追加
                        queryItem.style.marginBottom = '3px';
                        queryList.appendChild(queryItem);
                    });
                    details.appendChild(queryList);
                    detailsHasContent = true; // クエリが追加された
                }

                // details に内容が追加されていれば、メッセージ要素に追加
                if (detailsHasContent) {
                    contentDiv.appendChild(details);
                }

            } catch (e) {
                console.error(`引用元/検索クエリ表示の生成中にエラーが発生しました (index: ${index}):`, e);
            }
        }

        // 編集用エリア (初期非表示)
        const editArea = document.createElement('div');
        editArea.classList.add('message-edit-area', 'hidden');
        messageDiv.appendChild(editArea);

        // --- カスケードコントロール (上部) ---
        if (role === 'model' && cascadeInfo && cascadeInfo.total > 1) {
            const cascadeControlsDiv = document.createElement('div');
            cascadeControlsDiv.classList.add('message-cascade-controls');

            // 前へボタン
            const prevButton = document.createElement('button');
            prevButton.textContent = '＜';
            prevButton.title = '前の応答';
            prevButton.classList.add('cascade-prev-btn');
            prevButton.disabled = cascadeInfo.currentIndex <= 1;
            prevButton.onclick = () => appLogic.navigateCascade(index, 'prev');
            cascadeControlsDiv.appendChild(prevButton);

            // インジケーター (例: 1/3)
            const indicatorSpan = document.createElement('span');
            indicatorSpan.classList.add('cascade-indicator');
            indicatorSpan.textContent = `${cascadeInfo.currentIndex}/${cascadeInfo.total}`;
            cascadeControlsDiv.appendChild(indicatorSpan);

            // 次へボタン
            const nextButton = document.createElement('button');
            nextButton.textContent = '＞';
            nextButton.title = '次の応答';
            nextButton.classList.add('cascade-next-btn');
            nextButton.disabled = cascadeInfo.currentIndex >= cascadeInfo.total;
            nextButton.onclick = () => appLogic.navigateCascade(index, 'next');
            cascadeControlsDiv.appendChild(nextButton);

            // この応答を削除ボタン
            const deleteCascadeButton = document.createElement('button');
            deleteCascadeButton.textContent = '✕'; // または '削除'
            deleteCascadeButton.title = 'この応答を削除';
            deleteCascadeButton.classList.add('cascade-delete-btn');
            deleteCascadeButton.onclick = () => appLogic.confirmDeleteCascadeResponse(index);
            cascadeControlsDiv.appendChild(deleteCascadeButton);

            messageDiv.appendChild(cascadeControlsDiv); // メッセージ要素に追加
        }
        // --- カスケードコントロールここまで ---

        // エラーメッセージ以外にはアクションボタンを追加 (下部)
        if (role !== 'error') {
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('message-actions');
            
            // 一時的なメッセージ（skipStateUpdate = true）の場合は削除ボタンのみ表示
            if (skipStateUpdate) {
                // 削除ボタン（表示のみ削除）
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除'; deleteButton.title = 'このメッセージを非表示にする'; deleteButton.classList.add('js-delete-btn');
                deleteButton.onclick = () => {
                    // 表示のみ削除（stateからは削除しない）
                    messageDiv.remove();
                };
                actionsDiv.appendChild(deleteButton);
            } else {
                // 通常のメッセージの場合は全てのボタンを表示
                // 編集ボタン
                const editButton = document.createElement('button');
                editButton.textContent = '編集'; editButton.title = 'メッセージを編集'; editButton.classList.add('js-edit-btn');
                editButton.onclick = () => appLogic.startEditMessage(index, messageDiv);
                actionsDiv.appendChild(editButton);

                // 削除ボタン (メッセージペア全体削除) - 第1投は無効化
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除'; 
                deleteButton.title = index === 0 ? '第1投は削除できません' : 'この会話ターンを削除'; 
                deleteButton.classList.add('js-delete-btn');
                if (index === 0) {
                    deleteButton.disabled = true;
                    deleteButton.style.opacity = '0.5';
                    deleteButton.style.cursor = 'not-allowed';
                } else {
                    deleteButton.onclick = () => appLogic.deleteMessage(index); // 既存の全体削除関数
                }
                actionsDiv.appendChild(deleteButton);

                // ユーザーメッセージにはリトライボタンも追加
                if (role === 'user') {
                    const retryButton = document.createElement('button');
                    retryButton.textContent = 'リトライ'; retryButton.title = 'このメッセージから再生成'; retryButton.classList.add('js-retry-btn');
                    retryButton.onclick = () => appLogic.retryFromMessage(index);
                    actionsDiv.appendChild(retryButton);
                }
            }
            
            // const messageData = state.currentMessages[index]; // 上で取得済みなので再利用
            // モデル応答で、usageMetadata があり、必要なトークン数が数値として存在する場合
            if (role === 'model' && messageData?.usageMetadata &&
                typeof messageData.usageMetadata.candidatesTokenCount === 'number' &&
                typeof messageData.usageMetadata.totalTokenCount === 'number')
            {
                const usage = messageData.usageMetadata;
                const tokenSpan = document.createElement('span');
                tokenSpan.classList.add('token-count-display'); // スタイル適用用のクラス
                let finalTotalTokenCount = usage.totalTokenCount;
                if (typeof messageData.usageMetadata.thoughtsTokenCount === 'number') {
                    finalTotalTokenCount -= messageData.usageMetadata.thoughtsTokenCount;
                }
                const formattedCandidates = usage.candidatesTokenCount.toLocaleString('en-US');
                const formattedTotal = finalTotalTokenCount.toLocaleString('en-US');
                // メッセージ番号を計算（1から始まる番号）
                const messageNumber = index + 1;
                tokenSpan.textContent = `#${messageNumber} | ${formattedCandidates}T / ${formattedTotal}T`;
                tokenSpan.title = `Message #${messageNumber} | Candidate Tokens / Total Tokens`; // ホバー時のツールチップ

                // アクションボタン群の前 (左端) に追加
                actionsDiv.appendChild(tokenSpan);
            }

            messageDiv.appendChild(actionsDiv);
        }

        // ストリーミングプレースホルダーの場合、IDを付与して後で更新できるようにする
        if (isStreamingPlaceholder) {
            messageDiv.id = `streaming-message-${index}`;
        }
        elements.messageContainer.appendChild(messageDiv);
        
        // トークン表示を更新
        if (typeof tokenUtils !== 'undefined') {
            tokenUtils.updateTokenDisplay();
        }
    },

    // ストリーミング中のメッセージを更新
    updateStreamingMessage(index, newChar, isThoughtSummary = false) { // newChar は実際には使わなくなる
        const messageDiv = document.getElementById(`streaming-message-${index}`);
        if (messageDiv && typeof marked !== 'undefined') {
            let targetContentDiv;
            let streamContent;

            if (isThoughtSummary) {
                targetContentDiv = messageDiv.querySelector(`#streaming-thought-summary-${index}`);
                streamContent = state.partialThoughtStreamContent; // stateから直接取得
            } else {
                targetContentDiv = messageDiv.querySelector('.message-content');
                streamContent = state.partialStreamContent; // stateから直接取得
            }

            if (targetContentDiv) {
                try {
                    targetContentDiv.innerHTML = marked.parse(streamContent || '');
                } catch (e) {
                    console.error(`ストリーミング更新中のMarkdownパースエラー (${isThoughtSummary ? 'Thought' : 'Content'}):`, e);
                    targetContentDiv.textContent = streamContent;
                }
            }
            if (!isThoughtSummary) {
                this.scrollToBottom();
            }
        }
    },

    // ストリーミングメッセージの完了処理
    finalizeStreamingMessage(index) {
        const messageDiv = document.getElementById(`streaming-message-${index}`);
        if (messageDiv) {
            const finalMessageData = state.currentMessages[index];
            if (!finalMessageData) return;

            // Thought Summary の最終処理
            if (finalMessageData.thoughtSummary) {
                const thoughtContentDiv = messageDiv.querySelector(`#streaming-thought-summary-${index}`);
                if (thoughtContentDiv && typeof marked !== 'undefined') {
                    try {
                        thoughtContentDiv.innerHTML = marked.parse(finalMessageData.thoughtSummary || '');
                    } catch (e) {
                        console.error("Thought Summary ストリーミング完了時のMarkdownパースエラー:", e);
                        thoughtContentDiv.textContent = finalMessageData.thoughtSummary || '';
                    }
                    thoughtContentDiv.removeAttribute('id'); // IDを削除
                } else if (thoughtContentDiv) {
                    thoughtContentDiv.textContent = finalMessageData.thoughtSummary || '';
                    thoughtContentDiv.removeAttribute('id');
                }
            }

            // 通常コンテンツの最終処理
            const contentDiv = messageDiv.querySelector('.message-content');
            // stateから最終的なコンテンツを取得
            const finalRawContent = finalMessageData.content || '';
            if (contentDiv && typeof marked !== 'undefined') {
                    try {
                        // 最終コンテンツをMarkdownとしてパース
                        contentDiv.innerHTML = marked.parse(finalRawContent);
                    } catch (e) {
                        console.error("ストリーミング完了時のMarkdownパースエラー:", e);
                        contentDiv.textContent = finalRawContent; // エラー時はテキスト表示
                    }
            } else if (contentDiv) {
                contentDiv.textContent = finalRawContent; // markedがない場合のフォールバック
            }
            messageDiv.removeAttribute('id'); // IDを削除

            // ストリーミング完了後、カスケードコントロールが必要かチェックして再描画
            // (リトライ直後など、応答候補が増えた場合に必要)
            const msgData = state.currentMessages[index];
            if (msgData && msgData.role === 'model' && msgData.isCascaded) {
                const siblings = appLogic.getCascadedSiblings(index);
                if (siblings.length > 1) {
                    // コントロールを再生成または更新
                    // 一旦、renderChatMessagesを呼び出すのが簡単かもしれない
                    this.renderChatMessages(); // UI全体を再描画
                }
            }
        }
        this.scrollToBottom(); // 最後にスクロール
        
        // トークン表示を更新
        if (typeof tokenUtils !== 'undefined') {
            tokenUtils.updateTokenDisplay();
        }
    },

    // エラーメッセージを表示
    displayError(message, isApiError = false) {
        console.error("エラー表示:", message);
        const errorIndex = state.currentMessages.length; // 現在のメッセージリストの末尾に追加
        this.appendMessage('error', `エラー: ${message}`, errorIndex);
        elements.loadingIndicator.classList.add('hidden'); // ローディング非表示
        this.setSendingState(false); // 送信状態解除
    },

    // チャットコンテナの最上部へスクロール
    scrollToTop() {
        requestAnimationFrame(() => { // 次の描画タイミングで実行
            const mainContent = elements.chatScreen.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        });
    },

    // チャットコンテナの最下部へスクロール
    scrollToBottom() {
        requestAnimationFrame(() => { // 次の描画タイミングで実行
            const mainContent = elements.chatScreen.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = mainContent.scrollHeight;
            }
        });
    },



    // チャットタイトルを更新
    updateChatTitle(definitiveTitle = null) {
        let titleText = '新規チャット';
        let baseTitle = '';
        let isNewChat = !state.currentChatId;

        if (state.currentChatId) { // 既存チャットの場合
            isNewChat = false;
            if (definitiveTitle !== null) { // 引数でタイトルが指定されていればそれを使う
                baseTitle = definitiveTitle;
            } else { // 指定がなければメッセージから推測 (ユーザーメッセージ優先)
                const firstUserMessage = state.currentMessages.find(m => m.role === 'user');
                if (firstUserMessage) {
                    baseTitle = firstUserMessage.content;
                } else if (state.currentMessages.length > 0) { // ユーザーメッセージ以外でもメッセージがあれば
                    baseTitle = "チャット履歴";
                }
            }
            // タイトルを切り詰める
            if(baseTitle) {
                // インポート接頭辞を除いて切り詰める
                const displayBase = baseTitle.startsWith(IMPORT_PREFIX) ? baseTitle.substring(IMPORT_PREFIX.length) : baseTitle;
                const truncated = displayBase.substring(0, CHAT_TITLE_LENGTH);
                titleText = truncated + (displayBase.length > CHAT_TITLE_LENGTH ? '...' : '');
                // インポート接頭辞を再度付与
                if (baseTitle.startsWith(IMPORT_PREFIX)) {
                    titleText = IMPORT_PREFIX + titleText;
                }
            } else if(state.currentMessages.length > 0) { // メッセージがあれば (SPは考慮しない)
                titleText = 'チャット履歴';
            }
            // メッセージがあるのにタイトルが「新規チャット」のままなら変更
            if (titleText === '新規チャット' && state.currentMessages.length > 0) { // メッセージがあれば (SPは考慮しない)
                titleText = 'チャット履歴';
            }
        }
        // 表示用タイトル (既存チャットならプレフィックス追加)
        const displayTitle = isNewChat ? titleText : `: ${titleText}`;
        elements.chatTitle.textContent = displayTitle;
        document.title = `${APP_NAME} - ${titleText}`; // ブラウザタブのタイトルも更新
    },

    // タイムスタンプをフォーマット
    formatDate(timestamp) {
        if (!timestamp) return '';
        try {
            // 日本語形式でフォーマット
            return new Intl.DateTimeFormat('ja-JP', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp));
        } catch (e) {
            // Intlが使えない場合のフォールバック
            console.warn("Intl.DateTimeFormatエラー:", e);
            const d = new Date(timestamp);
            return `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
    },

    // 履歴リストをレンダリング
    async renderHistoryList() {
        try {
            const chats = await dbUtils.getAllChats(state.settings.historySortOrder);
            // 既存のアイテムを削除 (テンプレートを除く)
            elements.historyList.querySelectorAll('.history-item:not(.js-history-item-template)').forEach(item => item.remove());

            if (chats && chats.length > 0) {
                elements.noHistoryMessage.classList.add('hidden'); // 「履歴なし」メッセージを隠す
                // ヘッダータイトルにソート順を表示
                const sortOrderText = state.settings.historySortOrder === 'createdAt' ? '作成順' : '更新順';
                elements.historyTitle.textContent = `履歴一覧 (${sortOrderText})`;

                chats.forEach(chat => {
                    const li = elements.historyItemTemplate.cloneNode(true); // テンプレートを複製
                    li.classList.remove('js-history-item-template'); // テンプレートクラスを削除
                    li.dataset.chatId = chat.id; // チャットIDをデータ属性に設定

                    const titleText = chat.title || `履歴 ${chat.id}`;
                    const titleEl = li.querySelector('.history-item-title');
                    titleEl.textContent = titleText;
                    titleEl.title = titleText; // ホバーで全文表示

                    li.querySelector('.created-date').textContent = `作成: ${this.formatDate(chat.createdAt)}`;
                    li.querySelector('.updated-date').textContent = `更新: ${this.formatDate(chat.updatedAt)}`;

                    // クリックイベント (アクションボタン以外)
                    li.onclick = (event) => {
                        // アクションボタンがクリックされた場合は何もしない
                        if (!event.target.closest('.history-item-actions button')) {
                            appLogic.loadChat(chat.id);
                            this.showScreen('chat'); // チャット画面へ遷移
                        }
                    };

                    // 各アクションボタンのイベントリスナー
                    li.querySelector('.js-edit-title-btn').onclick = (e) => { e.stopPropagation(); appLogic.editHistoryTitle(chat.id, titleEl); };
                    li.querySelector('.js-export-text-btn').onclick = (e) => { e.stopPropagation(); appLogic.exportChatAsText(chat.id, titleText); };
                    li.querySelector('.js-export-json-btn').onclick = (e) => { e.stopPropagation(); appLogic.exportChatAsJSON(chat.id, titleText); };
                    li.querySelector('.js-duplicate-btn').onclick = (e) => { e.stopPropagation(); appLogic.duplicateChat(chat.id); };
                    li.querySelector('.js-delete-btn').onclick = (e) => { e.stopPropagation(); appLogic.confirmDeleteChat(chat.id, titleText); };

                    elements.historyList.appendChild(li); // リストに追加
                });
            } else {
                elements.noHistoryMessage.classList.remove('hidden'); // 「履歴なし」メッセージを表示
                elements.historyTitle.textContent = '履歴一覧'; // ソート順なしのタイトル
            }
        } catch (error) {
            console.error("履歴リストのレンダリングエラー:", error);
            elements.noHistoryMessage.textContent = "履歴の読み込み中にエラーが発生しました。";
            elements.noHistoryMessage.classList.remove('hidden');
            elements.historyTitle.textContent = '履歴一覧';
        }
    },

    // --- 背景画像UIヘルパー ---
    // 既存のオブジェクトURLを破棄
    revokeExistingObjectUrl() {
        if (state.backgroundImageUrl) {
            try {
                URL.revokeObjectURL(state.backgroundImageUrl);
                console.log("以前の背景URLを破棄:", state.backgroundImageUrl);
            } catch (e) {
                console.error("オブジェクトURLの破棄エラー:", e);
            }
            state.backgroundImageUrl = null;
        }
    },
    // 背景画像設定UIを更新
    updateBackgroundSettingsUI() {
        if (!elements.backgroundThumbnail || !elements.deleteBackgroundBtn) return;
        if (state.backgroundImageUrl) {
            elements.backgroundThumbnail.src = state.backgroundImageUrl;
            elements.backgroundThumbnail.classList.remove('hidden');
            elements.deleteBackgroundBtn.classList.remove('hidden');
        } else {
            elements.backgroundThumbnail.src = '';
            elements.backgroundThumbnail.classList.add('hidden');
            elements.deleteBackgroundBtn.classList.add('hidden');
        }
    },
    // ------------------------------------

    // 設定をUIに適用
    applySettingsToUI() {
        elements.apiKeyInput.value = state.settings.apiKey || '';
        elements.modelNameSelect.value = state.settings.modelName || AppConfig.DEFAULTS.modelName;
        elements.streamingOutputCheckbox.checked = state.settings.streamingOutput;
        elements.streamingSpeedInput.value = state.settings.streamingSpeed ?? AppConfig.DEFAULTS.streamingSpeed;
        elements.systemPromptDefaultTextarea.value = state.settings.systemPrompt || ''; // デフォルト用
        elements.temperatureInput.value = state.settings.temperature === null ? '' : state.settings.temperature;
        elements.maxTokensInput.value = state.settings.maxTokens === null ? '' : state.settings.maxTokens;
        elements.topKInput.value = state.settings.topK === null ? '' : state.settings.topK;
        elements.topPInput.value = state.settings.topP === null ? '' : state.settings.topP;
        elements.presencePenaltyInput.value = state.settings.presencePenalty === null ? '' : state.settings.presencePenalty;
        elements.frequencyPenaltyInput.value = state.settings.frequencyPenalty === null ? '' : state.settings.frequencyPenalty;
        elements.thinkingBudgetInput.value = state.settings.thinkingBudget === null ? '' : state.settings.thinkingBudget;
        elements.includeThoughtsToggle.checked = state.settings.includeThoughts; // Include Thoughts 設定を適用
        elements.dummyUserInput.value = state.settings.dummyUser || '';
        elements.dummyModelInput.value = state.settings.dummyModel || '';
        elements.enableDummyUserToggle.checked = state.settings.enableDummyUser; // ダミーUser有効化設定を適用
        elements.enableDummyModelToggle.checked = state.settings.enableDummyModel; // ダミーModel有効化設定を適用
        elements.concatDummyModelCheckbox.checked = state.settings.concatDummyModel;
        elements.additionalModelsTextarea.value = state.settings.additionalModels || '';
        elements.pseudoStreamingCheckbox.checked = state.settings.pseudoStreaming;
        elements.enterToSendCheckbox.checked = state.settings.enterToSend;
        elements.historySortOrderSelect.value = state.settings.historySortOrder || 'updatedAt';
        elements.darkModeToggle.checked = state.settings.darkMode; // ダークモードチェックボックスに状態を適用
        elements.fontFamilyInput.value = state.settings.fontFamily || ''; // フォント設定を適用
        elements.hideSystemPromptToggle.checked = state.settings.hideSystemPromptInChat; // SP非表示設定
        elements.enableGroundingToggle.checked = state.settings.enableGrounding; // ネット検索設定を適用
        elements.swipeNavigationToggle.checked = state.settings.enableSwipeNavigation;
        elements.debugVirtualSendToggle.checked = state.settings.debugVirtualSend; // デバッグ用仮想送信設定を適用
        elements.debugVirtualResponseTextarea.value = state.settings.debugVirtualResponse || ''; // デバッグ用仮想送信の返答を適用
        // コンテキスト圧縮設定を適用
        elements.compressionPromptTextarea.value = state.settings.compressionPrompt || AppConfig.DEFAULTS.compressionPrompt;
        elements.keepFirstMessagesInput.value = state.settings.keepFirstMessages ?? AppConfig.DEFAULTS.keepFirstMessages;
        elements.keepLastMessagesInput.value = state.settings.keepLastMessages ?? AppConfig.DEFAULTS.keepLastMessages;
        // ContextNote設定を適用
        elements.contextNoteRandomFrequencyInput.value = state.settings.contextNoteRandomFrequency ?? AppConfig.DEFAULTS.contextNoteRandomFrequency;
        elements.contextNoteRandomCountInput.value = state.settings.contextNoteRandomCount ?? AppConfig.DEFAULTS.contextNoteRandomCount;
        elements.contextNoteMessageCountInput.value = state.settings.contextNoteMessageCount ?? AppConfig.DEFAULTS.contextNoteMessageCount;
        elements.contextNoteMaxCharsInput.value = state.settings.contextNoteMaxChars ?? AppConfig.DEFAULTS.contextNoteMaxChars;
        elements.contextNoteInsertionPriorityInput.value = state.settings.contextNoteInsertionPriority ?? AppConfig.DEFAULTS.contextNoteInsertionPriority;

        // ユーザー指定モデルをコンボボックスに追加
        this.updateUserModelOptions();

        this.updateBackgroundSettingsUI(); // 背景画像UI要素を更新
        this.applyDarkMode(); // 読み込み/更新された設定を反映してテーマを適用 (チェックボックス設定後)
        this.applyFontFamily(); // フォント設定を適用
        this.toggleSystemPromptVisibility(); // SP表示/非表示を適用
    },

    // ユーザー指定モデルをコンボボックスに反映
    updateUserModelOptions() {
        const group = elements.userDefinedModelsGroup;
        group.innerHTML = ''; // 一旦クリア
        const models = (state.settings.additionalModels || '')
            .split(',')
            .map(m => m.trim())
            .filter(m => m !== ''); // カンマ区切りで分割し、空要素を除去

        if (models.length > 0) {
            group.disabled = false; // optgroupを有効化
            models.forEach(modelId => {
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = modelId;
                group.appendChild(option);
            });
            // 現在選択中のモデルがユーザー指定モデルに含まれていれば、それを選択状態にする
            if (models.includes(state.settings.modelName)) {
                elements.modelNameSelect.value = state.settings.modelName;
            }
        } else {
            group.disabled = true; // モデルがなければoptgroupを無効化
        }
    },

    // ダークモードを適用
    applyDarkMode() {
        const isDark = state.settings.darkMode;
        document.body.classList.toggle('dark-mode', isDark);
        // OS設定の上書き用クラス (ダークモードでない場合)
        document.body.classList.toggle('light-mode-forced', !isDark);
        elements.themeColorMeta.content = isDark ? AppConfig.DEFAULTS.darkThemeColor : AppConfig.DEFAULTS.lightThemeColor;
        console.log(`ダークモード ${isDark ? '有効' : '無効'}. テーマカラー: ${elements.themeColorMeta.content}`);
    },

    // フォント設定を適用
    applyFontFamily() {
        const customFont = state.settings.fontFamily?.trim();
        const fontFamilyToApply = customFont ? customFont : AppConfig.DEFAULTS.fontFamily;
        document.documentElement.style.setProperty('--font-family', fontFamilyToApply);
        console.log(`フォント適用: ${fontFamilyToApply}`);
    },

    // --- システムプロンプトUI更新 ---
    updateSystemPromptUI() {
        elements.systemPromptEditor.value = state.currentSystemPrompt;
        // 編集中でない場合、detailsタグを閉じる
        if (!state.isEditingSystemPrompt) {
            elements.systemPromptDetails.removeAttribute('open');
        }
        // テキストエリアの高さを調整
        this.adjustTextareaHeight(elements.systemPromptEditor, 200);
        // 表示/非表示を制御
        this.toggleSystemPromptVisibility();
    },
    // システムプロンプトエリアの表示/非表示を切り替え
    toggleSystemPromptVisibility() {
        const shouldHide = state.settings.hideSystemPromptInChat;
        elements.systemPromptArea.classList.toggle('hidden', shouldHide);
        console.log(`システムプロンプト表示エリア ${shouldHide ? '非表示' : '表示'}`);
    },
    // --------------------------------

    // 画面を表示 (スワイプアニメーション + inert対応 + 戻るボタン対応)
    showScreen(screenName, fromPopState = false) {
        // 編集中ならキャンセル
        if (state.editingMessageIndex !== null) {
                const messageElement = elements.messageContainer.querySelector(`.message[data-index="${state.editingMessageIndex}"]`);
                if (messageElement) { // 要素が存在する場合のみキャンセル処理
                appLogic.cancelEditMessage(state.editingMessageIndex, messageElement);
                } else {
                state.editingMessageIndex = null; // 要素が見つからない場合はインデックスのみリセット
                }
        }
        // システムプロンプト編集中ならキャンセル
        if (state.isEditingSystemPrompt) {
            appLogic.cancelEditSystemPrompt();
        }

        // 現在の画面と同じなら何もしない
        if (screenName === state.currentScreen) {
            // console.log(`showScreen: Already on screen ${screenName}.`); // ログ削減
            return;
        }

        const allScreens = [elements.chatScreen, elements.historyScreen, elements.promptCheckScreen, elements.settingsScreen];
        let activeScreen = null;

        // fromPopStateがfalseの場合のみ履歴操作を行う (UI操作時)
        if (!fromPopState) {
            if (screenName === 'history' || screenName === 'settings' || screenName === 'chat-info') {
                // 履歴/設定/プロンプト確認画面への遷移時は履歴を追加
                history.pushState({ screen: screenName }, '', `#${screenName}`);
                console.log(`Pushed state: ${screenName}`);
            } else if (screenName === 'chat') {
                // チャット画面へ戻る遷移 (通常はUIの戻るボタンやpopstateで処理される想定だが、
                // 直接 showScreen('chat') が呼ばれた場合も考慮)
                // ここではURLハッシュのみ更新し、履歴スタックは変更しない
                history.replaceState({ screen: 'chat' }, '', '#chat');
                console.log(`Replaced state: ${screenName}`);
            }
        } else {
            // popstateイベント経由の場合は履歴操作は行わない
            console.log(`showScreen called from popstate for ${screenName}`);
        }

        // まず全ての画面を非アクティブ＆inert状態にする
        allScreens.forEach(screen => {
            screen.classList.remove('active');
            screen.inert = true; // 非アクティブ画面は操作不可に
        });

        // ターゲット画面に応じてtransformとアクティブ設定
        if (screenName === 'chat') {
            activeScreen = elements.chatScreen;
            elements.chatScreen.style.transform = 'translateX(0)';
            elements.historyScreen.style.transform = 'translateX(-100%)';
            elements.promptCheckScreen.style.transform = 'translateX(-200%)';
            elements.settingsScreen.style.transform = 'translateX(100%)';
            requestAnimationFrame(() => {
                this.updateSystemPromptUI();
                this.adjustTextareaHeight();
                this.scrollToBottom();
            });
        } else if (screenName === 'history') {
            activeScreen = elements.historyScreen;
            elements.chatScreen.style.transform = 'translateX(100%)';
            elements.historyScreen.style.transform = 'translateX(0)';
            elements.promptCheckScreen.style.transform = 'translateX(-100%)';
            elements.settingsScreen.style.transform = 'translateX(200%)';
            this.renderHistoryList();
        } else if (screenName === 'chat-info') {
            activeScreen = elements.promptCheckScreen;
            elements.chatScreen.style.transform = 'translateX(200%)';
            elements.historyScreen.style.transform = 'translateX(100%)';
            elements.promptCheckScreen.style.transform = 'translateX(0)';
            elements.settingsScreen.style.transform = 'translateX(300%)';
        } else if (screenName === 'settings') {
            activeScreen = elements.settingsScreen;
            elements.chatScreen.style.transform = 'translateX(-100%)';
            elements.historyScreen.style.transform = 'translateX(-200%)';
            elements.promptCheckScreen.style.transform = 'translateX(-300%)';
            elements.settingsScreen.style.transform = 'translateX(0)';
            this.applySettingsToUI();
        }

        // アニメーション適用とアクティブ化
        requestAnimationFrame(() => {
            allScreens.forEach(screen => {
                screen.style.transition = 'transform 0.3s ease-in-out';
            });
            if (activeScreen) {
                activeScreen.inert = false; // アクティブ画面は操作可能に
                activeScreen.classList.add('active');
            }
        });

        // 現在の画面名をstateに保存
        state.currentScreen = screenName;
        console.log(`Navigated to screen: ${screenName}`);
    },

    // 送信状態を設定
    setSendingState(sending) {
        state.isSending = sending;
        if (sending) {
            elements.sendButton.textContent = '止'; // ボタンテキスト変更
            elements.sendButton.classList.add('sending'); // スタイル変更用クラス
            elements.sendButton.title = "停止";
            elements.sendButton.disabled = false; // 停止ボタンは常に有効
            elements.userInput.disabled = true; // 入力欄無効化
            elements.attachFileBtn.disabled = true; // 添付ボタンも無効化
            // システムプロンプト編集も不可にする
            elements.systemPromptDetails.style.pointerEvents = 'none';
            elements.systemPromptDetails.style.opacity = '0.7';
        } else {
            elements.sendButton.textContent = '送';
            elements.sendButton.classList.remove('sending');
            elements.sendButton.title = "送信";
            // 入力が空なら送信ボタン無効化
            elements.sendButton.disabled = elements.userInput.value.trim() === '';
            elements.userInput.disabled = false; // 入力欄有効化
            elements.attachFileBtn.disabled = false; // 添付ボタン有効化
            // システムプロンプト編集を可能にする
            elements.systemPromptDetails.style.pointerEvents = '';
            elements.systemPromptDetails.style.opacity = '';
        }
    },

    // ローディングインジケータの制御（APIリクエスト用）
    setLoadingIndicator(show) {
        if (show) {
            elements.loadingIndicator.classList.remove('hidden');
            elements.loadingIndicator.setAttribute('aria-live', 'polite');
        } else {
            elements.loadingIndicator.classList.add('hidden');
            elements.loadingIndicator.removeAttribute('aria-live');
        }
    },

    // テキストエリアの高さを自動調整
    adjustTextareaHeight(textarea = elements.userInput, maxHeight = TEXTAREA_MAX_HEIGHT) {
        textarea.style.height = 'auto'; // 一旦高さをリセット
        const scrollHeight = textarea.scrollHeight;
        // 最大高さを超えないように設定
        textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
        // メイン入力欄の場合、送信ボタンの有効/無効を更新
        if (textarea === elements.userInput && !state.isSending) {
            elements.sendButton.disabled = textarea.value.trim() === '';
        }
    },

    // --- カスタムダイアログ関数 ---
    // ダイアログを表示し、閉じられるまで待機
    showCustomDialog(dialogElement, focusElement) {
        return new Promise((resolve) => {
            const closeListener = () => {
                dialogElement.removeEventListener('close', closeListener);
                resolve(dialogElement.returnValue); // 閉じたときの値を返す
            };
            dialogElement.addEventListener('close', closeListener);
            dialogElement.showModal(); // モーダルダイアログとして表示
            // 指定された要素にフォーカス
            if (focusElement) {
                requestAnimationFrame(() => { focusElement.focus(); });
            }
        });
    },
    // アラートダイアログ表示
    async showCustomAlert(message) {
        elements.alertMessage.textContent = message;
            // ボタンのイベントリスナーが重複しないように複製して置き換え
            const newOkBtn = elements.alertOkBtn.cloneNode(true);
            elements.alertOkBtn.parentNode.replaceChild(newOkBtn, elements.alertOkBtn);
            elements.alertOkBtn = newOkBtn;
        elements.alertOkBtn.onclick = () => elements.alertDialog.close('ok');
        await this.showCustomDialog(elements.alertDialog, elements.alertOkBtn);
    },
    // 確認ダイアログ表示
    async showCustomConfirm(message) {
        elements.confirmMessage.textContent = message;
            // ボタンのイベントリスナーが重複しないように複製して置き換え
            const newOkBtn = elements.confirmOkBtn.cloneNode(true);
            elements.confirmOkBtn.parentNode.replaceChild(newOkBtn, elements.confirmOkBtn);
            elements.confirmOkBtn = newOkBtn;
            const newCancelBtn = elements.confirmCancelBtn.cloneNode(true);
            elements.confirmCancelBtn.parentNode.replaceChild(newCancelBtn, elements.confirmCancelBtn);
            elements.confirmCancelBtn = newCancelBtn;

        elements.confirmOkBtn.onclick = () => elements.confirmDialog.close('ok');
        elements.confirmCancelBtn.onclick = () => elements.confirmDialog.close('cancel');
        const result = await this.showCustomDialog(elements.confirmDialog, elements.confirmOkBtn);
        return result === 'ok'; // OKが押されたか
    },

    // はい・いいえダイアログ表示
    async showCustomYesNo(message) {
        elements.yesNoMessage.textContent = message;
            // ボタンのイベントリスナーが重複しないように複製して置き換え
            const newYesBtn = elements.yesNoYesBtn.cloneNode(true);
            elements.yesNoYesBtn.parentNode.replaceChild(newYesBtn, elements.yesNoYesBtn);
            elements.yesNoYesBtn = newYesBtn;
            const newNoBtn = elements.yesNoNoBtn.cloneNode(true);
            elements.yesNoNoBtn.parentNode.replaceChild(newNoBtn, elements.yesNoNoBtn);
            elements.yesNoNoBtn = newNoBtn;

        elements.yesNoYesBtn.onclick = () => elements.yesNoDialog.close('yes');
        elements.yesNoNoBtn.onclick = () => elements.yesNoDialog.close('no');
        const result = await this.showCustomDialog(elements.yesNoDialog, elements.yesNoYesBtn);
        return result === 'yes'; // はいが押されたか
    },
    // プロンプトダイアログ表示
    async showCustomPrompt(message, defaultValue = '') {
        elements.promptMessage.textContent = message;
        elements.promptInput.value = defaultValue;
            // ボタンと入力欄のイベントリスナーが重複しないように複製して置き換え
            const newOkBtn = elements.promptOkBtn.cloneNode(true);
            elements.promptOkBtn.parentNode.replaceChild(newOkBtn, elements.promptOkBtn);
            elements.promptOkBtn = newOkBtn;
            const newCancelBtn = elements.promptCancelBtn.cloneNode(true);
            elements.promptCancelBtn.parentNode.replaceChild(newCancelBtn, elements.promptCancelBtn);
            elements.promptCancelBtn = newCancelBtn;
            const newPromptInput = elements.promptInput.cloneNode(true);
            elements.promptInput.parentNode.replaceChild(newPromptInput, elements.promptInput);
            elements.promptInput = newPromptInput;

        // EnterキーでOKボタンをクリックする処理
        const enterHandler = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                elements.promptOkBtn.click();
            }
        };
        elements.promptInput.addEventListener('keypress', enterHandler);

        elements.promptOkBtn.onclick = () => elements.promptDialog.close(elements.promptInput.value); // OK時は入力値を返す
        elements.promptCancelBtn.onclick = () => elements.promptDialog.close(''); // キャンセル時は空文字列 ('') を渡す

        // ダイアログが閉じたらEnterキーリスナーを削除
        const closeHandler = () => {
            elements.promptInput.removeEventListener('keypress', enterHandler);
            elements.promptDialog.removeEventListener('close', closeHandler);
        };
            elements.promptDialog.addEventListener('close', closeHandler);

        const result = await this.showCustomDialog(elements.promptDialog, elements.promptInput);
        return result; // 入力値またはnullを返す
    },

    // 添付ファイルバッジの表示/非表示を更新する関数
    updateAttachmentBadgeVisibility() {
        const hasAttachments = state.pendingAttachments.length > 0;
        elements.attachFileBtn.classList.toggle('has-attachments', hasAttachments);
        // console.log(`Attachment badge visibility updated: ${hasAttachments}`); // デバッグ用
    },

    // ファイルアップロードダイアログ表示
    showFileUploadDialog() {
        // state.pendingAttachments に基づいて selectedFilesForUpload を初期化
        if (state.pendingAttachments.length > 0) {
            // pendingAttachments には { file: File, name: ..., mimeType: ..., base64Data: ... } が入っている
            // selectedFilesForUpload には { file: File } を格納する
            state.selectedFilesForUpload = state.pendingAttachments.map(att => ({ file: att.file }));
            console.log("送信待ちの添付ファイルをダイアログに復元:", state.selectedFilesForUpload.map(item => item.file.name));
        } else {
            // 送信待ちファイルがなければクリア
            state.selectedFilesForUpload = [];
        }

        // UI更新は初期化後に行う
        this.updateSelectedFilesUI();
        elements.fileUploadDialog.showModal();
        // ダイアログ表示時にもバッジ状態を更新 (キャンセルで戻った場合など)
        this.updateAttachmentBadgeVisibility();
    },

    // 選択されたファイルリストのUIを更新 (変更なし、呼び出しタイミングが重要)
    updateSelectedFilesUI() {
        elements.selectedFilesList.innerHTML = ''; // リストをクリア
        let totalSize = 0;
        // selectedFilesForUpload には { file: File } が入っている
        state.selectedFilesForUpload.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('selected-file-item');
            li.dataset.fileIndex = index;

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('selected-file-info');

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('selected-file-name');
            nameSpan.textContent = item.file.name;
            nameSpan.title = item.file.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.classList.add('selected-file-size');
            sizeSpan.textContent = formatFileSize(item.file.size); // File オブジェクトからサイズ取得

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(sizeSpan);

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-file-btn');
            removeBtn.title = '削除';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => appLogic.removeSelectedFile(index);

            li.appendChild(infoDiv);
            li.appendChild(removeBtn);
            elements.selectedFilesList.appendChild(li);

            totalSize += item.file.size;
        });

        // 合計サイズチェック
        if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
            elements.confirmAttachBtn.disabled = true;
            // アラートはファイル追加時に行う方が親切かもしれない
            // uiUtils.showCustomAlert(`合計ファイルサイズが大きすぎます (${formatFileSize(MAX_TOTAL_ATTACHMENT_SIZE)}以下にしてください)。`);
        } else {
            // サイズが問題なければ常に有効化
            elements.confirmAttachBtn.disabled = false;
        }
    },
};

// --- APIユーティリティ (apiUtils) ---
const apiUtils = {
    // Gemini APIを呼び出す
    async callGeminiApi(messagesForApi, generationConfig, systemInstruction) {
        // デバッグ用仮想送信が有効な場合、実際のAPI呼び出しをスキップ
        if (state.settings.debugVirtualSend) {
            const debugResponse = state.settings.debugVirtualResponse || " "; // 設定されたテキストまたは空文字列
            console.log("デバッグ用仮想送信モード: 実際のAPI呼び出しをスキップし、設定された応答を返します");
            console.log("返答内容:", debugResponse);
            
            // 設定された応答をシミュレートするためのResponseオブジェクトを作成
            const virtualResponse = new Response(
                JSON.stringify({
                    candidates: [{
                        content: {
                            parts: [{ text: debugResponse }]
                        },
                        finishReason: "STOP"
                    }],
                    usageMetadata: {
                        promptTokenCount: 0,
                        candidatesTokenCount: debugResponse.length,
                        totalTokenCount: debugResponse.length
                    }
                }),
                {
                    status: 200,
                    statusText: "OK",
                    headers: { "Content-Type": "application/json" }
                }
            );
            
            return virtualResponse;
        }
        
        if (!state.settings.apiKey) {
            throw new Error("APIキーが設定されていません。");
        }
        // 新しいリクエストのためにAbortControllerを作成
        state.abortController = new AbortController();
        const { signal } = state.abortController;

        const useStreaming = state.settings.streamingOutput;
        const usePseudo = state.settings.pseudoStreaming;
        const model = state.settings.modelName || AppConfig.DEFAULTS.modelName;
        const apiKey = state.settings.apiKey;

        // ストリーミング/疑似ストリーミング/非ストリーミングでエンドポイントを切り替え
        let endpointMethod = useStreaming
            ? (usePseudo ? 'generateContent?alt=sse&' : 'streamGenerateContent?alt=sse&')
            : 'generateContent?';
        console.log(`使用モード: ${useStreaming ? (usePseudo ? '疑似ストリーミング' : 'リアルタイムストリーミング') : '非ストリーミング'}`);

        const endpoint = `${GEMINI_API_BASE_URL}${model}:${endpointMethod}key=${apiKey}`;
        
        const finalGenerationConfig = { ...generationConfig }; // コピーを作成
        if (state.settings.presencePenalty !== null) finalGenerationConfig.presencePenalty = state.settings.presencePenalty;
        if (state.settings.frequencyPenalty !== null) finalGenerationConfig.frequencyPenalty = state.settings.frequencyPenalty;
        
        // thinkingConfig 設定を更新
        if (state.settings.thinkingBudget !== null || state.settings.includeThoughts) {
            finalGenerationConfig.thinkingConfig = finalGenerationConfig.thinkingConfig || {};
            if (state.settings.thinkingBudget !== null && Number.isInteger(state.settings.thinkingBudget) && state.settings.thinkingBudget >= 0) {
                finalGenerationConfig.thinkingConfig.thinkingBudget = state.settings.thinkingBudget;
                console.log(`Thinking Budget (${state.settings.thinkingBudget}) を有効にしてAPIを呼び出します。`);
            }
            if (state.settings.includeThoughts) { // Include Thoughts フラグをセット
                finalGenerationConfig.thinkingConfig.includeThoughts = true;
                console.log("Include Thoughts を有効にしてAPIを呼び出します。");
            }
            if (Object.keys(finalGenerationConfig.thinkingConfig).length === 0) {
                delete finalGenerationConfig.thinkingConfig;
            }
        }

        // リクエストボディを作成
        const requestBody = {
            contents: messagesForApi,
            // generationConfigが空でない場合のみ追加
            ...(Object.keys(finalGenerationConfig).length > 0 && { generationConfig: finalGenerationConfig }),
            // systemInstructionが存在する場合のみ追加 (systemInstructionはオブジェクト形式)
            ...(systemInstruction && systemInstruction.parts && systemInstruction.parts.length > 0 && systemInstruction.parts[0].text && { systemInstruction }),
            // 安全性設定 (全てブロック解除)
                safetySettings : [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
        };
        
        const tools = []; // tools 配列を初期化

        // グラウンディング設定を追加
        if (state.settings.enableGrounding) {
            tools.push({ "google_search": {} });
            console.log("グラウンディング (Google Search) を有効にしてAPIを呼び出します。");
        }
        
        // tools 配列が空ならリクエストボディから削除
        if (tools.length > 0) {
            requestBody.tools = tools;
        }

        console.log("Geminiへの送信データ:", JSON.stringify(requestBody, (key, value) => {
            // Base64データはログで見やすく省略
            if (key === 'data' && typeof value === 'string' && value.length > 100) {
                return value.substring(0, 50) + OMISSION_TEXT + value.substring(value.length - 20);
            }
            return value;
        }, 2));
        console.log("ターゲットエンドポイント:", endpoint);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal // AbortControllerのシグナルを渡す
            });

            // エラーレスポンス処理
            if (!response.ok) {
                let errorMsg = `APIエラー (${response.status}): ${response.statusText}`;
                try {
                    // エラーレスポンスのボディをJSONとしてパース試行
                    const errorData = await response.json();
                    console.error("APIエラーレスポンスボディ:", errorData);
                    if (errorData.error && errorData.error.message) {
                        errorMsg = `APIエラー (${response.status}): ${errorData.error.message}`;
                    }
                } catch (e) {
                    console.error("APIエラーレスポンスボディのパース失敗:", e);
                }
                throw new Error(errorMsg);
            }
            // 成功レスポンスを返す
            return response;
        } catch (error) {
            // AbortErrorの場合、キャンセルされたことを示すエラーを投げる
            if (error.name === 'AbortError') {
                throw new Error("リクエストがキャンセルされました。");
            } else {
                // その他のネットワークエラーなど
                throw error;
            }
        }
    },

    // ストリーミングレスポンスを処理
    async *handleStreamingResponse(response) { // async * に変更
            if (!response.body) {
                throw new Error("レスポンスボディがありません。");
            }
            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';
            let lastCandidateInfo = null;
            // processedContentChunks や processedThoughtChunks はここでは不要になる
            let isCancelled = false;
            let groundingMetadata = null;
            let finalUsageMetadata = null; // 最終的なusageMetadataを保持

            try {
                while (true) {
                    // キャンセルシグナルをチェック
                    if (state.abortController?.signal.aborted && !isCancelled) {
                        isCancelled = true;
                        console.log("ストリーミング中に中断シグナルを検出");
                        await reader.cancel("User aborted"); // リーダーをキャンセル
                        throw new Error("リクエストがキャンセルされました。");
                    }

                    let readResult;
                    try {
                        // データを読み取る
                        readResult = await reader.read();
                    } catch (readError) {
                        // 読み取り中にエラーが発生した場合 (キャンセル含む)
                        if (readError.name === 'AbortError' || readError.message === "User aborted" || readError.message.includes("aborted")) {
                            if (!isCancelled) { // まだキャンセルされていなければエラーとして投げる
                                isCancelled = true;
                                throw new Error("リクエストがキャンセルされました。");
                            }
                            break; // キャンセル済みならループを抜ける
                        }
                        throw readError; // その他の読み取りエラー
                    }

                    const { value, done } = readResult;

                    if (done) { // ストリーム終了
                        console.log("ストリーム終了 (done)");
                        // バッファに残っているデータを処理
                        if (buffer.trim()) {
                            // バッファに残っているデータを処理し、yield する
                            const finalData = parseSseDataForYield(buffer.trim().substring(6));
                            if (finalData) yield finalData;
                        }
                        break; // ループを抜ける
                    }

                    // 受信したデータをバッファに追加
                    buffer += value;
                    // バッファを処理してSSEメッセージを抽出し、逐次 yield する
                    let remainingBuffer = buffer;
                    while (true) {
                        const newlineIndex = remainingBuffer.indexOf('\n');
                        if (newlineIndex === -1) {
                            buffer = remainingBuffer; // 未処理分をバッファに戻す
                            break;
                        }
                        const line = remainingBuffer.substring(0, newlineIndex).trim();
                        remainingBuffer = remainingBuffer.substring(newlineIndex + 1);

                        if (line.startsWith('data: ')) {
                            const chunkData = parseSseDataForYield(line.substring(6)); // 'data: ' を除いたJSON部分をパース
                            if (chunkData) {
                                // groundingMetadata と usageMetadata を更新
                                if (chunkData.groundingMetadata) groundingMetadata = chunkData.groundingMetadata;
                                if (chunkData.usageMetadata) finalUsageMetadata = chunkData.usageMetadata; // 常に最新で上書き
                                yield chunkData; // パースしたデータを yield
                            }
                        } else if (line !== '') {
                            console.warn("データ以外のSSE行を無視:", line);
                        }
                        // ループの最後にバッファを更新
                        if (remainingBuffer === '') {
                        buffer = '';
                        break;
                        }
                    }
                }
                // 最終的なメタデータを取得
                const finishReason = lastCandidateInfo?.finishReason;
                const safetyRatings = lastCandidateInfo?.safetyRatings;

                // ストリームの最後にメタデータを yield する (識別子付きで)
                yield {
                    type: 'metadata', // メタデータであることを示す
                    finishReason: isCancelled ? 'ABORTED' : finishReason,
                    safetyRatings,
                    groundingMetadata: groundingMetadata, // 最終的なgroundingMetadata
                    usageMetadata: finalUsageMetadata // 最終的なusageMetadata
                };

            } catch (error) {
                // ストリーム処理中のエラー
                console.error("ストリームの読み取り/処理エラー:", error);
                throw new Error(`ストリーミング処理エラー: ${error.message || error}`, { cause: { originalError: error } });
            } finally {
                // ループ終了後、リーダーがまだ閉じておらず、キャンセルもされていない場合、クリーンアップのためにキャンセルを試みる
                if (!reader.closed && !isCancelled) {
                    console.warn("リーダーがループ後に閉じていません。クリーンアップキャンセルを試みます。");
                    try { await reader.cancel("Cleanup cancellation"); } catch(e) { console.error("クリーンアップキャンセル中のエラー:", e); }
                }
            }

            // SSEデータ (JSON) をパースする内部関数 (yield するデータを返すように変更)
            function parseSseDataForYield(jsonString) {
                try {
                    const chunkJson = JSON.parse(jsonString);
                    if (chunkJson.error) {
                        console.error("ストリーム内のエラーメッセージ:", chunkJson.error);
                        const errorMsg = `モデルエラー: ${chunkJson.error.message || JSON.stringify(chunkJson.error)}`;
                        lastCandidateInfo = { error: chunkJson.error, finishReason: 'ERROR' };
                        // エラーも yield する (type: 'error' などで)
                        return { type: 'error', error: chunkJson.error, message: errorMsg };
                    }

                    let contentText = null;
                    let thoughtText = null;
                    let currentGroundingMetadata = null;
                    let currentUsageMetadata = null; // このチャンクのusageMetadata

                    if (chunkJson.candidates && chunkJson.candidates.length > 0) {
                        lastCandidateInfo = chunkJson.candidates[0];
                        if (lastCandidateInfo?.content?.parts) {
                            lastCandidateInfo.content.parts.forEach(part => {
                                if (typeof part.text === 'string') {
                                    if (part.thought === true) {
                                        thoughtText = (thoughtText || '') + part.text;
                                    } else {
                                        contentText = (contentText || '') + part.text;
                                    }
                                }
                            });
                        }
                        if (lastCandidateInfo.groundingMetadata) {
                            currentGroundingMetadata = lastCandidateInfo.groundingMetadata;
                        }
                    } else if (chunkJson.promptFeedback) {
                        console.warn("ストリーム内のプロンプトフィードバック:", chunkJson.promptFeedback);
                        lastCandidateInfo = { finishReason: 'SAFETY', safetyRatings: chunkJson.promptFeedback.safetyRatings };
                        // promptFeedbackも yield するか検討 (ここでは省略)
                        return null; // または適切なデータを返す
                    }

                    if (chunkJson.usageMetadata) { // usageMetadataをチェック
                        currentUsageMetadata = chunkJson.usageMetadata;
                    }

                    // レスポンス置換を適用
                    if (contentText !== null && state.responseReplacer && state.responseReplacer.replacements.length > 0) {
                        let replacedContent = contentText;
                        for (const replacement of state.responseReplacer.replacements) {
                            try {
                                const regex = new RegExp(replacement.pattern, 'g');
                                replacedContent = replacedContent.replace(regex, replacement.replacement);
                            } catch (error) {
                                console.warn('レスポンス置換でエラー:', error, 'パターン:', replacement.pattern);
                            }
                        }
                        contentText = replacedContent;
                    }

                    if (contentText !== null || thoughtText !== null || currentGroundingMetadata || currentUsageMetadata) {
                        return {
                            type: 'chunk', // 通常のチャンクであることを示す
                            contentText,
                            thoughtText,
                            groundingMetadata: currentGroundingMetadata, // このチャンクのgroundingMetadata
                            usageMetadata: currentUsageMetadata // このチャンクのusageMetadata
                        };
                    }
                    return null; // 有効なデータがなければnull
                } catch (parseError) {
                    console.warn("ストリーム内の不正なJSONをスキップ:", jsonString, parseError);
                    return null;
                }
            }
    }
};

// --- アプリケーションロジック (appLogic) ---
const appLogic = {
    // アプリ初期化
    async initializeApp() {
        // marked.jsの設定
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true, // 改行を<br>に変換
                gfm: true, // GitHub Flavored Markdown有効化
                sanitize: true, // HTMLサニタイズ (XSS対策)
                smartypants: false // スマートクォートなどを無効化
            });
            console.log("Marked.js設定完了");
        } else {
            console.error("Marked.jsライブラリが読み込まれていません！");
        }
        // バージョン表示
        elements.appVersionSpan.textContent = APP_VERSION;
        const fe4lcAppVersionSpan = document.getElementById('fe4lc-app-version');
        if (fe4lcAppVersionSpan) {
            fe4lcAppVersionSpan.textContent = FE4LC_APP_VERSION;
        }
        // PWAインストールプロンプトのデフォルト動作を抑制
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            console.log('beforeinstallpromptイベントを抑制しました。');
            // ここで独自のインストールボタンを表示するロジックを追加可能
        });

        // 初期画面をチャットに設定 (UI表示のみ、state更新と履歴操作は後で)
        uiUtils.showScreen('chat');

        registerServiceWorker(); // Service Worker登録

        try {
            await dbUtils.openDB(); // DBを開く
            await dbUtils.loadSettings(); // 設定を読み込む (stateに反映)

            // 読み込んだ設定に基づいて初期テーマとフォントを適用
            uiUtils.applyDarkMode();
            uiUtils.applyFontFamily();

            // 読み込んだ設定に基づいて背景画像を適用
            if (state.settings.backgroundImageBlob instanceof Blob) {
                uiUtils.revokeExistingObjectUrl(); // 既存URLがあれば破棄
                try {
                        state.backgroundImageUrl = URL.createObjectURL(state.settings.backgroundImageBlob);
                        document.documentElement.style.setProperty('--chat-background-image', `url(${state.backgroundImageUrl})`);
                        console.log("読み込んだBlobから背景画像を適用しました。");
                } catch (e) {
                        console.error("背景画像のオブジェクトURL作成エラー:", e);
                        document.documentElement.style.setProperty('--chat-background-image', 'none');
                }
            } else {
                // 背景画像がない場合はスタイルをリセット
                document.documentElement.style.setProperty('--chat-background-image', 'none');
            }

            // 読み込んだ全設定をUIフィールドに適用
            uiUtils.applySettingsToUI();

            // 最新のチャットを読み込むか、新規チャットを開始
            try {
                const chats = await dbUtils.getAllChats(state.settings.historySortOrder);
                if (chats && chats.length > 0) {
                    await this.loadChat(chats[0].id); // 最新チャットを読み込み
                } else {
                    this.startNewChat(); // 履歴がなければ新規チャット
                }
            } catch (error) {
                console.error("チャット読み込みエラー:", error);
                // エラーが発生した場合は新規チャットを開始
                this.startNewChat();
            }
            
            // 圧縮ボタンのテキストを更新
            if (typeof updateCompressButtonText === 'function') {
                updateCompressButtonText();
            }

            // 初期状態を履歴スタックに設定 (loadChat/startNewChatの後)
            history.replaceState({ screen: 'chat' }, '', '#chat');
            state.currentScreen = 'chat'; // stateも初期化
            console.log("Initial history state set to #chat");

        } catch (error) {
            console.error("初期化失敗:", error);
            await uiUtils.showCustomAlert(`アプリの初期化に失敗しました: ${error}`);
            // 致命的なエラーの場合はアプリ内容をエラー表示に置き換え
            elements.appContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: red;">アプリの起動に失敗しました。</p>`;
        } finally {
            // max-widthの固定幅をpxで算出
            updateMessageMaxWidthVar();
            // イベントリスナーを設定 (初期履歴設定後)
            this.setupEventListeners();
            // ズーム状態を初期化
            this.updateZoomState();
            // UI調整
            uiUtils.adjustTextareaHeight();
            uiUtils.setSendingState(false); // 送信状態をリセット
            uiUtils.scrollToBottom();
        }
    },

    // イベントリスナーを設定
    setupEventListeners() {
        // ナビゲーションボタン
        elements.gotoHistoryBtn.addEventListener('click', () => uiUtils.showScreen('history'));
        elements.gotoSettingsBtn.addEventListener('click', () => uiUtils.showScreen('settings'));
        elements.promptCheckBtn.addEventListener('click', async () => {
			// プロンプト確認画面に表示するデータを構築
			const promptData = buildPromptDataForCheck();
			        elements.promptContent.textContent = promptData;
        // 圧縮状態を表示
        this.updateCompressionStatusDisplay();
        // レスポンス置換を読み込み（現在のチャットデータがない場合は空で初期化）
        await this.loadResponseReplacementsFromChat();
        // レスポンス置換リストを事前に表示（タブ切り替え時に即座に表示されるように）
        state.responseReplacerUI.renderList();
            // ContextNoteを読み込み（現在のチャットデータがない場合は空で初期化）
    await this.loadContextNotesFromChat();
    
    // 新規チャットの場合、デフォルトのコンテキストノート仕様を追加
    if (state.contextNote.getAllNotes().length === 0) {
        this.addDefaultContextNoteSpec();
    }
    
    // ContextNoteリストを事前に表示（タブ切り替え時に即座に表示されるように）
    this.renderContextNotesList();
        uiUtils.showScreen('chat-info');
		});
        
        // 圧縮破棄ボタン
        elements.clearCompressionBtn.addEventListener('click', async () => {
            if (state.compressedSummary) {
                const confirmed = await uiUtils.showCustomConfirm("圧縮データを破棄しますか？");
                if (confirmed) {
                    delete state.compressedSummary;
                    await dbUtils.saveChat(); // チャットを保存
                    // ボタンの表示を更新
                    if (typeof updateCompressButtonText === 'function') {
                        updateCompressButtonText();
                    }
                    // トークン表示を更新（圧縮データ削除後は非表示になる）
                    if (typeof tokenUtils !== 'undefined' && tokenUtils.updateTokenDisplay) {
                        tokenUtils.updateTokenDisplay();
                    }
                }
            }
        });
        
        // 戻るボタンは history.back() を使用
        elements.backToChatFromHistoryBtn.addEventListener('click', () => history.back());
        elements.backToChatFromPromptCheckBtn.addEventListener('click', () => history.back());
        elements.backToChatFromSettingsBtn.addEventListener('click', () => history.back());

        // チャットアクション
        elements.newChatBtn.addEventListener('click', async () => {
            this.confirmStartNewChat();
        });

        elements.sendButton.addEventListener('click', () => {
            if (state.isSending) this.abortRequest(); // 送信中なら中断
            else this.handleSend(); // そうでなければ送信
        });
        elements.userInput.addEventListener('input', () => uiUtils.adjustTextareaHeight()); // 入力時に高さ調整
        elements.userInput.addEventListener('keypress', (e) => {
            // Enterで送信 (Shift+Enterは除く)
            if (state.settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // デフォルトの改行動作を抑制
                if (!elements.sendButton.disabled) this.handleSend(); // 送信ボタンが有効なら送信
            }
        });

        // システムプロンプトUIアクション
        elements.systemPromptDetails.addEventListener('toggle', (event) => {
            if (event.target.open) {
                // 開いたときに編集モードに入る
                this.startEditSystemPrompt();
            } else if (state.isEditingSystemPrompt) {
                // 閉じられたときに編集中だったらキャンセル
                this.cancelEditSystemPrompt();
            }
        });
        elements.saveSystemPromptBtn.addEventListener('click', () => this.saveCurrentSystemPrompt());
        elements.cancelSystemPromptBtn.addEventListener('click', () => this.cancelEditSystemPrompt());
        elements.systemPromptEditor.addEventListener('input', () => {
            uiUtils.adjustTextareaHeight(elements.systemPromptEditor, 200); // 高さ調整
        });

        // 履歴アクション

        elements.importJsonBtn.addEventListener('click', () => elements.importJsonInput.click());
        elements.importJsonInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) this.importChatFromJson(file);
            event.target.value = null; // 同じファイルを選択できるようにリセット
        });

        // 設定アクション
        elements.saveSettingsBtns.forEach(button => {
            button.addEventListener('click', () => this.saveSettings());
        });
        elements.updateAppBtn.addEventListener('click', () => this.updateApp());
        elements.clearDataBtn.addEventListener('click', () => this.confirmClearAllData());
        
        // データバックアップ・復元アクション
        elements.backupDataBtn.addEventListener('click', () => this.backupAllData());
        elements.restoreDataBtn.addEventListener('click', () => this.restoreAllData());
        elements.restoreDataInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) this.handleRestoreFile(file);
            event.target.value = null; // 同じファイルを選択できるようにリセット
        });

        // ダークモード切り替えリスナー
        elements.darkModeToggle.addEventListener('change', () => {
            state.settings.darkMode = elements.darkModeToggle.checked; // stateを即時更新
            uiUtils.applyDarkMode(); // テーマを即時適用
            // 注意: 変更は「設定を保存」ボタンクリック時にDBに保存される
        });

            // 背景画像ボタンリスナー
        elements.uploadBackgroundBtn.addEventListener('click', () => elements.backgroundImageInput.click()); // ファイル選択ダイアログを開く
        elements.backgroundImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) this.handleBackgroundImageUpload(file);
            event.target.value = null; // 同じファイルを選択できるようにリセット
        });
        elements.deleteBackgroundBtn.addEventListener('click', () => this.confirmDeleteBackgroundImage());

        // SP非表示トグルリスナー
        elements.hideSystemPromptToggle.addEventListener('change', () => {
            state.settings.hideSystemPromptInChat = elements.hideSystemPromptToggle.checked;
            uiUtils.toggleSystemPromptVisibility(); // UIを即時更新
            // 注意: DBへの保存は「設定を保存」ボタンで行われる
        });

        // 圧縮プロンプト変更リスナー（トークン数リセット用）
        elements.compressionPromptTextarea.addEventListener('input', async () => {
            // 圧縮プロンプトが変更されたらトークン数をリセット
            state.settings.compressionPromptTokenCount = null;
            
            // IndexedDBにも保存
            try {
                await dbUtils.saveSetting('compressionPromptTokenCount', null);
                console.log('圧縮プロンプトのトークン数をIndexedDBでリセットしました');
            } catch (error) {
                console.error('圧縮プロンプトのトークン数リセットに失敗:', error);
            }
        });
        
        // --- メッセージクリックで操作ボックス表示/非表示 ---
        elements.messageContainer.addEventListener('click', (event) => {
            const clickedMessage = event.target.closest('.message');

            // 操作ボックス内のボタンがクリックされた場合は何もしない
            if (event.target.closest('.message-actions button, .message-cascade-controls button')) {
                return;
            }

            // クリックされたのがメッセージ要素の場合
            if (clickedMessage) {
                // すでに表示されている他のメッセージがあれば非表示にする
                const currentlyShown = elements.messageContainer.querySelector('.message.show-actions');
                if (currentlyShown && currentlyShown !== clickedMessage) {
                    currentlyShown.classList.remove('show-actions');
                }

                // クリックされたメッセージの表示状態をトグル
                // (編集中はトグルしないようにする)
                if (!clickedMessage.classList.contains('editing')) {
                    clickedMessage.classList.toggle('show-actions');
                }
            } else {
                // メッセージコンテナ内だがメッセージ要素以外がクリックされた場合
                // (メッセージ間の余白など)
                // 表示中の操作ボックスがあれば非表示にする
                const currentlyShown = elements.messageContainer.querySelector('.message.show-actions');
                if (currentlyShown) {
                    currentlyShown.classList.remove('show-actions');
                }
            }
        });

        // --- メッセージコンテナ外クリックで操作ボックスを非表示 ---
        document.body.addEventListener('click', (event) => {
            // クリックがメッセージコンテナの外で発生した場合
            if (!elements.messageContainer.contains(event.target)) {
                // 表示中の操作ボックスがあれば非表示にする
                const currentlyShown = elements.messageContainer.querySelector('.message.show-actions');
                if (currentlyShown) {
                    currentlyShown.classList.remove('show-actions');
                }
            }
            // メッセージコンテナ内のクリックは上記のリスナーで処理される
        }, true); 

        // スワイプイベントリスナー (チャット画面のみ)
        // passive: false にして preventDefault を呼べるようにする (必要に応じて)
        elements.chatScreen.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true }); // passive: trueのまま、moveで必要なら変更
        elements.chatScreen.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false }); // 横スワイプ判定時にpreventDefaultするため false
        elements.chatScreen.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // VisualViewport APIリスナー (ズーム状態監視)
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', this.updateZoomState.bind(this));
            window.visualViewport.addEventListener('scroll', this.updateZoomState.bind(this));
        } else {
            console.warn("VisualViewport API is not supported in this browser.");
            // フォールバックが必要な場合の処理 (例: ピンチジェスチャーを簡易的に検出するなど)
        }

        // popstate イベントリスナー (戻るボタン/ジェスチャー対応)
        window.addEventListener('popstate', this.handlePopState.bind(this));
        console.log("popstate listener added.");

        // タブボタンのイベントリスナー
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // ファイルアップロード関連のイベントリスナー
        elements.attachFileBtn.addEventListener('click', () => uiUtils.showFileUploadDialog());
        elements.selectFilesBtn.addEventListener('click', () => elements.fileInput.click());
            // fileInput の change イベントリスナー
        elements.fileInput.addEventListener('change', (event) => {
            this.handleFileSelection(event.target.files);
            // 処理が終わったら input の値をリセットする
            event.target.value = null;
        });

        // タブUIイベントリスナー
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // レスポンス置換管理イベントリスナー
        elements.addResponseReplacementBtn.addEventListener('click', () => {
            state.responseReplacerUI.add();
        });
        
        // ContextNote管理イベントリスナー
        elements.addContextNoteBtn.addEventListener('click', () => {
            this.addContextNote();
        });
        elements.confirmAttachBtn.addEventListener('click', () => this.confirmAttachment());
        elements.cancelAttachBtn.addEventListener('click', () => this.cancelAttachment());
        // ダイアログ自体を閉じた時もキャンセル扱い
        elements.fileUploadDialog.addEventListener('close', () => {
            if (elements.fileUploadDialog.returnValue !== 'ok') {
                this.cancelAttachment(); // OK以外で閉じたらキャンセル
            }
        });

        // 直接編集モーダルイベントリスナー
        elements.editContextNotesDirectlyBtn.addEventListener('click', () => this.openDirectEditModal());
        elements.closeDirectEditModal.addEventListener('click', () => this.closeDirectEditModal());
        elements.saveYamlBtn.addEventListener('click', () => this.saveYamlContent());
        elements.cancelYamlBtn.addEventListener('click', () => this.closeDirectEditModal());
        
        // モーダル外クリックで閉じる
        elements.directEditModal.addEventListener('click', (event) => {
            if (event.target === elements.directEditModal) {
                this.closeDirectEditModal();
            }
        });

        // ResponseReplacerUIのイベントリスナーを設定
        if (state.responseReplacerUI) {
            state.responseReplacerUI.setupEventListeners();
        }
    },

    // popstateイベントハンドラ (戻るボタン/ジェスチャー)
    handlePopState(event) {
        // 履歴スタックから遷移先の画面名を取得、なければチャット画面
        const targetScreen = event.state?.screen || 'chat';
        console.log(`popstate event fired: Navigating to screen '${targetScreen}' from history state.`);
        // showScreenを呼び出す (fromPopState = true を渡して履歴操作を抑制)
        uiUtils.showScreen(targetScreen, true);
    },

    // ズーム状態を更新
    updateZoomState() {
        if ('visualViewport' in window) {
            // スケールが閾値より大きい場合をズームとみなす
            const newZoomState = window.visualViewport.scale > ZOOM_THRESHOLD;
            if (state.isZoomed !== newZoomState) {
                state.isZoomed = newZoomState;
                console.log(`Zoom state updated: ${state.isZoomed}`);
                // ズーム状態に応じてbodyにクラスを追加/削除
                document.body.classList.toggle('zoomed', state.isZoomed);
            }
        }
    },

    // --- スワイプ処理 (ズーム対応) ---
    handleTouchStart(event) {
        if (!state.settings.enableSwipeNavigation) return;
        
        // マルチタッチ(ピンチ操作など)やズーム中はスワイプ開始点を記録しない
        if (event.touches.length > 1 || state.isZoomed) {
            state.touchStartX = 0; // 開始点をリセットしてスワイプ判定を無効化
            state.touchStartY = 0;
            state.isSwiping = false;
            return;
        }
        state.touchStartX = event.touches[0].clientX;
        state.touchStartY = event.touches[0].clientY;
        state.isSwiping = false; // スワイプ開始時はフラグをリセット
        state.touchEndX = state.touchStartX; // touchendで使えるように初期化
        state.touchEndY = state.touchStartY;
    },

    handleTouchMove(event) {
        if (!state.settings.enableSwipeNavigation) return;
        
        // 開始点がない、マルチタッチ、ズーム中は処理しない
        if (!state.touchStartX || event.touches.length > 1 || state.isZoomed) {
            return;
        }

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const diffX = state.touchStartX - currentX;
        const diffY = state.touchStartY - currentY;

        // 横方向の移動が縦方向より大きい場合にスワイプと判定
        // isSwipingフラグを立てるのは閾値を超えたときではなく、横移動が優位な場合
        if (Math.abs(diffX) > Math.abs(diffY)) {
            state.isSwiping = true;
            // 横スワイプ(画面遷移の可能性)中はデフォルトの縦スクロールを抑制
            // これにより、意図しない縦スクロールと画面遷移の競合を防ぐ
            event.preventDefault();
        } else {
            // 縦方向の移動が大きい場合はスワイプフラグを解除
            state.isSwiping = false;
        }
        // 現在位置を記録 (touchendで使うため)
        state.touchEndX = currentX;
        state.touchEndY = currentY;
    },

    handleTouchEnd(event) {
            if (!state.settings.enableSwipeNavigation) {
                this.resetSwipeState(); // 状態はリセットしておく
                return;
            }

            // ズーム状態を最終確認 (touchendまでに変わる可能性もあるため)
            this.updateZoomState();
            if (state.isZoomed) {
                console.log("Zoomed state detected on touchend, skipping swipe navigation.");
                this.resetSwipeState();
                return;
            }

            // スワイプ中でない、または開始点がない場合はリセットして終了
            if (!state.isSwiping || !state.touchStartX) {
                this.resetSwipeState();
                return;
            }

        const diffX = state.touchStartX - state.touchEndX;
        const diffY = state.touchStartY - state.touchEndY; // 縦移動量も一応計算

        // スワイプ距離が閾値を超えているか、かつ横移動が縦移動より大きいか
        if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) { // 左スワイプ (右から左へ) -> 設定画面へ
                console.log("左スワイプ検出 -> 設定画面へ");
                uiUtils.showScreen('settings'); // showScreenが履歴操作を行う
            } else { // 右スワイプ (左から右へ) -> 履歴画面へ
                console.log("右スワイプ検出 -> 履歴画面へ");
                uiUtils.showScreen('history'); // showScreenが履歴操作を行う
            }
        } else {
            // 閾値未満または縦移動が大きい場合は何もしない
            console.log("スワイプ距離不足 or 縦移動大");
        }

        this.resetSwipeState(); // スワイプ状態をリセット
    },

    resetSwipeState() {
        state.touchStartX = 0;
        state.touchStartY = 0;
        state.touchEndX = 0;
        state.touchEndY = 0;
        state.isSwiping = false;
    },
    // --- スワイプ処理ここまで ---


    // 新規チャット開始の確認と実行
    async confirmStartNewChat() {
        // 送信中なら中断確認
        if (state.isSending) {
            const confirmed = await uiUtils.showCustomConfirm("送信中です。中断して新規チャットを開始しますか？");
            if (!confirmed) return;
            this.abortRequest(); // 送信中断
        }
        // 編集中なら破棄確認
        if (state.editingMessageIndex !== null) {
            const confirmed = await uiUtils.showCustomConfirm("編集中です。変更を破棄して新規チャットを開始しますか？");
            if (!confirmed) return;
            const msgEl = elements.messageContainer.querySelector(`.message[data-index="${state.editingMessageIndex}"]`);
            this.cancelEditMessage(state.editingMessageIndex, msgEl); // 編集キャンセル
        }
        // システムプロンプト編集中なら破棄確認
        if (state.isEditingSystemPrompt) {
            const confirmed = await uiUtils.showCustomConfirm("システムプロンプト編集中です。変更を破棄して新規チャットを開始しますか？");
            if (!confirmed) return;
            this.cancelEditSystemPrompt();
        }
        
        // 保留中の添付ファイルがあれば破棄確認
        if (state.pendingAttachments.length > 0) {
            const confirmedAttach = await uiUtils.showCustomConfirm("添付準備中のファイルがあります。破棄して新規チャットを開始しますか？");
            if (!confirmedAttach) return;
            state.pendingAttachments = []; // 破棄
            uiUtils.updateAttachmentBadgeVisibility(); // バッジ状態更新
        }
        
        // 現在のチャットにメッセージまたはシステムプロンプトがあり、IDもあれば保存を試みる
        if ((state.currentMessages.length > 0 || state.currentSystemPrompt) && state.currentChatId) {
            try {
                await dbUtils.saveChat();
            } catch (error) {
                console.error("新規チャット開始前のチャット保存失敗:", error);
                const conf = await uiUtils.showCustomConfirm("現在のチャットの保存に失敗しました。新規チャットを開始しますか？");
                if (!conf) return; // 保存失敗時にキャンセルされたら中断
            }
        }

        // コンテキストノートとレスポンス置き換えの設定を引き継ぐか確認
        const hasContextNotes = state.contextNote && state.contextNote.getAllNotes().length > 1; // デフォルト仕様以外
        const hasResponseReplacements = state.responseReplacer && state.responseReplacer.getReplacements().length > 0;
        
        if (hasContextNotes || hasResponseReplacements) {
            const confirmed = await uiUtils.showCustomYesNo("このチャットのコンテキストノートとレスポンス置き換えの設定を引き継ぎますか？");

			if (confirmed) {
                await this.startNewChatWithSettings();
            } else {
                this.startNewChat();
            }
        } else {
            this.startNewChat();
        }
        uiUtils.showScreen('chat');
    },

    // 新規チャットを開始する (状態リセット)
    startNewChat() {
        console.log('startNewChat: 開始, 現在のID:', state.currentChatId);
        state.currentChatId = null; // IDリセット
        state.currentMessages = []; // メッセージクリア
        state.currentSystemPrompt = state.settings.systemPrompt; // デフォルトのシステムプロンプトを適用
        state.compressedSummary = null; // 圧縮データをリセット
        state.pendingAttachments = []; // 保留中の添付ファイルをクリア
        state.lastSentRequest = null; // 最後に送信したリクエスト内容をクリア
        
        state.responseReplacer = new ResponseReplacer();
        state.responseReplacerUI = new ResponseReplacerUI(state.responseReplacer, elements);
        this.responseReplacerUIInit();
        state.contextNote = new ContextNote();
        
        this.addDefaultContextNoteSpec();
        
        uiUtils.updateSystemPromptUI(); // システムプロンプトUI更新
        uiUtils.renderChatMessages(); // 表示クリア
        uiUtils.updateChatTitle(); // タイトルを「新規チャット」に
        elements.userInput.value = ''; // 入力欄クリア
        uiUtils.adjustTextareaHeight(); // 高さ調整
        uiUtils.setSendingState(false); // 送信状態リセット

        // 圧縮ボタンのテキストを更新
        if (typeof updateCompressButtonText === 'function') {
            updateCompressButtonText();
        }
    },

    // 設定を引き継いで新規チャットを開始する
    async startNewChatWithSettings() {
        console.log('startNewChatWithSettings: 開始, 現在のID:', state.currentChatId);

        // 現在の設定を深い複製でバックアップ
        const currentContextNotes = state.contextNote ? 
            JSON.parse(JSON.stringify(state.contextNote.getAllNotes())) : [];
        const currentResponseReplacements = state.responseReplacer ? 
            JSON.parse(JSON.stringify(state.responseReplacer.getReplacements())) : [];
        
        this.startNewChat();
        
        // コンテキストノートを引き継ぎ
        if (currentContextNotes.length > 1) {
            state.contextNote.clearNotes();
            
            currentContextNotes.forEach(note => {
                state.contextNote.addNote(note.type, note.title, note.content, note.keywords, note.category);
            });
        }
        
        // レスポンス置き換えを引き継ぎ
        if (currentResponseReplacements.length > 0) {
			currentResponseReplacements.forEach(replacement => {
                state.responseReplacer.addReplacement(replacement.pattern, replacement.replacement);
            });
        }
    },

    // 指定IDのチャットを読み込む
    async loadChat(id) {
        // 送信中なら中断確認
        if (state.isSending) {
            const confirmed = await uiUtils.showCustomConfirm("送信中です。中断して別のチャットを読み込みますか？");
            if (!confirmed) return;
            this.abortRequest();
        }
        // 編集中なら破棄確認
        if (state.editingMessageIndex !== null) {
            const confirmed = await uiUtils.showCustomConfirm("編集中です。変更を破棄して別のチャットを読み込みますか？");
            if (!confirmed) return;
            const msgEl = elements.messageContainer.querySelector(`.message[data-index="${state.editingMessageIndex}"]`);
            this.cancelEditMessage(state.editingMessageIndex, msgEl);
        }
        // システムプロンプト編集中なら破棄確認
        if (state.isEditingSystemPrompt) {
            const confirmed = await uiUtils.showCustomConfirm("システムプロンプト編集中です。変更を破棄して別のチャットを読み込みますか？");
            if (!confirmed) return;
            this.cancelEditSystemPrompt();
        }
        // 保留中の添付ファイルがあれば破棄確認
        if (state.pendingAttachments.length > 0) {
            const confirmedAttach = await uiUtils.showCustomConfirm("添付準備中のファイルがあります。破棄して別のチャットを読み込みますか？");
            if (!confirmedAttach) return;
            state.pendingAttachments = []; // 破棄
            uiUtils.updateAttachmentBadgeVisibility(); // バッジ状態更新
        }

        try {
            const chat = await dbUtils.getChat(id); // DBからチャット取得
            if (chat) {
                state.currentChatId = chat.id;
                // attachments も含めて読み込む (DBに保存されていれば)
                state.currentMessages = chat.messages?.map(msg => ({
                    ...msg,
                    attachments: msg.attachments || [] // attachmentsがなければ空配列
                })) || [];

                // --- カスケード応答の isSelected を正規化 ---
                let needsSave = false;
                const groupIds = new Set(state.currentMessages.filter(m => m.siblingGroupId).map(m => m.siblingGroupId));
                groupIds.forEach(gid => {
                    const siblings = state.currentMessages.filter(m => m.siblingGroupId === gid);
                    const selected = siblings.filter(m => m.isSelected);
                    if (selected.length === 0 && siblings.length > 0) {
                        // 選択されているものがない -> 最後のものを選択状態にする
                        siblings[siblings.length - 1].isSelected = true;
                        needsSave = true;
                    } else if (selected.length > 1) {
                        // 複数選択されている -> 最後のもの以外を解除
                        selected.slice(0, -1).forEach(m => m.isSelected = false);
                        needsSave = true;
                    }
                });
                // -----------------------------------------

                // システムプロンプトを読み込み (存在しなければデフォルトを使用)
                state.currentSystemPrompt = chat.systemPrompt !== undefined ? chat.systemPrompt : state.settings.systemPrompt;
                // 圧縮データを読み込み
                state.compressedSummary = chat.compressedSummary || null;
                // 最後に送信したリクエスト内容を読み込み
                state.lastSentRequest = chat.lastSentRequest || null;
                state.pendingAttachments = []; // 保留中の添付ファイルをクリア
                
                // レスポンス置換データを読み込み
                this.loadResponseReplacementsFromChat(chat);
                // ContextNoteデータを読み込み
                this.loadContextNotesFromChat(chat);
                uiUtils.updateSystemPromptUI(); // システムプロンプトUI更新
                uiUtils.renderChatMessages(); // メッセージ表示更新 (正規化された isSelected を反映)
                uiUtils.scrollToBottom(); // チャット切り替え時に最下部にスクロール
                uiUtils.updateChatTitle(chat.title); // タイトル更新
                elements.userInput.value = ''; // 入力欄クリア
                uiUtils.adjustTextareaHeight();
                uiUtils.setSendingState(false);

                // isSelected の正規化で変更があった場合、DBに保存
                if (needsSave) {
                    console.log("読み込み時に isSelected を正規化しました。DBに保存します。");
                    await dbUtils.saveChat();
                }

                // 読み込み成功後、履歴状態をチャット画面に設定 (戻るでアプリ終了を期待)
                // 既にチャット画面が表示されているはずなので replaceState でよい
                history.replaceState({ screen: 'chat' }, '', '#chat');
                state.currentScreen = 'chat';
                console.log("チャット読み込み完了:", id, "履歴状態を #chat に設定");
                // 圧縮ボタンのテキストを更新
                if (typeof updateCompressButtonText === 'function') {
                    updateCompressButtonText();
                }
            } else {
                // チャットが見つからない場合
                await uiUtils.showCustomAlert("チャット履歴が見つかりませんでした。");
                this.startNewChat(); // 新規チャットを開始
                uiUtils.showScreen('chat'); // チャット画面へ遷移させる
            }
        } catch (error) {
            await uiUtils.showCustomAlert(`チャットの読み込みエラー: ${error}`);
            this.startNewChat(); // エラー時も新規チャットへ
            uiUtils.showScreen('chat'); // チャット画面へ遷移させる
        }
    },

    // チャットを複製
    async duplicateChat(id) {
        // 送信中・編集中・他チャット保存の確認 (loadChatと同様)
        if (state.isSending) { const conf = await uiUtils.showCustomConfirm("送信中です。中断してチャットを複製しますか？"); if (!conf) return; this.abortRequest(); }
        if (state.editingMessageIndex !== null) { const conf = await uiUtils.showCustomConfirm("編集中です。変更を破棄してチャットを複製しますか？"); if (!conf) return; const msgEl = elements.messageContainer.querySelector(`.message[data-index="${state.editingMessageIndex}"]`); this.cancelEditMessage(state.editingMessageIndex, msgEl); }
        if (state.isEditingSystemPrompt) { const conf = await uiUtils.showCustomConfirm("システムプロンプト編集中です。変更を破棄してチャットを複製しますか？"); if (!conf) return; this.cancelEditSystemPrompt(); }
        if ((state.currentMessages.length > 0 || state.currentSystemPrompt) && state.currentChatId && state.currentChatId !== id) { try { await dbUtils.saveChat(); } catch (error) { console.error("複製前の現チャット保存失敗:", error); const conf = await uiUtils.showCustomConfirm("現在のチャット保存に失敗しました。複製を続行しますか？"); if (!conf) return; } }
        // 保留中の添付ファイルがあれば破棄確認
        if (state.pendingAttachments.length > 0) {
            const confirmedAttach = await uiUtils.showCustomConfirm("添付準備中のファイルがあります。破棄してチャットを複製しますか？");
            if (!confirmedAttach) return;
            state.pendingAttachments = []; // 破棄
        }

        try {
            const chat = await dbUtils.getChat(id); // 複製元を取得
            if (chat) {
                // 新しいタイトルを作成 (末尾のコピーサフィックスを除去して再度付与)
                const originalTitle = chat.title || "無題のチャット";
                const newTitle = originalTitle.replace(new RegExp(DUPLICATE_SUFFIX.replace(/([().])/g, '\\$1') + '$'), '').trim() + DUPLICATE_SUFFIX;

                // メッセージをディープコピーし、新しい siblingGroupId を生成
                const duplicatedMessages = [];
                const groupIdMap = new Map(); // 古いGroupId -> 新しいGroupId
                (chat.messages || []).forEach(msg => {
                    const newMsg = JSON.parse(JSON.stringify(msg)); // ディープコピー
                    // attachments もコピー (Base64データも含まれる)
                    newMsg.attachments = msg.attachments ? JSON.parse(JSON.stringify(msg.attachments)) : [];
                    // 新しいフラグもコピー (isSelected は後で調整)
                    newMsg.isCascaded = msg.isCascaded ?? false;
                    newMsg.isSelected = msg.isSelected ?? false;
                    if (msg.siblingGroupId) {
                        if (!groupIdMap.has(msg.siblingGroupId)) {
                            groupIdMap.set(msg.siblingGroupId, `dup-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
                        }
                        newMsg.siblingGroupId = groupIdMap.get(msg.siblingGroupId);
                    } else {
                        delete newMsg.siblingGroupId; // 元々なければ削除
                    }
                    duplicatedMessages.push(newMsg);
                });

                // 複製後の isSelected を正規化 (各グループの最後のものを選択)
                const newGroupIds = new Set(duplicatedMessages.filter(m => m.siblingGroupId).map(m => m.siblingGroupId));
                newGroupIds.forEach(gid => {
                    const siblings = duplicatedMessages.filter(m => m.siblingGroupId === gid);
                    siblings.forEach((m, idx) => {
                        m.isSelected = (idx === siblings.length - 1); // 最後のものだけ true
                    });
                });

                // 新しいチャットデータを作成
                const newChatData = {
                    messages: duplicatedMessages,
                    systemPrompt: chat.systemPrompt || '', // システムプロンプトもコピー
                    updatedAt: Date.now(), // 更新/作成日時は現在
                    // 最後に送信したリクエスト内容もコピー
                    ...(chat.lastSentRequest && { lastSentRequest: chat.lastSentRequest }),
                    createdAt: Date.now(),
                    title: newTitle,
                    // 圧縮データもコピー
                    ...(chat.compressedSummary && { compressedSummary: chat.compressedSummary }),
                                                // ContextNoteデータもコピー
                    ...(chat.contextNotes && { contextNotes: [...chat.contextNotes] })
                };
                // 新しいチャットとしてDBに追加
                const newChatId = await new Promise((resolve, reject) => {
                    const store = dbUtils._getStore(CHATS_STORE, 'readwrite');
                    const request = store.add(newChatData); // addで新規追加
                    request.onsuccess = (event) => resolve(event.target.result); // 新しいIDを返す
                    request.onerror = (event) => reject(event.target.error);
                });
                console.log("チャット複製完了:", id, "->", newChatId);
                // 履歴画面が表示されていればリストを更新、そうでなければアラート表示
                if (state.currentScreen === 'history') { // stateで判定
                    uiUtils.renderHistoryList();
                } else {
                    await uiUtils.showCustomAlert(`チャット「${newTitle}」を複製しました。`);
                }
            } else {
                await uiUtils.showCustomAlert("複製元のチャットが見つかりません。");
            }
        } catch (error) {
            await uiUtils.showCustomAlert(`チャット複製エラー: ${error}`);
        }
    },



    // チャット削除の確認と実行 (メッセージペア全体)
    async confirmDeleteChat(id, title) {
            const confirmed = await uiUtils.showCustomConfirm(`「${title || 'この履歴'}」を削除しますか？`);
            if (confirmed) {
            const isDeletingCurrent = state.currentChatId === id;
            const currentScreenBeforeDelete = state.currentScreen;

            try {
                // 1. DBから削除
                await dbUtils.deleteChat(id);
                console.log("チャット削除:", id);

                // 2. 表示中チャット削除なら内部状態リセット
                if (isDeletingCurrent) {
                    console.log("表示中のチャットが削除されたため、内部状態を新規チャットにリセット。");
                    this.startNewChat(); // pendingAttachments もクリアされる
                }

                // 3. 履歴画面での操作ならリストUI更新 & 状態リセット判定
                if (currentScreenBeforeDelete === 'history') { // stateで判定
                    console.log("履歴画面での操作のため、リストUIを更新します。");
                    await uiUtils.renderHistoryList(); // リストUIを更新
                    const listIsEmpty = elements.historyList.querySelectorAll('.history-item:not(.js-history-item-template)').length === 0;

                    // リストが空になった場合、内部状態をリセットする（念のため）
                    if (listIsEmpty) {
                        console.log("履歴リストが空になりました。");
                        if (!isDeletingCurrent) {
                            this.startNewChat();
                        }
                    }
                }

            } catch (error) {
                await uiUtils.showCustomAlert(`チャット削除エラー: ${error}`);
                uiUtils.setSendingState(false); // エラー時も送信状態解除
            }
        }
    },

    // 履歴アイテムのタイトルを編集
    async editHistoryTitle(chatId, titleElement) {
        const currentTitle = titleElement.textContent;
        const newTitle = await uiUtils.showCustomPrompt("新しいタイトル:", currentTitle); // newTitle は OK なら文字列、キャンセルなら ''

        // キャンセル時('')でなく、入力があり(trim後空でなく)、変更があった場合
        const trimmedTitle = (newTitle !== null) ? newTitle.trim() : '';

        if (newTitle !== '' && trimmedTitle !== '' && trimmedTitle !== currentTitle) {
            const finalTitle = trimmedTitle.substring(0, 100); // 100文字に制限
            try {
                await dbUtils.updateChatTitleDb(chatId, finalTitle); // DB更新
                // UI更新
                titleElement.textContent = finalTitle;
                titleElement.title = finalTitle; // ホバータイトルも更新
                // 更新日時も更新表示
                const dateElement = titleElement.closest('.history-item')?.querySelector('.updated-date');
                if(dateElement) dateElement.textContent = `更新: ${uiUtils.formatDate(Date.now())}`;
                // 現在表示中のチャットのタイトルが変更されたら、ヘッダーも更新
                if (state.currentChatId === chatId) {
                    uiUtils.updateChatTitle(finalTitle);
                }
            } catch (error) {
                await uiUtils.showCustomAlert(`タイトル更新エラー: ${error}`);
            }
        } else {
            // キャンセルまたは変更なし
            console.log("タイトル編集キャンセルまたは変更なし");
        }
    },

    // 送信処理 (リトライ時も使用)
    async handleSend(isRetry = false, retryUserMessageIndex = -1) {
        // --- 1. 送信前チェック ---
        if (state.editingMessageIndex !== null) { await uiUtils.showCustomAlert("他のメッセージを編集中です。"); return; }
        if (state.isEditingSystemPrompt) { await uiUtils.showCustomAlert("システムプロンプトを編集中です。"); return; }

        let text = '';
        let attachmentsToSend = [];
        if (isRetry) {
            const retryUserMessage = state.currentMessages[retryUserMessageIndex];
            if (!retryUserMessage || retryUserMessage.role !== 'user') {
                console.error("リトライ対象のユーザーメッセージが見つかりません。", retryUserMessageIndex);
                uiUtils.setSendingState(false);
                return;
            }
            text = retryUserMessage.content || '';
            attachmentsToSend = retryUserMessage.attachments ? [...retryUserMessage.attachments] : [];
        } else {
            text = elements.userInput.value.trim();
            attachmentsToSend = [...state.pendingAttachments];
        }

        if (state.isSending || (!text && attachmentsToSend.length === 0)) {
            if(!text && attachmentsToSend.length === 0) console.log("入力も添付ファイルもありません。");
            return;
        }
        if (!state.settings.apiKey) { await uiUtils.showCustomAlert("APIキーが設定されていません。設定画面を開きます。"); uiUtils.showScreen('settings'); return; }

        // --- 2. 送信状態設定とUI準備 ---
        uiUtils.setSendingState(true);
        // state.partialStreamContent と state.partialThoughtStreamContent は後で初期化

        let userMessageIndex = isRetry ? retryUserMessageIndex : -1;
        let existingSiblingGroupId = null;
        let firstResponseIndexForRetry = -1;
        let siblingGroupIdToUse = null;

        if (!isRetry) {
            const userMessage = {
                role: 'user',
                content: text,
                timestamp: Date.now(),
                attachments: attachmentsToSend
            };
            state.currentMessages.push(userMessage);
            userMessageIndex = state.currentMessages.length - 1;
            uiUtils.appendMessage(userMessage.role, userMessage.content, userMessageIndex, false, null, userMessage.attachments);
            elements.userInput.value = '';
            state.pendingAttachments = [];
            uiUtils.adjustTextareaHeight();
            uiUtils.scrollToBottom();

            // ContextNote機能: サマリーを2投目として画面上に表示
            try {
                if (state.contextNote && state.currentMessages.length === 1) {
                    console.log('ContextNoteサマリーを2投目として画面上に表示');
                    // システムメッセージとして表示
                    this.displayContextNoteSystemMessage();
                }
            } catch (error) {
                console.warn('ContextNoteサマリー表示エラー:', error);
            }
        } else {
            console.log("リトライ処理開始 (handleSend内):", state.currentMessages[userMessageIndex]);
            let siblingStartIndex = userMessageIndex + 1;
            while (siblingStartIndex < state.currentMessages.length && state.currentMessages[siblingStartIndex].role !== 'model') {
                siblingStartIndex++;
            }
            if (siblingStartIndex < state.currentMessages.length && state.currentMessages[siblingStartIndex].role === 'model') {
                    firstResponseIndexForRetry = siblingStartIndex;
                    const firstResponse = state.currentMessages[firstResponseIndexForRetry];
                    if (firstResponse.isCascaded && firstResponse.siblingGroupId) {
                        existingSiblingGroupId = firstResponse.siblingGroupId;
                        state.currentMessages.forEach(msg => {
                            if (msg.siblingGroupId === existingSiblingGroupId) {
                                msg.isSelected = false;
                            }
                        });
                        console.log(`リトライ: 既存の応答グループ (${existingSiblingGroupId}) の isSelected を false に設定.`);
                        siblingGroupIdToUse = existingSiblingGroupId;
                    } else {
                        console.log("リトライ: 最初の応答を新しいカスケードグループに含めます。");
                    }
            } else {
                console.warn("リトライ対象のユーザーメッセージの後にモデル応答が見つかりません。");
            }
        }

        // --- 3. 送信前チャット保存 ---
        try {
            let titleToSave = null;
            if(state.currentChatId) {
                const currentChat = await dbUtils.getChat(state.currentChatId);
                if(currentChat) titleToSave = currentChat.title;
            }
            if (!titleToSave) {
                const firstUserMsg = state.currentMessages.find(m => m.role === 'user');
                if(firstUserMsg) {
                    titleToSave = firstUserMsg.content.substring(0, 50);
                }
            }
            await dbUtils.saveChat(titleToSave);
        } catch (error) {
            console.error("送信前のチャット保存失敗:", error);
            uiUtils.displayError("チャットの保存に失敗しましたが、送信を試みます。", false);
        }

        // --- 4. APIリクエスト準備 ---
        const messagesToProcess = isRetry
            ? state.currentMessages.slice(0, userMessageIndex + 1)
            : [...state.currentMessages];

        // 基本メッセージ配列を構築
        let baseMessages = filterMessagesForApi(messagesToProcess)
            .map(msg => {
                const parts = [];
                if (msg.content && msg.content.trim() !== '') {
                    parts.push({ text: msg.content });
                }
                if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
                    msg.attachments.forEach(att => {
                        parts.push({
                            inlineData: {
                                mimeType: att.mimeType,
                                data: att.base64Data
                            }
                        });
                    });
                }
                return { role: msg.role, parts: parts };
            });

        // ContextNote機能: サマリーを動的に2投目として挿入
        if (state.contextNote && baseMessages.length >= 1) {
            const summaryString = state.contextNote.getAllNotesSummary();
            if (summaryString) {
                console.log('ContextNoteサマリーを2投目として動的挿入');
                baseMessages.splice(1, 0, {
                    role: 'user',
                    parts: [{ text: summaryString }]
                });
            }
        }

        // ContextNote機能: キーワードマッチングとランダム選択の結果を追加
        let matchedNotesResult = null;
        if (state.contextNote) {
            // 設定に基づいてContextNote対象のメッセージを取得
            let targetMessages = state.currentMessages
                .filter(msg => msg.role === 'user' || msg.role === 'model')
                .slice(-state.settings.contextNoteMessageCount); // 最新のN件を取得
            
            // 最初のユーザー発言を除外（最初のユーザーメッセージが含まれている場合）
            if (targetMessages.length > 0 && targetMessages[0].role === 'user') {
                targetMessages = targetMessages.slice(1);
            }
            
            // チャットのやり取りを文字列として取得
            let chatText = targetMessages
                .map(msg => msg.content)
                .join('\n');
            
            // 最大文字数で切り詰め（最新の方から）
            if (chatText.length > state.settings.contextNoteMaxChars) {
                chatText = chatText.slice(-state.settings.contextNoteMaxChars);
            }
            
            // マッチしたノートの文字列を取得（新しい設定を使用）
            matchedNotesResult = state.contextNote.getMatchedNotesString(
                chatText, 
                state.settings.contextNoteRandomFrequency,
                state.settings.contextNoteRandomCount
            );
            
            if (matchedNotesResult.text) {
                // 挿入優先度に基づいて挿入位置を決定
                const insertionIndex = calculateInsertionIndex(state.settings.contextNoteInsertionPriority, baseMessages);
                
                // マッチしたノートの内容を指定位置に挿入
                baseMessages.splice(insertionIndex, 0, {
                    role: CONTEXT_NOTE_ROLE,
                    parts: [{ text: `${REFERENCE_TAG_START}\n${matchedNotesResult.text}\n${REFERENCE_TAG_END}` }]
                });
            }
        }
        
        const dummyUserText = state.settings.enableDummyUser && state.settings.dummyUser?.trim();
        const dummyModelText = state.settings.enableDummyModel && state.settings.dummyModel?.trim();
        if (dummyUserText) baseMessages.push({ role: 'user', parts: [{ text: dummyUserText }] });
        if (dummyModelText) baseMessages.push({ role: 'model', parts: [{ text: dummyModelText }] });

        const generationConfig = {};
        if (state.settings.temperature !== null) generationConfig.temperature = state.settings.temperature;
        if (state.settings.maxTokens !== null) generationConfig.maxOutputTokens = state.settings.maxTokens;
        if (state.settings.topK !== null) generationConfig.topK = state.settings.topK;
        if (state.settings.topP !== null) generationConfig.topP = state.settings.topP;

        const systemInstruction = state.currentSystemPrompt?.trim()
            ? { role: "system", parts: [{ text: state.currentSystemPrompt.trim() }] }
            : null;

        // 圧縮機能を使用してメッセージ配列を構築
        console.log('=== 圧縮機能デバッグ ===');
        console.log('state.isCompressionMode:', state.isCompressionMode);
        console.log('state.compressedSummary:', state.compressedSummary);
        console.log('baseMessages:', baseMessages);

        const apiMessages = compressionUtils.buildMessagesForApi(baseMessages, state.isCompressionMode);
        
        console.log('最終的なapiMessages:', apiMessages);
        console.log('=== 圧縮機能デバッグ終了 ===');

        // リクエスト内容を保存（プロンプト確認用）
        const finalGenerationConfig = { ...generationConfig };
        if (state.settings.presencePenalty !== null) finalGenerationConfig.presencePenalty = state.settings.presencePenalty;
        if (state.settings.frequencyPenalty !== null) finalGenerationConfig.frequencyPenalty = state.settings.frequencyPenalty;
        
        if (state.settings.thinkingBudget !== null || state.settings.includeThoughts) {
            finalGenerationConfig.thinkingConfig = finalGenerationConfig.thinkingConfig || {};
            if (state.settings.thinkingBudget !== null && Number.isInteger(state.settings.thinkingBudget) && state.settings.thinkingBudget >= 0) {
                finalGenerationConfig.thinkingConfig.thinkingBudget = state.settings.thinkingBudget;
            }
            if (state.settings.includeThoughts) {
                finalGenerationConfig.thinkingConfig.includeThoughts = true;
            }
            if (Object.keys(finalGenerationConfig.thinkingConfig).length === 0) {
                delete finalGenerationConfig.thinkingConfig;
            }
        }

        const requestBody = {
            contents: apiMessages,
            ...(Object.keys(finalGenerationConfig).length > 0 && { generationConfig: finalGenerationConfig }),
            ...(systemInstruction && systemInstruction.parts && systemInstruction.parts.length > 0 && systemInstruction.parts[0].text && { systemInstruction }),
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        };

        if (state.settings.enableGrounding) {
            requestBody.tools = [{ "google_search": {} }];
        }

        // プロンプト確認用データを構築（実際のrequestBodyを使用）
        const promptData = buildPromptDataForCheck(requestBody);

		// ContextNoteロールをuserに戻す（API送信用）
        apiMessages.forEach(msg => {
            if (msg.role === CONTEXT_NOTE_ROLE) {
                msg.role = 'user';
            }
        });

        // 文字数情報を計算
        let compressionChars = 0;
        let contextNoteChars = 0;
        let contextNoteMatches = 0;
        
        // 圧縮サマリの文字数を計算
        if (state.compressedSummary) {
            const summaryContent = state.compressedSummary.summary || '';
            compressionChars = summaryContent.length;
        }
        
        // ContextNoteの文字数とマッチ数を取得
        if (matchedNotesResult && matchedNotesResult.text) {
            contextNoteChars = matchedNotesResult.charCount;
            contextNoteMatches = matchedNotesResult.matchCount;
        }
        
        // 送信リクエスト内容を保存（送信時刻と文字数情報も含める）
        state.lastSentRequest = {
            promptData: promptData, // プロンプト確認用データ
            sentAt: Date.now(),
            compressionChars: compressionChars,
            contextNoteChars: contextNoteChars,
            contextNoteMatches: contextNoteMatches
        };

        // --- 5. API呼び出しと応答処理 ---
        let modelResponseRawContent = '';
        let modelThoughtSummaryContent = '';
        let modelResponseMetadata = {}; // ここには最終的なメタデータが入る
        let currentGroundingMetadata = null; // ストリーム中の最新のgroundingMetadata
        let finalUsageMetadataFromStream = null; // ストリーム中の最新のusageMetadata

        try {
            // ローディングインジケータを表示
            uiUtils.setLoadingIndicator(true);
            
            const response = await apiUtils.callGeminiApi(apiMessages, generationConfig, systemInstruction);
            const dummyModelPrefix = (state.settings.concatDummyModel && state.settings.enableDummyModel && state.settings.dummyModel) ? state.settings.dummyModel : '';
            state.partialStreamContent = dummyModelPrefix; // プレフィックスを初期値に設定
            state.partialThoughtStreamContent = '';

            if (state.settings.streamingOutput) {
                const tempPlaceholderIndex = state.currentMessages.length;

                // ストリーミングプレースホルダーのDOMを直接生成
                const placeholderMessageDiv = document.createElement('div');
                placeholderMessageDiv.classList.add('message', 'model');
                placeholderMessageDiv.id = `streaming-message-${tempPlaceholderIndex}`;

                if (state.settings.includeThoughts) {
                    const thoughtDetails = document.createElement('details');
                    thoughtDetails.classList.add('thought-summary-details');
                    const thoughtSummaryElem = document.createElement('summary');
                    thoughtSummaryElem.textContent = '思考プロセス';
                    thoughtDetails.appendChild(thoughtSummaryElem);
                    const thoughtContentDiv = document.createElement('div');
                    thoughtContentDiv.classList.add('thought-summary-content');
                    thoughtContentDiv.id = `streaming-thought-summary-${tempPlaceholderIndex}`;
                    thoughtDetails.appendChild(thoughtContentDiv);
                    placeholderMessageDiv.appendChild(thoughtDetails);
                }
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('message-content');
                placeholderMessageDiv.appendChild(contentDiv);
                elements.messageContainer.appendChild(placeholderMessageDiv); // DOMに追加

                const streamSpeed = state.settings.streamingSpeed; // 表示速度を取得

                // 非同期ジェネレータを for await...of で処理
                for await (const streamData of apiUtils.handleStreamingResponse(response)) {
                    if (state.abortController?.signal.aborted) {
                        modelResponseMetadata.finishReason = 'ABORTED';
                        throw new Error("リクエストがキャンセルされました。");
                    }

                    if (streamData.type === 'chunk') { // 通常のチャンク
                        if (streamData.thoughtText) {
                            // 思考プロセスを1文字ずつ表示
                            for (const char of streamData.thoughtText) {
                                if (state.abortController?.signal.aborted) break; // ループ中断
                                state.partialThoughtStreamContent += char;
                                uiUtils.updateStreamingMessage(tempPlaceholderIndex, char, true); // newCharは実際には使わない
                                if (streamSpeed > 0) await sleep(streamSpeed);
                            }
                        }
                        if (streamData.contentText) {
                            // 通常コンテンツを1文字ずつ表示
                            for (const char of streamData.contentText) {
                                if (state.abortController?.signal.aborted) break; // ループ中断
                                state.partialStreamContent += char;
                                uiUtils.updateStreamingMessage(tempPlaceholderIndex, char, false); // newCharは実際には使わない
                                if (streamSpeed > 0) await sleep(streamSpeed);
                            }
                        }
                        if (state.abortController?.signal.aborted) { // 内部ループ中断後のチェック
                            modelResponseMetadata.finishReason = 'ABORTED';
                            throw new Error("リクエストがキャンセルされました。");
                        }
                        if (streamData.groundingMetadata) currentGroundingMetadata = streamData.groundingMetadata;
                        if (streamData.usageMetadata) finalUsageMetadataFromStream = streamData.usageMetadata;

                    } else if (streamData.type === 'metadata') { // ストリーム終了時のメタデータ
                        modelResponseMetadata = {
                            finishReason: streamData.finishReason,
                            safetyRatings: streamData.safetyRatings,
                        };
                        if (streamData.groundingMetadata) currentGroundingMetadata = streamData.groundingMetadata;
                        if (streamData.usageMetadata) finalUsageMetadataFromStream = streamData.usageMetadata;
                        console.log("ストリーム終了メタデータ受信:", streamData);
                        break;
                    } else if (streamData.type === 'error') { // ストリーム内エラー
                        modelResponseMetadata.finishReason = 'ERROR';
                        modelResponseMetadata.error = streamData.error;
                        throw new Error(streamData.message || "ストリーム内でエラーが発生しました。");
                    }
                }
                modelThoughtSummaryContent = state.partialThoughtStreamContent;
                modelResponseRawContent = state.partialStreamContent;

                if (modelResponseMetadata.finishReason === 'ABORTED' || state.abortController?.signal.aborted) {
                    throw new Error("リクエストがキャンセルされました。");
                }

            } else {
                const data = await response.json();
                console.log("API応答 (非ストリーミング):", data);
                const candidate = data.candidates?.[0];
                let rawContentFromApi = "";
                if (candidate) {
                    modelResponseMetadata = { finishReason: candidate.finishReason, safetyRatings: candidate.safetyRatings };
                    candidate.content?.parts?.forEach(part => {
                        if (part.thought === true) {
                            modelThoughtSummaryContent += (part.text || "") + "\n\n";
                        } else {
                            rawContentFromApi += (part.text || "") + "\n\n";
                        }
                    });
                    modelThoughtSummaryContent = modelThoughtSummaryContent.trim();
                    rawContentFromApi = rawContentFromApi.trim();

                    // レスポンス置換を適用
                    if (rawContentFromApi && state.responseReplacer && state.responseReplacer.replacements.length > 0) {
                        let replacedContent = rawContentFromApi;
                        for (const replacement of state.responseReplacer.replacements) {
                            try {
                                const regex = new RegExp(replacement.pattern, 'g');
                                replacedContent = replacedContent.replace(regex, replacement.replacement);
                            } catch (error) {
                                console.warn('レスポンス置換でエラー:', error, 'パターン:', replacement.pattern);
                            }
                        }
                        rawContentFromApi = replacedContent;
                    }

                    currentGroundingMetadata = candidate.groundingMetadata || null;
                    finalUsageMetadataFromStream = data.usageMetadata || null;
                    if (candidate.finishReason && candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
                        rawContentFromApi += `\n\n(理由: ${candidate.finishReason})`;
                    }
                    if (!rawContentFromApi && candidate.finishReason === "STOP" && !modelThoughtSummaryContent) {
                        rawContentFromApi = "(応答が空です)";
                    }
                } else {
                    rawContentFromApi = "応答候補がありません";
                    if(data.promptFeedback) {
                        rawContentFromApi += ` (理由: ${data.promptFeedback.blockReason || '不明'})`;
                        modelResponseMetadata.promptFeedback = data.promptFeedback;
                        modelResponseMetadata.finishReason = data.promptFeedback.blockReason || 'ERROR';
                    } else {
                        modelResponseMetadata.finishReason = 'ERROR';
                    }
                    finalUsageMetadataFromStream = data.usageMetadata || null;
                }
                modelResponseRawContent = dummyModelPrefix + rawContentFromApi;
            }

            if (modelResponseRawContent || modelThoughtSummaryContent || modelResponseMetadata.finishReason) {
                    const newModelMessage = {
                        role: 'model',
                        content: modelResponseRawContent,
                        thoughtSummary: modelThoughtSummaryContent || null,
                        timestamp: Date.now(),
                        ...modelResponseMetadata,
                        groundingMetadata: currentGroundingMetadata,
                        usageMetadata: finalUsageMetadataFromStream
                    };

                    const targetUserIndexForCascade = userMessageIndex;
                    if (targetUserIndexForCascade !== -1) {
                        if (siblingGroupIdToUse === null) {
                            siblingGroupIdToUse = `gid-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
                            console.log("カスケードフラグ設定: 新規 siblingGroupId を生成:", siblingGroupIdToUse);
                        }
                        newModelMessage.isCascaded = true;
                        newModelMessage.isSelected = true;
                        newModelMessage.siblingGroupId = siblingGroupIdToUse;

                        if (isRetry && firstResponseIndexForRetry !== -1 && state.currentMessages[firstResponseIndexForRetry] && !state.currentMessages[firstResponseIndexForRetry].isCascaded) {
                            state.currentMessages[firstResponseIndexForRetry].isCascaded = true;
                            state.currentMessages[firstResponseIndexForRetry].siblingGroupId = siblingGroupIdToUse;
                            console.log(`最初の応答 (index ${firstResponseIndexForRetry}) にフラグ設定: isCascaded=true, siblingGroupId=${siblingGroupIdToUse}`);
                        }
                        console.log(`応答にフラグ設定: isCascaded=true, isSelected=true, siblingGroupId=${newModelMessage.siblingGroupId}`);
                    }

                    state.currentMessages.push(newModelMessage);
                    if (state.settings.streamingOutput) {
                        uiUtils.finalizeStreamingMessage(state.currentMessages.length - 1);
                    } else {
                    uiUtils.renderChatMessages();
                    }
                    await dbUtils.saveChat();
                    console.log("モデル応答保存完了");
            } else {
                console.log("モデル応答コンテンツがないため保存しません。");
                    if (state.settings.streamingOutput) {
                    const tempPlaceholderIndex = state.currentMessages.length; // このインデックスは実際には使われないが、ID生成の元になった値
                    const placeholderElement = document.getElementById(`streaming-message-${tempPlaceholderIndex}`);
                    if (placeholderElement) placeholderElement.remove();
                    }
            }
        } catch (error) {
            console.error("Gemini呼び出し/処理中のエラー:", error);
            const isAbort = error.message === "リクエストがキャンセルされました。" || modelResponseMetadata.finishReason === 'ABORTED';
            const displayErrorMessage = isAbort ? error.message : (error.message || "不明なエラーが発生しました");

            const partialThoughtContentOnError = state.partialThoughtStreamContent;
            const partialContentOnError = state.partialStreamContent;

            if ((partialContentOnError || partialThoughtContentOnError) && state.settings.streamingOutput) {
                    const finalPartialContent = partialContentOnError + `\n\n(${isAbort ? '中断されました' : 'エラーが発生しました'})`;
                    const finalPartialThought = partialThoughtContentOnError ? partialThoughtContentOnError + `\n\n(${isAbort ? '中断されました' : 'エラーが発生しました'})` : null;

                    const partialMessage = {
                        role: 'model',
                        content: finalPartialContent,
                        thoughtSummary: finalPartialThought,
                        timestamp: Date.now(),
                        error: true,
                        finishReason: isAbort ? 'ABORTED' : (modelResponseMetadata.finishReason || 'ERROR'),
                        ...(modelResponseMetadata.safetyRatings && { safetyRatings: modelResponseMetadata.safetyRatings }),
                        groundingMetadata: currentGroundingMetadata,
                        usageMetadata: finalUsageMetadataFromStream
                    };
                    if (isRetry && isAbort) {
                        if (siblingGroupIdToUse === null) {
                            siblingGroupIdToUse = `gid-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
                            console.log("リトライ中断エラー: 新規 siblingGroupId を生成:", siblingGroupIdToUse);
                        } else {
                            console.log("リトライ中断エラー: 既存の siblingGroupId を使用:", siblingGroupIdToUse);
                        }
                        partialMessage.isCascaded = true;
                        partialMessage.siblingGroupId = siblingGroupIdToUse;
                        partialMessage.isSelected = true;
                        console.log(`リトライ中断エラー: 部分メッセージにカスケードフラグ設定 (gid: ${siblingGroupIdToUse})`);
                        if (firstResponseIndexForRetry !== -1 && state.currentMessages[firstResponseIndexForRetry] && !state.currentMessages[firstResponseIndexForRetry].isCascaded) {
                            state.currentMessages[firstResponseIndexForRetry].isCascaded = true;
                            state.currentMessages[firstResponseIndexForRetry].siblingGroupId = siblingGroupIdToUse;
                            console.log(`リトライ中断エラー: 最初の応答 (index ${firstResponseIndexForRetry}) にもフラグ設定: isCascaded=true, siblingGroupId=${siblingGroupIdToUse}`);
                        }
                    }
                    state.currentMessages.push(partialMessage);
                    try {
                        if (state.settings.streamingOutput) {
                            uiUtils.finalizeStreamingMessage(state.currentMessages.length - 1);
                        } else {
                            uiUtils.renderChatMessages();
                        }
                        await dbUtils.saveChat();
                        console.log("部分的なメッセージ状態を保存しました。");
                    } catch (saveError) {
                        console.error("部分メッセージの保存失敗:", saveError);
                        uiUtils.displayError(displayErrorMessage, !isAbort);
                    }
            } else {
                if (state.settings.streamingOutput && !isAbort) {
                    const tempPlaceholderIndex = state.currentMessages.length;
                    const placeholderElement = document.getElementById(`streaming-message-${tempPlaceholderIndex}`);
                    if (placeholderElement) placeholderElement.remove();
                }
                uiUtils.displayError(displayErrorMessage, !isAbort);
            }
        } finally {
            // --- 6. 送信後処理 ---
            uiUtils.setSendingState(false);
            // ローディングインジケータを非表示
            uiUtils.setLoadingIndicator(false);
            state.abortController = null;
            state.partialStreamContent = '';
            state.partialThoughtStreamContent = '';
            uiUtils.scrollToBottom();
            // 送信完了後にも念のためバッジ状態を更新
            uiUtils.updateAttachmentBadgeVisibility();
        }
    },

    // APIリクエストを中断
    abortRequest() {
        if (state.abortController) {
            console.log("中断リクエスト送信");
            state.abortController.abort(); // AbortControllerで中断
        } else {
            console.log("中断するアクティブなリクエストがありません。");
        }
    },


    // --- 背景画像ハンドラ ---
        // 背景画像アップロード処理
        async handleBackgroundImageUpload(file) {
            console.log("選択されたファイル:", file.name, file.type, file.size);
            const maxSize = 5 * 1024 * 1024; // 5MB制限 (例)
            if (file.size > maxSize) {
                await uiUtils.showCustomAlert(`画像サイズが大きすぎます (${(maxSize / 1024 / 1024).toFixed(1)}MB以下にしてください)`);
                return;
            }
            if (!file.type.startsWith('image/')) {
                await uiUtils.showCustomAlert("画像ファイルを選択してください (JPEG, PNG, GIF, WebPなど)");
                return;
            }
            try {
                uiUtils.revokeExistingObjectUrl(); // 既存URLを破棄
                const blob = file; // ファイルはBlobとして扱える
                // DBにBlobとして保存
                await dbUtils.saveSetting('backgroundImageBlob', blob);
                state.settings.backgroundImageBlob = blob; // stateにも反映
                // 新しいオブジェクトURLを作成して適用
                state.backgroundImageUrl = URL.createObjectURL(blob);
                document.documentElement.style.setProperty('--chat-background-image', `url(${state.backgroundImageUrl})`);
                uiUtils.updateBackgroundSettingsUI(); // UI更新
                console.log("背景画像を更新しました。");
                // アラートは不要 (変更は即時反映、DB保存は「設定を保存」で行う)
            } catch (error) {
                console.error("背景画像アップロード処理エラー:", error);
                await uiUtils.showCustomAlert(`背景画像の処理中にエラーが発生しました: ${error}`);
                // エラー時はリセット
                uiUtils.revokeExistingObjectUrl();
                document.documentElement.style.setProperty('--chat-background-image', 'none');
                state.settings.backgroundImageBlob = null;
                uiUtils.updateBackgroundSettingsUI();
            }
        },
        // 背景画像削除の確認
        async confirmDeleteBackgroundImage() {
            const confirmed = await uiUtils.showCustomConfirm("背景画像を削除しますか？");
            if (confirmed) {
                await this.handleBackgroundImageDelete();
            }
        },
        // 背景画像削除処理
        async handleBackgroundImageDelete() {
            try {
                uiUtils.revokeExistingObjectUrl(); // URL破棄
                // DBの値をnullで上書き
                await dbUtils.saveSetting('backgroundImageBlob', null);
                state.settings.backgroundImageBlob = null; // stateもnullに
                // スタイルとUIをリセット
                document.documentElement.style.setProperty('--chat-background-image', 'none');
                uiUtils.updateBackgroundSettingsUI();
                console.log("背景画像を削除しました。");
                // アラート不要
            } catch (error) {
                console.error("背景画像削除エラー:", error);
                await uiUtils.showCustomAlert(`背景画像の削除中にエラーが発生しました: ${error}`);
            }
        },
        // -------------------------------

    // 設定を保存
    async saveSettings() {
            // UIから値を取得 (背景Blobは別途処理済みなので除く)
            const newSettings = {
                apiKey: elements.apiKeyInput.value.trim(),
                modelName: elements.modelNameSelect.value,
                streamingOutput: elements.streamingOutputCheckbox.checked,
                streamingSpeed: elements.streamingSpeedInput.value === '' ? AppConfig.DEFAULTS.streamingSpeed : parseInt(elements.streamingSpeedInput.value),
                systemPrompt: elements.systemPromptDefaultTextarea.value.trim(), // デフォルト用
                temperature: elements.temperatureInput.value === '' ? null : parseFloat(elements.temperatureInput.value),
                maxTokens: elements.maxTokensInput.value === '' ? null : parseInt(elements.maxTokensInput.value),
                topK: elements.topKInput.value === '' ? null : parseInt(elements.topKInput.value),
                topP: elements.topPInput.value === '' ? null : parseFloat(elements.topPInput.value),
                presencePenalty: elements.presencePenaltyInput.value === '' ? null : parseFloat(elements.presencePenaltyInput.value),
                frequencyPenalty: elements.frequencyPenaltyInput.value === '' ? null : parseFloat(elements.frequencyPenaltyInput.value),
                thinkingBudget: elements.thinkingBudgetInput.value === '' ? null : parseInt(elements.thinkingBudgetInput.value, 10),
                includeThoughts: elements.includeThoughtsToggle.checked, // Include Thoughts 設定を取得
                dummyUser: elements.dummyUserInput.value.trim(),
                dummyModel: elements.dummyModelInput.value.trim(),
                enableDummyUser: elements.enableDummyUserToggle.checked, // ダミーUser有効化設定を取得
                enableDummyModel: elements.enableDummyModelToggle.checked, // ダミーModel有効化設定を取得
                concatDummyModel: elements.concatDummyModelCheckbox.checked,
                additionalModels: elements.additionalModelsTextarea.value.trim(),
                pseudoStreaming: elements.pseudoStreamingCheckbox.checked,
                enterToSend: elements.enterToSendCheckbox.checked,
                historySortOrder: elements.historySortOrderSelect.value,
                darkMode: elements.darkModeToggle.checked,
                fontFamily: elements.fontFamilyInput.value.trim(), // フォント設定を取得
                hideSystemPromptInChat: elements.hideSystemPromptToggle.checked, // SP非表示設定
                enableGrounding: elements.enableGroundingToggle.checked, // ネット検索設定を取得
                enableSwipeNavigation: elements.swipeNavigationToggle.checked,//スワイプナビゲーション設定を取得
                debugVirtualSend: elements.debugVirtualSendToggle.checked, // デバッグ用仮想送信設定を取得
                debugVirtualResponse: elements.debugVirtualResponseTextarea.value.trim(), // デバッグ用仮想送信の返答を取得
                // コンテキスト圧縮設定を取得
                compressionMode: state.isCompressionMode,
                compressionPrompt: elements.compressionPromptTextarea.value.trim(),
                keepFirstMessages: elements.keepFirstMessagesInput.value === '' ? AppConfig.DEFAULTS.keepFirstMessages : parseInt(elements.keepFirstMessagesInput.value),
                keepLastMessages: elements.keepLastMessagesInput.value === '' ? AppConfig.DEFAULTS.keepLastMessages : parseInt(elements.keepLastMessagesInput.value),
                // ContextNote設定を取得
                contextNoteRandomFrequency: elements.contextNoteRandomFrequencyInput.value === '' ? AppConfig.DEFAULTS.contextNoteRandomFrequency : parseFloat(elements.contextNoteRandomFrequencyInput.value),
                contextNoteRandomCount: elements.contextNoteRandomCountInput.value === '' ? AppConfig.DEFAULTS.contextNoteRandomCount : parseInt(elements.contextNoteRandomCountInput.value),
                contextNoteMessageCount: elements.contextNoteMessageCountInput.value === '' ? AppConfig.DEFAULTS.contextNoteMessageCount : parseInt(elements.contextNoteMessageCountInput.value),
                contextNoteMaxChars: elements.contextNoteMaxCharsInput.value === '' ? AppConfig.DEFAULTS.contextNoteMaxChars : parseInt(elements.contextNoteMaxCharsInput.value),
                contextNoteInsertionPriority: elements.contextNoteInsertionPriorityInput.value === '' ? AppConfig.DEFAULTS.contextNoteInsertionPriority : parseInt(elements.contextNoteInsertionPriorityInput.value),
            };

            try {
                const oldSortOrder = state.settings.historySortOrder; // 更新前のソート順を保持

                // 各設定をDBに保存 (背景Blobは除く)
                const promises = Object.entries(newSettings).map(([key, value]) =>
                    dbUtils.saveSetting(key, value)
                );
                await Promise.all(promises);

                // stateをバリデーション後の値で更新 (背景Blobは既にstateにある)
                state.settings = { ...state.settings, ...newSettings };

                // 全設定をUIに再適用 (バリデーションで修正された値も反映)
                uiUtils.applySettingsToUI();
                // applyDarkMode, applyFontFamily, toggleSystemPromptVisibility は applySettingsToUI内で呼ばれる

                console.log("設定保存成功:", { ...state.settings, backgroundImageBlob: state.settings.backgroundImageBlob ? '[Blob]' : null });
                await uiUtils.showCustomAlert("設定を保存しました。");

                // ソート順が変更され、履歴画面が表示中ならリストを再描画
                if (newSettings.historySortOrder !== oldSortOrder && state.currentScreen === 'history') {
                    uiUtils.renderHistoryList();
                }
            } catch (error) {
                await uiUtils.showCustomAlert(`設定の保存中にエラーが発生しました: ${error}`);
            }
    },

    // アプリを更新 (キャッシュクリア)
    async updateApp() {
        // Service Workerが利用可能かチェック
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
            await uiUtils.showCustomAlert("Service Workerが検出されませんでした。ページをリロードしてから再試行してください。");
            return;
        }
        const confirmed = await uiUtils.showCustomConfirm("アプリのキャッシュをクリアして最新版を再取得しますか？ (ページがリロードされます)");
        if (confirmed) {
            // Service Workerにキャッシュクリアメッセージを送信
            navigator.serviceWorker.ready.then(reg => {
                if (reg.active) {
                    reg.active.postMessage({ action: 'clearCache' });
                    // リロードはService Workerからの応答メッセージで行う
                } else {
                    uiUtils.showCustomAlert("アクティブなService Workerが見つかりません。手動でリロードが必要かもしれません。");
                }
            }).catch(async err => {
                await uiUtils.showCustomAlert("Service Workerの準備中にエラーが発生しました。");
            });
        }
    },

    // 全データ削除の確認と実行
    async confirmClearAllData() {
        const confirmed = await uiUtils.showCustomConfirm("本当にすべてのデータ（チャット履歴と設定）を削除しますか？この操作は元に戻せません。");
        if (confirmed) {
            try {
                uiUtils.revokeExistingObjectUrl(); // 背景画像のURLを破棄
                await dbUtils.clearAllData(); // DBの全データをクリア
                await uiUtils.showCustomAlert("すべてのデータが削除されました。アプリをリセットします。");

                // stateを完全に初期デフォルト状態にリセット
                state.currentChatId = null;
                state.currentMessages = [];
                state.currentSystemPrompt = ''; // システムプロンプトもリセット
                state.pendingAttachments = [];
                state.settings = { ...AppConfig.DEFAULTS };
                state.backgroundImageUrl = null;

                // リセットされた状態をUIに適用
                document.documentElement.style.setProperty('--chat-background-image', 'none'); // 背景スタイルリセット
                uiUtils.applySettingsToUI(); // 設定UIをリセット (ダークモード、背景UI、フォント、SP表示含む)
                uiUtils.updateAttachmentBadgeVisibility(); // バッジ状態更新
                this.startNewChat(); // 新規チャット状態にする (履歴状態もリセットされる)
                uiUtils.showScreen('chat', true); // popstate経由ではないが履歴操作はstartNewChatに任せる
            } catch (error) {
                await uiUtils.showCustomAlert(`データ削除中にエラーが発生しました: ${error}`);
            }
        }
    },

    // --- システムプロンプト編集 ---
    startEditSystemPrompt() {
        if (state.isSending) return; // 送信中は編集不可
        state.isEditingSystemPrompt = true;
        elements.systemPromptEditor.value = state.currentSystemPrompt; // 現在の値で初期化
        uiUtils.adjustTextareaHeight(elements.systemPromptEditor, 200);
        elements.systemPromptEditor.focus();
        console.log("システムプロンプト編集開始");
    },
    async saveCurrentSystemPrompt() {
        const newPrompt = elements.systemPromptEditor.value.trim();
        if (newPrompt !== state.currentSystemPrompt) {
            state.currentSystemPrompt = newPrompt;
            try {
                await dbUtils.saveChat(); // 現在のチャットを保存 (SP含む)
                console.log("システムプロンプト保存完了");
            } catch (error) {
                await uiUtils.showCustomAlert("システムプロンプトの保存に失敗しました。");
                // エラー時は元の値に戻す？ UIはそのままにする？ -> UIはそのまま
            }
        }
        state.isEditingSystemPrompt = false;
        elements.systemPromptDetails.removeAttribute('open'); // detailsを閉じる
    },
    cancelEditSystemPrompt() {
        state.isEditingSystemPrompt = false;
        elements.systemPromptEditor.value = state.currentSystemPrompt; // 元の値に戻す
        elements.systemPromptDetails.removeAttribute('open'); // detailsを閉じる
        uiUtils.adjustTextareaHeight(elements.systemPromptEditor, 200);
        console.log("システムプロンプト編集キャンセル");
    },
    // -----------------------------

    // --- メッセージアクション ---
    // メッセージ編集開始
    async startEditMessage(index, messageElement) {
            // 送信中は編集不可
            if (state.isSending) {
                await uiUtils.showCustomAlert("送信中は編集できません。");
                return;
            }
            // 他のメッセージを編集中なら警告
            if (state.editingMessageIndex !== null && state.editingMessageIndex !== index) {
                await uiUtils.showCustomAlert("他のメッセージを編集中です。");
                return;
            }
            // システムプロンプト編集中なら警告
            if (state.isEditingSystemPrompt) {
                await uiUtils.showCustomAlert("システムプロンプトを編集中です。");
                return;
            }
            // すでに編集中ならフォーカスするだけ
            if (state.editingMessageIndex === index) {
                messageElement.querySelector('.edit-textarea')?.focus();
                return;
            }

            const message = state.currentMessages[index];
            if (!message) return; // メッセージデータがない場合は中断

            const rawContent = message.content; // 元のテキスト
            state.editingMessageIndex = index; // 編集中インデックスを設定

            const contentDiv = messageElement.querySelector('.message-content');
            const editArea = messageElement.querySelector('.message-edit-area');
            const cascadeControls = messageElement.querySelector('.message-cascade-controls'); // 上部コントロール
            editArea.innerHTML = ''; // 編集エリアをクリア

            let horizontalPadding = 0;
            try {// パディング計算
                const computedStyle = window.getComputedStyle(messageElement);
                const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
                const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
                horizontalPadding = paddingLeft + paddingRight;
            } catch (e) {
                console.error("幅の動的計算中にエラー:", e);
            }
            messageElement.style.width = `calc(var(--message-max-width) + ${horizontalPadding}px + 17px)`/*17pxは決め打ち。対処療法*/;

            // テキストエリア作成
            const textarea = document.createElement('textarea');
            textarea.value = rawContent;
            textarea.classList.add('edit-textarea');
            textarea.rows = 3; // 初期行数
            // textarea.oninput = () => uiUtils.adjustTextareaHeight(textarea, 400); // 入力で高さ調整 (最大400px)
			// 一番下のメッセージを編集するときに、チャット欄のスクロールバーのカクツキが発生するため、コメントアウト

            // アクションボタンエリア作成
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('message-edit-actions');

            // 保存ボタン
            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.classList.add('save-edit-btn');
            saveButton.onclick = () => this.saveEditMessage(index, messageElement);

            // キャンセルボタン
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'キャンセル';
            cancelButton.classList.add('cancel-edit-btn');
            cancelButton.onclick = () => this.cancelEditMessage(index, messageElement);

            actionsDiv.appendChild(saveButton);
            actionsDiv.appendChild(cancelButton);
            editArea.appendChild(textarea);
            editArea.appendChild(actionsDiv);

            // UI切り替え
            messageElement.classList.add('editing'); // 編集中クラス追加
            if(contentDiv) contentDiv.classList.add('hidden'); // 元のコンテンツ非表示
            if(cascadeControls) cascadeControls.classList.add('hidden'); // 上部コントロール非表示
            editArea.classList.remove('hidden'); // 編集エリア表示

            // 初期高さ調整とフォーカス
            uiUtils.adjustTextareaHeight(textarea, 400);
            textarea.focus();
            textarea.select(); // テキスト全選択
    },

    // メッセージ編集を保存
    async saveEditMessage(index, messageElement) {
        const textarea = messageElement.querySelector('.edit-textarea');
        if (!textarea) { // テキストエリアが見つからない場合はキャンセル扱い
            this.cancelEditMessage(index, messageElement);
            return;
        }
        const newRawContent = textarea.value.trim(); // 新しいテキスト (前後の空白除去)
        const originalMessage = state.currentMessages[index];

        // 内容に変更がない場合はキャンセルと同じ動作
        if (newRawContent === originalMessage.content) {
            this.cancelEditMessage(index, messageElement);
            return;
        }

        // stateのメッセージ内容を更新
        originalMessage.content = newRawContent;
        originalMessage.timestamp = Date.now(); // 更新日時を更新
        delete originalMessage.error; // エラーフラグがあれば削除

        // UIのメッセージ内容を更新
        const contentDiv = messageElement.querySelector('.message-content');
        if(contentDiv && typeof marked !== 'undefined' && originalMessage.role === 'model') { // モデルメッセージのみMarkdown
            try {
                contentDiv.innerHTML = marked.parse(newRawContent || ''); // Markdownパース
            } catch (e) {
                console.error("編集保存時のMarkdownパースエラー:", e);
                contentDiv.textContent = newRawContent; // エラー時はテキスト表示
            }
        } else if (contentDiv) { // ユーザーメッセージ or markedなし
            const pre = contentDiv.querySelector('pre') || document.createElement('pre');
            pre.textContent = newRawContent;
            if(!contentDiv.querySelector('pre')) {
                contentDiv.innerHTML = ''; // 既存内容をクリア
                contentDiv.appendChild(pre);
            }
        }

        this.finishEditing(messageElement); // 編集UIを終了

        // 最初のユーザーメッセージが編集された場合、タイトル更新が必要かチェック
        let requiresTitleUpdate = (index === state.currentMessages.findIndex(m => m.role === 'user'));
        try {
            // タイトル更新が必要なら新しいタイトルを生成して保存
            let newTitleForSave = null;
            if (requiresTitleUpdate) {
                newTitleForSave = newRawContent.substring(0, 50) || "無題のチャット"; // SPは参照しない
            }
            await dbUtils.saveChat(newTitleForSave);
            // UIのタイトルも更新
            if (requiresTitleUpdate) {
                uiUtils.updateChatTitle(newTitleForSave);
            }
            console.log("メッセージ編集後にチャット保存:", index);
        } catch (error) {
            await uiUtils.showCustomAlert("メッセージ編集後のチャット保存に失敗しました。");
        }
    },
    // メッセージ編集をキャンセル
    cancelEditMessage(index, messageElement = null) {
            // 要素が渡されていない場合は検索
            if (!messageElement) {
                messageElement = elements.messageContainer.querySelector(`.message[data-index="${index}"]`);
            }
            if (messageElement) {
                this.finishEditing(messageElement); // 編集UIを終了
            } else if (state.editingMessageIndex === index) {
                // 要素が見つからなくても、編集中インデックスが一致すればリセット
                state.editingMessageIndex = null;
                console.log("編集キャンセル: 要素が見つかりませんでしたがインデックスをリセット:", index);
            }
    },
    // 編集UIを終了する共通処理
    finishEditing(messageElement) {
        if (!messageElement) return;
        const editArea = messageElement.querySelector('.message-edit-area');
        const contentDiv = messageElement.querySelector('.message-content');
        const cascadeControls = messageElement.querySelector('.message-cascade-controls'); // 上部コントロール
        const textarea = messageElement.querySelector('.edit-textarea');

        messageElement.style.removeProperty('width');

        messageElement.classList.remove('editing'); // 編集中クラス削除
        if(contentDiv) contentDiv.classList.remove('hidden'); // 元のコンテンツ表示
        if(cascadeControls) cascadeControls.classList.remove('hidden'); // 上部コントロール再表示
        if(editArea) { // 編集エリアを非表示にして内容クリア
            editArea.classList.add('hidden');
            editArea.innerHTML = '';
        }

        // 編集中インデックスをリセット
        const index = parseInt(messageElement.dataset.index, 10);
        if (state.editingMessageIndex === index) {
            state.editingMessageIndex = null;
            console.log("編集終了:", index);
        }
    },

    // メッセージを削除 (会話ターン全体)
    async deleteMessage(index) {
        // 編集中、送信中、システムプロンプト編集中は削除不可 (既存のチェック)
        if (state.editingMessageIndex === index) {
            this.cancelEditMessage(index);
        }
        if (state.isSending) {
            await uiUtils.showCustomAlert("送信中は削除できません。");
            return;
        }
        if (state.isEditingSystemPrompt) {
            await uiUtils.showCustomAlert("システムプロンプト編集中は削除できません。");
            return;
        }
        if (index < 0 || index >= state.currentMessages.length) {
                if (index === -1) {
                    console.log("一時的なメッセージ（インデックス-1）の削除は表示のみで処理されます");
                } else {
                    console.error("削除対象のインデックスが無効:", index);
                }
                return;
        }

        const messageToDelete = state.currentMessages[index];
        const messageContentPreview = messageToDelete.content.substring(0, 30) + "...";
        let confirmMessage = "";
        let deleteTargetDescription = ""; // 削除対象の説明（ログ用）
        let indicesToDelete = []; // 削除対象のインデックスリスト

        // --- 削除範囲と確認メッセージを決定 ---
        if (messageToDelete.role === 'model' && messageToDelete.isCascaded && messageToDelete.siblingGroupId) {
            // **ケース1: カスケードモデル応答グループ全体**
            const groupId = messageToDelete.siblingGroupId;
            const siblings = state.currentMessages.filter(msg => msg.role === 'model' && msg.isCascaded && msg.siblingGroupId === groupId);
            indicesToDelete = state.currentMessages
                .map((msg, i) => (msg.role === 'model' && msg.isCascaded && msg.siblingGroupId === groupId) ? i : -1)
                .filter(i => i !== -1);

            confirmMessage = `「${messageContentPreview}」を含む応答グループ全体 (${siblings.length}件) を削除しますか？`;
            deleteTargetDescription = `カスケードグループ (gid: ${groupId}, ${indicesToDelete.length}件)`;
        } else {
            // **ケース2: 単一メッセージ (ユーザー入力 or 非カスケードモデル応答)**
            indicesToDelete.push(index);
            confirmMessage = `メッセージ「${messageContentPreview}」(${messageToDelete.role}) を削除しますか？`;
            deleteTargetDescription = `単一メッセージ (index: ${index}, role: ${messageToDelete.role})`;
        }

        // --- 削除実行 ---
        const confirmed = await uiUtils.showCustomConfirm(confirmMessage);
        if (confirmed) {
            console.log(`削除実行: ${deleteTargetDescription}`);
            const originalFirstUserMsgIndex = state.currentMessages.findIndex(m => m.role === 'user');

            // stateからメッセージを削除 (インデックスが大きい方から削除してズレを防ぐ)
            indicesToDelete.sort((a, b) => b - a).forEach(idx => {
                state.currentMessages.splice(idx, 1);
            });
            console.log(`メッセージ削除完了 (state)。削除件数: ${indicesToDelete.length}`);

            // --- UI再描画 ---
            uiUtils.renderChatMessages();
            // カスケードグループ削除後は操作ボックスの再表示は不要

            // --- タイトル更新とDB保存 ---
            const newFirstUserMsgIndex = state.currentMessages.findIndex(m => m.role === 'user');
            // タイトル更新が必要か判断 (元の最初のユーザーメッセージが削除範囲に含まれていた場合)
            let requiresTitleUpdate = indicesToDelete.includes(originalFirstUserMsgIndex);

            try {
                let newTitleForSave = null;
                const currentChatData = state.currentChatId ? await dbUtils.getChat(state.currentChatId) : null;

                if (requiresTitleUpdate) {
                    const newFirstUserMessage = newFirstUserMsgIndex !== -1 ? state.currentMessages[newFirstUserMsgIndex] : null;
                    newTitleForSave = newFirstUserMessage ? newFirstUserMessage.content.substring(0, 50) : "無題のチャット";
                } else if (currentChatData) {
                    newTitleForSave = currentChatData.title;
                }

                await dbUtils.saveChat(newTitleForSave);

                if (requiresTitleUpdate) {
                    uiUtils.updateChatTitle(newTitleForSave);
                }

                if (state.currentMessages.length === 0 && !state.currentSystemPrompt && state.currentChatId) {
                    console.log("チャットが空になったためリセットします。");
                    this.startNewChat();
                }
            } catch (error) {
                console.error("メッセージ削除後のチャット保存/取得エラー:", error);
                await uiUtils.showCustomAlert("メッセージ削除後のチャット保存に失敗しました。");
            }
        } else {
                console.log("削除キャンセル");
        }
    },

    
    // 指定メッセージからリトライ
    async retryFromMessage(index) {
        // 編集中は不可
        if (state.editingMessageIndex !== null) {
            await uiUtils.showCustomAlert("編集中はリトライできません。");
            return;
        }
        // 送信中は不可
        if (state.isSending) {
            await uiUtils.showCustomAlert("送信中です。");
            return;
        }
        // システムプロンプト編集中は不可
        if (state.isEditingSystemPrompt) {
            await uiUtils.showCustomAlert("システムプロンプト編集中はリトライできません。");
            return;
        }
        const userMessage = state.currentMessages[index];
        // ユーザーメッセージ以外からはリトライ不可
        if (!userMessage || userMessage.role !== 'user') return;

        // リトライ処理を直接実行
        console.log(`リトライ開始: index=${index}`);

        // --- 後続の不要な履歴を削除する処理 ---
        let deleteStartIndex = -1;
        let scanIndex = index + 1; // リトライ対象ユーザーメッセージの次から開始

        // 保持すべきモデル応答群の siblingGroupId を特定
        let targetSiblingGroupId = null;
        if (scanIndex < state.currentMessages.length && state.currentMessages[scanIndex].role === 'model') {
            // 最初のモデル応答が存在する場合、その siblingGroupId を取得
            targetSiblingGroupId = state.currentMessages[scanIndex].siblingGroupId || null; // groupId がない場合は null
            console.log(`保持対象の siblingGroupId: ${targetSiblingGroupId}`);
        }

        // targetSiblingGroupId に一致するモデル応答群をスキップ
        if (targetSiblingGroupId !== null) { // siblingGroupId がある場合
            while (
                scanIndex < state.currentMessages.length &&
                state.currentMessages[scanIndex].role === 'model' &&
                state.currentMessages[scanIndex].siblingGroupId === targetSiblingGroupId
            ) {
                scanIndex++;
            }
        } else { // 最初のモデル応答に siblingGroupId がない場合 (isCascaded=false など)
            if (scanIndex < state.currentMessages.length && state.currentMessages[scanIndex].role === 'model') {
                // 最初のモデル応答のみスキップ (グループ化されていない)
                scanIndex++;
            }
            // それ以降は siblingGroupId が一致しないのでループに入らない
        }
        // scanIndex は、保持すべきモデル応答群の次のインデックス、または配列の終端を指す

        // 削除開始インデックスを決定
        if (scanIndex < state.currentMessages.length) {
            // 配列の終端でなければ、scanIndex が削除開始位置
            deleteStartIndex = scanIndex;
        }
        // scanIndex が配列の終端なら deleteStartIndex は -1 のまま (削除不要)

        if (deleteStartIndex !== -1) {
            const deletedCount = state.currentMessages.length - deleteStartIndex;
            console.log(`インデックス ${deleteStartIndex} 以降の ${deletedCount} 件の履歴を削除します。`);
            state.currentMessages.splice(deleteStartIndex); // deleteStartIndex 以降をすべて削除
        } else {
            console.log("削除対象となる未来の会話履歴はありませんでした。");
        }
        // --- 削除処理ここまで ---

        // UIを更新 (削除された状態を表示)
        uiUtils.renderChatMessages();
        uiUtils.scrollToBottom(); // 削除後の表示位置にスクロール
        
        // --- 既存の応答を一時的に非表示にする処理 ---
        const elementsToHide = []; // 非表示にしたDOM要素を保持する配列
        const messageContainer = elements.messageContainer; // パフォーマンスのためキャッシュ

        // targetSiblingGroupId が存在する場合、そのグループ全体を非表示
        if (targetSiblingGroupId) {
            messageContainer.querySelectorAll(`.message.model[data-index]`).forEach(el => {
                const msgIndex = parseInt(el.dataset.index, 10);
                const potentialMsg = state.currentMessages[msgIndex]; // 削除後のインデックスでアクセス試行
                if (potentialMsg && potentialMsg.role === 'model' && potentialMsg.siblingGroupId === targetSiblingGroupId) {
                        el.classList.add('retrying-hidden');
                        elementsToHide.push(el);
                }
            });
                console.log(`${elementsToHide.length}件の既存応答 (グループ ${targetSiblingGroupId}) を一時的に非表示にしました。`);
        } else if (index + 1 < state.currentMessages.length && state.currentMessages[index + 1]?.role === 'model') {
            // 非カスケードの単一応答を非表示（削除後のインデックス index + 1 がモデル応答の場合）
            const element = messageContainer.querySelector(`.message.model[data-index="${index + 1}"]`);
            if (element) {
                element.classList.add('retrying-hidden');
                elementsToHide.push(element);
                console.log(`1件の既存応答 (非カスケード, 削除後のindex: ${index + 1}) を一時的に非表示にしました。`);
            }
        }

        // handleSend をリトライモードで呼び出す
        await this.handleSend(true, index);
    },

    // --- カスケード応答操作 ---
    // 指定インデックスのメッセージの兄弟カスケード応答を取得
    getCascadedSiblings(index, includeSelf = false) {
        const targetMsg = state.currentMessages[index];
        if (!targetMsg || !targetMsg.isCascaded || !targetMsg.siblingGroupId) {
            return [];
        }
        const groupId = targetMsg.siblingGroupId;
        const siblings = state.currentMessages.filter((msg, i) =>
            msg.role === 'model' &&
            msg.isCascaded &&
            msg.siblingGroupId === groupId &&
            (includeSelf || i !== index) // includeSelfがtrueなら自分自身も含む
        );
        return siblings;
    },

    // カスケード応答をナビゲート (前へ/次へ)
    async navigateCascade(currentIndex, direction) {
        const currentMsg = state.currentMessages[currentIndex];
        if (!currentMsg || !currentMsg.isCascaded || !currentMsg.siblingGroupId) return;

        const groupId = currentMsg.siblingGroupId;
        // 同じグループの兄弟を state.currentMessages 内の元の順序で取得
        const siblingsWithIndices = state.currentMessages
            .map((msg, i) => ({ msg, originalIndex: i })) // 元のインデックスを保持
            .filter(item => item.msg.role === 'model' && item.msg.isCascaded && item.msg.siblingGroupId === groupId);

        // 現在表示中のメッセージが兄弟リストの何番目か特定
        const currentSiblingIndex = siblingsWithIndices.findIndex(item => item.originalIndex === currentIndex);
        if (currentSiblingIndex === -1) return; // 見つからない場合は中断

        let targetSiblingIndex = -1;
        if (direction === 'prev' && currentSiblingIndex > 0) {
            targetSiblingIndex = currentSiblingIndex - 1;
        } else if (direction === 'next' && currentSiblingIndex < siblingsWithIndices.length - 1) {
            targetSiblingIndex = currentSiblingIndex + 1;
        }

        if (targetSiblingIndex !== -1) {
            // isSelected フラグを更新
            currentMsg.isSelected = false;
            const newlySelectedMessage = siblingsWithIndices[targetSiblingIndex].msg; // 新しく選択されたメッセージオブジェクト
            newlySelectedMessage.isSelected = true;
            const newlySelectedIndex = siblingsWithIndices[targetSiblingIndex].originalIndex; // 新しく選択されたメッセージの元のインデックス

            console.log(`カスケードナビゲーション: ${currentSiblingIndex + 1}/${siblingsWithIndices.length} -> ${targetSiblingIndex + 1}/${siblingsWithIndices.length}`);

            // UIを再描画
            uiUtils.renderChatMessages();

            // 再描画後に .show-actions クラスを再付与
            requestAnimationFrame(() => { // DOM更新が完了するのを待つ
                const newlySelectedElement = elements.messageContainer.querySelector(`.message[data-index="${newlySelectedIndex}"]`);
                if (newlySelectedElement && !newlySelectedElement.classList.contains('editing')) {
                        // 他に表示されているものがあれば消す
                        const currentlyShown = elements.messageContainer.querySelector('.message.show-actions');
                        if (currentlyShown && currentlyShown !== newlySelectedElement) {
                            currentlyShown.classList.remove('show-actions');
                        }
                        // 新しい要素にクラスを付与
                        newlySelectedElement.classList.add('show-actions');
                        console.log(`.show-actions を再付与: index=${newlySelectedIndex}`);
                }
            });

            // DBに保存
            try {
                await dbUtils.saveChat();
            } catch (error) {
                console.error("カスケードナビゲーション後の保存失敗:", error);
                await uiUtils.showCustomAlert("応答の切り替え状態の保存に失敗しました。");
            }
        }
    },

    // 特定のカスケード応答削除の確認
    async confirmDeleteCascadeResponse(indexToDelete) {
        const msgToDelete = state.currentMessages[indexToDelete];
        // 対象がカスケード応答でない場合は処理しない
        if (!msgToDelete || msgToDelete.role !== 'model' || !msgToDelete.isCascaded || !msgToDelete.siblingGroupId) {
            console.warn("confirmDeleteCascadeResponse: 対象はカスケード応答ではありません。", indexToDelete);
            return;
        }
        // 編集中、送信中、SP編集中は不可
        if (state.editingMessageIndex !== null) { await uiUtils.showCustomAlert("編集中は削除できません。"); return; }
        if (state.isSending) { await uiUtils.showCustomAlert("送信中は削除できません。"); return; }
        if (state.isEditingSystemPrompt) { await uiUtils.showCustomAlert("システムプロンプト編集中は削除できません。"); return; }

        // 削除確認
        const siblings = this.getCascadedSiblings(indexToDelete, true); // 自分自身を含む
        const currentIndexInGroup = siblings.findIndex(m => m === msgToDelete) + 1;
        const totalSiblings = siblings.length;
        const contentPreview = msgToDelete.content.substring(0, 30) + "...";
        const confirmMsg = `この応答 (${currentIndexInGroup}/${totalSiblings})「${contentPreview}」を削除しますか？\n(この応答のみが削除されます)`;

        const confirmed = await uiUtils.showCustomConfirm(confirmMsg);
        if (confirmed) {
            const wasSelected = msgToDelete.isSelected;
            const groupId = msgToDelete.siblingGroupId;

            // --- stateから単一メッセージ削除 ---
            state.currentMessages.splice(indexToDelete, 1);
            console.log(`カスケード応答削除 (単一): index=${indexToDelete}, groupId=${groupId}`);

            // --- isSelected 調整 ---
            let newlySelectedIndex = -1; // 削除後に選択状態になるべきメッセージのインデックス
            const remainingSiblingsWithIndices = state.currentMessages
                .map((msg, i) => ({ msg, originalIndex: i }))
                .filter(item => item.msg.role === 'model' && item.msg.isCascaded && item.msg.siblingGroupId === groupId);

            if (remainingSiblingsWithIndices.length > 0) {
                if (wasSelected) {
                    // 削除されたのが選択中だった場合、残りの最後のものを選択状態にする
                    const lastSiblingItem = remainingSiblingsWithIndices[remainingSiblingsWithIndices.length - 1];
                    if (!lastSiblingItem.msg.isSelected) {
                        lastSiblingItem.msg.isSelected = true;
                        newlySelectedIndex = lastSiblingItem.originalIndex;
                        console.log(`削除後、新しい選択応答を設定 (単一カスケード): newIndex=${newlySelectedIndex}`);
                    } else {
                        newlySelectedIndex = lastSiblingItem.originalIndex; // すでに選択済みだった場合もインデックス記録
                    }
                } else {
                        // 削除されたのが非選択だった場合、依然として選択中のものを探す
                        const stillSelectedItem = remainingSiblingsWithIndices.find(item => item.msg.isSelected);
                        if (stillSelectedItem) {
                            newlySelectedIndex = stillSelectedItem.originalIndex;
                        }
                }
            } else {
                console.log(`グループ ${groupId} の最後の応答が削除されました。`);
            }

            // --- UI再描画 & 操作ボックス再表示 ---
            uiUtils.renderChatMessages();
            requestAnimationFrame(() => {
                    if (newlySelectedIndex !== -1) {
                        const elementToShowActions = elements.messageContainer.querySelector(`.message[data-index="${newlySelectedIndex}"]`);
                        if (elementToShowActions && !elementToShowActions.classList.contains('editing')) {
                            const currentlyShown = elements.messageContainer.querySelector('.message.show-actions');
                            if (currentlyShown && currentlyShown !== elementToShowActions) {
                                currentlyShown.classList.remove('show-actions');
                            }
                            elementToShowActions.classList.add('show-actions');
                            console.log(`.show-actions を再付与 (単一カスケード削除後): index=${newlySelectedIndex}`);
                        }
                    }
            });

            // --- DB保存 ---
            try {
                await dbUtils.saveChat(); // isSelectedの変更などを保存
            } catch (error) {
                console.error("単一カスケード応答削除後の保存失敗:", error);
                await uiUtils.showCustomAlert("応答削除後のチャット状態の保存に失敗しました。");
            }
        } else {
                console.log("単一カスケード応答の削除キャンセル");
        }
    },
    
    // --- ファイルアップロード関連ロジック ---
    // ファイル選択ハンドラ
    async handleFileSelection(fileList) {
        if (!fileList || fileList.length === 0) return;

        const newFiles = Array.from(fileList);
        let currentTotalSize = state.selectedFilesForUpload.reduce((sum, item) => sum + item.file.size, 0);
        let addedCount = 0;
        let skippedCount = 0;
        let sizeError = false;

        elements.selectFilesBtn.disabled = true; // 処理中はボタン無効化
        elements.selectFilesBtn.textContent = '処理中...';

        for (const file of newFiles) {
            if (file.size > MAX_FILE_SIZE) {
                await uiUtils.showCustomAlert(`ファイル "${file.name}" はサイズが大きすぎます (${formatFileSize(MAX_FILE_SIZE)}以下)。`);
                skippedCount++;
                continue;
            }
            if (currentTotalSize + file.size > MAX_TOTAL_ATTACHMENT_SIZE) {
                sizeError = true; // 合計サイズオーバーフラグ
                skippedCount++;
                continue; // このファイル以降は追加しない
            }

            // 既存リストに同じファイル名がないかチェック (任意)
            if (state.selectedFilesForUpload.some(item => item.file.name === file.name)) {
                console.log(`ファイル "${file.name}" は既に追加されています。スキップします。`);
                skippedCount++;
                continue;
            }

            state.selectedFilesForUpload.push({ file: file });
            currentTotalSize += file.size;
            addedCount++;
        }

        elements.selectFilesBtn.disabled = false;
        elements.selectFilesBtn.textContent = 'ファイルを選択';

        if (sizeError) {
            await uiUtils.showCustomAlert(`合計ファイルサイズの上限 (${formatFileSize(MAX_TOTAL_ATTACHMENT_SIZE)}) を超えるため、一部のファイルは追加されませんでした。`);
        }
        if (skippedCount > 0) {
            console.log(`${skippedCount}個のファイルがスキップされました（サイズ超過または重複）。`);
        }

        uiUtils.updateSelectedFilesUI(); // UI更新
        console.log(`${addedCount}個のファイルが選択リストに追加されました。`);
    },

    // 選択されたファイルをリストから削除
    removeSelectedFile(indexToRemove) {
        if (indexToRemove >= 0 && indexToRemove < state.selectedFilesForUpload.length) {
            const removedFile = state.selectedFilesForUpload.splice(indexToRemove, 1)[0];
            console.log(`ファイル "${removedFile.file.name}" をリストから削除しました。`);
            uiUtils.updateSelectedFilesUI(); // UI更新
        }
    },

    // 添付を確定する処理
    async confirmAttachment() {
        // リストが空の場合の処理
        if (state.selectedFilesForUpload.length === 0) {
            state.pendingAttachments = []; // 送信待ちリストを空にする
            console.log("添付ファイルリストが空の状態で確定されました。送信待ちリストをクリアします。");
            elements.fileUploadDialog.close('ok'); // ダイアログを閉じる
            uiUtils.adjustTextareaHeight(); // 送信ボタンの状態更新
            uiUtils.updateAttachmentBadgeVisibility(); // バッジ状態更新
            return; // 以降の処理は不要
        }

        elements.confirmAttachBtn.disabled = true;
        elements.confirmAttachBtn.textContent = '処理中...';

        const attachmentsToAdd = [];
        let encodingError = false;

        for (const item of state.selectedFilesForUpload) {
            try {
                const base64Data = await fileToBase64(item.file);

                // --- MIMEタイプ推測ロジック ---
                let browserMimeType = item.file.type || ''; // ブラウザが提供するMIMEタイプ
                const fileName = item.file.name;
                // ファイル名から拡張子を取得 (最後のドット以降、小文字に変換)
                const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

                let guessedMimeType = null;
                // マッピングオブジェクトに拡張子が存在するか確認
                if (fileExtension && extensionToMimeTypeMap[fileExtension]) {
                    guessedMimeType = extensionToMimeTypeMap[fileExtension];
                }

                let finalMimeType;
                // 拡張子からの推測結果を最優先
                if (guessedMimeType) {
                    finalMimeType = guessedMimeType;
                    // ブラウザ提供のタイプと異なる場合はログ出力
                    if (finalMimeType !== browserMimeType) {
                        console.log(`ファイル "${fileName}": 拡張子(.${fileExtension})からMIMEタイプを "${finalMimeType}" に設定 (ブラウザ提供: ${browserMimeType || '空'})`);
                    }
                } else if (browserMimeType) {
                    // 拡張子から推測できず、ブラウザが提供している場合はそれを使用
                    finalMimeType = browserMimeType;
                    console.log(`ファイル "${fileName}": ブラウザ提供のMIMEタイプ "${finalMimeType}" を使用します。(拡張子からの推測なし)`);
                } else {
                    // 拡張子からもブラウザからも不明な場合はフォールバック
                    finalMimeType = 'application/octet-stream';
                    console.warn(`ファイル "${fileName}": MIMEタイプ不明。拡張子(.${fileExtension})にもマッピングなし。'application/octet-stream' を使用します。`);
                }
                // --- MIMEタイプ推測ロジックここまで ---

                attachmentsToAdd.push({
                    file: item.file, // 元の File オブジェクトも保持
                    name: fileName,
                    mimeType: finalMimeType, // 決定したMIMEタイプを使用
                    base64Data: base64Data
                });
            } catch (error) {
                console.error(`ファイル "${item.file.name}" のBase64エンコード中にエラー:`, error);
                encodingError = true;
                await uiUtils.showCustomAlert(`ファイル "${item.file.name}" の処理中にエラーが発生しました。`);
                break;
            }
        }

        elements.confirmAttachBtn.disabled = false;
        elements.confirmAttachBtn.textContent = '添付して閉じる';

        if (!encodingError) {
            state.pendingAttachments = attachmentsToAdd; // File オブジェクトを含むリストを格納
            // ログでファイル名と決定されたMIMEタイプを確認
            console.log(`${state.pendingAttachments.length}件のファイルを添付準備完了:`, state.pendingAttachments.map(a => `${a.name} (${a.mimeType})`));
            elements.fileUploadDialog.close('ok');
            uiUtils.adjustTextareaHeight(); // 送信ボタンの状態更新
            uiUtils.updateAttachmentBadgeVisibility(); // バッジ状態更新
        }
        // エラー時はダイアログを閉じない
    },

    // 添付をキャンセルする処理
    cancelAttachment() {
        state.selectedFilesForUpload = []; // 選択リストをクリア
        // pendingAttachments はここではクリアしない（送信前にキャンセルされる可能性があるため）
        console.log("ファイル添付をキャンセルしました。");
        elements.fileUploadDialog.close('cancel'); // ダイアログを閉じる
        uiUtils.updateAttachmentBadgeVisibility();
    },

    // --- レスポンス置換管理機能 ---
    
    // レスポンス置換をチャットデータから読み込み
    async loadResponseReplacementsFromChat(chatData = null) {
        if (chatData && chatData.responseReplacements) {
            // 指定されたチャットデータから読み込み
            state.responseReplacer = new ResponseReplacer(chatData.responseReplacements);
        } else if (state.currentChatId) {
            // 現在のチャットデータから読み込み
            try {
                const currentChat = await dbUtils.getChat(state.currentChatId);
                if (currentChat && currentChat.responseReplacements) {
                    state.responseReplacer = new ResponseReplacer(currentChat.responseReplacements);
                } else {
                    state.responseReplacer = new ResponseReplacer();
                }
            } catch (error) {
                console.error('現在のチャットデータの読み込みエラー:', error);
                state.responseReplacer = new ResponseReplacer();
            }
        } else {
            // 新規チャットの場合
            state.responseReplacer = new ResponseReplacer();
        }
        
        // ResponseReplacerUIインスタンスを生成
        state.responseReplacerUI = new ResponseReplacerUI(state.responseReplacer, elements);
        this.responseReplacerUIInit();
    },

    // ContextNoteをチャットデータから読み込み
    async loadContextNotesFromChat(chatData = null) {
        if (chatData && chatData.contextNotes) {
            // 指定されたチャットデータから読み込み
            state.contextNote = new ContextNote(chatData.contextNotes);
        } else if (state.currentChatId) {
            // 現在のチャットデータから読み込み
            try {
                const currentChat = await dbUtils.getChat(state.currentChatId);
                if (currentChat && currentChat.contextNotes) {
                    state.contextNote = new ContextNote(currentChat.contextNotes);
                } else {
                    state.contextNote = new ContextNote();
                }
            } catch (error) {
                console.error('現在のチャットデータの読み込みエラー:', error);
                state.contextNote = new ContextNote();
            }
        } else {
            // 新規チャットの場合
            state.contextNote = new ContextNote();
        }
    },

    // タブUI制御
    switchTab(tabName) {
        // タブボタンのアクティブ状態を切り替え
        elements.tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // タブコンテンツの表示を切り替え
        if (tabName === 'prompt') {
            elements.promptTab.classList.add('active');
            elements.compressionStatusTab.classList.remove('active');
            elements.responseReplacementsTab.classList.remove('active');
            elements.contextNotesTab.classList.remove('active');
        } else if (tabName === 'compression-status') {
            elements.promptTab.classList.remove('active');
            elements.compressionStatusTab.classList.add('active');
            elements.responseReplacementsTab.classList.remove('active');
            elements.contextNotesTab.classList.remove('active');
            this.updateCompressionStatusDisplay();
        } else if (tabName === 'response-replacements') {
            elements.promptTab.classList.remove('active');
            elements.compressionStatusTab.classList.remove('active');
            elements.responseReplacementsTab.classList.add('active');
            elements.contextNotesTab.classList.remove('active');
            state.responseReplacerUI.renderList();
        } else if (tabName === 'context-notes') {
            elements.promptTab.classList.remove('active');
            elements.compressionStatusTab.classList.remove('active');
            elements.responseReplacementsTab.classList.remove('active');
            elements.contextNotesTab.classList.add('active');
            this.renderContextNotesList();
        }
    },


    // ResponseReplacerUIのイベントリスナーを初期化
    responseReplacerUIInit() {
        state.responseReplacerUI.addEventListener('replacementSaved', this.onReplacementSaved.bind(this));
        state.responseReplacerUI.addEventListener('replacementDeleteConfirm', this.onReplacementDeleteConfirm.bind(this));
        state.responseReplacerUI.addEventListener('replacementDeleted', this.onReplacementDeleted.bind(this));
        state.responseReplacerUI.addEventListener('replacementMoved', this.onReplacementMoved.bind(this));
        state.responseReplacerUI.addEventListener('showAlert', this.onShowAlert.bind(this));
    },

	_onReplacementSave(error_string) {
        dbUtils.saveChat().catch(error => console.error(error_string, error));
	},

    onReplacementSaved() {
        this._onReplacementSave('レスポンス置換保存エラー:');
    },

    onReplacementDeleteConfirm(event) {
        const { index } = event.detail;
        uiUtils.showCustomConfirm('このレスポンス置換を削除しますか？').then(confirmed => {
            if (confirmed) {
                state.responseReplacerUI.delete(index);
            }
        });
    },

    onReplacementDeleted() {
        this._onReplacementSave('レスポンス置換削除保存エラー:');
    },

    onReplacementMoved() {
        this._onReplacementSave('レスポンス置換移動保存エラー:');
    },

	
    onShowAlert(event) {
        uiUtils.showCustomAlert(event.detail.message);
    },



    // ContextNoteリストの表示
    renderContextNotesList() {
        const list = elements.contextNotesList;
        list.innerHTML = '';

        if (state.contextNote && state.contextNote.getAllNotes().length > 0) {
            state.contextNote.getAllNotes().forEach((note, index) => {
                const item = this.createContextNoteItem(note, index);
                list.appendChild(item);
            });
        }
    },

    // ContextNoteアイテムの作成
    createContextNoteItem(note, index) {
        const item = document.createElement('div');
        item.className = 'context-note-item';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="context-note-form">
                <div class="context-note-form-row">
                    <input type="text" id="context-note-title-${index}" name="context-note-title" value="${note.title || ''}" class="context-note-input" disabled autocomplete="off" placeholder="タイトル">
                    <select id="context-note-type-${index}" name="context-note-type" class="context-note-select" disabled>
                        <option value="keyword" ${note.type === 'keyword' ? 'selected' : ''}>キーワード</option>
                        <option value="moment" ${note.type === 'moment' ? 'selected' : ''}>モーメント</option>
                    </select>
                    <input type="text" id="context-note-keywords-${index}" name="context-note-keywords" value="${note.keywords ? note.keywords.join(', ') : ''}" class="context-note-input" disabled autocomplete="off" placeholder="キーワード（カンマ区切り）">
                </div>
                <div class="context-note-form-row">
                    <textarea id="context-note-content-${index}" name="context-note-content" class="context-note-textarea" disabled autocomplete="off" placeholder="内容（1行目がサマリーとして扱われます）">${note.content || ''}</textarea>
                </div>
                <div class="context-note-form-row">
                    <input type="text" id="context-note-category-${index}" name="context-note-category" value="${note.category || ''}" class="context-note-input" disabled autocomplete="off" placeholder="カテゴリ（空欄可）">
                    <div class="context-note-form-actions">
                        <button class="insert-below-btn" title="ここの下に新規追加">⤵️</button>
                        <button class="move-up-btn" title="上に移動">🔼</button>
                        <button class="move-down-btn" title="下に移動">🔽</button>
                        <button class="edit-btn" title="編集">編集</button>
                        <button class="delete-btn" title="削除">削除</button>
                    </div>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        const insertBelowBtn = item.querySelector('.insert-below-btn');
        const moveUpBtn = item.querySelector('.move-up-btn');
        const moveDownBtn = item.querySelector('.move-down-btn');
        const editBtn = item.querySelector('.edit-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        insertBelowBtn.onclick = () => this.insertContextNoteBelow(index);
        moveUpBtn.onclick = () => this.moveContextNote(index, 'up');
        moveDownBtn.onclick = () => this.moveContextNote(index, 'down');
        editBtn.onclick = () => this.editContextNote(index);
        deleteBtn.onclick = () => this.deleteContextNote(index);

        return item;
    },

    // ContextNoteの追加
    addContextNote() {
        const newNote = {
            title: '',
            type: 'keyword',
            content: '',
            keywords: [],
            category: ''
        };

        const item = this.createContextNoteEditForm(newNote, -1);
        elements.contextNotesList.appendChild(item);
        
        // 一番下までスクロール
        setTimeout(() => {
            const tabContent = elements.contextNotesTab;
            if (tabContent) {
                tabContent.scrollTop = tabContent.scrollHeight;
            }
            // フォールバック: window全体をスクロール
            window.scrollTo(0, document.body.scrollHeight);
        }, 25);
    },

    // ContextNoteの編集フォーム作成
    createContextNoteEditForm(note, index) {
        const item = document.createElement('div');
        item.className = 'context-note-item';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="context-note-form">
                <div class="context-note-form-row">
                    <input type="text" id="context-note-edit-title-${index}" name="context-note-edit-title" value="${note.title || ''}" class="context-note-input" autocomplete="off" placeholder="タイトル">
                    <select id="context-note-edit-type-${index}" name="context-note-edit-type" class="context-note-select">
                        <option value="keyword" ${note.type === 'keyword' ? 'selected' : ''}>キーワード</option>
                        <option value="moment" ${note.type === 'moment' ? 'selected' : ''}>モーメント</option>
                    </select>
                    <input type="text" id="context-note-edit-keywords-${index}" name="context-note-edit-keywords" value="${note.keywords ? note.keywords.join(', ') : ''}" class="context-note-input" autocomplete="off" placeholder="キーワード（カンマ区切り）">
                </div>
                <div class="context-note-form-row">
                    <textarea id="context-note-edit-content-${index}" name="context-note-edit-content" class="context-note-textarea" autocomplete="off" placeholder="内容（1行目がサマリーとして扱われます）">${note.content || ''}</textarea>
                </div>
                <div class="context-note-form-row">
                    <input type="text" id="context-note-edit-category-${index}" name="context-note-edit-category" value="${note.category || ''}" class="context-note-input" autocomplete="off" placeholder="カテゴリ（空欄可）">
                    <div class="context-note-form-actions">
                        <button class="save-btn" title="保存">保存</button>
                        <button class="cancel-btn" title="キャンセル">キャンセル</button>
                    </div>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        const saveBtn = item.querySelector('.save-btn');
        const cancelBtn = item.querySelector('.cancel-btn');
        
        saveBtn.onclick = () => this.saveContextNote(index);
        cancelBtn.onclick = () => this.cancelContextNoteEdit(index);

        return item;
    },

    // ContextNoteの編集
    editContextNote(index) {
        const note = state.contextNote.getAllNotes()[index];
        if (!note) return;

        const list = elements.contextNotesList;
        const existingItem = list.querySelector(`[data-index="${index}"]`);
        if (existingItem) {
            const editForm = this.createContextNoteEditForm(note, index);
            existingItem.replaceWith(editForm);
        }
    },

    // ContextNoteの保存
    saveContextNote(index) {
        const titleInput = document.getElementById(`context-note-edit-title-${index}`);
        const typeInput = document.getElementById(`context-note-edit-type-${index}`);
        const contentInput = document.getElementById(`context-note-edit-content-${index}`);
        const keywordsInput = document.getElementById(`context-note-edit-keywords-${index}`);
        const categoryInput = document.getElementById(`context-note-edit-category-${index}`);

        if (!titleInput || !typeInput || !contentInput || !keywordsInput || !categoryInput) return;

        const title = titleInput.value.trim();
        const type = typeInput.value;
        const content = contentInput.value.trim();
        const keywords = keywordsInput.value.trim().split(',').map(k => k.trim()).filter(k => k);
        const category = categoryInput.value.trim();

        if (!title) {
            uiUtils.showCustomAlert('タイトルを入力してください');
            return;
        }

        if (!content) {
            uiUtils.showCustomAlert('内容を入力してください');
            return;
        }

        // キーワードはそのまま使用（空の場合はContextNoteクラス側でタイトルをキーワードとして扱う）
        const finalKeywords = keywords;

        if (index === -1) {
            // 新規追加
            const newItem = elements.contextNotesList.querySelector('[data-index="-1"]');
            const insertAfterIndex = newItem ? newItem.dataset.insertAfter : null;
            
            if (insertAfterIndex !== null && insertAfterIndex !== undefined) {
                // 指定位置の下に挿入
                const insertIndex = parseInt(insertAfterIndex) + 1;
                state.contextNote.insertNoteAt(insertIndex, type, title, content, finalKeywords, category);
            } else {
                // 最後に追加
                state.contextNote.addNote(type, title, content, finalKeywords, category);
            }
        } else {
            // 編集
            state.contextNote.updateNote(index, type, title, content, finalKeywords, category);
        }

        // チャットを保存してContextNoteデータを永続化
        dbUtils.saveChat().catch(error => console.error('ContextNote保存エラー:', error));
        this.renderContextNotesList();
    },

    // ContextNoteの削除
    deleteContextNote(index) {
        uiUtils.showCustomConfirm('このコンテキストノートを削除しますか？').then(confirmed => {
            if (confirmed) {
                if (state.contextNote.removeNote(index)) {
                    // チャットを保存してContextNoteデータを永続化
                    dbUtils.saveChat().catch(error => console.error('ContextNote削除保存エラー:', error));
                    this.renderContextNotesList();
                }
            }
        });
    },

    // ContextNote編集のキャンセル
    cancelContextNoteEdit(index) {
        if (index === -1) {
            // 新規追加のキャンセル
            const newItem = elements.contextNotesList.querySelector('[data-index="-1"]');
            if (newItem) {
                newItem.remove();
            }
        } else {
            // 編集のキャンセル
            this.renderContextNotesList();
        }
    },

    // ContextNoteの移動
    moveContextNote(index, direction) {
        let success = false;
        
        if (direction === 'up') {
            success = state.contextNote.moveUp(index);
        } else if (direction === 'down') {
            success = state.contextNote.moveDown(index);
        }
        
        if (success) {
            // チャットを保存してContextNoteデータを永続化
            dbUtils.saveChat().catch(error => console.error('ContextNote移動保存エラー:', error));
            this.renderContextNotesList();
        }
    },

    // 指定位置の下にContextNoteを挿入
    insertContextNoteBelow(index) {
        const newNote = {
            title: '',
            type: 'keyword',
            content: '',
            keywords: [],
            category: ''
        };

        const item = this.createContextNoteEditForm(newNote, -1);
        const list = elements.contextNotesList;
        const existingItem = list.querySelector(`[data-index="${index}"]`);
        
        if (existingItem) {
            // 指定されたアイテムの直後に挿入
            existingItem.after(item);
            // 挿入位置を記録
            item.dataset.insertAfter = index;
        } else {
            // 見つからない場合は最後に追加
            list.appendChild(item);
        }
    },

    // 圧縮状態表示を更新
    updateCompressionStatusDisplay() {
        const compressionStatusContent = document.getElementById('compression-status-content');
        if (!compressionStatusContent) return;

        if (!state.compressedSummary) {
            // 圧縮データがない場合
            compressionStatusContent.innerHTML = `
                <div class="compression-status-info">
                    <p>圧縮データがありません</p>
                </div>
            `;
            return;
        }

        // 圧縮データがある場合、詳細を表示
        const summary = state.compressedSummary;
        const timestamp = new Date(summary.timestamp).toLocaleString('ja-JP');
        
        // 圧縮範囲のメッセージ数を計算
        const compressedMessageCount = summary.endIndex - summary.startIndex + 1;
        
        // 圧縮率を計算
        const compressionRatio = summary.originalTokens > 0 
            ? ((summary.originalTokens - summary.compressedTokens) / summary.originalTokens * 100).toFixed(1)
            : '0.0';

        compressionStatusContent.innerHTML = `
            <div class="compression-status-grid">
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">圧縮範囲</div>
                        <div class="compression-status-item-value">${summary.startIndex + 1} ～ ${summary.endIndex + 1}</div>
                    </div>
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">圧縮メッセージ数</div>
                        <div class="compression-status-item-value">約 ${compressedMessageCount} 件</div>
                    </div>
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">圧縮率</div>
                        <div class="compression-status-item-value">${compressionRatio}%</div>
                    </div>
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">圧縮前トークン数</div>
                        <div class="compression-status-item-value">${summary.originalTokens.toLocaleString()} tokens</div>
                    </div>
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">圧縮後トークン数</div>
                        <div class="compression-status-item-value">${summary.compressedTokens.toLocaleString()} tokens</div>
                    </div>
                    <div class="compression-status-item">
                        <div class="compression-status-item-label">節約トークン数</div>
                        <div class="compression-status-item-value">${(summary.originalTokens - summary.compressedTokens).toLocaleString()} tokens</div>
                    </div>
                </div>
                
                <div class="compression-status-summary">
                    <div class="compression-status-summary-label">圧縮サマリー</div>
                    <div class="compression-summary-content">
                        <textarea id="compression-summary-edit" class="compression-summary-textarea" placeholder="">${summary.summary}</textarea>
                        <div class="compression-summary-actions">
                            <button id="update-compression-summary-btn" class="update-compression-btn">更新</button>
                        </div>
                        <div class="compression-summary-notice">
                            <small>※ サマリーを更新しても圧縮情報（範囲、トークン数など）は更新されません</small>
                        </div>
                    </div>
                </div>
        `;

        // 更新ボタンのイベントリスナーを追加
        const updateBtn = compressionStatusContent.querySelector('#update-compression-summary-btn');
        if (updateBtn) {
            updateBtn.onclick = () => this.updateCompressionSummary();
        }


    },

    // 圧縮サマリーを更新
    async updateCompressionSummary() {
        const textarea = document.getElementById('compression-summary-edit');
        if (!textarea || !state.compressedSummary) return;

        const newSummary = textarea.value.trim();
        if (!newSummary) {
            uiUtils.showCustomAlert('圧縮サマリーを入力してください');
            return;
        }

        // 圧縮サマリーを更新
        state.compressedSummary.summary = newSummary;

        // IndexedDBに保存
        try {
            await dbUtils.saveChat();
            uiUtils.showCustomAlert('圧縮サマリーを更新しました');
        } catch (error) {
            console.error('圧縮サマリー更新エラー:', error);
            uiUtils.showCustomAlert('圧縮サマリーの更新に失敗しました');
        }
    },

    // 直接編集モーダルを開く
    openDirectEditModal() {
        // 現在のContextNoteデータをYAML形式に変換
        const yamlContent = state.contextNote.convertToYaml();
        elements.yamlEditor.value = yamlContent;
        elements.yamlErrorMessage.classList.add('hidden');
        elements.directEditModal.classList.remove('hidden');
    },

    // 直接編集モーダルを閉じる
    closeDirectEditModal() {
        elements.directEditModal.classList.add('hidden');
        elements.yamlEditor.value = '';
        elements.yamlErrorMessage.classList.add('hidden');
    },

    // YAMLコンテンツを保存
    async saveYamlContent() {
        const yamlText = elements.yamlEditor.value.trim();
        
        if (!yamlText) {
            // 空の場合は全てのノートを削除
            state.contextNote.clearNotes();
            await dbUtils.saveChat();
            this.closeDirectEditModal();
            this.renderContextNotesList();
            return;
        }

        try {
            // js-yamlでパース（複数ドキュメント対応）
            const parsedData = jsyaml.loadAll(yamlText);
            
            // 空のドキュメントをフィルタリング
            const notes = parsedData.filter(doc => doc && typeof doc === 'object');
            
            if (notes.length === 0) {
                throw new Error('有効なノートが見つかりません');
            }
            
            this.updateContextNotesFromYaml(notes);
			dbUtils.saveChat();

            // エラーメッセージを非表示
            elements.yamlErrorMessage.classList.add('hidden');
            
            // モーダルを閉じてリストを更新
            this.closeDirectEditModal();
            this.renderContextNotesList();
            
        } catch (error) {
            console.error('YAMLパースエラー:', error);
            // エラーメッセージを表示
            elements.yamlErrorMessage.textContent = `YAMLパースエラー: ${error.message}`;
            elements.yamlErrorMessage.classList.remove('hidden');
        }
    },

    // デフォルトのコンテキストノート仕様を追加
    addDefaultContextNoteSpec() {
		state.contextNote.addDefaultSpec();

		dbUtils.saveChat().catch(error => console.error('デフォルトコンテキストノート保存エラー:', error));
    },

    // ContextNoteシステムメッセージを表示・更新
    displayContextNoteSystemMessage() {
        if (!state.contextNote) return;

        // 既存のシステムメッセージを削除
        const existingSystemMessage = elements.messageContainer.querySelector('.message.system-info');
        if (existingSystemMessage) {
            existingSystemMessage.remove();
        }

        // 新しいサマリーを取得
        const summaryString = state.contextNote.getAllNotesSummary();
        
        // メッセージが存在しない場合（新規チャット）は表示しない
        const messages = elements.messageContainer.querySelectorAll('.message');
        if (messages.length === 0) {
            return;
        }
        
        if (summaryString) {
            // 新しいシステムメッセージを作成
            const summaryMessageDiv = document.createElement('div');
            summaryMessageDiv.classList.add('message', 'system-info');
            
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('message-content');
            
            const pre = document.createElement('pre');
            pre.textContent = summaryString;
            contentDiv.appendChild(pre);
            
            summaryMessageDiv.appendChild(contentDiv);

            // 2投目の位置に挿入（最初のユーザーメッセージの後）
            if (messages.length >= 1) {
                // 最初のメッセージの後に挿入
                elements.messageContainer.insertBefore(summaryMessageDiv, messages[1]);
            } else {
                // メッセージがない場合は最初に追加
                elements.messageContainer.appendChild(summaryMessageDiv);
            }
            
            uiUtils.scrollToBottom();
        }
    },

    // チャットをテキストファイルとしてエクスポート
    async exportChatAsText(chatId, chatTitle) {
        return await dbUtils.exportChatAsText(chatId, chatTitle);
    },

    // チャットを完全なJSONファイルとしてエクスポート
    async exportChatAsJSON(chatId, chatTitle) {
        try {
            const exportData = await dbUtils.prepareChatForExport(chatId);
            const safeTitle = (chatTitle || `chat_${chatId}_export`).replace(/[<>:"/\\|?*\s]/g, '_');
            const filename = `${safeTitle}_complete.json`;
            
            dbUtils.downloadJSONFile(exportData, filename);
            console.log("チャット完全エクスポート完了:", chatId);
        } catch (error) {
            console.error("エクスポートエラー:", error);
            await uiUtils.showCustomAlert(`エクスポートエラー: ${error.message}`);
        }
    },

    // JSONファイルからチャットを完全復元
    async importChatFromJson(file) {
        try {
            console.log("JSONチャットインポート開始:", file.name);
            
            const importData = await dbUtils.parseJSONFile(file);
            const chatData = dbUtils.validateChatImportData(importData);
            
            const newChatId = await dbUtils.saveChatData(chatData);
            
            console.log("JSONチャットインポート成功:", newChatId);
            await uiUtils.showCustomAlert(`チャット「${chatData.title}」を完全に復元しました。\n\nインポート日時: ${new Date().toLocaleString()}\n元の作成日時: ${new Date(chatData.createdAt).toLocaleString()}`);
            
            // 履歴リストを再描画
            uiUtils.renderHistoryList();
            
        } catch (error) {
            console.error("JSONインポート処理エラー:", error);
            await uiUtils.showCustomAlert(`JSONファイルのインポート中にエラーが発生しました: ${error.message}`);
        }
    },

    // 全データをバックアップ
    async backupAllData() {
        try {
            const exportData = await dbUtils.prepareAllDataForExport();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `${DB_NAME.toLowerCase()}_backup_${timestamp}.json`;
            
            dbUtils.downloadJSONFile(exportData, filename);
            console.log("全データバックアップ完了:", exportData.chats.length, "チャット");
        } catch (error) {
            console.error("バックアップエラー:", error);
            await uiUtils.showCustomAlert(`バックアップ中にエラーが発生しました: ${error.message}`);
        }
    },

    // バックアップから全データを復元
    async restoreAllData() {
        try {
            // 復元確認
            const confirmed = await uiUtils.showCustomConfirm(
                "バックアップから復元しますか？\n\n" +
                "※ 既存の全データ（チャット履歴と設定）が削除されます\n" +
                "※ この操作は取り消せません\n" +
                "※ APIキーは復元されません"
            );
            
            if (!confirmed) return;

            // ファイル選択を促す
            elements.restoreDataInput.click();
        } catch (error) {
            console.error("復元エラー:", error);
            await uiUtils.showCustomAlert(`復元中にエラーが発生しました: ${error.message}`);
        }
    },

    // 復元ファイル処理
    async handleRestoreFile(file) {
        try {
            console.log("全データ復元開始:", file.name);
            
            const importData = await dbUtils.parseJSONFile(file);
            dbUtils.validateAllDataImportData(importData);
            const result = await dbUtils.restoreAllDataFromImport(importData);
            
            console.log("全データ復元成功:", result.chatCount, "チャット");
            
            await uiUtils.showCustomAlert(
                `データ復元が完了しました。\n\n` +
                `復元したチャット数: ${result.chatCount}件\n\n` +
                `※ ページを再読み込みして設定を反映してください。`
            );
            
            // 設定画面を閉じてチャット画面に戻る
            uiUtils.showScreen('chat');
            
        } catch (error) {
            console.error("復元ファイル処理エラー:", error);
            await uiUtils.showCustomAlert(`復元中にエラーが発生しました: ${error.message}`);
        }
    }

}; // appLogic終了

window.ResponseReplacer = ResponseReplacer;
window.ContextNote = ContextNote;