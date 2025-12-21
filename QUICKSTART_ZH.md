# NFC 鑰匙圈旅程 - Phase 1 快速開始指南

🎯 **目標**: 在 4 週內完成功能 A（冒險者留言）+ 功能 D（小將回應）的開發

---

## 📦 檔案清單

已生成的開發檔案：

```
lib/
  ├── api.types.ts           ✅ TypeScript 類型定義 (API 契約)
  ├── hooks/useAPI.ts        ✅ React Hooks (前端 API 整合)
  ├── supabaseClient.ts      ✅ Supabase 客戶端包裝層 (資料庫操作)

routes/
  └── routes.ts              ✅ Express 路由框架 (後端 API 實現)

components/
  └── BlessingForm.tsx       ✅ 祝福表單元件 (功能 A UI)

openapi-phase1.json          ✅ OpenAPI 3.0 規格 (API 文件)

API_USAGE_EXAMPLES.md        ✅ API 使用範例 (10 個完整示例)
DEVELOPMENT_GUIDE.ts         ✅ 開發環境設定指南 (包含故障排除)
```

---

## 🚀 開發環境啟動 (5 分鐘)

### 步驟 1: 準備環境變數

**前端** (`.env.local`)：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

**後端** (`.env`)：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
PORT=3000
NODE_ENV=development
```

### 步驟 2: 前端開發伺服器啟動

```bash
# 在專案根目錄
npm install                    # 如果未安裝
npm run dev                    # Vite 開發伺服器將在 http://localhost:5173
```

### 步驟 3: 後端開發伺服器啟動

```bash
# 建立新的終端視窗
cd backend                     # 如果你有分離的後端目錄
npm install                    # 如果未安裝
npm run dev                    # Express 伺服器將在 http://localhost:3000
```

✅ 完成！現在前端和後端都在執行

---

## 🧪 API 測試 (cURL)

### 1️⃣ 提交祝福

```bash
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{
    "keychain_id": "journey-001",
    "blessing_text": "加油!",
    "code_phrase": "暗語",
    "station_number": 1,
    "visibility": "public"
  }'
