# Implementation Plan Summary: 小將回應 (功能 D)

**Feature**: `5-elephant-reactions`
**Phase**: 1（第 1-2 週，與功能 A 並行）
**Status**: Planning

## 🎯 核心價值
使用者提交祝福後收到個性化、一致的小將回應，強化儀式感與敘事銜接。回應基於 Deterministic Randomness（journey_id + station_number），與功能 B 分享卡共用，確保多渠道一致體驗。

## 📋 工作分解

### 前端（~7 小時）
1. **回應氣泡/Toast UI**（2h）- 樣式設計，提交功能 A 後彈出
2. **提交後回應觸發**（3h）- 依賴功能 A 的成功回調，取得回應句子並顯示
3. **足跡卡片灰字展示**（2h）- 每個站點卡片下方，摺疊/展開邏輯

### 後端 + 句庫（~13 小時）
1. **初版句庫建構**（4h）- 精選 50-100 句，分類（祝福/鼓勵/共鳴），儲存於 `elephant_reactions` Supabase 表
2. **Deterministic Randomness 邏輯**（3h）- 實現 seed = hash(journey_id + station_number)，從句庫確定性抽取
3. **回應查詢 API**（2h）- GET /reactions?journey_id&station，返回確定性句子
4. **管理員編輯界面**（4h）- 低優先度，後續迭代（簡單 CRUD 表單）

### 測試（~5 小時）
1. **同 seed 一致性測試**（3h）- 單元：相同 seed 輸出相同回應；不同 seed 輸出不同
2. **使用者滿意度測試**（2h）- 簡單 NPS 調查表單

**小計**: ~25 小時

## 📅 時間安排
- **Week 1**：前端（Fri）+ 句庫建構（並行）+ Deterministic Randomness 邏輯開發
- **Week 2**：回應 API 整合 + 整合測試 + 一致性驗證

## ✅ 驗收標準
- [ ] 回應氣泡/足跡卡片正確顯示（提交功能 A 後）
- [ ] 同 seed 回應一致（Deterministic），不同 seed 回應不同
- [ ] 句庫品質達標（初版 50-100 句，覆蓋核心情感場景）
- [ ] 與功能 B 分享卡 ResonanceLine 使用相同句庫與 seed 邏輯

## 🚀 交付物
- 可測試的功能 D 版本
- 初版句庫（50-100 句 Supabase 表）
- Deterministic Randomness 實現與單元測試

---

**版本**: 1.0 | **制定**: 2025-12-22
