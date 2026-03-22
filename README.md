# AI-Powered Financial Terminal

A professional-grade trading workstation built with Next.js, Tailwind CSS, and Gemini AI. This terminal provides real-time market data visualization, technical analysis, and institutional-grade AI trading signals.

## 🚀 Features

- **Real-time Market Data:** Live-updating price feeds and interactive charts.
- **AI "Stock Brain":** A Senior Quantitative Analyst AI that provides BUY/SELL/HOLD signals with precise entry, stop-loss, and take-profit targets.
- **Data Aggregator:** Integrated with Alpha Vantage and Finnhub for real-time RSI technicals and news sentiment.
- **Favorites Terminal:** A sleek watchlist with dynamic sparkline graphs and color-coded trend indicators.
- **Interactive Charts:** Multi-timeframe support (1D, 1W, 1M, 1Y) using Recharts.
- **Glassmorphism UI:** A modern, high-density interface with backdrop-blur effects and vivid neon accents.

## 🛠️ Components

### 1. `Watchlist.tsx` (Favorites Terminal)
The primary navigation hub. It displays a list of "Favorite" stocks with:
- **Sparklines:** Compact trend visualizations.
- **Color Coding:** Vivid Green (Up), Blue (Flat), and Red (Down).
- **Interactivity:** Clicking a stock opens the detailed analysis modal.

### 2. `StockModal.tsx` (The Brain)
The core analysis engine. When a stock is selected, this component:
- Renders a detailed price chart using `Recharts`.
- Fetches real-time intelligence via the `/api/stock-intelligence` route.
- Triggers the **Gemini AI** to perform a quantitative risk assessment.
- Displays a structured trading signal with confidence scores and reasoning.

### 3. `MarketOverview.tsx`
Provides a high-level summary of major indices (S&P 500, NASDAQ, etc.) to give context to the overall market sentiment.

### 4. `TradeFeed.tsx`
A scrolling feed of recent high-probability trade setups and market alerts, keeping the user informed of emerging opportunities.

### 5. `api/stock-intelligence/route.ts`
A server-side Next.js API route that aggregates data from:
- **Alpha Vantage:** Technical indicators (RSI).
- **Finnhub:** News sentiment and buzz scores.
- **Fallback Logic:** Gracefully handles free-tier API limits to ensure the terminal remains functional.

## 💻 Local Setup

Follow these steps to run the project on your local machine:

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd ai-studio-applet
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your API keys:

```env
# Gemini API Key (Required for AI Analysis)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Alpha Vantage API Key (Optional - for real-time RSI)
ALPHA_VANTAGE_KEY=your_alpha_vantage_key

# Finnhub API Key (Optional - for news sentiment)
FINNHUB_KEY=your_finnhub_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the terminal.

## 🧪 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini SDK (`@google/genai`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Fetching:** Axios

## 📄 License
MIT
