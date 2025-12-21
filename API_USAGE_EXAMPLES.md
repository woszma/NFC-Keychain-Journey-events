/**
 * NFC Keychain Journey - API 使用範例
 * 前端、後端開發者參考
 */

// ============================================
// 示例 1: React 元件使用 - 祝福表單
// ============================================

import React from 'react';
import BlessingForm from '@/components/BlessingForm';

export function JourneyStationPage({ keychainId }: { keychainId: string }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">在此站點留下祝福</h2>
      
      <BlessingForm
        keychainId={keychainId}
        stationNumber={1}
        onSuccess={(data) => {
          console.log('祝福已提交:', data);
          // 觸發小將回應顯示
        }}
        onError={(error) => {
          console.error('提交失敗:', error);
        }}
      />
    </div>
  );
}

// ============================================
// 示例 2: React Hook 直接使用
// ============================================

import { useCreateBlessing, useGetBlessings, useGetReaction } from '@/lib/hooks/useAPI';

export function BlessingDisplayComponent({ keychainId }: { keychainId: string }) {
  // 取得祝福列表
  const { blessings, loading: blessingsLoading, refetch } = useGetBlessings({
    keychain_id: keychainId,
    station_number: 1,
    visibility: 'public'
  });

  // 提交新祝福
  const { createBlessing, loading: createLoading } = useCreateBlessing();

  const handleSubmit = async () => {
    try {
      const result = await createBlessing({
        keychain_id: keychainId,
        blessing_text: '祝福文字',
        code_phrase: '暗語',
        optional_note: '備註',
        station_number: 1,
        visibility: 'public'
      });

      console.log('新祝福:', result);
      refetch(); // 重新取得列表
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={createLoading}>
        {createLoading ? '提交中...' : '提交祝福'}
      </button>

      {blessingsLoading ? (
        <p>載入中...</p>
      ) : (
        <ul>
          {blessings.map((blessing) => (
            <li key={blessing.id}>
              <p>{blessing.blessing_text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// 示例 3: React 鉤子 - 小將回應
// ============================================

export function ElephantReactionComponent({ journeyId }: { journeyId: string }) {
  const { reaction, loading } = useGetReaction({
    journey_id: journeyId,
    station_number: 1
  });

  if (loading) return <div>小將正在思考...</div>;

  if (!reaction) return <div>無法取得小將回應</div>;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <p className="text-lg font-bold">🐘 小將說：</p>
      <p className="mt-2 text-gray-700">{reaction.reaction_text}</p>
      <p className="text-xs text-gray-500 mt-2">
        分類: {reaction.category} | 情感: {reaction.emotion_type}
      </p>
    </div>
  );
}

// ============================================
// 示例 4: Express 後端使用
// ============================================

import express from 'express';
import { blessingsRouter, reactionsRouter } from '@/routes/routes';

const app = express();

app.use(express.json());

// 註冊路由
app.use('/api', blessingsRouter);
app.use('/api', reactionsRouter);

// 啟動伺服器
app.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});

// ============================================
// 示例 5: cURL 測試 API
// ============================================

/*
# 1. 提交祝福
curl -X POST http://localhost:3000/api/blessings \
  -H "Content-Type: application/json" \
  -d '{
    "keychain_id": "journey-123",
    "blessing_text": "祝福文字",
    "code_phrase": "暗語",
    "optional_note": "備註",
    "station_number": 1,
    "visibility": "public"
  }'

# 2. 取得祝福列表
curl -X GET "http://localhost:3000/api/blessings?keychain_id=journey-123&station_number=1"

# 3. 隱藏祝福（管理員用）
curl -X PATCH http://localhost:3000/api/blessings/1/hide \
  -H "Content-Type: application/json" \
  -d '{"is_hidden": true}'

# 4. 提交舉報
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "blessing_id": 1,
    "reason": "PII_EXPOSED",
    "description": "包含個人資訊"
  }'

# 5. 取得小將回應
curl -X GET "http://localhost:3000/api/reactions?journey_id=journey-123&station_number=1"
*/

// ============================================
// 示例 6: TypeScript 類型安全使用
// ============================================

import type {
  CreateBlessingRequest,
  BlessingResponse,
  CreateReportRequest,
  ReportResponse,
  GetReactionParams,
  ReactionResponse,
  ErrorResponse
} from '@/lib/api.types';

async function createBlessingExample() {
  const request: CreateBlessingRequest = {
    keychain_id: 'journey-123',
    blessing_text: '祝福',
    code_phrase: '暗語',
    optional_note: '備註',
    station_number: 1,
    visibility: 'public'
  };

  try {
    const response = await fetch('/api/blessings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (response.ok) {
      const blessing: BlessingResponse = await response.json();
      console.log('成功:', blessing);
    } else {
      const error: ErrorResponse = await response.json();
      console.error('錯誤:', error.error, error.message);
    }
  } catch (error) {
    console.error('網路錯誤:', error);
  }
}

async function getReactionExample() {
  const params: GetReactionParams = {
    journey_id: 'journey-123',
    station_number: 1
  };

  try {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );

    const response = await fetch(`/api/reactions?${queryString}`);

    if (response.ok) {
      const reaction: ReactionResponse = await response.json();
      console.log('小將回應:', reaction.reaction_text);
      console.log('確定性種子:', reaction.seed);
    } else {
      const error: ErrorResponse = await response.json();
      console.error('錯誤:', error.error);
    }
  } catch (error) {
    console.error('網路錯誤:', error);
  }
}

// ============================================
// 示例 7: 錯誤處理流程
// ============================================

async function handleBlessingError() {
  const { createBlessing, error } = useCreateBlessing();

  try {
    await createBlessing({
      keychain_id: 'journey-123',
      blessing_text: '我的電話是 12345678',
      code_phrase: '暗語'
    });
  } catch (err) {
    const errorResponse = err as ErrorResponse;

    switch (errorResponse.error) {
      case 'VALIDATION_ERROR':
        console.error('驗證錯誤:', errorResponse.details);
        break;
      case 'PII_DETECTED':
        console.error('偵測到 PII:', errorResponse.detected_patterns);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('超過速率限制，請在', errorResponse.retry_after, '秒後重試');
        break;
      case 'INTERNAL_ERROR':
        console.error('伺服器錯誤:', errorResponse.message);
        break;
    }
  }
}

// ============================================
// 示例 8: PII 檢測（客戶端）
// ============================================

import { usePIIDetection, useCharacterCount } from '@/lib/hooks/useAPI';

export function PiiDetectionExample() {
  const [text, setText] = React.useState('');
  const { isPII, detectedPatterns } = usePIIDetection(text);
  const { count, isExceeded } = useCharacterCount(text, 15);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="輸入文字進行實時 PII 檢測"
      />

      <p>字數: {count}/15 {isExceeded && '❌ 超過'}</p>

      {isPII && (
        <p className="text-red-600">
          ⚠️ 偵測到可能的 PII: {detectedPatterns.join(', ')}
        </p>
      )}

      {!isPII && count > 0 && (
        <p className="text-green-600">✅ 沒有偵測到 PII</p>
      )}
    </div>
  );
}

// ============================================
// 示例 9: 舉報流程
// ============================================

export function ReportBlessingComponent({ blessingId }: { blessingId: number }) {
  const { createReport, loading } = useCreateReport();
  const [reason, setReason] = React.useState<'PII_EXPOSED' | 'INAPPROPRIATE' | 'SPAM' | 'OTHER'>('INAPPROPRIATE');

  const handleReport = async () => {
    try {
      const report: CreateReportRequest = {
        blessing_id: blessingId,
        reason: reason,
        description: '不適當的內容'
      };

      await createReport(report);
      alert('舉報已提交，感謝你的回報！');
    } catch (error) {
      console.error('舉報失敗:', error);
    }
  };

  return (
    <div>
      <select value={reason} onChange={(e) => setReason(e.target.value as any)}>
        <option value="PII_EXPOSED">包含個人資訊</option>
        <option value="INAPPROPRIATE">不適當內容</option>
        <option value="SPAM">垃圾訊息</option>
        <option value="OTHER">其他</option>
      </select>

      <button onClick={handleReport} disabled={loading}>
        {loading ? '提交中...' : '舉報'}
      </button>
    </div>
  );
}

// ============================================
// 示例 10: 整合式頁面（完整流程）
// ============================================

export function CompleteJourneyPage({ keychainId }: { keychainId: string }) {
  const [activeTab, setActiveTab] = React.useState<'submit' | 'view' | 'reaction'>('submit');

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">冒險旅程</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('submit')}
          className={activeTab === 'submit' ? 'font-bold' : ''}
        >
          留下祝福
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={activeTab === 'view' ? 'font-bold' : ''}
        >
          查看祝福
        </button>
        <button
          onClick={() => setActiveTab('reaction')}
          className={activeTab === 'reaction' ? 'font-bold' : ''}
        >
          小將回應
        </button>
      </div>

      {activeTab === 'submit' && <BlessingForm keychainId={keychainId} />}
      {activeTab === 'view' && <BlessingDisplayComponent keychainId={keychainId} />}
      {activeTab === 'reaction' && <ElephantReactionComponent journeyId={keychainId} />}
    </div>
  );
}
