declare module "types" {
    export type TNotionBlockType = 'page' | 'collection_view_page' | 'table_of_contents' | 'text' | 'header' | 'sub_header' | 'sub_sub_header' | 'to_do' | 'bulleted_list' | 'numbered_list' | 'toggle' | 'quote' | 'divider' | 'callout' | 'equation' | 'code' | 'image' | 'bookmark';
    export enum ENotionBlockTypes {
        PAGE = "page",
        COLLECTION_VIEW_PAGE = "collection_view_page",
        TABLE_OF_CONTENTS = "table_of_contents",
        TEXT = "text",
        H1 = "header",
        H2 = "sub_header",
        H3 = "sub_sub_header",
        TODO_LIST = "to_do",
        BULLETED_LIST = "bulleted_list",
        NUMBERED_LIST = "numbered_list",
        TOGGLE_LIST = "toggle",
        QUOTE = "quote",
        DIVIDER = "divider",
        CALLOUT = "callout",
        EQUATION = "equation",
        CODE = "code",
        IMAGE = "image",
        BOOKMARK = "bookmark"
    }
    export type TNotionHashId = string;
    export interface ISchemaOption {
        id: TNotionHashId;
        color: string;
        value: string;
    }
    export interface INotionBlock {
        [key: string]: {
            role: string;
            value: {
                id: TNotionHashId;
                version: number;
                type: TNotionBlockType;
                properties: {
                    title: string[][];
                    [key: string]: any[];
                };
                created_time: string;
                last_edited_time: string;
                parent_id: TNotionHashId;
                parent_table: string;
                alive: boolean;
                created_by_table: string;
                created_by_id: TNotionHashId;
                last_edited_by_table: string;
                last_edited_by_id: TNotionHashId;
                file_ids?: TNotionHashId[];
                content?: TNotionHashId[];
                format?: {
                    page_icon: string;
                    page_cover: string;
                    page_cover_position: number;
                    block_color: string;
                };
            };
        };
    }
    export interface IBasalNotionCollectionValue {
        id: TNotionHashId;
        version: number;
        name: string[][];
        parent_id: TNotionHashId;
        parent_table: string;
    }
    export interface INotionCollectionValue extends IBasalNotionCollectionValue {
        icon: string;
        alive: boolean;
        file_ids: TNotionHashId[];
        schema: {
            [key: string]: {
                name: string;
                type: string;
                options?: ISchemaOption[];
            };
        };
    }
    export interface INotionCollectionViewValue extends IBasalNotionCollectionValue {
        format: {};
        parent_id: TNotionHashId;
        parent_table: string;
        page_sort: TNotionHashId[];
        query2: {
            aggregations: {}[];
        };
    }
    export interface INotionCollection {
        [key: string]: {
            role: string;
            value: INotionCollectionValue;
        };
    }
    export interface INotionCollectionView {
        [key: string]: {
            role: string;
            value: INotionCollectionViewValue;
        };
    }
    export interface NotionResponse {
        recordMap: {
            block: INotionBlock;
            collection: INotionCollection;
            collection_view: INotionCollectionView;
            [key: string]: any;
        };
        [key: string]: any;
    }
    export interface INophyOptions {
        token: string;
        indexPageId?: string;
    }
    export interface IFetchNotionOptions {
        endpoint: string;
        body?: any;
    }
    export interface IFetchNotion {
        (fetchOption: IFetchNotionOptions): Promise<NotionResponse>;
    }
    export interface IFetchNotionGen {
        (token: string): IFetchNotion;
    }
}
declare module "utils/fetch" {
    import { IFetchNotionGen } from "types";
    export const NOTION_BASE_URL = "https://www.notion.so/api/v3";
    export const endpoints: {
        loadUserContent: string;
        loadPageChunk: string;
        queryCollection: string;
    };
    export const fetchNotionGen: IFetchNotionGen;
}
declare module "utils/url" {
    export const isNotionPageUrl: (pageId: string) => boolean;
    export const formatPageIdWithoutDash: (pageId: string) => string;
    export const formatPageIdWithDash: (pageId: string) => string;
    export const parsePageId: (pageIdOrUrl: string) => string;
}
declare module "index" {
    import { INophyOptions } from "types";
    class Nophy {
        private token;
        private fetchNotion;
        constructor({ token }: INophyOptions);
        fetchPage: (pageIdOrUrl: string, format?: boolean) => Promise<1 | 2>;
        fetchUserContent: () => Promise<any>;
        fetchPageInfoById: (pageId: string) => Promise<any>;
        fetchPageCollectionInfoById: (pageId: string) => Promise<string[]>;
        fetchCollectionByIds: ([collectionId, collectionViewId]: string[]) => Promise<any>;
    }
    export default Nophy;
}
declare module "utils/serializer" {
    export const serialize: () => void;
}
