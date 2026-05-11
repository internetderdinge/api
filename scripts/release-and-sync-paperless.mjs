import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import dotenv from "dotenv";
import semver from "semver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const args = process.argv.slice(2);
const shouldPublish = !args.includes("--no-publish");
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

const resolveUpdatePackagePaths = () => {
  const updatePaths = process.env.UPDATE_PATHS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!updatePaths?.length) {
    throw new Error(
      "UPDATE_PATHS must be set in .env to a comma-separated list of package.json paths.",
    );
  }

  return updatePaths.map((updatePath) => {
    const resolvedPath = path.resolve(repoRoot, updatePath);
    return path.basename(resolvedPath) === "package.json"
      ? resolvedPath
      : path.join(resolvedPath, "package.json");
  });
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
  const isLocalReference = /^(file:|link:|workspace:|portal:)/.test(
    currentRange,
  );
  let currentDependencyVersion = null;

  if (!isLocalReference) {
    const currentDependencyMin = semver.minVersion(currentRange);
    if (!currentDependencyMin) {
      throw new Error(
        `Unsupported dependency version for ${dependencyName} in ${packageJsonPath}: ${currentRange}`,
      );
    }
    currentDependencyVersion = currentDependencyMin.version;
  }

  if (
    expectedVersion &&
    currentDependencyVersion &&
    currentDependencyVersion !== expectedVersion
  ) {
    const packageName = path.basename(path.dirname(packageJsonPath));
    throw new Error(
      `${packageName} dependency is ${currentRange} (expected ${expectedVersion}). Update it before bumping.`,
    );
  }

  // Convert local references (e.g. file:.yalc/...) to a published semver dependency.
  const prefix =
    isLocalReference || currentRange.startsWith("^")
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
const updatePackagePaths = resolveUpdatePackagePaths();

for (const updatePackagePath of updatePackagePaths) {
  if (!fs.existsSync(updatePackagePath)) {
    throw new Error(`Could not find package.json: ${updatePackagePath}`);
  }
}

apiPackage.version = nextVersion;
writeJson(apiPackagePath, apiPackage);

if (shouldPublish) {
  // Always publish through npm, regardless of the package manager used to run this script.
  execSync("npm publish", { cwd: repoRoot, stdio: "inherit" });
}

const updates = updatePackagePaths.map((updatePackagePath) => ({
  packageName: readJson(updatePackagePath).name,
  ...updateDependencyVersion(
    updatePackagePath,
    "@internetderdinge/api",
    nextVersion,
    cleanedCurrent,
  ),
}));

console.log(`Updated @internetderdinge/api to ${nextVersion}`);
for (const update of updates) {
  console.log(`${update.packageName}: ${update.previous} -> ${update.next}`);
}
