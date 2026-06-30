// Node.js script - Node.js modules are valid here
// oxlint-disable-next-line eslint-plugin-import(no-nodejs-modules)
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
// oxlint-disable-next-line eslint-plugin-import(no-nodejs-modules)
import nodePath from "node:path";

import type { Registry, RegistryItem } from "shadcn/schema";
import { registryItemSchema, registrySchema } from "shadcn/schema";
import { Project } from "ts-morph";

const ROOT_DIR = nodePath.join(import.meta.dirname, "../../..");
const ELEMENTS_DIR = nodePath.join(ROOT_DIR, "packages/elements");
const ELEMENTS_SRC_DIR = nodePath.join(ELEMENTS_DIR, "src");
const EXAMPLES_SRC_DIR = nodePath.join(ROOT_DIR, "packages/examples/src");
const SHADCN_UI_DIR = nodePath.join(ROOT_DIR, "packages/shadcn-ui");
const SHADCN_UI_COMPONENTS_DIR = nodePath.join(SHADCN_UI_DIR, "components/ui");
const SHADCN_UI_HOOKS_DIR = nodePath.join(SHADCN_UI_DIR, "hooks");
const SHADCN_UI_LIB_DIR = nodePath.join(SHADCN_UI_DIR, "lib");
const PREVIEW_PUBLIC_DIR = nodePath.join(ROOT_DIR, "apps/preview/public");
const REGISTRY_DIR = nodePath.join(PREVIEW_PUBLIC_DIR, "r");
const API_REGISTRY_DIR = nodePath.join(PREVIEW_PUBLIC_DIR, "api/registry");
const REGISTRY_BASE_URL = (
  process.env.REGISTRY_BASE_URL ?? "https://wenerme.github.io/ai-elements"
).replace(/\/+$/u, "");
const SOURCE_EXTENSIONS = [".tsx", ".ts"] as const;

interface RegistryFileContent {
  name: string;
  type: RegistryItem["type"];
  path: string;
  content: string;
}

interface RegistrySource {
  name: string;
  title: string;
  description: string;
  type: RegistryItem["type"];
  registryPath: string;
  sourcePath: string;
  target: string;
}

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, "utf-8")) as T;

const listSourceFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))
    )
    .map((entry) => entry.name)
    .toSorted((left, right) => left.localeCompare(right));
};

const stripExtension = (fileName: string): string => {
  for (const extension of SOURCE_EXTENSIONS) {
    if (fileName.endsWith(extension)) {
      return fileName.slice(0, -extension.length);
    }
  }
  return fileName;
};

const toTitle = (name: string): string =>
  name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const parseModuleSpecifiers = (path: string, content: string): string[] => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(path, content);
  const moduleSpecifiers: string[] = [];

  for (const declaration of sourceFile.getImportDeclarations()) {
    moduleSpecifiers.push(declaration.getModuleSpecifierValue());
  }

  for (const declaration of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = declaration.getModuleSpecifierValue();
    if (moduleSpecifier) {
      moduleSpecifiers.push(moduleSpecifier);
    }
  }

  return moduleSpecifiers;
};

const getBasePackageName = (specifier: string): string => {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }
  return specifier.split("/")[0] ?? specifier;
};

const sortUnique = (values: Iterable<string>): string[] =>
  [...new Set(values)].toSorted();

const toRegistryUrl = (name: string): string =>
  `${REGISTRY_BASE_URL}/r/${name}.json`;

const transformContent = (content: string): string =>
  content
    .replaceAll("@repo/shadcn-ui/components/ui/", "@/components/ui/")
    .replaceAll("@repo/shadcn-ui/hooks/", "@/hooks/")
    .replaceAll("@repo/shadcn-ui/lib/", "@/lib/")
    .replaceAll("@repo/elements/", "@/components/ai-elements/");

