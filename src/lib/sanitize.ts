import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML configuration for lesson content
 * Allows safe HTML elements while preventing XSS attacks
 */
const ALLOWED_TAGS: string[] = [
  // Text formatting
  'p', 'br', 'span', 'strong', 'em', 'u', 's', 'mark', 'small', 'sub', 'sup',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Links
  'a',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Code
  'code', 'pre',
  // Blockquotes
  'blockquote',
  // Media (with restrictions)
  'img',
  // Dividers
  'hr',
  // Divs for layout
  'div',
];

const ALLOWED_ATTR: string[] = [
  'href', 'title', 'target', 'rel', // Links
  'src', 'alt', 'width', 'height', // Images
  'class', // Styling (for prose classes)
  'colspan', 'rowspan', // Tables
];

const ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Configured specifically for lesson content with rich text formatting
 *
 * @param dirty - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```tsx
 * const safeHTML = sanitizeHTML(lesson.content);
 * <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
 * ```
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    // Prevent javascript: and data: URIs in links
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    // Allow target="_blank" but add rel="noopener noreferrer" automatically
    ADD_ATTR: ['target'],
  });
}

/**
 * Hook to transform links to open securely in new tabs
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Set all external links to open in new tab with security
  if ('target' in node && node.nodeName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitizes plain text content (removes all HTML tags)
 * Use for titles, descriptions, and other text-only fields
 *
 * @param dirty - The string to sanitize
 * @returns Plain text with all HTML stripped
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
