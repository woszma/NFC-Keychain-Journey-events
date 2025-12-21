/**
 * NFC Keychain Journey - 象徵句子庫初始化
 * elephant_reactions 表的 50-100 個種子資料
 * 
 * 說明: 
 * - 這些句子應該在 Phase 1 完成時進行初始化
 * - 可在 Supabase SQL 編輯器中執行此檔案
 * - 或使用 Supabase migrations 功能
 */

-- ============================================
-- 插入 50 個象徵句子 (初始集)
-- ============================================

INSERT INTO elephant_reactions (reaction_text, category, emotion_type, status, created_at) VALUES

-- ✨ Blessing 類別 (祝福) - 15 個句子
('願你在每個轉角都能找到驚喜。', 'Blessing', 'Emotion', 'active', NOW()),
('你的祝福已被記錄在冒險的故事中。', 'Blessing', 'Emotion', 'active', NOW()),
('所有的善念都會在某個時刻閃耀。', 'Blessing', 'Emotion', 'active', NOW()),
('這個祝福正朝著對方飛去。', 'Blessing', 'Emotion', 'active', NOW()),
('在漫長的旅程裡，有你的祝福陪伴。', 'Blessing', 'Emotion', 'active', NOW()),
('祝福如同燈塔，照亮前行的路。', 'Blessing', 'Emotion', 'active', NOW()),
('你的善意已經成為某人的力量。', 'Blessing', 'Emotion', 'active', NOW()),
('祝福在心中悄悄開花。', 'Blessing', 'Emotion', 'active', NOW()),
('願這份祝福成為你們之間的橋樑。', 'Blessing', 'Emotion', 'active', NOW()),
('每一句祝福都是一次愛的傳遞。', 'Blessing', 'Emotion', 'active', NOW()),
('距離改變不了你們心連心。', 'Blessing', 'Emotion', 'active', NOW()),
('祝福會在夜空中化作星光。', 'Blessing', 'Emotion', 'active', NOW()),
('這份祝福會一直陪伴你們。', 'Blessing', 'Emotion', 'active', NOW()),
('願你們的故事充滿溫暖。', 'Blessing', 'Emotion', 'active', NOW()),
('祝福永不過期。', 'Blessing', 'Emotion', 'active', NOW()),

-- 💪 Encouragement 類別 (鼓勵) - 15 個句子
('加油！每一步都算數。', 'Encouragement', 'Emotion', 'active', NOW()),
('你比你想像的更堅強。', 'Encouragement', 'Emotion', 'active', NOW()),
('困難只是暫時的，你會度過。', 'Encouragement', 'Emotion', 'active', NOW()),
('相信自己，你可以做到。', 'Encouragement', 'Emotion', 'active', NOW()),
('每次跌倒都是為了更好地起身。', 'Encouragement', 'Emotion', 'active', NOW()),
('你的努力會被看見。', 'Encouragement', 'Emotion', 'active', NOW()),
('堅持下去，好事會發生。', 'Encouragement', 'Emotion', 'active', NOW()),
('你值得所有美好的事物。', 'Encouragement', 'Emotion', 'active', NOW()),
('前方有光，繼續前行。', 'Encouragement', 'Emotion', 'active', NOW()),
('勇敢向前，不負韶華。', 'Encouragement', 'Emotion', 'active', NOW()),
('你已經走了這麼遠，別放棄。', 'Encouragement', 'Emotion', 'active', NOW()),
('困頓只是黎明前的黑暗。', 'Encouragement', 'Emotion', 'active', NOW()),
('相信時間的力量。', 'Encouragement', 'Emotion', 'active', NOW()),
('你的故事才剛開始。', 'Encouragement', 'Emotion', 'active', NOW()),
('夢想值得為之努力。', 'Encouragement', 'Emotion', 'active', NOW()),

-- 🌊 Resonance 類別 (共鳴) - 10 個句子
('我也有過這樣的感受。', 'Resonance', 'Emotion', 'active', NOW()),
('你的感受被聽見了。', 'Resonance', 'Emotion', 'active', NOW()),
('這份感受在我心中引起了漣漪。', 'Resonance', 'Emotion', 'active', NOW()),
('你不是一個人，我們都懂。', 'Resonance', 'Emotion', 'active', NOW()),
('你的故事與我的相似。', 'Resonance', 'Emotion', 'active', NOW()),
('我能感受到你的真摯。', 'Resonance', 'Emotion', 'active', NOW()),
('這份感受在許多人心中共鳴。', 'Resonance', 'Emotion', 'active', NOW()),
('你用文字打動了我。', 'Resonance', 'Emotion', 'active', NOW()),
('我也曾有過如此深刻的感受。', 'Resonance', 'Emotion', 'active', NOW()),
('我與你的祝福同頻共振。', 'Resonance', 'Emotion', 'active', NOW()),

-- 🙏 Ritual 類別 (儀式) - 10 個句子
('這一刻被永遠記錄。', 'Ritual', 'Ritual', 'active', NOW()),
('我們在命運的某個節點相遇。', 'Ritual', 'Ritual', 'active', NOW()),
('時光停在這份美好裡。', 'Ritual', 'Ritual', 'active', NOW()),
('這是一場靈魂的對話。', 'Ritual', 'Ritual', 'active', NOW()),
('你的名字被寫在我的記憶裡。', 'Ritual', 'Ritual', 'active', NOW()),
('這是一份神聖的約定。', 'Ritual', 'Ritual', 'active', NOW()),
('我們的相遇是有意義的。', 'Ritual', 'Ritual', 'active', NOW()),
('這份祝福會在時空中流轉。', 'Ritual', 'Ritual', 'active', NOW()),
('此刻，我們的靈魂相接。', 'Ritual', 'Ritual', 'active', NOW()),
('記得這一瞬間的溫度。', 'Ritual', 'Ritual', 'active', NOW()),

-- 😊 Gratitude 類別 (感謝) - 預留未使用

ON CONFLICT DO NOTHING;

-- ============================================
-- 驗證插入結果
-- ============================================

-- 查看插入的句子數量
SELECT COUNT(*) as total_reactions FROM elephant_reactions WHERE status = 'active';

-- 查看各分類的數量
SELECT category, emotion_type, COUNT(*) as count 
FROM elephant_reactions 
WHERE status = 'active'
GROUP BY category, emotion_type
ORDER BY category;

-- ============================================
-- 備註
-- ============================================

/*
執行結果應該顯示:
- 總共 50 個 active 句子
- 分類分佈:
  * Blessing (祝福): 15 個
  * Encouragement (鼓勵): 15 個
  * Resonance (共鳴): 10 個
  * Ritual (儀式): 10 個

如果需要繼續添加句子至 100 個，請執行 elephant_reactions_expansion.sql
*/
