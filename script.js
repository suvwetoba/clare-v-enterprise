
/* ============================================================
   EDIT THIS BLOCK â€” everything ClareVi needs to change is here.
   ============================================================ */
const SHOP = {
  // Her WhatsApp number in full international format, no + or spaces.
  // Example for Nigeria: "2348012345678". Leave "" and the button will
  // give the customer a copyable order instead of a broken link.
  whatsapp: "08036494100",
  deliveryFee: 1000,          // naira, for "Delivery nearby"
  currency: "â‚¦",
  pricesNote: "Current prices on request"
};

const PRODUCTS = [
  {
    id: "magic",
    name: "Magic Circle",
    cat: "Toy + Sweet",
    kicker: "Spring + candy",
    art: "slinky",
    hue: "grape",
    desc: "A stretchy rainbow spring with a sealed cup of fruit candy inside. The sweet explodes in one bite; the spring keeps working long after it's gone.",
    facts: ["Fruit candy", "Toy included", "Ages 4+"],
    variants: [
      { label: "1 piece",        price: 150  },
      { label: "Pack of 6",      price: 1650, note: "save â‚¦150" },
      { label: "Full box of 24", price: 6000, note: "party size" }
    ]
  },
  {
    id: "comb",
    name: "Comb Pop",
    cat: "Toy + Sweet",
    kicker: "Comb + candy tube",
    art: "comb",
    hue: "lime",
    desc: "A real working mini comb with a cute animal cap, sitting on a tube of sweet candy. Comes in blue, orange, green and pink â€” she'll mix the colours unless you ask.",
    facts: ["4 colours", "Comb toy", "Ages 4+"],
    variants: [
      { label: "1 piece",        price: 350  },
      { label: "Pack of 5",      price: 1600, note: "save â‚¦150" },
      { label: "Full tray of 24", price: 7200, note: "party size" }
    ]
  },
  {
    id: "shot",
    name: "Crazy Shot",
    cat: "Chocolate",
    kicker: "Chocolate + milk",
    art: "syringe",
    hue: "cocoa",
    desc: "Chocolate and milk cream in a squeezy shot you push straight into your mouth. 7g each, 30 to a box. NAFDAC reg. no. A5-101255.",
    facts: ["7g each", "30 per box", "Chocolate + milk"],
    variants: [
      { label: "1 shot",         price: 200  },
      { label: "Pack of 5",      price: 900,  note: "save â‚¦100" },
      { label: "Full box of 30", price: 5000, note: "save â‚¦1,000" }
    ]
  },
  {
    id: "mix",
    name: "The Mix Bag",
    cat: "Bundle",
    kicker: "A bit of everything",
    art: "bag",
    hue: "sun",
    desc: "Three Magic Circles, three Crazy Shots and two Comb Pops in one bag. The easiest thing to hand a child who can't decide.",
    facts: ["8 pieces", "All three sweets", "Ready to gift"],
    variants: [
      { label: "1 bag",   price: 2400, note: "save â‚¦250" },
      { label: "5 bags",  price: 11500, note: "save â‚¦500" }
    ]
  }
];
/* ================== end of edit block ====================== */

const money = n => SHOP.currency + Math.round(n).toLocaleString("en-NG");
const normalizePhone = raw => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
};
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let cart = [];
try { cart = JSON.parse(localStorage.getItem("mclare-cart") || "[]"); } catch(_) {}
let favorites = [];
try { favorites = JSON.parse(localStorage.getItem("clarevi-favs") || "[]"); } catch(_) {}
let lastOrder = [];
try { lastOrder = JSON.parse(localStorage.getItem("clarevi-last-order") || "[]"); } catch(_) {}

function addQuickItem(id){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const vi = 0;
  addToCart(p.id, vi, 1);
  showToast(`${p.name} added to your order`);
}

/* ---------- theme ---------- */
const themeBtn = $("#themeBtn");
if (!document.documentElement.getAttribute("data-theme")) {
  document.documentElement.setAttribute("data-theme", "light");
}

