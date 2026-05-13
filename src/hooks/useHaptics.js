"use client"
import { useCallback } from 'react';

export function useHaptics() {
  const triggerHaptic = useCallback((type = 'light') => {
    if (!('vibrate' in navigator)) return;
    
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10); // Sangat singkat, seperti tick
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([15, 50, 30]); // dua ketukan cepat
          break;
        case 'warning':
          navigator.vibrate([30, 100, 30, 100, 50]); // pola getar peringatan
          break;
        case 'earthquake':
          navigator.vibrate([50, 30, 100, 30, 200, 30, 300]); // simulasi gempa
          break;
        default:
          navigator.vibrate(20);
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }, []);

  return { triggerHaptic };
}
