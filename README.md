# 🐘 NFC Keychain Journey (大象女士)

這是一個結合實體物件與數位敘事的互動式社交實驗專案。透過 NFC 鎖匙扣的傳遞，記錄每一段情感連結的旅程。

## 🌟 專案特點
- **實體與數位結合**：利用 NFC 技術（或 URL ID）追蹤實體鎖匙扣的傳遞路徑。
- **情感引導**：基於隨機產生的情緒指令（例如：「交給最想多謝的人」）來推動傳遞，而非隨機贈送。
- **旅程歷史**：每位持有者都可以查看該鎖匙扣過去的所有站點與故事。
- **即時同步**：整合 Supabase 雲端資料庫，確保所有參與者看到的資訊都是最新且同步的。
- **管理員地圖**：一目了然的 Dashboard，展示 1-100 號鎖匙扣的活躍狀態。

## 🛠️ 技術棧 (Tech Stack)
- **Frontend**: React 18+, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Backend/Database**: Supabase (PostgreSQL)
- **Deployment**: GitHub Pages (Free Hosting)

## 🚀 快速開始

### 1. 環境設定
在專案根目錄建立 `.env` 檔案，或在部署平台的 Secrets 中加入以下變數：
```env
VITE_SUPABASE_URL=你的_Supabase_專案網址
VITE_SUPABASE_ANON_KEY=你的_Supabase_匿名金鑰
```

### 2. 本地開發
```bash
npm install
npm run dev
```

### 3. 資料庫結構 (Supabase)
請在 Supabase 建立名為 `NFC Keychain Journey events` 的資料表，欄位如下：
- `id`: int8 (Primary Key, Auto-increment)
- `keychain_id`: text (鎖匙扣編號)
- `timestamp`: int8 (時間戳記)
- `from_name`: text (贈送者)
- `to_name`: text (接收者)
- `prompt_key`: text (收到的原因代碼)
- `prompt_text`: text (收到的原因文字)
- `next_prompt_key`: text (下一個指令代碼)
- `next_prompt_text`: text (下一個指令文字)

## 📦 部署到 GitHub Pages (100% 免費)

本專案已優化，支援完全免費的自動化部署：

1. **修改 package.json**:
   確保 `homepage` 欄位指向你的 GitHub 網址：`https://[你的帳號].github.io/[倉庫名稱]`。

2. **執行部署指令**:
   ```bash
   npm run deploy
   ```
   這會自動執行打包 (Build) 並將結果推送到 `gh-pages` 分支。

3. **啟用 GitHub Pages**:
   前往 GitHub 倉庫設定 -> Pages，選擇 `gh-pages` 分支作為來源。

## 🐘 關於「大象女士」
這不只是一個鎖匙扣，它是一個情感的載體。
> 「請你把呢個鎖匙扣，交畀你最想祝福嘅人，等我可以認識到佢。」

---
*Created with ❤️ for the community.*