themeBtn.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
});

/* ---------- ticker ---------- */
const tickerBits = [
  "Magic Circle Â· rainbow spring + candy",
  "Crazy Shot Â· chocolate + milk",
  "Comb Pop Â· 4 colours",
  "Free pickup at school",
  "Party bags on request",
  "Sealed original packs"
];
$("#tickerTrack").innerHTML = [...tickerBits, ...tickerBits]
  .map(t => `<span>${t} âœ¦</span>`).join("");

/* ---------- hero spring ---------- */
(function buildCoil(){
  const g = document.getElementById("heroCoil");
  const N = 20;
  let out = "";
  for (let i = 0; i < N; i++){
    const t = i / (N - 1);
    const x = 70 + t * 175;
    const y = 130 + Math.sin(t * Math.PI) * -34;
    const hue = 5 + t * 320;
    out += `<ellipse class="coil" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="20" ry="58"
              fill="none" stroke="hsl(${hue.toFixed(0)} 92% 58%)" stroke-width="9"
              stroke-linecap="round" style="animation-delay:${(i * 0.055).toFixed(3)}s"/>`;
  }
  g.innerHTML = out;
})();

/* ---------- product art ---------- */
function productImage(query, alt){
  const url = `https://source.unsplash.com/featured/900x650/?${encodeURIComponent(query)}`;
  return `<img src="${url}" alt="${alt}" loading="lazy" decoding="async">`;
}

function art(kind){
  if (kind === "slinky"){
    return productImage("rainbow candy bright", "Real rainbow spring candy");
  }
  if (kind === "comb"){
    return productImage("candy comb toy", "Real comb pop candy");
  }
  if (kind === "syringe"){
    return productImage("chocolate candy shot", "Real chocolate shot candy");
  }
  return productImage("mixed candy sweets", "Real mixed bag of sweets");
}

/* ---------- filters + grid ---------- */
const cats = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
let activeCat = "All";
let searchQuery = "";

$("#chips").innerHTML = cats.map(c =>
  `<button class="chip" data-cat="${c}" aria-pressed="${c === "All"}">${c}</button>`).join("");

$("#quickPicks").innerHTML = [
  { id: "magic", label: "Magic Circle" },
  { id: "comb", label: "Comb Pop" },
  { id: "shot", label: "Crazy Shot" }
].map(item => `<button class="quickpill" data-quick="${item.id}">${item.label}</button>`).join("");

$("#chips").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  activeCat = b.dataset.cat;
  $$(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.cat === activeCat));
  renderGrid();
});

$("#searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderGrid();
});

$("#quickPicks").addEventListener("click", e => {
  const b = e.target.closest("[data-quick]");
  if (!b) return;
  addQuickItem(b.dataset.quick);
  searchQuery = b.dataset.quick.toLowerCase();
  $("#searchInput").value = searchQuery;
  renderGrid();
});

$("#favoritesBar").addEventListener("click", e => {
  const b = e.target.closest("[data-quick]");
  if (!b) return;
  addQuickItem(b.dataset.quick);
  renderGrid();
});

function triggerSpin(card){
  const art = card.querySelector('.card__art');
  if (!art) return;
  art.classList.remove('is-spinning');
  void art.offsetWidth;
  art.classList.add('is-spinning');
}

