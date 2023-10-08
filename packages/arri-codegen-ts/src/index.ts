import { writeFileSync } from "fs";
import {
    type AppDefinition,
    defineClientGeneratorPlugin,
    pascalCase,
    type Schema,
    isTypeForm,
    type SchemaFormType,
    isPropertiesForm,
    type SchemaFormProperties,
    isEnumForm,
    type SchemaFormEnum,
    isElementsForm,
    type SchemaFormElements,
    type SchemaFormDiscriminator,
    camelCase,
    isDiscriminatorForm,
    isValuesForm,
    type SchemaFormValues,
    type RpcDefinition,
    unflattenProcedures,
    isRpcDefinition,
    isServiceDefinition,
    type ServiceDefinition,
} from "arri-codegen-utils";
import prettier from "prettier";

interface GeneratorOptions {
    clientName: string;
    outputFile: string;
    prettierOptions?: Omit<prettier.Config, "parser">;
}

export const typescriptClientGenerator = defineClientGeneratorPlugin(
    (options: GeneratorOptions) => ({
        generator: async (def) => {
            if (!options.clientName) {
                throw new Error("Name is requires");
            }
            if (!options.outputFile) {
                throw new Error("No output file specified");
            }
            if (Object.keys(def.procedures).length <= 0) {
                throw new Error(
                    "No procedures found in definition file. Typescript client will not be generated.",
                );
            }
            const result = await createTypescriptClient(def, options);
            writeFileSync(options.outputFile, result);
        },
        options,
    }),
);

export async function createTypescriptClient(
    def: AppDefinition,
    options: GeneratorOptions,
): Promise<string> {
    const clientName = pascalCase(options.clientName);
    const services = unflattenProcedures(def.procedures);
    const serviceFieldParts: string[] = [];
    const serviceInitializationParts: string[] = [];
    const procedureParts: string[] = [];
    const subContentParts: string[] = [];
    const existingTypeNames: string[] = [];
    const typesNeedingValidator: string[] = [];
    const errorName = def.errors.metadata?.id ?? `${options.clientName}Error`;
    const errorType = tsObjectFromJtdSchema(errorName, def.errors, options, {
        isOptional: false,
        existingTypeNames,
        isError: true,
    });
    Object.keys(services).forEach((key) => {
        const item = services[key];
        if (isRpcDefinition(item)) {
            const rpc = tsRpcFromDefinition(
                key,
                item,
                {
                    typesNeedingValidator,
                    ...options,
                },
                errorName,
            );
            procedureParts.push(rpc);
            return;
        }
        if (isServiceDefinition(item)) {
            const serviceName: string = pascalCase(`${clientName}_${key}`);
            const service = tsServiceFromDefinition(
                serviceName,
                item,
                {
                    typesNeedingValidator,
                    ...options,
                },
                errorName,
            );
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceInitializationParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subContentParts.push(service);
            // todo
        }
    });
    for (const key of Object.keys(def.models)) {
        const schema = def.models[key];
        if (isPropertiesForm(schema)) {
            const type = tsTypeFromJtdSchema(key, schema, options, {
                isOptional: false,
                existingTypeNames,
            });
            subContentParts.push(type.content);
        }
    }

    subContentParts.push(errorType.content);
    return await prettier.format(
        `// this file was autogenerated by arri-codegen-ts
/* eslint-disable */
import { arriRequest } from 'arri-client';
    
interface ${clientName}Options {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export class ${clientName} {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    ${serviceFieldParts.join("\n    ")}

    constructor(options: ${clientName}Options = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        ${serviceInitializationParts.join(";\n        ")}
    }
    ${procedureParts.join("\n    ")}
}

${subContentParts.join("\n")}
`,
        { parser: "typescript", ...options.prettierOptions },
    );
}

interface RpcOptions extends GeneratorOptions {
    typesNeedingValidator: string[];
}

