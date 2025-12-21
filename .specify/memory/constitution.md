# NFC Keychain Journey Constitution

## Core Principles

### I. 故事優先、同意優先（Story-First, Consent-First）

以「大象女士（Matriarch）—小將（Scout/Envoy）—冒險者（Adventurer）」嘅語境去設計每一個流程。

- 所有互動都要清楚交代「你而家做緊乜、會留下乜、可以唔可以唔做」，避免含糊引導。
- 任何涉及分享／轉交／記錄嘅行為，都必須係用戶主動確認（Explicit Consent）。
- 任務提示（Quest Prompt）要「有意義但唔施壓」：鼓勵把小將交畀重要嘅人，但永遠提供跳過、改題、或選「關係代號」嘅選項。

### II. 私隱內建（Privacy by Design）與資料最小化（Data Minimization）

只收集維持旅程所需嘅最少資料，預設保護身份。

- 預設只記錄：站點序號（Station）、時間（Timestamp）、暱稱/代號（Nickname/Alias）、任務標籤（Quest Tag）、可選祝福（Blessing）與可選暗號（Code Phrase）。
- 禁止／避免收集可識別個人資料（PII, Personally Identifiable Information）：真名、電話、地址、公司、學校等。
- 所有輸入欄位要有「唔使真名」提示；對可疑內容提供即時提醒與遮罩（Redaction）。
- 任何分享（Share）都要預覽（Preview）＋可刪除（Delete/Remove）本地可見內容；若有雲端同步，必須清楚說明保留政策（Retention）。

### III. 旅程可信（Journey Integrity）與可追溯（Provenance）

「足跡（Trail）」要可信，但唔用監控方式做到。

- 每次交接需記錄「來自誰（From Alias）」與「下一站任務（Next Quest）」，形成可追溯鏈（Provenance Chain）。
- NFC 掃描（NFC Scan）只作為「識別小將」入口，不把裝置資訊當身份。
- 防止重複／惡意刷站：加入節流（Rate Limiting）、簡單一致性檢查、以及站點狀態（Active/Waiting）保護。
- 所有狀態變更要可解釋：用戶能理解點解某站係「待接（Waiting）」或點解未能更新。

### IV. 微文案（Microcopy）一致：溫柔、儀式感、少少冒險

文案係產品功能一部分，需有一致語氣規範。

- 以「委託（Commission）／交接（Handoff）／足跡（Trail）」為核心詞彙；避免令人誤會要“認親”。
- 每頁只講一件事：主標（Headline）清晰、副標（Subhead）解釋、行動（CTA）直接。
- 任務卡（Mission Card / Quest Card）要可輪換，並提供「換一題」與「我想自訂」。
- 支援中英混排但保持可讀：專有名詞以英文括註一次即可（例如 Quest Prompt）。

### V. 可靠又易用：NFC 優先、離線可用（Offline-First）、無障礙（Accessibility）

旅程要順、要快、要照顧不同能力與情境。

- 首屏與掃描回應要快；錯誤要可恢復（Recoverable Errors）。
- 離線（Offline）情況下可暫存站點更新，連線後再同步（Sync）。
- 無障礙（Accessibility, a11y）為必需：字級縮放、對比度、可用 VoiceOver/TalkBack 操作。
- 所有互動都有替代路徑：無 NFC／掃描失敗可用手動碼（Manual Code）或連結（Link）繼續。

## II. 安全、內容與平台約束（Security, Content & Platform Constraints）

### 安全（Security）

- 通訊必須使用 TLS；敏感設定與金鑰使用安全儲存（Secure Storage）。
- 輸入內容要做基本過濾：連結、電話、地址等提示風險；避免注入（Injection）與 XSS。
- 任何管理／刪除操作要有權限與審計（Audit Log），並避免「靠隱藏入口」處理。

### 內容安全（Safety）

- 任務提示避免操控或羞辱語氣；禁止鼓吹危險或非法行為。
- 若用戶輸入涉及自殘/他害風險（Self-harm/Violence），必須提供安全提示與導向。

### 平台（Platform）

- iOS/Android NFC 行為差異需在 UX 上被吸收；版本相容策略要明確。
- 所有日期/時間顯示使用本地時區（Local Timezone）並清楚標示。

## III. 開發流程與品質門檻（Development Workflow & Quality Gates）

### 工作流（Workflow）

- 需求 → 文案（Microcopy）→ 原型（Prototype）→ 實作（Implementation）→ 測試（Testing）→ 上線（Release）。
- 新功能必須先寫「使用者路徑（User Flow）」同「失敗路徑（Failure Flow）」。

### 測試（Testing）

- 重要路徑必需有自動化測試：NFC 掃描、身份確認、建立站點、更新足跡、分享預覽。
- 對資料最小化與 PII 避免要有測試用例（Test Cases）。

### 觀測（Observability）

- 需有結構化日誌（Structured Logging）與錯誤追蹤（Error Tracking）。
- 指標（Metrics）聚焦體驗：掃描成功率、完成交接率、離線同步成功率、崩潰率。

### 發佈（Release）

- 任何會改變「足跡資料結構」或「分享內容」嘅變更，視為破壞性改動（Breaking Change），需提供遷移（Migration）與回滾（Rollback）方案。

## Governance

- 本 Constitution 高於任何個人偏好與臨時決定；如有衝突，以本文件為準。
- 任何新增/修改任務提示（Quest Prompt）或文案規範，都需要經過：產品（Product）＋內容（Content）＋私隱（Privacy）審核。
- 任何新增資料欄位（Data Field）都必須寫明：用途（Purpose）、保留期（Retention）、可刪除性（Deletion）。

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
