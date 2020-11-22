import {
  ISerializeArticle,
  TFormatType,
  IFlattenFormats,
  IArticleSectionGenerator,
  EFormatType,
  EFormatToTagType,
  IHtml,
  ITableRowBlock,
} from '../types';

export const NOTION_BASAL_URL = 'https://www.notion.so';

/**
 * @description notion 中保存的图片存在于 CDN 上，下载时需要补上 NOTION_BASAL_URL 的前缀，否则会报 403
 * @param {string} url
 * @param {string} width
 */
export const parseImageUrl = (url: string, block?: ITableRowBlock, width?: string): string => {
  let parsedUrl;
  if (url.startsWith('https://s3')) {
    let [parsedOriginUrl] = url.split('?');
    parsedUrl = `${NOTION_BASAL_URL}/image/${encodeURIComponent(parsedOriginUrl).replace('s3.us-west', 's3-us-west')}`;
  } else if (url.startsWith('/image')) {
    parsedUrl = `${NOTION_BASAL_URL}${url}`;
  } else {
    parsedUrl = url;
  }

  const image = new URL(parsedUrl);

  if (block) {
    const table = block.parent_table === 'collection' ? 'block' : block.parent_table;
    image.searchParams.set('table', table);
    image.searchParams.set('id', block.id as string);
    image.searchParams.set('cache', 'v2');
    if (width) {
      image.searchParams.set('width', width as string);
    }
  }

  return image.toString();
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
        case 'e':
          return {
            type: 'inlineEquation',
            equation: addons,
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

export const getHtmlTagType = (format: IFlattenFormats[]) => {
  for (const { type } of format) {
    if (type === EFormatToTagType['link']) {
      return 'link';
    }
    if (type === EFormatToTagType['inlineEquation']) {
      return 'inlineEquation';
    }
  }
  return 'text';
};

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

export const generateDividerSec: IArticleSectionGenerator = () => [
  {
    tagType: 'divider',
    content: 'divider',
  },
];

export const generateBookmarkSec: IArticleSectionGenerator = properties => [
  {
    tagType: 'bookmark',
    content: properties.title[0][0],
    link: properties.link[0][0],
    description: properties.description[0][0],
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
      const equation = format.find(f => f.type === 'inlineEquation')?.equation || '';
      const tagType = getHtmlTagType(format);
      let content = text;
      if (tagType === 'inlineEquation') {
        content = equation;
      }

      html = {
        tagType,
        content,
        format,
      };
    }
    if (!!children && children.length > 0) {
      html.children = serializeArticle(children);
    }
    return html;
  });

export const generateToDolSec: IArticleSectionGenerator = (properties, children) =>
  generateNormalSec(properties, children).map(html => ({
    ...html,
    checked: properties.checked && properties.checked[0][0].toUpperCase() === 'YES',
  }));

export const serializeArticle: ISerializeArticle = article =>
  article
    .filter(s => !!s.properties || s.type === 'divider')
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
        case 'to_do':
          html = generateToDolSec(properties, children);
          break;
        case 'divider':
          html = generateDividerSec(properties);
          break;
        case 'bookmark':
          html = generateBookmarkSec(properties);
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
