'use client';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Custom hook for detecting swipe gestures
 * Uses native touch events - no external libraries
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefault = true,
}: UseSwipeOptions = {}) {
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (preventDefault) {
        moveEvent.preventDefault();
      }
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      const touch = endEvent.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      // Determine swipe direction based on largest movement
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (diffX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (diffY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      // Clean up event listeners
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return { handleTouchStart };
}
