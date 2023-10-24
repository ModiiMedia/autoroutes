// this file was autogenerated by arri-codegen-ts
/* eslint-disable */
import { arriRequest } from "arri-client";

interface TestClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class TestClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  posts: TestClientPostsService;
  videos: TestClientVideosService;

  constructor(options: TestClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.headers = options.headers ?? {};
    this.posts = new TestClientPostsService(options);
    this.videos = new TestClientVideosService(options);
  }
}

export class TestClientPostsService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(options: TestClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.headers = options.headers ?? {};
  }
  getPost(params: PostParams) {
    return arriRequest<Post, PostParams>({
      url: `${this.baseUrl}/rpcs/posts/get-post`,
      method: "get",
      headers: this.headers,
      params,
      parser: $$Post.parse,
      serializer: $$PostParams.serialize,
    });
  }
  getPosts(params: PostListParams) {
    return arriRequest<PostListResponse, PostListParams>({
      url: `${this.baseUrl}/rpcs/posts/get-posts`,
      method: "get",
      headers: this.headers,
      params,
      parser: $$PostListResponse.parse,
      serializer: $$PostListParams.serialize,
    });
  }
  updatePost(params: UpdatePostParams) {
    return arriRequest<Post, UpdatePostParams>({
      url: `${this.baseUrl}/rpcs/posts/update-post`,
      method: "post",
      headers: this.headers,
      params,
      parser: $$Post.parse,
      serializer: $$UpdatePostParams.serialize,
    });
  }
}

export class TestClientVideosService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(options: TestClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.headers = options.headers ?? {};
  }
  getAnnotation(params: AnnotationId) {
    return arriRequest<Annotation, AnnotationId>({
      url: `${this.baseUrl}/rpcs/videos/get-annotation`,
      method: "get",
      headers: this.headers,
      params,
      parser: $$Annotation.parse,
      serializer: $$AnnotationId.serialize,
    });
  }
  updateAnnotation(params: UpdateAnnotationParams) {
    return arriRequest<Annotation, UpdateAnnotationParams>({
      url: `${this.baseUrl}/rpcs/videos/update-annotation`,
      method: "post",
      headers: this.headers,
      params,
      parser: $$Annotation.parse,
      serializer: $$UpdateAnnotationParams.serialize,
    });
  }
}

export interface PostParams {
  postId: string;
}
export const $$PostParams = {
  parse(input: Record<any, any>): PostParams {
    return {
      postId: typeof input.postId === "string" ? input.postId : "",
    };
  },
  serialize(input: PostParams): string {
    return `{"postId":"${input.postId.replace(/[\n]/g, "\\n")}"}`;
  },
};

