# Gemini PWA Client

このリポジトリは、PWA（Progressive Web App）で作られたGemini APIのクライアントアプリケーションです。  
PWAとは実体がhtmlなだけの簡易アプリです。ブラウザがあれば使えます。
単純な文字チャット機能だけでファイルや画像関連の機能はありません。

## 使い方

Github Pagesで公開されたこのページにアクセスするだけです。  

[index.htmlへのリンク(Github Pages)](https://ona-oni.github.io/geminipwa/)
※このリポジトリの内容が静的にアクセスできる

1. GeminiのAPIキーを準備。
2. 上のリンクにアクセス。
3. 設定画面にGemini APIキーを設定して設定を保存。
4. チャット画面からチャット。

## PCのローカルでホストする
Webサイト上のは信用ならんからローカルで使いたい！という人はWindowsのみ下記の方法で使えます。
1. このリポジトリの全ファイルをダウンロードして同じフォルダ内に配置  
（サイト上部の緑の「Code」から「Download ZIP」）
2. __winlocal.batを起動
3. batのプロンプトが開いている間はローカルhttpサーバーからindex.htmlへアクセス可能

## ブラウザからPWAをアプリとしてインストール(任意)
PWAアプリとしてインストールするとアプリアイコンを作成できます。  
ブラウザにより挙動は違いますが、アドレスバーの横や設定ボタンなどから「XXをインストール」の項目を探してください。    
(モバイル用Chromeなら「ホーム画面に追加」が上記操作に相当）  
インストールしなくてもブラウザはPWAアプリをPWAアプリとして扱います。

## ファイルの説明
* manifest.json : PWAアプリの定義
* index.html : アプリそのもの
* sw.js : PWAサービスワーカー(PWAアプリとしてのファイルキャッシュなどを管理)
* marked.js : マークダウン表示用ライブラリ(MIT Lic)  

sw.jsのおかげで一度アクセスしたらブラウザ内に必要ファイル(「index.html」や「manifest.json」など)がキャッシュされる  
一度キャッシュされたら、設定から更新しない限り更新されない

## データの保存と通信について
* 設定やチャット履歴含む全てのデータはローカルのIndexedDBに保存されます。  
（ブラウザの中のデータベース。Github Pagesの当リポジトリのオリジン)
* 通信はGeminiAPIとしか行いません。(検索機能はGemini側の機能です)
* 履歴は履歴一覧からテキストファイルとしてエクスポートできます  
逆(インポート)は今のところ~~できません~~できます  
注:現状、アップロードされたファイルはエクスポートtxtには含まれません

## Dependencies
This project uses the following third-party libraries:

*   **Marked.js:** [MIT License](https://github.com/markedjs/marked/blob/master/LICENSE.md) - Used for rendering Markdown.
