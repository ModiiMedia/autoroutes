import { ArriNativeValidator, ValueError } from '@arrirpc/schema-interface';
import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormValues,
    type Type as JtdType,
    TypeValues,
} from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

function secretSymbol<T extends string>(key: T) {
    return Symbol.for(key) as any as ` Symbol.for(${T})`;
}

export type MaybeNullable<
    T = any,
    TIsNullable extends boolean = false,
> = TIsNullable extends true ? T | null : T;

export interface ValidationContext {
    instancePath: string;
    schemaPath: string;
    errors: ValueError[];
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export function newValidationContext(): ValidationContext {
    return {
        instancePath: '',
        schemaPath: '',
        errors: [],
    };
}

export const validatorKey = secretSymbol('arri/schema/validator/v1');

export interface SchemaValidator<T> {
    output?: T;
    optional?: boolean;
    validate: (input: unknown) => input is T;
    decode: (input: unknown, context: ValidationContext) => T | undefined;
    coerce: (input: unknown, context: ValidationContext) => T | undefined;
    encode: (input: T, context: ValidationContext) => string;
}

export interface SchemaMetadata {
    [key: string]: any;
    id?: string;
    description?: string;
    isDeprecated?: boolean;
}

export interface ASchema<T = any>
    extends ArriNativeValidator<T>,
        StandardSchemaV1<T> {
    metadata?: SchemaMetadata;
    nullable?: boolean;
    [validatorKey]: SchemaValidator<T>;
}
export function isASchema(input: unknown): input is ASchema {
    if (typeof input !== 'object') {
        return false;
    }
    if (!input || !('metadata' in input)) {
        return false;
    }
    if (
        !input.metadata ||
        typeof input.metadata !== 'object' ||
        !(validatorKey in input.metadata) ||
        !input.metadata[validatorKey] ||
        typeof input.metadata[validatorKey] !== 'object'
    ) {
        return false;
    }
    return (
        'parse' in input.metadata[validatorKey] &&
        typeof input.metadata[validatorKey] === 'object'
    );
}

export interface ASchemaOptions {
    id?: string;
    description?: string;
    isDeprecated?: boolean;
}

export type Resolve<T> = T;
export type ResolveObject<T> = Resolve<{ [k in keyof T]: T[k] }>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InferType<TInput extends ASchema<any>> = Resolve<
    TInput[typeof validatorKey]['output']
>;

/**
 * Infer a specific subtype of a discriminated union.
 * In order for this to work you must first infer the union type using `a.infer`
 * Then pass the type result to this
 *
 * @example
 * ```ts
 * const Shape = a.discriminator(
 *   "type",
 *   {
 *     "RECTANGLE": a.object({
 *       width: a.number(),
 *       height: a.number(),
 *     }),
 *     "CIRCLE": a.object({
 *       radius: a.number(),
 *      }),
 *   }
 * );
 *
 * type Shape = a.infer<typeof Shape>;
 * // { type: "RECTANGLE"; width: number; height: number } | { type: "CIRCLE"; radius: number; }
 *
 * type ShapeTypeRectangle = a.infer<Shape, "type", "RECTANGLE">
 * // { type: "RECTANGLE"; width: number; height: number; }
 *
 * type ShapeTypeCircle = a.infer<Shape, "type", "CIRCLE">
 * // { type: "CIRCLE"; radius: number; }
 * ```
 */
export type InferSubType<
    TUnion extends Record<string, any>,
    TKey extends keyof TUnion,
    TVal extends TUnion[TKey],
> = TUnion extends Record<TKey, TVal> ? TUnion : never;

// basic types
export interface AScalarSchema<T extends JtdType | NumberType = any, TVal = any>
    extends ASchema<TVal> {
    type: T;
}
export function isAScalarSchema(input: unknown): input is AScalarSchema {
    return (
        isASchema(input) &&
        'type' in input &&
        typeof input.type === 'string' &&
        (TypeValues.includes(input.type as any) ||
            NumberTypeValues.includes(input.type as any))
    );
}

export const NumberTypeValues = [
    'float32',
    'float64',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
] as const;
export type NumberType = (typeof NumberTypeValues)[number];

// arrays
export interface AArraySchema<TInnerSchema extends ASchema<any> = any>
    extends ASchema<Array<InferType<TInnerSchema>>> {
    elements: TInnerSchema;
}
export function isAAraySchema(input: unknown): input is AArraySchema {
    return isASchema(input) && isSchemaFormElements(input);
}

// string enums
export interface AStringEnumSchema<TValues extends string[]>
    extends ASchema<TValues[number]> {
    enum: TValues;
}
export function isAStringEnumSchema(
    input: unknown,
): input is AStringEnumSchema<any> {
    return isASchema(input) && isSchemaFormEnum(input);
}

// discriminators
export interface ADiscriminatorSchema<T> extends ASchema<T> {
    discriminator: string;
    mapping: Record<string, AObjectSchema<any>>;
}
export function isADiscriminatorSchema(
    input: unknown,
): input is ADiscriminatorSchema<any> {
    return isASchema(input) && isSchemaFormDiscriminator(input);
}

// records
export interface ARecordSchema<
    TInnerSchema extends ASchema<any>,
    TNullable extends boolean = false,
> extends ASchema<
        MaybeNullable<Record<string, InferType<TInnerSchema>>, TNullable>
    > {
    values: TInnerSchema;
}
export function isARecordSchema(
    input: unknown,
): input is ARecordSchema<any, any> {
    return isASchema(input) && isSchemaFormValues(input);
}

// object types
export interface AObjectSchema<TVal = any, TStrict extends boolean = false>
    extends ASchema<TVal> {
    properties: Record<string, ASchema>;
    optionalProperties?: Record<string, ASchema>;
    strict?: TStrict;
}
export function isAObjectSchema(input: unknown): input is AObjectSchema {
    return isASchema(input) && isSchemaFormProperties(input);
}

export interface AObjectSchemaOptions<TAdditionalProps extends boolean = false>
    extends ASchemaOptions {
    /**
     * Allow this object to include additional properties not specified here
     */
    strict?: TAdditionalProps;
}

// object helper types
export type InferObjectOutput<TInput = any> = ResolveObject<
    InferObjectRawType<TInput>
>;

export type InferObjectRawType<TInput> =
    TInput extends Record<any, any>
        ? {
              [TKey in keyof TInput]: TInput[TKey]['metadata'][typeof validatorKey]['optional'] extends true
                  ?
                        | TInput[TKey]['metadata'][typeof validatorKey]['output']
                        | undefined
                  : TInput[TKey]['metadata'][typeof validatorKey]['output'];
          }
        : never;

export function isObject(input: unknown): input is Record<any, any> {
    return typeof input === 'object' && input !== null;
}

// recursive types
export interface ARefSchema<T> extends ASchema<T> {
    ref: string;
}

export function isARefSchema(input: unknown): input is ARefSchema<any> {
    return isASchema(input) && isSchemaFormRef(input);
}
