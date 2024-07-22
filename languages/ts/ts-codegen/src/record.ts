import { SchemaFormValues } from "@arrirpc/codegen-utils";

import { tsTypeFromSchema } from "./_index";
import { CodegenContext, TsProperty, validVarName } from "./common";

export function tsRecordFromSchema(
    schema: SchemaFormValues,
    context: CodegenContext,
): TsProperty {
    const innerType = tsTypeFromSchema(schema.values, {
        clientName: context.clientName,
        typePrefix: context.typePrefix,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[value]`,
        schemaPath: `${context.schemaPath}/values`,
        discriminatorParent: "",
        discriminatorKey: "",
        discriminatorValue: "",
        versionNumber: context.versionNumber,
        hasSseProcedure: context.hasSseProcedure,
        hasWsProcedure: context.hasWsProcedure,
    });
    const typeName = `Record<string, ${innerType.typeName}>`;
    const defaultValue = schema.nullable ? "null" : "{}";
    return {
        typeName: schema.nullable ? `${typeName} | null` : typeName,
        defaultValue,
        validationTemplate(input) {
            const mainPart = `isObject(${input}) && Object.entries(${input}).every(
                ([_, value]) => ${innerType.validationTemplate("value")},
            )`;
            if (schema.nullable) {
                return `((${mainPart}) || ${input} === null)`;
            }
            return mainPart;
        },
        fromJsonTemplate(input, target) {
            return `if (isObject(${input})) {
                ${target} = {};
                for (const [_key, _value] of Object.entries(input.record)) {
                    ${target}Value: ${innerType.typeName};
                    if (typeof _value === 'boolean') {
                        ${target}Value = _value;
                    } else {
                        ${target}Value = false;
                    }
                    ${target}[_key] = ${target}Value;
                }
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target, key) {
            const countVal = `_${validVarName(key)}PropertyCount`;
            if (schema.nullable) {
                return `if (isObject(${input})) {
                    ${target} += '{';
                    let ${countVal} = 0;
                    for (const [_key, _value] of Object.entries(${target})) {
                        if (${countVal} !== 0) {
                            ${target} += ',';
                        }
                        ${target} += \`"\${_key}":\`;
                        ${innerType.toJsonTemplate("_value", target, "_key")}
                        ${countVal}++;
                    }
                    ${target} += '}';
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += '{'
            let ${countVal} = 0;
            for (const [_key, _value] of Object.entries(${target})) {
                if (${countVal} !== 0) {
                    ${target} += ',';
                }
                ${target} += \`"\${_key}":\`;
                ${innerType.toJsonTemplate("_value", target, "_key")};
                ${countVal}++;
            }
            ${target} += '}';
            `;
        },
        toQueryStringTemplate(_, __, ___) {
            return `console.warn('[WARNING] Cannot serialize nested objects to query params. Skipping property at ${context.instancePath}.')`;
        },
        content: innerType.content,
    };
}
