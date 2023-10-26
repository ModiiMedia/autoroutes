// this file was autogenerated by arri-codegen-ts
/* eslint-disable */
import { arriRequest } from "arri-client";

interface ClientOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export class Client {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    users: ClientUsersService;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        this.users = new ClientUsersService(options);
    }

    getStatus() {
        return arriRequest<GetStatusResponse, undefined>({
            url: `${this.baseUrl}/status`,
            method: "get",
            headers: this.headers,
            params: undefined,
            parser: $$GetStatusResponse.parse,
            serializer: (_) => {},
        });
    }
}

export class ClientUsersService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    settings: ClientUsersSettingsService;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        this.settings = new ClientUsersSettingsService(options);
    }

    getUser(params: UserParams) {
        return arriRequest<User, UserParams>({
            url: `${this.baseUrl}/users/get-user`,
            method: "get",
            headers: this.headers,
            params,
            parser: $$User.parse,
            serializer: $$UserParams.serialize,
        });
    }

    updateUser(params: UpdateUserParams) {
        return arriRequest<User, UpdateUserParams>({
            url: `${this.baseUrl}/users/update-user`,
            method: "post",
            headers: this.headers,
            params,
            parser: $$User.parse,
            serializer: $$UpdateUserParams.serialize,
        });
    }
}

export class ClientUsersSettingsService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
    }

    getUserSettings() {
        return arriRequest<undefined, undefined>({
            url: `${this.baseUrl}/users/settings/get-user-settings`,
            method: "get",
            headers: this.headers,
            params: undefined,
            parser: (_) => {},
            serializer: (_) => {},
        });
    }
}

export interface GetStatusResponse {
    message: string;
}
export const $$GetStatusResponse = {
    parse(input: Record<any, any>): GetStatusResponse {
        return {
            message: typeof input.message === "string" ? input.message : "",
        };
    },
    serialize(input: GetStatusResponse): string {
        return `{"message":"${input.message.replace(/[\n]/g, "\\n")}"}`;
    },
};

