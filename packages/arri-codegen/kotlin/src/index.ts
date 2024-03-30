import fs from "node:fs";
import {
    camelCase,
    pascalCase,
    type ServiceDefinition,
    isServiceDefinition,
    isRpcDefinition,
    type AppDefinition,
    unflattenProcedures,
    defineClientGeneratorPlugin,
    type HttpRpcDefinition,
    type WsRpcDefinition,
} from "arri-codegen-utils";
import {
    isSchemaFormEnum,
    isSchemaFormType,
    type SchemaFormEnum,
    type Schema,
    isSchemaFormProperties,
    type SchemaFormProperties,
    isSchemaFormElements,
    type SchemaFormElements,
    type SchemaFormDiscriminator,
    type SchemaFormValues,
    isSchemaFormValues,
    isSchemaFormDiscriminator,
    isSchemaFormRef,
    type SchemaFormRef,
} from "jtd-utils";

export interface ServiceContext {
    clientName: string;
    modelPrefix?: string;
}

export interface KotlinClientOptions {
    clientName?: string;
    modelPrefix?: string;
    outputFile: string;
}

export const kotlinClientGenerator = defineClientGeneratorPlugin(
    (options: KotlinClientOptions) => {
        return {
            generator(def) {
                const client = kotlinClientFromDef(def, options);
                fs.writeFileSync(options.outputFile, client);
            },
            options,
        };
    },
);

// CLIENT GENERATION
export function kotlinClientFromDef(
    def: AppDefinition,
    options: KotlinClientOptions,
) {
    const clientName = options.clientName ?? "Client";
    const modelPrefix = options.modelPrefix ?? "";
    const serviceDefs = unflattenProcedures(def.procedures);
    const services: { key: string; name: string; content: string }[] = [];
    const rpcParts: string[] = [];
    const modelParts: string[] = [];

    for (const key of Object.keys(serviceDefs)) {
        const subDef = serviceDefs[key];
        if (isServiceDefinition(subDef)) {
            const service = kotlinServiceFromDef(key, subDef, {
                clientName,
                modelPrefix,
            });
            services.push({
                key: camelCase(key, { normalize: true }),
                name: pascalCase(key, { normalize: true }),
                content: service,
            });
            continue;
        }
        if (isRpcDefinition(subDef)) {
            const rpcName = camelCase(key, { normalize: true });
            if (subDef.transport === "http") {
                const rpc = kotlinHttpRpcFromDef(rpcName, subDef, {
                    clientName,
                    modelPrefix,
                });
                rpcParts.push(rpc);
            }
        }
    }
    const generatedTypes: string[] = [];
    for (const key of Object.keys(def.models)) {
        const model = def.models[key]!;
        const modelResult = kotlinPropertyFromSchema(model, {
            generatedTypes,
            modelPrefix: options.modelPrefix ?? "",
            instancePath: model.metadata?.id ?? key,
            schemaPath: "",
        });
        if (modelResult.content) {
            modelParts.push(modelResult.content);
        }
    }
    return `// this file was autogenerated by Arri. Do not modify directly.
// See details at https://github.com/modiimedia/arri
${importSection}

val JsonInstance = Json { ignoreUnknownKeys = true }

class ${clientName}(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
${services
    .map(
        (service) =>
            `    val ${service.key} = ${pascalCase(
                `${clientName}_${service.name}_service`,
                { normalize: true },
            )}(httpClient, baseUrl, headers)`,
    )
    .join("\n")}
${rpcParts.join("\n")}
}

${services.map((service) => service.content).join("\n\n")}

${modelParts.join("\n")}

${utilityFunctionParts(clientName, def.info?.version)}`;
}

