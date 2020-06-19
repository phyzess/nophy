import { merge } from 'lodash';
import getTree from './utils/getTree';
import { serializeArticle } from './utils/serializer';
import {
  TNotionHashId,
  INotionBlock,
  ISchema,
  ITableRowProperties,
  ITableRowBlock,
  ITableRowData,
  NotionResponse,
  TRowFilter,
  IPage,
} from './types';

/**
 * 一个 table collection 的返回值 response 中：
 * response.result.type: collection 类型
 * response.recordMap.collection[id]：当前 collection 的信息集合
 * response.recordMap.collection_view[id]: 以 key: value 形式记录了当前 collection 的格式化方式集合
 *
 * response.recordMap.collection_view[id].value.format.table_properties：table columns 字段，列举了一个 table 有哪些列，列的字段名
 * response.recordMap.collection[id].value.schema[columnId]：table 的每一个 column 的值类型
 *
 * response.result.blockIds / response.recordMap.page_sort ：子 page 的 id，也是 table row 的字段名，可用于在 recordMap.block 中进行筛选, 或直接用 loadPageChunk 获取
 *
 */

export default class TableCollection {
  //  notion 服务器返回的原始数据
  public originCollection: NotionResponse;
  public collectionId = '';
  public collectionViewId = '';
  // 当前 collectionID 下的 value
  public collectionValue = {};
  // table columns 的 key-value 结构
  public schema: ISchema = {};
  // table rows 数目
  public total = 0;
  // table row 的字段名
  public blockIds: TNotionHashId[] = [];
  // table rows 数据，key-value 结构
  public blocks: INotionBlock = {};
  // nophy 引用
  public nophy: any = {};

  constructor(
    collectionId: TNotionHashId,
    collectionViewId: TNotionHashId,
    collectionResponse: NotionResponse,
    nophy: any
  ) {
    this.originCollection = collectionResponse;
    this.collectionId = collectionId;
    this.collectionViewId = collectionViewId;
    this.collectionValue = collectionResponse.recordMap.collection[collectionId].value;
    this.blocks = collectionResponse.recordMap.block;
    this.blockIds = collectionResponse.result.blockIds;

    this.schema = collectionResponse.recordMap.collection[collectionId].value.schema;
    this.total = collectionResponse.result.total;

    this.nophy = nophy;

    return this;
  }

  public getRowData = (rowFilter: TRowFilter = () => true): ITableRowData[] =>
    this.blockIds
      .map(this.getBlockData)
      .filter(_ => !!_ && !!_.id)
      .map(({ id, properties, ...restRowData }) => {
        const props: any = {};
        Object.values(properties).forEach(({ colLabel, colType, value }) => {
          switch (colType) {
            case 'file':
              props[colLabel] = {
                name: value[0].name,
                url: value[0].value,
              };
              break;
            default:
              props[colLabel] = value[0];
              break;
          }
        });
        return {
          ...restRowData,
          ...props,
          rowId: id,
        };
      })
      .filter(rowFilter);

  public getBlockData = (blockId: TNotionHashId): ITableRowBlock => {
    const block = this.blocks[blockId];
    if (!!block && !!block.value.properties) {
      const {
        value: { id, type, properties, ...restBlockData },
      } = block;
      return {
        id,
        type,
        primaryKey: 'title',
        properties: Object.entries(properties).reduce(
          (acc, [key, values]) => ({
            ...acc,
            ...this.getPropertyValue(key, values),
          }),
          {}
        ),
        ...restBlockData,
      };
    }
    return {
      id: undefined,
      type: undefined,
      primaryKey: undefined,
      properties: {},
    };
  };

  public getPropertyValue = (propertyKey: string, propertyValues: any[]): ITableRowProperties => {
    const propertySchema = this.schema[propertyKey];
    /**
     * Notion 中删除 table 列，会在 schema 中删除列信息，但是 row 信息中的对应数据其实没有删掉
     * 所以这里需要进行空值判断
     */
    if (!propertySchema) {
      return {};
    }

    const { name, type } = propertySchema;
    let value;
    switch (type) {
      case 'file':
        // files & media
        value = propertyValues.reduce((acc, property) => {
          // notion 允许上传多个文件, 已多维数组形式存储，分隔符为 [,]
          if (property[0] !== ',') {
            return acc.concat([
              {
                name: property[0],
                value: property[1][0][1],
              },
            ]);
          }
        }, []);
        break;
      case 'date':
        value = [propertyValues[0][1][0][1]['start_date']];
        break;
      default:
        value = propertyValues[0];
    }

    return {
      [propertyKey]: {
        colKey: propertyKey,
        colLabel: name,
        colType: type,
        value,
      },
    };
  };

  /**
   * @description loadPages 获取文章的内容，返回一个树形结构
   */
  public loadPages = (rowFilter: TRowFilter = () => true): Promise<IPage[]> =>
    Promise.all(
      this.getRowData(rowFilter).map(async _ => {
        const allChunkNeeded = Math.ceil(_.content.length / 45);
        let post;
        if (allChunkNeeded === 1) {
          post = await this.nophy.fetchPageInfoById(_.rowId);
        } else {
          // 以 45 条为界，loadPageChunk 请求需要递增 allChunkNumber 以及 stack 中的 index（步长 50）
          const emptyArr = new Array(allChunkNeeded).fill(0);
          const postByChunkNumber = await Promise.all(
            emptyArr.map(async (_zero, index) => await this.nophy.fetchPageInfoById(_.rowId, index))
          );
          post = postByChunkNumber.reduce((prev, cur) => merge(prev, cur), {});
        }
        const article = await getTree(post, _.content, this.nophy);

        return {
          ..._,
          article: serializeArticle(article),
        };
      })
    );
}
