import { H3Event, RouterMethod, send, sendError, setResponseStatus } from "h3";
import { AnyZodObject, ZodTypeAny } from "zod";
import { ExtractParams } from "./utils";
import { zh } from "h3-zod";
import { defineError, isH3Error } from "./errors";

export interface RouteEventContext<
    Params extends Record<string, string> = any,
    Body = any,
    Query = any,
    Response = any
> {
    params?: Params;
    body?: Body;
    query?: Query;
    response?: Response;
}

export interface RouteEvent<Context extends RouteEventContext> extends H3Event {
    context: Context;
}

export type ArriRouteHandler<
    Params extends Record<string, string>,
    Body,
    Query,
    Response
> = (
    event: RouteEvent<RouteEventContext<Params, Body, Query>>
) => Response | Promise<Response>;

export interface ArriRoute<
    Path extends string = "",
    Method extends RouterMethod = "get",
    Body extends undefined | ZodTypeAny = undefined,
    Query extends undefined | AnyZodObject = undefined,
    Response = any
> {
    id?: string;
    path: Path;
    method: Method;
    schema?: {
        body?: Body;
        query?: Query;
    };
    handler: ArriRouteHandler<
        ExtractParams<Path>,
        Body extends ZodTypeAny ? Body["_type"] : undefined,
        Query extends AnyZodObject ? Query["_type"] : undefined,
        Response
    >;
    postHandler?: (
        event: RouteEvent<
            RouteEventContext<
                ExtractParams<Path>,
                Body extends ZodTypeAny ? Body["_type"] : undefined,
                Query extends AnyZodObject ? Query["_type"] : undefined,
                Response
            >
        >
    ) => any;
}

export const defineRoute = <
    Path extends string,
    Method extends RouterMethod,
    Body extends undefined | ZodTypeAny,
    Query extends undefined | AnyZodObject,
    Response = any
>(
    route: ArriRoute<Path, Method, Body, Query, Response>
) => route;

export type ApiRouteMiddleware = (
    event: RouteEvent<
        RouteEventContext<Record<string, string>, any, any, undefined>
    >
) => void | Promise<void>;

export const defineMiddleware = (middleware: ApiRouteMiddleware) => middleware;

export async function handleRoute(
    event: H3Event,
    route: ArriRoute,
    middlewares: ApiRouteMiddleware[]
) {
    const processedEvent = event as RouteEvent<RouteEventContext>;
    try {
        if (route.schema?.body) {
            const body = await zh.useValidatedBody(event, route.schema.body);
            processedEvent.context.body = body;
        }
        if (route.schema?.query) {
            const query = await zh.useValidatedQuery(event, route.schema.query);
            processedEvent.context.query = query;
        }
        for (const item of middlewares) {
            await item(processedEvent);
        }
        if (processedEvent._handled) {
            return;
        }
        const result = await route.handler(processedEvent);
        await send(processedEvent, result);

        if (route.postHandler) {
            processedEvent.context.response = result;
            await route.postHandler(processedEvent);
        }
    } catch (err) {
        if (isH3Error(err)) {
            setResponseStatus(processedEvent, err.statusCode);
            sendError(processedEvent, err);
        }
        setResponseStatus(processedEvent, 500);
        sendError(
            processedEvent,
            defineError(500, {
                statusMessage: "an unknown error occurred",
                message: "an unknown error occurred",
                data: err,
            })
        );
    }
}
