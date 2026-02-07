import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Callback } from "./types"; // Assuming a `types.ts` file exists for type definitions

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let localesFolder = path.join(__dirname, "./generated");

export function setLocalesFolder(nextPath?: string): void {
  localesFolder = nextPath
    ? path.resolve(nextPath)
    : path.join(__dirname, "./generated");
}

interface CreateMissingTranslationParams {
  content?: string;
  namespace: string;
  language: string;
  key: string;
}

async function createMissingTranslation({
  content,
  namespace,
  language,
  key,
}: CreateMissingTranslationParams): Promise<Response> {
  const response = await fetch(
    `${process.env.REACT_APP_WEB_BACKEND_URL}/translations/create-missing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        content: content || key,
        namespace,
        language,
        secret: process.env.REACT_APP_TRANSLATION_SECRET,
      }),
    },
  );
  return response;
}

const backend = {
  type: "backend",

  read(language: string, namespace: string, callback: Callback): void {
    const filePath = path.join(localesFolder, `${language}.json`);

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);

      /* return resources */
      callback(null, jsonData);
    } catch (error) {
      callback(error, null);
    }
  },

  create(
    languages: string[],
    namespace: string,
    key: string,
    fallbackValue?: string,
  ): void {
    console.log(
      "missing translation saved",
      languages,
      namespace,
      key,
      fallbackValue,
    );

    createMissingTranslation({
      key,
      content: fallbackValue || key,
      namespace,
      language: "en",
    }).catch((error) =>
      console.error("Error creating missing translation:", error),
    );
  },
};

export default backend;
