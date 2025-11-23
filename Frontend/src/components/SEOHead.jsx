import { useEffect } from 'react';

const SEOHead = ({ 
  title = 'Legal City - Find Qualified Lawyers & Legal Services',
  description = 'Find qualified lawyers and legal professionals in your area. Connect with top-rated attorneys for corporate law, family law, criminal defense, and more legal services.',
  keywords = 'find lawyer, legal services, attorney directory, law firm, legal consultation, lawyer near me, legal advice',
  canonical = window.location.href,
  ogImage = '/og-image.jpg',
  structuredData = null
}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', canonical);
    updateMeta('og:image', ogImage);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }

    // Add structured data if provided
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
      if (script) {
        script.textContent = JSON.stringify(structuredData);
      } else {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'dynamic-structured-data';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    }
  }, [title, description, keywords, canonical, ogImage, structuredData]);

  return null;
};

export default SEOHead;