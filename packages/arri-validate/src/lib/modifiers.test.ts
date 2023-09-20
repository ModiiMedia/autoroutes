import * as a from "./_index";

describe("nullable", () => {
    describe("type inference", () => {
        it("infers scalar types", () => {
            const NullableString = a.nullable(a.string());
            type NullableString = a.infer<typeof NullableString>;
            assertType<NullableString>(null);
            assertType<NullableString>("1l2jlka");
            const NullableNumber = a.nullable(a.number());
            type NullableNumber = a.infer<typeof NullableNumber>;
            assertType<NullableNumber>(0);
            assertType<NullableNumber>(null);
            const NullableDate = a.nullable(a.timestamp());
            type NullableDate = a.infer<typeof NullableDate>;
            assertType<NullableDate>(new Date());
            assertType<NullableDate>(null);
            const NullableEnum = a.nullable(
                a.stringEnum(["ADMIN", "STANDARD"]),
            );
            type NullableEnum = a.infer<typeof NullableEnum>;
            assertType<NullableEnum>("ADMIN");
            assertType<NullableEnum>(null);
        });
        it("infers nested types", () => {
            const NullableObject = a.nullable(
                a.object({
                    id: a.string(),
                    name: a.nullable(a.string()),
                    createdAt: a.timestamp(),
                }),
            );
            type NullableObject = a.infer<typeof NullableObject>;
            assertType<NullableObject>({
                id: "12345",
                name: "john doe",
                createdAt: new Date(),
            });
            assertType<NullableObject>({
                id: "12345",
                name: null,
                createdAt: new Date(),
            });
            assertType<NullableObject>(null);
            const NullableArray = a.nullable(a.array(a.number()));
            type NullableArray = a.infer<typeof NullableArray>;
            assertType<NullableArray>([1, 2, 3]);
            assertType<NullableArray>(null);
        });
    });
    const NullableNum = a.nullable(a.number());
    const NullableObject = a.nullable(
        a.object({
            id: a.string(),
            name: a.nullable(a.number()),
            createdAt: a.timestamp(),
        }),
    );
    describe("validation", () => {
        const validateNum = (input: unknown) => a.validate(NullableNum, input);
        const validateObj = (input: unknown) =>
            a.validate(NullableObject, input);

        it("accepts good input", () => {
            expect(validateNum(1));
            expect(validateNum(null));
            expect(
                validateObj({
                    id: "12354",
                    name: "john doe",
                    createdAt: new Date(),
                }),
            );
            expect(
                validateObj({
                    id: "12345",
                    name: null,
                    createdAt: new Date(),
                }),
            );
            expect(validateObj(null));
        });
        it("rejects bad input", () => {
            expect(validateNum(undefined));
            expect(validateNum("12l3123"));
            expect(validateObj(undefined));
            expect(
                validateObj({
                    id: 1,
                    name: "john doe",
                    createdAt: new Date(),
                }),
            );
            expect(
                validateObj({
                    id: null,
                    name: null,
                    createdAt: new Date(),
                }),
            );
        });
    });
    describe("parsing", () => {
        const parseNum = (input: unknown) => a.safeParse(NullableNum, input);
        const parseObject = (input: unknown) =>
            a.safeParse(NullableObject, input);
        it("accepts good input", () => {
            expect(parseNum("1").success);
            expect(parseNum(null).success);
            expect(
                parseObject({
                    id: "12345",
                    name: null,
                    createdAt: new Date(),
                }).success,
            );
            expect(
                parseObject({
                    id: "12345",
                    name: "john doe",
                    createdAt: new Date(),
                }),
            );
            expect(parseObject(null).success);
        });
        it("rejects bad input", () => {
            const numResult = parseNum("hello world");
            expect(!numResult.success && numResult.error.errors.length > 0);
            const objResult = parseObject({
                id: "12355",
                name: undefined,
                createdAt: new Date(),
            });
            expect(!objResult.success && objResult.error.errors.length > 0);
        });
    });
});
