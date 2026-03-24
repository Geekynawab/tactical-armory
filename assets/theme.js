/* ==========================================================================
   VALORANT SHOPIFY THEME — theme.js
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Utility helpers
     -------------------------------------------------------------------------- */
  function $(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }
  function $$(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }
  function on(el, event, handler, opts) {
    if (el) el.addEventListener(event, handler, opts);
  }
  function off(el, event, handler) {
    if (el) el.removeEventListener(event, handler);
  }
  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  /* --------------------------------------------------------------------------
     1. Cart Drawer
     -------------------------------------------------------------------------- */
  var CartDrawer = {
    drawer:  null,
    overlay: null,
    body:    null,
    footer:  null,

    init: function () {
      this.drawer  = $('#cart-drawer');
      this.overlay = $('#cart-drawer-overlay');
      this.body    = $('#cart-drawer-body');
      this.footer  = $('#cart-drawer-footer');

      if (!this.drawer) return;

      // Open: cart icon click
      on(document, 'click', function (e) {
        var trigger = e.target.closest('[data-cart-open]');
        if (trigger) {
          e.preventDefault();
          CartDrawer.open();
        }
      });

      // Close: overlay / close button
      on(this.overlay, 'click', function () { CartDrawer.close(); });
      on($('#cart-drawer-close'), 'click', function () { CartDrawer.close(); });

      // Close on Escape
      on(document, 'keydown', function (e) {
        if (e.key === 'Escape') CartDrawer.close();
      });

      // Qty & remove clicks inside drawer
      on(this.body, 'click', function (e) {
        var incBtn    = e.target.closest('[data-qty-inc]');
        var decBtn    = e.target.closest('[data-qty-dec]');
        var removeBtn = e.target.closest('[data-cart-remove]');

        if (incBtn)    CartDrawer.updateQty(incBtn.dataset.qtyInc, 1);
        if (decBtn)    CartDrawer.updateQty(decBtn.dataset.qtyDec, -1);
        if (removeBtn) CartDrawer.removeItem(removeBtn.dataset.cartRemove);
      });
    },

    open: function () {
      this.drawer.classList.add('open');
      this.overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.fetch();
    },

    close: function () {
      this.drawer.classList.remove('open');
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    },

    fetch: function () {
      var self = this;
      fetch('/cart.js')
        .then(function (r) { return r.json(); })
        .then(function (cart) { self.render(cart); })
        .catch(function () {
          self.body.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">Could not load cart.</p>';
        });
    },

    render: function (cart) {
      if (cart.item_count === 0) {
        this.body.innerHTML =
          '<div class="cart-drawer--empty">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
          '<p>Your arsenal is empty.</p>' +
          '<a href="/collections/all" class="btn btn--outline btn--sm">Browse Products</a>' +
          '</div>';
        this.footer.innerHTML = '';
        return;
      }

      var itemsHtml = cart.items.map(function (item) {
        return (
          '<div class="cart-item" data-key="' + item.key + '">' +
          '<img class="cart-item__image" src="' + (item.image ? item.image.replace('_large', '_medium') : '') + '" alt="' + item.product_title + '">' +
          '<div class="cart-item__info">' +
          '<div class="cart-item__title">' + item.product_title + '</div>' +
          (item.variant_title ? '<div class="cart-item__variant">' + item.variant_title + '</div>' : '') +
          '<div class="cart-item__bottom">' +
          '<div class="qty-selector">' +
          '<button data-qty-dec="' + item.key + '">−</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button data-qty-inc="' + item.key + '">+</button>' +
          '</div>' +
          '<span class="product-card__price">' + formatMoney(item.line_price) + '</span>' +
          '</div>' +
          '<button class="cart-item__remove" data-cart-remove="' + item.key + '">Remove</button>' +
          '</div>' +
          '</div>'
        );
      }).join('');

      this.body.innerHTML = itemsHtml;

      this.footer.innerHTML =
        '<div class="cart-subtotal">' +
        '<span>Subtotal</span>' +
        '<span>' + formatMoney(cart.total_price) + '</span>' +
        '</div>' +
        '<a href="/checkout" class="btn btn--primary btn--full">Checkout</a>' +
        '<a href="/cart" class="btn btn--ghost btn--full" style="margin-top:0.5rem">View Cart</a>';

      // Update header cart count badge
      var badges = $$('.cart-count');
      badges.forEach(function (b) { b.textContent = cart.item_count || ''; });
    },

    updateQty: function (key, delta) {
      var self = this;
      var item = $('[data-key="' + key + '"]', this.body);
      var qtyEl = item ? $('span', $('.qty-selector', item)) : null;
      var currentQty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
      var newQty = Math.max(0, currentQty + delta);

      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) { self.render(cart); });
    },

    removeItem: function (key) {
      this.updateQty(key, -9999);
    }
  };

  /* --------------------------------------------------------------------------
     2. Add to Cart (product page & quick-add)
     -------------------------------------------------------------------------- */
  var AddToCart = {
    init: function () {
      on(document, 'submit', function (e) {
        var form = e.target.closest('[data-add-to-cart-form]');
        if (!form) return;
        e.preventDefault();
        AddToCart.submit(form);
      });

      // Quick add buttons
      on(document, 'click', function (e) {
        var btn = e.target.closest('[data-quick-add]');
        if (!btn) return;
        e.preventDefault();
        var variantId = btn.dataset.quickAdd;
        AddToCart.addVariant(variantId, 1, btn);
      });
    },

    submit: function (form) {
      var submitBtn = $('[type="submit"]', form);
      var formData  = new FormData(form);
      var payload   = {};
      formData.forEach(function (v, k) { payload[k] = v; });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Adding…';
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payload.id, quantity: parseInt(payload.quantity, 10) || 1 })
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          if (submitBtn) {
            submitBtn.textContent = 'Added!';
            setTimeout(function () {
              submitBtn.disabled = false;
              submitBtn.classList.remove('loading');
              submitBtn.textContent = 'Add to Cart';
            }, 1500);
          }
          CartDrawer.open();
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Error — Try Again';
          }
        });
    },

    addVariant: function (variantId, qty, btn) {
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: qty })
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Added!'; setTimeout(function () { btn.textContent = 'Quick Add'; }, 1500); }
          CartDrawer.open();
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Error'; }
        });
    }
  };

  /* --------------------------------------------------------------------------
     3. Mobile Navigation
     -------------------------------------------------------------------------- */
  var MobileNav = {
    hamburger: null,
    nav:       null,

    init: function () {
      this.hamburger = $('#hamburger-btn');
      this.nav       = $('#mobile-nav');
      if (!this.hamburger) return;

      on(this.hamburger, 'click', function () { MobileNav.toggle(); });

      // Accordion sub-menus
      on(this.nav, 'click', function (e) {
        var toggle = e.target.closest('[data-mobile-toggle]');
        if (!toggle) return;
        var sub = $('#' + toggle.dataset.mobileToggle);
        if (sub) sub.classList.toggle('open');
        toggle.querySelector('.toggle-icon').textContent =
          sub && sub.classList.contains('open') ? '−' : '+';
      });
    },

    toggle: function () {
      var isOpen = this.hamburger.classList.toggle('open');
      this.nav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  };

  /* --------------------------------------------------------------------------
     4. Variant Selector (product page)
     -------------------------------------------------------------------------- */
  var VariantSelector = {
    variants: [],
    selectedOptions: [],

    init: function () {
      var dataEl = $('#product-variants-json');
      if (!dataEl) return;

      try { this.variants = JSON.parse(dataEl.textContent); } catch (e) { return; }

      // Seed selected options from active buttons
      $$('[data-variant-group]').forEach(function (group) {
        var idx = parseInt(group.dataset.variantGroup, 10);
        var activeBtn = $('.variant-btn.active', group);
        VariantSelector.selectedOptions[idx] = activeBtn ? activeBtn.dataset.optionValue : null;
      });

      on(document, 'click', function (e) {
        var btn = e.target.closest('.variant-btn');
        if (!btn) return;
        var group = btn.closest('[data-variant-group]');
        if (!group) return;

        $$('.variant-btn', group).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var idx = parseInt(group.dataset.variantGroup, 10);
        VariantSelector.selectedOptions[idx] = btn.dataset.optionValue;
        VariantSelector.updateVariant();
      });
    },

    updateVariant: function () {
      var selected = this.selectedOptions;
      var match = this.variants.find(function (v) {
        return v.options.every(function (opt, i) {
          return selected[i] === undefined || selected[i] === opt;
        });
      });
      if (!match) return;

      // Update hidden variant ID
      var idInput = $('#variant-id-input');
      if (idInput) idInput.value = match.id;

      // Update price display
      var priceEl = $('#product-price');
      if (priceEl) {
        var inflated = Math.ceil(match.price * 1.3);
        priceEl.innerHTML =
          '<span class="sale">' + formatMoney(match.price) + '</span>' +
          '<span class="compare-at">' + formatMoney(inflated) + '</span>';
      }

      // Update add to cart button availability
      var addBtn = $('[data-add-to-cart-form] [type="submit"]');
      if (addBtn) {
        addBtn.disabled = !match.available;
        addBtn.textContent = match.available ? 'Add to Arsenal' : 'Sold Out';
      }
    }
  };

  /* --------------------------------------------------------------------------
     5. Product Gallery (thumbnail clicks)
     -------------------------------------------------------------------------- */
  var ProductGallery = {
    init: function () {
      on(document, 'click', function (e) {
        var thumb = e.target.closest('.product-gallery__thumb');
        if (!thumb) return;
        var gallery = thumb.closest('.product-gallery');
        if (!gallery) return;

        var mainImg = $('.product-gallery__main img', gallery);
        var src     = thumb.dataset.src;
        if (mainImg && src) mainImg.src = src;

        $$('.product-gallery__thumb', gallery).forEach(function (t) {
          t.classList.remove('active');
        });
        thumb.classList.add('active');
      });
    }
  };

  /* --------------------------------------------------------------------------
     6. Gallery Zoom + Lightbox
     -------------------------------------------------------------------------- */
  var GalleryZoom = {
    lb: null,

    init: function () {
      var mainWrap = document.querySelector('.product-gallery__main');
      if (!mainWrap) return;

      // Build lightbox
      var lb = document.createElement('div');
      lb.className = 'gallery-lightbox';
      lb.innerHTML =
        '<button class="gallery-lightbox__close" aria-label="Close">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button><img class="gallery-lightbox__img" src="" alt="">';
      document.body.appendChild(lb);
      this.lb = lb;

      var self = this;

      // Hover zoom — desktop only
      on(mainWrap, 'mousemove', function (e) {
        var img = mainWrap.querySelector('img');
        if (!img) return;
        var rect = mainWrap.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        img.style.transition = 'none';
        img.style.transformOrigin = x + '% ' + y + '%';
        img.style.transform = 'scale(2.2)';
      });

      on(mainWrap, 'mouseleave', function () {
        var img = mainWrap.querySelector('img');
        if (!img) return;
        img.style.transition = 'transform 0.3s ease';
        img.style.transform = '';
        img.style.transformOrigin = 'center center';
      });

      // Click → lightbox (works on touch too)
      on(mainWrap, 'click', function () {
        var img = mainWrap.querySelector('img');
        if (!img) return;
        var hiResSrc = img.src.replace(/width=\d+/, 'width=2000');
        lb.querySelector('.gallery-lightbox__img').src = hiResSrc;
        lb.querySelector('.gallery-lightbox__img').alt = img.alt;
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      // Close lightbox
      on(lb.querySelector('.gallery-lightbox__close'), 'click', function () { self.close(); });
      on(lb, 'click', function (e) { if (e.target === lb) self.close(); });
      on(document, 'keydown', function (e) { if (e.key === 'Escape') self.close(); });
    },

    close: function () {
      if (this.lb) this.lb.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /* --------------------------------------------------------------------------
     7. Announcement Bar dismiss
     -------------------------------------------------------------------------- */
  var AnnouncementBar = {
    init: function () {
      var closeBtn = $('.announcement-bar__close');
      var bar      = $('.announcement-bar');
      if (!closeBtn || !bar) return;

      // Restore dismissed state
      if (sessionStorage.getItem('announcement-dismissed')) {
        bar.style.display = 'none';
        return;
      }

      on(closeBtn, 'click', function () {
        bar.style.display = 'none';
        sessionStorage.setItem('announcement-dismissed', '1');
      });
    }
  };

  /* --------------------------------------------------------------------------
     7. Age Verification
     -------------------------------------------------------------------------- */
  var AgeVerify = {
    init: function () {
      var modal   = $('#age-verify-modal');
      var yesBtn  = $('#age-verify-yes');
      if (!modal) return;

      if (!localStorage.getItem('age-verified')) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }

      on(yesBtn, 'click', function () {
        localStorage.setItem('age-verified', '1');
        modal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
  };

  /* --------------------------------------------------------------------------
     8. Cookie Consent
     -------------------------------------------------------------------------- */
  var CookieBanner = {
    init: function () {
      var banner  = $('#cookie-banner');
      var accept  = $('#cookie-accept');
      if (!banner) return;

      if (!localStorage.getItem('cookie-accepted')) {
        banner.style.display = 'flex';
      }

      on(accept, 'click', function () {
        localStorage.setItem('cookie-accepted', '1');
        banner.style.display = 'none';
      });
    }
  };

  /* --------------------------------------------------------------------------
     9. Sticky header offset for anchor links
     -------------------------------------------------------------------------- */
  function stickyScrollOffset() {
    var header = $('.site-header');
    if (!header) return;
    var h = header.offsetHeight;
    document.documentElement.style.scrollPaddingTop = h + 'px';
  }

  /* --------------------------------------------------------------------------
     10. Collection sort redirect
     -------------------------------------------------------------------------- */
  function initCollectionSort() {
    var sel = $('.collection-sort select');
    if (!sel) return;
    on(sel, 'change', function () {
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', sel.value);
      window.location.href = url.toString();
    });
  }

  /* --------------------------------------------------------------------------
     11. Lazy load images (native)
     -------------------------------------------------------------------------- */
  function lazyImages() {
    $$('img[data-src]').forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  /* --------------------------------------------------------------------------
     11. Search Overlay
     -------------------------------------------------------------------------- */
  var SearchOverlay = {
    overlay: null,
    input: null,

    init: function () {
      this.overlay = $('#search-overlay');
      this.input   = $('#search-overlay-input');
      if (!this.overlay) return;

      on($('#search-toggle'), 'click', function () { SearchOverlay.open(); });
      on($('#search-close'),  'click', function () { SearchOverlay.close(); });
      on(this.overlay, 'click', function (e) {
        if (e.target === SearchOverlay.overlay) SearchOverlay.close();
      });
      on(document, 'keydown', function (e) {
        if (e.key === 'Escape') SearchOverlay.close();
      });
    },

    open: function () {
      this.overlay.classList.add('open');
      this.overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (this.input) setTimeout(function () { SearchOverlay.input.focus(); }, 50);
    },

    close: function () {
      this.overlay.classList.remove('open');
      this.overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  /* --------------------------------------------------------------------------
     12. Wishlist
     -------------------------------------------------------------------------- */
  var Wishlist = {
    key: 'valo-wishlist',

    get: function () {
      try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return []; }
    },

    save: function (ids) {
      localStorage.setItem(this.key, JSON.stringify(ids));
    },

    toggle: function (id) {
      var ids = this.get();
      var idx = ids.indexOf(id);
      if (idx === -1) { ids.push(id); } else { ids.splice(idx, 1); }
      this.save(ids);
      this.updateUI();
      return idx === -1;
    },

    has: function (id) {
      return this.get().indexOf(id) !== -1;
    },

    updateUI: function () {
      var ids   = this.get();
      var badge = $('#wishlist-count');
      if (badge) badge.textContent = ids.length > 0 ? ids.length : '';

      $$('[data-wishlist]').forEach(function (btn) {
        var id = parseInt(btn.dataset.wishlist, 10);
        btn.classList.toggle('active', ids.indexOf(id) !== -1);
      });
    },

    init: function () {
      this.updateUI();

      on(document, 'click', function (e) {
        var btn = e.target.closest('[data-wishlist]');
        if (!btn) return;
        e.preventDefault();
        var id = parseInt(btn.dataset.wishlist, 10);
        Wishlist.toggle(id);
      });

      on($('#wishlist-icon'), 'click', function (e) {
        if (e.target.closest('[data-wishlist]')) return;
        window.location.href = '/wishlist';
      });
    }
  };

  /* --------------------------------------------------------------------------
     13. Sticky ATC Bar
     -------------------------------------------------------------------------- */
  var StickyATC = {
    bar: null,
    sentinel: null,

    init: function () {
      this.bar = $('#sticky-atc');
      if (!this.bar) return;

      // Watch the main ATC form — when it leaves view, show the bar
      var form = $('[data-add-to-cart-form]');
      if (!form) return;

      var self = this;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            self.bar.classList.add('visible');
            self.bar.setAttribute('aria-hidden', 'false');
          } else {
            self.bar.classList.remove('visible');
            self.bar.setAttribute('aria-hidden', 'true');
          }
        });
      }, { threshold: 0 });

      observer.observe(form);

      // Clicking sticky ATC submits the real form
      on($('#sticky-atc-btn'), 'click', function () {
        var realBtn = $('[data-add-to-cart-form] [type="submit"]');
        if (realBtn) realBtn.click();
      });
    }
  };

  /* --------------------------------------------------------------------------
     14. Bulk Savings Tiers
     -------------------------------------------------------------------------- */
  var BulkSavings = {
    init: function () {
      var container = $('#bulk-savings');
      if (!container) return;

      on(container, 'click', function (e) {
        var tier = e.target.closest('.bulk-tier');
        if (!tier) return;

        // Update active state
        $$('.bulk-tier', container).forEach(function (t) { t.classList.remove('active'); });
        tier.classList.add('active');

        // Set quantity input
        var qty = parseInt(tier.dataset.qty, 10);
        var qtyInput = $('[name="quantity"]');
        if (qtyInput) qtyInput.value = qty;
      });
    }
  };

  /* --------------------------------------------------------------------------
     14. Product Page Image Slideshow
     -------------------------------------------------------------------------- */
  var ProductSlideshow = {
    track: null,
    total: 0,
    current: 0,
    interval: null,
    animating: false,

    slideWidth: function () {
      var slide = this.track.children[0];
      var gap = parseFloat(window.getComputedStyle(this.track).gap) || 16;
      return slide.offsetWidth + gap;
    },

    init: function () {
      this.track = $('#product-slideshow-track');
      if (!this.track) return;
      this.total = this.track.children.length;
      if (this.total < 2) return;

      // Clone first 3 slides at end for seamless multi-per-view loop
      var cloneCount = Math.min(3, this.total);
      for (var i = 0; i < cloneCount; i++) {
        this.track.appendChild(this.track.children[i].cloneNode(true));
      }

      var self = this;
      on($('#slideshow-prev'), 'click', function () { self.move(-1); });
      on($('#slideshow-next'), 'click', function () { self.move(1); });
      on(this.track.parentElement, 'mouseenter', function () { self.stop(); });
      on(this.track.parentElement, 'mouseleave', function () { self.start(); });

      this.start();
    },

    move: function (dir) {
      if (this.animating) return;
      var self = this;
      self.animating = true;
      self.current += dir;

      var sw = self.slideWidth();
      self.track.style.transition = 'transform 1s ease';
      self.track.style.transform = 'translateX(-' + (self.current * sw) + 'px)';

      setTimeout(function () {
        // After sliding into clones, snap back to matching real slide
        if (self.current >= self.total) {
          self.track.style.transition = 'none';
          self.current = self.current - self.total;
          self.track.style.transform = 'translateX(-' + (self.current * self.slideWidth()) + 'px)';
        }
        // Before first slide, snap to last real slide
        if (self.current < 0) {
          self.track.style.transition = 'none';
          self.current = self.total - 1;
          self.track.style.transform = 'translateX(-' + (self.current * self.slideWidth()) + 'px)';
        }
        self.animating = false;
      }, 1050);
    },

    start: function () {
      var self = this;
      this.interval = setInterval(function () { self.move(1); }, 4000);
    },

    stop: function () {
      clearInterval(this.interval);
    }
  };

  /* --------------------------------------------------------------------------
     14. Hero Slideshow
     -------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     12. Collections Menu Dropdown
     -------------------------------------------------------------------------- */
  var CollectionsMenu = {
    btn: null,
    dropdown: null,

    init: function () {
      this.btn      = $('#collections-menu-btn');
      this.dropdown = $('#collections-dropdown');
      if (!this.btn) return;

      on(this.btn, 'click', function (e) {
        e.stopPropagation();
        CollectionsMenu.toggle();
      });

      // Close when clicking outside
      on(document, 'click', function (e) {
        if (!CollectionsMenu.btn.contains(e.target)) {
          CollectionsMenu.close();
        }
      });

      // Close on Escape
      on(document, 'keydown', function (e) {
        if (e.key === 'Escape') CollectionsMenu.close();
      });
    },

    toggle: function () {
      var isOpen = this.btn.classList.toggle('open');
      this.dropdown.classList.toggle('open', isOpen);
      this.btn.setAttribute('aria-expanded', isOpen);
      this.dropdown.setAttribute('aria-hidden', !isOpen);
    },

    close: function () {
      this.btn.classList.remove('open');
      this.dropdown.classList.remove('open');
      this.btn.setAttribute('aria-expanded', 'false');
      this.dropdown.setAttribute('aria-hidden', 'true');
    }
  };

  /* --------------------------------------------------------------------------
     Hero Slideshow (crossfade)
     -------------------------------------------------------------------------- */
  var HeroSlideshow = {
    slides: [],
    current: 0,

    init: function () {
      this.slides = $$('.hero-banner__slide');
      if (this.slides.length < 2) return;
      var self = this;
      setInterval(function () { self.next(); }, 4000);
    },

    next: function () {
      this.slides[this.current].classList.remove('active');
      this.current = (this.current + 1) % this.slides.length;
      this.slides[this.current].classList.add('active');
    }
  };

  /* --------------------------------------------------------------------------
     Boot
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    CartDrawer.init();
    AddToCart.init();
    MobileNav.init();
    CollectionsMenu.init();
    HeroSlideshow.init();
    SearchOverlay.init();
    Wishlist.init();
    ProductSlideshow.init();
    BulkSavings.init();
    StickyATC.init();
    VariantSelector.init();
    ProductGallery.init();
    GalleryZoom.init();
    AnnouncementBar.init();
    AgeVerify.init();
    CookieBanner.init();
    stickyScrollOffset();
    initCollectionSort();
    lazyImages();
  });

})();
