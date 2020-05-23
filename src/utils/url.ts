/**
 * @description 做个是否是 notion 页面 url 的简单判断
 * @param str
 */
export const isNotionPageUrl = (pageId: string) => /^(https:\/\/)?www.notion.so/.test(pageId);

/**
 * @description 去除 pageId 中的破折号
 * @param {string} pageId
 */
export const formatPageIdWithoutDash = (pageId: string) => pageId.replace(/-/g, '');

/**
 *
 * @param {string} pageId
 */
export const formatPageIdWithDash = (pageId: string) => {
  if (/-/.test(pageId)) {
    return pageId;
  }

  return (
    pageId.substring(0, 8) +
    '-' +
    pageId.substring(8, 12) +
    '-' +
    pageId.substring(12, 16) +
    '-' +
    pageId.substring(16, 20) +
    '-' +
    pageId.substring(20)
  );
};

/**
 * @description notion 页面的 url 规则目前为： https://www.notion.so/${uername}/${pageId}?v=${hash}
 *              一个 notion 页面的 pageId 有两种获取方式:
 *              1. 从 url 中获取（无破折号）
 *              2. 页面 loadPageChunk 请求中有对应字段（有破折号）
 *              两种获取到的 pageId 格式不一致，统一转换为的不带有 '-' 的字符串，待到请求时再转换为带有 '-' 的
 * @param {string} pageIdOrUrl
 */
export const parsePageId = (pageIdOrUrl: string) => {
  let pageId = '';
  if (isNotionPageUrl(pageIdOrUrl)) {
    const pageIdInArr = pageIdOrUrl.split('?')[0].split('/');
    pageId = pageIdInArr[pageIdInArr.length - 1];
  } else {
    pageId = formatPageIdWithoutDash(pageIdOrUrl);
  }

  return pageId;
};
