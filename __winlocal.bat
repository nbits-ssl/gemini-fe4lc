/** > nul 2>&1
cd /d %~dp0
@echo off
@SET PS_SCRIPT= Add-Type -TypeDefinition (Get-Content -Encoding UTF8 -Path '%~f0' -Raw) -ReferencedAssemblies @('System.Runtime.dll','System.Web.dll','System.Web.Extensions.dll'); [EasyFaceHTTPServer]::Main(0);
powershell.exe -noprofile -executionpolicy bypass -command "%PS_SCRIPT%"
pause */
using System;
using System.IO;
using System.Net;
using System.Web; // MimeMapping と HttpUtility のために必要
using System.Diagnostics;
using System.Threading.Tasks;

public class EasyFaceHTTPServer {
    public static void Main(string[] args) {
        var URL = "http://localhost:8074/";// ※ポート番号を変えたいならここを編集※
        var listener = new HttpListener();
        listener.Prefixes.Add(URL);
        listener.Start();

        // --- 修正 ---: カレントディレクトリの絶対パスを取得
        string currentDirectory = Path.GetFullPath(Directory.GetCurrentDirectory());
        Console.WriteLine("\n【このプロンプトウィンドウを閉じればローカルサーバー終了】\n => ["+ URL+"]でローカルサーバーが待機中");

        // PCのブラウザを起動、ローカルホストへHTML要求
        // デフォルトで index.html を開くように修正（より一般的）
        Process.Start(new ProcessStartInfo {FileName = URL + "index.html", UseShellExecute = true});

        while (true) {// リクエストがあるまで停止、あれば非同期で処理
            HttpListenerContext ctx = listener.GetContext();
            Task.Run(async () => {
                HttpListenerResponse response = ctx.Response;
                string requestedPathForLog = "(unknown)"; // ログ用変数
                try {
                    // デコードして先頭のスラッシュを除去
                    string relativePath = HttpUtility.UrlDecode(ctx.Request.Url.LocalPath.TrimStart('/'));
                    requestedPathForLog = relativePath; // ログ用

                    // --- 修正 ---: デフォルトドキュメント (index.html) の処理
                    if (string.IsNullOrEmpty(relativePath) || relativePath.EndsWith("/")) {
                         relativePath = Path.Combine(relativePath, "index.html");
                    }
                    Console.WriteLine(" request: " + relativePath);

                    // パスの検証処理
                    
                    // 絶対パスに変換・正規化 (../ などに対応)
                    string fullPath = Path.GetFullPath(Path.Combine(currentDirectory, relativePath));

                    // 正規化されたパスがカレントディレクトリ、またはそのサブディレクトリ内にあるかチェック
                    // カレントディレクトリ自体へのアクセスも許可 (fullPath == currentDirectory)
                    // サブディレクトリは、カレントパス + 区切り文字で始まるかで判定
                    // Path.DirectorySeparatorChar は OS に応じた区切り文字 (\ または /)
                    if (!(fullPath.StartsWith(currentDirectory + Path.DirectorySeparatorChar) || fullPath == currentDirectory))
                    {
                        Console.WriteLine("::Access Denied (Outside Root)::");
                        response.StatusCode = 403; // Forbidden
                        return;
                    }

                    // ファイルが存在するかチェック (ディレクトリへのアクセスもここで弾かれる)
                    if (!File.Exists(fullPath)) {
                        Console.WriteLine("::Not Found::");
                        response.StatusCode = 404; // Not Found
                        return;
                    }

                    // filePath を fullPath に変更してファイル読み込み
                    byte[] buffer = await Task.Run(() => File.ReadAllBytes(fullPath));
                    response.ContentType = MimeMapping.GetMimeMapping(fullPath);
                    response.ContentLength64 = buffer.Length;
                    await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);

                } catch {response.StatusCode = 500;} finally {response.Close();}
            });
        }
    }
}