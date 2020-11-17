
const sets = new Set();
window.__gamedata.forEach(card => (card.set || ['Unspecified']).forEach(s => sets.add(s)));

Vue.use(BootstrapVue);
Vue.component('tippy', window.VueTippy.TippyComponent);

const app = new Vue({
  el: '#app',

  data: {
    cards: window.__gamedata,
    sets: [...sets].sort(),
    observer: null,
    currentSet: '',
    faqHash: {},
    faqSubmitUrl: ''
  },
  
  methods: {
    changeSet(set) {
      this.currentSet = set === 'Unspecified' ? '' : set;
      this.cards.forEach(c => c.hide = this.currentSet && !c.set.includes(this.currentSet));
    },

    cleanText(entryText) {
      return entryText.split('$link:').join('').split('$').join('');
    },

    tippyFor(entry) {
      if(!entry) return '';
      return entry.map((x, i) => `
        <div class="tt ${i > 0 ? 'mt-4' : ''}">
          <div class="q">
            <p><strong>Q</strong>:</p>
            <span class="text">${this.cleanText(x.q)}</span>
          </div>
          <div class="a">
            <p><strong>A</strong>:</p>
            <span class="text">${this.cleanText(x.a)}</span>
          </div>
        </div>
      `).join('');
    }
  },

  async created() {
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
    

    if(window.__faqurl) {
      const faq = await fetch(window.__faqurl);
      const entries = await faq.json();

      const faqHash = {};
      entries.forEach(entry => {
        faqHash[entry.card] = entry.faq;
      });

      this.faqHash = faqHash;
    }

    if(window.__faqsubmiturl) {
      this.faqSubmitUrl = window.__faqsubmiturl;
    }
  },
  
  mounted() {
    const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
    
    lazyImages.forEach((lazyImage) => {
      this.observer.observe(lazyImage);
    });

  }
});