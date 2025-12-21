# Feature Specification: 分享按鈕 + 分享卡 + QR Code (Share Card with QR)

**Feature Branch**: `3-share-card-qr`
**Created**: 2025-12-22
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 生成並分享卡片與 QR Code (Priority: P1)

使用者於頁 5（足跡頁）點擊右上角 Share icon，系統生成一張分享卡片預覽（含站點資訊、QuestTag、ResonanceLine、QRCode）。卡片包含 toggle 選項（「顯示 From Alias」、「顯示我的代號」、「包含祝福內容」，預設 OFF）；確認後呼叫手機系統分享（Native Share Sheet），用戶可分享至各平台。

**Why this priority**: 核心分享功能，擴展覆蓋面與參與度。

**Independent Test**: 生成分享卡片，驗證 QR Code 連至正確的公開旅程頁；檢查 toggle 狀態正確反映在卡片上。

**Acceptance Scenarios**:
1. **Given** 使用者開啟足跡頁， **When** 點擊 Share icon， **Then** 彈出 Share Preview，顯示站點卡與多個 toggle 選項。
2. **Given** 點擊「分享」確認， **When** 系統準備完畢， **Then** 呼叫原生分享表單，用戶可選擇分享目標。

---

### User Story 2 - 公開旅程頁（隱私視圖） (Priority: P1)

分享卡片中的 QR Code 連至公開旅程頁。該頁預設隱藏所有人名/代號，僅顯示：站點數、Quest、祝福（若允許）、小將回應；所有身份資訊需明確 opt-in。

**Why this priority**: 隱私保護與信任建立，核心安全需求。

**Independent Test**: 掃描 QR Code，驗證公開頁不洩露個人身份資訊（除非使用者於分享時明確開啟）。

**Acceptance Scenarios**:
1. **Given** 外部人士掃描 QR Code， **When** 進入公開旅程頁， **Then** 不顯示任何人名、代號、From Alias；只顯示站點數、Quest、祝福（可選）。
2. **Given** 分享者選擇「顯示 From Alias」， **When** 外部人士訪問， **Then** 該 alias 於對應站點顯示。

---

### User Story 3 - 從旅程地圖分享 (Priority: P2)

頁 4（旅程地圖）右上角 menu（⋯）新增「分享旅程」選項，進入同樣的 Share Preview 流程。

**Why this priority**: 次入口，提升可發現性。

**Independent Test**: 驗證旅程地圖分享入口與足跡頁分享功能一致。

**Acceptance Scenarios**:
1. **Given** 使用者於旅程地圖點擊⋯ menu 選「分享旅程」， **When** Preview 顯示， **Then** 與足跡頁分享流程相同。

---

### Edge Cases

- 使用者取消分享（返回）→ 預覽關閉，無動作。
- QR Code 掃描失敗或過期 → 引導用戶至主頁或顯示友善錯誤訊息。
- 公開頁訪問者已是旅程參與者 → 可選提示「你也在這個旅程中」。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 於頁 5 右上角提供 Share icon；頁 4 右上角⋯ menu 加「分享旅程」選項。
- **FR-002**: 系統 MUST 生成分享卡片預覽，包含：站點資訊（Station N/N）、QuestTag、ResonanceLine（根據 journey_id + station_number 由 Deterministic Randomness 生成，與功能 D 共用句庫）、QRCode。
- **FR-003**: 系統 MUST 提供 3 個 toggle：「顯示 From Alias」、「顯示我的代號」、「包含祝福內容」，預設全 OFF。
- **FR-004**: 系統 MUST 在分享卡片確認後呼叫原生分享表單（Native Share Sheet）。
- **FR-005**: QRCode MUST 指向公開旅程頁，URL 中包含 journey_id 但不包含 PII。
- **FR-006**: 系統 MUST 於公開旅程頁預設隱藏所有人名、代號，僅顯示：站點數、Quest、祝福（若允許）、小將回應。
- **FR-007**: 系統 MUST 要求明確 opt-in 才顯示身份資訊（如 From Alias）於公開頁。
- **FR-008**: 系統 MUST 記錄分享事件（分享時間、來源、目標平台等，不含 PII）供分析。

### Key Entities

- **ShareCard / 分享卡**: 屬性：`id`, `journey_id`, `generated_at`, `qr_code_data`, `toggle_states` (from_alias_visible, my_name_visible, blessings_visible), `shared_via`, `shared_count`
- **PublicJourneyView / 公開旅程頁**: 屬性：`journey_id`, `visible_stations`, `blessing_visibility_flags`, `access_logs` (匿名)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 分享卡片生成時間 ≤ 2 秒。
- **SC-002**: QR Code 掃描成功率 ≥ 99%（標準環境下）。
- **SC-003**: 公開旅程頁載入時間 ≤ 3 秒。
- **SC-004**: PII 洩露事件零（隱私稽核）；所有身份資訊顯示前檢查 opt-in 標誌。
- **SC-005**: 分享流程完成率（使用者點擊 Share 後發起系統分享） ≥ 80%。

## Assumptions

- Native Share Sheet 由 React Native 或 Web API（Share API）提供。
- ResonanceLine 使用與功能 D（小將回應）相同的 Deterministic Randomness 機制與審核句庫，確保分享卡與應用內回應保持一致。
- QR Code 採用標準格式（如 QR Code v4 以上），支援至少 200 個字元 URL。

## Clarifications

### Session 2025-12-22

- Q: ResonanceLine 生成策略為何？ → A: 與功能 D 共用 Deterministic Randomness 機制（C），根據 journey_id + station_number 從審核句庫中確定性抽取。確保分享卡與應用內回應一致，強化敘事銜接。
- Q: 功能實現優先順序為何？ → A: 分階段實現（B）：第一階段（A+D），第二階段（B 分享卡），第三階段（C 反饋）。功能 B 需功能 D 先完成，以確保 ResonanceLine 生成。



