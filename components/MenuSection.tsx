import { styled } from "nativewind";
import { Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);

interface MenuSectionProps {
    title: string;
    children: React.ReactNode;
    lastSection?: boolean;
}

const MenuSection = ({
    title,
    children,
    lastSection = false,
}: MenuSectionProps) => {
    return (
        <StyledView className={!lastSection ? "border-b border-white/10" : ""}>
            <StyledText className="text-xs font-sans-bold text-white/50 uppercase tracking-widest px-6 py-4">
                {title}
            </StyledText>
            <StyledView>{children}</StyledView>
        </StyledView>
    );
};

export default MenuSection;
