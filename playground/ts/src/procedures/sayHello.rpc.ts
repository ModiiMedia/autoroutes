import { a } from "../../../../languages/ts/ts-schema/dist";
import { defineRpc } from "@arrirpc/server";

export default defineRpc({
    method: "post",
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    handler({ params }) {
        return {
            message: `Hello ${params.name}`,
        };
    },
});
