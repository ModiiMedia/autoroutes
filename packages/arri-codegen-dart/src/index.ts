import { execSync } from "child_process";
import { writeFileSync } from "fs";
import {
    type ServiceDefinition,
    isRpcDefinition,
    type RpcDefinition,
    type SchemaFormProperties,
    type SchemaFormType,
    isTypeForm,
    type Schema,
    isPropertiesForm,
    isElementsForm,
    isEnumForm,
    isValuesForm,
    isDiscriminatorForm,
    type AppDefinition,
    unflattenProcedures,
    isServiceDefinition,
    type SchemaFormElements,
    type SchemaFormEnum,
    type SchemaFormValues,
    type SchemaFormDiscriminator,
    defineClientGeneratorPlugin,
    pascalCase,
    camelCase,
} from "arri-codegen-utils";
import { a } from "arri-validate";

export interface DartClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const dartClientGenerator = defineClientGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            generator: async (def) => {
                if (!options.clientName) {
                    throw new Error(
                        'Missing "clientName" cannot generate dart client',
                    );
                }
                if (!options.outputFile) {
                    throw new Error(
                        'Missing "outputFile" cannot generate dart client',
                    );
                }
                const numProcedures = Object.keys(def.procedures).length;
                if (numProcedures <= 0) {
                    console.warn(
                        "No procedures found in definition file. Dart client will not be generated",
                    );
                }
                const result = createDartClient(def, options);
                writeFileSync(options.outputFile, result);
                try {
                    execSync(`dart format ${options.outputFile}`);
                } catch (err) {
                    console.error("Error formatting dart client", err);
                }
            },
            options,
        };
    },
);

export class DartClientGenerator {
    generatedModels: string[] = [];
}

export function createDartClient(
    def: AppDefinition,
    opts: DartClientGeneratorOptions,
): string {
    const existingClassNames: string[] = [];
    const services = unflattenProcedures(def.procedures);
    const rpcParts: string[] = [];
    const serviceGetterParts: string[] = [];
    const serviceParts: string[] = [];
    const modelParts: string[] = [];

    Object.keys(services).forEach((key) => {
        const item = services[key];
        if (isRpcDefinition(item)) {
            const rpc = dartRpcFromDefinition(key, item, opts);
            rpcParts.push(rpc);
            return;
        }
        if (isServiceDefinition(item)) {
            const serviceName: string = pascalCase(`${opts.clientName}_${key}`);
            const service = dartServiceFromDefinition(serviceName, item, opts);
            serviceParts.push(service);
            serviceGetterParts.push(`${serviceName}Service get ${key} {
  return ${serviceName}Service(
    baseUrl: _baseUrl, 
    headers: _headers,
  );
}`);
        }
    });

    Object.keys(def.models).forEach((key) => {
        const item = def.models[key];
        const result = dartClassFromJtdSchema(key, item, {
            isOptional: false,
            existingClassNames,
        });
        modelParts.push(result.content);
    });
    const errorModel = dartClassFromJtdSchema(
        `${opts.clientName}Error`,
        def.errors,
        {
            isOptional: false,
            existingClassNames,
            isException: true,
        },
    );
    modelParts.push(errorModel.content);

    return `// this file was autogenerated by arri
import "dart:convert";
import "package:arri_client/arri_client.dart";

class ${opts.clientName} {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ${opts.clientName}({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl,
  _headers = headers;
  ${rpcParts.join("\n  ")}
  ${serviceGetterParts.join("\n  ")}
}

${serviceParts.join("\n")}

${modelParts.join("\n")}
`;
}

export function dartServiceFromDefinition(
    name: string,
    def: ServiceDefinition,
    opts: DartClientGeneratorOptions,
) {
    const rpcParts: string[] = [];
    const subServiceParts: Array<{
        name: string;
        key: string;
        content: string;
    }> = [];
    const serviceName = `${name}`;
    Object.keys(def).forEach((key) => {
        const item = def[key];
        if (isRpcDefinition(item)) {
            rpcParts.push(dartRpcFromDefinition(key, item, opts));
            return;
        }
        const subServiceName = pascalCase(`${serviceName}_${key}`);
        const subService = dartServiceFromDefinition(
            subServiceName,
            item,
            opts,
        );
        subServiceParts.push({
            name: subServiceName,
            key,
            content: subService,
        });
    });
    return `class ${serviceName}Service {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ${serviceName}Service({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl,
  _headers = headers;
  ${subServiceParts
      .map(
          (sub) => `${sub.name}Service get ${sub.key} {
    return ${sub.name}Service(
        baseUrl: _baseUrl,
        headers: _headers,
    );
  }`,
      )
      .join("\n")}
  ${rpcParts.join("\n  ")}
}
${subServiceParts.map((sub) => sub.content).join("\n")}
`;
}

