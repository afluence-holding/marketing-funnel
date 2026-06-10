# Developer Brief — Hotmart Embedded Checkout

**Owner (requested by):** Nicolás (COO) · **Build owner:** Cristóbal (CTO/Dev)
**Date:** 2026-06-09 · **Status:** Ready to scope
**Target repo:** `Reference_Repos/marketing-funnel` (`apps/web` = Next.js landing pages, `apps/api` = Express)
**Validation note:** Every technical claim below is taken verbatim from Hotmart's official developer docs (links in §10). Anything not confirmed by Hotmart is explicitly marked **[CONFIRM]**. No undocumented behavior was assumed.

---

## 1. TL;DR

Hotmart officially supports embedding its checkout on your own page via a front-end library called **Checkout Elements** (`hotmart-checkout-elements.js`). There are two modes:

- **Overlay** — a button on your page opens the checkout in a modal.
- **Inline / Embedded** — the full checkout renders inside a `<div>` on your page (Hotmart's docs label this "transparent checkout").

This is **not** a payment API. Hotmart still renders and processes the payment on its side, so we never touch card data (no PCI scope). For server-side confirmation (grant access, fire Meta CAPI / Hyros), we consume Hotmart's **Webhook (Postback) v2.0.0**.

**Feasible:** yes, fully native, free, no special approval beyond having a published product offer.

---

## 2. What we CAN and CANNOT do

| Capability | Supported? | Source |
|---|---|---|
| Open checkout in a modal/overlay on our page | ✅ Yes (`overlayCheckout`) | Checkout Elements tutorial |
| Render full checkout inline inside our page | ✅ Yes (`inlineCheckout`) | Checkout Elements tutorial |
| Pre-fill buyer data (name, email, doc, phone, zip) | ✅ Yes (`prefilledInfo`) | Checkout Elements tutorial |
| Show/hide payment methods, pre-set installments | ✅ Yes (`visibilityOptions`) | Checkout Elements tutorial |
| Pass attribution params (`sck`, `src`, `xcod`) | ✅ Yes | Checkout Elements + Webhook docs |
| Server-side purchase confirmation | ✅ Yes (Webhook v2.0.0) | Webhook docs |
| Build our **own** card form / tokenize cards / call a charge API | ❌ Not offered | No public payment-processing API in docs |
| JS success/error callbacks from the embed lib | ⚠️ **[CONFIRM]** — not documented in the Checkout Elements tutorial. Treat post-purchase as **webhook-driven**, not front-end-driven | — |

---

## 3. Proposed architecture

```
apps/web (Next.js)                         Hotmart
┌───────────────────────────┐            ┌──────────────────────┐
│ Landing / checkout page    │            │ checkout.hotmart.com │
│  - load checkout-elements  │  loads ──▶ │  renders checkout UI │
│  - inline OR overlay        │            │  processes payment   │
│  - pass sck/src/xcod + pre- │            └──────────┬───────────┘
│    fill from query params   │                       │ on purchase event
└───────────────────────────┘                        ▼
                                          ┌──────────────────────┐
apps/api (Express)                        │ Hotmart Webhook 2.0.0 │
┌───────────────────────────┐   POST ◀────┤ (Postback)            │
│ POST /webhooks/hotmart     │   (server)  └──────────────────────┘
│  - validate X-HOTMART-HOTTOK│
│  - idempotency on            │
│    purchase.transaction      │
│  - on APPROVED/COMPLETE:     │
│      grant access            │
│      emit lead/sale event    │
│      fire Meta CAPI / Hyros  │
└───────────────────────────┘
```

We already have pixel tracking (Meta, GA4, TikTok, GTM, Clarity) in `apps/web` and an event bus + ingestion in `apps/api`. The webhook receiver should plug into the existing event bus.

---

## 4. Part 1 — Front-end (Checkout Elements)

### 4.1 Requirements (from docs)
- An external page where we control the source code → we have this (`apps/web`).
- Basic HTML/JS.
- The product **offer code**.

### 4.2 How to get the offer code
Hotmart panel → **Products** → select product → **Pricing and offers** → copy the offer **`code`**.
(Each offer/price has its own code; multiple offers = multiple codes.)

### 4.3 Overlay mode (modal on click)
```html
<script src="https://checkout.hotmart.com/lib/hotmart-checkout-elements.js"></script>
<button id="payment_button">Proceed to checkout</button>
<script>
  const elements = checkoutElements.init('overlayCheckout', { offer: 'kjl7fk5t' })
  elements.attach('#payment_button')
</script>
```

### 4.4 Inline / embedded mode (checkout lives in the page)
```html
<script src="https://checkout.hotmart.com/lib/hotmart-checkout-elements.js"></script>
<div id="inline_checkout"></div>
<script>
  const elements = checkoutElements.init('inlineCheckout', { offer: 'kjl7fk5t' })
  elements.mount('#inline_checkout')
</script>
```

### 4.5 Pre-fill buyer data
```js
const elements = checkoutElements.init('inlineCheckout', {
  offer: 'YOUR_OFFER',
  countryIsoCode: 'ES',
  locale: 'es',
  prefilledInfo: {
    name: 'Yoshio Mack',
    email: 'buyer@example.com',
    doc: '1234567909',
    zip: '30110056',
    phoneac: '31',
    phonenumber: '988887777',
    sck: 'your_sck_param'
  }
})
```

> **[CONFIRM] Doc discrepancy:** the main integration section uses the identifiers `'overlayCheckout'` and `'inlineCheckout'`, but Hotmart's *pre-fill* example uses `checkoutElements.init('inline', {...})`. Validate the exact identifier string against the live library during the spike before committing. Use `inlineCheckout`/`overlayCheckout` as primary.

### 4.6 Visibility options (exact keys from docs)
Filled inside `visibilityOptions`:

```js
visibilityOptions: {
  hideBillet: '1',
  hideTransf: '1',
  hidePayPal: '1',
  split: '12',            // pre-select installments
  hideMultipleCards: '1',
  showOnlyTrial: '1',
  hideTrial: '1',
  showTrialBillet: '1',
  hidePix: '1',
  hidewallet: '1',
  hideCouponOption: '1',
  xcod: 'your_campaign_code',
  src: 'xxx'
}
```

### 4.7 Integration notes for `apps/web` (Next.js) — recommendations
- Load the script once per checkout route (e.g. Next `<Script strategy="afterInteractive">`) and run `init/mount` in a client component after the script is ready.
- Read `sck` / `src` / `xcod` and buyer pre-fill from the landing URL query string and pass them into `init()` so paid-traffic attribution survives into the checkout.
- One offer code per offer; map them in config, not hard-coded inline.

---

## 5. Part 2 — Back-end (Webhook / Postback v2.0.0)

This is how we confirm the sale server-side and trigger access + server-side tracking. Configured in the Hotmart panel (Tools → Webhook/Postback) pointing at our endpoint.

### 5.1 Events available (exact list from docs)
`PURCHASE_CANCELED`, `PURCHASE_COMPLETE`, `PURCHASE_BILLET_PRINTED`, `PURCHASE_APPROVED`, `PURCHASE_PROTEST`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_EXPIRED`, `PURCHASE_DELAYED`.

For "access granted on paid", key on **`PURCHASE_APPROVED`** (and handle `PURCHASE_COMPLETE`); revoke on `PURCHASE_REFUNDED` / `PURCHASE_CHARGEBACK` / `PURCHASE_CANCELED`.

### 5.2 Security — mandatory
- Every request carries a token in the HTTP header **`X-HOTMART-HOTTOK`** (field name `hottok`). Each account has a unique token.
- **Validate `X-HOTMART-HOTTOK` before processing** every payload. Store the expected token as a secret/env var.

### 5.3 Key payload fields (validated subset)
Top level: `id`, `creation_date` (ms epoch), `event`, `version` (`"2.0.0"`), `data`.

| Path | Meaning |
|---|---|
| `data.buyer.email` / `.name` / `.document` | Buyer identity (only if collected at checkout) |
| `data.purchase.transaction` | Unique transaction ref (e.g. `HP17715690036014`) → **use as idempotency key** |
| `data.purchase.status` | `APPROVED`, `COMPLETE`, `REFUNDED`, `CHARGEBACK`, `WAITING_PAYMENT`, `STARTED`, … (full list in docs) |
| `data.purchase.approved_date` | Approval timestamp (ms epoch) |
| `data.purchase.full_price.value` / `.currency_value` | Amount paid + ISO-4217 currency |
| `data.purchase.offer.code` | Offer code (maps back to the embed in §4.2) |
| `data.purchase.payment.type` | `CREDIT_CARD`, `PIX`, `BILLET`, `PAYPAL`, `WALLET`, … |
| `data.purchase.origin.src` / `.sck` / `.xcod` | **Attribution** — the same params we pass in the embed come back here |
| `data.producer.name` / `.document` | Creator identity |
| `data.commissions[]` | Commission value, currency, source (`PRODUCER`/`AFFILIATE`/…) |

### 5.4 Receiver implementation for `apps/api` (Express) — recommendations
- `POST /webhooks/hotmart` (multi-tenant: route/segment by org/BU as the existing ingestion does).
- Order of operations: (1) verify `X-HOTMART-HOTTOK`; (2) de-dupe on `data.purchase.transaction` + `event`; (3) switch on `event`/`status`; (4) emit a typed event onto the existing event bus; (5) return `200` fast, do side-effects async.
- Respect documented Webhook HTTP response-code expectations (see Webhook "Response HTTP Codes").

---

## 6. Attribution end-to-end (why the params matter)

The same identifiers flow front → back, which closes the paid-media loop:

```
Landing URL (?src=&sck=&xcod=)
   → Checkout Elements init({ prefilledInfo.sck, visibilityOptions.src, visibilityOptions.xcod })
      → Webhook payload data.purchase.origin.{src, sck, xcod}
         → server-side Meta CAPI / Hyros event keyed to the campaign
```

Wire `src` / `sck` / `xcod` from day one so attribution isn't retrofitted. (Ties into existing Hyros + Meta CAPI setup.)

---

## 7. Constraints & gotchas (validated)

1. **Coupling:** Hotmart states explicitly — *if your sales page is unavailable, your checkout is unavailable too.* We own funnel uptime.
2. **No raw card data / no custom payment form** — styling of the payment fields is limited to what Hotmart's Checkout Builder allows; we control the container and surrounding page only.
3. **Post-purchase is webhook-driven**, not (confirmed) front-end-callback-driven — design the success UX around a redirect/thank-you page + the webhook, not an assumed JS callback.

---

## 8. Open questions to confirm before/while building **[CONFIRM]**

1. Exact init identifier (`inlineCheckout` vs `inline`) against the live library.
2. Whether the embed lib exposes any success/error JS event we can hook (vs. relying solely on webhook + redirect).
3. Configurable post-purchase / thank-you redirect URL in the product's checkout settings.
4. Behavior of the inline embed on iOS/Safari (cross-origin) — validate on real devices.
5. Sandbox availability for end-to-end test purchases (Hotmart docs list a "Sandbox" section) — confirm we can issue test transactions.
6. Which offers/products are in scope (one code per offer).

---

## 9. Implementation checklist / acceptance criteria

**Spike (½–1 day)**
- [ ] Get one real offer code (Pricing and offers).
- [ ] Stand up a throwaway page with `inlineCheckout` + `overlayCheckout`; confirm both render and a test purchase completes.
- [ ] Confirm exact init identifier; document it.

**Front-end (`apps/web`)**
- [ ] Checkout route renders inline embed; overlay variant available as a button component.
- [ ] `sck`/`src`/`xcod` + pre-fill read from query string and passed to `init()`.
- [ ] Offer codes in config, not hard-coded.

**Back-end (`apps/api`)**
- [ ] `POST /webhooks/hotmart` validates `X-HOTMART-HOTTOK`.
- [ ] Idempotent on `purchase.transaction`.
- [ ] Handles `PURCHASE_APPROVED`/`COMPLETE` (grant) and `REFUNDED`/`CHARGEBACK`/`CANCELED` (revoke).
- [ ] Emits typed event onto existing bus; Meta CAPI / Hyros fired server-side with attribution.
- [ ] Returns 200 quickly; side-effects async; failures retried/logged.

**Done when:** a test purchase on an `apps/web` page triggers a verified webhook that grants access and fires a server-side conversion with correct `src/sck/xcod`.

---

## 10. Sources (official Hotmart docs)

- Checkout Elements (embed + overlay, params): https://developers.hotmart.com/docs/en/tutorials/checkout-elements/
- Checkout page widget (overlay, panel steps): https://help.hotmart.com/en/article/360004829631/how-to-configure-the-checkout-page-widget
- Webhook / Purchase events v2.0.0 (events, hottok, payload): https://developers.hotmart.com/docs/en/2.0.0/webhook/purchase-webhook/
- Discover Hotmart's APIs: https://help.hotmart.com/en/article/4403617024013/discover-hotmart-s-apis
- Checkout parameters (URL params): https://help.hotmart.com/en/article/115003588572/how-do-i-set-up-my-checkout-parameters-