export interface Post {
  id: string;
  title: string;
  type: PostType;
  description: string | null;
  content: string;
  tags: Array<string>;
  authorId: string;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
}
export const $$Post = {
  parse(input: Record<any, any>): Post {
    return {
      id: typeof input.id === "string" ? input.id : "",
      title: typeof input.title === "string" ? input.title : "",
      type: $$PostType.parse(input.type),
      description:
        typeof input.description === "string" ? input.description : null,
      content: typeof input.content === "string" ? input.content : "",
      tags: Array.isArray(input.tags)
        ? input.tags.map((item) => (typeof item === "string" ? item : ""))
        : [],
      authorId: typeof input.authorId === "string" ? input.authorId : "",
      author: $$Author.parse(input.author),
      createdAt:
        typeof input.createdAt === "string"
          ? new Date(input.createdAt)
          : new Date(0),
      updatedAt:
        typeof input.updatedAt === "string"
          ? new Date(input.updatedAt)
          : new Date(0),
    };
  },
  serialize(input: Post): string {
    return `{"id":"${input.id.replace(
      /[\n]/g,
      "\\n",
    )}","title":"${input.title.replace(/[\n]/g, "\\n")}","type":"${
      input.type
    }","description":${
      typeof input.description === "string"
        ? `"${input.description.replace(/[\n]/g, "\\n")}"`
        : null
    },"content":"${input.content.replace(/[\n]/g, "\\n")}","tags":[${input.tags
      .map((item) => {
        return `"${item.replace(/[\n]/g, "\\n")}"`;
      })
      .join(",")}],"authorId":"${input.authorId.replace(
      /[\n]/g,
      "\\n",
    )}","author":{"id":"${input.author.id.replace(
      /[\n]/g,
      "\\n",
    )}","name":"${input.author.name.replace(/[\n]/g, "\\n")}","bio":${
      typeof input.author.bio === "string"
        ? `"${input.author.bio.replace(/[\n]/g, "\\n")}"`
        : null
    },"createdAt":"${input.author.createdAt.toISOString()}","updatedAt":"${input.author.updatedAt.toISOString()}"},"createdAt":"${input.createdAt.toISOString()}","updatedAt":"${input.updatedAt.toISOString()}"}`;
  },
};
export type PostType = "text" | "image" | "video";
export const $$PostType = {
  parse(input: any): PostType {
    const vals = ["text", "image", "video"];
    if (typeof input !== "string" || !vals.includes(input)) {
      throw new Error(
        `Invalid input for PostType. Expected one of the following [text, image, video]. Got ${input}.`,
      );
    }
    return input as PostType;
  },
  serialize(input: PostType): string {
    return input;
  },
};
export interface Author {
  id: string;
  name: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const $$Author = {
  parse(input: Record<any, any>): Author {
    return {
      id: typeof input.id === "string" ? input.id : "",
      name: typeof input.name === "string" ? input.name : "",
      bio: typeof input.bio === "string" ? input.bio : null,
      createdAt:
        typeof input.createdAt === "string"
          ? new Date(input.createdAt)
          : new Date(0),
      updatedAt:
        typeof input.updatedAt === "string"
          ? new Date(input.updatedAt)
          : new Date(0),
    };
  },
  serialize(input: Author): string {
    return `{"id":"${input.id.replace(
      /[\n]/g,
      "\\n",
    )}","name":"${input.name.replace(/[\n]/g, "\\n")}","bio":${
      typeof input.bio === "string"
        ? `"${input.bio.replace(/[\n]/g, "\\n")}"`
        : null
    },"createdAt":"${input.createdAt.toISOString()}","updatedAt":"${input.updatedAt.toISOString()}"}`;
  },
};

export interface PostListParams {
  limit: number;
  type?: PostType;
}
export const $$PostListParams = {
  parse(input: Record<any, any>): PostListParams {
    return {
      limit: typeof input.limit === "number" ? input.limit : 0,
      type:
        typeof input.type === "string"
          ? $$PostType.parse(input.type)
          : undefined,
    };
  },
  serialize(input: PostListParams): string {
    return `{${
      input.type !== undefined ? `"type":"${input.type}",` : ""
    }"limit":${input.limit}}`;
  },
};

export interface PostListResponse {
  total: number;
  items: Array<Post>;
}
export const $$PostListResponse = {
  parse(input: Record<any, any>): PostListResponse {
    return {
      total: typeof input.total === "number" ? input.total : 0,
      items: Array.isArray(input.items)
        ? input.items.map((item) => $$Post.parse(item))
        : [],
    };
  },
  serialize(input: PostListResponse): string {
    return `{"total":${input.total},"items":[${input.items
      .map((item) => {
        return `{"id":"${item.id.replace(
          /[\n]/g,
          "\\n",
        )}","title":"${item.title.replace(/[\n]/g, "\\n")}","type":"${
          item.type
        }","description":${
          typeof item.description === "string"
            ? `"${item.description.replace(/[\n]/g, "\\n")}"`
            : null
        },"content":"${item.content.replace(
          /[\n]/g,
          "\\n",
        )}","tags":[${item.tags
          .map((item) => {
            return `"${item.replace(/[\n]/g, "\\n")}"`;
          })
          .join(",")}],"authorId":"${item.authorId.replace(
          /[\n]/g,
          "\\n",
        )}","author":{"id":"${item.author.id.replace(
          /[\n]/g,
          "\\n",
        )}","name":"${item.author.name.replace(/[\n]/g, "\\n")}","bio":${
          typeof item.author.bio === "string"
            ? `"${item.author.bio.replace(/[\n]/g, "\\n")}"`
            : null
        },"createdAt":"${item.author.createdAt.toISOString()}","updatedAt":"${item.author.updatedAt.toISOString()}"},"createdAt":"${item.createdAt.toISOString()}","updatedAt":"${item.updatedAt.toISOString()}"}`;
      })
      .join(",")}]}`;
  },
};