export function dartRpcFromDefinition(
    key: string,
    def: RpcDefinition,
    opts: DartClientGeneratorOptions,
): string {
    let returnType:
        | `Future<String>`
        | "Future<int>"
        | "Future<number>"
        | "Future<void>"
        | `Future<${string}>` = `Future<String>`;
    let returnTypeName = "String";
    if (def.response) {
        returnType = `Future<${pascalCase(def.response)}>`;
        returnTypeName = pascalCase(def.response);
    } else {
        returnType = "Future<void>";
    }
    let paramsInput = "";
    if (def.params) {
        paramsInput = `${pascalCase(def.params)} params`;
    }
    let responseParser: string = "(body) => body;";
    switch (returnType) {
        case "Future<String>":
            break;
        case "Future<int>":
            responseParser = `(body) => Int.parse(body)`;
            break;
        case "Future<double>":
            responseParser = `(body) => Double.parse(body)`;
            break;
        case "Future<void>":
            responseParser = `(body) {}`;
            break;
        case "Future<bool>":
            responseParser = `(body) {
                        switch(body) {
                            case "true":
                            case "1":
                                return true;
                            case "false":
                            case "0":
                            default:
                                return false;
                        }
                    }`;
            break;
        default:
            responseParser = `(body) => ${returnTypeName}.fromJson(
                json.decode(body),
            )`;
            break;
    }
    return `${returnType} ${key}(${paramsInput}) {
    return parsedArriRequest(
      "$_baseUrl${def.path}",
      method: HttpMethod.${def.method},
      headers: _headers,
      params: ${paramsInput.length ? `params.toJson()` : "null"},
      parser: ${responseParser},
    );
  }`;
}

export function dartTypeFromJtdSchema(
    /**
     * location in the tree i.e User.reviews.id
     */
    nodePath: string,
    def: Schema,
    additionalOptions: {
        isOptional: boolean;
        existingClassNames: string[];
    },
): DartProperty {
    if (isTypeForm(def)) {
        return dartScalarFromJtdScalar(nodePath, def, additionalOptions);
    }
    if (isPropertiesForm(def)) {
        return dartClassFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isElementsForm(def)) {
        return dartArrayFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isEnumForm(def)) {
        return dartEnumFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isValuesForm(def)) {
        return dartMapFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isDiscriminatorForm(def)) {
        return dartSealedClassFromJtdSchema(nodePath, def, additionalOptions);
    }
    return dartDynamicFromAny(nodePath, a.any(), additionalOptions);
}