// SERVICE GENERATION
export function kotlinServiceFromDef(
    name: string,
    def: ServiceDefinition,
    context: ServiceContext,
): string {
    const subServices: { key: string; name: string; content: string }[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(def)) {
        const subDef = def[key]!;
        if (isServiceDefinition(subDef)) {
            const subServiceName = pascalCase(`${name}_${key}`);
            subServices.push({
                key: camelCase(key, { normalize: true }),
                name: subServiceName,
                content: kotlinServiceFromDef(subServiceName, subDef, context),
            });
            continue;
        }
        if (isRpcDefinition(subDef)) {
            if (subDef.transport === "http") {
                rpcParts.push(
                    kotlinHttpRpcFromDef(
                        camelCase(key, { normalize: true }),
                        subDef,
                        context,
                    ),
                );
                continue;
            }
            console.warn(
                `[kotlin-codegen] WARNING unsupported transport type "${subDef.transport}"`,
            );
            if (subDef.transport === "ws") {
                rpcParts.push(
                    kotlinWsRpcFromDef(
                        camelCase(key, { normalize: true }),
                        subDef,
                        context,
                    ),
                );
                continue;
            }
            continue;
        }
    }

    const finalName = pascalCase(`${context.clientName}_${name}_service`, {
        normalize: true,
    });
    return `class ${finalName}(
    private val httpClient: HttpClient,
    private val baseUrl: String = "",
    private val headers: Map<String, String> = mutableMapOf(),
) {
${subServices
    .map((service) => {
        const subServiceName = pascalCase(
            `${context.clientName}_${service.name}_Service`,
            { normalize: true },
        );
        return `    val ${service.key} = ${subServiceName}(httpClient, baseUrl, headers)`;
    })
    .join("\n")}
${rpcParts.join("\n")}
}

${subServices.map((service) => service.content).join("\n\n")}`;
}

// RPC GENERATION
export function kotlinWsRpcFromDef(
    name: string,
    def: WsRpcDefinition,
    context: ServiceContext,
): string {
    return "";
}
export function kotlinHttpRpcFromDef(
    name: string,
    def: HttpRpcDefinition,
    context: ServiceContext,
): string {
    const paramType: string | undefined = def.params
        ? (pascalCase(`${context.modelPrefix ?? ""}_${def.params}`, {
              normalize: true,
          }) as string)
        : undefined;
    const returnType: string | undefined = def.response
        ? (pascalCase(`${context.modelPrefix ?? ""}_${def.response}`, {
              normalize: true,
          }) as string)
        : undefined;

    if (def.isEventStream) {
        return `    fun ${name}(
        scope: CoroutineScope,${
            paramType ? `\n        params: ${paramType},` : ""
        }
        lastEventId: String? = null,
        bufferCapacity: Int = 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onError: ((error: ${context.clientName}Error) -> Unit) = {},
        onConnectionError: ((error: ${context.clientName}Error) -> Unit) = {},
        onData: ((data: ${returnType ?? "null"}) -> Unit) = {},
    ): Job {
        val finalHeaders = mutableMapOf<String, String>()
        for (item in headers.entries) {
            finalHeaders[item.key] = item.value
        }
        finalHeaders["Accept"] = "application/json, text/event-stream"
        val job = scope.launch {
            handleSseRequest(
                scope = scope,
                httpClient = httpClient,
                url = "$baseUrl${def.path}",
                method = HttpMethod.${pascalCase(def.method, {
                    normalize: true,
                })},
                params = ${
                    paramType
                        ? `JsonInstance.encodeToJsonElement<${paramType}>(params)`
                        : "null"
                },
                headers = finalHeaders,
                backoffTime = 0,
                maxBackoffTime = 32000,
                lastEventId = lastEventId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onError = onError,
                onConnectionError = onConnectionError,
                onData = { str -> 
                    val data = ${
                        returnType
                            ? `JsonInstance.decodeFromString<${returnType}>(str)`
                            : `null`
                    }
                    onData(data)
                },
            )
        }
        return job
    }`;
    }

    return `    suspend fun ${name}(${
        paramType ? `params: ${paramType}` : ""
    }): ${returnType ?? "Unit"} {
        val response = prepareRequest(
            client = httpClient,
            url = "$baseUrl${def.path}",
            method = HttpMethod.${pascalCase(def.method)},
            params = ${
                paramType
                    ? `JsonInstance.encodeToJsonElement<${paramType}>(params)`
                    : "null"
            },
            headers = headers,
        ).execute()
        if (response.status.value in 200..299) {
            ${
                returnType
                    ? `return JsonInstance.decodeFromString<${returnType}>(response.body())`
                    : "return"
            }
        }
        val err = JsonInstance.decodeFromString<${context.clientName}Error>(response.body())
        throw err
    }`;
}

// MODEL GENERATION

export interface ModelContext {
    modelPrefix: string;
    generatedTypes: string[];
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    discriminatorParent?: string;
}

