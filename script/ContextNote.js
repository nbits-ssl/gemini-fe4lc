/**
 * ContextNote - コンテキストノート管理クラス
 * キーワードマッチングやランダム選択で動的にAIに情報を提供する機能
 */
class ContextNote {
    constructor(data = null) {
        this.notes = []; // ノートの配列
        this.settings = {
            randomFrequency: 0.3, // ランダム選択の確率（0.0-1.0）
            randomCount: 1,       // ランダム選択するノートの数
            keywordMatchEnabled: true, // キーワードマッチングの有効/無効
            alwaysSendEnabled: true    // 常時送信の有効/無効
        };
        
        // データが渡された場合は読み込み
        if (data) {
            this.loadFromData(data);
        }
    }

    /**
     * ノートを追加
     * @param {string} type - ノートのタイプ ('moment' または 'keyword')
     * @param {string} title - ノートのタイトル
     * @param {string} content - ノートの内容（1行目がサマリーとして扱われる）
     * @param {string[]} keywords - キーワード配列
     * @param {string} category - カテゴリ（空欄可）
     * @returns {number} 追加されたノートのインデックス
     */
    addNote(type, title, content, keywords = [], category = '') {
        if (!['moment', 'keyword'].includes(type)) {
            throw new Error('Invalid type. Must be "moment" or "keyword"');
        }

        const lines = content.split('\n');
        const summary = lines[0] || '';

        const newNote = {
            type: type,
            title: title,
            content: content,
            summary: summary,
            keywords: keywords,
            category: category || ''
        };

        this.notes.push(newNote);
        return this.notes.length - 1; // インデックスを返す
    }

    /**
     * 指定位置にノートを挿入
     * @param {number} index - 挿入する位置のインデックス
     * @param {string} type - ノートのタイプ ('moment' または 'keyword')
     * @param {string} title - ノートのタイトル
     * @param {string} content - ノートの内容（1行目がサマリーとして扱われる）
     * @param {string[]} keywords - キーワード配列
     * @param {string} category - カテゴリ（空欄可）
     * @returns {number} 挿入されたノートのインデックス
     */
    insertNoteAt(index, type, title, content, keywords = [], category = '') {
        if (!['moment', 'keyword'].includes(type)) {
            throw new Error('Invalid type. Must be "moment" or "keyword"');
        }

        const lines = content.split('\n');
        const summary = lines[0] || '';

        const newNote = {
            type: type,
            title: title,
            content: content,
            summary: summary,
            keywords: keywords,
            category: category || ''
        };

        // 指定位置に挿入
        this.notes.splice(index, 0, newNote);
        return index; // 挿入されたインデックスを返す
    }

    /**
     * ノートを削除
     * @param {number} index - 削除するノートのインデックス
     * @returns {boolean} 削除が成功したかどうか
     */
    removeNote(index) {
        if (index >= 0 && index < this.notes.length) {
            this.notes.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * ノートを更新
     * @param {number} index - 更新するノートのインデックス
     * @param {string} type - ノートのタイプ
     * @param {string} title - ノートのタイトル
     * @param {string} content - ノートの内容
     * @param {string[]} keywords - キーワード配列
     * @param {string} category - カテゴリ（空欄可）
     * @returns {boolean} 更新が成功したかどうか
     */
    updateNote(index, type, title, content, keywords = [], category = '') {
        if (index >= 0 && index < this.notes.length) {
            const lines = content.split('\n');
            const summary = lines[0] || '';

            this.notes[index] = {
                type: type,
                title: title,
                content: content,
                summary: summary,
                keywords: keywords,
                category: category || ''
            };
            return true;
        }
        return false;
    }

    /**
     * ノートの順序変更（上に移動）
     * @param {number} index - 移動するノートのインデックス
     * @returns {boolean} 移動が成功したかどうか
     */
    moveUp(index) {
        if (index > 0) {
            const temp = this.notes[index];
            this.notes[index] = this.notes[index - 1];
            this.notes[index - 1] = temp;
            return true;
        }
        return false;
    }

    /**
     * ノートの順序変更（下に移動）
     * @param {number} index - 移動するノートのインデックス
     * @returns {boolean} 移動が成功したかどうか
     */
    moveDown(index) {
        if (index >= 0 && index < this.notes.length - 1) {
            const temp = this.notes[index];
            this.notes[index] = this.notes[index + 1];
            this.notes[index + 1] = temp;
            return true;
        }
        return false;
    }

    /**
     * キーワードマッチングを実行
     * @param {string} text - マッチング対象のテキスト
     * @returns {string} マッチしたノートの文字列
     */
    getKeywordMatches(text) {
        if (!this.settings.keywordMatchEnabled) {
            return '';
        }

        const matchedNotes = [];
        
        for (const note of this.notes) {
            // キーワードが空の場合はタイトルをキーワードとして扱う
            const keywords = note.keywords.length > 0 ? note.keywords : [note.title];
            
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    matchedNotes.push(note);
                    break; // 1つのノートで1つのキーワードがマッチしたら十分
                }
            }
        }

        return this.buildNoteString(matchedNotes);
    }

