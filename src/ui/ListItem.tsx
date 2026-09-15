import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  trailing?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
}

export function ListItem({ title, subtitle, icon, trailing, onPress, divider = false }: ListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
          <Icon name={icon} size={18} color={colors.foreground} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="label" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {onPress ? <Icon name="chevronRight" size={14} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), minHeight: 56, paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  iconWrap: { width: 34, height: 34, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
});
