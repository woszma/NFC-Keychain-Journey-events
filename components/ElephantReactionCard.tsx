/**
 * NFC Keychain Journey - Elephant Reaction Component
 * 顯示小將回應的元件（功能 D）
 */

import React from 'react';
import { Sparkles, RotateCw } from 'lucide-react';
import type { ReactionResponse } from '../lib/api.types';

// ============================================
// Props 定義
// ============================================

interface ElephantReactionProps {
  reaction: ReactionResponse | null;
  loading?: boolean;
  error?: any;
  onRetry?: () => void;
  showMetadata?: boolean; // 是否顯示分類、情感、seed
}

// ============================================
// 情感圖標對應
// ============================================

const EMOTION_ICONS: Record<string, string> = {
  Emotion: '💭',
  Ritual: '🙏',
  Gratitude: '🙏'
};

const CATEGORY_COLORS: Record<string, string> = {
  Blessing: 'bg-blue-50 border-blue-200',
  Encouragement: 'bg-green-50 border-green-200',
  Resonance: 'bg-purple-50 border-purple-200',
  Ritual: 'bg-yellow-50 border-yellow-200'
};

// ============================================
// 小將回應元件
// ============================================

export const ElephantReaction: React.FC<ElephantReactionProps> = ({
  reaction,
  loading = false,
  error,
  onRetry,
  showMetadata = false
}) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 text-center">
        <div className="inline-block animate-bounce text-4xl mb-3">🐘</div>
        <p className="text-gray-600 font-medium">小將正在思考...</p>
        <p className="text-sm text-gray-500 mt-1">尋找最適合的回應</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <p className="text-red-700 font-semibold mb-2">無法取得小將回應</p>
        <p className="text-sm text-red-600 mb-3">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
          >
            <RotateCw size={14} />
            重試
          </button>
        )}
      </div>
    );
  }

  if (!reaction) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
        <p className="text-gray-500">無回應</p>
      </div>
    );
  }

  const emotionIcon = EMOTION_ICONS[reaction.emotion_type] || '💭';
  const categoryColor = CATEGORY_COLORS[reaction.category] || 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-lg p-6 border-2 ${categoryColor} transition-all`}>
      {/* 標題 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-3xl">🐘</span>
        <div>
          <p className="font-bold text-gray-800">小將說:</p>
          <p className="text-xs text-gray-500">冒險象 · 智慧回應</p>
        </div>
      </div>

      {/* 回應文字 */}
      <p className="text-lg leading-relaxed text-gray-800 mb-4 italic">
        「{reaction.reaction_text}」
      </p>

      {/* 分類標籤 */}
      {showMetadata && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-2 py-1 bg-white rounded text-xs font-semibold text-gray-700">
            {reaction.category}
          </span>
          <span className="inline-block px-2 py-1 bg-white rounded text-xs font-semibold text-gray-700">
            {emotionIcon} {reaction.emotion_type}
          </span>
        </div>
      )}

      {/* Seed 資訊（調試用）*/}
      {showMetadata && (
        <div className="text-xs text-gray-600 p-2 bg-white rounded border border-gray-200 font-mono">
          <p className="text-gray-500">旅程種子: {reaction.seed}</p>
          <p className="text-gray-500">
            {reaction.journey_id} @ 站點 {reaction.station_number}
          </p>
        </div>
      )}

      {/* 動畫效果 */}
      <div className="mt-3 flex justify-center">
        <Sparkles size={16} className="text-yellow-400 animate-pulse" />
      </div>
    </div>
  );
};

// ============================================
// 反應卡片容器（用於整合祝福列表）
// ============================================

interface ReactionCardContainerProps {
  journeyId: string;
  stationNumber: number;
  reaction: ReactionResponse | null;
  loading?: boolean;
  error?: any;
  onRetry?: () => void;
}

export const ReactionCardContainer: React.FC<ReactionCardContainerProps> = ({
  journeyId,
  stationNumber,
  reaction,
  loading,
  error,
  onRetry
}) => {
  return (
    <div className="my-6 border-t-2 border-b-2 border-yellow-200 py-4 px-2 bg-gradient-to-r from-yellow-50 to-orange-50">
      <ElephantReaction
        reaction={reaction}
        loading={loading}
        error={error}
        onRetry={onRetry}
        showMetadata={false}
      />
    </div>
  );
};

export default ElephantReaction;
