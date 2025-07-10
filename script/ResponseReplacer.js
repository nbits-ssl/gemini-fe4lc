// ResponseReplacer.js - 正規表現置き換え機能

class ResponseReplacer {
    constructor(data = null) {
        this.replacements = []; // 置き換えペアの配列
        
        // データが渡された場合は読み込み
        if (data) {
            this.loadFromData(data);
        }
    }

    // 置き換えペアの追加
    addReplacement(pattern = '', replacement = '') {
        const newReplacement = {
            pattern: pattern,
            replacement: replacement
        };
        this.replacements.push(newReplacement);
        return this.replacements.length - 1; // インデックスを返す
    }

    // 置き換えペアの削除
    removeReplacement(index) {
        if (index >= 0 && index < this.replacements.length) {
            this.replacements.splice(index, 1);
            return true;
        }
        return false;
    }

    // 置き換えペアの順序変更（上に移動）
    moveUp(index) {
        if (index > 0) {
            const temp = this.replacements[index];
            this.replacements[index] = this.replacements[index - 1];
            this.replacements[index - 1] = temp;
            return true;
        }
        return false;
    }

    // 置き換えペアの順序変更（下に移動）
    moveDown(index) {
        if (index >= 0 && index < this.replacements.length - 1) {
            const temp = this.replacements[index];
            this.replacements[index] = this.replacements[index + 1];
            this.replacements[index + 1] = temp;
            return true;
        }
        return false;
    }

    // 置き換えペアの更新
    updateReplacement(index, pattern, replacement) {
        if (index >= 0 && index < this.replacements.length) {
            this.replacements[index].pattern = pattern;
            this.replacements[index].replacement = replacement;
            return true;
        }
        return false;
    }

    // テキストの置き換え実行（各ペアを順番に1回ずつ適用）
    replaceText(text) {
        let result = text;
        
        for (const replacement of this.replacements) {
            if (!replacement.pattern) {
                continue;
            }
            
            try {
                const regex = new RegExp(replacement.pattern, 'g');
                result = result.replace(regex, replacement.replacement);
            } catch (error) {
                console.warn('正規表現置き換えエラー:', error.message, 'パターン:', replacement.pattern);
                // エラーが発生しても処理を続行
                continue;
            }
        }
        
        return result;
    }

    // 置き換えペアの取得
    getReplacements() {
        return [...this.replacements]; // コピーを返す
    }

    // 置き換えペアの設定
    setReplacements(replacements) {
        this.replacements = replacements.map(r => ({
            pattern: r.pattern || '',
            replacement: r.replacement || ''
        }));
    }

    // 置き換えペアのクリア
    clear() {
        this.replacements = [];
    }

    // 有効な置き換えペアの数を取得
    getEnabledCount() {
        return this.replacements.filter(r => r.pattern).length;
    }

    // 設定の保存用データ取得
    getSaveData() {
        return this.replacements.map(r => ({
            pattern: r.pattern,
            replacement: r.replacement
        }));
    }

    // 設定の読み込み
    loadFromData(data) {
        if (Array.isArray(data)) {
            this.setReplacements(data);
        }
    }
}