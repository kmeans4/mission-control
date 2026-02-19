'use client';

interface UseLongPressOptions {
  onLongPress?: () => void;
  onPress?: () => void;
  onPressUp?: () => void;
  delay?: number;
  preventDefault?: boolean;
}

/**
 * Custom hook for long press gesture detection
 * Uses native touch/mouse events - no external libraries
 */
export function useLongPress({
  onLongPress,
  onPress,
  onPressUp,
  delay = 500,
  preventDefault = true,
}: UseLongPressOptions = {}) {
  let timer: NodeJS.Timeout | null = null;
  let isPressed = false;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (preventDefault && e.cancelable) {
      e.preventDefault();
    }

    isPressed = true;

    // Call onPress if provided
    if (onPress) {
      onPress();
    }

    // Start timer for long press
    timer = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
    }, delay);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (preventDefault && e.cancelable) {
      e.preventDefault();
    }

    isPressed = false;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // Trigger regular press if long press wasn't triggered
    if (onPressUp) {
      onPressUp();
    }
  };

  const handleTouchCancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
}
