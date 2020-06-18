import {
  ISerializeArticle,
  TFormatType,
  IFlattenFormats,
  IArticleSectionGenerator,
  EFormatType,
  EFormatToTagType,
  IHtml,
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
        case 'c':
          return {
            type: EFormatType[format],
          };
        default:
          return undefined;
      }
    })
    .filter((_: any) => !!_);

export const generateCodeSec: IArticleSectionGenerator = properties => [
  {
    tagType: 'code',
    content: properties.title[0][0],
    language: properties.language[0][0],
  },
];

export const generateImageSec: IArticleSectionGenerator = properties => [
  {
    tagType: 'image',
    content: properties.source[0][0],
    caption: properties.caption ? properties.caption[0][0] : null,
  },
];

export const generateNormalSec: IArticleSectionGenerator = (properties, children) =>
  properties.title.map(prop => {
    const [text, formats] = prop;
    let html = {} as IHtml;
    if (!formats || formats.length === 0) {
      html = {
        tagType: 'text',
        content: text,
      };
    } else {
      const format = flatFormats(formats);
      const isNoText = !!format.find(item => item.type === EFormatToTagType['link']);
      html = {
        tagType: isNoText ? EFormatToTagType['link'] : 'text',
        content: text,
        format,
      };
    }
    if (!!children && children.length > 0) {
      html.children = serializeArticle(children);
    }
    return html;
  });

export const serializeArticle: ISerializeArticle = article =>
  article
    .filter(s => !!s.properties)
    .map(section => {
      const { properties, type, children, ...restSectionProps } = section;
      const articleSection = { type, ...restSectionProps };

      let html;
      switch (type) {
        case 'code':
          html = generateCodeSec(properties);
          break;
        case 'image':
          html = generateImageSec(properties);
          break;
        default:
          html = generateNormalSec(properties, children);
          break;
      }

      return {
        ...articleSection,
        html,
      };
    });
