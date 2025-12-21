```markdown
# Feature Specification: NFC Keychain Journey

**Feature Branch**: `1-nfc-keychain-journey`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "這是一個結合實體物件與數位敘事的互動式社交實驗專案。透過 NFC 鎖匙扣的傳遞，記錄每一段情感連結的旅程。實體與數位結合：利用 NFC 技術（或 URL ID）追蹤實體鎖匙扣的傳遞路徑。情感引導：基於隨機產生的情緒指令（例如：「交給最想多謝的人」）來推動傳遞，而非隨機贈送。旅程歷史：每位持有者都可以查看該鎖匙扣過去的所有站點與故事。即時同步：整合 Supabase 雲端資料庫，確保所有參與者看到的資訊都是最新且同步的。管理員地圖：一目了然的 Dashboard，展示 1-100 號鎖匙扣的活躍狀態。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看並接續旅程 (Priority: P1)

持有者掃描/打開鎖匙扣連結，查看該鎖匙扣過去的所有站點、每一段故事與當前指令（例如：交給最想多謝的人）。持有者選擇「交出」並記錄此次的贈送者、接收者與簡短備註。

**Why this priority**: 這是專案的核心互動，直接體現實體與敘事的連結。

**Independent Test**: 使用一個測試鎖匙扣，建立至少兩次轉移紀錄，驗證新持有者能看到完整歷史與當前指令，並能成功新增一筆轉移紀錄。

**Acceptance Scenarios**:
1. **Given** 有鎖匙扣 ID 的紀錄， **When** 使用者打開該 ID， **Then** 顯示該鎖匙扣的時間序列旅程、每站文字與指令。
2. **Given** 當前使用者完成輸入接收者資訊， **When** 提交， **Then** 新紀錄存入，所有後續讀取者能看到最新站點。

---

### User Story 2 - 接收者新增故事與回饋 (Priority: P2)

接收者在收到鎖匙扣後可新增一段簡短故事或備註（可選），並可選擇是否公開該內容於旅程歷史。

**Why this priority**: 讓每次傳遞不只記錄事件，亦豐富敘事內容，提升參與感。

**Independent Test**: 模擬接收者新增故事並標為公開，驗證該段故事立即顯示於旅程歷史並可由其他使用者檢視（若公開）。

**Acceptance Scenarios**:
1. **Given** 接收者提交故事且選擇公開， **When** 其他使用者查閱， **Then** 該故事出現在旅程歷史時間線上。

---

### User Story 3 - 管理員地圖與監控 (Priority: P2)

管理員可於 Dashboard 查看 1-100 號鎖匙扣的最新狀態（目前持有者、最近事件、活躍/休眠），並可篩選、匯出資料或查看個別鎖匙扣詳細旅程。

**Why this priority**: 管理與觀察是專案運維與活動分析的核心，支援策展與展覽需求。

**Independent Test**: 使用測試資料載入 Dashboard，驗證地圖/列表能顯示 1-100 的項目狀態且支持簡單篩選與匯出操作。

**Acceptance Scenarios**:
1. **Given** 管理員登入 Dashboard， **When** 篩選某鎖匙扣編號， **Then** 顯示該編號的完整旅程與最近事件。

---

### Edge Cases

- 使用者在離線或無網路環境下掃描鎖匙扣：應提示「暫存本地並稍後同步」，並在重連時完成上傳。
- 相同鎖匙扣 ID 被多方同時提交轉移：系統需依時間戳或伺服器版本號解決衝突，保證一致性與不可丟失紀錄。
- 使用者選擇不公開故事：該內容僅對自己或管理員可見。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 能透過鎖匙扣 ID（NFC 或 URL ID）查詢並顯示該鎖匙扣的完整旅程歷史（時間序列與每站文字）。
- **FR-002**: 系統 MUST 允許現任持有者提交一次轉移紀錄，包含 `from_name`、`to_name`、`timestamp`、`prompt_key`/`prompt_text` 與可選 `story` 與 `public_flag`。
- **FR-003**: 系統 MUST 支援接收者選擇是否公開其新增的故事（公開/私人）。
- **FR-004**: 系統 MUST 在提交後將新紀錄同步至中央資料庫，並在讀取端於短時間內呈現最新狀態。
- **FR-005**: 管理員介面 MUST 能展示 1-100 號鎖匙扣的狀態、篩選與匯出基本資料。
- **FR-006**: 系統 MUST 在離線情況下允許本地暫存，並於網路恢復後完成同步，並在同步失敗時回報錯誤資訊給使用者。
- **FR-007**: 系統 MUST 保存每筆事件必要欄位（至少包含 `id`、`keychain_id`、`timestamp`、`from_name`、`to_name`）。

### Key Entities *(include if feature involves data)*

- **Keychain**: 代表實體鎖匙扣（屬性：`keychain_id`, `current_owner`（衍生）, `created_at`）
- **Event / Transfer**: 代表一次轉移（屬性：`id`, `keychain_id`, `timestamp`, `from_name`, `to_name`, `prompt_key`, `prompt_text`, `story`, `public_flag`）
- **Prompt**: 指令樣板（屬性：`prompt_key`, `prompt_text`）
- **User**: 使用者/參與者（屬性：`display_name`, `consent_flags`）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者在正常網路下打開鎖匙扣 ID 後，95% 情況可在 5 秒內看到完整旅程（含最近一筆紀錄）。
- **SC-002**: 在提交新轉移紀錄後，95% 的讀取請求能在 10 秒內反映最新紀錄（資料同步可觀察）。
- **SC-003**: 使用者對於新增故事與公開/私人設定的理解與完成率達到 90%（透過簡單可測試的使用者測試或觀察）。
- **SC-004**: 管理員能在 Dashboard 中正確查看並匯出 1-100 號鎖匙扣的基本狀態（操作成功率 99%）。

## Assumptions

- 預設使用 Supabase 作為中央同步資料庫（參照 README 的欄位設計），但成功標準與需求保持技術中立。
- 鎖匙扣的唯一識別以 `keychain_id` 為主（NFC tag 或 URL ID）。
- 隱私與公開設定由使用者明確選擇，系統提供適當的提示與同意流程。

## Notes

- 測試用例應包含離線暫存、衝突解析與隱私選項的驗證。

```