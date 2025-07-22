// AppConfig.js
// アプリ全体の設定値・デフォルト値を管理するクラス

class AppConfig {
    // デフォルト設定値（pwa.jsの定数・state.settingsより移植）
    static DEFAULTS = {
        // API/モデル
        apiKey: '',
        modelName: 'gemini-2.0-flash', // DEFAULT_MODEL
        streamingOutput: false, // DEFAULT_STREAMING_OUTPUT
        streamingSpeed: 12, // DEFAULT_STREAMING_SPEED
        systemPrompt: '',
        temperature: null, // デフォルトはAPI側依存
        maxTokens: null, // デフォルトはAPI側依存
        topK: null,
        topP: null,
        presencePenalty: null,
        frequencyPenalty: null,
        thinkingBudget: null,
        includeThoughts: true,
        dummyUser: '',
        dummyModel: '',
        enableDummyUser: false,
        enableDummyModel: false,
        concatDummyModel: false,
        additionalModels: '',
        pseudoStreaming: false,
        enterToSend: true,
        historySortOrder: 'updatedAt',
        darkMode: false, // 初期はfalse（OS設定は初期化時に反映）
        backgroundImageBlob: null,
        fontFamily: '', // CSS変数で定義
        hideSystemPromptInChat: false,
        enableGrounding: false,
        enableSwipeNavigation: true,
        debugVirtualSend: false,
        debugVirtualResponse: '',
        // 圧縮・コンテキスト圧縮
        compressionMode: true,
        compressionPrompt: 'これまでのやり取りで起こった事実関係とその時の登場人物の振る舞いを文字数を気にしないでできるかぎり詳細にまとめて。要約データとして扱うので、既存のフォーマットは無視。Markdownにもせずに、小説の「あらすじ」として通用するような形で。応答の返事は要らないからすぐに出力開始して。', // DEFAULT_COMPRESSION_PROMPT
        keepFirstMessages: 5, // DEFAULT_KEEP_FIRST_MESSAGES
        keepLastMessages: 20, // DEFAULT_KEEP_LAST_MESSAGES
        compressionPromptTokenCount: null,
        // ContextNote関連
        contextNoteRandomFrequency: 0.3, // DEFAULT_CONTEXT_NOTE_RANDOM_FREQUENCY
        contextNoteRandomCount: 1, // DEFAULT_CONTEXT_NOTE_RANDOM_COUNT
        contextNoteMessageCount: 6, // DEFAULT_CONTEXT_NOTE_MESSAGE_COUNT
        contextNoteMaxChars: 5000, // DEFAULT_CONTEXT_NOTE_MAX_CHARS
        contextNoteInsertionPriority: 2, // DEFAULT_CONTEXT_NOTE_INSERTION_PRIORITY
    };

    constructor(initialConfig = {}, dbAdapter = null, storeName = 'settings') {
        this.config = { ...AppConfig.DEFAULTS, ...initialConfig };
        this.dbAdapter = dbAdapter;
        this.storeName = storeName;
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        if (this.dbAdapter) {
            this.dbAdapter.put(this.storeName, { key, value });
        }
    }

    async reset() {
        this.config = { ...AppConfig.DEFAULTS };
        if (this.dbAdapter) {
            await this.save();
        }
    }

    async save() {
        if (!this.dbAdapter) throw new Error('dbAdapterがセットされていません');
        const entries = Object.entries(this.config);
        for (const [key, value] of entries) {
            await this.dbAdapter.put(this.storeName, { key, value });
        }
    }

