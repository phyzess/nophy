import { endpoints, fetchNotionGen } from './utils/fetch';
import { parsePageId, formatPageIdWithDash } from './utils/url';
import { INophyOptions, IFetchNotion } from './types';

class Nophy {
  private token: string = '';

  private fetchNotion: IFetchNotion | any = () => {};

  constructor({ token }: INophyOptions) {
    this.token = token;

    this.fetchNotion = fetchNotionGen(this.token);
  }

  public fetchPage = async (pageIdOrUrl: string, format: boolean = true) => {
    const pageId = parsePageId(pageIdOrUrl);
    const [collectionId, collectionViewId] = await this.fetchPageCollectionInfoById(pageId);
    const collectionData = await this.fetchCollectionByIds([collectionId, collectionViewId]);
    console.log('===Log Start===');
    console.log(collectionData);
    console.log('---Log End---');
    if (format) {
      return 1;
    } else {
      return 2;
    }
  };

  /**
   * @description 获取当前 token 用户下的所有页面
   * @memberof Nophy
   */
  public fetchUserContent = async () => {
    return await this.fetchNotion({ endpoint: endpoints.loadUserContent });
  };

  /**
   * @param {string} pageId
   * @description 获取页面 pageId 下的所有信息
   * @memberof Nophy
   */
  public fetchPageInfoById = async (pageId: string) => {
    const pageInfo = await this.fetchNotion({
      endpoint: endpoints.loadPageChunk,
      body: {
        pageId: formatPageIdWithDash(pageId),
      },
    });
    return pageInfo;
  };

  /**
   * @param {string} pageId
   * @description 获取页面 pageId 下的 collectionId, collectionViewId 信息
   * @memberof Nophy
   */
  public fetchPageCollectionInfoById = async (pageId: string) => {
    const pageInfo = await this.fetchPageInfoById(pageId);
    const collectionId = Object.entries(pageInfo.recordMap.collection)[0][0];
    const collectionViewId = Object.entries(pageInfo.recordMap['collection_view'])[0][0];
    return [collectionId, collectionViewId];
  };

  /**
   * @param {[string, string]} [collectionId, collectionViewId]
   * @description 根据指定 collectionId, collectionViewId ，获取 Notion 的集合组件数据，比如 table, list
   * @memberof Nophy
   */
  public fetchCollectionByIds = async ([collectionId, collectionViewId]: string[]) => {
    const collectionInfo = await this.fetchNotion({
      endpoint: endpoints.queryCollection,
      body: {
        collectionId,
        collectionViewId,
        query: {},
        loader: {
          type: 'table',
          limit: 70,
          searchQuery: '',
          userTimeZone: 'Asia/Shanghai',
          userLocale: 'en',
          loadContentCover: true,
        },
      },
    });
    return collectionInfo;
  };
}

export default Nophy;
