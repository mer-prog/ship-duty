# ShipDuty Calculator — Cross-Border Duty & Shipping Estimator for Shopify

> **What:** A Shopify app that displays estimated customs duties and shipping costs on product pages, reducing purchase anxiety for cross-border e-commerce buyers
> **Who:** Shopify store owners without Global-e integration, international shoppers
> **Tech:** Remix · TypeScript · Prisma · SQLite · Polaris React · Shopify App Bridge · Theme App Extension

**Source Code:** [GitHub](https://github.com/mer-prog/ship-duty)

---

## Skills Demonstrated

| Skill | Implementation |
|-------|---------------|
| Shopify Embedded App Development | App Bridge + Polaris UI admin dashboard, OAuth authentication, webhook handling |
| Theme App Extension | Liquid + Vanilla JS + CSS product page widget without React dependency |
| Full-Stack API Design | Remix route-based calculation API with CORS support, validation, and error handling |
| Database Design & ORM | Prisma schema with 4 models, compound unique constraints, migration management, and seed data |
| Internationalization (i18n) | React Context-based locale provider with JSON dictionaries and nested key resolution |
| Business Logic Separation | Server-side service layer isolating duty calculation and shipping rate lookup |
| Responsive UI | Polaris React components for admin, custom CSS for theme extension widget |

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Remix ^2.16.1 | SSR, routing, API routes |
| Language | TypeScript ^5.2.2 (strict mode) | Type-safe development |
| ORM | Prisma ^6.2.1 | Schema management, queries |
| Database | SQLite | Lightweight, portable data storage |
| UI Library | Polaris React ^12.0.0 | Shopify admin design consistency |
| Shopify Integration | @shopify/shopify-app-remix ^4.1.0 | Authentication, session management |
| Shopify Integration | @shopify/app-bridge-react ^4.1.6 | Embedded app infrastructure |
| Session Storage | @shopify/shopify-app-session-storage-prisma ^8.0.0 | Prisma-backed session persistence |
| Build Tool | Vite ^6.2.2 | HMR, bundling |
| Frontend | React ^18.2.0 | Admin panel UI |
| Theme Extension | Vanilla JS + CSS + Liquid | Product page widget |
| Linting | ESLint ^8.42.0 + Prettier ^3.2.4 | Code quality enforcement |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Shopify Storefront                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Theme App Extension (Product Page)               │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐    │  │
│  │  │ duty-calculator  │  │  duty-calculator.js (IIFE)   │    │  │
│  │  │    .liquid       │──│  Country select → API → Show │    │  │
│  │  └─────────────────┘  └──────────┬───────────────────┘    │  │
│  └──────────────────────────────────┼────────────────────────┘  │
└─────────────────────────────────────┼────────────────────────────┘
                                      │ POST /api/calculate
                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Remix Server (Embedded App)                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ app._index   │  │ app.rates    │  │ api.calculate      │     │
│  │ Settings     │  │ Rate Tables  │  │ Calculation API    │     │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘     │
│         │                 │                     │                │
│         ▼                 ▼                     ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Service Layer                         │    │
│  │  duty-calculator.server.ts  │  shipping-rates.server.ts │    │
│  └─────────────────────────────┴───────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Prisma ORM + SQLite                       │    │
│  │  Session │ DutyRate │ ShippingRate │ WidgetSettings     │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Duty & Shipping Estimation Widget (Theme App Extension)
A product page widget that lets buyers select their shipping destination and instantly see estimated duties and shipping costs.

- **Country Dropdown:** Supports 10 countries (US, GB, DE, FR, AU, CA, KR, CN, SG, TW)
- **Calculation Display:** Product Price + Estimated Duty + Estimated Shipping = Estimated Total
- **Currency Formatting:** Locale-aware formatting via `Intl.NumberFormat`
- **Disclaimer:** Customizable disclaimer text via theme editor
- **Implementation:** Liquid + Vanilla JS (IIFE) + CSS — lightweight with no React dependency

### 2. Settings Dashboard (Admin)
An admin panel for store owners to control widget behavior.

- **Widget Toggle:** Enable/disable with Active/Inactive badge indicator
- **Origin Country:** Select from 11 countries (including JP)
- **Default Currency:** Choose from 10 currencies (JPY, USD, EUR, GBP, AUD, CAD, KRW, CNY, SGD, TWD)
- **Implementation:** Polaris React components with Remix action-based form handling

### 3. Rate Table Management (Admin)
A full CRUD interface for managing country-specific duty rates and shipping costs.

- **Duty Rate Management:** Country + category-based rate configuration with IndexTable and modal forms
- **Shipping Rate Management:** Country + weight band-based pricing
- **Inline Deletion:** Per-record delete buttons with warning styling
- **Implementation:** Polaris IndexTable, Modal, Banner, multi-intent Remix actions

### 4. Calculation API
A REST endpoint that processes estimation requests from the theme extension.

- **Validation:** Required field checks, numeric validation, widget activation verification
- **Category Fallback:** Automatically falls back to "general" category when a specific category rate is not configured
- **CORS Support:** Allows POST requests from all origins for storefront compatibility
- **Error Handling:** Distinct HTTP status codes (400/403/405/500) with descriptive messages

### 5. Internationalization (i18n)
Admin panel language switching between English and Japanese.

- **React Context-Based:** I18nProvider for locale management
- **Nested Key Resolution:** Dot-separated keys (e.g., `settings.title`) for structured translations
- **Language Toggle UI:** EN/JA buttons displayed on all admin pages
- **Default Locale:** Japanese (ja)

### 6. Webhook Handling
- **app/uninstalled:** Removes all session data when the app is uninstalled
- **app/scopes_update:** Updates session scope when API permissions change

---

## API Endpoint

### POST `/api/calculate`

Computes estimated duty and shipping costs for a product.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| shop | string | Yes | Shop domain |
| countryCode | string | Yes | Destination country code (ISO 3166-1 alpha-2) |
| productPrice | number | Yes | Product price (must be >= 0) |
| weight | number | No | Weight in grams (default: 500) |
| category | string | No | Product category (default: "general") |

**Response (200):**

```json
{
  "productPrice": 100.00,
  "duty": {
    "rate": 0.05,
    "amount": 5.00
  },
  "shipping": {
    "rate": 15.00,
    "currency": "USD",
    "weightBand": "0g - 500g"
  },
  "totalEstimate": 120.00,
  "currency": "JPY",
  "disclaimer": "This is an estimate only..."
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Missing required fields, non-numeric or negative productPrice |
| 403 | Widget is disabled for the specified shop |
| 405 | Non-POST HTTP method |
| 500 | Internal server error |

---

## Database Design

### ER Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Session    │     │    DutyRate       │     │   ShippingRate     │
├──────────────┤     ├──────────────────┤     ├────────────────────┤
│ id       PK  │     │ id           PK  │     │ id             PK  │
│ shop         │     │ shop             │     │ shop               │
│ state        │     │ countryCode      │     │ countryCode        │
│ isOnline     │     │ category         │     │ minWeight (g)      │
│ scope        │     │ rate (Float)     │     │ maxWeight (g)      │
│ expires      │     │                  │     │ rate (Float)       │
│ accessToken  │     │ UQ: shop +       │     │ currency           │
│ userId       │     │   countryCode +  │     │                    │
│ firstName    │     │   category       │     │ UQ: shop +         │
│ lastName     │     └──────────────────┘     │   countryCode +    │
│ email        │                               │   minWeight +      │
│ accountOwner │     ┌──────────────────┐     │   maxWeight        │
│ locale       │     │ WidgetSettings   │     └────────────────────┘
│ collaborator │     ├──────────────────┤
│ emailVerified│     │ id           PK  │
│ refreshToken │     │ shop        UQ   │
│ refreshToken │     │ isActive         │
│   Expires    │     │ originCountry    │
└──────────────┘     │ defaultCurrency  │
                     └──────────────────┘
```

### Calculation Logic

```
Duty Amount = Product Price × Duty Rate (by country + category)
  └─ If category-specific rate not found → falls back to "general" category
  └─ If "general" not found → rate defaults to 0%

Shipping = Weight band table lookup (country code × weight range)
  └─ If no matching weight band → shipping defaults to 0

Total Estimate = Product Price + Duty Amount + Shipping (rounded to 2 decimals)
```

---

## Seed Data

Default data for 10 major countries (target shop: `ryo-dev-plus.myshopify.com`).

### Duty Rates (Category: general)

| Country Code | Country | Rate |
|-------------|---------|------|
| US | United States | 5% |
| GB | United Kingdom | 4% |
| DE | Germany | 4% |
| FR | France | 4% |
| AU | Australia | 5% |
| CA | Canada | 5% |
| KR | South Korea | 8% |
| CN | China | 10% |
| SG | Singapore | 0% |
| TW | Taiwan | 6% |

### Shipping Rates (3 Weight Bands, USD)

| Country Code | 0–500g | 501–1000g | 1001–2000g |
|-------------|--------|-----------|------------|
| US | $15 | $22 | $35 |
| GB | $18 | $26 | $40 |
| DE | $18 | $26 | $40 |
| FR | $18 | $26 | $40 |
| AU | $20 | $30 | $45 |
| CA | $16 | $24 | $38 |
| KR | $12 | $18 | $28 |
| CN | $10 | $16 | $25 |
| SG | $12 | $18 | $28 |
| TW | $10 | $16 | $25 |

---

## Screen Specifications

### 1. Landing Page (`/`)
Shop domain input screen. Submits to the OAuth authentication flow. Supports EN/JA language toggle.

### 2. Login Page (`/auth/login`)
Shopify shop domain validation with MissingShop/InvalidShop error messages. Language toggle available.

### 3. Settings Dashboard (`/app`)
Widget enable/disable toggle, origin country selector, default currency selector. Built with Polaris Page + Layout + Card components.

### 4. Rate Table Management (`/app/rates`)
Two-section layout for duty rates and shipping rates. Each section includes an IndexTable with add-record modal and per-row delete buttons. Empty state displays informational Banner.

### 5. Product Page Widget (Theme App Extension)
Country selection dropdown, calculate button, result display (product price, duty, shipping, total). Error display and disclaimer text. Title, button text, and disclaimer are customizable via the Shopify theme editor.

---

## Project Structure

```
ship-duty/
├── app/
│   ├── routes/
│   │   ├── app.tsx                          # App layout (i18n, nav)          48 lines
│   │   ├── app._index.tsx                   # Settings dashboard             155 lines
│   │   ├── app.rates.tsx                    # Rate table management           405 lines
│   │   ├── api.calculate.tsx                # Calculation API endpoint         85 lines
│   │   ├── auth.$.tsx                       # OAuth auth router                 9 lines
│   │   ├── auth.login/
│   │   │   ├── route.tsx                    # Login form                       89 lines
│   │   │   └── error.server.tsx             # Login error handler              17 lines
│   │   ├── _index/
│   │   │   ├── route.tsx                    # Landing page                     67 lines
│   │   │   └── styles.module.css            # Landing page styles              74 lines
│   │   ├── webhooks.app.uninstalled.tsx     # Uninstall webhook handler        18 lines
│   │   └── webhooks.app.scopes_update.tsx   # Scope update webhook handler     22 lines
│   ├── services/
│   │   ├── duty-calculator.server.ts        # Duty calculation logic           44 lines
│   │   └── shipping-rates.server.ts         # Shipping rate lookup logic       33 lines
│   ├── components/
│   │   ├── LanguageToggle.tsx               # EN/JA toggle button              30 lines
│   │   └── AppNavMenu.tsx                   # Navigation menu                  17 lines
│   ├── i18n/
│   │   ├── context.tsx                      # i18n provider & hook             72 lines
│   │   ├── en.json                          # English translations             75 lines
│   │   └── ja.json                          # Japanese translations            75 lines
│   ├── root.tsx                             # HTML document root               31 lines
│   ├── entry.server.tsx                     # Server entry point               60 lines
│   ├── routes.ts                            # Route configuration               4 lines
│   ├── globals.d.ts                         # Type declarations                 2 lines
│   ├── shopify.server.ts                    # Shopify app configuration        36 lines
│   └── db.server.ts                         # Prisma singleton client          16 lines
├── extensions/
│   └── ship-duty-widget/
│       ├── shopify.extension.toml           # Extension configuration          41 lines
│       ├── blocks/
│       │   └── duty-calculator.liquid       # Liquid template                  89 lines
│       └── assets/
│           ├── duty-calculator.js           # Frontend calculation logic       95 lines
│           └── duty-calculator.css          # Widget styling                  105 lines
├── prisma/
│   ├── schema.prisma                        # Database schema definition       65 lines
│   ├── seed.ts                              # Seed data script                121 lines
│   └── migrations/                          # Migration history
│       ├── 20240530213853_.../              # Session table creation
│       └── 20260314120422_.../              # Duty/Shipping/Widget tables
├── package.json                             # Dependency definitions           83 lines
├── tsconfig.json                            # TypeScript configuration         21 lines
├── vite.config.ts                           # Vite/Remix configuration         74 lines
├── .eslintrc.cjs                            # ESLint configuration             14 lines
├── .graphqlrc.ts                            # GraphQL codegen configuration    45 lines
└── shopify.app.toml                         # Shopify CLI configuration        43 lines
```

---

## Setup

### Prerequisites
- Node.js >=20.19 <22 or >=22.12
- Shopify CLI installed
- Shopify Partner account + development store

### Instructions

```bash
# Clone the repository
git clone https://github.com/mer-prog/ship-duty.git
cd ship-duty

# Install dependencies
npm install

# Initialize the database
npx prisma generate
npx prisma migrate deploy

# Load seed data
npx prisma db seed

# Start the development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SHOPIFY_API_KEY | Shopify API key | Yes |
| SHOPIFY_API_SECRET | Shopify API secret | Yes |
| SHOPIFY_APP_URL | Application URL | Yes |
| SCOPES | API scopes (comma-separated, e.g., `read_products`) | Yes |
| PORT | Server port (default: 3000) | No |
| SHOP_CUSTOM_DOMAIN | Custom shop domain | No |

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite as the database | Standard in the Shopify app template. Single-file DB simplifies development and deployment with no external database dependency, reducing operational costs to zero |
| Vanilla JS for Theme App Extension | Avoids shipping a React bundle to the storefront, minimizing performance impact and preventing conflicts with the store theme |
| Weight band-based shipping model | More realistic than flat-rate shipping. Three weight tiers (0–500g, 501–1000g, 1001–2000g) provide practical accuracy |
| Category fallback mechanism | Ensures calculations succeed even without category-specific rates by falling back to "general." Reduces configuration burden for store owners |
| Prisma compound unique constraints | Guarantees data uniqueness across shop + country + category/weight combinations. Enables safe upsert operations |
| React Context-based i18n | Avoids external i18n library dependencies while enabling lightweight EN/JA switching with full compatibility with Shopify Polaris AppProvider |
| CORS open to all origins | Required for cross-origin API calls from theme extensions. Shopify storefront domains vary dynamically across stores |
| API version 2024-10 | Uses Shopify's stable, long-term supported API version |

---

## Running Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Shopify Partner | Development Store (free) | $0 |
| SQLite | File-based database | $0 |
| Shopify App Hosting | Shopify infrastructure | $0 |
| **Total** | — | **$0** |

---

## Author

[@mer-prog](https://github.com/mer-prog)
