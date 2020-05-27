import nodeFetch from 'node-fetch';
import { IFetchNotionGen, IFetchNotion } from '../types';

export const NOTION_BASE_URL = 'https://www.notion.so/api/v3';

export const endpoints = {
  // 获取当前用户下的所有页面基础信息
  loadUserContent: '/loadUserContent',
  // 获取一个页面的全部信息
  loadPageChunk: '/loadPageChunk',
  // 获取 Notion 的集合组件数据，比如 table, list
  queryCollection: '/queryCollection',
  // 获取某一个 hashId 的 record 数据
  getRecordValues: '/getRecordValues',
  // 批量获取某些 id Collection 的数据
  syncRecordValues: '/syncRecordValues',
};

export const fetchNotionGen: IFetchNotionGen = token => {
  const cookie = token ? `token_v2=${token};` : '';

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh,en;q=0.9,en-US;q=0.8,zh-CN;q=0.7',
    'content-type': 'application/json',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    cookie,
  };

  const defaultBody = {
    limit: 50,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false,
  };

  const fetchNotion: IFetchNotion = async ({ endpoint, body }) => {
    try {
      const fetchResult = await nodeFetch(`${NOTION_BASE_URL}${endpoint}`, {
        headers,
        body: JSON.stringify({
          ...defaultBody,
          ...body,
        }),
        method: 'POST',
      });
      return await fetchResult.json();
    } catch (error) {
      console.log('=== fetch error ===');
      console.log(error);
      console.log('--- fetch error ---');
    }
  };

  return fetchNotion;
};
