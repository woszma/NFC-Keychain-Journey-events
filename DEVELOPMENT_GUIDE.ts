/**
 * NFC Keychain Journey - 開發環境設定指南
 * Phase 1（功能 A + D）開發者快速啟動
 */

// ============================================
// 1. 環境變數設定 (.env.local 或 .env.development)
// ============================================

/*
# Frontend 設定
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Backend 設定
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NODE_ENV=development
PORT=3000

# Redis（可選，用於生產環境速率限制）
REDIS_URL=redis://localhost:6379
*/

// ============================================
// 2. 前端開發環境啟動指南
// ============================================

/*
1. 安裝依賴
   npm install

2. 確保 package.json 包含以下套件：
   - react: ^18.x
   - react-hook-form: ^7.x
   - zod: ^3.x
   - @hookform/resolvers: ^3.x
   - @supabase/supabase-js: ^2.x

3. 複製環境變數
   cp .env.example .env.local

4. 啟動 Vite 開發伺服器
   npm run dev

5. 在 http://localhost:5173 訪問應用

6. 開啟 DevTools → Network 標籤
   監控 API 呼叫（應該看到 POST/GET /api/blessings, GET /api/reactions）
*/

// ============================================
// 3. 後端開發環境啟動指南
// ============================================

/*
1. 初始化 Node.js 專案
   npm init -y

2. 安裝依賴
   npm install express @supabase/supabase-js dotenv cors
   npm install -D typescript @types/express @types/node tsx

3. tsconfig.json 設定
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     }
   }

4. 複製環境變數
   cp .env.example .env

5. 啟動開發伺服器
   npx tsx watch src/server.ts

6. 伺服器應該在 http://localhost:3000 運行
*/

// ============================================
// 4. Express 伺服器初始化範例 (src/server.ts)
// ============================================

const exampleServer = `
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { blessingsRouter, reactionsRouter, errorHandler } from './routes/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api', blessingsRouter);
app.use('/api', reactionsRouter);

// 錯誤處理
app.use(errorHandler);

// 啟動伺服器
app.listen(PORT, () => {
  console.log(\`🚀 API server running on http://localhost:\${PORT}\`);
  console.log(\`📚 API documentation: http://localhost:\${PORT}/api/docs\`);
});
`;

// ============================================
// 5. 前端 + 後端整合檢查清單
// ============================================

