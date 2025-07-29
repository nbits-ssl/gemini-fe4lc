class Chat {
    static CHATS_STORE = 'chats';
    static DEFAULT_TITLE = '無題のチャット';
    
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
    async save(optionalTitle = null) {
        const isNew = !this.id; // 保存前の状態を保持
        const now = Date.now();
        
        const title = this._getTitleToSave(optionalTitle);
        const chatData = this._chatDataToSave(title, now);

        if (this.id) {
            chatData.id = this.id;
        }

        try {
            const savedId = await this.dbAdapter.put(Chat.CHATS_STORE, chatData);
            
            this.id = savedId;
            this.title = title;
            this.updatedAt = now;
            if (!this.createdAt) {
                this.createdAt = now;
            }

            console.log(`チャット ${this.id ? '更新' : '保存'} 完了 ID:`, this.id, 'タイトル:', title);
            
            return {
                id: savedId,
                title: title,
                isNew: isNew
            };
        } catch (error) {
            console.error('Chat.save error:', error);
            throw error;
        }
    }

    // 保存用タイトルを決定
    _getTitleToSave(optionalTitle = null) {
        if (optionalTitle !== null) {
            return optionalTitle;
        } else if (this.title) {
            return this.title;
        } else {
            const firstUserMessage = this.messages.find(m => m.role === 'user');
            return firstUserMessage ? firstUserMessage.content.substring(0, 50) : Chat.DEFAULT_TITLE;
        }
    }

    // 保存用メッセージデータを作成
    _messagesToSave() {
        return this.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            thoughtSummary: msg.thoughtSummary || null,
            ...(msg.finishReason && { finishReason: msg.finishReason }),
            ...(msg.safetyRatings && { safetyRatings: msg.safetyRatings }),
            ...(msg.error && { error: msg.error }),
            ...(msg.isCascaded !== undefined && { isCascaded: msg.isCascaded }),
            ...(msg.isSelected !== undefined && { isSelected: msg.isSelected }),
            ...(msg.siblingGroupId !== undefined && { siblingGroupId: msg.siblingGroupId }),
            ...(msg.groundingMetadata && { groundingMetadata: msg.groundingMetadata }),
            ...(msg.attachments && msg.attachments.length > 0 && { attachments: msg.attachments }),
            ...(msg.usageMetadata && { usageMetadata: msg.usageMetadata }),
        }));
    }

    // 保存用チャットデータを構築
    _chatDataToSave(title, now) {
        return {
            messages: this._messagesToSave(),
            systemPrompt: this.systemPrompt,
            updatedAt: now,
            createdAt: this.createdAt || now,
            title: title,
            ...(this.compressedSummary && { compressedSummary: this.compressedSummary }),
            ...(this.lastSentRequest && { lastSentRequest: this.lastSentRequest }),
            ...(this.responseReplacer && this.responseReplacer.length > 0 && { responseReplacements: this.responseReplacer }),
            ...(this.contextSummary && this.contextSummary.length > 0 && { contextNotes: this.contextSummary }),
        };
    }

    // 更新機能
    async update() {
        // TODO: チャットデータをDBで更新する実装
    }

    // 削除機能
    async delete() {
        if (!this.id) {
            throw new Error('削除するチャットのIDが設定されていません');
        }
        
        try {
            await this.dbAdapter.delete(Chat.CHATS_STORE, this.id);
            console.log(`チャット削除完了: ${this.id}`);
        } catch (error) {
            console.error('Chat.delete error:', error);
            throw error;
        }
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

    // 保存すべきかどうかを判定
    shouldSave() {
        const hasContextNotes = this.contextSummary && this.contextSummary.length > 1;
        const hasResponseReplacements = this.responseReplacer && this.responseReplacer.length > 0;
        
        return (this.messages && this.messages.length > 0) || 
               this.systemPrompt || 
               hasContextNotes || 
               hasResponseReplacements;
    }

    // FIXME: このメソッドは一時的な実装です。将来的に撲滅予定。
    // 現在のstateからChatインスタンスを作成するためのメソッド
    static fromState(state, dbAdapter) {
        return new Chat(
            state.currentChatId,
            '', // タイトルは後で決定
            state.currentMessages || [],
            state.currentChatId ? null : Date.now(), // 新規なら現在時刻、更新なら後で設定
            Date.now(), // updatedAt
            {
                responseReplacer: state.responseReplacer ? state.responseReplacer.getSaveData() : [],
                contextSummary: state.contextNote ? state.contextNote.getSaveData() : [],
                lastSentRequest: state.lastSentRequest || null,
                systemPrompt: state.currentSystemPrompt || '',
                compressedSummary: state.compressedSummary || null,
                pendingAttachments: state.pendingAttachments || []
            },
            dbAdapter
        );
    }
} 