    /**
     * キーワードマッチしたノート配列を取得
     * @param {string} text - マッチング対象のテキスト
     * @returns {Object[]} マッチしたノート配列
     */
    getKeywordMatchedNotes(text) {
        if (!this.settings.keywordMatchEnabled) {
            return [];
        }

        const matchedNotes = [];
        
        for (const note of this.notes) {
            // キーワードが空の場合はタイトルをキーワードとして扱う
            const keywords = note.keywords.length > 0 ? note.keywords : [note.title];
            
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    matchedNotes.push(note);
                    break; // 1つのノートで1つのキーワードがマッチしたら十分
                }
            }
        }

        return matchedNotes;
    }

    /**
     * ランダム選択を実行
     * @returns {string} ランダム選択されたノートの文字列
     */
    getRandomMatches() {
        // モーメントタイプのノートのみを対象とする
        const momentNotes = this.notes.filter(note => note.type === 'moment');
        
        if (momentNotes.length === 0) {
            return '';
        }

        const randomCount = Math.min(this.settings.randomCount, momentNotes.length);
        const shuffled = [...momentNotes].sort(() => 0.5 - Math.random());
        const selectedNotes = shuffled.slice(0, randomCount);

        return this.buildNoteString(selectedNotes);
    }

    /**
     * 指定された数のランダム選択を実行
     * @param {number} count - 選択するノートの数
     * @returns {string} ランダム選択されたノートの文字列
     */
    getRandomMatchesWithCount(count) {
        // モーメントタイプのノートのみを対象とする
        const momentNotes = this.notes.filter(note => note.type === 'moment');
        
        if (momentNotes.length === 0) {
            return '';
        }

        const randomCount = Math.min(count, momentNotes.length);
        const shuffled = [...momentNotes].sort(() => 0.5 - Math.random());
        const selectedNotes = shuffled.slice(0, randomCount);

        return this.buildNoteString(selectedNotes);
    }

    /**
     * 指定された数のランダム選択を実行（配列を返す）
     * @param {number} count - 選択するノートの数
     * @returns {Object[]} ランダム選択されたノート配列
     */
    getRandomMatchedNotesArray(count) {
        // モーメントタイプのノートのみを対象とする
        const momentNotes = this.notes.filter(note => note.type === 'moment');
        
        if (momentNotes.length === 0) {
            return [];
        }

        const randomCount = Math.min(count, momentNotes.length);
        const shuffled = [...momentNotes].sort(() => 0.5 - Math.random());
        const selectedNotes = shuffled.slice(0, randomCount);

        return selectedNotes;
    }

    /**
     * 全ノートのサマリー文字列を取得（カテゴリ別に整理）
     * @returns {string} 全ノートのサマリー文字列
     */
    getAllNotesSummary() {
        if (!this.settings.alwaysSendEnabled) {
            return '';
        }

        const summaryNotes = this.notes.filter(note => note.summary);
        return this.buildCategorizedSummaryString(summaryNotes);
    }

    /**
     * マッチしたノートの文字列を取得（キーワードマッチ+ランダムマッチ）
     * @param {string} text - マッチング対象のテキスト
     * @param {number} randomFrequency - ランダム選択の確率（0.0-1.0）
     * @param {number} randomCount - ランダム選択するノートの数
     * @returns {Object} { text: string, charCount: number, matchCount: number } マッチしたノートの情報
     */
    getMatchedNotesString(text, randomFrequency = 0.3, randomCount = 1) {
        // キーワードマッチのノート配列を取得
        const keywordMatchedNotes = this.getKeywordMatchedNotes(text);
        
        // ランダム選択の確率に基づいて実行
        let randomMatchedNotes = [];
        if (Math.random() < randomFrequency) {
            randomMatchedNotes = this.getRandomMatchedNotesArray(randomCount);
        }
        
        // 全マッチしたノートを結合
        const allMatchedNotes = [...keywordMatchedNotes, ...randomMatchedNotes];
        
        // 文字列を生成
        const resultText = this.buildNoteString(allMatchedNotes);
        
        return {
            text: resultText,
            charCount: resultText.length,
            matchCount: allMatchedNotes.length
        };
    }

    /**
     * ノート配列から文字列をビルド
     * @param {Object[]} notes - ノート配列
     * @returns {string} ビルドされた文字列
     */
    buildNoteString(notes) {
        if (notes.length === 0) {
            return '';
        }

        return notes.map(note => {
            return `【${note.title}】\n${note.content}`;
        }).join('\n\n');
    }

    /**
     * サマリー文字列をビルド（タイトル+サマリー）
     * @param {Object[]} notes - ノート配列
     * @returns {string} ビルドされた文字列
     */
    buildSummaryString(notes) {
        if (notes.length === 0) {
            return '';
        }

        return notes.map(note => {
            return `${note.title}：${note.summary}`;
        }).join('\n');
    }

    /**
     * カテゴリ別サマリー文字列をビルド
     * @param {Object[]} notes - ノート配列
     * @returns {string} ビルドされた文字列
     */
    buildCategorizedSummaryString(notes) {
        if (notes.length === 0) {
            return '';
        }

        // カテゴリなしのノートを最初に取得（順番通り）
        const noCategoryNotes = notes.filter(note => !note.category || note.category.trim() === '');
        
        // カテゴリありのノートをカテゴリ別にグループ化
        const categorizedNotes = {};
        notes.forEach(note => {
            if (note.category && note.category.trim() !== '') {
                const category = note.category.trim();
                if (!categorizedNotes[category]) {
                    categorizedNotes[category] = [];
                }
                categorizedNotes[category].push(note);
            }
        });

        const result = [];

        // 1. カテゴリなしのノートを最初に追加（順番通り）
        if (noCategoryNotes.length > 0) {
            const noCategorySummary = noCategoryNotes.map(note => {
                return `${note.title}：${note.summary}`;
            }).join('\n');
            result.push(noCategorySummary);
        }

        // 2. カテゴリ別のノートを追加
        Object.keys(categorizedNotes).forEach(category => {
            const categoryNotes = categorizedNotes[category];
            const categorySummary = categoryNotes.map(note => {
                return `${note.title}：${note.summary}`;
            }).join('\n');
            result.push(`[${category}]\n${categorySummary}`);
        });

        return result.join('\n\n');
    }

    /**
     * 設定を更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * 全ノートを取得
     * @returns {Object[]} ノート配列
     */
    getAllNotes() {
        return [...this.notes];
    }

    /**
     * ノートをクリア
     */
    clearNotes() {
        this.notes = [];
    }

    /**
     * 設定の保存用データ取得
     * @returns {Object[]} 保存用データ
     */
    getSaveData() {
        return this.notes.map(note => ({
            type: note.type,
            title: note.title,
            content: note.content,
            keywords: note.keywords,
            category: note.category || ''
        }));
    }

    /**
     * 設定の読み込み
     * @param {Object[]} data - 読み込むデータ
     */
    loadFromData(data) {
        if (Array.isArray(data)) {
            this.notes = data.map(note => {
                const lines = note.content.split('\n');
                const summary = lines[0] || '';
                return {
                    type: note.type || 'keyword',
                    title: note.title || '',
                    content: note.content || '',
                    summary: summary,
                    keywords: note.keywords || [],
                    category: note.category || ''
                };
            });
        } else {
            console.warn('ContextNote.loadFromData: 無効なデータ形式:', data);
            this.notes = [];
        }
    }
} 