export function tsRpcFromDefinition(
    key: string,
    schema: RpcDefinition,
    options: RpcOptions,
    errorName: string,
) {
    const paramName = pascalCase(schema.params ?? "");
    const responseName = pascalCase(schema.response ?? "");
    const paramsInput = schema.params ? `params: ${paramName}` : "";
    const hasInput = paramName.length > 0;
    const hasOutput = responseName.length > 0;
    let serializerPart = `(_) => {}`;
    let parserPart = `(_) => {}`;
    if (hasInput) {
        serializerPart = `$$${paramName}.serialize`;
    }
    if (hasOutput) {
        parserPart = `$$${responseName}.parse`;
    }
    const paramsOutput = hasInput ? `params` : `params: undefined`;

    return `${key}(${paramsInput}) {
        return arriRequest<${schema.response ?? "undefined"}, ${
            schema.params ?? "undefined"
        }>({
            url: \`\${this.baseUrl}${schema.path}\`,
            method: "${schema.method}",
            headers: this.headers,
            ${paramsOutput},
            parser: ${parserPart},
            errorParser: $$${errorName}.parse,
            serializer: ${serializerPart},
        });
    }`;
}

export function tsServiceFromDefinition(
    name: string,
    schema: ServiceDefinition,
    options: RpcOptions,
    errorName: string,
): string {
    const serviceFieldParts: string[] = [];
    const serviceConstructorParts: string[] = [];
    const subServiceContent: string[] = [];
    const rpcContent: string[] = [];

    Object.keys(schema).forEach((key) => {
        const def = schema[key];
        if (isRpcDefinition(def)) {
            const rpc = tsRpcFromDefinition(key, def, options, errorName);
            rpcContent.push(rpc);
            return;
        }
        if (isServiceDefinition(def)) {
            const serviceName: string = pascalCase(`${name}_${key}`);
            const service = tsServiceFromDefinition(
                serviceName,
                def,
                options,
                errorName,
            );
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceConstructorParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subServiceContent.push(service);
        }
    });

    return `export class ${name}Service {
        private readonly baseUrl: string;
        private readonly headers: Record<string, string>;
        ${serviceFieldParts.join("\n    ")}
        constructor(options: ${pascalCase(
            `${options.clientName}_Options`,
        )} = {}) {
            this.baseUrl = options.baseUrl ?? '';
            this.headers = options.headers ?? {};
            ${serviceConstructorParts.join("\n        ")}
        }
        ${rpcContent.join("\n    ")}
    }
    ${subServiceContent.join("\n")}`;
}

interface AdditionalOptions {
    isOptional: boolean;
    existingTypeNames: string[];
}

interface TsProperty {
    tsType: string;
    schema: Schema;
    fieldTemplate: string;
    fromJsonTemplate: (input: string) => string;
    toJsonTemplate: (input: string) => string;
    content: string;
}

export function tsTypeFromJtdSchema(
    nodePath: string,
    def: Schema,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    if (isTypeForm(def)) {
        return tsScalarFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isPropertiesForm(def)) {
        return tsObjectFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isEnumForm(def)) {
        return tsEnumFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isElementsForm(def)) {
        return tsArrayFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isDiscriminatorForm(def)) {
        return tsDiscriminatedUnionFromJtdSchema(
            nodePath,
            def,
            options,
            additionalOptions,
        );
    }
    if (isValuesForm(def)) {
        return tsRecordFromJtdSchema(nodePath, def, options, additionalOptions);
    }

    return tsAnyFromJtdSchema(nodePath, def, options, additionalOptions);
}

export function maybeOptionalKey(keyName: string, isOptional = false) {
    if (isOptional) {
        return `${keyName}?`;
    }
    return keyName;
}

export function maybeNullType(typeName: string, isNullable = false) {
    if (isNullable) {
        return `${typeName} | null`;
    }
    return typeName;
}

