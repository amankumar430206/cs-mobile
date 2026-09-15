import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "./Button";
import { FieldMessage } from "./FieldMessage";
import { Text } from "./Text";

interface DateFieldProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

// Values are calendar dates ("YYYY-MM-DD"), matching cs-api DATE columns — never a timezone-shifted ISO timestamp.
const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function fromDateString(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

const displayFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function DateField<T extends FieldValues>({ control, name, label, minimumDate, maximumDate, placeholder = "Select a date" }: DateFieldProps<T>) {
  const { colors, mode } = useTheme();
  const [iosDraft, setIosDraft] = useState<Date | null>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const current = fromDateString(field.value);
        const initial = current ?? maximumDate ?? new Date();

        const open = () => {
          if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
              value: initial,
              mode: "date",
              minimumDate,
              maximumDate,
              onChange: (event: DateTimePickerEvent, date?: Date) => {
                if (event.type === "set" && date) field.onChange(toDateString(date));
                field.onBlur();
              },
            });
          } else {
            setIosDraft(initial);
          }
        };

        return (
          <View style={styles.wrapper}>
            <Text variant="label">{label}</Text>
            <Pressable
              onPress={open}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${current ? displayFormat.format(current) : placeholder}`}
              style={[
                styles.trigger,
                { borderColor: fieldState.error ? colors.danger : colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text tone={current ? "default" : "muted"}>{current ? displayFormat.format(current) : placeholder}</Text>
            </Pressable>
            <FieldMessage error={fieldState.error?.message} />

            {Platform.OS === "ios" && (
              <Modal visible={iosDraft !== null} transparent animationType="fade" onRequestClose={() => setIosDraft(null)}>
                <View style={styles.backdrop}>
                  <SafeAreaView edges={["bottom"]} style={[styles.sheet, { backgroundColor: colors.card }]}>
                    <DateTimePicker
                      value={iosDraft ?? initial}
                      mode="date"
                      display="spinner"
                      minimumDate={minimumDate}
                      maximumDate={maximumDate}
                      themeVariant={mode}
                      onChange={(_event: DateTimePickerEvent, date?: Date) => {
                        if (date) setIosDraft(date);
                      }}
                    />
                    <View style={styles.actions}>
                      <Button title="Cancel" variant="secondary" style={styles.action} onPress={() => setIosDraft(null)} />
                      <Button
                        title="Done"
                        style={styles.action}
                        onPress={() => {
                          if (iosDraft) field.onChange(toDateString(iosDraft));
                          field.onBlur();
                          setIosDraft(null);
                        }}
                      />
                    </View>
                  </SafeAreaView>
                </View>
              </Modal>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(1.5) },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing(3),
    justifyContent: "center",
  },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing(4) },
  actions: { flexDirection: "row", gap: spacing(3) },
  action: { flex: 1 },
});
