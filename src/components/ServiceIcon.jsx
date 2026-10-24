import React from 'react';

// Simple inline SVG icon set for services
const paths = {
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.1-2.1 2.7-2.5z',
  bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z',
  sparkles: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2zm7 11l1.1 3.4L23.5 17l-3.4 1.1L19 21.5l-1.1-3.4-3.4-1.1 3.4-1.1L19 13z',
  plug: 'M9 2v6H7a3 3 0 0 0-3 3v1h4v3H6v7h4v-7H8v-1a1 1 0 0 1 1-1h2v-4h2v4h2a1 1 0 0 1 1 1v1h-2v3h-2v7h4v-7h-2v-3h4v-1a3 3 0 0 0-3-3h-2V2H9z',
  roller: 'M4 3h12v5H4zM3 9h3v4H5v7a1 1 0 0 0 2 0v-7h3V9h8a2 2 0 0 1 2 2v3h-2v-2h-6v3H4a1 1 0 0 1-1-1v-3z',
  hammer: 'M13.5 3.5l7 7-2.5 2.5-7-7 2.5-2.5zM11 9L4 16l-1 5 5-1 7-7',
  shield: 'M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3zm-1.5 13l6-6-1.4-1.4-4.6 4.6-2.1-2.1-1.4 1.4 3.5 3.5z',
  scissors: 'M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 13.5L20 20l-1 2-12.5-7M20 4l-11.5 7L7.5 9 19 2l1 2z',
};

export default function ServiceIcon({ name, size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name] || paths.wrench} />
    </svg>
  );
}