const makeRegistryFile = (
  path: string,
  target: string,
  type: RegistryItem["type"],
  content: string
): NonNullable<RegistryItem["files"]>[number] => ({
  content,
  path,
  target,
  type: type as Exclude<
    RegistryItem["type"],
    "registry:base" | "registry:font"
  >,
});

const makeSource = ({
  description,
  fileName,
  itemPrefix = "",
  registryPath,
  sourceDir,
  targetPath,
  titleSuffix = "",
  type,
}: {
  description: string;
  fileName: string;
  itemPrefix?: string;
  registryPath: string;
  sourceDir: string;
  targetPath: string;
  titleSuffix?: string;
  type: RegistryItem["type"];
}): RegistrySource => {
  const sourceName = stripExtension(fileName);
  const name = `${itemPrefix}${sourceName}`;
  return {
    description: description.replace("{name}", sourceName.replaceAll("-", " ")),
    name,
    registryPath: `${registryPath}/${fileName}`,
    sourcePath: nodePath.join(sourceDir, fileName),
    target: `${targetPath}/${fileName}`,
    title: `${toTitle(sourceName)}${titleSuffix}`,
    type,
  };
};

const loadPackageMetadata = async () => {
  const packages = await Promise.all(
    [ELEMENTS_DIR, SHADCN_UI_DIR].map((dir) =>
      readJson<{
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      }>(nodePath.join(dir, "package.json"))
    )
  );

  const internalDependencies = new Set(
    packages.flatMap((packageJson) =>
      Object.keys(packageJson.dependencies ?? {}).filter((dependency) =>
        dependency.startsWith("@repo/")
      )
    )
  );
  const runtimeDependencies = new Set([
    ...packages.flatMap((packageJson) =>
      Object.keys(packageJson.dependencies ?? {}).filter(
        (dependency) =>
          !["react", "react-dom"].includes(dependency) &&
          !internalDependencies.has(dependency)
      )
    ),
    "@ai-sdk/react",
    "zod",
  ]);
  const devDependencies = new Set(
    packages.flatMap((packageJson) =>
      Object.keys(packageJson.devDependencies ?? {}).filter(
        (dependency) =>
          ![
            "@repo/typescript-config",
            "@types/react",
            "@types/react-dom",
            "typescript",
          ].includes(dependency)
      )
    )
  );
  const typesDevDepsMap = new Map<string, string[]>();

  for (const devDependency of devDependencies) {
    if (!devDependency.startsWith("@types/")) {
      continue;
    }

    const runtimeName = devDependency
      .slice("@types/".length)
      .replace("__", "/");
    const existing = typesDevDepsMap.get(runtimeName) ?? [];
    existing.push(devDependency);
    typesDevDepsMap.set(runtimeName, existing);
  }

  return {
    devDependencies,
    runtimeDependencies,
    typesDevDepsMap,
  };
};

const resolveRelativeRegistryName = (
  sourcePath: string,
  moduleName: string,
  registryNameByPath: Map<string, string>
): string | undefined => {
  const withoutExtension = nodePath.posix.normalize(
    nodePath.posix.join(nodePath.posix.dirname(sourcePath), moduleName)
  );

  if (registryNameByPath.has(withoutExtension)) {
    return registryNameByPath.get(withoutExtension);
  }

  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = `${withoutExtension}${extension}`;
    if (registryNameByPath.has(candidate)) {
      return registryNameByPath.get(candidate);
    }
  }

  return undefined;
};

