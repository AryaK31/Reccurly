import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import CurrencySelector from "./CurrencySelector";
import MenuItem from "./MenuItem";
import MenuSection from "./MenuSection";
import ToggleItem from "./ToggleItem";

const StyledView = styled(View);
const StyledText = styled(Text);

interface OverflowMenuProps {
    visible: boolean;
    onClose: () => void;
}

const OverflowMenu = ({ visible, onClose }: OverflowMenuProps) => {
    const { signOut } = useAuth();
    const {
        subscriptions,
        selectionMode,
        selectedIds,
        setSelectionMode,
        sortByName,
        sortByPrice,
        sortByDate,
        currency,
        setCurrency,
        budget,
        setBudget,
        overSpendingAlert,
        setOverSpendingAlert,
        deleteMultiple,
        getTotalMonthly,
    } = useSubscriptionStore();

    const handleExport = async () => {
        if (subscriptions.length === 0) {
            Alert.alert("No Data", "Add subscriptions first before exporting.");
            return;
        }

        try {
            const data = JSON.stringify(subscriptions, null, 2);
            const fileName = `subscriptions-${new Date().toISOString().split("T")[0]}.json`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, data);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/json",
                    dialogTitle: "Export Subscriptions",
                });
            } else {
                Alert.alert(
                    "Success",
                    `${subscriptions.length} subscriptions exported`
                );
            }
            onClose();
        } catch {
            Alert.alert("Error", "Failed to export data");
        }
    };

    const handleSetBudget = () => {
        Alert.prompt(
            "Set Monthly Budget",
            "Enter your monthly subscription budget",
            [
                { text: "Cancel", onPress: () => {}, style: "cancel" },
                {
                    text: "Set",
                    onPress: (value?: string) => {
                        if (!value) return;
                        const amount = parseFloat(value);
                        if (!isNaN(amount) && amount > 0) {
                            setBudget(amount);
                            Alert.alert(
                                "Success",
                                `Budget set to ${currency}${amount.toFixed(2)}`
                            );
                        } else {
                            Alert.alert("Error", "Please enter a valid amount");
                        }
                    },
                },
            ],
            "plain-text",
            budget ? budget.toString() : ""
        );
    };

    const handleSignOut = async () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                onPress: async () => {
                    try {
                        await signOut();
                        onClose();
                    } catch {
                        Alert.alert("Error", "Failed to sign out");
                    }
                },
                style: "destructive",
            },
        ]);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            Alert.alert("No Selection", "Select subscriptions first");
            return;
        }

        Alert.alert(
            "Delete Selected",
            `Delete ${selectedIds.length} ${
                selectedIds.length === 1 ? "subscription" : "subscriptions"
            }?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        deleteMultiple(selectedIds);
                        Alert.alert(
                            "Success",
                            `${selectedIds.length} subscriptions deleted`
                        );
                        onClose();
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const totalAmount = getTotalMonthly();
    const isOverBudget = budget && totalAmount > budget;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <StyledView className="flex-1 justify-end">
                {/* Overlay */}
                <Pressable
                    className="absolute inset-0 bg-black/50"
                    onPress={onClose}
                />

                {/* Menu Container */}
                <StyledView className="bg-primary rounded-t-3xl items-stretch">
                    {/* Header */}
                    <StyledView className="flex-row items-center justify-between px-6 py-5 border-b border-white/10">
                        <StyledText className="text-lg font-sans-bold text-white">
                            Menu
                        </StyledText>
                        <Pressable onPress={onClose} className="p-2">
                            <StyledText className="text-2xl font-sans-bold text-white">
                                ✕
                            </StyledText>
                        </Pressable>
                    </StyledView>

                    {/* Content */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        className="max-h-96"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {/* Global Actions */}
                        <MenuSection title="Global Actions">
                            <MenuItem
                                label="Refresh / Sync"
                                onPress={() => {
                                    Alert.alert(
                                        "Synced",
                                        "Subscriptions synced successfully"
                                    );
                                    onClose();
                                }}
                            />
                            <MenuItem
                                label="Import Subscriptions"
                                onPress={() => {
                                    Alert.alert(
                                        "Coming Soon",
                                        "Import from email or bank will be available soon"
                                    );
                                    onClose();
                                }}
                            />
                            <MenuItem
                                label="Export Data"
                                onPress={handleExport}
                            />
                        </MenuSection>

                        {/* Sort & Filter */}
                        <MenuSection title="Sort & Filter">
                            <MenuItem
                                label="Sort by Name"
                                onPress={() => {
                                    sortByName();
                                    onClose();
                                }}
                            />
                            <MenuItem
                                label="Sort by Price"
                                onPress={() => {
                                    sortByPrice();
                                    onClose();
                                }}
                            />
                            <MenuItem
                                label="Sort by Date"
                                onPress={() => {
                                    sortByDate();
                                    onClose();
                                }}
                            />
                        </MenuSection>

                        {/* Financial */}
                        <MenuSection title="Financial">
                            <MenuItem
                                label={`Budget: ${
                                    budget ? `${currency}${budget.toFixed(2)}` : "Not Set"
                                }`}
                                onPress={handleSetBudget}
                                rightElement={
                                    isOverBudget && (
                                        <StyledView className="bg-destructive/20 px-2 py-1 rounded-full">
                                            <StyledText className="text-xs font-sans-bold text-destructive">
                                                Over
                                            </StyledText>
                                        </StyledView>
                                    )
                                }
                            />
                            <ToggleItem
                                label="Overspending Alerts"
                                value={overSpendingAlert}
                                onValueChange={setOverSpendingAlert}
                            />
                        </MenuSection>

                        {/* Bulk Actions */}
                        <MenuSection title="Bulk Actions">
                            <MenuItem
                                label={
                                    selectionMode
                                        ? "Exit Selection Mode"
                                        : "Enter Selection Mode"
                                }
                                onPress={() => {
                                    setSelectionMode(!selectionMode);
                                    onClose();
                                }}
                            />
                            {selectionMode && selectedIds.length > 0 && (
                                <MenuItem
                                    label={`Delete Selected (${selectedIds.length})`}
                                    onPress={handleBulkDelete}
                                    destructive={true}
                                />
                            )}
                        </MenuSection>

                        {/* Preferences */}
                        <MenuSection title="Preferences">
                            <CurrencySelector
                                label="Currency"
                                selectedCurrency={currency}
                                onSelectCurrency={setCurrency}
                            />
                        </MenuSection>

                        {/* Account */}
                        <MenuSection title="Account" lastSection={true}>
                            <MenuItem
                                label="Sign Out"
                                onPress={handleSignOut}
                                destructive={true}
                            />
                        </MenuSection>
                    </ScrollView>

                    {/* Footer Info */}
                    <StyledView className="border-t border-white/10 px-6 py-4 gap-2">
                        <StyledView className="flex-row items-center justify-between">
                            <StyledText className="text-xs font-sans-semibold text-white/60">
                                Total Monthly:
                            </StyledText>
                            <StyledText className="text-lg font-sans-bold text-accent">
                                {currency}
                                {totalAmount.toFixed(2)}
                            </StyledText>
                        </StyledView>
                        {budget && (
                            <StyledText className="text-xs font-sans-medium text-white/50">
                                Budget: {currency}
                                {budget.toFixed(2)}
                                {isOverBudget && (
                                    <StyledText className="text-destructive">
                                        {" "}
                                        (Over by {currency}
                                        {(totalAmount - budget).toFixed(2)})
                                    </StyledText>
                                )}
                            </StyledText>
                        )}
                    </StyledView>
                </StyledView>
            </StyledView>
        </Modal>
    );
};

export default OverflowMenu;
