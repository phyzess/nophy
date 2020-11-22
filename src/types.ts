/**
 * notion block types
 * @todo 似乎还有一个 column 类型，在 notion 中是用来标识一行分割成多列
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
      content: TNotionHashId[];
      file_ids?: TNotionHashId[];
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
  id?: TNotionHashId;
  type?: string;
  primaryKey?: string;
  content?: TNotionHashId[];
  created_time?: string;
  last_edited_time?: string;
  properties: ITableRowProperties;
  [key: string]: any;
}

export type TArticleStatus = 'completed' | 'draft';

export interface ITableRowData {
  rowId: TNotionHashId;
  type: string; // notion 本身 table 的每一行都有一个 type，大概率为 page
  desc: string;
  name: string;
  value: any;
  image: {
    name: string;
    url: string;
    block: ITableRowBlock;
  };
  content: TNotionHashId[];
  status?: TArticleStatus;
  [key: string]: any; // 用于兼容 notion 中自建的 table 的 rowKey
}

export type TRowFilter = (row: ITableRowData) => boolean;

export interface IPageSection {
  type: TNotionBlockType;
  version: number;
  id: TNotionHashId;
  properties: {
    title: string[][];
    [key: string]: any[];
  };
  format?: {
    block_color?: string;
    block_aspect_ratio?: number;
    block_full_width?: boolean;
    block_height?: number;
    block_page_width?: boolean;
    block_preserve_scale?: boolean;
    block_width?: number;
    bookmark_cover?: string;
    bookmark_icon?: string;
    code_wrap?: boolean;
    display_source?: string;
    page_icon?: string;
    page_cover?: string;
    page_cover_position?: number;
  };
  children: IPageSection[];
}

/**
 * 只对这几种嵌入文本的样式进行解析
 * 类似 comment 什么的以后再说
 * 在获取文章中基本用不上
 */
export type TFormatType = 'b' | 'i' | 's' | 'a' | 'h' | 'c' | 'e';

export enum EFormatType {
  'b' = 'bold',
  'i' = 'italic',
  's' = 'lineThrough',
  'a' = 'link',
  'h' = 'fontOrBg',
  'c' = 'inlineCode',
  'e' = 'inlineEquation',
}

export type TReadableFormatType =
  | 'bold'
  | 'italic'
  | 'lineThrough'
  | 'link'
  | 'color'
  | 'backgroundColor'
  | 'inlineCode'
  | 'inlineEquation';

export enum EFormatToTagType {
  'bold' = 'text',
  'italic' = 'text',
  'lineThrough' = 'text',
  'link' = 'link',
  'color' = 'text',
  'backgroundColor' = 'text',
  'inlineCode' = 'inlineCode',
  'inlineEquation' = 'inlineEquation',
}

export interface IFlattenFormats {
  type: TReadableFormatType;
  // for link
  url?: string;
  // for color & backgroundColor
  color?: string;
  // for inlineEquation
  equation?: string;
}

export type TTagType = 'code' | 'text' | 'link' | 'image' | 'divider' | 'inlineEquation' | 'bookmark';

export interface IHtml {
  // 文本内容
  tagType: TTagType;
  content: string;
  children?: IArticleSection[];
  // 除 code 类型以外的节点
  format?: IFlattenFormats[];
  // code 类型独有
  language?: string;
  // image 类型独有
  caption?: string;
  // to_do 类型独有
  checked?: boolean;
  // bookmark 类型独有
  link?: string;
  description?: string;
}

export interface IArticleSection extends Pick<IPageSection, 'type' | 'version' | 'id' | 'format'> {
  html: IHtml[];
}

export interface IArticleSectionGenerator {
  (properties: IPageSection['properties'], children?: IPageSection[]): IHtml[];
}

export interface ISerializeArticle {
  (article: IPageSection[]): Omit<IArticleSection, 'children'>[];
}

export interface IPage extends ITableRowData {
  article: IArticleSection[];
}
