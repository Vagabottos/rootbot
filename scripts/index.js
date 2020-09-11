
const sets = new Set();
window.__gamedata.forEach(card => (card.set || ['Unspecified']).forEach(s => sets.add(s)));

Vue.use(BootstrapVue);

const app = new Vue({
  el: '#app',

  data: {
    cards: window.__gamedata,
    sets: [...sets].sort(),
    observer: null,
    currentSet: ''
  },
  
  methods: {
    changeSet(set) {
      this.currentSet = set === 'Unspecified' ? '' : set;
      this.cards.forEach(c => c.hide = this.currentSet && !c.set.includes(this.currentSet));
    }
  },

  created() {
    // lazy load images where possible
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          this.observer.unobserve(lazyImage);
        });
        
      }, { root: this.$el, threshold: 0.05 });
    }
  },
  
  mounted() {
    const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
    
    lazyImages.forEach((lazyImage) => {
      this.observer.observe(lazyImage);
    });

  }
});