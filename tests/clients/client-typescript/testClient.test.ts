import { ArriRequestError } from "arri-client";
import { ofetch } from "ofetch";
import {
    TestClient,
    type ObjectWithEveryType,
    type ObjectWithEveryOptionalType,
    type ObjectWithEveryNullableType,
} from "./testClient.rpc";

const baseUrl = "http://127.0.0.1:2020";
const headers = {
    "x-test-header": "test",
};

const client = new TestClient({
    baseUrl,
    headers,
});
const unauthenticatedClient = new TestClient({
    baseUrl,
});
test("posts.getPost", async () => {
    const result = await client.posts.getPost({ postId: "1" });
    expect(result.id).toBe("1");
});

test("posts.getPosts", async () => {
    const result = await client.posts.getPosts({ limit: 50 });
    expect(result.items.length).toBe(50);
    const result2 = await client.posts.getPosts({ limit: 100, type: "video" });
    expect(result2.items.length).toBe(100);
    for (const item of result2.items) {
        expect(item.type).toBe("video");
    }
    try {
        await client.posts.getPosts({ limit: 1000 });
        expect(false);
    } catch (err) {
        expect(err !== undefined);
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(400);
        }
    }
});

test("posts.updatePost", async () => {
    const result = await client.posts.updatePost({
        postId: "1",
        data: {
            title: "Hello world",
            description: null,
            content: "Hello world 2.0",
            tags: ["1", "2", "3"],
        },
    });
    expect(result.id).toBe("1");
    expect(result.title).toBe("Hello world");
    expect(result.description).toBe(null);
    expect(result.content).toBe("Hello world 2.0");
    expect(result.tags.length).toBe(3);
    expect(result.tags[0]).toBe("1");
    expect(result.tags[1]).toBe("2");
    expect(result.tags[2]).toBe("3");

    const result2 = await client.posts.updatePost({
        postId: "1",
        data: {
            title: "hi",
        },
    });
    expect(result2.id).toBe("1");
    expect(result2.title).toBe("hi");
});

test("post.logEvent()", async () => {
    const createResult = await client.posts.logEvent({
        eventType: "POST_CREATED",
        postId: "1",
        timestamp: new Date(),
    });
    expect(createResult.success);
    const deleteResult = await client.posts.logEvent({
        eventType: "POST_DELETED",
        postId: "1",
        timestamp: new Date(),
    });
    expect(deleteResult.success);
    const updateResult = await client.posts.logEvent({
        eventType: "POST_UPDATED",
        postId: "1",
        timestamp: new Date(),
        data: {
            title: "Hello World",
            tags: ["1", "2"],
            updatedAt: new Date(),
        },
    });
    expect(updateResult.success);
});

test("unauthenticated request", async () => {
    try {
        await unauthenticatedClient.posts.getPost({
            postId: "1",
        });
        expect(false);
    } catch (err) {
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(401);
        }
    }
});

test("route request", async () => {
    const result = await ofetch("/routes/authors/12345", {
        method: "post",
        baseURL: baseUrl,
        headers,
        body: {
            name: "John Doe",
        },
    });
    expect(result.id).toBe("12345");
    expect(result.name).toBe("John Doe");
});

