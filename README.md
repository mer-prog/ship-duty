# ShipDuty Calculator

**Estimate duties and shipping costs by country, right on the product page.**

![ShipDuty Calculator Screenshot](docs/screenshots/ship-duty-preview.png)

## Features

- **Product Page Widget** — Theme App Extension that embeds a duty & shipping calculator on any product page
- **Country Selector** — Customers pick their destination country to see estimated landed costs
- **Landed Cost Breakdown** — Shows product price + estimated duty + estimated shipping = total
- **Admin Rate Tables** — Manage country-specific duty rates and weight-based shipping rates from the app dashboard
- **Seed Data** — Pre-loaded rates for 10 major markets (US, GB, DE, FR, AU, CA, KR, CN, SG, TW)
- **Disclaimer Display** — Built-in legal disclaimer for estimated calculations
- **Widget Toggle** — Enable or disable the storefront widget from the admin panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Remix (Shopify App Template) |
| Language | TypeScript |
| Database | Prisma + SQLite |
| Admin UI | Polaris React |
| Storefront | Theme App Extension (Vanilla JS + CSS) |
| API | Shopify GraphQL Admin API |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- A Shopify development store with Online Store 2.0 theme

### Setup

```bash
# Install dependencies
npm install

# Set up the database and seed default rates
npx prisma migrate dev

# Start development server
shopify app dev
```

### Deployment

```bash
shopify app deploy
```

After deployment, add the **ShipDuty Calculator** block to your product page template via the Shopify Theme Editor.

## Architecture

```
ship-duty/
├── app/
│   ├── routes/          # Settings dashboard, rate table management, calculation API
│   ├── services/        # Duty calculator, shipping rate lookup
│   └── components/      # Rate table editor, country selector
├── extensions/
│   └── ship-duty-widget/   # Theme App Extension
│       ├── blocks/         # Liquid block for product pages
│       └── assets/         # Frontend JS & CSS for the widget
├── prisma/              # Database schema (DutyRate, ShippingRate, WidgetSettings)
└── shopify.app.toml     # Shopify app configuration
```

The storefront widget calls the app's `/api/calculate` endpoint with the product price, weight, and selected country. The server applies the matching duty rate (percentage-based) and looks up weight-band shipping rates, returning a cost breakdown rendered by the widget.

## License

MIT
