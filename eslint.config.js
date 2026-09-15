const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", "scripts/*"] },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "axios", message: "Use the @castadi/shared API client." },
            { name: "lodash", message: "Avoid heavy utility libraries; write the small helper instead." },
            { name: "moment", message: "Use Intl / small date helpers instead." },
            { name: "@react-native-async-storage/async-storage", message: "Tokens go in expo-secure-store." },
          ],
          patterns: [{ group: ["@react-navigation/*"], message: "Import navigation APIs from expo-router." }],
        },
      ],
    },
  },
]);
