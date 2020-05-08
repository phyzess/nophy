/**
 * notion block types
 */
export type TNotionBlockType =
  | 'page' // 页面组件
  | 'collection_view_page'
  | 'table_of_contents' // 导航组件
  | 'text' // 普通文字
  | 'header' // H1
  | 'sub_header' // H2
  | 'sub_sub_header' // H3
  | 'to_do' // to_do_list item
  | 'bulleted_list' // bulleted_list item
  | 'numbered_list' // numbered_list item
  | 'toggle' // toggle_list item
  | 'quote' // quote
  | 'divider' // divider 分割行
  | 'callout' // callout
  | 'equation' // equation 公式
  | 'code' // 代码块
  | 'image' // 图片
  | 'bookmark'; // 书签

export enum ENotionBlockTypes {
  PAGE = 'page',
  COLLECTION_VIEW_PAGE = 'collection_view_page',
  TABLE_OF_CONTENTS = 'table_of_contents',
  TEXT = 'text',
  H1 = 'header',
  H2 = 'sub_header',
  H3 = 'sub_sub_header',
  TODO_LIST = 'to_do',
  BULLETED_LIST = 'bulleted_list',
  NUMBERED_LIST = 'numbered_list',
  TOGGLE_LIST = 'toggle',
  QUOTE = 'quote',
  DIVIDER = 'divider',
  CALLOUT = 'callout',
  EQUATION = 'equation',
  CODE = 'code',
  IMAGE = 'image',
  BOOKMARK = 'bookmark',
}

export type TNotionHashId = string; // 26021519-4ac3-4451-b766-fbdd8d9fff7f

export interface ISchemaOption {
  id: TNotionHashId;
  color: string;
  value: string;
}

export interface ISchema {
  [key: string]: {
    name: string;
    type: string;
    options?: ISchemaOption[];
  };
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
  schema: ISchema;
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
  result: {
    type: string;
    blockIds: TNotionHashId[];
    aggregationResults: any[];
    total: number;
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

export interface ITableCollection {
  collectionId: TNotionHashId;
  collectionViewId: TNotionHashId;
}

export interface ITableRowProperty {
  colKey: string;
  colLabel: string;
  colType: string;
  value: any;
}

export interface ITableRowProperties {
  [key: string]: ITableRowProperty;
}

export interface ITableRowBlock {
  id: TNotionHashId;
  type: string;
  primaryKey: string;
  properties: ITableRowProperties;
}

export interface ISiteConfigTableRowData {
  rowId: TNotionHashId;
  type: string;
  desc: string;
  name: string;
  value: any;
  image: {
    name: string;
    url: string;
  };
}
