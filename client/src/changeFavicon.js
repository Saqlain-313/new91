const changeFavicon = (newFaviconPath) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    const links = document.querySelector("link[rel*='apple-touch-icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = newFaviconPath;
    links.href = newFaviconPath;
    document.getElementsByTagName('head')[0].appendChild(link);
  };
  
  export default changeFavicon