```

**預期回應** (201 Created):
```json
{
  "id": 1,
  "keychain_id": "journey-001",
  "blessing_text": "加油!",
  "code_phrase": "暗語",
  "is_hidden": false,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### 2️⃣ 取得祝福列表

```bash
curl -X GET "http://localhost:3000/api/blessings?keychain_id=journey-001"
```

**預期回應** (200 OK):
```json
[
  {
    "id": 1,
    "blessing_text": "加油!",
    "code_phrase": "暗語",
    "is_hidden": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3️⃣ 取得小將回應

```bash
curl -X GET "http://localhost:3000/api/reactions?journey_id=journey-001&station_number=1"
```

**預期回應** (200 OK):
```json
{
  "id": 5,
  "reaction_text": "你的祝福已被記錄...",
  "category": "Blessing",
  "emotion_type": "Ritual",
  "seed": 12345678,
  "journey_id": "journey-001",
  "station_number": 1
}
```

### 4️⃣ 舉報祝福

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "blessing_id": 1,
    "reason": "PII_EXPOSED",
    "description": "包含個人資訊"
  }'
```

---

## 🎨 React 元件使用範例

### 在頁面中使用祝福表單

```tsx
import BlessingForm from '@/components/BlessingForm';

export function JourneyPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1>冒險旅程</h1>
      <BlessingForm 
        keychainId="journey-001"
        stationNumber={1}
        onSuccess={(data) => console.log('祝福已提交', data)}
        onError={(error) => console.error('提交失敗', error)}
      />
    </div>
  );
}
```

### 使用 Hooks 取得祝福列表

```tsx
import { useGetBlessings, useGetReaction } from '@/lib/hooks/useAPI';

export function BlessingListPage() {
  const { blessings, loading } = useGetBlessings({
    keychain_id: 'journey-001',
    station_number: 1
  });

  const { reaction } = useGetReaction({
    journey_id: 'journey-001',
    station_number: 1
  });

  return (
    <div>
      <h2>祝福列表</h2>
      {loading ? <p>載入中...</p> : (
        <ul>
          {blessings.map((b) => (
            <li key={b.id}>{b.blessing_text}</li>
          ))}
        </ul>
      )}

      {reaction && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p>🐘 小將說: {reaction.reaction_text}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 API 概覽

### Phase 1 包含的 6 個端點

| 方法 | 端點 | 功能 | 狀態碼 |
|------|------|------|--------|
| POST | `/api/blessings` | 提交祝福 | 201, 400, 429 |
| GET | `/api/blessings` | 取得祝福列表 | 200, 400 |
| PATCH | `/api/blessings/{id}/hide` | 隱藏祝福 | 200, 404 |
| POST | `/api/reports` | 舉報祝福 | 201, 400 |
| GET | `/api/reactions` | 取得小將回應 | 200, 400 |
| - | - | - | - |

### 驗證規則

| 欄位 | 限制 | 錯誤代碼 |
|------|------|---------|
| blessing_text | 最多 15 字 | VALIDATION_ERROR |
| code_phrase | 最多 10 字 | VALIDATION_ERROR |
| optional_note | 最多 120 字 | VALIDATION_ERROR |
| PII 檢測 | 禁止個資 | PII_DETECTED |
| 速率限制 | 5 分鐘 3 次 | RATE_LIMIT_EXCEEDED |

---

## 🔍 PII 檢測

系統會自動檢測並拒絕以下內容：

- 🇭🇰 **香港電話**: `12345678`, `+852 9876 5432`
- 🇨🇳 **大陸手機**: `13912345678`
- 📧 **電郵**: `user@example.com`
- 🔗 **網址**: `https://example.com`
- 🏘️ **香港地址**: 灣仔、中環、銅鑼灣等

若偵測到 PII，表單會：
1. 在客戶端顯示警告 ⚠️
2. 禁用提交按鈕
3. 後端也會驗證並拒絕

---

## 💾 資料庫檢查

確保所有 8 個表都已建立：

```bash
# 在 Supabase SQL 編輯器執行
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

應該看到：
- ✅ keychains
- ✅ prompts
- ✅ events
- ✅ blessings
- ✅ reports
- ✅ elephant_reactions (至少 50-100 行)
- ✅ feedback
- ✅ share_events

---

## 🐛 常見問題

### ❌ "CORS error: Access-Control-Allow-Origin"
**解決**: 檢查後端的 CORS 設定
```typescript
// 在 src/server.ts
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

### ❌ "Supabase not configured"
**解決**: 檢查環境變數
```bash
echo $VITE_SUPABASE_URL        # 應該有值
echo $VITE_SUPABASE_ANON_KEY   # 應該有值
```

### ❌ "fetch failed - API unreachable"
**解決**: 確認後端運行
```bash
curl http://localhost:3000/health  # 應該返回 {status: 'ok'}
```

### ❌ "PII 誤報"
**解決**: 檢查 PII 規則是否過於敏感
- 查看 `lib/hooks/useAPI.ts` 中的 `usePIIDetection` 函數
- 調整正則表達式模式

---

## 📈 進度檢查表

- [ ] 前端開發伺服器運行 (http://localhost:5173)
- [ ] 後端 API 伺服器運行 (http://localhost:3000)
- [ ] Supabase 8 個表已建立
- [ ] cURL 測試 POST /blessings 成功
- [ ] cURL 測試 GET /blessings 成功
- [ ] cURL 測試 GET /reactions 成功
- [ ] BlessingForm 元件加載並運行
- [ ] PII 檢測工作（輸入電話號碼應警告）
- [ ] 祝福表單提交成功
- [ ] 小將回應顯示

---

## 🎯 下一步

### 本週 (Week 1-2)

1. **前端** (15h)
   - [ ] BlessingForm 完全實現並測試
   - [ ] BlessingCard 元件（顯示祝福）
   - [ ] ReportMenu 元件（舉報功能）
   - [ ] PII 檢測 UI/UX 優化
   - [ ] 單元測試

2. **後端** (26h)
   - [ ] 完成所有 6 個路由端點
   - [ ] PII 驗證完全實現
   - [ ] 速率限制中介軟體
   - [ ] 錯誤處理與日誌
   - [ ] API 測試 (Jest / Supertest)

3. **資料庫**
   - [ ] 擴展 elephant_reactions 到 50-100 句
   - [ ] 建立初始測試資料

### 下個月 (Week 3-4)

- Phase 2: 分享卡 + QR 碼
- Phase 3: 開發者回饋

---

## 📚 參考文件

- 🏗️ [API 使用範例](./API_USAGE_EXAMPLES.md) - 10 個完整程式碼範例
- 📖 [開發環境設定](./DEVELOPMENT_GUIDE.ts) - 詳細設定步驟
- 📋 [OpenAPI 規格](./openapi-phase1.json) - 完整 API 文件
- 💾 [資料庫架構](./supabase_schema.sql) - SQL DDL
- 🎯 [實作計畫](./specs/1-nfc-keychain-journey/IMPL_PLAN.md) - 工作分配

---

## 💬 需要幫助？

1. 查看 DEVELOPMENT_GUIDE.ts 中的故障排除部分
2. 檢查 Supabase 儀表板中的日誌
3. 在瀏覽器 DevTools 中檢查 Network 標籤
4. 執行 `curl http://localhost:3000/health` 確認後端狀態

---

**祝開發愉快！🚀** 

任何問題可參考 OpenAPI 文件或聯繫技術主管。