export function tsAnyFromJtdSchema(
    nodePath: string,
    def: Schema,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const isNullable = def.nullable ?? false;
    const isOptional = additionalOptions.isOptional;
    return {
        tsType: "any",
        schema: def,
        fieldTemplate: `${maybeOptionalKey(key, isOptional)}: ${maybeNullType(
            "any",
            isNullable,
        )}`,
        fromJsonTemplate(input) {
            return input;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content: "",
    };
}

export function tsScalarFromJtdSchema(
    nodePath: string,
    def: SchemaFormType,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const isNullable = def.nullable ?? false;
    const isOptional = additionalOptions.isOptional;
    switch (def.type) {
        case "boolean":
            return {
                tsType: "boolean",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("boolean", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'boolean' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'boolean' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'boolean' ? ${input} : false`;
                },
                toJsonTemplate(input) {
                    return `JSON.stringify(${input})`;
                },
                content: "",
            };
        case "string":
            return {
                tsType: "string",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("string", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'string' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'string' ? ${input} : ''`;
                },
                toJsonTemplate(input) {
                    return `JSON.stringify(${input})`;
                },
                content: "",
            };
        case "timestamp":
            return {
                tsType: "Date",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("Date", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'string' ? new Date(${input}) : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? new Date(${input}) : null`;
                    }
                    return `typeof ${input} === 'string' ? new Date(${input}) : new Date(0)`;
                },
                toJsonTemplate(input) {
                    if (isOptional || isNullable) {
                        return `${input}?.toISOString()`;
                    }
                    return `${input}.toISOString()`;
                },
                content: "",
            };
        case "float32":
        case "float64":
        case "int8":
        case "int16":
        case "int32":
        case "uint16":
        case "uint32":
        case "uint8":
            return {
                tsType: "number",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("number", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'number' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'number' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'number' ? ${input} : 0`;
                },
                toJsonTemplate(input) {
                    return `JSON.stringify(${input})`;
                },
                content: "",
            };
    }
}

function getTypeName(nodePath: string, def: Schema) {
    if (def.metadata?.id) {
        return pascalCase(def.metadata.id);
    }
    return pascalCase(nodePath.split(".").join("_"));
}

export function tsObjectFromJtdSchema(
    nodePath: string,
    def: SchemaFormProperties,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions & {
        discriminatorKey?: string;
        discriminatorKeyValue?: string;
        isError?: boolean;
    },
): TsProperty {
    const typeName = getTypeName(nodePath, def);
    const key = nodePath.split(".").pop() ?? "";
    const fieldNames: string[] = [];
    const fieldParts: string[] = [];
    const subContentParts: string[] = [];
    const parserParts: string[] = [];
    if (
        additionalOptions.discriminatorKey &&
        additionalOptions.discriminatorKeyValue
    ) {
        parserParts.push(
            `${additionalOptions.discriminatorKey}: '${additionalOptions.discriminatorKeyValue}'`,
        );
        fieldParts.push(
            `${additionalOptions.discriminatorKey}: "${additionalOptions.discriminatorKeyValue}"`,
        );
        fieldNames.push(additionalOptions.discriminatorKey);
    }
    if (def.properties) {
        for (const propKey of Object.keys(def.properties)) {
            const propSchema = def.properties[propKey];
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: false,
                    existingTypeNames: additionalOptions.existingTypeNames,
                },
            );
            parserParts.push(
                `${propKey}: ${type.fromJsonTemplate(`input.${propKey}`)}`,
            );
            fieldParts.push(type.fieldTemplate);
            fieldNames.push(propKey);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    if (def.optionalProperties) {
        for (const propKey of Object.keys(def.optionalProperties)) {
            const propSchema = def.optionalProperties[propKey];
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: true,
                    existingTypeNames: additionalOptions.existingTypeNames,
                },
            );
            parserParts.push(
                `${propKey}: ${type.fromJsonTemplate(`input.${propKey}`)}`,
            );
            fieldParts.push(type.fieldTemplate);
            fieldNames.push(propKey);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    let content = "";
    const validatorPart = `export const $$${typeName} = {
            parse(input: Record<any, any>): ${typeName} {
                return ${additionalOptions.isError ? `new ${typeName} (` : ""}{
                    ${parserParts.join(",\n")},
                }${additionalOptions.isError ? ")" : ""};
            },
            serialize(input: ${typeName}): string {
                return JSON.stringify(input);
            }
        }`;
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        if (additionalOptions.isError) {
            content = `export interface ${typeName}Data {
                ${fieldParts.join(`;\n    `)};
            }
            export class ${typeName} extends Error {
                data: ${typeName}Data;

                constructor(data: ${typeName}Data) {
                    super("instance of ${typeName}")
                    this.data = data;
                }
            }
            ${validatorPart}
            ${subContentParts.join("\n")}`;
        } else {
            content = `export interface ${typeName} {
        ${fieldParts.join(";\n    ")};
    }
    ${validatorPart}
    ${subContentParts.join("\n")}`;
        }

        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsEnumFromJtdSchema(
    nodePath: string,
    def: SchemaFormEnum,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const keyName = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    let content = `export type ${typeName} = ${def.enum
        .map((val) => `"${val}"`)
        .join(" | ")}
export const $$${typeName} = {
    parse(input: any): ${typeName} {
        const vals = [${def.enum.map((val) => `"${val}"`).join(", ")}]
        if(typeof input !== 'string' || !vals.includes(input)) {
            throw new Error(\`Invalid input for ${typeName}. Expected one of the following [${def.enum.join(
                ", ",
            )}]. Got \${input}.\`);
        }
        return input as ${typeName};
    },
    serialize(input: ${typeName}): string {
        return input;
    }
}`;
    if (additionalOptions.existingTypeNames.includes(typeName)) {
        content = "";
    } else {
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            keyName,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'string' ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'string' ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsArrayFromJtdSchema(
    nodePath: string,
    def: SchemaFormElements,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const subType = tsTypeFromJtdSchema(
        `${nodePath}.item`,
        def.elements,
        options,
        {
            isOptional: false,
            existingTypeNames: additionalOptions.existingTypeNames,
        },
    );
    const tsType = `Array<${subType.tsType}>`;
    return {
        tsType,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional ?? false,
        )}: ${maybeNullType(tsType, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                    "item",
                )}) : undefined`;
            }
            if (def.nullable) {
                return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                    "item",
                )}) : null`;
            }
            return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                "item",
            )}) : []`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content: subType.content,
    };
}

export function tsDiscriminatedUnionFromJtdSchema(
    nodePath: string,
    def: SchemaFormDiscriminator,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const subTypeNames: string[] = [];
    const subContentParts: string[] = [];
    const parserParts: string[] = [];
    for (const val of Object.keys(def.mapping)) {
        const optionSchema = def.mapping[val];
        if (!isPropertiesForm(optionSchema)) {
            continue;
        }
        const optionType = tsObjectFromJtdSchema(
            `${nodePath}.${camelCase(val.toLowerCase())}`,
            optionSchema,
            options,
            {
                discriminatorKey: def.discriminator,
                discriminatorKeyValue: val,
                isOptional: false,
                existingTypeNames: additionalOptions.existingTypeNames,
            },
        );
        parserParts.push(`case '${val}': 
        return $$${optionType.tsType}.parse(input);`);
        subTypeNames.push(optionType.tsType);
        subContentParts.push(optionType.content);
    }
    let content = `export type ${typeName} = ${subTypeNames.join(" | ")};
