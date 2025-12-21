/**
 * NFC Keychain Journey - Blessing Form Component
 * 前端表單元件框架（功能 A: 冒險者留言）
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBlessing, usePIIDetection, useCharacterCount } from '../lib/hooks/useAPI';
import type { CreateBlessingRequest } from '../lib/api.types';

// ============================================
// 表單驗證 Schema (Zod)
// ============================================

const blessingFormSchema = z.object({
  blessing_text: z
    .string()
    .min(1, '祝福文字不能為空')
    .max(15, '祝福文字不能超過 15 字'),
  code_phrase: z
    .string()
    .min(1, '暗語不能為空')
    .max(10, '暗語不能超過 10 字'),
  optional_note: z
    .string()
    .max(120, '備註不能超過 120 字')
    .optional(),
  station_number: z
    .number()
    .int('站點編號必須為整數')
    .min(1, '站點編號最小為 1')
    .optional()
});

type BlessingFormData = z.infer<typeof blessingFormSchema>;

// ============================================
// Props 定義
// ============================================

interface BlessingFormProps {
  keychainId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  stationNumber?: number;
}

// ============================================
// 表單元件
// ============================================

export const BlessingForm: React.FC<BlessingFormProps> = ({
  keychainId,
  onSuccess,
  onError,
  stationNumber = 1
}) => {
  const { createBlessing, loading, error, data } = useCreateBlessing();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<BlessingFormData>({
    resolver: zodResolver(blessingFormSchema)
  });

  // 監控文字變更以檢測 PII
  const blessingText = watch('blessing_text', '');
  const codePhrase = watch('code_phrase', '');
  const optionalNote = watch('optional_note', '');

  // PII 檢測
  const { isPII: blessingPII } = usePIIDetection(blessingText);
  const { isPII: codePII } = usePIIDetection(codePhrase);
  const { isPII: notePII } = usePIIDetection(optionalNote);

  const hasAnyPII = blessingPII || codePII || notePII;

  // 字數計算
  const { count: blessingCount, remaining: blessingRemaining } = useCharacterCount(blessingText, 15);
  const { count: codeCount, remaining: codeRemaining } = useCharacterCount(codePhrase, 10);
  const { count: noteCount, remaining: noteRemaining } = useCharacterCount(optionalNote, 120);

  // 表單提交
  const onSubmit = async (formData: BlessingFormData) => {
    try {
      const payload: CreateBlessingRequest = {
        keychain_id: keychainId,
        blessing_text: formData.blessing_text,
        code_phrase: formData.code_phrase,
        optional_note: formData.optional_note,
        station_number: formData.station_number || stationNumber,
        visibility: 'public'
      };

      const result = await createBlessing(payload);
      setSubmitted(true);

      if (onSuccess) {
        onSuccess(result);
      }

      // 3 秒後重置表單
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  // 成功狀態
  if (submitted && data) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <h3 className="font-bold">祝福已提交！</h3>
        <p className="text-sm">感謝你的祝福，小將已收到。✨</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 祝福文字輸入框 */}
      <div>
        <label htmlFor="blessing_text" className="block text-sm font-medium text-gray-700 mb-2">
          祝福文字 *
        </label>
        <div className="relative">
          <textarea
            id="blessing_text"
            placeholder="輸入你的祝福（最多 15 字）"
            maxLength={15}
            rows={2}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              hasAnyPII || errors.blessing_text
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${blessingPII ? 'bg-red-50' : ''}`}
            {...register('blessing_text')}
          />
          <span className="absolute bottom-1 right-3 text-xs text-gray-500">
            {blessingCount}/15
          </span>
        </div>

        {blessingPII && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ 偵測到可能的個人資訊，請移除或修改
          </p>
        )}

        {errors.blessing_text && (
          <p className="text-xs text-red-600 mt-1">{errors.blessing_text.message}</p>
        )}
      </div>

      {/* 暗語輸入框 */}
      <div>
        <label htmlFor="code_phrase" className="block text-sm font-medium text-gray-700 mb-2">
          暗語（只有你和接收者知道）*
        </label>
        <div className="relative">
          <input
            id="code_phrase"
            type="text"
            placeholder="輸入暗語（最多 10 字）"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              codePII || errors.code_phrase
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${codePII ? 'bg-red-50' : ''}`}
            {...register('code_phrase')}
          />
          <span className="absolute right-3 top-2 text-xs text-gray-500">
            {codeCount}/10
          </span>
        </div>

        {codePII && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ 暗語中偵測到可能的個人資訊
          </p>
        )}

        {errors.code_phrase && (
          <p className="text-xs text-red-600 mt-1">{errors.code_phrase.message}</p>
        )}
      </div>

      {/* 備註（可選） */}
      <div>
        <label htmlFor="optional_note" className="block text-sm font-medium text-gray-700 mb-2">
          備註（可選，最多 120 字）
        </label>
        <div className="relative">
          <textarea
            id="optional_note"
            placeholder="例如：這是我在哪個年份的祝福"
            maxLength={120}
            rows={2}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              notePII || errors.optional_note
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${notePII ? 'bg-red-50' : ''}`}
            {...register('optional_note')}
          />
          <span className="absolute bottom-1 right-3 text-xs text-gray-500">
            {noteCount}/120
          </span>
        </div>

        {notePII && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ 備註中偵測到可能的個人資訊
          </p>
        )}

        {errors.optional_note && (
          <p className="text-xs text-red-600 mt-1">{errors.optional_note.message}</p>
        )}
      </div>

      {/* 站點編號（可選） */}
      <div>
        <label htmlFor="station_number" className="block text-sm font-medium text-gray-700 mb-2">
          站點編號（可選，預設為 1）
        </label>
        <input
          id="station_number"
          type="number"
          placeholder="站點編號"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('station_number', { valueAsNumber: true })}
        />
      </div>

      {/* 伺服端錯誤 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">{error.error}</p>
          <p className="text-sm">{error.message}</p>
          {error.details && (
            <pre className="text-xs mt-2 bg-red-50 p-2 rounded overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* 提交按鈕 */}
      <button
        type="submit"
        disabled={loading || hasAnyPII}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          loading || hasAnyPII
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {loading ? '提交中...' : '提交祝福'}
      </button>

      {/* 提示文字 */}
      <p className="text-xs text-gray-500 text-center">
        🔒 你的祝福會被加密保存。暗語只有你和接收者知道。
      </p>
    </form>
  );
};

export default BlessingForm;
