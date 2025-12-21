# Feature Specification: 冒險者留言 (User-Generated Blessings)

**Feature Branch**: `2-user-generated-blessings`
**Created**: 2025-12-22
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 留下祝福與本站記錄 (Priority: P1)

持有者掃描/打開鎖匙扣時，於頁 6（任務委派頁）點擊「留一句祝福」按鈕，彈出 Bottom Sheet 表單，填寫祝福詞（≤15 字）與可選的代號（CodePhrase）及備註（OptionalNote ≤120 字）。選擇是否公開（預設 Private），提交後於頁 5（足跡頁）各站點卡片上顯示該祝福內容。

**Why this priority**: 核心 UGC 功能，讓每位參與者能留下個人印記與情感。

**Independent Test**: 新增一筆祝福記錄，驗證於足跡頁對應站點卡片上能正確顯示，並隱私設定生效。

**Acceptance Scenarios**:
1. **Given** 使用者開啟任務委派頁， **When** 點擊「留一句祝福」， **Then** 彈出 Bottom Sheet 表單包含 QuestTag、Blessing、CodePhrase、OptionalNote 與 Visibility 選項。
2. **Given** 輸入≤15字祝福詞並提交， **When** 表單驗證通過， **Then** 新紀錄存入；足跡頁對應卡片顯示「Quest + Blessing」一行。

---

### User Story 2 - 舉報與隱藏不當留言 (Priority: P2)

使用者於足跡頁站點卡片點擊⋯ menu，可選擇「舉報」某筆留言。系統紀錄舉報，管理員審核後可隱藏或刪除。

**Why this priority**: 安全與社群治理，防止 PII 洩露與不當內容。

**Independent Test**: 提交舉報後，驗證紀錄保存；管理員可隱藏目標留言。

**Acceptance Scenarios**:
1. **Given** 使用者看到疑似 PII 的留言， **When** 點擊 Report， **Then** 彈出舉報理由選單並記錄。

---

### Edge Cases

- 提交前檢測到電話/網址/地址格式 → 提示警告並要求修改。
- 同一人短時間內大量提交祝福 → 觸發 rate limit，提示「稍後再試」。
- PII 檢測失敗的邊界情況（如中英混用） → 交由人工審核。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 在頁 6（任務委派頁）下方顯示「留一句祝福」按鈕（可跳過）。
- **FR-002**: 系統 MUST 提供 Bottom Sheet 表單，包含 QuestTag（唯讀）、Blessing（≤15 字）、CodePhrase（≤10 字，可選）、OptionalNote（≤120 字，可選）與 Visibility toggle（預設 Private）。
- **FR-003**: 系統 MUST 採用**用戶端 + 後端雙層 PII 驗證**：
  - **用戶端層**：實時檢查並提示電話號碼、網址、地址格式等，要求使用者改寫後才能提交。
  - **後端層**：二次驗證所有提交內容，防止繞過；檢測失敗的邊界情況交由人工審核。
- **FR-004**: 系統 MUST 於提交前應用 rate limit（建議：同 IP/使用者每 5 分鐘最多 3 筆祝福）。
- **FR-005**: 系統 MUST 於頁 5（足跡頁）各站點卡片顯示「Quest + Blessing」（一行）；OptionalNote 只在「更多」展開時顯示。
- **FR-006**: 系統 MUST 提供站點卡片⋯ menu 加「舉報」選項；舉報後紀錄至資料庫。
- **FR-007**: 系統 MUST 支援管理員隱藏（Hide）或刪除（Remove）留言；刪除前至少要支援 Hide 功能。

### Key Entities

- **Blessing / 祝福紀錄**: 屬性：`id`, `keychain_id`, `station_number`, `quest_tag`, `blessing_text`, `code_phrase`, `optional_note`, `visibility` (Private/Public), `created_at`, `reported_count`, `is_hidden`
- **Report / 舉報**: 屬性：`id`, `blessing_id`, `reason`, `reported_by`, `created_at`, `status` (Pending/Reviewed/Dismissed)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者完成「留一句祝福」流程所需時間 ≤ 2 分鐘。
- **SC-002**: PII 檢測準確率 ≥ 90%（在常見電話/地址格式上）；誤判率 ≤ 5%。
- **SC-003**: Rate limit 有效防止刷屏：相同來源 5 分鐘內最多 3 筆（可觀察）。
- **SC-004**: 舉報流程完成率 ≥ 85%（提交舉報的成功率）。
- **SC-005**: 足跡頁載入速度不超過 3 秒（含所有祝福內容）。

## Assumptions

- PII 模式檢測以正規表達式實現（簡單版本）；複雜情況交由人工。
- Visibility 設定適用於該站點的單筆留言，不影響其他站點。
- Rate limit 以 session/IP 為基礎（可調整）。

## Clarifications

### Session 2025-12-22

- Q: PII 檢測應在用戶端、後端或兩層驗證？ → A: 採用用戶端 + 後端雙層驗證（C）。用戶端提供即時反饋提升 UX，後端防止繞過；複雜邊界情況交由人工。
- Q: 功能實現優先順序為何？ → A: 分階段實現（B）：第一階段（A+D）建立 UGC 與個性化迴圈，第二階段（B）擴展分享，第三階段（C）收集反饋。


