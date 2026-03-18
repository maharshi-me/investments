# Mutual Funds Investments Tracker

A modern web application for tracking and visualizing your mutual funds investment portfolio performance.

## Key Features

- **Automated Data Import**: Read and parse mutual fund transactions directly from Consolidated Account Statement (CAS) PDF
- **Real-time Price Updates**: Fetch latest NAV prices from mfapi.in with caching using IndexedDB
- **Local Storage**: Securely store your transaction data locally — no server, no sign-up
- **Portfolio Analysis**:
  - Current holdings with unrealised P&L per scheme
  - Realised profit tracking (FIFO cost basis)
  - Performance tracking with gain percentages
- **Tax Analysis**:
  - Realised profit broken down by financial year (Apr–Mar)
  - STCG / LTCG classification based on holding period
  - Configurable fund type (Equity vs Debt) — Equity: 1yr threshold, Debt: 3yr threshold
  - Summary cards for Equity STCG, Equity LTCG, Debt STCG, Debt LTCG
  - Fund type settings persisted in localStorage
- **Responsive Design**
  - Adapts to desktop and mobile devices
  - Dark/Light theme support
  - Collapsible sidebar navigation

## Data Sources

- **Transactions**: CAMS/KFintech Consolidated Account Statement (CAS)
- **NAV Prices**: mfapi.in (updates once a day)
- **Storage**: Browser's LocalStorage & IndexedDB for persistent data

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Tables**: TanStack Table
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Routing**: React Router v7
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/maharshi-me/investments.git
```

2. Install dependencies

```bash
cd investments
npm install
```

3. Start the development server

```bash
npm run dev
```

## Usage

### Dashboard

The dashboard provides a comprehensive view of your investment portfolio:

1. **Portfolio Cards**
   - Total Investment Value
   - Current Portfolio Value
   - All-Time Returns

2. **Performance Chart**
   - Compare invested value vs current value
   - Time period selection:
     - 1 Month
     - 1 Year
     - All Time

3. **Capital Flow Chart**
   - Track investment inflows and outflows
   - View options:
     - Last 12 Months
     - Annually
     - All Time

### Portfolio

- View all mutual fund holdings with current value, invested amount, and returns
- Expand each fund to see individual purchase lots with holding period and gain %
- Realised returns tracked per scheme

### Transactions

- Full transaction history sorted by date
- Searchable and filterable

### Tax Analysis

- View realised profits per redemption event with purchase date, holding period, and STCG/LTCG classification
- Filter by **Financial Year** (defaults to current FY, sorted recent-first)
- Configure each fund as **Equity** or **Debt** via the Fund Types settings panel (persisted across sessions)
- Summary cards show breakdown: Total P&L, Equity STCG, Equity LTCG, Debt STCG, Debt LTCG

### Settings

- Import your CAS PDF to load transaction data
- Theme toggle (Dark / Light)

## Customization

### Theme

The application supports both light and dark themes. Colors can be customized in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  // ...other color variables
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  // ...other dark theme colors
}
```

### Charts

Chart colors and styling can be modified through the `chartConfig` object:

```typescript
const chartConfig = {
  transactions: {
    label: "Capital Flow",
    color: "hsl(var(--chart-1))",
  },
};
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
