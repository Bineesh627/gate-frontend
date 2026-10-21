import { useEffect } from 'react';

/**
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.keywords]
 * @param {string} [props.ogImage]
 * @param {string} [props.ogTitle]
 * @param {string} [props.ogDescription]
 */
export default function SEO({
  title = '',
  description = '',
  keywords = '',
  ogImage = '',
  ogTitle = '',
  ogDescription = '',
} = {}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      let meta = document.querySelector(`meta[${attr}]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', ogDescription || description, true);
    }
    if (keywords) {
      setMeta('keywords', keywords);
    }
    if (title || ogTitle) {
      setMeta('og:title', ogTitle || title, true);
    }
    if (ogImage) {
      setMeta('og:image', ogImage, true);
    }
  }, [title, description, keywords, ogImage, ogTitle, ogDescription]);

  return null;
}
