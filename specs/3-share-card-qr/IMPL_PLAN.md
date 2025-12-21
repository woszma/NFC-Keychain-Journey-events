# Implementation Plan Summary: 分享卡 + QR (功能 B)

**Feature**: `3-share-card-qr`
**Phase**: 2（第 3 週，依賴功能 D 先完成）
**Status**: Planning

## 🎯 核心價值
使用者能安全分享旅程片段至社交平台，預設隱藏身份，分享卡片嵌入 Deterministic 回應內容，提升敘事銜接與隱私保護。

## 📋 工作分解

### 前端（~15 小時）
1. **Share Preview UI**（5h）- 站點卡片樣式、3 個 toggle（From Alias / 我的代號 / 祝福），toggle 狀態驅動渲染
2. **QR Code 生成**（3h）- qrcode.react 整合，URL 包含 journey_id 但不含 PII
3. **分享卡片圖片渲染**（4h）- html2canvas，支援 PNG/JPG 格式，適應不同螢幕
4. **原生分享表單**（2h）- Share API（Web）/ 系統分享（Mobile），多平台相容
5. **頁 4 入口**（1h）- 菜單新增「分享旅程」選項，複用 Preview 元件

### 後端（~7 小時）
1. **公開旅程頁邏輯**（5h）- 動態過濾（隱藏/顯示欄位基於 opt-in），無 PII 漏洞驗證
2. **分享事件記錄 API**（2h）- shared_count、shared_via、shared_at 記錄

### 測試（~6 小時）
1. **QR Code 掃描驗證**（3h）- 實機測試多款手機，驗證成功率 ≥99%
2. **隱私稽核**（3h）- 驗證公開頁無 PII 洩露，opt-in 邏輯正確

**小計**: ~28 小時

## 📅 時間安排
- **Mon-Tue**：Share Preview 前端 + QR 生成
- **Wed-Thu**：公開旅程頁 + 隱私過濾
- **Fri**：測試 + 部署準備

## ✅ 驗收標準
- [ ] QR Code 掃描成功率 ≥99%
- [ ] 公開旅程頁無任何 PII 洩露（稽核通過）
- [ ] 分享卡片圖片品質清晰，在多裝置下正常顯示
- [ ] 原生分享表單流暢，支援 Facebook/WhatsApp/Email 等

## 🚀 交付物
- 可測試的功能 B 版本
- 隱私稽核報告

---

**版本**: 1.0 | **制定**: 2025-12-22