export interface KotlinProperty {
    dataType: string;
    annotation?: string;
    content?: string;
    comparisonTemplate: (key: string, optional: boolean) => string;
    hashTemplate: (key: string, nullable: boolean) => string;
}

function defaultComparisonTemplate(key: string, optional: boolean) {
    return `        if (${key} != other.${key}) return false`;
}

function defaultHashTemplate(key: string, nullable: boolean) {
    if (nullable) {
        return `(${key}?.hashCode() ?: 0)`;
    }
    return `${key}.hashCode()`;
}

export function kotlinPropertyFromSchema(
    schema: Schema,
    context: ModelContext,
): KotlinProperty {
    if (isSchemaFormType(schema)) {
        let dataType = "";
        let annotation: undefined | string;
        let comparison = defaultComparisonTemplate;
        switch (schema.type) {
            case "string":
                dataType = "String";
                break;
            case "boolean":
                dataType = "Boolean";
                break;
            case "float32":
                dataType = "Float";
                break;
            case "float64":
                dataType = "Double";
                break;
            case "int8":
                dataType = "Byte";
                break;
            case "int16":
                dataType = "Short";
                break;
            case "int32":
                dataType = "Int";
                break;
            case "int64":
                dataType = "Long";
                break;
            case "timestamp":
                dataType = "Instant";
                annotation =
                    "@Serializable(with = InstantAsStringSerializer::class)";
                comparison = (key, optional) => {
                    if ((schema.nullable ?? false) || optional) {
                        return `        if(${key}?.toEpochMilli() != other.${key}?.toEpochMilli()) return false`;
                    }
                    return `        if (${key}.toEpochMilli() != other.${key}.toEpochMilli()) return false`;
                };
                break;
            case "uint8":
                dataType = "UByte";
                break;
            case "uint16":
                dataType = "UShort";
                break;
            case "uint32":
                dataType = "UInt";
                break;
            case "uint64":
                dataType = "ULong";
                break;
        }
        return {
            dataType: `${dataType}${schema.nullable ? "?" : ""}`,
            annotation,
            comparisonTemplate: comparison,
            hashTemplate: defaultHashTemplate,
        };
    }

    if (isSchemaFormEnum(schema)) {
        return kotlinEnumFromSchema(schema, context);
    }

    if (isSchemaFormProperties(schema)) {
        return kotlinClassFromSchema(schema, context);
    }

    if (isSchemaFormDiscriminator(schema)) {
        return kotlinSealedClassedFromSchema(schema, context);
    }

    if (isSchemaFormElements(schema)) {
        return kotlinArrayFromSchema(schema, context);
    }

    if (isSchemaFormValues(schema)) {
        return kotlinMapFromSchema(schema, context);
    }

    if (isSchemaFormRef(schema)) {
        return kotlinRefFromSchema(schema, context);
    }

    return {
        dataType: `JsonElement${schema.nullable ? "?" : ""}`,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinEnumFromSchema(
    schema: SchemaFormEnum,
    context: ModelContext,
): KotlinProperty {
    const name = pascalCase(
        schema.metadata?.id ?? context.instancePath.split("/").join("_"),
    );
    const parts: string[] = [];
    for (const opt of schema.enum) {
        parts.push(
            `    @SerialName("${opt}")\n    ${pascalCase(opt, {
                normalize: true,
            })},`,
        );
    }
    let content: string | undefined;
    if (!context.generatedTypes.includes(name)) {
        content = `enum class ${name}() {
${parts.join("\n")}
}`;
        context.generatedTypes.push(name);
    }

    return {
        dataType: schema.nullable ? `${name}?` : name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinClassFromSchema(
    schema: SchemaFormProperties,
    context: ModelContext,
): KotlinProperty {
    let name = pascalCase(
        `${context.modelPrefix}_${
            schema.metadata?.id ?? context.instancePath.split("/").join("_")
        }`,
        {
            normalize: true,
        },
    ) as string;
    const annotationParts = ["@Serializable"];
    if (context.discriminatorKey && context.discriminatorValue) {
        annotationParts.push(`@SerialName("${context.discriminatorValue}")`);
        name = pascalCase(
            `${context.modelPrefix}_${
                schema.metadata?.id ??
                `${context.instancePath.split("/").join("_")}_${
                    context.discriminatorValue
                }`
            }`,
            {
                normalize: true,
            },
        );
    }
    const subContentParts: string[] = [];
    const constructorParts: string[] = [];
    const equalsFnParts: string[] = [];
    const hashParts: string[] = [];
    let needsAdditionalMethods = false;
    for (const key of Object.keys(schema.properties)) {
        let camelCaseKey = camelCase(key);
        // object is a reserved keyword
        if (camelCaseKey === "object") {
            camelCaseKey = `_object`;
        }
        const propSchema = schema.properties[key]!;
        const prop = kotlinPropertyFromSchema(propSchema, {
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            generatedTypes: context.generatedTypes,
            modelPrefix: context.modelPrefix,
        });
        if (isSchemaFormType(propSchema) && propSchema.type === "timestamp") {
            needsAdditionalMethods = true;
        }
        const annotations: string[] = [];
        if (prop.annotation) {
            annotations.push(`    ${prop.annotation}`);
        }
        if (camelCaseKey !== key) {
            annotations.push(`    @SerialName("${key}")`);
        }
        if (annotations.length) {
            constructorParts.push(
                `${annotations.join("\n")}\n    val ${camelCaseKey}: ${
                    prop.dataType
                },`,
            );
        } else {
            constructorParts.push(`    val ${camelCaseKey}: ${prop.dataType},`);
        }
        equalsFnParts.push(prop.comparisonTemplate(camelCaseKey, false));
        if (hashParts.length) {
            hashParts.push(
                `        result = 31 * result + ${prop.hashTemplate(
                    camelCaseKey,
                    propSchema.nullable ?? false,
                )}`,
            );
        } else {
            hashParts.push(
                `        var result = ${prop.hashTemplate(
                    camelCaseKey,
                    propSchema.nullable ?? false,
                )}`,
            );
        }
        if (prop.content) {
            subContentParts.push(prop.content);
        }
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            let camelCaseKey = camelCase(key);
            // object is a reserved keyword
            if (camelCaseKey === "object") {
                camelCaseKey = "_object";
            }
            const propSchema = schema.optionalProperties[key]!;
            const prop = kotlinPropertyFromSchema(propSchema, {
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/properties/${key}`,
                generatedTypes: context.generatedTypes,
                modelPrefix: context.modelPrefix,
            });
            if (
                isSchemaFormType(propSchema) &&
                propSchema.type === "timestamp"
            ) {
                needsAdditionalMethods = true;
            }

            const annotations: string[] = [];
            if (prop.annotation) {
                annotations.push(`    ${prop.annotation}`);
            }
            if (key !== camelCaseKey) {
                annotations.push(`    @SerialName("${key}")`);
            }
            const finalType = prop.dataType.endsWith("?")
                ? prop.dataType
                : `${prop.dataType}?`;
            if (annotations.length) {
                constructorParts.push(
                    `${annotations.join(
                        "\n",
                    )}\n    val ${camelCaseKey}: ${finalType} = null,`,
                );
            } else {
                constructorParts.push(
                    `    val ${camelCaseKey}: ${finalType} = null,`,
                );
            }
            equalsFnParts.push(prop.comparisonTemplate(camelCaseKey, true));
            if (hashParts.length) {
                hashParts.push(
                    `        result = 31 * result + ${prop.hashTemplate(
                        camelCaseKey,
                        true,
                    )}`,
                );
            } else {
                hashParts.push(
                    `        var result = ${prop.hashTemplate(
                        camelCaseKey,
                        true,
                    )}`,
                );
            }
            if (prop.content) {
                subContentParts.push(prop.content);
            }
        }
    }
    let content: string | undefined;
    if (!context.generatedTypes.includes(name)) {
        const equalsFn = `    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ${name}

${equalsFnParts.join("\n")}

        return true
    }`;
        const hashFn = `    override fun hashCode(): Int {
${hashParts.join("\n")}
        return result
    }`;

        content = `${annotationParts.join("\n")}
data class ${name}(
${constructorParts.join("\n")}
)${context.discriminatorParent ? ` : ${context.discriminatorParent}()` : ""}${
            needsAdditionalMethods
                ? ` {
${equalsFn}

${hashFn}
}`
                : ""
        }

${subContentParts.join("\n")}`;
        context.generatedTypes.push(name);
    }

    return {
        dataType: schema.nullable ? `${name}?` : name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinArrayFromSchema(
    schema: SchemaFormElements,
    context: ModelContext,
): KotlinProperty {
    const subType = kotlinPropertyFromSchema(schema.elements, {
        instancePath: `${context.instancePath}/Item`,
        schemaPath: `${context.schemaPath}/elements`,
        generatedTypes: context.generatedTypes,
        modelPrefix: context.modelPrefix,
    });
    const dataType = schema.nullable
        ? `List<${subType.dataType}>?`
        : `List<${subType.dataType}>`;
    return {
        dataType,
        content: subType.content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate(key, nullable) {
            if (nullable) {
                return `(${key}?.hashCode() ?: 0)`;
            }
            return `${key}.hashCode()`;
        },
    };
}

export function kotlinSealedClassedFromSchema(
    schema: SchemaFormDiscriminator,
    context: ModelContext,
): KotlinProperty {
    const name = pascalCase(
        `${context.modelPrefix}_${
            schema.metadata?.id ?? context.instancePath.split("/").join("_")
        }`,
    ) as string;
    const subContentParts: string[] = [];
    for (const discriminatorVal of Object.keys(schema.mapping)) {
        const mappingSchema = schema.mapping[discriminatorVal]!;
        const mapping = kotlinClassFromSchema(mappingSchema, {
            generatedTypes: context.generatedTypes,
            instancePath: `${context.instancePath}`,
            schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
            discriminatorValue: discriminatorVal,
            discriminatorKey: schema.discriminator,
            discriminatorParent: name,
            modelPrefix: context.modelPrefix,
        });
        if (mapping.content) {
            subContentParts.push(mapping.content);
        }
    }

    let content: string | undefined;
    if (!context.generatedTypes.includes(name)) {
        content = `@Serializable
sealed class ${name}()

${subContentParts.join("\n\n")}`;
        context.generatedTypes.push(name);
    }

    return {
        dataType: schema.nullable ? `${name}?` : name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinMapFromSchema(
    schema: SchemaFormValues,
    context: ModelContext,
): KotlinProperty {
    const subType = kotlinPropertyFromSchema(schema.values, {
        instancePath: `${context.instancePath}/Value`,
        schemaPath: `${context.schemaPath}/values`,
        generatedTypes: context.generatedTypes,
        modelPrefix: context.modelPrefix,
    });
    const dataType = `Map<String, ${subType.dataType}>${
        schema.nullable ? "?" : ""
    }`;
    return {
        dataType,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
        content: subType.content,
    };
}

export function kotlinRefFromSchema(
    schema: SchemaFormRef,
    context: ModelContext,
): KotlinProperty {
    const typeName = pascalCase(schema.ref, { normalize: true });
    const dataType = `${typeName}${schema.nullable ? "?" : ""}`;
    return {
        dataType,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultComparisonTemplate,
        content: "",
    };
}

const importSection = `import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import java.nio.ByteBuffer
import java.time.Instant`;

const utilityFunctionParts = (
    clientName: string,
    version?: string,
) => `@Serializable
data class ${clientName}Error(
    val code: Int,
    override val message: String,
    val data: JsonElement? = null,
    val stack: List<String>? = null,
): Exception()

object InstantAsStringSerializer : KSerializer<Instant> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): Instant {
        return Instant.parse(decoder.decodeString())
    }

    override fun serialize(encoder: Encoder, value: Instant) {
        return encoder.encodeString(value.toString())
    }
}

private suspend fun prepareRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String>?,
): HttpStatement {
    var finalUrl = url
    var finalBody = ""
    when (method) {
        HttpMethod.Get, HttpMethod.Head -> {
            val queryParts = mutableListOf<String>()
            params?.jsonObject?.entries?.forEach {
                queryParts.add("\${it.key}=\${it.value}")
            }
            finalUrl = "$finalUrl?\${queryParts.joinToString("&")}"
        }

        HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete -> {
            finalBody = params?.toString() ?: ""
        }
    }
    val builder = HttpRequestBuilder()
    builder.method = method
    builder.url(finalUrl)
    builder.timeout {
        requestTimeoutMillis = 10 * 60 * 1000
    }
    ${version ? `builder.headers["client-version"] = "${version}"` : ""}
    if (headers != null) {
        for (entry in headers.entries) {
            builder.headers[entry.key] = entry.value
        }
    }
    if (method != HttpMethod.Get && method != HttpMethod.Head) {
        builder.setBody(finalBody)
    }
    return client.prepareRequest(builder)
}

private fun parseSseEvent(input: String): SseEvent {
    val lines = input.split("\\n")
    var id: String? = null
    var event: String? = null
    var data: String = ""
    for (line in lines) {
        if (line.startsWith("id: ")) {
            id = line.substring(3).trim()
            continue
        }
        if (line.startsWith("event: ")) {
            event = line.substring(6).trim()
            continue
        }
        if (line.startsWith("data: ")) {
            data = line.substring(5).trim()
            continue
        }
    }
    return SseEvent(id, event, data)
}

private class SseEvent(val id: String? = null, val event: String? = null, val data: String)

private fun parseSseEvents(input: String): List<SseEvent> {
    val inputs = input.split("\\n\\n")
    val events = mutableListOf<SseEvent>()
    for (item in inputs) {
        if (item.contains("data: ")) {
            events.add(parseSseEvent(item))
        }
    }
    return events
}


private suspend fun handleSseRequest(
    scope: CoroutineScope,
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String> = mutableMapOf(),
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onError: ((error: ${clientName}Error) -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onConnectionError: ((error: ${clientName}Error) -> Unit) = {},
    bufferCapacity: Int,
) {
    val finalHeaders = mutableMapOf<String, String>();
    for (entry in headers.entries) {
        finalHeaders[entry.key] = entry.value
    }
    var lastId = lastEventId
    // exponential backoff maxing out at 32 seconds
    if (backoffTime > 0) {
        withContext(scope.coroutineContext) {
            Thread.sleep(backoffTime)
        }
    }
    val newBackoffTime =
        if (backoffTime == 0L) 2L else if (backoffTime * 2L >= maxBackoffTime) maxBackoffTime else backoffTime * 2L
    if (lastId != null) {
        finalHeaders["Last-Event-ID"] = lastId.toString()
    }
    val request = prepareRequest(
        client = httpClient,
        url = url,
        method = HttpMethod.Get,
        params = params,
        headers = finalHeaders,
    )
    try {
        request.execute { httpResponse ->

            onOpen(httpResponse)
            if (httpResponse.status.value != 200) {

                onConnectionError(
                    ${clientName}Error(
                        code = httpResponse.status.value,
                        message = "Error fetching stream",
                        data = JsonInstance.encodeToJsonElement(httpResponse),
                        stack = null,
                    )
                )
                handleSseRequest(
                    scope = scope,
                    httpClient = httpClient,
                    url = url,
                    method = method,
                    params = params,
                    headers = headers,
                    backoffTime = newBackoffTime,
                    maxBackoffTime = maxBackoffTime,
                    lastEventId = lastId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onError = onError,
                    onData = onData,
                    onConnectionError = onConnectionError,
                )
                return@execute
            }
            val channel: ByteReadChannel = httpResponse.bodyAsChannel()
            while (!channel.isClosedForRead) {
                val buffer = ByteBuffer.allocateDirect(bufferCapacity)
                val read = channel.readAvailable(buffer)
                if (read == -1) break;
                buffer.flip()
                val input = Charsets.UTF_8.decode(buffer).toString()
                val events = parseSseEvents(input)
                for (event in events) {
                    if (event.id != null) {
                        lastId = event.id
                    }
                    when (event.event) {
                        "message" -> {
                            onData(event.data)
                        }

                        "done" -> {
                            onClose()
                            return@execute
                        }

                        "error" -> {
                            val error = JsonInstance.decodeFromString<${clientName}Error>(event.data)
                            onError(error)
                        }

                        else -> {}
                    }
                }
            }
        }
    } catch (e: java.net.ConnectException) {
        onConnectionError(
            ${clientName}Error(
                code = 503,
                message = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e),
                stack = e.stackTraceToString().split("\\n"),
            )
        )
        handleSseRequest(
            scope = scope,
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
        return
    } catch (e: Exception) {
        onConnectionError(
            ${clientName}Error(
                code = 503,
                message = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonInstance.encodeToJsonElement(e),
                stack = e.stackTraceToString().split("\\n"),
            )
        )
        handleSseRequest(
            scope = scope,
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
    }
}`;