export interface User {
    id: string;
    role: UserRole;
    photo: UserPhoto | null;
    createdAt: Date;
    numFollowers: number;
    settings: UserSettings;
    recentNotifications: Array<UserRecentNotificationsItem>;
    bookmarks: UserBookmarks;
    metadata: UserMetadata;
    randomList: Array<any>;
    bio?: string;
}
export const $$User = {
    parse(input: Record<any, any>): User {
        return {
            id: typeof input.id === "string" ? input.id : "",
            role: $$UserRole.parse(input.role),
            photo:
                typeof input.photo === "object" && input.photo !== null
                    ? $$UserPhoto.parse(input.photo)
                    : null,
            createdAt:
                typeof input.createdAt === "string"
                    ? new Date(input.createdAt)
                    : new Date(0),
            numFollowers:
                typeof input.numFollowers === "number" ? input.numFollowers : 0,
            settings: $$UserSettings.parse(input.settings),
            recentNotifications: Array.isArray(input.recentNotifications)
                ? input.recentNotifications.map((item) =>
                      $$UserRecentNotificationsItem.parse(item),
                  )
                : [],
            bookmarks:
                typeof input.bookmarks === "object" && input.bookmarks !== null
                    ? $$UserBookmarks.parse(input.bookmarks)
                    : {},
            metadata:
                typeof input.metadata === "object" && input.metadata !== null
                    ? $$UserMetadata.parse(input.metadata)
                    : {},
            randomList: Array.isArray(input.randomList)
                ? input.randomList.map((item) => item)
                : [],
            bio: typeof input.bio === "string" ? input.bio : undefined,
        };
    },
    serialize(input: User): string {
        // @ts-ignore
        function _recent_notifications_0_to_json(val) {
            switch (val.notificationType) {
                case "POST_LIKE":
                    return `{"postId":"${val.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${val.userId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","notificationType":"${val.notificationType}"}`;
                case "POST_COMMENT":
                    return `{"postId":"${val.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${val.userId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","commentText":"${val.commentText.replace(
                        /[\n]/g,
                        "\\n",
                    )}","notificationType":"${val.notificationType}"}`;
                default:
                    return null;
            }
        }
        // @ts-ignore
        function bookmarks(val) {
            const keyParts = [];
            const keys = Object.keys(val);
            for (let i = 0; i < Object.keys(val).length; i++) {
                const key = keys[i];
                const v = val[key];
                keyParts.push(
                    `"${key}":{"postId":"${v.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${v.userId.replace(/[\n]/g, "\\n")}"}`,
                );
            }
            return `{${keyParts.join(",")}}`;
        }
        // @ts-ignore
        function metadata(val) {
            const keyParts = [];
            const keys = Object.keys(val);
            for (let i = 0; i < Object.keys(val).length; i++) {
                const key = keys[i];
                const v = val[key];
                keyParts.push(`"${key}":${JSON.stringify(v)}`);
            }
            return `{${keyParts.join(",")}}`;
        }
        return `{${
            input.bio !== undefined
                ? `"bio":"${input.bio.replace(/[\n]/g, "\\n")}",`
                : ""
        }"id":"${input.id.replace(/[\n]/g, "\\n")}","role":"${
            input.role
        }","photo":${
            typeof input.photo === "object" && input.photo !== null
                ? `{"url":"${input.photo.url.replace(
                      /[\n]/g,
                      "\\n",
                  )}","width":${input.photo.width},"height":${
                      input.photo.height
                  },"bytes":"${input.photo.bytes.toString()}","nanoseconds":"${input.photo.nanoseconds.toString()}"}`
                : null
        },"createdAt":"${input.createdAt.toISOString()}","numFollowers":${
            input.numFollowers
        },"settings":{"notificationsEnabled":${
            input.settings.notificationsEnabled
        },"preferredTheme":"${
            input.settings.preferredTheme
        }"},"recentNotifications":[${input.recentNotifications
            .map((item) => {
                return `${_recent_notifications_0_to_json(item)}`;
            })
            .join(",")}],"bookmarks":${bookmarks(
            input.bookmarks,
        )},"metadata":${metadata(
            input.metadata,
        )},"randomList":[${input.randomList
            .map((item) => {
                return `${JSON.stringify(item)}`;
            })
            .join(",")}]}`;
    },
};

export type UserRole = "standard" | "admin";
export const $$UserRole = {
    parse(input: any): UserRole {
        const vals = ["standard", "admin"];
        if (typeof input !== "string" || !vals.includes(input)) {
            throw new Error(
                `Invalid input for UserRole. Expected one of the following [standard, admin]. Got ${input}.`,
            );
        }
        return input as UserRole;
    },
    serialize(input: UserRole): string {
        return input;
    },
};

export interface UserPhoto {
    url: string;
    width: number;
    height: number;
    bytes: bigint;
    nanoseconds: bigint;
}
export const $$UserPhoto = {
    parse(input: Record<any, any>): UserPhoto {
        return {
            url: typeof input.url === "string" ? input.url : "",
            width: typeof input.width === "number" ? input.width : 0,
            height: typeof input.height === "number" ? input.height : 0,
            bytes:
                typeof input.bytes === "string"
                    ? BigInt(input.bytes)
                    : BigInt("0"),
            nanoseconds:
                typeof input.nanoseconds === "string"
                    ? BigInt(input.nanoseconds)
                    : BigInt("0"),
        };
    },
    serialize(input: UserPhoto): string {
        return `${
            typeof input === "object" && input !== null
                ? `{"url":"${input.url.replace(/[\n]/g, "\\n")}","width":${
                      input.width
                  },"height":${
                      input.height
                  },"bytes":"${input.bytes.toString()}","nanoseconds":"${input.nanoseconds.toString()}"}`
                : "null"
        }`;
    },
};

