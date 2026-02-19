'use client';

interface UsePullToRefreshOptions {
  onRefresh: () => void;
  threshold?: number;
  maxPullDistance?: number;
}

interface TouchPosition {
  y: number;
  time: number;
}

/**
 * Custom hook for pull-to-refresh gesture
 * Uses native touch events - no external libraries
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 150,
  maxPullDistance = 300,
}: UsePullToRefreshOptions) {
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.target as Element).setAttribute('data-pull-start-y', touch.clientY.toString());
    (e.target as Element).setAttribute('data-pull-is-pulling', 'false');
    (e.target as Element).setAttribute('data-pull-distance', '0');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const startY = parseFloat((e.target as Element).getAttribute('data-pull-start-y') || '0');
    const isPulling = (e.target as Element).getAttribute('data-pull-is-pulling') === 'true';
    const scrollTop = (e.target as Element).scrollTop || window.pageYOffset;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diffY = currentY - startY;

    // Only pull when at top of scrollable area
    if (scrollTop <= 0 && diffY > 0) {
      e.preventDefault();

      if (!isPulling) {
        (e.target as Element).setAttribute('data-pull-is-pulling', 'true');
      }

      // Calculate pull distance with resistance
      const pullDistance = Math.min(diffY * 0.5, maxPullDistance);
      (e.target as Element).setAttribute('data-pull-distance', pullDistance.toString());

      // Dispatch custom event for visual feedback
      const event = new CustomEvent('pull-change', {
        detail: { distance: pullDistance, progress: pullDistance / threshold },
      });
      (e.target as Element).dispatchEvent(event);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const isPulling = (e.target as Element).getAttribute('data-pull-is-pulling') === 'true';
    const pullDistance = parseFloat((e.target as Element).getAttribute('data-pull-distance') || '0');

    if (isPulling && pullDistance >= threshold) {
      // Trigger refresh
      onRefresh();
    }

    // Reset state
    (e.target as Element).setAttribute('data-pull-is-pulling', 'false');
    (e.target as Element).setAttribute('data-pull-distance', '0');

    // Dispatch reset event
    const event = new CustomEvent('pull-end');
    (e.target as Element).dispatchEvent(event);
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
