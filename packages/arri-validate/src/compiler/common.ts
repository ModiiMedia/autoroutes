import { type ASchema } from "../schemas";

export interface TemplateInput<TSchema extends ASchema<any> = any> {
    val: string;
    schema: TSchema;
    instancePath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    subFunctionNames: string[];
    subFunctionBodies: string[];
}
