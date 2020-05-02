import { TNotionHashId, INotionBlock, ISchema, NotionResponse } from './types';

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

  constructor(collectionId: TNotionHashId, collectionViewId: TNotionHashId, collectionResponse: NotionResponse) {
    this.collectionId = collectionId;
    this.collectionViewId = collectionViewId;
    this.collectionValue = collectionResponse.recordMap.collection[collectionId].value;
    this.blocks = collectionResponse.recordMap.block;
    this.blockIds = collectionResponse.result.blockIds;

    this.schema = collectionResponse.recordMap.collection[collectionId].value.schema;
    this.total = collectionResponse.result.total;

    return this;
  }

  public getRowData = () => {
    return this.blockIds.map(blockId => this.getBlockData(blockId));
  };

  public getBlockData = (blockId: TNotionHashId) => {
    const block = this.blocks[blockId];
    if (!!block) {
      const {
        value: { id, type, properties },
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
      };
    }
    return undefined;
  };

  public getPropertyValue = (propertyKey: string, propertyValues: any[]) => {
    const propertySchema = this.schema[propertyKey];
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
}
