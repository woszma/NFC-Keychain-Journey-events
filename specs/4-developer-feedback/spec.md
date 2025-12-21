# Feature Specification: 開發者回饋 (Developer Feedback)

**Feature Branch**: `4-developer-feedback`
**Created**: 2025-12-22
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 提交回饋至開發者 (Priority: P1)

使用者於頁 4（旅程地圖）右上角⋯ menu 最底選擇「Feedback / 同開發者講」，彈出 Bottom Sheet 表單。表單包含：Category（Bug / Suggestion / Copy / Other）、Message（≤200 字）、Screenshot（可選）、Email（可選）。提交後顯示 toast：「已收到」。

**Why this priority**: 核心反饋機制，幫助開發者改進產品。

**Independent Test**: 提交各類別回饋，驗證紀錄保存；自動附帶裝置資訊（版本、OS、時間、journey_id）。

**Acceptance Scenarios**:
1. **Given** 使用者點擊⋯ menu 選「Feedback」， **When** Bottom Sheet 彈出， **Then** 顯示表單含 Category、Message、Screenshot、Email 欄位。
2. **Given** 填寫完整表單並提交， **When** 後端驗證成功， **Then** 顯示「已收到」toast；表單關閉。

---

### User Story 2 - 自動蒐集技術資訊 (Priority: P2)

系統在提交回饋時自動附帶（對使用者透明）：App Version、OS（iOS/Android/Web）、提交時間、journey_id（不含 PII）。不會捕捉敏感資訊（姓名、聯絡方式等）。

**Why this priority**: 增強回饋品質，幫助開發者快速定位問題。

**Independent Test**: 驗證後端能接收並記錄所有自動資訊；稽核日誌確認無 PII。

**Acceptance Scenarios**:
1. **Given** 使用者提交回饋， **When** 後端記錄， **Then** 包含 app_version、os_type、timestamp、journey_id；不包含使用者名稱或聯絡資訊（除非使用者填入 Email）。

---

### Edge Cases

- 使用者取消提交 → 回饋表單關閉，不保存。
- Screenshot 上傳失敗 → 允許提交，但提示「截圖上傳失敗，但回饋已保存」。
- 網路斷開 → 提示「無網路連線，請稍後重試」。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 於頁 4（旅程地圖）右上角⋯ menu 最底新增「Feedback / 同開發者講」選項。
- **FR-002**: 系統 MUST 提供 Bottom Sheet 表單，包含：Category（下拉，選項：Bug / Suggestion / Copy / Other）、Message（文字輸入，≤200 字）、Screenshot（可選影像上傳）、Email（可選文字輸入）。
- **FR-003**: 系統 MUST 自動蒐集並附帶：App Version、OS、時間戳、journey_id。
- **FR-004**: 系統 MUST 在提交成功後顯示 toast：「已收到」，並自動關閉表單。
- **FR-005**: 系統 MUST 不捕捉使用者敏感資訊（姓名、電話、地址等）除非使用者主動提供（Email）。
- **FR-006**: 系統 MUST 支援 Screenshot 上傳（可選）；上傳失敗時允許提交回饋但提示失敗。
- **FR-007**: 系統 MUST 建立**兩層回饋管道**：
  - **Supabase 持久化層**：所有回饋記錄至 Feedback 表，便於查詢、分析、長期追蹤與稽核。
  - **實時通知層**（可選）：關鍵回饋（如 Category=Bug 或含特定關鍵詞）觸發實時推送（Slack/Email）給開發者，加快回應。
  - 開發者可於 Dashboard 或專用介面集中查閱所有回饋。

### Key Entities

- **Feedback / 回饋紀錄**: 屬性：`id`, `category`, `message`, `screenshot_url`, `user_email`, `app_version`, `os_type`, `timestamp`, `journey_id`, `created_at`, `status` (Pending/Reviewed/Actioned)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 回饋表單提交時間 ≤ 2 分鐘。
- **SC-002**: 回饋提交成功率 ≥ 95%（網路正常情況下）。
- **SC-003**: 自動蒐集的技術資訊完整性 ≥ 99%（所有提交都含必要欄位）。
- **SC-004**: PII 安全性：回饋資料庫無意外暴露的個人資訊；稽核日誌一致。
- **SC-005**: 開發者收到回饋的時間 ≤ 5 分鐘（傳遞延遲）。

## Assumptions

- Screenshot 上傳透過標準的 multipart/form-data 或雲端存儲（如 Supabase Storage）。
- App Version 與 OS 可從應用程式環境變數或 navigator API 獲取。
- Journey ID 已在應用程式全局狀態中可用。
- 回饋管道採用兩層架構：Supabase 表為持久化層；Slack/Email 為可選實時通知層（若部署 Slack bot 或郵件伺服器）。

## Clarifications

### Session 2025-12-22

- Q: 回饋應如何傳遞與管理？ → A: 採用兩層管道（C）：Supabase 表持久化所有回饋供查詢與分析；關鍵回饋觸發實時推送（Slack/Email）加快回應。
- Q: 功能實現優先順序為何？ → A: 分階段實現（B）：功能 C 為第三階段（最後實現），在核心功能 A+D+B 驗證後再加入以改進產品。



