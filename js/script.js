/* ---------- filtrowanie kategorii ---------- */
const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('#product-grid .card');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

/* ---------- stan koszyka ---------- */
let cart = []; // { name, price, qty, image }

const cartBtn = document.getElementById('cart-btn');
const cartPanel = document.getElementById('cart-panel');
const cartCount = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartPanelCount = document.getElementById('cart-panel-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartCheckout = document.getElementById('cart-checkout');

function money(n){ return n.toLocaleString('pl-PL') + ' zł'; }

function itemWord(n){
  if(n === 1) return 'produkt';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if(lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'produkty';
  return 'produktów';
}

function renderCart(){
  const totalQty = cart.reduce((s,i) => s + i.qty, 0);
  const subtotal = cart.reduce((s,i) => s + i.qty * i.price, 0);

  cartCount.textContent = totalQty;
  cartPanelCount.textContent = totalQty + ' ' + itemWord(totalQty);
  cartSubtotal.textContent = money(subtotal);
  cartCheckout.disabled = cart.length === 0;

  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  cart.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img class="cart-item-swatch" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${money(item.price)}</div>
        <div class="qty-stepper">
          <button data-action="dec" aria-label="Zmniejsz ilość">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" aria-label="Zwiększ ilość">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-action="remove" aria-label="Usuń ${item.name}">×</button>
    `;
    row.querySelector('[data-action="inc"]').addEventListener('click', () => {
      cart[idx].qty++; renderCart();
    });
    row.querySelector('[data-action="dec"]').addEventListener('click', () => {
      cart[idx].qty--;
      if(cart[idx].qty <= 0) cart.splice(idx, 1);
      renderCart();
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => {
      cart.splice(idx, 1); renderCart();
    });
    cartItemsEl.appendChild(row);
  });
}

function bumpCount(){
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth; // restart animacji
  cartCount.classList.add('bump');
}

function openCart(){
  cartPanel.classList.add('open');
  cartBtn.classList.add('open');
  cartBtn.setAttribute('aria-expanded', 'true');
}
function closeCart(){
  cartPanel.classList.remove('open');
  cartBtn.classList.remove('open');
  cartBtn.setAttribute('aria-expanded', 'false');
}

cartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cartPanel.classList.contains('open') ? closeCart() : openCart();
});

document.querySelectorAll('.card-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const image = btn.dataset.image;
    const existing = cart.find(i => i.name === name);
    if(existing){ existing.qty++; } else { cart.push({ name, price, qty: 1, image }); }

    renderCart();
    bumpCount();
    openCart();

    const original = btn.textContent;
    btn.textContent = 'Dodano';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 900);
  });
});

cartCheckout.addEventListener('click', () => {
  if(cart.length === 0) return;
  cartCheckout.textContent = 'Zamówienie złożone ✓';
  setTimeout(() => {
    cart = [];
    renderCart();
    cartCheckout.textContent = 'Do kasy';
    closeCart();
  }, 1200);
});

document.addEventListener('click', (e) => {
  if(!cartPanel.contains(e.target) && !cartBtn.contains(e.target)) closeCart();
});

renderCart();

/* ---------- menu mobilne ---------- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');

function openMenu(){
  mobileMenu.classList.add('open');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-locked');
}
function closeMenu(){
  mobileMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-locked');
}

burger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
mobileMenuClose.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', closeMenu));

/* ---------- klawisz Escape ---------- */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){ closeCart(); closeMenu(); }
});

/* ---------- animacje przy przewijaniu ---------- */
const revealTargets = document.querySelectorAll('.card, .philosophy, .hero-swatch, .brand-name-item');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(!prefersReducedMotion && 'IntersectionObserver' in window){
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => observer.observe(el));
}
  
