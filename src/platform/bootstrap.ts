import * as SplashScreen from "expo-splash-screen";
import { session } from "@castadi/shared";
import { setupApiClient } from "./api";
import { setupReactQueryNative } from "./reactQueryNative";
import { secureTokenStorage } from "./tokenStorage";

// Runs once, at module load of the root layout, before any screen can issue a request.
void SplashScreen.preventAutoHideAsync();
setupApiClient();
setupReactQueryNative();
void session.hydrate(secureTokenStorage);
