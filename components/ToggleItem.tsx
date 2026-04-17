import { styled } from "nativewind";
import { Image, ImageSourcePropType, Switch, Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);

interface ToggleItemProps {
    icon?: ImageSourcePropType;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const ToggleItem = ({ icon, label, value, onValueChange }: ToggleItemProps) => {
    return (
        <StyledView className="flex-row items-center justify-between px-6 py-4 gap-3">
            <StyledView className="flex-row items-center gap-4 flex-1">
                {icon && (
                    <Image
                        source={icon}
                        className="size-5"
                        style={{ tintColor: "white" }}
                    />
                )}
                <StyledText className="text-base font-sans-semibold text-white flex-1">
                    {label}
                </StyledText>
            </StyledView>
            <Switch
                value={value}
                onValueChange={onValueChange}
                ios_backgroundColor="#13263A"
                trackColor={{ false: "#13263A", true: "#E97451" }}
                thumbColor={value ? "white" : "#A0A0A0"}
            />
        </StyledView>
    );
};

export default ToggleItem;
