/**
 * ResponseReplacerUI - ResponseReplacerのUI関連機能を管理するクラス
 */
class ResponseReplacerUI extends EventTarget {
    constructor(responseReplacer, elements) {
        super(); // EventTargetのコンストラクタを呼び出し
        this.responseReplacer = responseReplacer;
        this.elements = elements;
    }

    sync(newReplacer) {
        this.responseReplacer = newReplacer;
    }

    renderList() {
        const list = this.elements.responseReplacementsList;
        list.innerHTML = '';

        if (this.responseReplacer && this.responseReplacer.replacements.length > 0) {
            this.responseReplacer.replacements.forEach((replacement, index) => {
                const item = this.createItem(replacement, index);
                list.appendChild(item);
            });
        }
    }

    createItem(replacement, index) {
        const item = document.createElement('div');
        item.className = 'response-replacement-item';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="response-replacement-form">
                <div class="response-replacement-form-row">
                    <input type="text" id="fe4lc-avoid-pattern-${index}" name="fe4lc-avoid-pattern" value="${replacement.pattern}" class="replacement-input" disabled autocomplete="off">
                    <span class="replacement-arrow">➡️</span>
                    <input type="text" id="fe4lc-avoid-replacement-${index}" name="fe4lc-avoid-replacement" value="${replacement.replacement}" class="replacement-input" disabled autocomplete="off">
                </div>
                <div class="response-replacement-form-actions">
                    <button class="move-up-btn" title="上に移動">🔼</button>
                    <button class="move-down-btn" title="下に移動">🔽</button>
                    <button class="edit-btn" title="編集">編集</button>
                    <button class="delete-btn" title="削除">削除</button>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        const moveUpBtn = item.querySelector('.move-up-btn');
        const moveDownBtn = item.querySelector('.move-down-btn');
        const editBtn = item.querySelector('.edit-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        moveUpBtn.onclick = () => this.move(index, 'up');
        moveDownBtn.onclick = () => this.move(index, 'down');
        editBtn.onclick = () => this.edit(index);
        deleteBtn.onclick = () => this.deleteConfirm(index);

        return item;
    }

    add() {
        const newReplacement = {
            pattern: '',
            replacement: ''
        };

        const item = this.createEditForm(newReplacement, -1);
        this.elements.responseReplacementsList.appendChild(item);
        
        // 一番下までスクロール
        setTimeout(() => {
            const tabContent = this.elements.responseReplacementsTab;
            if (tabContent) {
                tabContent.scrollTop = tabContent.scrollHeight;
            }
            // フォールバック: window全体をスクロール
            window.scrollTo(0, document.body.scrollHeight);
        }, 25);
    }

    createEditForm(replacement, index) {
        const item = document.createElement('div');
        item.className = 'response-replacement-item';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="response-replacement-form">
                <div class="response-replacement-form-row">
                    <input type="text" id="fe4lc-avoid-edit-pattern-${index}" name="fe4lc-avoid-edit-pattern" value="${replacement.pattern || ''}" placeholder="検索パターン (正規表現)" class="replacement-input" autocomplete="off">
                    <span class="replacement-arrow">➡️</span>
                    <input type="text" id="fe4lc-avoid-edit-replacement-${index}" name="fe4lc-avoid-edit-replacement" value="${replacement.replacement || ''}" placeholder="置換テキスト" class="replacement-input" autocomplete="off">
                </div>
                <div class="response-replacement-form-actions">
                    <button class="save-btn" title="保存">保存</button>
                    <button class="cancel-btn" title="キャンセル">キャンセル</button>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        const saveBtn = item.querySelector('.save-btn');
        const cancelBtn = item.querySelector('.cancel-btn');
        
        saveBtn.onclick = () => this.save(index);
        cancelBtn.onclick = () => this.cancelEdit(index);

        return item;
    }

    edit(index) {
        const replacement = this.responseReplacer.replacements[index];
        if (!replacement) return;

        const list = this.elements.responseReplacementsList;
        const existingItem = list.querySelector(`[data-index="${index}"]`);
        if (existingItem) {
            const editForm = this.createEditForm(replacement, index);
            existingItem.replaceWith(editForm);
        }
    }

    save(index) {
        const patternInput = document.getElementById(`fe4lc-avoid-edit-pattern-${index}`);
        const replacementInput = document.getElementById(`fe4lc-avoid-edit-replacement-${index}`);

        if (!patternInput || !replacementInput) return;

        const pattern = patternInput.value.trim();
        const replacement = replacementInput.value;

        if (!pattern) {
            this.dispatchEvent(new CustomEvent('showAlert', {
                detail: { message: '検索パターンを入力してください' }
            }));
            return;
        }

        // 正規表現の妥当性チェック
        try {
            new RegExp(pattern);
        } catch (e) {
            this.dispatchEvent(new CustomEvent('showAlert', {
                detail: { message: '無効な正規表現です' }
            }));
            return;
        }

        if (index === -1) {
            // 新規追加
            this.responseReplacer.addReplacement(pattern, replacement);
        } else {
            // 編集
            this.responseReplacer.updateReplacement(index, pattern, replacement);
        }

        this.dispatchEvent(new Event('replacementSaved'));
        this.renderList();
    }

    deleteConfirm(index) {
        this.dispatchEvent(new CustomEvent('replacementDeleteConfirm', {
            detail: { index }
        }));
    }

    delete(index) {
        this.responseReplacer.replacements.splice(index, 1);
        this.renderList();
        this.dispatchEvent(new Event('replacementDeleted'));
    }

    cancelEdit(index) {
        if (index === -1) {
            // 新規追加のキャンセル
            const newItem = this.elements.responseReplacementsList.querySelector('[data-index="-1"]');
            if (newItem) {
                newItem.remove();
            }
        } else {
            // 編集のキャンセル
            this.renderList();
        }
    }

    move(index, direction) {
        const replacements = this.responseReplacer.replacements;
        
        if (direction === 'up' && index > 0) {
            // 上に移動
            [replacements[index], replacements[index - 1]] = [replacements[index - 1], replacements[index]];
        } else if (direction === 'down' && index < replacements.length - 1) {
            // 下に移動
            [replacements[index], replacements[index + 1]] = [replacements[index + 1], replacements[index]];
        } else {
            // 移動できない場合は何もしない
            return;
        }
		
        this.renderList();
        this.dispatchEvent(new Event('replacementMoved'));
    }

    openDirectEditModal() {
        // 現在のレスポンス置き換えデータをYAML形式に変換
        const yamlContent = this.responseReplacer.convertToYAML();
        this.elements.responseReplacementsYamlEditor.value = yamlContent;
        this.elements.responseReplacementsYamlErrorMessage.classList.add('hidden');
        this.elements.responseReplacementsDirectEditModal.classList.remove('hidden');
    }

    closeDirectEditModal() {
        this.elements.responseReplacementsDirectEditModal.classList.add('hidden');
        this.elements.responseReplacementsYamlEditor.value = '';
        this.elements.responseReplacementsYamlErrorMessage.classList.add('hidden');
    }

    async saveYamlContent() {
        const yamlText = this.elements.responseReplacementsYamlEditor.value.trim();
        
        if (!yamlText) {
            // 空の場合は全ての置き換えを削除
            if (this.responseReplacer) {
                this.responseReplacer.clear();
            }
            this.closeDirectEditModal();
            this.renderList();
            this.dispatchEvent(new Event('replacementSaved'));
            return;
        }

        try {
            // js-yamlでパース（複数ドキュメント対応）
            const parsedData = jsyaml.loadAll(yamlText);
            
            // 空のドキュメントをフィルタリング
            const replacements = parsedData.filter(doc => doc && typeof doc === 'object');
            
            if (replacements.length === 0) {
                throw new Error('有効な置き換えルールが見つかりません');
            }
            
            this.responseReplacer.updateFromYamlArray(replacements);

            // エラーメッセージを非表示
            this.elements.responseReplacementsYamlErrorMessage.classList.add('hidden');
            
            // モーダルを閉じてリストを更新
            this.closeDirectEditModal();
            this.renderList();
            this.dispatchEvent(new Event('replacementSaved'));
            
        } catch (error) {
            console.error('レスポンス置き換えYAMLパースエラー:', error);
            // エラーメッセージを表示
            this.elements.responseReplacementsYamlErrorMessage.textContent = `YAMLパースエラー: ${error.message}`;
            this.elements.responseReplacementsYamlErrorMessage.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // 追加ボタンのイベントリスナー
        this.elements.addResponseReplacementBtn.addEventListener('click', () => this.add());
        
        // レスポンス置き換え直接編集モーダルイベントリスナー
        this.elements.editResponseReplacementsDirectlyBtn.addEventListener('click', () => this.openDirectEditModal());
        this.elements.closeResponseReplacementsDirectEditModal.addEventListener('click', () => this.closeDirectEditModal());
        this.elements.saveResponseReplacementsYamlBtn.addEventListener('click', () => this.saveYamlContent());
        this.elements.cancelResponseReplacementsYamlBtn.addEventListener('click', () => this.closeDirectEditModal());
        
        // レスポンス置き換えモーダル外クリックで閉じる
        this.elements.responseReplacementsDirectEditModal.addEventListener('click', (event) => {
            if (event.target === this.elements.responseReplacementsDirectEditModal) {
                this.closeDirectEditModal();
            }
        });
    }
} 