import { readFileSync } from "node:fs";
import path from "pathe";
import { defineBuildConfig } from "unbuild";

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../package.json"), {
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
    alias: {
        "arri-shared": path.resolve(
            __dirname,
            "../../packages/arri-shared/src/index.ts",
        ),
    },
    outDir: "../../dist/packages/arri-validate/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
    externals: [],
});
