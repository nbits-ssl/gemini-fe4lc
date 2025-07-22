// ResponseReplacer.js - 正規表現置き換え機能

const DEFAULT_YAML = `# レスポンス置き換え設定
# 以下の形式で置き換えルールを追加してください
# 各ルールは「---」で区切ります

# 例: 「こんにちは」を「Hello」に置換
# pattern: こんにちは
# replacement: Hello

# 例: 正規表現で「あ+」（1個以上の「あ」）を「あ」に置換
# pattern: あ+
# replacement: あ

# 例: キャプチャグループを使用（「Mr. 名前」を「名前さん」に置換）
# pattern: Mr\\. (\\w+)
# replacement: $1さん

`;

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

    updateFromYamlArray(yamlArray) {
        // YAMLデータから置換ルールをセット
        const replacements = yamlArray
            .filter(item => item && typeof item === 'object' && item.pattern !== undefined)
            .map(item => ({
                pattern: item.pattern || '',
                replacement: item.replacement || ''
            }));
        this.setReplacements(replacements);
    }

    convertToYAML() {
        if (!this.replacements || this.replacements.length === 0) {
            return DEFAULT_YAML;
        }
        let yaml = '';
        this.replacements.forEach((rep, index) => {
            if (index > 0) yaml += '\n---\n\n';
            yaml += `pattern: ${rep.pattern}\n`;
            yaml += `replacement: ${rep.replacement ?? ''}\n`;
        });
        return yaml;
    }
}