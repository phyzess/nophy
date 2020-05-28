import {
  IPageSection,
  IArticleSection,
  TFormatType,
  IFlattenFormats,
  TArticleSectionGenerator,
  EFormatType,
  EFormatToTagType,
} from '../types';

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

export const flatFormats = (formats: any): IFlattenFormats[] =>
  formats
    .map(([format, addons]: [TFormatType, any]) => {
      switch (format) {
        case 'a':
          return {
            type: EFormatType['a'],
            url: addons,
          };
        case 'h':
          const isBg = addons.endsWith('_background');
          return {
            type: isBg ? 'backgroundColor' : 'color',
            color: addons.split('_')[0],
          };
        case 'b':
        case 'i':
        case 's':
          return {
            type: EFormatType[format],
          };
        default:
          return undefined;
      }
    })
    .filter((_: any) => !!_);

export const generateCodeSec: TArticleSectionGenerator = properties => [
  {
    tagType: 'code',
    text: properties.title[0][0],
    language: properties.language[0][0],
  },
];

export const generateNormalSec: TArticleSectionGenerator = properties =>
  properties.title.map(prop => {
    const [text, formats] = prop;
    if (!formats || formats.length === 0) {
      return {
        tagType: 'text',
        text,
      };
    } else {
      const format = flatFormats(formats);
      const isNoText = !!format.find(item => item.type === EFormatToTagType['link']);
      return {
        tagType: isNoText ? EFormatToTagType['link'] : 'text',
        text,
        format,
      };
    }
  });

export const serializeArticle = (article: IPageSection[]): IArticleSection[] =>
  article
    .filter(s => !!s.properties)
    .map(section => {
      const { properties, type, ...restSectionProps } = section;
      const articleSection = { type, ...restSectionProps };

      let html;
      switch (type) {
        case 'code':
          html = generateCodeSec(properties);
          break;
        default:
          html = generateNormalSec(properties, type);
          break;
      }

      return {
        ...articleSection,
        html,
      };
    });
