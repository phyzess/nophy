export const NOTION_BASAL_URL = 'https://www.notion.so';

/**
 * @description notion 中保存的图片存在于 CDN 上，下载时需要补上 NOTION_BASAL_URL 的前缀，否则会报 403
 * @param {string} url
 * @param {string} width
 */
export const parseImageUrl = (url: string, width?: string): string => {
  let parsedUrl;
  if (url.startsWith('https://s3')) {
    let [parsedOriginUrl] = url.split('?');
    parsedUrl = `${NOTION_BASAL_URL}/image/${encodeURIComponent(parsedOriginUrl).replace('s3.us-west', 's3-us-west')}`;
  } else if (url.startsWith('/image')) {
    parsedUrl = `${NOTION_BASAL_URL}${url}`;
  } else {
    parsedUrl = url;
  }

  if (width) {
    return `${parsedUrl}?width=${width}`;
  } else {
    return parsedUrl;
  }
};