export interface UpdatePostParams {
  postId: string;
  data: UpdatePostParamsData;
}
export const $$UpdatePostParams = {
  parse(input: Record<any, any>): UpdatePostParams {
    return {
      postId: typeof input.postId === "string" ? input.postId : "",
      data: $$UpdatePostParamsData.parse(input.data),
    };
  },
  serialize(input: UpdatePostParams): string {
    return `{"postId":"${input.postId.replace(/[\n]/g, "\\n")}","data":${`{${
      input.data.title !== undefined
        ? `"title":"${input.data.title.replace(/[\n]/g, "\\n")}",`
        : ""
    }${
      input.data.description !== undefined
        ? `"description":${
            typeof input.data.description === "string"
              ? `"${input.data.description.replace(/[\n]/g, "\\n")}"`
              : null
          },`
        : ""
    }${
      input.data.content !== undefined
        ? `"content":"${input.data.content.replace(/[\n]/g, "\\n")}",`
        : ""
    }${
      input.data.tags !== undefined
        ? `"tags":[${input.data.tags
            .map((item) => {
              return `"${item.replace(/[\n]/g, "\\n")}"`;
            })
            .join(",")}],`
        : ""
    }}`
      .split(",}")
      .join("}")}}`;
  },
};
export interface UpdatePostParamsData {
  title?: string;
  description?: string | null;
  content?: string;
  tags?: Array<string>;
}
export const $$UpdatePostParamsData = {
  parse(input: Record<any, any>): UpdatePostParamsData {
    return {
      title: typeof input.title === "string" ? input.title : undefined,
      description:
        typeof input.description === "string" ? input.description : undefined,
      content: typeof input.content === "string" ? input.content : undefined,
      tags: Array.isArray(input.tags)
        ? input.tags.map((item) => (typeof item === "string" ? item : ""))
        : undefined,
    };
  },
  serialize(input: UpdatePostParamsData): string {
    return `${`{${
      input.title !== undefined
        ? `"title":"${input.title.replace(/[\n]/g, "\\n")}",`
        : ""
    }${
      input.description !== undefined
        ? `"description":${
            typeof input.description === "string"
              ? `"${input.description.replace(/[\n]/g, "\\n")}"`
              : null
          },`
        : ""
    }${
      input.content !== undefined
        ? `"content":"${input.content.replace(/[\n]/g, "\\n")}",`
        : ""
    }${
      input.tags !== undefined
        ? `"tags":[${input.tags
            .map((item) => {
              return `"${item.replace(/[\n]/g, "\\n")}"`;
            })
            .join(",")}],`
        : ""
    }}`
      .split(",}")
      .join("}")}`;
  },
};

export interface AnnotationId {
  id: string;
  version: string;
}
export const $$AnnotationId = {
  parse(input: Record<any, any>): AnnotationId {
    return {
      id: typeof input.id === "string" ? input.id : "",
      version: typeof input.version === "string" ? input.version : "",
    };
  },
  serialize(input: AnnotationId): string {
    return `{"id":"${input.id.replace(
      /[\n]/g,
      "\\n",
    )}","version":"${input.version.replace(/[\n]/g, "\\n")}"}`;
  },
};