const main = async (): Promise<void> => {
  const { devDependencies, runtimeDependencies, typesDevDepsMap } =
    await loadPackageMetadata();

  const uiFileNames = await listSourceFiles(SHADCN_UI_COMPONENTS_DIR);
  const hookFileNames = await listSourceFiles(SHADCN_UI_HOOKS_DIR);
  const libFileNames = await listSourceFiles(SHADCN_UI_LIB_DIR);
  const componentFileNames = await listSourceFiles(ELEMENTS_SRC_DIR);
  const exampleFileNames = await listSourceFiles(EXAMPLES_SRC_DIR);
  const uiSources = uiFileNames.map((fileName) =>
    makeSource({
      description: "Base UI powered shadcn {name} component.",
      fileName,
      registryPath: "registry/default/ui",
      sourceDir: SHADCN_UI_COMPONENTS_DIR,
      targetPath: "components/ui",
      type: "registry:ui",
    })
  );
  const hookSources = hookFileNames.map((fileName) =>
    makeSource({
      description: "Shared {name} hook.",
      fileName,
      registryPath: "registry/default/hooks",
      sourceDir: SHADCN_UI_HOOKS_DIR,
      targetPath: "hooks",
      type: "registry:hook",
    })
  );
  const libSources = libFileNames.map((fileName) =>
    makeSource({
      description: "Shared {name} utility.",
      fileName,
      registryPath: "registry/default/lib",
      sourceDir: SHADCN_UI_LIB_DIR,
      targetPath: "lib",
      type: "registry:lib",
    })
  );
  const componentSources = componentFileNames.map((fileName) =>
    makeSource({
      description: "AI-powered {name} component.",
      fileName,
      registryPath: "registry/default/ai-elements",
      sourceDir: ELEMENTS_SRC_DIR,
      targetPath: "components/ai-elements",
      type: "registry:component",
    })
  );
  const exampleSources = exampleFileNames.map((fileName) =>
    makeSource({
      description: "Example implementation of {name}.",
      fileName,
      itemPrefix: "example-",
      registryPath: "registry/default/examples",
      sourceDir: EXAMPLES_SRC_DIR,
      targetPath: "components/ai-elements/examples",
      titleSuffix: " Example",
      type: "registry:block",
    })
  );
  const registrySources = [
    ...uiSources,
    ...hookSources,
    ...libSources,
    ...componentSources,
    ...exampleSources,
  ];
  const registryNameByPath = new Map(
    registrySources.map((source) => [source.registryPath, source.name])
  );
  const registryNames = new Set(registrySources.map((source) => source.name));
  const fileContents: RegistryFileContent[] = [];

  for (const source of registrySources) {
    fileContents.push({
      content: transformContent(await readFile(source.sourcePath, "utf-8")),
      name: source.name,
      path: source.registryPath,
      type: source.type,
    });
  }

  const registryItems: RegistryItem[] = registrySources.map((source) => ({
    description: source.description,
    files: [
      {
        path: source.registryPath,
        target: source.target,
        type: source.type as Exclude<
          RegistryItem["type"],
          "registry:base" | "registry:font"
        >,
      },
    ],
    name: source.name,
    title: source.title,
    type: source.type,
  }));

  const registry: Registry = registrySchema.parse({
    homepage: REGISTRY_BASE_URL,
    items: registryItems,
    name: "ai-elements",
  });

  await rm(REGISTRY_DIR, { force: true, recursive: true });
  await rm(API_REGISTRY_DIR, { force: true, recursive: true });
  await mkdir(REGISTRY_DIR, { recursive: true });
  await mkdir(API_REGISTRY_DIR, { recursive: true });

  const writeJson = async (relativePath: string, data: unknown) => {
    const target = nodePath.join(PREVIEW_PUBLIC_DIR, relativePath);
    await mkdir(nodePath.dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(data, null, 2)}\n`);
  };

  await writeJson("registry.json", registry);
  await writeJson("r/registry.json", registry);
  await writeJson("api/registry/registry.json", registry);

  const buildItem = (item: RegistryItem): RegistryItem => {
    const files = item.files ?? [];
    const itemFiles: NonNullable<RegistryItem["files"]> = [];
    const dependencies = new Set<string>();
    const itemDevDependencies = new Set<string>();
    const registryDependencies = new Set<string>();

    for (const fileRef of files) {
      const fileContent = fileContents.find(
        (content) => content.path === fileRef.path
      );
      if (!fileContent) {
        continue;
      }

      itemFiles.push(
        makeRegistryFile(
          fileContent.path,
          fileRef.target ?? fileContent.path,
          fileContent.type,
          fileContent.content
        )
      );

      for (const moduleName of parseModuleSpecifiers(
        fileContent.path,
        fileContent.content
      )) {
        if (moduleName.startsWith("./") || moduleName.startsWith("../")) {
          const localName = resolveRelativeRegistryName(
            fileContent.path,
            moduleName,
            registryNameByPath
          );
          if (localName && localName !== item.name) {
            registryDependencies.add(toRegistryUrl(localName));
          }
          continue;
        }

        if (moduleName.startsWith("@/components/ai-elements/")) {
          const componentName = moduleName.split("/").pop();
          if (componentName && registryNames.has(componentName)) {
            registryDependencies.add(toRegistryUrl(componentName));
          }
          continue;
        }

        if (moduleName.startsWith("@/components/ui/")) {
          const componentName = moduleName.split("/").pop();
          if (componentName && registryNames.has(componentName)) {
            registryDependencies.add(toRegistryUrl(componentName));
          }
          continue;
        }

        if (moduleName.startsWith("@/hooks/")) {
          const hookName = moduleName.split("/").pop();
          if (hookName && registryNames.has(hookName)) {
            registryDependencies.add(toRegistryUrl(hookName));
          }
          continue;
        }

        if (moduleName.startsWith("@/lib/")) {
          const libName = moduleName.split("/").pop();
          if (libName && registryNames.has(libName)) {
            registryDependencies.add(toRegistryUrl(libName));
          }
          continue;
        }

        const packageName = getBasePackageName(moduleName);
        if (runtimeDependencies.has(packageName)) {
          dependencies.add(packageName);
          for (const typesPackage of typesDevDepsMap.get(packageName) ?? []) {
            itemDevDependencies.add(typesPackage);
          }
        }

        if (devDependencies.has(moduleName)) {
          itemDevDependencies.add(moduleName);
        }
      }
    }

    return registryItemSchema.parse({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      dependencies: sortUnique(dependencies),
      description: item.description,
      devDependencies: sortUnique(itemDevDependencies),
      files: itemFiles,
      name: item.name,
      registryDependencies: sortUnique(registryDependencies),
      title: item.title,
      type: item.type,
    });
  };

  const allFiles: NonNullable<RegistryItem["files"]> = [];
  const allDependencies = new Set<string>();
  const allDevDependencies = new Set<string>();
  const allRegistryDependencies = new Set<string>();

  for (const item of registryItems.filter(
    (registryItem) => registryItem.type === "registry:component"
  )) {
    const itemResponse = buildItem(item);
    for (const file of itemResponse.files ?? []) {
      allFiles.push(file);
    }
    for (const dependency of itemResponse.dependencies ?? []) {
      allDependencies.add(dependency);
    }
    for (const dependency of itemResponse.devDependencies ?? []) {
      allDevDependencies.add(dependency);
    }
    for (const dependency of itemResponse.registryDependencies ?? []) {
      allRegistryDependencies.add(dependency);
    }
  }

  const allItem = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies: sortUnique(allDependencies),
    description: "Bundle containing all AI-powered components.",
    devDependencies: sortUnique(allDevDependencies),
    files: allFiles,
    name: "all",
    registryDependencies: sortUnique(allRegistryDependencies),
    title: "All AI Elements",
    type: "registry:component",
  });

  await writeJson("r/all.json", allItem);
  await writeJson("api/registry/all.json", allItem);

  for (const item of registry.items) {
    const itemResponse = buildItem(item);
    await writeJson(`r/${item.name}.json`, itemResponse);
    await writeJson(`api/registry/${item.name}.json`, itemResponse);
  }

  console.log(
    `Generated static registry with ${registry.items.length} items in ${nodePath.relative(ROOT_DIR, PREVIEW_PUBLIC_DIR)}`
  );
};

await main();
