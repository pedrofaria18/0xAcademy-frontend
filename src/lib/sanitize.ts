import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS: string[] = [
  'p', 'br', 'span', 'strong', 'em', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'code', 'pre',
  'blockquote',
  'img',
  'hr',
  'div',
];

const ALLOWED_ATTR: string[] = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class',
  'colspan', 'rowspan',
];

const ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;


export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    ADD_ATTR: ['target'],
  });
}

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if ('target' in node && node.nodeName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