export interface Annotation {
  annotation_id: AnnotationId;
  associated_id: AssociatedId;
  annotation_type: AnnotationAnnotationType;
  annotation_type_version: number;
  metadata: any;
  box_type_range: AnnotationBoxTypeRange;
}
export const $$Annotation = {
  parse(input: Record<any, any>): Annotation {
    return {
      annotation_id: $$AnnotationId.parse(input.annotation_id),
      associated_id: $$AssociatedId.parse(input.associated_id),
      annotation_type: $$AnnotationAnnotationType.parse(input.annotation_type),
      annotation_type_version:
        typeof input.annotation_type_version === "number"
          ? input.annotation_type_version
          : 0,
      metadata: input.metadata,
      box_type_range: $$AnnotationBoxTypeRange.parse(input.box_type_range),
    };
  },
  serialize(input: Annotation): string {
    return `{"annotation_id":{"id":"${input.annotation_id.id.replace(
      /[\n]/g,
      "\\n",
    )}","version":"${input.annotation_id.version.replace(
      /[\n]/g,
      "\\n",
    )}"},"associated_id":{"entity_type":"${
      input.associated_id.entity_type
    }","id":"${input.associated_id.id.replace(
      /[\n]/g,
      "\\n",
    )}"},"annotation_type":"${
      input.annotation_type
    }","annotation_type_version":${
      input.annotation_type_version
    },"metadata":${JSON.stringify(
      input.metadata,
    )},"box_type_range":{"start_time_in_nano_sec":"${input.box_type_range.start_time_in_nano_sec.toString()}","end_time_in_nano_sec":"${input.box_type_range.end_time_in_nano_sec.toString()}"}}`;
  },
};
export interface AssociatedId {
  entity_type: AnnotationAssociatedIdEntityType;
  id: string;
}
export const $$AssociatedId = {
  parse(input: Record<any, any>): AssociatedId {
    return {
      entity_type: $$AnnotationAssociatedIdEntityType.parse(input.entity_type),
      id: typeof input.id === "string" ? input.id : "",
    };
  },
  serialize(input: AssociatedId): string {
    return `{"entity_type":"${input.entity_type}","id":"${input.id.replace(
      /[\n]/g,
      "\\n",
    )}"}`;
  },
};
export type AnnotationAssociatedIdEntityType = "MOVIE_ID" | "SHOW_ID";
export const $$AnnotationAssociatedIdEntityType = {
  parse(input: any): AnnotationAssociatedIdEntityType {
    const vals = ["MOVIE_ID", "SHOW_ID"];
    if (typeof input !== "string" || !vals.includes(input)) {
      throw new Error(
        `Invalid input for AnnotationAssociatedIdEntityType. Expected one of the following [MOVIE_ID, SHOW_ID]. Got ${input}.`,
      );
    }
    return input as AnnotationAssociatedIdEntityType;
  },
  serialize(input: AnnotationAssociatedIdEntityType): string {
    return input;
  },
};
export type AnnotationAnnotationType = "ANNOTATION_BOUNDINGBOX";
export const $$AnnotationAnnotationType = {
  parse(input: any): AnnotationAnnotationType {
    const vals = ["ANNOTATION_BOUNDINGBOX"];
    if (typeof input !== "string" || !vals.includes(input)) {
      throw new Error(
        `Invalid input for AnnotationAnnotationType. Expected one of the following [ANNOTATION_BOUNDINGBOX]. Got ${input}.`,
      );
    }
    return input as AnnotationAnnotationType;
  },
  serialize(input: AnnotationAnnotationType): string {
    return input;
  },
};
export interface AnnotationBoxTypeRange {
  start_time_in_nano_sec: bigint;
  end_time_in_nano_sec: bigint;
}
export const $$AnnotationBoxTypeRange = {
  parse(input: Record<any, any>): AnnotationBoxTypeRange {
    return {
      start_time_in_nano_sec:
        typeof input.start_time_in_nano_sec === "string"
          ? BigInt(input.start_time_in_nano_sec)
          : BigInt("0"),
      end_time_in_nano_sec:
        typeof input.end_time_in_nano_sec === "string"
          ? BigInt(input.end_time_in_nano_sec)
          : BigInt("0"),
    };
  },
  serialize(input: AnnotationBoxTypeRange): string {
    return `{"start_time_in_nano_sec":"${input.start_time_in_nano_sec.toString()}","end_time_in_nano_sec":"${input.end_time_in_nano_sec.toString()}"}`;
  },
};

