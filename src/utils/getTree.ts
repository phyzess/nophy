import { NotionResponse, TNotionHashId, IPageSection } from '../types';

const getTree = (page: NotionResponse, content: TNotionHashId[], nophy: any): Promise<IPageSection[]> => {
  if (!content) {
    return Promise.resolve([]);
  }
  return Promise.all(
    content.map(async id => {
      const sec = page.recordMap.block[id];
      if (!sec) {
        return {
          id: 'no_sec',
        } as IPageSection;
      }
      let children: IPageSection[] = [];
      /**
       * toggle-list 的子列表不在 loadPageChunk 的返回值中
       * 需要单独请求
       */
      if (sec.value.type === 'toggle' && !!sec.value.content) {
        const secContent = sec.value.content;
        const {
          recordMap: { block },
        } = await (nophy.syncRecordValues(secContent) as NotionResponse);
        Object.entries(block).forEach(([key, value]) => {
          page.recordMap.block[key] = value;
        });
      }

      if (!!sec && sec.value.type !== 'page') {
        children = await getTree(page, sec.value.content, nophy);
      }
      return {
        id: sec.value.id,
        type: sec.value.type,
        version: sec.value.version,
        properties: sec.value.properties,
        format: sec.value.format,
        children,
      };
    })
  );
};

export default getTree;