function renderGrid(){
  const q = searchQuery.trim().toLowerCase();
  const list = PRODUCTS.filter(p => {
    const matchesCat = activeCat === "All" || p.cat === activeCat;
    const haystack = `${p.name} ${p.desc} ${p.cat} ${p.facts.join(" ")} ${p.variants.map(v => v.label).join(" ")}`.toLowerCase();
    const matchesSearch = !q || haystack.includes(q);
    return matchesCat && matchesSearch;
  });
  $("#grid").innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}">
      <div class="card__art art--${p.hue}">
        <button class="fav-btn ${favorites.includes(p.id) ? "is-fav" : ""}" data-fav="${p.id}" aria-label="${favorites.includes(p.id) ? "Remove" : "Save"} ${p.name} as favourite">${favorites.includes(p.id) ? "â˜…" : "â˜†"}</button>
        <span class="kicker">${p.kicker}</span>
        <span class="price-sticker">${SHOP.pricesNote}</span>
        ${art(p.art)}
      </div>
      <div class="card__body">
        <h3>${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__qty-pill" aria-live="polite">Qty 1</div>
        <ul class="facts">${p.facts.map(f => `<li>${f}</li>`).join("")}</ul>
        <div class="opts">
          ${p.variants.map((v, i) => `
            <label class="opt">
              <input type="radio" name="v-${p.id}" value="${i}" ${i === 0 ? "checked" : ""}>
              <span class="opt__label">${v.label}${v.note ? `<span class="opt__note">${v.note}</span>` : ""}</span>
              <span class="opt__price tnum">${money(v.price)}</span>
            </label>`).join("")}
        </div>
        <div class="addrow">
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="One fewer ${p.name}">â€“</button>
            <input type="number" value="1" min="1" max="99" aria-label="How many ${p.name}">
            <button type="button" data-step="1" aria-label="One more ${p.name}">+</button>
          </div>
          <button class="addbtn" data-add="${p.id}">Add to order</button>
        </div>
      </div>
    </article>`).join("");
}
renderFavoritesBar();
renderGrid();

$("#grid").addEventListener("click", e => {
  const fav = e.target.closest("[data-fav]");
  if (fav){
    const id = fav.dataset.fav;
    if (favorites.includes(id)) favorites = favorites.filter(x => x !== id);
    else favorites.push(id);
    localStorage.setItem("clarevi-favs", JSON.stringify(favorites));
    renderFavoritesBar();
    renderGrid();
    return;
  }

  const card = e.target.closest(".card");
  if (!card) return;
  const input = card.querySelector(".stepper input");

  const step = e.target.closest("[data-step]");
  if (step){
    const n = Math.min(99, Math.max(1, (parseInt(input.value, 10) || 1) + Number(step.dataset.step)));
    input.value = n;
    updateSelectionPreview(card, n);
    return;
  }

  const add = e.target.closest("[data-add]");
  if (add){
    triggerSpin(card);
    const p = PRODUCTS.find(x => x.id === add.dataset.add);
    const vi = Number(card.querySelector(`input[name="v-${p.id}"]:checked`).value);
    const qty = Math.max(1, parseInt(input.value, 10) || 1);
    addToCart(p.id, vi, qty);
    updateSelectionPreview(card, qty);
    add.classList.add("is-added");
    add.textContent = qty > 1 ? `Added Ã—${qty}` : "Added âœ“";
    const icon = p.id === "magic" ? "âœ¦" : p.id === "comb" ? "ðŸª„" : p.id === "shot" ? "ðŸ«" : "ðŸŽ";
    playPickAnimation(icon, qty, add);
    if (window.innerWidth <= 1000) {
      const rail = $("#rail");
      if (rail && !rail.classList.contains("is-open")) {
        rail.classList.add("is-open");
      }
    }
    burst(add);
    setTimeout(() => { add.classList.remove("is-added"); add.textContent = "Add to order"; }, 1300);
  }
});

/* ---------- cart ---------- */
function save(){ try { localStorage.setItem("mclare-cart", JSON.stringify(cart)); } catch(_) {} }
function saveLastOrder(){ try { localStorage.setItem("clarevi-last-order", JSON.stringify(cart)); } catch(_) {} }

function addToCart(id, vi, qty){
  const hit = cart.find(l => l.id === id && l.vi === vi);
  if (hit) hit.qty = Math.min(999, hit.qty + qty);
  else cart.push({ id, vi, qty });
  save();
  if (cart.length) saveLastOrder();
  renderCart();
}

function lineOf(l){
  const p = PRODUCTS.find(x => x.id === l.id);
  const v = p.variants[l.vi];
  return { p, v, amount: v.price * l.qty };
}

function subtotal(){ return cart.reduce((s, l) => s + lineOf(l).amount, 0); }
function shipping(){
  const mode = document.querySelector('input[name="deliv"]:checked').value;
  return mode === "local" ? SHOP.deliveryFee : 0;
}

function showToast(message){
  const t = $("#toast");
  t.textContent = message;
  t.classList.add("is-show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => t.classList.remove("is-show"), 1800);
}

function updateSelectionPreview(card, qty){
  const pill = card.querySelector(".card__qty-pill");
  if (pill){
    pill.textContent = qty > 1 ? `Qty ${qty}` : "Qty 1";
    pill.classList.add("is-visible");
  }
  card.classList.add("is-selected");
  clearTimeout(card._previewTimer);
  card._previewTimer = setTimeout(() => {
    card.classList.remove("is-selected");
    if (pill) pill.classList.remove("is-visible");
  }, 800);
}

function playPickAnimation(icon = "âœ¦", qty = 1, originEl = null){
  const stage = $("#pickStage");
  const bubble = $("#pickBubble");
  const qtyBadge = $("#pickQty");
  if (!stage || !bubble || !qtyBadge) return;
  bubble.textContent = icon;
  qtyBadge.textContent = qty > 1 ? `Ã—${qty}` : "";
  qtyBadge.style.display = qty > 1 ? "inline-flex" : "none";
  const stageRect = stage.getBoundingClientRect();
  const bag = stage.querySelector(".pick-stage__bag");
  const originRect = originEl ? originEl.getBoundingClientRect() : null;
  const bagRect = bag ? bag.getBoundingClientRect() : null;
  const startX = originRect ? originRect.left + originRect.width / 2 - stageRect.width / 2 : 0;
  const startY = originRect ? originRect.top + originRect.height / 2 - stageRect.height / 2 : -40;
  const endX = bagRect ? bagRect.left + bagRect.width / 2 - stageRect.width / 2 : 0;
  const endY = bagRect ? bagRect.top + bagRect.height / 2 - stageRect.height / 2 : 0;
  bubble.style.setProperty("--start-x", `${startX}px`);
  bubble.style.setProperty("--start-y", `${startY}px`);
  bubble.style.setProperty("--end-x", `${endX}px`);
  bubble.style.setProperty("--end-y", `${endY}px`);
  stage.classList.remove("is-active");
  void stage.offsetWidth;
  stage.classList.add("is-active");
  clearTimeout(playPickAnimation.timer);
  playPickAnimation.timer = setTimeout(() => stage.classList.remove("is-active"), 900);
}

function renderFavoritesBar(){
  const host = $("#favoritesBar");
  if (!favorites.length){ host.innerHTML = ""; return; }
  const items = favorites.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  host.innerHTML = items.map(p => `<button class="favorite-pill" data-quick="${p.id}"><span class="dot">â˜…</span>${p.name}</button>`).join("");
}

function renderOrderProgress(){
  const fill = $("#orderProgressFill");
  const text = $("#orderProgressText");
  if (!fill || !text) return;
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const progress = Math.min(100, count * 18 + (cart.length ? 20 : 0) + (document.querySelector('input[name="deliv"]:checked') ? 8 : 0));
  fill.style.width = `${progress}%`;
  text.textContent = progress < 35 ? "Start with your first sweet" : progress < 70 ? "Nice, your order is taking shape" : "Youâ€™re ready to send it";
}

function renderCart(){
  const body = $("#cartBody");
  const mobileSummary = $("#mobileSummary");
  const mobileSummaryText = $("#mobileSummaryText");
  if (!cart.length){
    body.innerHTML = `<div class="empty">
      <svg viewBox="0 0 100 80" aria-hidden="true">
        <path d="M22 24 h56 l-5 46 a5 5 0 0 1 -5 4 H32 a5 5 0 0 1 -5 -4 Z"
              fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
        <path d="M38 24 v-8 a12 12 0 0 1 24 0 v8" fill="none" stroke="currentColor" stroke-width="5"/>
      </svg>
      <div>Nothing here yet.<br>Add something from the counter.</div>
      ${lastOrder.length ? `<button class="btn btn--ghost" id="restoreLast" style="margin-top:.75rem">Re-add last order</button>` : ""}
    </div>`;
  } else {
    body.innerHTML = `<ul class="lines">${cart.map((l, i) => {
      const { p, v, amount } = lineOf(l);
      return `<li class="line">
        <span class="line__name">${p.name}</span>
        <span class="line__amt tnum">${money(amount)}</span>
        <span class="line__meta">${l.qty} Ã— ${v.label}
          <button class="line__rm" data-rm="${i}" aria-label="Remove ${p.name} from order">remove</button>
        </span>
      </li>`;
    }).join("")}</ul>`;
  }

  const sub = subtotal(), ship = shipping();
  const mode = document.querySelector('input[name="deliv"]:checked').value;
  $("#tSub").textContent   = money(sub);
  $("#tShip").textContent  = mode === "courier" ? "quoted" : (ship ? money(ship) : "free");
  $("#tGrand").textContent = money(sub + ship);
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const total = subtotal() + shipping();
  $("#fabCount").textContent = count;
  $("#receiptDate").textContent = count ? `${count} item${count > 1 ? "s" : ""} Â· not yet sent` : "ClareVi Entereprise";
  if (mobileSummary && mobileSummaryText){
    mobileSummary.style.display = count ? "inline-flex" : "none";
    mobileSummaryText.textContent = `${count} item${count > 1 ? "s" : ""} Â· ${money(total)}`;
  }
  renderOrderProgress();
}

$("#cartBody").addEventListener("click", e => {
  const restore = e.target.closest("#restoreLast");
  if (restore){
    cart = lastOrder.map(l => ({ ...l }));
    save();
    renderCart();
    showToast("Last order restored");
    return;
  }
  const rm = e.target.closest("[data-rm]");
  if (!rm) return;
  cart.splice(Number(rm.dataset.rm), 1);
  save();
  if (cart.length) saveLastOrder();
  renderCart();
});
$("#delivery").addEventListener("change", renderCart);
renderCart();

/* ---------- mobile rail ---------- */
$("#fab").addEventListener("click", () => {
  const r = $("#rail");
  r.classList.toggle("is-open");
  if (r.classList.contains("is-open")) r.scrollIntoView({ block: "nearest" });
});

/* ---------- party bag builder ---------- */
let bag = null;
$("#budgets").addEventListener("click", e => {
  const b = e.target.closest(".budget");
  if (!b) return;
  $$(".budget").forEach(x => x.setAttribute("aria-pressed", x === b));
  buildBag(Number(b.dataset.b));
});

function buildBag(budget){
  // Spend round-robin across the sweets so every bag has variety,
  // stepping down to the cheapest option once the money runs low.
  const pool = PRODUCTS.filter(p => p.id !== "mix")
    .map(p => ({ p, v: p.variants.slice().sort((a, b) => b.price - a.price) }));
  const picked = [];
  let left = budget, guard = 0;

  while (guard++ < 400){
    let bought = false;
    for (const { p, v } of pool){
      const opt = v.find(o => o.price <= left);
      if (!opt) continue;
      const vi = p.variants.indexOf(opt);
      const hit = picked.find(x => x.id === p.id && x.vi === vi);
      if (hit) hit.qty++; else picked.push({ id: p.id, vi, qty: 1 });
      left -= opt.price;
      bought = true;
    }
    if (!bought) break;
  }

  bag = picked;
  const total = picked.reduce((s, l) => s + lineOf(l).amount, 0);
  const pieces = picked.reduce((s, l) => {
    const m = lineOf(l).v.label.match(/\d+/);
    return s + l.qty * (m && /of|Pack|tray|box/i.test(lineOf(l).v.label) ? Number(m[0]) : 1);
  }, 0);

  $("#bagOut").innerHTML = picked.length
    ? `<ul>${picked.map(l => {
        const { p, v, amount } = lineOf(l);
        return `<li><span>${l.qty} Ã— ${p.name} <small>(${v.label})</small></span><span>${money(amount)}</span></li>`;
      }).join("")}
      <li class="bag-total"><span>${pieces} sweets Â· ${money(budget - left)} spent</span><span>${money(total)}</span></li>
      </ul>`
    : `<div class="bag-idle">That budget is under the Cheapest sweet. Try â‚¦2,500.</div>`;

  $("#bagAdd").style.display = picked.length ? "inline-flex" : "none";
}

$("#bagAdd").addEventListener("click", e => {
  if (!bag) return;
  bag.forEach(l => addToCart(l.id, l.vi, l.qty));
  burst(e.currentTarget);
  e.currentTarget.textContent = "Added to your order âœ“";
  setTimeout(() => { e.currentTarget.textContent = "Add this bag to my order"; }, 1600);
});

/* ---------- checkout ---------- */
function orderMessage(){
  const mode = document.querySelector('input[name="deliv"]:checked').value;
  const modeText = { pickup: "Pickup at school", local: "Delivery nearby", courier: "Out of town courier" }[mode];
  const sub = subtotal(), ship = shipping();
  const lines = cart.map(l => {
    const { p, v, amount } = lineOf(l);
    return `â€¢ ${l.qty} Ã— ${p.name} (${v.label}) â€” ${money(amount)}`;
  }).join("\n");

  return [
    "Hi ClareVi! I'd like to order:",
    "",
    lines,
    "",
    `Sweets: ${money(sub)}`,
    `${modeText}: ${mode === "courier" ? "please quote me" : (ship ? money(ship) : "free")}`,
    `Total: ${money(sub + ship)}`,
    "",
    "My name:",
    "Where to deliver / when to collect:"
  ].join("\n");
}

$("#checkout").addEventListener("click", () => {
  if (!cart.length){
    $("#rail").classList.add("is-open");
    $("#cartBody").animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" },
       { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
      { duration: 260 }
    );
    return;
  }
  const msg = orderMessage();

  const waNumber = normalizePhone(SHOP.whatsapp);
  if (waNumber){
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    return;
  }
  // No number set yet â€” hand the customer their order instead of a dead link.
  $("#modalTitle").textContent = "Copy your order";
  $("#modalMsg").textContent   = "The WhatsApp number for this shop hasn't been added yet. Copy your order below and send it to ClareVi directly.";
  $("#orderText").value = msg;
  $("#modal").classList.add("is-open");
  $("#copyBtn").focus();
});

$("#closeModal").addEventListener("click", () => $("#modal").classList.remove("is-open"));
$("#modal").addEventListener("click", e => { if (e.target === $("#modal")) $("#modal").classList.remove("is-open"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("#modal").classList.remove("is-open"); });

$("#copyBtn").addEventListener("click", async e => {
  const t = $("#orderText");
  try { await navigator.clipboard.writeText(t.value); }
  catch(_) { t.select(); document.execCommand("copy"); }
  e.currentTarget.textContent = "Copied âœ“";
  setTimeout(() => { e.currentTarget.textContent = "Copy the order"; }, 1500);
});

/* ---------- confetti ---------- */
const COLORS = ["#E6197E", "#FFC70A", "#9FD214", "#5B21A8", "#2FA8E8"];
function burst(el){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  const box = document.createElement("div");
  box.className = "confetti";
  for (let i = 0; i < 16; i++){
    const s = document.createElement("i");
    const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
    s.style.left = r.left + r.width / 2 + "px";
    s.style.top  = r.top + r.height / 2 + "px";
    s.style.background = COLORS[i % COLORS.length];
    s.style.setProperty("--dx", Math.cos(a) * (60 + Math.random() * 70) + "px");
    s.style.setProperty("--dy", Math.sin(a) * (60 + Math.random() * 70) + 90 + "px");
    s.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1100);
}

