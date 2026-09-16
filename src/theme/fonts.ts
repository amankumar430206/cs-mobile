// cs-web's sans is Poppins (app/layout.tsx). Per-weight subpath imports keep the other weights and
// italics out of the app.
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import type { typography } from "@castadi/shared/tokens";

export const fontAssets = { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold };

type Weight = keyof typeof typography.weights;

// Custom fonts ship one file per weight, so the weight is chosen by family (fontWeight on top of a
// custom family is ignored or faux-bolded on Android).
export const fontFamily: Record<Weight, string> = {
  normal: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};