describe("miscTests", () => {
    const input: ObjectWithEveryType = {
        any: {
            blah: "blah",
            blah2: "blah2",
            blah3: true,
        },
        boolean: true,
        string: "hello world",
        timestamp: new Date(),
        float32: 0,
        float64: 0,
        int8: 0,
        uint8: 0,
        int16: 0,
        uint16: 0,
        int32: 0,
        uint32: 0,
        int64: 0n,
        uint64: 0n,
        enumerator: "B",
        array: [true, false, false],
        object: {
            string: "",
            boolean: false,
            timestamp: new Date(),
        },
        record: {
            A: true,
            B: false,
        },
        discriminator: {
            type: "B",
            title: "Hello World",
            description: "",
        },
        nestedObject: {
            id: "",
            timestamp: new Date(),
            data: {
                id: "",
                timestamp: new Date(),
                data: {
                    id: "",
                    timestamp: new Date(),
                },
            },
        },
        nestedArray: [
            [
                { id: "", timestamp: new Date() },
                { id: "", timestamp: new Date() },
            ],
        ],
    };
    test("sendObject()", async () => {
        const input: ObjectWithEveryType = {
            any: {
                blah: "blah",
                blah2: "blah2",
                blah3: true,
            },
            boolean: true,
            string: "hello world",
            timestamp: new Date(),
            float32: 0,
            float64: 0,
            int8: 0,
            uint8: 0,
            int16: 0,
            uint16: 0,
            int32: 0,
            uint32: 0,
            int64: 0n,
            uint64: 0n,
            enumerator: "B",
            array: [true, false, false],
            object: {
                string: "",
                boolean: false,
                timestamp: new Date(),
            },
            record: {
                A: true,
                B: false,
            },
            discriminator: {
                type: "B",
                title: "Hello World",
                description: "",
            },
            nestedObject: {
                id: "",
                timestamp: new Date(),
                data: {
                    id: "",
                    timestamp: new Date(),
                    data: {
                        id: "",
                        timestamp: new Date(),
                    },
                },
            },
            nestedArray: [
                [
                    { id: "", timestamp: new Date() },
                    { id: "", timestamp: new Date() },
                ],
            ],
        };
        const result = await client.miscTests.sendObject(input);
        expect(result).toStrictEqual(input);
    });
    test("sendPartialObject()", async () => {
        const fullObjectResult =
            await client.miscTests.sendPartialObject(input);
        expect(fullObjectResult).toStrictEqual(input);
        const partialInput: ObjectWithEveryOptionalType = {
            string: "",
            int16: 0,
            int64: 0n,
        };
        const partialObjectResult =
            await client.miscTests.sendPartialObject(partialInput);
        expect(partialObjectResult).toStrictEqual(partialInput);
    });
    test("sendObjectWithNullableFields", async () => {
        const fullObjectResult =
            await client.miscTests.sendObjectWithNullableFields(input);
        expect(fullObjectResult).toStrictEqual(input);
        const nullableInput: ObjectWithEveryNullableType = {
            any: null,
            boolean: null,
            string: null,
            timestamp: null,
            float32: null,
            float64: null,
            int8: null,
            uint8: null,
            int16: null,
            uint16: null,
            int32: null,
            uint32: null,
            int64: null,
            uint64: null,
            enumerator: null,
            array: null,
            object: null,
            record: null,
            discriminator: null,
            nestedObject: {
                id: null,
                timestamp: null,
                data: {
                    id: null,
                    timestamp: null,
                    data: null,
                },
            },
            nestedArray: [null],
        };
        const nullableResult =
            await client.miscTests.sendObjectWithNullableFields(nullableInput);
        expect(nullableResult).toStrictEqual(nullableInput);
    });
});

test("unauthorized route request", async () => {
    try {
        await ofetch("/routes/authors/12345", {
            method: "post",
            baseURL: baseUrl,
            body: {
                name: "John Doe",
            },
        });
    } catch (err) {
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(401);
        }
    }
});

describe("bigint requests", () => {
    test("get request", async () => {
        const result = await client.videos.getAnnotation({
            id: "100",
            version: "1",
        });
        expect(result.annotation_id.id).toBe("100");
        expect(result.annotation_id.version).toBe("1");
    });
    test("post request", async () => {
        const result = await client.videos.updateAnnotation({
            annotation_id: "12345",
            annotation_id_version: "2",
            data: {
                box_type_range: {
                    start_time_in_nano_sec: BigInt("123456789"),
                    end_time_in_nano_sec: BigInt("1234567890"),
                },
            },
        });
        expect(result.annotation_id.id).toBe("12345");
        expect(result.annotation_id.version).toBe("2");
        expect(result.box_type_range.start_time_in_nano_sec).toBe(
            BigInt("123456789"),
        );
        expect(result.box_type_range.end_time_in_nano_sec).toBe(
            BigInt("1234567890"),
        );
    });
});
