# Implementation Plan: NFC Keychain Journey (主規格)

**Branch**: `1-nfc-keychain-journey`
**Status**: Planning
**Created**: 2025-12-22

## 📋 目標與里程碑

### 短期（第 0-1 週）- 基礎設施與資料模型
- [ ] 確認 Supabase schema（5 表：Keychain, Event, Prompt, Blessing, ElephantReaction）
- [ ] 設置應用程式狀態管理（Redux 或 Zustand）
- [ ] 建立 API 層（Supabase client 封裝）

### 中期（第 2-4 週）- Phase 1：功能 A + D 核心迴圈
- [ ] 實現功能 A（冒險者留言 UGC）- 前端 + 後端驗證
- [ ] 實現功能 D（小將回應）- 句庫與 Deterministic Randomness
- [ ] 整合測試（A + D 互動流）

### 後期（第 5-6 週）- Phase 2：功能 B + C 擴展
- [ ] 實現功能 B（分享卡 + QR）
- [ ] 實現功能 C（開發者回饋）
- [ ] 全系統整合測試

---

## 📊 功能細分與工作量估算

### 功能 A - 冒險者留言（User-Generated Blessings）

| 工作項 | 預估時間 | 優先級 | 備註 |
|--------|---------|--------|------|
| **前端** | | | |
| 設計 Bottom Sheet 表單（Blessing + CodePhrase + OptionalNote） | 4h | P1 | 複用現有 UI 元件 |
| 實現表單驗證（字數限制、PII 檢測） | 6h | P1 | 用戶端正規表達式檢測 |
| 頁 5 足跡卡片顯示祝福內容 | 3h | P1 | 新增欄位渲染 |
| 站點卡片 menu（舉報功能） | 2h | P2 | 簡單 modal 或 context menu |
| **後端** | | | |
| 新增 `blessings` 表与 API 端點 | 4h | P1 | POST /blessings, GET /blessings?keychain_id |
| 後端 PII 檢測與 rate limit | 6h | P1 | 服務層邏輯 |
| 舉報 API (`reports` 表) | 3h | P2 | POST /reports, PATCH /blessings/:id/hide |
| **測試** | | | |
| 端對端測試（提交 → 顯示） | 4h | P1 | Cypress/Playwright |
| PII 檢測準確率測試（≥90%） | 3h | P1 | 單元 + 整合 |

**小計**: ~35 小時 (5 工作日)

---

### 功能 D - 小將回應（Elephant Reactions）

| 工作項 | 預估時間 | 優先級 | 備註 |
|--------|---------|--------|------|
| **前端** | | | |
| 設計回應氣泡/toast 樣式 | 2h | P1 | 簡單動畫 |
| 實現提交後的回應顯示邏輯 | 3h | P1 | 依賴功能 A 觸發 |
| 足跡卡片灰字回應展示 | 2h | P2 | 摺疊/展開 |
| **後端 + 句庫** | | | |
| 設計 `elephant_reactions` 表（初版 50-100 句） | 4h | P1 | 種子資料編寫 |
| Deterministic Randomness 實現（seed = hash(journey_id + station)） | 3h | P1 | Node.js / Supabase 函數 |
| 回應查詢 API | 2h | P1 | GET /reactions?seed |
| 管理員編輯界面（簡單 CRUD） | 4h | P2 | 低優先度 |
| **測試** | | | |
| 同 seed 回應一致性測試 | 3h | P1 | 單元測試 |
| 使用者滿意度調查設置 | 2h | P2 | 簡單表單 |

**小計**: ~26 小時 (3.5 工作日)

---

### 功能 B - 分享卡 + QR（Share Card）

| 工作項 | 預估時間 | 優先級 | 備註 |
|--------|---------|--------|------|
| **前端** | | | |
| Share Preview 頁面設計（含 3 個 toggle） | 5h | P1 | 複用功能 D 回應 |
| QR Code 生成與顯示 | 3h | P1 | qrcode.react 或類似庫 |
| 分享卡片圖片渲染（canvas/SVG） | 4h | P1 | 支援各平台格式 |
| 原生分享表單調用（Share API） | 2h | P1 | 跨瀏覽器相容 |
| 頁 4 菜單新增「分享旅程」入口 | 1h | P2 | 複用 Share Preview |
| **後端** | | | |
| 公開旅程頁路由與邏輯（隱私過濾） | 5h | P1 | 動態過濾 opt-in 欄位 |
| 分享事件記錄 API | 2h | P2 | 分析用 |
| **測試** | | | |
| QR Code 掃描驗證（≥99%） | 3h | P1 | 實機測試 |
| 隱私過濾測試（無 PII 洩露） | 3h | P1 | 稽核流程 |

**小計**: ~28 小時 (3.5 工作日)

---

### 功能 C - 開發者回饋（Developer Feedback）

