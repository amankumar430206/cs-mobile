import { Pressable, ScrollView, StyleSheet } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

interface FilterChipsProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text variant="caption" weight="semibold" style={{ color: active ? colors.primaryForeground : colors.mutedForeground }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing(2), paddingVertical: 2 },
  chip: { borderWidth: 1, borderRadius: radii.full, paddingHorizontal: spacing(3.5), paddingVertical: spacing(2), minHeight: 36, justifyContent: "center" },
});
