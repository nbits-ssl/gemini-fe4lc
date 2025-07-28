/**
 * ContextNoteUI - ContextNoteのUI関連機能を管理するクラス
 */
class ContextNoteUI extends EventTarget {
    constructor(contextNote, elements) {
        super(); // EventTargetのコンストラクタを呼び出し
        this.contextNote = contextNote;
        this.elements = elements;
    }

	sync(newNote) {
		this.contextNote = newNote;
	}

    renderList() {
        const list = this.elements.contextNotesList;
        list.innerHTML = '';

        if (this.contextNote && this.contextNote.getAllNotes().length > 0) {
            this.contextNote.getAllNotes().forEach((note, index) => {
                const item = this.createItem(note, index);
                list.appendChild(item);
            });
        }
    }

    createItem(note, index) {
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
        
        insertBelowBtn.onclick = () => this.insertBelow(index);
        moveUpBtn.onclick = () => this.move(index, 'up');
        moveDownBtn.onclick = () => this.move(index, 'down');
        editBtn.onclick = () => this.edit(index);
        deleteBtn.onclick = () => this.deleteConfirm(index);

        return item;
    }

    add() {
        const newNote = {
            title: '',
            type: 'keyword',
            content: '',
            keywords: [],
            category: ''
        };

        const item = this.createEditForm(newNote, -1);
        this.elements.contextNotesList.appendChild(item);
        
        // 一番下までスクロール
        setTimeout(() => {
            const tabContent = this.elements.contextNotesTab;
            if (tabContent) {
                tabContent.scrollTop = tabContent.scrollHeight;
            }
            // フォールバック: window全体をスクロール
            window.scrollTo(0, document.body.scrollHeight);
        }, 25);
    }

    createEditForm(note, index) {
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
        
        saveBtn.onclick = () => this.save(index);
        cancelBtn.onclick = () => this.cancelEdit(index);

        return item;
    }

    edit(index) {
        const note = this.contextNote.getAllNotes()[index];
        if (!note) return;

        const list = this.elements.contextNotesList;
        const existingItem = list.querySelector(`[data-index="${index}"]`);
        if (existingItem) {
            const editForm = this.createEditForm(note, index);
            existingItem.replaceWith(editForm);
        }
    }

    save(index) {
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
            this.dispatchEvent(new CustomEvent('showAlert', {
                detail: { message: 'タイトルを入力してください' }
            }));
            return;
        }

        if (!content) {
            this.dispatchEvent(new CustomEvent('showAlert', {
                detail: { message: '内容を入力してください' }
            }));
            return;
        }

        // キーワードはそのまま使用（空の場合はContextNoteクラス側でタイトルをキーワードとして扱う）
        const finalKeywords = keywords;

        if (index === -1) {
            // 新規追加
            const newItem = this.elements.contextNotesList.querySelector('[data-index="-1"]');
            const insertAfterIndex = newItem ? newItem.dataset.insertAfter : null;
            
            if (insertAfterIndex !== null && insertAfterIndex !== undefined) {
                // 指定位置の下に挿入
                const insertIndex = parseInt(insertAfterIndex) + 1;
                this.contextNote.insertNoteAt(insertIndex, type, title, content, finalKeywords, category);
            } else {
                // 最後に追加
                this.contextNote.addNote(type, title, content, finalKeywords, category);
            }
        } else {
            // 編集
            this.contextNote.updateNote(index, type, title, content, finalKeywords, category);
        }

        this.dispatchEvent(new Event('contextNoteSaved'));
        this.renderList();
	}

    deleteConfirm(index) {
        this.dispatchEvent(new CustomEvent('contextNoteDeleteConfirm', {
            detail: { index }
        }));
    }

    delete(index) {
        if (this.contextNote.removeNote(index)) {
            this.renderList();
            this.dispatchEvent(new Event('contextNoteDeleted'));
        }
    }

    cancelEdit(index) {
        if (index === -1) {
            // 新規追加のキャンセル
            const newItem = this.elements.contextNotesList.querySelector('[data-index="-1"]');
            if (newItem) {
                newItem.remove();
            }
        } else {
            // 編集のキャンセル
            this.renderList();
        }
    }

    move(index, direction) {
        let success = false;
        
        if (direction === 'up') {
            success = this.contextNote.moveUp(index);
        } else if (direction === 'down') {
            success = this.contextNote.moveDown(index);
        }
        
        if (success) {
            this.renderList();
            this.dispatchEvent(new Event('contextNoteMoved'));
        }
    }

    insertBelow(index) {
        const newNote = {
            title: '',
            type: 'keyword',
            content: '',
            keywords: [],
            category: ''
        };

        const item = this.createEditForm(newNote, -1);
        const list = this.elements.contextNotesList;
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
    }

    openDirectEditModal() {
        // 現在のContextNoteデータをYAML形式に変換
        const yamlContent = this.contextNote.convertToYAML();
        this.elements.yamlEditor.value = yamlContent;
        this.elements.yamlErrorMessage.classList.add('hidden');
        this.elements.directEditModal.classList.remove('hidden');
    }

    closeDirectEditModal() {
        this.elements.directEditModal.classList.add('hidden');
        this.elements.yamlEditor.value = '';
        this.elements.yamlErrorMessage.classList.add('hidden');
    }

    async saveYamlContent() {
        const yamlText = this.elements.yamlEditor.value.trim();
        
        if (!yamlText) {
            // 空の場合は全てのノートを削除
            this.contextNote.clearNotes();
            this.closeDirectEditModal();
            this.renderList();
            this.dispatchEvent(new Event('contextNoteSaved'));
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
            
            this.contextNote.updateFromYamlArray(notes);

            // エラーメッセージを非表示
            this.elements.yamlErrorMessage.classList.add('hidden');
            
            // モーダルを閉じてリストを更新
            this.closeDirectEditModal();
            this.renderList();
            this.dispatchEvent(new Event('contextNoteSaved'));
            
        } catch (error) {
            console.error('YAMLパースエラー:', error);
            // エラーメッセージを表示
            this.elements.yamlErrorMessage.textContent = `YAMLパースエラー: ${error.message}`;
            this.elements.yamlErrorMessage.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // 追加ボタンのイベントリスナー
        this.elements.addContextNoteBtn.addEventListener('click', () => this.add());

        // 直接編集モーダルイベントリスナー
        this.elements.editContextNotesDirectlyBtn.addEventListener('click', () => this.openDirectEditModal());
        this.elements.closeDirectEditModal.addEventListener('click', () => this.closeDirectEditModal());
        this.elements.saveYamlBtn.addEventListener('click', () => this.saveYamlContent());
        this.elements.cancelYamlBtn.addEventListener('click', () => this.closeDirectEditModal());
        
        // モーダル外クリックで閉じる
        this.elements.directEditModal.addEventListener('click', (event) => {
            if (event.target === this.elements.directEditModal) {
                this.closeDirectEditModal();
            }
        });
    }
} 