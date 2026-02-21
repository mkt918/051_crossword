# 051_crossword

クロスワードビルダー - 直感的な操作で盤面を作成できるWebアプリケーション。

## システム構成

```mermaid
graph TD
    A[Local PC] -->|Git Push| B(GitHub Repo)
    B -->|Trigger| C{GitHub Actions}
    C -->|Build| D[Vite / React / Tailwind]
    D -->|Deploy| E[GitHub Pages]
    E -->|Show| F((Public URL))
    
    subgraph "Automation Scripts"
        G[start-dev.bat]
        H[push-deploy.bat]
    end
```

## 公開URL

[https://mkt918.github.io/051_crossword/](https://mkt918.github.io/051_crossword/)

## コマンド

- `start-dev.bat`: 依存関係のインストールと開発サーバーの起動。
- `push-deploy.bat`: 変更を保存してGitHubへプッシュ、自動デプロイを実行。

## 特徴

- テンポの良い自動採番
- 文字入力の自動ナビゲーション
- モダンなダークモードUI
