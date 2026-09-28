import { useCallback, useEffect, useState } from 'react';
import { BLOCK_SKINS, DEFAULT_SKIN_ID, getSkinById } from '../constants/skins';
import { BlockSkin } from '../types/tetris';
import { sound } from '../utils/audio';

const STORAGE_UNLOCKED_KEY = 'tetris_unlocked_skins';
const STORAGE_ACTIVE_KEY = 'tetris_active_skin';

export function useSkins(currentScore: number, highScore: number) {
  // Initial state from localStorage or default
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_UNLOCKED_KEY);
      const parsed: string[] = saved ? JSON.parse(saved) : ['classic'];
      if (!parsed.includes('classic')) parsed.push('classic');

      // Also auto-unlock skins if highScore already qualifies
      const savedHighScore = localStorage.getItem('retro_tetris_high_score');
      const best = Math.max(0, savedHighScore ? parseInt(savedHighScore, 10) || 0 : 0);
      for (const skin of BLOCK_SKINS) {
        if (skin.requiredScore <= best && !parsed.includes(skin.id)) {
          parsed.push(skin.id);
        }
      }
      return parsed;
    } catch {
      return ['classic'];
    }
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      return saved && BLOCK_SKINS.some((s) => s.id === saved) ? saved : DEFAULT_SKIN_ID;
    } catch {
      return DEFAULT_SKIN_ID;
    }
  });

  const [newlyUnlockedSkin, setNewlyUnlockedSkin] = useState<BlockSkin | null>(null);

  // Sync unlocked skins to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(unlockedSkinIds));
    } catch {
      // Storage might be unavailable
    }
  }, [unlockedSkinIds]);

  // Check score against all skins whenever score or highScore updates
  useEffect(() => {
    const effectiveScore = Math.max(currentScore, highScore);
    const qualifyingSkins = BLOCK_SKINS.filter(
      (skin) => skin.requiredScore > 0 && skin.requiredScore <= effectiveScore
    );

    const newlyQualifying = qualifyingSkins.filter((s) => !unlockedSkinIds.includes(s.id));
    if (newlyQualifying.length > 0) {
      const newestSkin = newlyQualifying[newlyQualifying.length - 1];
      setUnlockedSkinIds((prev) => {
        const next = [...prev];
        newlyQualifying.forEach((s) => {
          if (!next.includes(s.id)) next.push(s.id);
        });
        return next;
      });

      // If unlocked during active play (currentScore > 0), trigger fanfare celebration
      if (currentScore > 0) {
        sound.playSkinUnlock();
        setNewlyUnlockedSkin(newestSkin);
      }
    }
  }, [currentScore, highScore, unlockedSkinIds]);

  const equipSkin = useCallback(
    (skinId: string) => {
      if (unlockedSkinIds.includes(skinId)) {
        setActiveSkinId(skinId);
        try {
          localStorage.setItem(STORAGE_ACTIVE_KEY, skinId);
        } catch {
          // ignore
        }
      }
    },
    [unlockedSkinIds]
  );

  const dismissUnlock = useCallback(() => {
    setNewlyUnlockedSkin(null);
  }, []);

  const activeSkin = getSkinById(activeSkinId);

  return {
    allSkins: BLOCK_SKINS,
    unlockedSkinIds,
    activeSkin,
    activeSkinId,
    newlyUnlockedSkin,
    equipSkin,
    dismissUnlock,
  };
}
