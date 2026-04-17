import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";

interface SwipeBackConfig {
    threshold?: number; // minimum swipe distance in pixels (default: 30)
    maxDuration?: number; // maximum swipe duration in milliseconds (default: 300)
}

export const useSwipeBack = (config: SwipeBackConfig = {}) => {
    const { threshold = 30, maxDuration = 300 } = config;
    const router = useRouter();
    const touchStartX = useRef(0);
    const touchStartTime = useRef(0);

    const onTouchStart = useCallback((e: any) => {
        touchStartX.current = e.nativeEvent.pageX;
        touchStartTime.current = Date.now();
    }, []);

    const onTouchEnd = useCallback(
        (e: any) => {
            const touchEndX = e.nativeEvent.pageX;
            const touchDuration = Date.now() - touchStartTime.current;
            const swipeDistance = touchEndX - touchStartX.current;

            // Detect rightward swipe
            if (swipeDistance > threshold && touchDuration < maxDuration) {
                router.back();
            }
        },
        [router, threshold, maxDuration]
    );

    return { onTouchStart, onTouchEnd };
};
