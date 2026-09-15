import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { AppState } from "react-native";

// Queries pause while offline, and refetchInterval polling (device monitoring etc.)
// stops while the app is backgrounded, since react-query ties both to these managers.
export function setupReactQueryNative() {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    })
  );

  AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });
}
