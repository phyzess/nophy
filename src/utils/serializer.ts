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
export const serialize = () => {};
