# InsertStackText

1. 作業メモ用のファイル作成(本ファイル)
1. github側でリポジトリ作成
1. wsl上で新規フォルダ作成
1. フォルダ内に以下追加
    - VSCodeのworkspace
    - Dockerfile
    - docker Daemonの有効化とworkspaceを起動するスクリプトファイル
    - .gitignore
1. 最低限の環境で一度コミットしておく
1. workspaceを起動し、拡張機能を利用してコンテナで再度開く
    - dockerImageのビルドが行われるのでしばらく待つ
    - ビルド完了後に再度コミットしておく
