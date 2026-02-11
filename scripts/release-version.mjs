import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import semver from "semver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const shouldPublish = args.includes("--publish");
const versionInput = args.find((value) => !value.startsWith("-")) ?? "patch";

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

const resolveNextVersion = (current, input) => {
  const cleanedCurrent = semver.valid(semver.clean(current));
  if (!cleanedCurrent) {
    throw new Error(`Unsupported version format: ${current}`);
  }

  const exact = semver.valid(input);
  if (exact) {
    return exact;
  }

  if (input === "major" || input === "minor" || input === "patch") {
    const bumped = semver.inc(cleanedCurrent, input);
    if (!bumped) {
      throw new Error(`Failed to bump version: ${current}`);
    }
    return bumped;
  }

  throw new Error(
    `Unknown version input: ${input}. Use major/minor/patch or a semver like 1.2.3.`,
  );
};

const resolveMemoMonoRoot = () => {
  if (process.env.MEMO_MONO_PATH) {
    return path.resolve(process.env.MEMO_MONO_PATH);
  }

  return path.resolve(repoRoot, "../../memo/memo-mono");
};

const updateDependencyVersion = (
  packageJsonPath,
  dependencyName,
  newVersion,
  expectedVersion,
) => {
  const packageJson = readJson(packageJsonPath);
  const dependencies = packageJson.dependencies ?? {};

  if (!dependencies[dependencyName]) {
    throw new Error(
      `Missing dependency ${dependencyName} in ${packageJsonPath}`,
    );
  }

  const currentRange = dependencies[dependencyName];
  const currentDependencyMin = semver.minVersion(currentRange);
  if (!currentDependencyMin) {
    throw new Error(
      `Unsupported dependency version for ${dependencyName} in ${packageJsonPath}: ${currentRange}`,
    );
  }
  const currentDependencyVersion = currentDependencyMin.version;

  if (expectedVersion && currentDependencyVersion !== expectedVersion) {
    throw new Error(
      `${path.basename(path.dirname(packageJsonPath))} dependency is ${currentRange} (expected ${expectedVersion}). Update it before bumping.`,
    );
  }

  const prefix = currentRange.startsWith("^")
    ? "^"
    : currentRange.startsWith("~")
      ? "~"
      : "";

  dependencies[dependencyName] = `${prefix}${newVersion}`;
  packageJson.dependencies = dependencies;
  writeJson(packageJsonPath, packageJson);

  return { previous: currentRange, next: dependencies[dependencyName] };
};

const apiPackagePath = path.join(repoRoot, "package.json");
const apiPackage = readJson(apiPackagePath);
const currentVersion = apiPackage.version;
const cleanedCurrent = semver.valid(semver.clean(currentVersion));
if (!cleanedCurrent) {
  throw new Error(`Unsupported version format: ${currentVersion}`);
}

const nextVersion = resolveNextVersion(currentVersion, versionInput);

const memoMonoRoot = resolveMemoMonoRoot();
const memoApiPath = path.join(memoMonoRoot, "packages/memo-api/package.json");
const paperlessApiPath = path.join(
  memoMonoRoot,
  "packages/paperlesspaper-api/package.json",
);

if (!fs.existsSync(memoApiPath) || !fs.existsSync(paperlessApiPath)) {
  throw new Error(
    `Could not find memo-mono package.json files. Set MEMO_MONO_PATH to the repo root.`,
  );
}

const memoUpdate = updateDependencyVersion(
  memoApiPath,
  "@internetderdinge/api",
  nextVersion,
  cleanedCurrent,
);
const paperlessUpdate = updateDependencyVersion(
  paperlessApiPath,
  "@internetderdinge/api",
  nextVersion,
  cleanedCurrent,
);

apiPackage.version = nextVersion;
writeJson(apiPackagePath, apiPackage);

console.log(`Updated @internetderdinge/api to ${nextVersion}`);
console.log(`memo-api: ${memoUpdate.previous} -> ${memoUpdate.next}`);
console.log(
  `paperlesspaper-api: ${paperlessUpdate.previous} -> ${paperlessUpdate.next}`,
);

if (shouldPublish) {
  execSync("npm publish", { cwd: repoRoot, stdio: "inherit" });
}
