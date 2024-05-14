import { readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { defineCommand, runMain } from "citty";
import enquirer from "enquirer";
import path from "pathe";
import { kebabCase } from "scule";

const main = defineCommand({
    async run() {
        const rootPackageJson = JSON.parse(
            readFileSync(path.resolve(__dirname, "../../package.json"), {
                encoding: "utf8",
            }),
        ) as Record<string, any>;
        const version =
            "version" in rootPackageJson &&
            typeof rootPackageJson.version === "string"
                ? rootPackageJson.version
                : "0.0.1";
        const result = await enquirer.prompt<{
            name: string;
            type: "codegen" | "tooling";
        }>([
            {
                name: "type",
                message: "Select a package type",
                required: true,
                type: "select",
                choices: ["codegen", "tooling"],
            },
        ]);
        let pkgName: string;
        let pkgLocation: string;
        let depth: number;
        let outDir: string;
        switch (result.type) {
            case "codegen":
                {
                    const { language } = await enquirer.prompt<{
                        language: string;
                    }>([
                        {
                            name: "language",
                            message: "What programming language is this for?",
                            required: true,
                            type: "input",
                        },
                    ]);
                    const lang = language.toLowerCase();
                    pkgName = `@arrirpc/codegen-${lang}`;
                    pkgLocation = `languages/${lang}/${lang}-codegen`;
                    depth = 3;
                    outDir = path.resolve(
                        __dirname,
                        `../../languages/${language.toLowerCase()}/${lang}-codegen`,
                    );
                }
                break;
            case "tooling": {
                const inputResult = await enquirer.prompt<{ name: string }>([
                    {
                        name: "name",
                        message: "Name your package",
                        type: "input",
                        required: true,
                    },
                ]);
                pkgName = kebabCase(inputResult.name);
                pkgLocation = `tooling/${pkgName}`;
                depth = 2;
                outDir = path.resolve(__dirname, "../../tooling", pkgName);
                break;
            }
        }
        await mkdir(outDir);
        await mkdir(path.resolve(outDir, "src"));
        await Promise.all([
            writeFile(
                path.resolve(outDir, "src/index.ts"),
                `// ${pkgName} entry\n// todo`,
            ),
            writeFile(
                path.resolve(outDir, ".eslintrc.json"),
                eslintConfigTemplate(depth),
            ),
            writeFile(
                path.resolve(outDir, "build.config.ts"),
                buildConfigTemplate(pkgName),
            ),
            writeFile(
                path.resolve(outDir, "package.json"),
                packageJsonTemplate(pkgName, pkgLocation, version),
            ),
            writeFile(
                path.resolve(outDir, "project.json"),
                projectJsonTemplate(pkgName, pkgLocation, depth),
            ),
            writeFile(
                path.resolve(outDir, "README.md"),
                readmeTemplate(pkgName),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.json"),
                tsConfigTemplate(depth),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.lib.json"),
                tsConfigLibTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "tsconfig.spec.json"),
                tsConfigSpecTemplate(),
            ),
            writeFile(
                path.resolve(outDir, "vite.config.ts"),
                viteConfigTemplate(pkgName, depth),
            ),
        ]);
    },
});

void runMain(main);

function readmeTemplate(packageName: string) {
    return `# ${packageName}

This library was generated with [Nx](https://nx.dev).

## Building

Run \`nx build ${packageName}\` to build the library.

## Running unit tests

Run \`nx test ${packageName}\` to execute the unit tests via [Vitest](https://vitest.dev).
`;
}

function packageJsonTemplate(
    packageName: string,
    packageLocation: string,
    version: string,
) {
    return `{
    "name": "${packageName}",
    "version": "${version}",
    "type": "module",
    "license": "MIT",
    "author": {
        "name": "joshmossas",
        "url": "https://github.com/joshmossas"
    },
    "bugs": {
        "url": "https://github.com/modiimedia/arri/issues"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/modiimedia/arri.git",
        "directory": "${packageLocation}"
    },
    "main": "./dist/index.cjs",
    "module": "./dist/index.mjs",
    "types": "./dist/index.d.ts",
    "files": [
        "dist"
    ],
    "dependencies": {}
}`;
}

function projectJsonTemplate(
    packageName: string,
    packageLocation: string,
    depth: number,
) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "name": "${packageName}",
  "$schema": "${prefix}node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "${packageLocation}/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "outputs": ["{projectRoot}/dist"],
      "options": {
        "command": "unbuild",
        "cwd": "${packageLocation}"
      }
    },
    "publish": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm publish",
        "cwd": "${packageLocation}"
      },
      "dependsOn": ["build"]
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["${packageLocation}/**/*.ts"]
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{workspaceRoot}/coverage/${packageLocation}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/${packageLocation}",
        "watch": false
      },
      "configurations": {
        "watch": {
          "command": "vitest watch --passWithNoTests --globals"
        }
      }
    }
  },
  "tags": []
}
`;
}

function eslintConfigTemplate(depth: number) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "extends": ["${prefix}.eslintrc.js"],
  "ignorePatterns": [],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {}
    },
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {}
    },
    {
      "files": ["*.js", "*.jsx"],
      "rules": {}
    }
  ]
}
`;
}

function buildConfigTemplate(packageName: string) {
    return `import { readFileSync } from "node:fs";
import path from "node:path";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), {
        encoding: "utf-8",
    }),
);

const deps = Object.keys(packageJson.dependencies);

export default defineBuildConfig({
    entries: ["./src/index"],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    outDir: "dist",
    clean: true,
    declaration: true,
    failOnWarn: true,
    externals: deps,
});`;
}

function tsConfigTemplate(depth: number) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `{
  "extends": "${prefix}tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest"]
  },
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
`;
}

function tsConfigLibTemplate() {
    return `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["jest.config.ts", "src/**/*.spec.ts", "src/**/*.test.ts"]
}
`;
}

function tsConfigSpecTemplate() {
    return `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "types": ["vitest/globals", "vitest/importMeta", "vite/client", "node"]
  },
  "include": [
    "vite.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.test.js",
    "src/**/*.spec.js",
    "src/**/*.test.jsx",
    "src/**/*.spec.jsx",
    "src/**/*.d.ts",
    "src/**/*.ts",
  ],
  "exclude": []
}
`;
}

function viteConfigTemplate(projectName: string, depth: number) {
    let prefix = "";
    for (let i = 0; i < depth; i++) {
        prefix += "../";
    }
    return `import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "${prefix}node_modules/.vite/tooling/${projectName}",

    plugins: [
        viteTsConfigPaths({
            root: "${prefix}",
        }) as any,
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '${prefix}',
    //    }),
    //  ],
    // },

    test: {
        globals: true,
        reporters: ["default"],
        pool: "threads",
        pollOptions: {
            threads: {
                singleThread: true,
            },
        },
        cache: {
            dir: "${prefix}node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
`;
}