export interface UpdateAnnotationParams {
  annotation_id: string;
  annotation_id_version: string;
  data: UpdateAnnotationData;
}
export const $$UpdateAnnotationParams = {
  parse(input: Record<any, any>): UpdateAnnotationParams {
    return {
      annotation_id:
        typeof input.annotation_id === "string" ? input.annotation_id : "",
      annotation_id_version:
        typeof input.annotation_id_version === "string"
          ? input.annotation_id_version
          : "",
      data: $$UpdateAnnotationData.parse(input.data),
    };
  },
  serialize(input: UpdateAnnotationParams): string {
    return `{"annotation_id":"${input.annotation_id.replace(
      /[\n]/g,
      "\\n",
    )}","annotation_id_version":"${input.annotation_id_version.replace(
      /[\n]/g,
      "\\n",
    )}","data":${`{${
      input.data.associated_id !== undefined
        ? `"associated_id":{"entity_type":"${
            input.data.associated_id.entity_type
          }","id":"${input.data.associated_id.id.replace(/[\n]/g, "\\n")}"},`
        : ""
    }${
      input.data.annotation_type !== undefined
        ? `"annotation_type":"${input.data.annotation_type}",`
        : ""
    }${
      input.data.annotation_type_version !== undefined
        ? `"annotation_type_version":${input.data.annotation_type_version},`
        : ""
    }${
      input.data.metadata !== undefined
        ? `"metadata":${JSON.stringify(input.data.metadata)},`
        : ""
    }${
      input.data.box_type_range !== undefined
        ? `"box_type_range":{"start_time_in_nano_sec":"${input.data.box_type_range.start_time_in_nano_sec.toString()}","end_time_in_nano_sec":"${input.data.box_type_range.end_time_in_nano_sec.toString()}"},`
        : ""
    }}`
      .split(",}")
      .join("}")}}`;
  },
};
export interface UpdateAnnotationData {
  associated_id?: AssociatedId;
  annotation_type?: UpdateAnnotationParamsDataAnnotationType;
  annotation_type_version?: number;
  metadata?: any;
  box_type_range?: UpdateAnnotationParamsDataBoxTypeRange;
}
export const $$UpdateAnnotationData = {
  parse(input: Record<any, any>): UpdateAnnotationData {
    return {
      associated_id:
        typeof input.associated_id === "object" && input.associated_id !== null
          ? $$AssociatedId.parse(input.associated_id)
          : undefined,
      annotation_type:
        typeof input.annotation_type === "string"
          ? $$UpdateAnnotationParamsDataAnnotationType.parse(
              input.annotation_type,
            )
          : undefined,
      annotation_type_version:
        typeof input.annotation_type_version === "number"
          ? input.annotation_type_version
          : undefined,
      metadata: input.metadata,
      box_type_range:
        typeof input.box_type_range === "object" &&
        input.box_type_range !== null
          ? $$UpdateAnnotationParamsDataBoxTypeRange.parse(input.box_type_range)
          : undefined,
    };
  },
  serialize(input: UpdateAnnotationData): string {
    return `${`{${
      input.associated_id !== undefined
        ? `"associated_id":{"entity_type":"${
            input.associated_id.entity_type
          }","id":"${input.associated_id.id.replace(/[\n]/g, "\\n")}"},`
        : ""
    }${
      input.annotation_type !== undefined
        ? `"annotation_type":"${input.annotation_type}",`
        : ""
    }${
      input.annotation_type_version !== undefined
        ? `"annotation_type_version":${input.annotation_type_version},`
        : ""
    }${
      input.metadata !== undefined
        ? `"metadata":${JSON.stringify(input.metadata)},`
        : ""
    }${
      input.box_type_range !== undefined
        ? `"box_type_range":{"start_time_in_nano_sec":"${input.box_type_range.start_time_in_nano_sec.toString()}","end_time_in_nano_sec":"${input.box_type_range.end_time_in_nano_sec.toString()}"},`
        : ""
    }}`
      .split(",}")
      .join("}")}`;
  },
};
export type UpdateAnnotationParamsDataAnnotationType = "ANNOTATION_BOUNDINGBOX";
export const $$UpdateAnnotationParamsDataAnnotationType = {
  parse(input: any): UpdateAnnotationParamsDataAnnotationType {
    const vals = ["ANNOTATION_BOUNDINGBOX"];
    if (typeof input !== "string" || !vals.includes(input)) {
      throw new Error(
        `Invalid input for UpdateAnnotationParamsDataAnnotationType. Expected one of the following [ANNOTATION_BOUNDINGBOX]. Got ${input}.`,
      );
    }
    return input as UpdateAnnotationParamsDataAnnotationType;
  },
  serialize(input: UpdateAnnotationParamsDataAnnotationType): string {
    return input;
  },
};
export interface UpdateAnnotationParamsDataBoxTypeRange {
  start_time_in_nano_sec: bigint;
  end_time_in_nano_sec: bigint;
}
export const $$UpdateAnnotationParamsDataBoxTypeRange = {
  parse(input: Record<any, any>): UpdateAnnotationParamsDataBoxTypeRange {
    return {
      start_time_in_nano_sec:
        typeof input.start_time_in_nano_sec === "string"
          ? BigInt(input.start_time_in_nano_sec)
          : BigInt("0"),
      end_time_in_nano_sec:
        typeof input.end_time_in_nano_sec === "string"
          ? BigInt(input.end_time_in_nano_sec)
          : BigInt("0"),
    };
  },
  serialize(input: UpdateAnnotationParamsDataBoxTypeRange): string {
    return `{"start_time_in_nano_sec":"${input.start_time_in_nano_sec.toString()}","end_time_in_nano_sec":"${input.end_time_in_nano_sec.toString()}"}`;
  },
};
