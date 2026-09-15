import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { radii, spacing, typography } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Icon name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        maxFontSizeMultiplier={1.6}
        style={[styles.input, { color: colors.foreground }]}
      />
      {value ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
          <Icon name="clear" size={16} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
  },
  input: { flex: 1, fontSize: typography.sizes.base, paddingVertical: spacing(2.5) },
});
