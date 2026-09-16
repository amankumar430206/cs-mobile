import { useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import { radii, spacing, typography } from "@castadi/shared/tokens";
import { resolvePincode, type PincodeResolution } from "@castadi/shared/types";
import { fontFamily } from "@/theme/fonts";
import { useTheme } from "@/theme/ThemeProvider";
import { FieldMessage, Text, useFieldBackground } from "@/ui";

// Same helper as cs-web's PincodeField: a 6-digit PIN fills in city and state via cs-api's /geo lookup.
export function PincodeLookup({ onResolved }: { onResolved: (resolution: PincodeResolution) => void }) {
  const { colors } = useTheme();
  const fieldBackground = useFieldBackground();
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");

  const change = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setPincode(digits);
    if (digits.length !== 6) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const resolution = await resolvePincode(digits);
      if (resolution) {
        onResolved(resolution);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    } catch {
      setStatus("idle");
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text variant="label">PIN code (optional)</Text>
      <View style={[styles.row, { borderColor: status === "not-found" ? colors.danger : colors.border, backgroundColor: fieldBackground }]}>
        <TextInput
          value={pincode}
          onChangeText={(value) => void change(value)}
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="postal-code"
          placeholder="560001"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="PIN code"
          style={[styles.input, { color: colors.foreground }]}
        />
        {status === "loading" ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>
      <FieldMessage
        error={status === "not-found" ? "Couldn't find that PIN code — enter city and state below." : undefined}
        hint={status === "found" ? "City and state filled in." : "Fills in city and state automatically."}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(1.5) },
  row: { flexDirection: "row", alignItems: "center", minHeight: 44, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing(3), gap: spacing(2) },
  input: { flex: 1, fontSize: typography.sizes.base, fontFamily: fontFamily.normal, paddingVertical: spacing(2.5) },
});
