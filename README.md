# SmartCheckout AI — Hackathon (Track 3: AI Checkout Copilot)

AI layer on top of checkout that **proactively explains** fees, delivery, bundle savings, and payment tradeoffs — and **carries context** from product discovery through purchase without extra steps.

## What it does

- **Shopify storefront** — browse real products, add to cart
- **AI analyze** — `GET /api/checkout/analyze/{cartTotal}` returns savings, payment/delivery recommendations, and plain-language tradeoffs
- **Shopping context** — last product viewed is passed to AI so checkout does not feel like starting over
- **One-click AI checkout** — `POST /api/checkout/complete` confirms order, clears cart, shows order summary
- **SmartCheckout Copilot** — modal popup (`POST /api/ai-chat`, Groq `llama3-8b-8192`) for checkout optimization Q&A; panel button opens chat on demand
- **Simplified payment flow** — payment methods only in the **Proceed to Payment** modal (UPI/Card/Wallet/Net Banking); main panel focuses on AI decisions, not duplicate payment UI
- **Mock payment flow** — Cart + AI insights → Payment modal → Order confirmation (app-root overlay) with AI summary

## Run locally (demo for judges)

### 1. Backend (.NET)

```bash
cd backend
dotnet run
```

API: `http://localhost:5009`  
Swagger: `http://localhost:5009/swagger`

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

App: `http://localhost:4200`

## AI checkout flow (current UI)

1. **Browse & add** — products with **AI Recommended** badges on the grid  
2. **AI analyze** — cart updates trigger `GET /api/checkout/analyze/{cartTotal}`; panel shows loading then insights  
3. **Embedded AI decision support** (main checkout panel, no payment picker):
   - **Cart summary** — line items + highlighted **AI savings** row when savings &gt; 0  
   - **Smart context** banner — last product viewed + **no repeat questions** (context passed to analyze/complete/chat)  
   - **AI Insights** — savings chip, recommended payment, delivery, AI score + progress bar  
   - **Checkout comparison** — Standard vs **SmartCheckout AI** (1-click path, savings, score)  
4. **SmartCheckout Copilot** — button opens a full-screen modal; first message positions the assistant as checkout optimization (not generic chat)  
5. **Proceed to Payment** — payment modal with AI-recommended method pre-highlighted  
6. **Order confirmation** — root-level overlay; cart cleared; AI summary on the receipt  

## SmartCheckout Copilot (popup)

- Opened via **SmartCheckout Copilot** on the checkout panel (not embedded in the scroll area).  
- Quick prompts: savings, delivery, payment, total cost, best value.  
- Uses cart + insights payload on each `POST /api/ai-chat` request.  
- Escape, backdrop click, or **×** closes the modal.  

## Savings insights & context retention

| Surface | What judges see |
|--------|------------------|
| **AI Insights card** | ₹ saved, payment/delivery picks, AI score |
| **Cart summary** | Green **AI savings** callout in totals |
| **Comparison card** | Side-by-side Standard vs optimized path with savings line |
| **Smart context** | “From *&lt;product&gt;* — no repeat questions” when user viewed a product before checkout |
| **Confirmation** | Order ID, savings, delivery, payment label, AI summary paragraph |

Context is wired through `ShoppingContextService` into analyze, complete, and copilot APIs.

## Simplified payment flow

- **Removed** inline payment method grid from the main panel (freed space for AI showcase).  
- Payment UX lives entirely in **`app-payment-modal`** after **Proceed to Payment →**.  
- Recommended method from insights is highlighted in the modal (`PaymentModal` + `PaymentService` mock).  

## Hackathon criteria mapping

| Criteria | Implementation |
|----------|----------------|
| Explain fees, delivery, bundles, payment | AI Insights chips, comparison card, Copilot chat + backend tradeoff fields |
| Maintain discovery → purchase context | `ShoppingContextService` + **Smart context** banner; context on analyze/complete/chat |
| Reduce checkout steps | AI pre-selects payment & delivery; comparison shows 1-click optimized path; payment in one modal |
| Polished E2E | Toasts, loading states, modal layering, order confirmation overlay, continue shopping |

## Stack

- **Frontend:** Angular 21, Shopify Storefront API (axios)
- **Backend:** ASP.NET Core, tiered `AiRecommendationService`

## Env

Shopify demo store credentials are in `frontend/src/environments/environment.ts`. Backend URL: `http://localhost:5009/api`.

### Groq API (SmartCheckout Copilot)

Set your Groq key before running the backend (get one at [console.groq.com](https://console.groq.com)):

**PowerShell:**
```powershell
$env:GROQ_API_KEY="your_groq_api_key_here"
cd backend
dotnet run
```

Or set `Groq:ApiKey` in `backend/appsettings.Development.json` (do not commit real keys).

**Flow:** Angular `AiChatService` → `POST /api/ai-chat` → `GroqChatService` → Groq `llama3-8b-8192` → reply in Copilot modal bubbles.

Without a key, the API returns smart rule-based fallback answers so the demo still works.