export const $$${typeName} = {
    parse(input: Record<any, any>): ${typeName} {
        switch(input.${def.discriminator}) {
            ${parserParts.join("\n")}
            default:
                break;
        }
        throw new Error("Invalid input for ${typeName}. Input didn't match one of the specified union schemas.");
    },
    serialize(input: ${typeName}): string {
        return JSON.stringify(input);
    }
}
    ${subContentParts.join("\n")}`;
    if (additionalOptions.existingTypeNames.includes(typeName)) {
        content = "";
    } else {
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        schema: def,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsRecordFromJtdSchema(
    nodePath: string,
    def: SchemaFormValues,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const subType = tsTypeFromJtdSchema(
        `${nodePath}.value`,
        def.values,
        options,
        {
            isOptional: false,
            existingTypeNames: additionalOptions.existingTypeNames,
        },
    );
    let content = "";
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        content = `export type ${typeName} = Record<string, ${subType.tsType}>;
export const $$${typeName} = {
    parse(input: Record<any, any>): ${typeName} {
        const result: ${typeName} = {};
        for(const key of Object.keys(input)) {
            result[key] = ${subType.fromJsonTemplate(`input[key]`)};
        }
        return result;
    },
    serialize(input: ${typeName}): string {
        return JSON.stringify(input);
    }
}
${subType.content}`;
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : {}`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}
