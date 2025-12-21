# Implementation Plan Summary: 冒險者留言 (功能 A)

**Feature**: `2-user-generated-blessings`
**Phase**: 1（第 1-2 週，與功能 D 並行）
**Status**: Planning

## 🎯 核心價值
使用者能留下個人祝福與記錄，形成每個站點的獨特故事層，並透過 PII 檢測與隱私設定確保安全。

## 📋 工作分解

### 前端（~15 小時）
1. **表單 UI**（4h）- Bottom Sheet，包含 QuestTag（唯讀）、Blessing、CodePhrase、OptionalNote、Visibility toggle
2. **用戶端驗證**（6h）- 字數限制、PII 檢測（正規表達式：電話、網址、地址）、rate limit 提示
3. **足跡卡片整合**（3h）- 新增祝福內容行、Optional note 展開邏輯
4. **舉報入口**（2h）- 卡片 menu，Report modal

### 後端（~13 小時）
1. **Supabase schema + API**（4h）- `blessings` 表、POST/GET 端點、soft delete 邏輯
2. **PII 檢測服務**（6h）- 後端正規表達式驗證、複雜邊界情況的人工審核佇列
3. **Rate limit**（2h）- IP/session 層級限流（5 分鐘 3 筆）
4. **舉報系統**（2h）- `reports` 表、管理員隱藏/刪除端點

### 測試（~7 小時）
1. **功能測試**（4h）- E2E：表單 → 驗證 → 提交 → 顯示
2. **PII 檢測準確率**（3h）- 單元 + 整合，驗證 ≥90%

**小計**: ~35 小時

## 📅 時間安排
- **Week 1**：前端（Mon-Tue）+ 後端（Wed-Thu）+ 前端舉報（Fri）
- **Week 2**：整合 + 測試 + Bug fixes

## ✅ 驗收標準
- [ ] 表單提交流程完整，PII 檢測準確率 ≥90%
- [ ] 足跡頁正確顯示祝福內容
- [ ] Rate limit 有效防止刷屏
- [ ] 端對端測試通過

## 🚀 交付物
- 可測試的功能 A 版本
- PII 檢測單元測試 ≥90% 覆蓋

---

**版本**: 1.0 | **制定**: 2025-12-22
