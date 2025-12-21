# Copilot Context: NFC Keychain Journey Features

**Updated**: 2025-12-22
**Language**: 中文（香港）
**Scope**: 功能 A-D 規劃與實現指引

---

## 🎯 專案概況

**NFC Keychain Journey** - 結合實體物件與數位敘事的互動式社交實驗專案。透過 NFC 鎖匙扣的傳遞，記錄每一段情感連結的旅程。

### 核心特點
- 實體與數位一體化：NFC / URL ID 追蹤傳遞路徑
- 情感引導：隨機情緒指令推動傳遞，非隨機贈送
- 旅程歷史：完整足跡與故事記錄
- 即時同步：Supabase 中央資料庫
- 管理員 Dashboard：1-100 號鎖匙扣活躍狀態監控

---

## 📦 新增功能（Phase 1-3）

### Phase 1（第 1-2 週）- 核心 UGC 與個性化
- **功能 A: 冒險者留言 (User-Generated Blessings)**
  - 使用者於頁 6 點擊「留一句祝福」，填寫 Blessing（≤15 字）+ 可選 CodePhrase、OptionalNote
  - 預設隱私 Private；支援舉報與隱藏機制
  - 前端 + 後端雙層 PII 檢測（電話/網址/地址格式）
  - Rate limit：5 分鐘 3 筆
  - **預估**: 35 小時 (5 工作日)

- **功能 D: 小將回應 (Elephant Reactions)**
  - 使用者提交祝福後收到個性化回應氣泡
  - Deterministic Randomness：seed = hash(journey_id + station_number)
  - 初版句庫：50-100 句，Supabase 動態管理，月度迭代
  - 與功能 B 分享卡 ResonanceLine 共用同一句庫 + seed 邏輯
  - **預估**: 25 小時 (3.5 工作日)

### Phase 2（第 3 週）- 分享擴展
- **功能 B: 分享卡 + QR (Share Card with QR)**
  - 頁 5 Share icon 生成分享卡片預覽
  - 3 個 toggle：顯示 From Alias / 我的代號 / 祝福內容（預設 OFF）
  - QR Code 連至公開旅程頁（預設隱藏身份，explicit opt-in）
  - 原生分享表單調用（Facebook/WhatsApp/Email）
  - **預估**: 28 小時 (3.5 工作日)

### Phase 3（第 4 週）- 反饋系統
- **功能 C: 開發者回饋 (Developer Feedback)**
  - 頁 4 菜單「Feedback / 同開發者講」
  - 表單：Category（Bug/Suggestion/Copy/Other）+ Message（≤200 字）+ Screenshot + Email
  - 自動附帶技術資訊（App Version、OS、timestamp、journey_id）
  - 兩層管道：Supabase 持久化 + 可選 Slack/Email 即時通知
  - **預估**: 16 小時 (2 工作日)

---

## 🏗️ 技術堆棧決議

| 層面 | 選擇 | 備註 |
|------|------|------|
| **狀態管理** | Redux / Zustand | 複雜跨頁面狀態 |
| **表單驗證** | React Hook Form + Zod | 輕量 + PII 檢測整合 |
| **PII 檢測** | 正規表達式（前端）+ NLP 或人工（後端） | MVP 階段簡化，後續升級 |
| **QR Code** | qrcode.react | 輕量無依賴 |
| **分享卡圖片** | html2canvas | 跨瀏覽器支援 |
| **後端驗證** | Supabase 邊緣函數 / Node.js 層 | 集中驗證邏輯 |
| **即時通知** | Slack Webhook（可選） | 低成本快速 |
| **測試** | Cypress + Vitest | E2E + 單元 |

---

## 📋 澄清決議與假設

### Q1: PII 檢測實現層級
**決議**: 用戶端 + 後端雙層驗證（選項 C）
- 用戶端：即時反饋，提升 UX；正規表達式檢測
- 後端：防止繞過；複雜邊界情況交由人工審核佇列

### Q2: ResonanceLine 生成策略
**決議**: 與功能 D 共用 Deterministic Randomness（選項 C）
- 分享卡與應用內回應保持一致
- 確保敘事銜接，提升品質與可控性

### Q3: 回饋管道設計
**決議**: 兩層架構 - Supabase 表 + 可選實時通知（選項 C）
- 持久化所有回饋供查詢與分析
- 關鍵回饋（Bug 等）可觸發 Slack 通知加快回應

### Q4: 句庫規模與管理
**決議**: 精簡初版（50-100 句）+ Supabase 動態管理 + 月度迭代（選項 C）
- 初版覆蓋核心情感與儀式感場景
- Supabase 表便於管理員編輯，無需重新部署
- 定期審視反饋指標，動態調整

### Q5: 功能實現優先順序
**決議**: 分階段實現 - Phase 1（A+D）→ Phase 2（B）→ Phase 3（C）（選項 B）
- Phase 1 建立核心 UGC + 個性化迴圈，快速驗證核心價值
- Phase 2 擴展分享覆蓋面（需 D 的句庫）
- Phase 3 收集反饋用於改進

---

## ⚙️ 資料模型摘要

### 核心表（Supabase）
1. **keychains** - 實體鎖匙扣記錄
2. **events** - 轉移事件紀錄（主表）
3. **prompts** - 指令樣板庫
4. **blessings** - 祝福 UGC（新增功能 A）
5. **reports** - 舉報紀錄（新增功能 A）
6. **elephant_reactions** - 回應句庫（新增功能 D）
7. **feedback** - 開發者回饋（新增功能 C）
8. **share_events** - 分享事件日誌（新增功能 B，可選）

---

## 🔍 品質指標

### 效能
- 表單提交時間 ≤ 2 分鐘
- 頁面載入時間 ≤ 3 秒
- API 回應時間 ≤ 500ms
- QR Code 掃描成功率 ≥ 99%

### 安全 & 隱私
- PII 檢測準確率 ≥ 90%
- 隱私洩露事件數 = 0
- Rate limit 有效防止刷屏

### 使用者體驗
- 功能完成率 ≥ 95%
- 使用者滿意度（NPS） ≥ 4/5
- 無冒犯性或不當內容洩露

---

## 🚀 後續行動

1. **確認團隊資源**：前端 1-2 人，後端 1 人，QA 0.5 人
2. **建立開發環境**：分支策略、CI/CD、Supabase 線下環境
3. **啟動 Phase 1**：建立 Jira/GitHub Issues，分配任務，每日同步
4. **建立溝通機制**：風險上報、Code Review、隱私稽核流程

---

## 📚 相關文件

- **主規格**: `/specs/1-nfc-keychain-journey/spec.md`
- **功能規格**: `/specs/{2-5}/spec.md`
- **實現計劃**: `/specs/{1-5}/IMPL_PLAN.md`
- **章程**: `/.specify/memory/constitution.md`

---

**版本**: 1.0 | **簽核**: Pending | **下次審視**: 2025-12-29
