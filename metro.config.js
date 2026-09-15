const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// zod re-exports every locale (~370 KB) as a `locales` namespace from classic/external, core/index
// and mini/external; the app only uses the English default its schemas import directly.
// If zod moves these files the check simply stops matching.
const ZOD_LOCALES_STUB = path.join(__dirname, "metro", "zod-locales-en.js");
const ZOD_V4_DIR = `${path.sep}node_modules${path.sep}zod${path.sep}v4${path.sep}`;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "../locales/index.js" && path.normalize(context.originModulePath).includes(ZOD_V4_DIR)) {
    return { type: "sourceFile", filePath: ZOD_LOCALES_STUB };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
