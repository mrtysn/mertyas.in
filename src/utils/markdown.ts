import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export const md = new MarkdownIt({
  html: false, // Security: don't allow raw HTML in markdown
  linkify: true, // Auto-convert URLs to links
  typographer: true, // Smart quotes, dashes, etc.
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (err) {
        console.error('Syntax highlighting error:', err);
      }
    }
    return ''; // Use default escaping
  },
});