| 工作項 | 預估時間 | 優先級 | 備註 |
|--------|---------|--------|------|
| **前端** | | | |
| Feedback Bottom Sheet 表單（Category + Message + Screenshot + Email） | 4h | P1 | 表單驗證 |
| 自動技術資訊蒐集（App Version, OS, timestamp, journey_id） | 2h | P1 | 環境檢測 |
| 提交成功 toast | 0.5h | P1 | 簡單元件 |
| **後端** | | | |
| `feedback` 表與 API 端點 | 3h | P1 | POST /feedback |
| 兩層管道實現：Supabase + Slack/Email 通知 | 5h | P2 | 可選 Slack integration |
| **測試** | | | |
| 功能流程測試（表單 → 提交 → 通知） | 2h | P1 | 端對端 |

**小計**: ~16.5 小時 (2 工作日)

---

## 📅 分階段執行計劃

### Phase 1（第 1-2 週）：功能 A + D 核心迴圈
**目標**: 使用者可留下祝福，並收到個性化回應

- **Week 1**:
  - Mon-Tue: 功能 A 前端（Bottom Sheet + 表單驗證）
  - Wed-Thu: 功能 A 後端（PII 檢測 + rate limit + API）
  - Fri: 功能 D 前端（氣泡顯示）

- **Week 2**:
  - Mon-Tue: 功能 D 後端（句庫 + Deterministic Randomness）
  - Wed-Fri: 整合測試 + Bug fixes

**交付物**: 功能 A + D 可測試版本

---

### Phase 2（第 3 週）：功能 B 分享擴展
**目標**: 使用者可分享旅程，隱私保護完整

- **Mon-Tue**: 分享卡片前端（Preview + QR）
- **Wed-Thu**: 公開旅程頁 + 隱私過濾
- **Fri**: 測試 + 部署準備

**交付物**: 功能 B 可測試版本

---

### Phase 3（第 4 週）：功能 C 反饋系統
**目標**: 開發者可收集使用者回饋，持續改進

- **Mon-Tue**: 回饋表單前端 + 後端 API
- **Wed**: Slack/Email 整合（可選）
- **Thu-Fri**: 測試 + 全系統整合

**交付物**: 功能 C + 全系統整合版本

---

## 🔧 技術堆棧與決策

| 層面 | 選擇 | 理由 |
|------|------|------|
| **前端狀態** | Redux / Zustand | 複雜跨頁面狀態（旅程、使用者偏好） |
| **表單驗證** | React Hook Form + Zod | 輕量、易於集成 PII 檢測 |
| **PII 檢測** | 正規表達式（用戶端） + NLP（後端可選） | MVP 階段簡化，後端可升級 |
| **QR Code** | qrcode.react | 輕量、無依賴 |
| **圖片渲染** | html2canvas / canvas | 跨瀏覽器分享卡片 |
| **後端驗證** | Supabase 邊緣函數或 Node.js 中介層 | 集中驗證邏輯 |
| **即時通知** | Slack Webhook（可選） | 低成本、快速整合 |
| **測試框架** | Cypress + Vitest | E2E + 單元測試 |

---

## 📌 依賴與風險

### 跨功能依賴
- 功能 B（分享卡）**需依賴** 功能 D（句庫） → Phase 2 不能提前
- 功能 C（回饋）**獨立** → 可平行開發，但優先級低

### 風險與緩解
| 風險 | 影響 | 緩解策略 |
|------|------|--------|
| PII 檢測準確率不足（<90%） | 安全問題 | 前期集中測試；後端加人工審核 |
| QR Code 掃描失敗 | 分享功能無用 | 提供備用 URL 複製方式；廣泛測試 |
| Supabase rate limit | 效能下降 | 實施本地快取 + 批量同步 |
| 句庫品質下滑 | 使用者體驗差 | 初版精簡（50-100）; 定期審視 NPS |

---

## ✅ 品質指標與驗收標準

### 功能完成度
- Phase 1：功能 A + D 完整端對端可測
- Phase 2：功能 B 完整；QR Code ≥99% 掃描成功
- Phase 3：功能 C 完整；全系統隱私稽核通過

### 效能目標
- 表單提交時間 ≤ 2 分鐘
- 頁面載入時間 ≤ 3 秒
- API 回應時間 ≤ 500ms

### 安全目標
- PII 檢測準確率 ≥ 90%
- 隱私洩露事件數 = 0
- Rate limit 有效防止刷屏

---

## 📝 後續步驟

1. **確認團隊與資源分配**：前端 1-2 人，後端 1 人，QA 0.5 人
2. **設置開發環境**：分支策略（feature branches）、CI/CD 流程
3. **啟動 Phase 1 開發**：建立 Jira/GitHub Issues，分配任務
4. **建立溝通機制**：日常同步、風險上報流程

---

**版本**: 1.0 | **制定**: 2025-12-22 | **簽核**: Pending
