'use client';
import { useEffect, useRef } from 'react';

// Ad configurations mapped to placements
const AD_CONFIGS = {
  header: {
    key: 'b1d0e9d63b2b0e3ec8c1dc38a9e982f5',
    height: 90,
    width: 728,
    label: '728 × 90',
  },
  feed: {
    key: '796e7274c6e3440b8b5e111f270dee71',
    height: 60,
    width: 468,
    label: '468 × 60',
  },
  player: {
    key: '796e7274c6e3440b8b5e111f270dee71',
    height: 60,
    width: 468,
    label: '468 × 60',
  },
  sidebar: {
    key: 'df69b24a0b48387ec589364858c96ae5',
    height: 300,
    width: 160,
    label: '160 × 300',
  },
  mobile: {
    key: '7aa3af043cf087325cffe2df0488feff',
    height: 50,
    width: 320,
    label: '320 × 50',
  },
};

export default function AdBanner({ placement = 'header' }) {
  const containerRef = useRef(null);
  const config = AD_CONFIGS[placement];

  useEffect(() => {
    if (!config || !containerRef.current) return;

    // Clear any previous ad
    containerRef.current.innerHTML = '';

    // Set global atOptions before loading the script
    window.atOptions = {
      key: config.key,
      format: 'iframe',
      height: config.height,
      width: config.width,
      params: {},
    };

    // Dynamically inject the ad script
    const script = document.createElement('script');
    script.src = `https://www.highrevenueformat.com/${config.key}/invoke.js`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [placement, config?.key]);

  if (!config) return null;

  return (
    <div
      className={`ad-banner ad-${placement}`}
      aria-label="Advertisement"
      style={{ minHeight: config.height, justifyContent: 'center' }}
    >
      <div ref={containerRef} />
    </div>
  );
}
