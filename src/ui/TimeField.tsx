import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "./Button";
import { FieldMessage } from "./FieldMessage";
import { useFieldBackground } from "./fieldSurface";
import { Text } from "./Text";

interface TimeFieldProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
}

// Values are 24-hour "HH:MM" strings, the format cs-api's operating-hours fields expect.
const pad = (n: number) => String(n).padStart(2, "0");
const toTimeString = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

function fromTimeString(value: unknown): Date {
  const date = new Date();
  const match = typeof value === "string" ? /^(\d{2}):(\d{2})$/.exec(value) : null;
  date.setHours(match ? Number(match[1]) : 9, match ? Number(match[2]) : 0, 0, 0);
  return date;
}

export function TimeField<T extends FieldValues>({ control, name, label }: TimeFieldProps<T>) {
  const { colors, mode } = useTheme();
  const fieldBackground = useFieldBackground();
  const [iosDraft, setIosDraft] = useState<Date | null>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const current = fromTimeString(field.value);

        const open = () => {
          if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
              value: current,
              mode: "time",
              is24Hour: true,
              onChange: (event: DateTimePickerEvent, date?: Date) => {
                if (event.type === "set" && date) field.onChange(toTimeString(date));
                field.onBlur();
              },
            });
          } else {
            setIosDraft(current);
          }
        };

        return (
          <View style={styles.wrapper}>
            <Text variant="label">{label}</Text>
            <Pressable
              onPress={open}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${field.value || "not set"}`}
              style={[styles.trigger, { borderColor: fieldState.error ? colors.danger : colors.border, backgroundColor: fieldBackground }]}
            >
              <Text tone={field.value ? "default" : "muted"} style={styles.value}>
                {field.value || "Select a time"}
              </Text>
            </Pressable>
            <FieldMessage error={fieldState.error?.message} />

            {Platform.OS === "ios" && (
              <Modal visible={iosDraft !== null} transparent animationType="fade" onRequestClose={() => setIosDraft(null)}>
                <View style={styles.backdrop}>
                  <SafeAreaView edges={["bottom"]} style={[styles.sheet, { backgroundColor: colors.card }]}>
                    <DateTimePicker
                      value={iosDraft ?? current}
                      mode="time"
                      display="spinner"
                      locale="en-GB"
                      themeVariant={mode}
                      onChange={(_event: DateTimePickerEvent, date?: Date) => {
                        if (date) setIosDraft(date);
                      }}
                    />
                    <View style={styles.actions}>
                      <Button title="Cancel" variant="outline" style={styles.action} onPress={() => setIosDraft(null)} />
                      <Button
                        title="Done"
                        style={styles.action}
                        onPress={() => {
                          if (iosDraft) field.onChange(toTimeString(iosDraft));
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
  wrapper: { gap: spacing(1.5), flex: 1 },
  trigger: { minHeight: 44, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing(3), justifyContent: "center" },
  value: { fontVariant: ["tabular-nums"] },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing(4) },
  actions: { flexDirection: "row", gap: spacing(3) },
  action: { flex: 1 },
});