export interface UserSettings {
    notificationsEnabled: boolean;
    preferredTheme: UserSettingsPreferredTheme;
}
export const $$UserSettings = {
    parse(input: Record<any, any>): UserSettings {
        return {
            notificationsEnabled:
                typeof input.notificationsEnabled === "boolean"
                    ? input.notificationsEnabled
                    : false,
            preferredTheme: $$UserSettingsPreferredTheme.parse(
                input.preferredTheme,
            ),
        };
    },
    serialize(input: UserSettings): string {
        return `{"notificationsEnabled":${input.notificationsEnabled},"preferredTheme":"${input.preferredTheme}"}`;
    },
};

export type UserSettingsPreferredTheme = "dark-mode" | "light-mode" | "system";
export const $$UserSettingsPreferredTheme = {
    parse(input: any): UserSettingsPreferredTheme {
        const vals = ["dark-mode", "light-mode", "system"];
        if (typeof input !== "string" || !vals.includes(input)) {
            throw new Error(
                `Invalid input for UserSettingsPreferredTheme. Expected one of the following [dark-mode, light-mode, system]. Got ${input}.`,
            );
        }
        return input as UserSettingsPreferredTheme;
    },
    serialize(input: UserSettingsPreferredTheme): string {
        return input;
    },
};
export type UserRecentNotificationsItem =
    | UserRecentNotificationsItemPostLike
    | UserRecentNotificationsItemPostComment;
export const $$UserRecentNotificationsItem = {
    parse(input: Record<any, any>): UserRecentNotificationsItem {
        switch (input.notificationType) {
            case "POST_LIKE":
                return $$UserRecentNotificationsItemPostLike.parse(input);
            case "POST_COMMENT":
                return $$UserRecentNotificationsItemPostComment.parse(input);
            default:
                break;
        }
        throw new Error(
            "Invalid input for UserRecentNotificationsItem. Input didn't match one of the specified union schemas.",
        );
    },
    serialize(input: UserRecentNotificationsItem): string {
        // @ts-ignore
        function _to_json(val) {
            switch (val.notificationType) {
                case "POST_LIKE":
                    return `{"postId":"${val.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${val.userId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","notificationType":"${val.notificationType}"}`;
                case "POST_COMMENT":
                    return `{"postId":"${val.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${val.userId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","commentText":"${val.commentText.replace(
                        /[\n]/g,
                        "\\n",
                    )}","notificationType":"${val.notificationType}"}`;
                default:
                    return null;
            }
        }
        return `${_to_json(input)}`;
    },
};
export interface UserRecentNotificationsItemPostLike {
    notificationType: "POST_LIKE";
    postId: string;
    userId: string;
}
export const $$UserRecentNotificationsItemPostLike = {
    parse(input: Record<any, any>): UserRecentNotificationsItemPostLike {
        return {
            notificationType: "POST_LIKE",
            postId: typeof input.postId === "string" ? input.postId : "",
            userId: typeof input.userId === "string" ? input.userId : "",
        };
    },
    serialize(input: UserRecentNotificationsItemPostLike): string {
        return `{"postId":"${input.postId.replace(
            /[\n]/g,
            "\\n",
        )}","userId":"${input.userId.replace(/[\n]/g, "\\n")}"}`;
    },
};

export interface UserRecentNotificationsItemPostComment {
    notificationType: "POST_COMMENT";
    postId: string;
    userId: string;
    commentText: string;
}
export const $$UserRecentNotificationsItemPostComment = {
    parse(input: Record<any, any>): UserRecentNotificationsItemPostComment {
        return {
            notificationType: "POST_COMMENT",
            postId: typeof input.postId === "string" ? input.postId : "",
            userId: typeof input.userId === "string" ? input.userId : "",
            commentText:
                typeof input.commentText === "string" ? input.commentText : "",
        };
    },
    serialize(input: UserRecentNotificationsItemPostComment): string {
        return `{"postId":"${input.postId.replace(
            /[\n]/g,
            "\\n",
        )}","userId":"${input.userId.replace(
            /[\n]/g,
            "\\n",
        )}","commentText":"${input.commentText.replace(/[\n]/g, "\\n")}"}`;
    },
};