export function dartClassFromJtdSchema(
    nodePath: string,
    def: SchemaFormProperties,
    additionalOptions: ConversionAdditionalOptions & {
        isException?: boolean;
        discriminatorOptions?: {
            discriminatorKey: string;
            discriminatorValue: string;
            discriminatorParentClassName: string;
        };
    },
): DartProperty {
    const isException = additionalOptions?.isException ?? false;
    const discOptions = additionalOptions?.discriminatorOptions;
    const isDiscriminatorChild =
        (discOptions?.discriminatorKey.length ?? 0) > 0;
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    let className = def.metadata?.id ? pascalCase(def.metadata.id) : undefined;
    if (!className) {
        className = pascalCase(nodePath.split(".").join("_"));
    }
    const properties: { key: string; templates: DartProperty }[] = [];
    const optionalProperties: { key: string; templates: DartProperty }[] = [];
    const subContentParts: string[] = [];
    if (!def.properties) {
        return {
            typeName: "",
            fieldTemplate: "",
            constructorTemplate: "",
            fromJsonTemplate: () => "",
            toJsonTemplate: () => "",
            content: "",
        };
    }

    for (const key of Object.keys(def.properties ?? {})) {
        const keyPath = `${nodePath}.${key}`;
        const prop = def.properties[key];
        const mappedProp = dartTypeFromJtdSchema(keyPath, prop, {
            isOptional: false,
            existingClassNames: additionalOptions.existingClassNames,
        });
        properties.push({
            key,
            templates: mappedProp,
        });
        if (mappedProp?.content) {
            subContentParts.push(mappedProp.content);
        }
    }
    if (def.optionalProperties) {
        for (const key of Object.keys(def.optionalProperties ?? {})) {
            const keyPath = `${nodePath}.${key}`;
            const prop = def.optionalProperties[key];
            const mappedProp = dartTypeFromJtdSchema(keyPath, prop, {
                isOptional: true,
                existingClassNames: additionalOptions.existingClassNames,
            });
            optionalProperties.push({ key, templates: mappedProp });
            if (mappedProp?.content) {
                subContentParts.push(mappedProp.content);
            }
        }
    }
    const fieldParts: string[] = [];
    const constructorParts: string[] = [];
    const fromJsonParts: string[] = [];
    const copyWithParamParts: string[] = [];
    const copyWithInitParts: string[] = [];
    if (discOptions) {
        fieldParts.push(`@override
final String ${camelCase(discOptions.discriminatorKey)} = "${
            discOptions.discriminatorValue
        }"`);
    }
    for (const prop of properties) {
        fieldParts.push(prop.templates.fieldTemplate);
        constructorParts.push(prop.templates.constructorTemplate);
        fromJsonParts.push(
            `${camelCase(prop.key)}: ${prop.templates.fromJsonTemplate(
                `json["${prop.key}"]`,
            )}`,
        );
        if (prop.templates.typeName === "dynamic") {
            copyWithParamParts.push(`dynamic ${prop.key}`);
        } else {
            copyWithParamParts.push(
                `${prop.templates.typeName.replace("?", "")}? ${prop.key}`,
            );
        }
        copyWithInitParts.push(`${prop.key}: ${prop.key} ?? this.${prop.key}`);
    }
    for (const prop of optionalProperties) {
        fieldParts.push(prop.templates.fieldTemplate);
        constructorParts.push(prop.templates.constructorTemplate);
        fromJsonParts.push(
            `${camelCase(prop.key)}: ${prop.templates.fromJsonTemplate(
                `json["${prop.key}"]`,
            )}`,
        );
        if (prop.templates.typeName === "dynamic") {
            copyWithParamParts.push(`dynamic ${prop.key}`);
        } else {
            copyWithParamParts.push(
                `${prop.templates.typeName.replace("?", "")}? ${prop.key}`,
            );
        }
        copyWithInitParts.push(`${prop.key}: ${prop.key} ?? this.${prop.key}`);
    }
    let classNamePart = `class ${className}`;
    if (isDiscriminatorChild) {
        classNamePart += ` implements ${discOptions?.discriminatorParentClassName}`;
    } else if (isException) {
        classNamePart += ` implements Exception`;
    }

    let content = `${classNamePart} {
    ${fieldParts.join(";\n  ")};
  const ${className}({
    ${constructorParts.join(",\n    ")},
  });
  factory ${className}.fromJson(Map<String, dynamic> json) {
    return ${className}(
      ${fromJsonParts.join(",\n      ")},
    );
  }
  ${isDiscriminatorChild ? `@override` : ""}
  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{${
        isDiscriminatorChild
            ? `\n      "${discOptions?.discriminatorKey}": ${camelCase(
                  discOptions?.discriminatorKey ?? "",
              )},`
            : ""
    }
      ${properties
          .map(
              (prop) =>
                  `"${prop.key}": ${prop.templates.toJsonTemplate(prop.key)}`,
          )
          .join(",\n      ")},
    };
    ${optionalProperties
        .map(
            (prop) => `if (${camelCase(prop.key)} != null) {
      result["${prop.key}"] = ${prop.templates.toJsonTemplate(prop.key)};
    }`,
        )
        .join("\n")}
    return result;
  }
  ${className} copyWith({
    ${copyWithParamParts.join(",\n    ")},
  }) {
    return ${className}(
      ${copyWithInitParts.join(",\n      ")},
    );
  }
}
${subContentParts.join("\n")}

`;
    if (additionalOptions.existingClassNames.includes(className)) {
        content = "";
    } else {
        additionalOptions.existingClassNames.push(className);
    }
    const isNullable = def.nullable ?? additionalOptions?.isOptional;
    return {
        typeName: className,
        fieldTemplate: isNullable
            ? `final ${className}? ${key}`
            : `final ${className} ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) =>
            isNullable
                ? `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`
                : `${className}.fromJson(${input})`,
        toJsonTemplate: (input) => `${input}${isNullable ? "?" : ""}.toJson()`,
        content,
    };
}

interface DartProperty {
    typeName: string;
    fieldTemplate: string;
    constructorTemplate: string;
    fromJsonTemplate: (input: string) => string;
    toJsonTemplate: (input: string) => string;
    content: string;
}

function dartDynamicFromAny(
    nodePath: string,
    def: Schema,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    return {
        typeName: "dynamic",
        fieldTemplate: `final dynamic ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => `${input}`,
        toJsonTemplate: (input) => input,
        content: "",
    };
}

