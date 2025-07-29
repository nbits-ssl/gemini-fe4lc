class Chat {
    static CHATS_STORE = 'chats';
    
    constructor(id, title, messages, createdAt, updatedAt, options = {}, dbAdapter) {
        this.id = id;
        this.title = title || '';
        this.messages = messages || [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.responseReplacer = options.responseReplacer || [];
        this.contextSummary = options.contextSummary || [];
        this.lastSentRequest = options.lastSentRequest || null;
        this.systemPrompt = options.systemPrompt || '';
        this.compressedSummary = options.compressedSummary || null;
        this.pendingAttachments = options.pendingAttachments || [];
        this.dbAdapter = dbAdapter;
    }

    // 新規チャット作成用の静的メソッド
    static createNew(dbAdapter, defaultSystemPrompt = '') {
        const now = Date.now();
        return new Chat(
            null, // id
            '', // title
            [], // messages
            now, // createdAt
            now, // updatedAt
            {
                systemPrompt: defaultSystemPrompt
            },
            dbAdapter
        );
    }

    // 既存データからChatインスタンスを作成
    static fromData(chatData, dbAdapter) {
        return new Chat(
            chatData.id,
            chatData.title,
            chatData.messages,
            chatData.createdAt,
            chatData.updatedAt,
            {
                responseReplacer: chatData.responseReplacer,
                contextSummary: chatData.contextSummary,
                lastSentRequest: chatData.lastSentRequest,
                systemPrompt: chatData.systemPrompt,
                compressedSummary: chatData.compressedSummary,
                pendingAttachments: chatData.pendingAttachments
            },
            dbAdapter
        );
    }

    // IDからChatインスタンスを取得
    static async getChat(id, dbAdapter) {
        try {
            const chatData = await dbAdapter.get(Chat.CHATS_STORE, id);
            if (chatData) {
                return Chat.fromData(chatData, dbAdapter);
            }
            return null;
        } catch (error) {
            console.error('Chat.getChat error:', error);
            throw error;
        }
    }

    // エクスポート機能
    exportAsText() {
        // エクスポート用テキスト生成
        let exportText = '';
        
        // システムプロンプトを出力
        if (this.systemPrompt) {
            exportText += `<|#|system|#|>\n${this.systemPrompt}\n<|#|/system|#|>\n\n`;
        }
        
        // メッセージを出力
        if (this.messages) {
            this.messages.forEach(msg => {
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
        
        return exportText.trim();
    }

    exportAsJSON() {
        return {
            exportDate: new Date().toISOString(),
            chat: {
                id: this.id,
                title: this.title,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                systemPrompt: this.systemPrompt || '',
                messages: this.messages || [],
                compressedSummary: this.compressedSummary || null,
                lastSentRequest: this.lastSentRequest || null,
                responseReplacements: this.responseReplacer || [],
                contextNotes: this.contextSummary || []
            }
        };
    }

    // インポート機能
    static fromJSON(jsonData) {
        // TODO: JSONデータからChatインスタンス作成実装
    }

    static validateImportData(data) {
        // TODO: インポートデータ検証実装
    }

    // バックアップ/復元機能
    static backupAllData() {
        // TODO: 全データバックアップ実装
    }

    static restoreAllData() {
        // TODO: 全データ復元実装
    }

    // 保存機能
    async save() {
        // TODO: チャットデータをDBに保存する実装
    }

    // 更新機能
    async update() {
        // TODO: チャットデータをDBで更新する実装
    }

    // 削除機能
    async delete() {
        // TODO: チャットデータをDBから削除する実装
    }

    // チャットが空かどうかを判定
    isEmpty() {
        return (!this.messages || this.messages.length === 0) && !this.systemPrompt;
    }

    // 安全なファイル名用のタイトルを取得
    getSafeTitle() {
        const title = this.title || `chat_${this.id}_export`;
        return title.replace(/[<>:"/\\|?*\s]/g, '_');
    }
} 