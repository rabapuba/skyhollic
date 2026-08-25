# Polymarket BTC 5m Real-time Terminal 🚀

An ultra-fast, minimalist real-time web application to track Polymarket's recurring 5-minute Bitcoin Up/Down binary options markets (`btc-updown-5m-{unix_timestamp}`).

![Terminal Preview](https://polymarket-upload.s3.us-east-2.amazonaws.com/BTC+fullsize.png)

## Features
- **Auto-rolling 5-Minute Window**: Automatically calculates and rolls over to active 5-minute Polymarket window timestamps (`floor(now / 300) * 300`).
- **Active Countdown Timer**: Real-time countdown timer showing seconds remaining before expiry.
- **1m & 5m Candlestick Charts**: Built with TradingView Lightweight Charts (60fps canvas engine) fed by live orderbook ticks and trade executions.
- **Live CLOB Order Book**: Real-time Bids and Asks depth visualization streaming directly from Polymarket CLOB WebSocket (`wss://ws-subscriptions-clob.polymarket.com/ws/market`).
- **Live Trades Stream**: Transaction feed showing Buy/Sell orders, prices, sizes, and direct Polygonscan transaction links.
- **Ultra-Lightweight & Clean**: Minimalist dark theme without clutter, designed for maximum clarity and fast refresh.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Chart Engine**: TradingView Lightweight Charts
- **Data Feeds**: Polymarket Gamma API, Polymarket CLOB REST & WebSocket API, Chainlink TWAP Oracle reference

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/rabapuba/polymarket-btc-5m.git
cd polymarket-btc-5m

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

## License
MIT License