function dartArrayFromJtdSchema(
    nodePath: string,
    def: SchemaFormElements,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const subtype = dartTypeFromJtdSchema(
        `${nodePath}.Item`,
        def.elements,
        additionalOptions,
    );
    const typeName = isNullable
        ? `List<${subtype.typeName}>?`
        : `List<${subtype.typeName}>`;
    return {
        typeName,
        fieldTemplate: `final ${typeName} ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is List ? (${input} as List).map((item) => ${subtype.fromJsonTemplate(
                    `"item"`,
                )}).toList() : null`;
            }
            return `${input} is List ? (${input} as List).map((item) => ${subtype.fromJsonTemplate(
                "item",
            )}).toList() : []`;
        },
        toJsonTemplate: (input) => {
            return `${input}${
                isNullable ? "?" : ""
            }.map((item) => ${subtype.toJsonTemplate("item")}).toList()`;
        },
        content: subtype.content,
    };
}

interface ConversionAdditionalOptions {
    isOptional: boolean;
    existingClassNames: string[];
}

function dartScalarFromJtdScalar(
    nodePath: string,
    def: SchemaFormType,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const defaultInitializationTemplate = additionalOptions.isOptional
        ? `this.${key}`
        : `required this.${key}`;
    const defaultToJsonTemplate = (input: string) => input;
    switch (def.type) {
        case "boolean":
            if (isNullable) {
                return {
                    typeName: "bool?",
                    fieldTemplate: `final bool? ${key}`,
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableTypeFromDynamic<bool>(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "bool",
                fieldTemplate: `final bool ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `typeFromDynamic<bool>(${input}, false)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "float32":
        case "float64":
            if (isNullable) {
                return {
                    typeName: "double?",
                    fieldTemplate: `final double? ${key}`,
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableDoubleFromDynamic(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "double",
                fieldTemplate: `final double ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => `doubleFromDynamic(${input}, 0)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "int16":
        case "int32":
        case "int8":
        case "uint16":
        case "uint32":
        case "uint8":
            if (isNullable) {
                return {
                    typeName: "int?",
                    fieldTemplate: `final int? ${key}`,
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableIntFromDynamic(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "int",
                fieldTemplate: `final int ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => `intFromDynamic(${input}, 0)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "timestamp":
            if (isNullable) {
                return {
                    typeName: "DateTime?",
                    fieldTemplate: `final DateTime? ${key}`,
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableDateTimeFromDynamic(${input})`,
                    toJsonTemplate: (input) =>
                        `${input}?.toUtc().toIso8601String()`,
                    content: "",
                };
            }
            return {
                typeName: "DateTime",
                fieldTemplate: `final DateTime ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `dateTimeFromDynamic(
      ${input},
      DateTime.fromMillisecondsSinceEpoch(0),
    )`,
                toJsonTemplate: (input) => `${input}.toUtc().toIso8601String()`,
                content: "",
            };
        case "string":
            if (isNullable) {
                return {
                    typeName: "String?",
                    fieldTemplate: `final String? ${key}`,
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableTypeFromDynamic<String>(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "String",
                fieldTemplate: `final String ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `typeFromDynamic<String>(${input}, "")`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        default:
            return {
                typeName: "dynamic",
                fieldTemplate: `final dynamic ${key}`,
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => input,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
    }
}

function dartEnumFromJtdSchema(
    nodePath: string,
    def: SchemaFormEnum,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    let className = def.metadata?.id ? pascalCase(def.metadata.id) : undefined;
    if (!className) {
        className = pascalCase(nodePath.split(".").join("_"));
    }
    const valNames: string[] = [];
    const fieldParts: string[] = [];
    for (const val of def.enum) {
        valNames.push(`${camelCase(val)}`);
        fieldParts.push(`${camelCase(val)}("${val}")`);
    }
    let content = `enum ${className} implements Comparable<${className}> {
  ${fieldParts.join(",\n  ")};
  const ${className}(this.value);
  final String value;

  factory ${className}.fromJson(dynamic json) {
    for(final v in values) {
      if(v.value == json) {
        return v;
      }
    }
    return ${valNames[0]};
  }

  @override
  compareTo(${className} other) => name.compareTo(other.name);
}`;
    if (additionalOptions.existingClassNames.includes(className)) {
        content = "";
    } else {
        additionalOptions.existingClassNames.push(className);
    }
    return {
        typeName: className,
        fieldTemplate: isNullable
            ? `final ${className}? ${key}`
            : `final ${className} ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`;
            }
            return `${className}.fromJson(${input})`;
        },
        toJsonTemplate: (input) => `${input}${isNullable ? "?" : ""}.value`,
        content,
    };
}

function dartMapFromJtdSchema(
    nodePath: string,
    def: SchemaFormValues,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const innerType = dartTypeFromJtdSchema(`${nodePath}.Value`, def.values, {
        existingClassNames: additionalOptions.existingClassNames,
        isOptional: false,
    });
    return {
        typeName: isNullable
            ? `Map<String, ${innerType.typeName}>?`
            : `Map<String, ${innerType.typeName}>`,
        fieldTemplate: `final Map<String, ${innerType.typeName}>${
            isNullable ? "?" : ""
        } ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => `${input} is Map<String, dynamic>
          ? (${input} as Map<String, dynamic>).map(
              (key, value) => MapEntry(key, ${innerType.typeName.replace(
                  "?",
                  "",
              )}.fromJson(value)))
          : <String, ${innerType.typeName}>{}`,
        toJsonTemplate: (input) =>
            `${input}${
                isNullable ? "?" : ""
            }.map((key, value) => MapEntry(key, ${innerType.toJsonTemplate(
                "value",
            )}))`,
        content: innerType.content,
    };
}

function dartSealedClassFromJtdSchema(
    nodePath: string,
    def: SchemaFormDiscriminator,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const className = def.metadata?.id
        ? pascalCase(def.metadata?.id)
        : pascalCase(nodePath.split(".").join("_"));
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const discriminatorJsonKey = def.discriminator;
    const discriminatorKey = camelCase(def.discriminator);
    const fromJsonCaseParts: string[] = [];
    const childContentParts: string[] = [];
    Object.keys(def.mapping).forEach((discKeyValue) => {
        const childDef = def.mapping[discKeyValue];
        if (!isPropertiesForm(childDef)) {
            return;
        }
        const child = dartClassFromJtdSchema(
            `${nodePath}.${camelCase(discKeyValue.toLowerCase())}`,
            childDef,
            {
                isOptional: false,
                existingClassNames: additionalOptions.existingClassNames,
                discriminatorOptions: {
                    discriminatorKey,
                    discriminatorValue: discKeyValue,
                    discriminatorParentClassName: className,
                },
            },
        );
        fromJsonCaseParts.push(`case "${discKeyValue}":
        return ${child.typeName}.fromJson(json);`);
        childContentParts.push(child.content);
    });
    const content = `sealed class ${className} {
  final String ${discriminatorKey};
  const ${className}({
    required this.${discriminatorKey},
  });
  factory ${className}.fromJson(Map<String, dynamic> json) {
    if(json["${discriminatorJsonKey}"] is! String) {
      throw Exception(
        "Unable to decode ${className}. Expected String from \\"${discriminatorJsonKey}\\". Received \${json["${discriminatorJsonKey}"]}}",
      );
    }
    switch (json["${discriminatorJsonKey}"]) {
      ${fromJsonCaseParts.join("\n      ")}
    }
    throw Exception(
        "Unable to decode ${className}. \\"\${json["${discriminatorJsonKey}"]}\\" doesn't match any of the accepted discriminator values.",
    );
  }
  Map<String, dynamic> toJson();
}
${childContentParts.join("\n")}`;
    return {
        typeName: `${className}${isNullable ? "?" : ""}`,
        fieldTemplate: `final ${className}${isNullable ? "?" : ""} ${key}`,
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`;
            }
            return `${className}.fromJson(${input})`;
        },
        toJsonTemplate: (input) => {
            if (isNullable) {
                return `${input}?.toJson()`;
            }
            return `${input}.toJson()`;
        },
        content,
    };
}
