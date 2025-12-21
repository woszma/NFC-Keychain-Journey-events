/**
 * NFC Keychain Journey - Report Menu Component
 * 舉報祝福的模態視窗（功能 A）
 */

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useCreateReport } from '../lib/hooks/useAPI';
import type { CreateReportRequest } from '../lib/api.types';

// ============================================
// Props 定義
// ============================================

interface ReportMenuProps {
  blessingId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// ============================================
// 舉報原因選項
// ============================================

const REPORT_REASONS = [
  {
    value: 'PII_EXPOSED',
    label: '包含個人資訊',
    description: '電話號碼、地址、姓名等個人資訊'
  },
  {
    value: 'INAPPROPRIATE',
    label: '不適當內容',
    description: '騷擾、辱罵或仇恨言論'
  },
  {
    value: 'SPAM',
    label: '垃圾訊息',
    description: '廣告或無關內容'
  },
  {
    value: 'OTHER',
    label: '其他',
    description: '請在下方描述問題'
  }
] as const;

type ReportReason = typeof REPORT_REASONS[number]['value'];

// ============================================
// 舉報菜單元件
// ============================================

export const ReportMenu: React.FC<ReportMenuProps> = ({
  blessingId,
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const { createReport, loading, error } = useCreateReport();

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert('請選擇舉報原因');
      return;
    }

    try {
      const payload: CreateReportRequest = {
        blessing_id: blessingId,
        reason: selectedReason,
        description: description || undefined
      };

      await createReport(payload);

      // 成功後清空表單並關閉
      setSelectedReason(null);
      setDescription('');
      onClose();

      if (onSuccess) {
        onSuccess();
      }

      alert('感謝你的舉報！我們會盡快審核。');
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            舉報此祝福
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* 說明 */}
        <p className="text-sm text-gray-600 mb-4">
          請告訴我們為什麼要舉報這個祝福，以幫助我們保持社群安全。
        </p>

        {/* 舉報原因選項 */}
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason.value}
              className="flex items-start p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={() => setSelectedReason(reason.value)}
                className="mt-1"
              />
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-800">{reason.label}</p>
                <p className="text-xs text-gray-600">{reason.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* 詳細描述（如果選擇「其他」） */}
        {selectedReason === 'OTHER' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              請詳細描述問題 (可選)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請在此説明為什麼要舉報..."
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200
            </p>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <p className="font-semibold">{error.error}</p>
            <p>{error.message}</p>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedReason}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交舉報'}
          </button>
        </div>

        {/* 免責聲明 */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          虛假舉報可能導致帳號被限制。
        </p>
      </div>
    </div>
  );
};

export default ReportMenu;
