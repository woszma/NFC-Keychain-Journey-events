# Implementation Plan Summary: 開發者回饋 (功能 C)

**Feature**: `4-developer-feedback`
**Phase**: 3（第 4 週，獨立開發）
**Status**: Planning

## 🎯 核心價值
開發者能集中收集使用者回饋（Bug / Suggestion / Copy / Other），持久化於 Supabase，關鍵回饋可選觸發實時通知，加快迭代速度。

## 📋 工作分解

### 前端（~6 小時）
1. **Feedback Bottom Sheet**（4h）- Category 下拉、Message 文字輸入、Screenshot 上傳、Email（可選）、自動技術資訊蒐集
2. **提交成功反饋**（0.5h）- Toast 訊息「已收到」
3. **環境偵測**（1.5h）- App Version、OS、timestamp、journey_id 自動附帶

### 後端（~8 小時）
1. **Feedback API + Schema**（3h）- `feedback` 表、POST 端點、Screenshot 上傳至 Supabase Storage
2. **兩層通知管道**（5h）：
   - Supabase 表持久化（所有回饋可查詢）
   - Slack Webhook / Email 集成（關鍵詞觸發，如 Category=Bug）

### 測試（~2 小時）
1. **功能流程測試**（2h）- 表單 → 提交 → Supabase 記錄 → Slack 通知

**小計**: ~16 小時

## 📅 時間安排
- **Mon-Tue**：前端表單 + 後端 API
- **Wed**：Slack/Email 整合（可選，可後續迭代）
- **Thu-Fri**：測試 + 全系統整合

## ✅ 驗收標準
- [ ] 表單提交流程完整，自動技術資訊附帶無誤
- [ ] 所有回饋紀錄於 Supabase，可查詢
- [ ] 關鍵回饋（可選）觸發通知成功
- [ ] Screenshot 上傳成功率 ≥95%

## 🚀 交付物
- 可測試的功能 C 版本
- Feedback Dashboard（簡單列表或 Supabase Studio 查詢）

---

**版本**: 1.0 | **制定**: 2025-12-22
