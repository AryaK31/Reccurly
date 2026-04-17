import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { Pressable, Text } from "react-native";
import { useCallback, useRef } from "react";

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface BackButtonProps {
    color?: string;
}

const BackButton = ({ color = "text-primary" }: BackButtonProps) => {
    const router = useRouter();
    const touchStartX = useRef(0);
    const touchStartTime = useRef(0);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const onTouchStart = (e: any) => {
        touchStartX.current = e.nativeEvent.pageX;
        touchStartTime.current = Date.now();
    };

    const onTouchEnd = (e: any) => {
        const touchEndX = e.nativeEvent.pageX;
        const touchDuration = Date.now() - touchStartTime.current;
        const swipeDistance = touchEndX - touchStartX.current;

        // Detect rightward swipe: moved at least 30px to the right in less than 300ms
        if (swipeDistance > 30 && touchDuration < 300) {
            handleBack();
        }
    };

    return (
        <StyledPressable
            onPress={handleBack}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="size-11 items-center justify-center rounded-full border border-primary/20 bg-background active:bg-primary/10"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <StyledText className={`text-2xl font-sans-semibold ${color}`}>
                ‹
            </StyledText>
        </StyledPressable>
    );
};

export default BackButton;
