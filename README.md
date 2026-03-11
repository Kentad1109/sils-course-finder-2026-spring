# SILS Course Finder 2026 Spring

早稲田SILSの2026春学期開講科目を、検索・Pick・時間割で見れるサイト。

## Development

```bash
cd "/Users/kenta/春学期アプリ作成"
npm install
npm run generate:data
npm run dev
```

## Deploy (GitHub Pages)

- `main` にpushすると GitHub Actions でビルドされ、GitHub Pages にデプロイされます。
- Pages の Source は **GitHub Actions** に設定してください。

