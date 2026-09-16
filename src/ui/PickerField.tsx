import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "./Button";
import { FieldMessage } from "./FieldMessage";
import { useFieldBackground } from "./fieldSurface";
import { Text } from "./Text";

export interface PickerOption {
  value: string;
  label: string;
}

interface PickerFieldProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
  options: readonly PickerOption[];
  placeholder?: string;
}

export function PickerField<T extends FieldValues>({ control, name, label, options, placeholder = "Select" }: PickerFieldProps<T>) {
  const { colors } = useTheme();
  const fieldBackground = useFieldBackground();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((option) => option.value === field.value);
        return (
          <View style={styles.wrapper}>
            <Text variant="label">{label}</Text>
            <Pressable
              onPress={() => setOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
              style={[
                styles.trigger,
                { borderColor: fieldState.error ? colors.danger : colors.border, backgroundColor: fieldBackground },
              ]}
            >
              <Text tone={selected ? "default" : "muted"}>{selected?.label ?? placeholder}</Text>
              <Text tone="muted">▾</Text>
            </Pressable>
            <FieldMessage error={fieldState.error?.message} />

            <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
              <SafeAreaView style={[styles.sheet, { backgroundColor: colors.background }]}>
                <View style={styles.sheetHeader}>
                  <Text variant="heading">{label}</Text>
                  <Button title="Close" variant="ghost" onPress={() => setOpen(false)} />
                </View>
                <FlatList
                  data={options}
                  keyExtractor={(option) => option.value}
                  renderItem={({ item }) => {
                    const isSelected = item.value === field.value;
                    return (
                      <Pressable
                        onPress={() => {
                          field.onChange(item.value);
                          setOpen(false);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        style={[styles.option, { borderBottomColor: colors.border }]}
                      >
                        <Text tone={isSelected ? "primary" : "default"} weight={isSelected ? "semibold" : undefined}>
                          {item.label}
                        </Text>
                        {isSelected && <Text tone="primary">✓</Text>}
                      </Pressable>
                    );
                  }}
                />
              </SafeAreaView>
            </Modal>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(1.5) },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2),
  },
  option: {
    minHeight: 52,
    paddingHorizontal: spacing(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
