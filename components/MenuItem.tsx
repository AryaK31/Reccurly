import { styled } from "nativewind";
import {
    Image,
    ImageSourcePropType,
    Pressable,
    Text,
    View,
} from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

interface MenuItemProps {
    icon?: ImageSourcePropType;
    label: string;
    onPress: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
}

const MenuItem = ({
    icon,
    label,
    onPress,
    rightElement,
    destructive = false,
}: MenuItemProps) => {
    return (
        <StyledPressable
            onPress={onPress}
            className={`flex-row items-center justify-between px-6 py-4 gap-3 active:bg-white/10`}
        >
            <StyledView className="flex-row items-center gap-4 flex-1">
                {icon && (
                    <Image
                        source={icon}
                        className="size-5"
                        style={{ tintColor: destructive ? "#dc2626" : "white" }}
                    />
                )}
                <StyledText
                    className={`text-base font-sans-semibold flex-1 ${
                        destructive ? "text-destructive" : "text-white"
                    }`}
                >
                    {label}
                </StyledText>
            </StyledView>
            {rightElement && (
                <StyledView className="items-center justify-center">
                    {rightElement}
                </StyledView>
            )}
        </StyledPressable>
    );
};

export default MenuItem;
