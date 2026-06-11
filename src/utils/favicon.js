/**
 * Dynamic Favicon and Page Title Tab Icon Manager
 */
export const initDynamicFavicon = (options = {}) => {
  const { iconUrl = '/StepUp.jpg', badgeCount = 0 } = options;

  const setFavicon = (url) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/jpeg';
      document.head.appendChild(link);
    }
    link.href = url;
  };

  // Initial set
  setFavicon(iconUrl);

  // Dynamic Badging on Tab Icon using HTML5 Canvas (like Tinycon)
  if (badgeCount > 0) {
    const img = new Image();
    img.src = iconUrl;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Draw the StepUp logo base
        ctx.drawImage(img, 0, 0, 32, 32);

        // Draw Notification bubble badge in top right corner
        ctx.beginPath();
        ctx.arc(25, 7, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF4D4D'; // Bright notifications red
        ctx.fill();

        // Draw white badge number count inside bubble
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeCount > 9 ? '9+' : badgeCount.toString(), 25, 7);

        // Update favicon href to the canvas image data URI
        setFavicon(canvas.toDataURL('image/png'));
      } catch (e) {
        // Fallback silently if canvas conversion fails due to CORS or other limits
        setFavicon(iconUrl);
      }
    };
  }
};
