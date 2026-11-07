import React, { useEffect } from 'react';

export type ToolTab = 'home' | 'compress-image' | 'convert-jpg' | 'compress-pdf' | 'scan-pdf';

interface SEOHeadProps {
  currentTab: ToolTab;
}

const SEO_CONFIG: Record<ToolTab, { title: string; description: string; heading: string }> = {
  home: {
    title: 'FileTools – 100% Free & Private In-Browser File Tools',
    description: 'Compress JPG to 20KB/50KB/100KB, convert JPEG/WebP to JPG, compress PDF, and scan documents with phone camera. 100% private, works offline.',
    heading: 'Free & Private In-Browser File Tools',
  },
  'compress-image': {
    title: 'Compress JPG to 20KB, 50KB, 100KB Online – Free Image Compressor',
    description: 'Compress JPG, JPEG, and PNG images to exact target sizes (20KB, 50KB, 100KB, or custom KB) online in your browser. 100% private, client-side only.',
    heading: 'Image Compressor (JPG, JPEG, PNG)',
  },
  'convert-jpg': {
    title: 'JPEG to JPG Converter Online – Free Batch Image to JPG',
    description: 'Convert .jpeg to .jpg, PNG to JPG, and WebP to JPG instantly in your browser. Batch conversion with ZIP download. 100% private and offline.',
    heading: 'JPEG to JPG Converter',
  },
  'compress-pdf': {
    title: 'Compress PDF Online to Under 100KB, 200KB, 1MB – Free PDF Compressor',
    description: 'Reduce PDF file size online in your browser without uploading to any server. Choose Low/Medium/High compression or exact target KB. 100% private.',
    heading: 'PDF Compressor',
  },
  'scan-pdf': {
    title: 'Free Online PDF Scanner – Camera Document Scanner & PDF Export',
    description: 'Scan documents using your phone camera or photos. Auto edge detection, perspective correction, B&W scanner filters, and export to PDF.',
    heading: 'Document Camera & PDF Scanner',
  },
};

export const SEOHead: React.FC<SEOHeadProps> = ({ currentTab }) => {
  useEffect(() => {
    const config = SEO_CONFIG[currentTab] || SEO_CONFIG.home;
    document.title = config.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.description);
    }

    // Update OpenGraph title & description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.description);

    // Update Twitter title & description
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', config.title);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', config.description);
  }, [currentTab]);

  return null;
};
