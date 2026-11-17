(() => {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  }));
  const dialog = document.querySelector('#booking-dialog');
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
    if (dialog) dialog.showModal();
    else window.open('https://wa.me/917036022033?text=' + encodeURIComponent('Hi Fresh Threads! I’d like to arrange a pickup. Please share availability and pricing.'), '_blank', 'noopener');
  }));
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  let pickupLocation = null;
  let locationRequest = 0;
  const locationButton = document.querySelector('#use-location');
  const removeLocation = document.querySelector('#remove-location');
  const locationStatus = document.querySelector('#location-status');
  const areaInput = document.querySelector('#booking-area');
  function clearWhatsAppFallback() {
    const fallback = document.querySelector('#booking-fallback');
    if (fallback) { fallback.hidden = true; fallback.querySelector('a').removeAttribute('href'); }
  }
  function finishLocationRequest() {
    locationButton.disabled = false;
    locationButton.textContent = pickupLocation ? '⌖ Update my location' : '⌖ Use my current location';
    removeLocation.hidden = !pickupLocation;
    removeLocation.textContent = 'Remove';
  }
  locationButton?.addEventListener('click', () => {
    clearWhatsAppFallback();
    if (!navigator.geolocation || !window.isSecureContext) {
      locationStatus.textContent = 'Location is unavailable in this browser. Please enter your area and landmark below.';
      return;
    }
    const request = ++locationRequest;
    pickupLocation = null;
    locationButton.disabled = true;
    locationButton.textContent = 'Finding your location…';
    removeLocation.hidden = false;
    removeLocation.textContent = 'Cancel';
    locationStatus.textContent = 'Please allow location access when your browser asks. You can also enter your area manually.';
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== locationRequest) return;
      const { latitude, longitude, accuracy } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        locationStatus.textContent = 'We could not get a valid location. Please try again or enter your area below.';
        finishLocationRequest();
        return;
      }
      pickupLocation = {
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? Math.ceil(accuracy) : null
      };
      areaInput.setCustomValidity('');
      locationStatus.textContent = `Map pin added${pickupLocation.accuracy !== null ? ' (accurate to about ' + pickupLocation.accuracy + ' m)' : ''}. Add your flat, building or landmark below so we can find you.`;
      finishLocationRequest();
    }, error => {
      if (request !== locationRequest) return;
      const messages = {
        1: 'Location permission was not granted. You can still book by entering your area and landmark below.',
        2: 'Your location could not be found. Please try again or enter your area and landmark below.',
        3: 'Finding your location took too long. Please try again or enter your area and landmark below.'
      };
      locationStatus.textContent = messages[error.code] || 'Location is unavailable. Please enter your area and landmark below.';
      finishLocationRequest();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
  removeLocation?.addEventListener('click', () => {
    ++locationRequest;
    pickupLocation = null;
    areaInput.setCustomValidity('');
    locationStatus.textContent = 'Location removed. Enter your area and landmark below to continue.';
    clearWhatsAppFallback();
    finishLocationRequest();
  });
  document.querySelector('#booking-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const area = form.get('area').trim();
    if (!area && !pickupLocation) { document.querySelector('#booking-area').setCustomValidity('Enter your area or use your current location.'); document.querySelector('#booking-area').reportValidity(); return; }
    const message = `Hi Fresh Threads! I’d like to request a pickup.\n\nService: ${form.get('service')}${area ? '\nArea / building / landmark: ' + area : ''}${pickupLocation ? '\nPickup location (map pin): ' + pickupLocation.mapUrl + (pickupLocation.accuracy !== null ? '\nLocation accuracy: about ' + pickupLocation.accuracy + ' m' : '') : ''}${form.get('note').trim() ? '\nNotes: ' + form.get('note').trim() : ''}\n\nPlease confirm availability, pickup charges, pricing, and return timing. Thank you!`;
    const url = 'https://wa.me/917036022033?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
    const fallback = document.querySelector('#booking-fallback');
    fallback.hidden = false;
    fallback.querySelector('a').href = url;
  });
  document.querySelector('#booking-area')?.addEventListener('input', event => event.target.setCustomValidity(''));

  const priceKey = (category, item, order) => JSON.stringify([category, item, order]);
  const displayINR = value => {
    const rate = value.trim();
    return /^\d/.test(rate) ? '₹' + rate : rate;
  };

  async function loadPriceRates() {
    const response = await fetch('/.netlify/functions/website-prices', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Catalogue unavailable');
    const { rates } = await response.json();
    if (!Array.isArray(rates) || !rates.length || !rates.every(row =>
      typeof row?.category === 'string' && typeof row.item_name === 'string' &&
      Number.isInteger(row.rate_order) && row.rate_order > 0 &&
      typeof row.display_rate === 'string' && row.display_rate.trim())) {
      throw new Error('Invalid catalogue');
    }
    return new Map(rates.map(row => [
      priceKey(row.category, row.item_name, row.rate_order), displayINR(row.display_rate),
    ]));
  }

  const offeringRates = document.querySelectorAll('[data-rate-category]');
  if (offeringRates.length) {
    loadPriceRates().then(rates => {
      offeringRates.forEach(element => {
        const { rateCategory, rateItem, rateOrder, rateUnit } = element.dataset;
        const rate = rates.get(priceKey(rateCategory, rateItem, Number(rateOrder)));
        if (rate?.startsWith('₹')) element.textContent = `${rate} / ${rateUnit}`;
      });
    }).catch(() => {
      // The links to the pricing page are available if live rates cannot load.
    });
  }

  if (!window.PRICE_ITEMS) return;
  const results = document.querySelector('#price-results');
  const feedStatus = document.querySelector('#price-feed-status');
  const referenceItems = window.PRICE_ITEMS;
  let priceItems = referenceItems;
  const count = document.querySelector('#result-count');
  const search = document.querySelector('#price-search');
  const filters = document.querySelector('#price-filters');
  const categories = [...new Set(window.PRICE_ITEMS.map(item => item.category))];
  const initial = new URLSearchParams(location.search).get('category');
  let selected = categories.find(category => initial && category.toLowerCase().includes(initial.toLowerCase())) || 'All';
  ['All', ...categories].forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.textContent = category === 'All' ? 'Everything' : category;
    button.setAttribute('aria-pressed', String(category === selected));
    button.addEventListener('click', () => {
      selected = category;
      if (category !== 'All') search.value = '';
      filters.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      render();
    });
    filters.append(button);
  });
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = priceItems.filter(item => (selected === 'All' || item.category === selected) && `${item.item} ${item.category} ${item.prices.map(p => p.service).join(' ')}`.toLowerCase().includes(query));
    results.replaceChildren();
    count.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}${selected === 'All' ? ' across our services' : ' in ' + selected}`;
    if (!visible.length) {
      const empty = element('div', 'empty-results');
      empty.append(element('h2', '', 'A little hard to find?'), element('p', '', 'Try a different item or browse everything. We’re happy to help on WhatsApp.'));
      const reset = element('button', 'button', 'Show all prices ↗');
      reset.addEventListener('click', () => { search.value = ''; selected = 'All'; filters.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === 0))); render(); search.focus(); });
      empty.append(reset); results.append(empty); return;
    }
    categories.forEach(category => {
      const rows = visible.filter(item => item.category === category);
      if (!rows.length) return;
      const group = element('section', 'price-group');
      group.dataset.tone = ['mint', 'peach', 'butter'][categories.indexOf(category) % 3];
      const heading = element('h2', '', category);
      const sticker = element('span', 'price-category-sticker');
      sticker.setAttribute('aria-hidden', 'true');
      const icon = category.includes('Shoes') ? 'shoe' : category.includes('Sarees') || category === 'For Her' ? 'dress' : category === 'For Him' || category === 'For Kids' ? 'shirt' : 'towel';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 200 200');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `assets/garments.svg#${icon}`);
      svg.append(use); sticker.append(svg); heading.prepend(sticker);
      group.append(heading);
      rows.forEach(item => {
        const row = element('div', 'price-row');
        row.append(element('div', 'price-item', item.item));
        const values = element('div', 'price-values');
        item.prices.forEach(price => {
          const value = element('div', 'price-value');
          value.append(element('small', '', price.service), element('strong', '', price.value));
          values.append(value);
        });
        row.append(values); group.append(row);
      });
      results.append(group);
    });
  }
  search.addEventListener('input', () => {
    selected = 'All';
    filters.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === 0));
    });
    render();
  });
  render();

  if (feedStatus) {
    (async () => {
      try {
        const lookup = await loadPriceRates();
        const liveItems = referenceItems.map(item => ({
          ...item,
          prices: item.prices.flatMap((price, i) => {
            const value = lookup.get(priceKey(item.category, item.item, i + 1));
            return value === undefined ? [] : [{ ...price, value }];
          }),
        })).filter(item => item.prices.length);
        if (!liveItems.length) throw new Error('Catalogue has no matching rates');
        priceItems = liveItems;
        render();
      } catch {
        feedStatus.textContent = 'Current rates are unavailable. These reference prices may be out of date; please confirm with our team.';
        feedStatus.hidden = false;
      }
    })();
  }
})();
