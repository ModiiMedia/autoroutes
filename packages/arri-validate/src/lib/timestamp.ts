import { type SchemaFormType } from "jtd";
import {
    SCHEMA_METADATA,
    type InputOptions,
    type ScalarTypeSchema,
} from "./typedefs";
import { ValidationError, AVJ } from "./validation";

const schema: SchemaFormType = {
    type: "timestamp",
};

const validator = AVJ.compile(schema);
const isTimestamp = (input: unknown): input is Date => validator(input);
const parser = AVJ.compileParser(schema);
const serializer = AVJ.compileSerializer(schema);

export function timestamp(
    opts: InputOptions = {},
): ScalarTypeSchema<"timestamp", Date> {
    return {
        type: "timestamp",
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: new Date(),
                validate: isTimestamp,
                parse: (input: unknown) => {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isTimestamp(result)) {
                            return result;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }

                    if (isTimestamp(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                coerce: (input: unknown): any => {
                    if (typeof input === "string") {
                        const result = Date.parse(input);
                        if (Number.isNaN(result)) {
                            throw new ValidationError([
                                {
                                    message: "Expected ISO Date String",
                                    data: input,
                                    instancePath: "/",
                                    keyword: "",
                                    params: {},
                                    schemaPath: "",
                                },
                            ]);
                        }
                        return new Date(result);
                    }
                    if (isTimestamp(input)) {
                        return input;
                    }
                    throw new ValidationError([
                        {
                            message: "Invalid date format",
                            data: input,
                            instancePath: "/",
                            schemaPath: "/",
                            keyword: "",
                            params: {},
                        },
                    ]);
                },
                serialize: serializer,
            },
        },
    };
}
