import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { radii, spacing, typography } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { FieldMessage } from "./FieldMessage";
import { useFieldBackground } from "./fieldSurface";
import { Text } from "./Text";

interface TextFieldProps<T extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  // Any context/output type, so forms whose resolver transforms values (string inputs → numbers) can use it.
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  /** Password field with a show/hide toggle. */
  secure?: boolean;
}

export function TextField<T extends FieldValues>({ control, name, label, hint, secure, style, ...inputProps }: TextFieldProps<T>) {
  const { colors } = useTheme();
  const fieldBackground = useFieldBackground();
  const [hidden, setHidden] = useState(!!secure);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.wrapper}>
          <Text variant="label">{label}</Text>
          <View
            style={[
              styles.inputRow,
              { borderColor: fieldState.error ? colors.danger : colors.border, backgroundColor: fieldBackground },
            ]}
          >
            <TextInput
              ref={field.ref}
              value={field.value ?? ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry={hidden}
              placeholderTextColor={colors.mutedForeground}
              accessibilityLabel={label}
              maxFontSizeMultiplier={1.6}
              style={[styles.input, { color: colors.foreground }, style]}
              {...inputProps}
            />
            {secure && (
              <Pressable
                onPress={() => setHidden((value) => !value)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={hidden ? "Show password" : "Hide password"}
              >
                <Text variant="label" tone="primary">
                  {hidden ? "Show" : "Hide"}
                </Text>
              </Pressable>
            )}
          </View>
          <FieldMessage error={fieldState.error?.message} hint={hint} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(1.5) },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing(3),
    gap: spacing(2),
  },
  input: { flex: 1, fontSize: typography.sizes.base, paddingVertical: spacing(3) },
});