export type UserBookmarks = Record<string, UserBookmarksValue>;
export const $$UserBookmarks = {
    parse(input: Record<any, any>): UserBookmarks {
        const result: UserBookmarks = {};
        for (const key of Object.keys(input)) {
            result[key] = $$UserBookmarksValue.parse(input[key]);
        }
        return result;
    },
    serialize(input: UserBookmarks): string {
        // @ts-ignore
        function serializeVal(val) {
            const keyParts = [];
            const keys = Object.keys(val);
            for (let i = 0; i < Object.keys(val).length; i++) {
                const key = keys[i];
                const v = val[key];
                keyParts.push(
                    `"${key}":{"postId":"${v.postId.replace(
                        /[\n]/g,
                        "\\n",
                    )}","userId":"${v.userId.replace(/[\n]/g, "\\n")}"}`,
                );
            }
            return `{${keyParts.join(",")}}`;
        }
        return `${serializeVal(input)}`;
    },
};

export interface UserBookmarksValue {
    postId: string;
    userId: string;
}
export const $$UserBookmarksValue = {
    parse(input: Record<any, any>): UserBookmarksValue {
        return {
            postId: typeof input.postId === "string" ? input.postId : "",
            userId: typeof input.userId === "string" ? input.userId : "",
        };
    },
    serialize(input: UserBookmarksValue): string {
        return `{"postId":"${input.postId.replace(
            /[\n]/g,
            "\\n",
        )}","userId":"${input.userId.replace(/[\n]/g, "\\n")}"}`;
    },
};

export type UserMetadata = Record<string, any>;
export const $$UserMetadata = {
    parse(input: Record<any, any>): UserMetadata {
        const result: UserMetadata = {};
        for (const key of Object.keys(input)) {
            result[key] = input[key];
        }
        return result;
    },
    serialize(input: UserMetadata): string {
        // @ts-ignore
        function serializeVal(val) {
            const keyParts = [];
            const keys = Object.keys(val);
            for (let i = 0; i < Object.keys(val).length; i++) {
                const key = keys[i];
                const v = val[key];
                keyParts.push(`"${key}":${JSON.stringify(v)}`);
            }
            return `{${keyParts.join(",")}}`;
        }
        return `${serializeVal(input)}`;
    },
};

export interface UserParams {
    userId: string;
}
export const $$UserParams = {
    parse(input: Record<any, any>): UserParams {
        return {
            userId: typeof input.userId === "string" ? input.userId : "",
        };
    },
    serialize(input: UserParams): string {
        return `{"userId":"${input.userId.replace(/[\n]/g, "\\n")}"}`;
    },
};

export interface UpdateUserParams {
    id: string;
    photo: UserPhoto | null;
    bio?: string;
}
export const $$UpdateUserParams = {
    parse(input: Record<any, any>): UpdateUserParams {
        return {
            id: typeof input.id === "string" ? input.id : "",
            photo:
                typeof input.photo === "object" && input.photo !== null
                    ? $$UserPhoto.parse(input.photo)
                    : null,
            bio: typeof input.bio === "string" ? input.bio : undefined,
        };
    },
    serialize(input: UpdateUserParams): string {
        return `{${
            input.bio !== undefined
                ? `"bio":"${input.bio.replace(/[\n]/g, "\\n")}",`
                : ""
        }"id":"${input.id.replace(/[\n]/g, "\\n")}","photo":${
            typeof input.photo === "object" && input.photo !== null
                ? `{"url":"${input.photo.url.replace(
                      /[\n]/g,
                      "\\n",
                  )}","width":${input.photo.width},"height":${
                      input.photo.height
                  },"bytes":"${input.photo.bytes.toString()}","nanoseconds":"${input.photo.nanoseconds.toString()}"}`
                : null
        }}`;
    },
};