const integrationChecklist = `
# 集成測試檢查清單

## 基礎設定 (Setup)
- [ ] Supabase 專案已建立
- [ ] 8 個資料庫表已建立（supabase_schema.sql）
- [ ] API 文件已生成（openapi-phase1.json）
- [ ] TypeScript 類型已生成（lib/api.types.ts）
- [ ] React Hooks 已實現（lib/hooks/useAPI.ts）
- [ ] Express 路由框架已建立（routes/routes.ts）
- [ ] 環境變數已設定（.env.local, .env）

## 前端驗證 (Frontend)
- [ ] npm install 完成（無錯誤）
- [ ] npm run dev 成功啟動
- [ ] 開啟 BlessingForm 元件
  - [ ] 表單載入
  - [ ] PII 檢測工作（輸入電話號碼應顯示警告）
  - [ ] 字數限制工作（最多 15 字）
  - [ ] 暗語欄位工作（最多 10 字）
  - [ ] 備註欄位工作（最多 120 字，可選）
  - [ ] 提交按鈕在有 PII 時被禁用

## 後端驗證 (Backend)
- [ ] npm install 完成（無錯誤）
- [ ] npx tsx watch src/server.ts 成功啟動
- [ ] 訪問 http://localhost:3000/health → 應返回 {status: 'ok'}

## API 整合測試 (API Integration)

### 1. 提交祝福 (POST /api/blessings)
- [ ] 有效請求：應返回 201 + BlessingResponse
- [ ] 缺少欄位：應返回 400 + VALIDATION_ERROR
- [ ] PII 偵測：應返回 400 + PII_DETECTED
- [ ] 超過速率限制：應返回 429 + RATE_LIMIT_EXCEEDED
- [ ] 資料庫錯誤：應返回 500 + INTERNAL_ERROR

### 2. 取得祝福列表 (GET /api/blessings)
- [ ] 缺少 keychain_id：應返回 400 + VALIDATION_ERROR
- [ ] 有效查詢：應返回 200 + 祝福陣列
- [ ] 過濾 station_number：應只返回指定站點的祝福
- [ ] 過濾 visibility：應只返回指定可見性的祝福

### 3. 隱藏祝福 (PATCH /api/blessings/:id/hide)
- [ ] 有效 ID：應返回 200 + 更新的祝福
- [ ] 無效 ID：應返回 404 + NOT_FOUND

### 4. 提交舉報 (POST /api/reports)
- [ ] 有效請求：應返回 201 + ReportResponse
- [ ] 缺少欄位：應返回 400 + VALIDATION_ERROR

### 5. 取得小將回應 (GET /api/reactions)
- [ ] 缺少參數：應返回 400 + VALIDATION_ERROR
- [ ] 有效參數：應返回 200 + ReactionResponse
  - [ ] reaction_text 存在
  - [ ] seed 值一致（同一 journey_id + station_number 應返回相同的 seed）
  - [ ] category 和 emotion_type 正確

## 端對端流程測試 (E2E)
- [ ] 使用者進入頁面
- [ ] 使用者填寫祝福表單
  - [ ] 輸入"祝福文字"（≤15字）
  - [ ] 輸入"暗語"（≤10字）
  - [ ] 輸入"備註"（可選，≤120字）
- [ ] 點擊提交
  - [ ] 前端驗證通過
  - [ ] API 呼叫成功
  - [ ] Supabase 資料插入成功
- [ ] 小將回應顯示
  - [ ] 取得反應 API 呼叫成功
  - [ ] 顯示隨機句子（使用 seed 確定性）

## 資料庫驗證 (Database)
- [ ] 祝福資料正確保存在 blessings 表
- [ ] 舉報資料正確保存在 reports 表
- [ ] elephant_reactions 表有 50-100 個活躍句子
- [ ] 所有外鍵關係正確

## 性能測試 (Performance)
- [ ] API 響應時間 < 1 秒
- [ ] 速率限制在 3 個請求/5 分鐘有效
- [ ] Supabase 查詢使用正確的索引

## 安全測試 (Security)
- [ ] PII 驗證在伺服器端工作
- [ ] 無效的 JWT 令牌被拒絕
- [ ] CORS 設定正確（只允許授權的來源）
- [ ] SQL 注入攻擊被防止

## 文件檢查 (Documentation)
- [ ] openapi-phase1.json 已驗證（在 https://editor.swagger.io）
- [ ] API_USAGE_EXAMPLES.md 清晰易懂
- [ ] README.md 包含快速啟動指南
`;

// ============================================
// 6. Swagger UI 設定（可選但推薦）
// ============================================

const swaggerSetup = `
// 後端: 加入以下到 src/server.ts
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const openAPISpec = JSON.parse(fs.readFileSync('./openapi-phase1.json', 'utf-8'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openAPISpec));

// 現在訪問 http://localhost:3000/api/docs
// 可以在 Swagger UI 中測試所有 API 端點
`;

// ============================================
// 7. 開發工作流程建議
// ============================================

const devWorkflow = `
# 推薦開發工作流程

## 早晨同步 (Morning Sync)
1. 檢查 GitHub Issues（如果使用）
2. 確認前一天的 PR 是否已合併
3. 執行 git pull 取得最新程式碼

## 開發循環 (Dev Loop)
1. 從任務列表選擇一個任務
2. 建立新的特性分支
   \`git checkout -b feature/blessing-form\`
3. 啟動開發伺服器（前端 + 後端）
4. 寫程式碼
5. 測試（手動 + 自動化）
6. Commit with descriptive message
7. 推送到 GitHub
8. 建立 Pull Request

## 代碼審查 (Code Review)
- 前端: 檢查 React 最佳實踐、Tailwind CSS 樣式、TypeScript 類型安全
- 後端: 檢查錯誤處理、資料驗證、Supabase 查詢優化
- 雙方: 檢查 OpenAPI 合規性、API 契約一致性

## 測試策略 (Testing Strategy)
- 單元測試: 驗證 PII 檢測邏輯、確定性雜湊函數
- 集成測試: 驗證 API 端點、Supabase 操作
- E2E 測試: 使用 Cypress 測試完整使用者流程

## 部署前檢查 (Pre-Deployment)
- [ ] 所有測試通過
- [ ] 不存在 console.error / console.log
- [ ] TypeScript 沒有編譯錯誤
- [ ] 環境變數已正確設定
- [ ] 資料庫遷移已執行
`;

// ============================================
// 8. 常見問題與故障排除 (Troubleshooting)
// ============================================

