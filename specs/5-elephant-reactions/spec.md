# Feature Specification: 小將回應 + 每站隨機經歷 (Personalization / Elephant Reactions)

**Feature Branch**: `5-elephant-reactions`
**Created**: 2025-12-22
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 記錄本站後收到小將回應 (Priority: P1)

使用者於頁 6（任務委派頁）點擊「記錄本站」（即功能 A 的提交祝福）後，系統彈出一個小氣泡或 toast 顯示「小將回應：……」（一句經過人工審核的回應句）。該回應內容基於 journey_id + station_number 的 Deterministic Randomness 生成，確保同一位置的訪客看到相同回應。

**Why this priority**: 核心個性化與儀式感功能，提升參與體驗。

**Independent Test**: 同一鎖匙扣不同時間點的多次訪問，驗證相同站點回應一致；不同站點回應不同。

**Acceptance Scenarios**:
1. **Given** 使用者提交祝福記錄， **When** 提交成功， **Then** 彈出小氣泡顯示「小將回應：[句子]」。
2. **Given** 同一使用者第二次訪問相同站點， **When** 再次提交或查看， **Then** 看到相同的小將回應（Deterministic）。

---

### User Story 2 - 足跡頁展示回應 (Priority: P2)

頁 5（足跡頁）各站點卡片下方可選地顯示一行灰字註釋，呈現該站點的小將回應（與氣泡相同）。使用者可選擇折疊/展開。

**Why this priority**: 強化回應的可見性與敘事銜接。

**Independent Test**: 驗證足跡卡片正確展示對應站點的回應；折疊/展開功能正常。

**Acceptance Scenarios**:
1. **Given** 足跡頁載入多站點卡片， **When** 用戶查看某站點卡片， **Then** 下方灰字顯示該站點的小將回應（可選折疊）。

---

### User Story 3 - 從句庫抽取回應（非隨機） (Priority: P1)

系統維護人工審核的回應句庫與經歷卡（ExperienceCard）。使用 Deterministic Randomness（以 journey_id + station_number 作為 seed）從句庫中抽取，確保每次訪問同一位置得到相同回應。

**Why this priority**: 確保品質與一致性，避免隨機低質內容。

**Independent Test**: 驗證 seed 相同時輸出相同回應；不同 seed 輸出不同回應；所有回應來自審核句庫。

**Acceptance Scenarios**:
1. **Given** 系統有 N 句審核回應句庫， **When** 計算 seed = hash(journey_id + station_number)， **Then** 回應 = sentences[seed % N]，結果確定性且一致。

---

### Edge Cases

- 句庫為空或尚未初始化 → 顯示預設回應或禁用此功能。
- Journey ID 與 Station Number 無法取得 → 使用備用 seed 或不顯示個性化回應。
- 使用者短時間內多次提交 → 仍顯示相同回應（無額外隨機化）。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 維護人工審核的回應句庫（ExperienceCard & ElephantReaction sentences）。
- **FR-002**: 系統 MUST 使用 Deterministic Randomness：seed = hash(journey_id + station_number)，從句庫中確定性抽取回應。
- **FR-003**: 系統 MUST 在使用者提交祝福後立即彈出氣泡/toast 顯示「小將回應：[句子]」。
- **FR-004**: 系統 MUST 於頁 5（足跡頁）站點卡片下方以灰字展示同一句回應（可選折疊/展開）。
- **FR-005**: 系統 MUST 確保：相同 journey_id + station_number → 相同回應；不同組合 → 不同回應。
- **FR-006**: 系統 MUST 在回應內容中避免：心理診斷、身份推斷、過度引用使用者原文。
- **FR-007**: 系統 MUST 聚焦於情緒與儀式感回應（如祝福、鼓勵、共鳴表達）。
- **FR-008**: 系統 MUST 支援管理員新增/編輯/刪除回應句；新增或更新後需重新部署以生效。

### Key Entities

- **ExperienceCard / 經歷卡**: 屬性：`id`, `content`, `category` (Blessing/Encouragement/Resonance), `status` (Active/Archived), `created_at`
- **ElephantReaction / 回應句**: 屬性：`id`, `reaction_text` (≤50 字), `type` (Emotion/Ritual/Gratitude), `status`, `created_at`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 回應氣泡顯示時間（提交後） ≤ 1 秒。
- **SC-002**: Deterministic Randomness 準確性 = 100%（同 seed 輸出一致）。
- **SC-003**: 足跡頁回應載入速度不超過 3 秒。
- **SC-004**: 使用者對回應內容的滿意度（調查/NPS） ≥ 4/5。
- **SC-005**: 無不當或冒犯性回應洩露（內容稽核） = 0。

## Assumptions

- **回應句庫規模與管理**：
  - 初版規模：精簡設置 50-100 句，覆蓋核心情感與儀式感場景（祝福、鼓勵、共鳴）。
  - 儲存位置：Supabase `elephant_reactions` 表，便於管理員動態編輯（不需重新部署應用）。
  - 更新頻率：定期迭代（建議月度），根據使用者反饋與回應效能指標進行增刪調整。
  - 審核流程：產品/社群負責人手動審核新句子，確保品質與適切性。
- Hash 函數採用標準算法（如 SHA-256 或 MD5），確保跨平台一致。
- 初版 Deterministic Randomness 採用簡單模式（seed % 句庫數量）；未來可擴展為 ML-based 個性化。

## Clarifications

### Session 2025-12-22

- Q: 回應句庫的初始規模與更新流程？ → A: 精簡初版（50-100 句） + Supabase 動態管理 + 定期迭代（C）。初版覆蓋核心場景，儲存於資料庫便於編輯，定期根據反饋調整。
- Q: 功能實現優先順序為何？ → A: 分階段實現（B）：功能 D 為第一階段的一部分（與功能 A 並行），與 A 共同建立核心 UGC 與個性化迴圈。



