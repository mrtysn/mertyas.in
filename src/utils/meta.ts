/**
 * Update page meta tags for social sharing
 */
export function updateMetaTags(config: {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article';
  date?: string;
  image?: string;
}) {
  const { title, description, url, type = 'website', date, image } = config;
  const fullTitle = title === 'Mert Yaşin' ? title : `${title} - Mert Yaşin`;

  // Update document title
  document.title = fullTitle;

  // Helper to set meta tag
  const setMeta = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  const setMetaName = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  // Standard meta
  setMetaName('description', description);

  // Open Graph
  setMeta('og:title', title);
  setMeta('og:description', description);
  setMeta('og:url', url);
  setMeta('og:type', type);
  setMeta('og:site_name', 'Mert Yaşin');

  // Image support
  if (image) {
    const imageUrl = image.startsWith('http') ? image : `https://mertyas.in${image}`;
    setMeta('og:image', imageUrl);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:type', 'image/png');

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:image', imageUrl);
  } else {
    setMetaName('twitter:card', 'summary');
  }

  // Twitter Card
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);

  // Article specific
  if (type === 'article' && date) {
    setMeta('article:published_time', new Date(date).toISOString());
    setMeta('article:author', 'Mert Yaşin');
  }
}
