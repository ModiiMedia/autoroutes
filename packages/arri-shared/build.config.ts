import { readFileSync } from "node:fs";
import path from "node:path";
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
    outDir: "../../dist/packages/arri-shared/dist",
    clean: true,
    declaration: true,
    failOnWarn: false,
    externals: deps,
});