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
                : { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Text variant="caption" weight="medium" style={{ color: active ? colors.primaryForeground : colors.foreground }}>
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
  chip: { borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: spacing(3), paddingVertical: spacing(1.5), minHeight: 34, justifyContent: "center" },
});
