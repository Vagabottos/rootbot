
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));

  // lazy load images where possible
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    }, { threshold: 0.05 });
  
    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });

  // load images if no intersectionobserver
  } else {
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
});