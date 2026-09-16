import { StyleSheet, View, type ColorValue } from "react-native";

interface BarChartProps {
  values: number[];
  color: ColorValue;
  height?: number;
  /** The trailing bars drawn at full strength (the rest are dimmed). */
  highlightLast?: number;
  dimOpacity?: number;
}

// Plain Views instead of an SVG/chart library: a daily bar series needs nothing more, and it keeps the bundle lean.
export function BarChart({ values, color, height = 96, highlightLast = 7, dimOpacity = 0.35 }: BarChartProps) {
  const max = Math.max(0, ...values);

  return (
    <View style={[styles.chart, { height }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {values.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: max > 0 ? Math.max(2, Math.round((value / max) * height)) : 2,
              backgroundColor: color,
              opacity: index >= values.length - highlightLast ? 1 : dimOpacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  bar: { flex: 1 },
});