const troubleshooting = `
# 常見問題與解決方案

## 前端

### 問題: "fetch failed" - API 無法連接
原因: 後端伺服器未運行或 API_BASE_URL 設定錯誤
解決: 
- 確認後端運行在 http://localhost:3000
- 檢查 .env.local 中的 REACT_APP_API_BASE_URL
- 檢查後端 CORS 設定

### 問題: PII 檢測未工作
原因: usePIIDetection Hook 中的正則表達式不正確
解決:
- 驗證正則表達式模式
- 確認輸入的電話號碼格式正確（香港: 8 位或 +852 開頭）
- 在瀏覽器控制台檢查 detectedPatterns 值

### 問題: 表單無法提交
原因: Zod 驗證失敗或字數超過限制
解決:
- 確認字數在限制內
- 檢查必填欄位已填
- 在瀏覽器控制台查看驗證錯誤

## 後端

### 問題: "Supabase connection failed"
原因: SUPABASE_URL 或 SUPABASE_ANON_KEY 設定錯誤
解決:
- 從 Supabase 儀表板複製正確的 URL 和 KEY
- 檢查 .env 中的變數名稱
- 確認網路連接

### 問題: "RATE_LIMIT_EXCEEDED" 錯誤
原因: 在 5 分鐘內超過 3 個請求
解決:
- 等待 5 分鐘或重新啟動伺服器（清除記憶體中的限制)
- 檢查 rateLimitMiddleware 邏輯
- 生產環境改用 Redis

### 問題: PII 驗證在伺服器上失敗
原因: 正則表達式可能遺漏某些格式
解決:
- 在伺服器日誌中檢查 detectedPII 陣列
- 更新正則表達式以涵蓋更多格式
- 考慮使用 NLP 庫進行更精確的檢測

## 資料庫

### 問題: "relation 'blessings' does not exist"
原因: 資料表未建立
解決:
- 在 Supabase SQL 編輯器執行 supabase_schema.sql
- 確認表格在 Supabase UI 中可見

### 問題: 外鍵錯誤
原因: 表格建立順序不對
解決:
- 確保基礎表（keychains, prompts）先建立
- 執行完整的 supabase_schema.sql（包含 if not exists 子句）

## 部署問題

### 問題: "Mixed Content" 警告
原因: 前端是 HTTPS，後端是 HTTP
解決:
- 部署後端到支援 HTTPS 的服務（Vercel, Heroku）
- 更新 REACT_APP_API_BASE_URL 為 HTTPS 端點

### 問題: CORS 錯誤
原因: 前端域名未在後端允許清單中
解決:
- 在 src/server.ts 更新 cors 設定
- 確保生產 URL 已包含在 origin 陣列中
`;

// ============================================
// 9. 快速參考 (Cheat Sheet)
// ============================================

const cheatSheet = `
# 快速參考表

## 文件位置
- OpenAPI 規格: /openapi-phase1.json
- TypeScript 類型: /lib/api.types.ts
- React Hooks: /lib/hooks/useAPI.ts
- Express 路由: /routes/routes.ts
- 祝福表單: /components/BlessingForm.tsx
- 資料庫架構: /supabase_schema.sql

## API 端點速查

POST /api/blessings
  請求: CreateBlessingRequest
  回應: 201 BlessingResponse
  錯誤: 400 VALIDATION_ERROR, PII_DETECTED | 429 RATE_LIMIT_EXCEEDED

GET /api/blessings?keychain_id=...
  請求: GetBlessingsParams
  回應: 200 BlessingResponse[]
  錯誤: 400 VALIDATION_ERROR

PATCH /api/blessings/:id/hide
  請求: { is_hidden: boolean }
  回應: 200 BlessingResponse
  錯誤: 404 NOT_FOUND

POST /api/reports
  請求: CreateReportRequest
  回應: 201 ReportResponse
  錯誤: 400 VALIDATION_ERROR

GET /api/reactions?journey_id=...&station_number=...
  請求: GetReactionParams
  回應: 200 ReactionResponse
  錯誤: 400 VALIDATION_ERROR

## 限制值速查
- 祝福文字: 最多 15 字
- 暗語: 最多 10 字
- 備註: 最多 120 字
- 速率限制: 5 分鐘內最多 3 個請求

## 驗證規則速查
- PII 模式: PHONE_HK, PHONE_CN, EMAIL, URL, ADDRESS_HK
- 確定性種子公式: hash(journey_id + station_number)
- 小將句子庫: 50-100 個活躍句子，存在 elephant_reactions 表
`;

export default {
  exampleServer,
  integrationChecklist,
  swaggerSetup,
  devWorkflow,
  troubleshooting,
  cheatSheet
};
