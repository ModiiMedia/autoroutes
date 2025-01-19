export interface StandardSchemaV1<Input = unknown, Output = Input> {
    /**
     * The Standard Schema properties.
     */
    readonly '~standard': Props<Input, Output>;
}

export interface StandardSchemaV1With<
    K extends PropMethodKeys,
    Input = unknown,
    Output = Input,
> {
    readonly '~standard': RequireKeys<Props<Input, Output>, K>;
}

export interface StandardSchemaAll<Input = unknown, Output = Input> {
    readonly '~standard': Required<Omit<Props<Input, Output>, 'types'>> & {
        types?: Types<Input, Output>;
    };
}

type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> &
    Omit<T, K>;

type PropMethodKeys = keyof Omit<Props, 'version' | 'vendor' | 'validate'>;

/**
 * The Standard Schema properties interface.
 */
export interface Props<Input = unknown, Output = Input> {
    /**
     * The version number of the standard.
     */
    readonly version: 1;
    /**
     * The vendor name of the schema library.
     */
    readonly vendor: string;
    /**
     * Validates unknown input values.
     */
    readonly validate: (
        value: unknown,
    ) => Result<Output> | Promise<Result<Output>>;
    /**
     * Inferred types associated with the schema.
     */
    readonly types?: Types<Input, Output> | undefined;

    /**
     * A type guard
     */
    readonly isType?: (value: unknown) => value is Output;

    /**
     * Encode to JSON
     */
    readonly encodeJSON?: (value: Output) => Result<string>;

    /**
     * Create a JSON Schema from the input schema
     */
    readonly toJSONSchema?: () => any;
}

/**
 * The result interface of the validate function.
 */
export type Result<Output> = SuccessResult<Output> | FailureResult;

/**
 * The result interface if validation succeeds.
 */
export interface SuccessResult<Output> {
    /**
     * The typed output value.
     */
    readonly value: Output;
    /**
     * The non-existent issues.
     */
    readonly issues?: undefined;
}

/**
 * The result interface if validation fails.
 */
export interface FailureResult {
    /**
     * The issues of failed validation.
     */
    readonly issues: ReadonlyArray<Issue>;
}

/**
 * The issue interface of the failure output.
 */
export interface Issue {
    /**
     * The error message of the issue.
     */
    readonly message: string;
    /**
     * The path of the issue, if any.
     */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
}

/**
 * The path segment interface of the issue.
 */
export interface PathSegment {
    /**
     * The key representing a path segment.
     */
    readonly key: PropertyKey;
}

/**
 * The Standard Schema types interface.
 */
export interface Types<Input = unknown, Output = Input> {
    /**
     * The input type of the schema.
     */
    readonly input: Input;
    /**
     * The output type of the schema.
     */
    readonly output: Output;
}

/**
 * Infers the input type of a Standard Schema.
 */
export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
    Schema['~standard']['types']
>['input'];

/**
 * Infers the output type of a Standard Schema.
 */
export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
    Schema['~standard']['types']
>['output'];

// biome-ignore lint/complexity/noUselessEmptyExport: needed for granular visibility control of TS namespace
export {};
