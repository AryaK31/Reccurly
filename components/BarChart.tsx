import { styled } from "nativewind";
import { Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);

interface BarChartProps {
    data: number[];
    days: string[];
}

const BarChart = ({ data, days }: BarChartProps) => {
    const maxValue = Math.max(...data, 0);
    const highlightedIndex = data.indexOf(maxValue);
    const chartHeight = 180;

    return (
        <StyledView className="bg-muted rounded-3xl p-6">
            {/* Chart Container */}
            <StyledView className="gap-8">
                {/* Bars with Grid */}
                <StyledView style={{ height: chartHeight }}>
                    <StyledView className="flex-row items-end justify-between gap-3 h-full">
                        {data.map((value, index) => {
                            const heightPercent =
                                maxValue > 0 ? (value / maxValue) * 100 : 0;
                            const isHighlighted = index === highlightedIndex;
                            const barHeight =
                                (heightPercent / 100) * chartHeight;

                            return (
                                <StyledView
                                    key={index}
                                    className="items-center flex-1 justify-end"
                                >
                                    {/* Value Label */}
                                    {isHighlighted && (
                                        <StyledText
                                            className="mb-3 text-lg font-sans-bold text-accent"
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            ₹{value}
                                        </StyledText>
                                    )}
                                    {/* Bar */}
                                    <StyledView
                                        className={`w-6 rounded-full transition-all ${
                                            isHighlighted
                                                ? "bg-accent"
                                                : "bg-primary"
                                        }`}
                                        style={{
                                            height: barHeight,
                                            minHeight: 12,
                                        }}
                                    />
                                </StyledView>
                            );
                        })}
                    </StyledView>
                </StyledView>

                {/* Day Labels */}
                <StyledView className="flex-row justify-between">
                    {days.map((day, index) => (
                        <StyledText
                            key={index}
                            className={`text-xs font-sans-semibold ${
                                index === highlightedIndex
                                    ? "text-accent"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {day}
                        </StyledText>
                    ))}
                </StyledView>
            </StyledView>
        </StyledView>
    );
};

export default BarChart;
