import { Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

interface StepperProps {
  steps: readonly string[];
  /** Zero-based index of the step in progress. */
  current: number;
  /** Tapping a completed step jumps back to it; later steps are never reachable by tap. */
  onStepPress?: (index: number) => void;
}

/** Numbered progress bar for multi-step flows: done steps filled orange, the current one outlined. */
export function Stepper({ steps, current, onStepPress }: StepperProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderBottomColor: colors.border }]} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}>
      <View style={styles.row}>
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = done && !!onStepPress;
          return (
            <View key={label} style={styles.item}>
              {/* Connector into this step, colored once the previous step is done. */}
              <View style={[styles.connector, styles.connectorLeft, { backgroundColor: index === 0 ? "transparent" : index <= current ? colors.primary : colors.border }]} />
              <View style={[styles.connector, styles.connectorRight, { backgroundColor: index === steps.length - 1 ? "transparent" : done ? colors.primary : colors.border }]} />

              <Pressable
                onPress={() => onStepPress?.(index)}
                disabled={!reachable}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: !reachable }}
                accessibilityLabel={`${label}, ${done ? "completed" : active ? "current step" : "not started"}`}
                style={[
                  styles.marker,
                  done
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : active
                      ? { backgroundColor: colors.background, borderColor: colors.primary }
                      : { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <Text variant="caption" weight="bold" style={{ color: done ? colors.primaryForeground : active ? colors.primary : colors.mutedForeground }}>
                  {done ? "✓" : index + 1}
                </Text>
              </Pressable>

              <Text
                variant="caption"
                weight={active ? "semibold" : "normal"}
                tone={active ? "default" : "muted"}
                align="center"
                numberOfLines={1}
                style={styles.label}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const MARKER = 28;

const styles = StyleSheet.create({
  bar: { paddingHorizontal: spacing(3), paddingTop: spacing(3), paddingBottom: spacing(2.5), borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row" },
  item: { flex: 1, alignItems: "center", gap: spacing(1.5) },
  connector: { position: "absolute", top: MARKER / 2 - 1, height: 2 },
  connectorLeft: { left: 0, right: "50%" },
  connectorRight: { left: "50%", right: 0 },
  marker: { width: MARKER, height: MARKER, borderRadius: radii.sm, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  label: { paddingHorizontal: 2 },
});
