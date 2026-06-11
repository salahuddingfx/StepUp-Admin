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
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = url;
  };

  const img = new Image();
  img.src = iconUrl;
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      // Draw the logo onto canvas first
      ctx.drawImage(img, 0, 0, 32, 32);

      // Key out white / light-gray background to make it transparent
      const imgData = ctx.getImageData(0, 0, 32, 32);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is white or very close to white, key it out
        if (r > 235 && g > 235 && b > 235) {
          data[i + 3] = 0; // Alpha transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Draw notification count if specified
      if (badgeCount > 0) {
        ctx.beginPath();
        ctx.arc(25, 7, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF4D4D';
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeCount > 9 ? '9+' : badgeCount.toString(), 25, 7);
      }

      setFavicon(canvas.toDataURL('image/png'));
    } catch (e) {
      setFavicon(iconUrl);
    }
  };
  img.onerror = () => {
    setFavicon(iconUrl);
  };
};
