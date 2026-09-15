import { Pressable, StyleSheet, View } from "react-native";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { FieldMessage } from "./FieldMessage";
import { Text } from "./Text";

interface CheckboxFieldProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
}

export function CheckboxField<T extends FieldValues>({ control, name, label }: CheckboxFieldProps<T>) {
  const { colors } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const checked = !!field.value;
        return (
          <View style={styles.wrapper}>
            <Pressable
              onPress={() => field.onChange(!checked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={label}
              style={styles.row}
            >
              <View
                style={[
                  styles.box,
                  {
                    borderColor: fieldState.error ? colors.danger : checked ? colors.primary : colors.border,
                    backgroundColor: checked ? colors.primary : colors.card,
                  },
                ]}
              >
                {checked && (
                  <Text variant="caption" weight="bold" style={{ color: colors.primaryForeground }}>
                    ✓
                  </Text>
                )}
              </View>
              <Text variant="label" style={styles.label}>
                {label}
              </Text>
            </Pressable>
            <FieldMessage error={fieldState.error?.message} />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(1.5) },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: radii.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
});
