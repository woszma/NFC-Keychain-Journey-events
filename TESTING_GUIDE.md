# NFC Keychain Journey - Phase 1 完整測試指南

## 📋 簡介

本指南涵蓋 Phase 1（功能 A + D）的完整測試流程，包括：
- ✅ 環境設定驗證
- ✅ API 端點測試
- ✅ React 元件測試
- ✅ 整合測試
- ✅ 端對端（E2E）測試

---

## 🚀 前置準備

### 步驟 1: 確認環境變數

**前端** (`.env.local`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

**後端** (`.env`):
```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
CLIENT_URL=http://localhost:5173
```

### 步驟 2: 安裝依賴

**前端**:
```bash
npm install
# 應包含: react-hook-form, zod, @hookform/resolvers
```

**後端**:
```bash
cd backend  # 若有分離的後端目錄
npm install
# 應包含: express, @supabase/supabase-js, cors
```

### 步驟 3: 啟動伺服器

**終端 1 - 前端** (http://localhost:5173):
```bash
npm run dev
```

**終端 2 - 後端** (http://localhost:3000):
```bash
npm run dev  # 或 npx tsx watch src/server.ts
```

### 步驟 4: 驗證資料庫

訪問 Supabase SQL 編輯器並執行：
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

應該看到 8 個表：
- ✅ blessings
- ✅ elephant_reactions
- ✅ events
- ✅ feedback
- ✅ keychains
- ✅ prompts
- ✅ reports
- ✅ share_events

---

## 🧪 API 端點測試

### 1️⃣ POST /api/blessings - 提交祝福

#### 有效請求

```bash
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{
    "keychain_id": "test-journey-001",
    "blessing_text": "加油!",
    "code_phrase": "秘語",
    "optional_note": "為朋友祝福",
    "station_number": 1,
    "visibility": "public"
  }'
```

**預期結果**: 201 Created
```json
{
  "id": 1,
  "keychain_id": "test-journey-001",
  "blessing_text": "加油!",
  "code_phrase": "秘語",
  "optional_note": "為朋友祝福",
  "station_number": 1,
  "visibility": "public",
  "is_hidden": false,
  "created_at": "2024-12-22T10:30:00.000Z"
}
```

#### PII 檢測測試

```bash
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{
    "keychain_id": "test-journey-001",
    "blessing_text": "我的電話是 12345678",
    "code_phrase": "秘語"
  }'
```

**預期結果**: 400 Bad Request
```json
{
  "error": "PII_DETECTED",
  "message": "偵測到個人身份資訊，請檢查並移除",
  "detected_patterns": ["phone_hk"]
}
```

#### 驗證錯誤測試

```bash
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{
    "keychain_id": "test-journey-001",
    "blessing_text": "這是一個超過15字的非常長的祝福文字會被拒絕",
    "code_phrase": "秘語"
  }'
```

**預期結果**: 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "祝福文字超過 15 字",
  "details": {
    "max_length": 15,
    "provided_length": 31
  }
}
```

#### 速率限制測試

快速執行 4 個請求（第 4 個應返回 429）：

```bash
# 第 1、2、3 個請求應該成功 (201)

# 第 4 個請求
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{"keychain_id": "test-001", "blessing_text": "第4個", "code_phrase": "秘語"}'
```

**預期結果**: 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "超過速率限制（5 分鐘內最多 3 個請求）",
  "retry_after": 240
}
```

### 2️⃣ GET /api/blessings - 取得祝福列表

```bash
curl -X GET "http://localhost:3000/api/blessings?keychain_id=test-journey-001"
```

**預期結果**: 200 OK
```json
[
  {
    "id": 1,
    "blessing_text": "加油!",
    "code_phrase": "秘語",
    "is_hidden": false,
    "created_at": "2024-12-22T10:30:00.000Z"
  }
]
```

**過濾測試**:

```bash
# 按站點編號
curl "http://localhost:3000/api/blessings?keychain_id=test-journey-001&station_number=1"

# 按可見性
curl "http://localhost:3000/api/blessings?keychain_id=test-journey-001&visibility=public"
```

### 3️⃣ PATCH /api/blessings/:id/hide - 隱藏祝福

```bash
curl -X PATCH http://localhost:3000/api/blessings/1/hide \
  -H "Content-Type: application/json" \
  -d '{"is_hidden": true}'
```

**預期結果**: 200 OK (祝福被隱藏)

### 4️⃣ POST /api/reports - 舉報祝福

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "blessing_id": 1,
    "reason": "PII_EXPOSED",
    "description": "包含個人資訊"
  }'
```

**預期結果**: 201 Created

### 5️⃣ GET /api/reactions - 取得小將回應

```bash
curl -X GET "http://localhost:3000/api/reactions?journey_id=test-journey-001&station_number=1"
```

**預期結果**: 200 OK
```json
{
  "id": 5,
  "reaction_text": "你的祝福已被記錄在冒險的故事中。",
  "category": "Blessing",
  "emotion_type": "Emotion",
  "seed": 12345678,
  "journey_id": "test-journey-001",
  "station_number": 1
}
```

**一致性測試** (執行相同查詢 3 次，seed 應相同)：

```bash
for i in {1..3}; do
  curl -s "http://localhost:3000/api/reactions?journey_id=test-journey-001&station_number=1" | grep seed
done
```

---

## ⚛️ React 元件測試

### BlessingForm 元件

1. 打開 http://localhost:5173
2. 導航到含有 BlessingForm 的頁面
3. 測試以下場景：

#### 測試 1: 正常提交

- [ ] 輸入"加油"（5 字）
- [ ] 輸入"秘語"（2 字）
- [ ] 輸入"為朋友祝福"（6 字）
- [ ] 點擊提交
- [ ] 應看到成功訊息 ✅

#### 測試 2: PII 檢測

- [ ] 輸入"12345678"（香港電話）
- [ ] 應看到紅色警告 ⚠️
- [ ] 提交按鈕應被禁用 ❌

#### 測試 3: 字數限制

- [ ] 輸入超過 15 字的祝福文字
- [ ] 應自動截斷為 15 字
- [ ] 字數計數器應顯示"15/15"

#### 測試 4: 選擇性欄位

- [ ] 不填"備註"欄位
- [ ] 應該仍能成功提交

### BlessingCard 元件

1. 頁面應顯示祝福卡片列表
2. 測試以下功能：

- [ ] 卡片顯示祝福文字 ✅
- [ ] 卡片顯示相對時間（"10 分鐘前") ✅
- [ ] 卡片顯示可見性圖標 ✅
- [ ] 滑鼠懸停時顯示操作按鈕 ✅
- [ ] 點擊"舉報"按鈕應打開舉報菜單 ✅

### ReportMenu 元件

1. 從 BlessingCard 點擊"舉報"
2. 應看到舉報模態視窗
3. 測試以下操作：

- [ ] 選擇"包含個人資訊" → 應顯示簡短描述 ✅
- [ ] 選擇"其他" → 應顯示文字輸入框 ✅
- [ ] 無選擇時點擊提交 → 應提示"請選擇原因" ✅
- [ ] 正常提交 → 應顯示成功訊息並關閉模態 ✅

### ElephantReactionCard 元件

1. 頁面應顯示小將回應卡片
2. 測試以下功能：

- [ ] 載入時應顯示動畫 🐘 ✅
- [ ] 回應文字應正確顯示 ✅
- [ ] 應顯示分類（Blessing, Encouragement 等）✅
- [ ] 錯誤時應顯示重試按鈕 ✅

---

## 🔗 整合測試

### 完整使用者流程

1. **提交祝福**
   - [ ] 開啟 http://localhost:5173
   - [ ] 填寫 BlessingForm
   - [ ] 提交
   - [ ] 查看 Supabase blessings 表 → 資料應存在 ✅

2. **查看祝福列表**
   - [ ] 頁面應顯示剛提交的祝福 ✅
   - [ ] 卡片應顯示正確資訊 ✅

3. **查看小將回應**
   - [ ] ElephantReactionCard 應顯示回應 ✅
   - [ ] 刷新頁面 → 回應應相同（確定性隨機化）✅

4. **舉報祝福**
   - [ ] 點擊卡片上的舉報按鈕 ✅
   - [ ] 選擇舉報原因 ✅
   - [ ] 提交 ✅
   - [ ] 查看 Supabase reports 表 → 舉報應存在 ✅

### 跨瀏覽器測試

在以下瀏覽器中測試：
- [ ] Chrome 最新版本
- [ ] Firefox 最新版本
- [ ] Safari（macOS）
- [ ] Edge 最新版本

---

## 📊 性能測試

### 響應時間測試

```bash
# 測試 API 響應時間（應 < 1 秒）
time curl -X GET "http://localhost:3000/api/blessings?keychain_id=test-001"
```

### 壓力測試

```bash
# 使用 Apache Bench 進行簡單的壓力測試
ab -n 100 -c 10 http://localhost:3000/api/reactions?journey_id=test-001&station_number=1
```

預期結果：
- 完成率: 100%
- 平均響應時間: < 500ms

---

## 🐛 常見問題與故障排除

### ❌ CORS 錯誤

**症狀**: 瀏覽器主控台顯示 CORS 錯誤

**解決**:
1. 確認後端 CORS 設定
2. 檢查 `.env` 中的 `CLIENT_URL`
3. 確認前端正確的 `REACT_APP_API_BASE_URL`

```bash
# 檢查 CORS headers
curl -i -H "Origin: http://localhost:5173" http://localhost:3000/api/version
```

### ❌ Supabase 連接失敗

**症狀**: "Supabase not configured" 或連接錯誤

**解決**:
1. 確認 `.env` / `.env.local` 中的 Supabase 設定
2. 測試連接:
```bash
curl -X GET "http://localhost:3000/api/blessings?keychain_id=test-001"
# 若成功，應返回空陣列 [] 或資料
```

### ❌ PII 檢測誤報

**症狀**: 合法文字被標記為 PII

**解決**:
1. 檢查 `lib/hooks/useAPI.ts` 中的正則表達式
2. 調整模式或跳過特定檢查
3. 例如：香港地址檢查可能過於寬鬆

---

## ✅ 驗收標準（Acceptance Criteria）

所有以下項目應標記為 ✅：

### API 層
- [ ] 所有 6 個端點能正確回應
- [ ] PII 檢測在伺服端工作
- [ ] 速率限制在 5 分鐘內執行
- [ ] 錯誤訊息明確且有幫助
- [ ] HTTP 狀態碼正確

### 前端層
- [ ] 所有 4 個元件正確渲染
- [ ] 表單驗證工作
- [ ] PII 客戶端檢測工作
- [ ] 樣式在不同螢幕尺寸上正確
- [ ] 無控制台錯誤

### 資料庫層
- [ ] 資料正確保存
- [ ] 外鍵關係有效
- [ ] 索引存在
- [ ] 可以查詢和更新

### 整合層
- [ ] 前後端能通訊
- [ ] 完整的使用者流程工作
- [ ] 資料在提交後可檢索

---

## 📝 測試報告模板

若需提交測試報告，請使用以下格式：

```markdown
## 測試報告 - [日期]

### 環境
- Node.js 版本: v18.x
- npm 版本: v9.x
- Supabase: [URL]
- 瀏覽器: Chrome v121

### 測試結果
- API 端點: ✅ 所有通過
- React 元件: ✅ 所有通過
- 整合測試: ✅ 所有通過
- 性能: ✅ 符合預期

### 發現的問題
- 無

### 簽核
- 測試者: [姓名]
- 日期: [日期]
- 狀態: ✅ 準備上線
```

---

## 🎯 下一步

所有 Phase 1 測試通過後：
1. 將代碼合併到 main 分支
2. 準備 Phase 2（分享卡 + QR 碼）
3. 計劃 Phase 3（開發者回饋）

---

**祝測試順利！🚀**