    validate(settingsObj) {
        const defaults = AppConfig.DEFAULTS;
        const cleaned = { ...defaults };
        for (const key in settingsObj) {
            if (!(key in defaults)) continue;
            const loadedValue = settingsObj[key];
            const defaultValue = defaults[key];
            if (key === 'backgroundImageBlob') {
                cleaned[key] = (loadedValue instanceof Blob) ? loadedValue : null;
            } else if (key === 'hideSystemPromptInChat' || key === 'enableGrounding' || key === 'enableSwipeNavigation' || key === 'debugVirtualSend' || key === 'compressionMode') {
                cleaned[key] = loadedValue === true;
            } else if (key === 'debugVirtualResponse') {
                cleaned[key] = typeof loadedValue === 'string' ? loadedValue : '';
            } else if (key === 'contextNoteRandomFrequency') {
                const num = parseFloat(loadedValue);
                cleaned[key] = (isNaN(num) || num < 0 || num > 1) ? defaults.contextNoteRandomFrequency : num;
            } else if (key === 'contextNoteRandomCount') {
                const num = parseInt(loadedValue, 10);
                cleaned[key] = (isNaN(num) || num < 1) ? defaults.contextNoteRandomCount : num;
            } else if (key === 'contextNoteMessageCount') {
                const num = parseInt(loadedValue, 10);
                cleaned[key] = (isNaN(num) || num < 1) ? defaults.contextNoteMessageCount : num;
            } else if (key === 'contextNoteMaxChars') {
                const num = parseInt(loadedValue, 10);
                cleaned[key] = (isNaN(num) || num < 100) ? defaults.contextNoteMaxChars : num;
            } else if (key === 'contextNoteInsertionPriority') {
                const num = parseInt(loadedValue, 10);
                cleaned[key] = (isNaN(num) || num < 1 || num > 10) ? defaults.contextNoteInsertionPriority : num;
            } else if (key === 'darkMode' || key === 'streamingOutput' || key === 'pseudoStreaming' || key === 'enterToSend' || key === 'concatDummyModel' || key === 'enableDummyUser' || key === 'enableDummyModel' || key === 'includeThoughts') {
                cleaned[key] = loadedValue === true;
            } else if (key === 'thinkingBudget') {
                const num = parseInt(loadedValue, 10);
                cleaned[key] = (isNaN(num) || num < 0) ? null : num;
            } else if (typeof defaultValue === 'number' || defaultValue === null) {
                let num;
                if (key === 'temperature' || key === 'topP' || key === 'presencePenalty' || key === 'frequencyPenalty') {
                    num = parseFloat(loadedValue);
                } else {
                    num = parseInt(loadedValue, 10);
                }
                if (isNaN(num)) {
                    if ((key === 'temperature' || key === 'maxTokens' || key === 'topK' || key === 'topP' || key === 'presencePenalty' || key === 'frequencyPenalty') && (loadedValue === null || loadedValue === '')) {
                        cleaned[key] = null;
                    } else {
                        cleaned[key] = defaultValue;
                    }
                } else {
                    if (key === 'temperature' && (num < 0 || num > 2)) num = defaultValue;
                    if (key === 'maxTokens' && num < 1) num = defaultValue;
                    if (key === 'topK' && num < 1) num = defaultValue;
                    if (key === 'topP' && (num < 0 || num > 1)) num = defaultValue;
                    if (key === 'streamingSpeed' && num < 0) num = defaultValue;
                    if ((key === 'presencePenalty' || key === 'frequencyPenalty') && (num < -2.0 || num > 2.0)) num = defaultValue;
                    cleaned[key] = num;
                }
            } else if (typeof defaultValue === 'string') {
                cleaned[key] = typeof loadedValue === 'string' ? loadedValue : defaultValue;
            } else {
                cleaned[key] = loadedValue;
            }
        }
        return cleaned;
    }

    async load() {
        if (!this.dbAdapter) throw new Error('dbAdapterがセットされていません');
        await this.dbAdapter.open();
        return new Promise((resolve, reject) => {
            try {
                const store = this.dbAdapter._getStore(this.storeName);
                const request = store.getAll();
                request.onsuccess = (event) => {
                    const settingsArray = event.target.result;
                    const loadedSettings = {};
                    settingsArray.forEach(item => {
                        loadedSettings[item.key] = item.value;
                    });
                    // バリデーションしてから反映
                    this.config = this.validate(loadedSettings);
                    resolve();
                };
                request.onerror = (event) => reject(event.target.error);
            } catch (e) {
                reject(e);
            }
        });
    }
}

// export default AppConfig; 