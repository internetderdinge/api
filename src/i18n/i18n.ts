import path from "path";
import { fileURLToPath } from "url";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import i18next from "i18next";
import Backend, { setLocalesFolder } from "./saveMissingLocalJsonBackend";

import config from "../config/config";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InitI18nOptions {
  generatedPath?: string;
}

export function initI18n(options: InitI18nOptions = {}): typeof i18next {
  const localesFolder = options.generatedPath
    ? path.resolve(options.generatedPath)
    : join(__dirname, "./generated");

  setLocalesFolder(localesFolder);

  const hasLocalesFolder = existsSync(localesFolder);

  if (!i18next.isInitialized) {
    i18next.use(Backend as any).init({
      initImmediate: false, // setting initImmediate to false, will load the resources synchronously
      fallbackLng: "de",
      preload: hasLocalesFolder
        ? readdirSync(localesFolder)
            .filter((fileName) => path.extname(fileName) === ".json")
            .map((fileName) => path.basename(fileName, ".json"))
        : [],

      debug: false,
      saveMissing: config.env !== "production",
      ns: ["api"],
      defaultNS: "api",
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
    });
  }

  return i18next;
}

export default i18next;
