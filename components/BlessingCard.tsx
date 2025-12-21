/**
 * NFC Keychain Journey - Blessing Card Component
 * 顯示單個祝福卡片的元件（功能 A）
 */

import React from 'react';
import { Heart, Flag, Eye, EyeOff } from 'lucide-react';
import type { BlessingResponse } from '../lib/api.types';

// ============================================
// Props 定義
// ============================================

interface BlessingCardProps {
  blessing: BlessingResponse;
  isAdmin?: boolean;
  onReport?: (blessingId: number) => void;
  onHide?: (blessingId: number, isHidden: boolean) => void;
  showCodePhrase?: boolean; // 是否顯示暗語
}

// ============================================
// 元件
// ============================================

export const BlessingCard: React.FC<BlessingCardProps> = ({
  blessing,
  isAdmin = false,
  onReport,
  onHide,
  showCodePhrase = false
}) => {
  const [showActions, setShowActions] = React.useState(false);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} 分鐘前`;
      }
      return `${diffHours} 小時前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-HK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 border-blue-400 hover:shadow-lg transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 祝福文字 */}
      <p className="text-lg font-semibold text-gray-800 mb-2">
        💙 {blessing.blessing_text}
      </p>

      {/* 可見性與時間 */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        {blessing.visibility === 'public' ? (
          <Eye size={16} />
        ) : (
          <EyeOff size={16} />
        )}
        <span>{blessing.visibility === 'public' ? '公開' : '私密'}</span>
        <span>•</span>
        <span>{formatDate(blessing.created_at)}</span>
      </div>

      {/* 備註（如果存在） */}
      {blessing.optional_note && (
        <p className="text-sm text-gray-600 italic mb-2">
          「{blessing.optional_note}」
        </p>
      )}

      {/* 站點編號 */}
      <p className="text-xs text-gray-400 mb-3">
        站點 #{blessing.station_number}
      </p>

      {/* 暗語（可選，僅管理員或表單提交者看得到） */}
      {showCodePhrase && blessing.code_phrase && (
        <div className="bg-gray-100 rounded p-2 mb-3 text-xs">
          <span className="text-gray-600">🔐 暗語: </span>
          <span className="font-mono text-gray-700">{blessing.code_phrase}</span>
        </div>
      )}

      {/* 操作按鈕（管理員用） */}
      {(showActions || isAdmin) && (
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {onReport && (
            <button
              onClick={() => onReport(blessing.id)}
              className="flex-1 text-xs py-1 px-2 rounded text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
            >
              <Flag size={14} />
              舉報
            </button>
          )}

          {isAdmin && onHide && (
            <button
              onClick={() => onHide(blessing.id, !blessing.is_hidden)}
              className="flex-1 text-xs py-1 px-2 rounded text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1"
            >
              {blessing.is_hidden ? (
                <>
                  <Eye size={14} />
                  顯示
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  隱藏
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 隱藏提示（僅管理員） */}
      {blessing.is_hidden && isAdmin && (
        <div className="mt-2 text-xs bg-yellow-50 p-2 rounded text-yellow-700">
          ⚠️ 此祝福已被隱藏
        </div>
      )}
    </div>
  );
};

// ============================================
// 祝福列表容器元件
// ============================================

interface BlessingListProps {
  blessings: BlessingResponse[];
  loading?: boolean;
  isAdmin?: boolean;
  onReport?: (blessingId: number) => void;
  onHide?: (blessingId: number, isHidden: boolean) => void;
  emptyMessage?: string;
}

export const BlessingList: React.FC<BlessingListProps> = ({
  blessings,
  loading = false,
  isAdmin = false,
  onReport,
  onHide,
  emptyMessage = '還沒有祝福，成為第一個吧！'
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin">
          <Heart size={32} className="text-blue-500" />
        </div>
        <p className="mt-2 text-gray-600">載入祝福中...</p>
      </div>
    );
  }

  if (blessings.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {blessings.map((blessing) => (
        <BlessingCard
          key={blessing.id}
          blessing={blessing}
          isAdmin={isAdmin}
          onReport={onReport}
          onHide={onHide}
          showCodePhrase={isAdmin}
        />
      ))}
    </div>
  );
};

export default BlessingCard;
