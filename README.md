# Ethereum Deposit Tracker

This project implements an Ethereum Deposit Tracker to monitor and record ETH deposits on the Beacon Deposit Contract.

## Features

- Real-time monitoring of ETH deposits
- Handling of multiple deposits in a single transaction
- Comprehensive error handling and logging
- Telegram notifications for new deposits
- (Optional) Grafana dashboard for visualizing deposit data

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory and add the following:
   ```
   ALCHEMY_API_KEY=your_alchemy_api_key
   BEACON_DEPOSIT_CONTRACT=0x00000000219ab540356cBB839Cbe05303d7705Fa
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ```
4. Build the project: `npm run build`

## Usage

To start the tracker:

```
npm start
```

For development with hot reloading:

```
npm run dev
```

## Project Structure

- `src/index.ts`: Entry point of the application
- `src/depositTracker.ts`: Main logic for tracking deposits
- `src/rpcManager.ts`: Manages RPC interactions
- `src/errorHandler.ts`: Centralized error handling and logging
- `src/telegramNotifier.ts`: Handles Telegram notifications
- `src/types.ts`: TypeScript interfaces and types

## Error Handling and Logging

Errors and important events are logged using Winston. Logs are output to both the console and separate log files for different components.

## Telegram Notifications

The system sends notifications to a specified Telegram chat when new deposits are detected. Ensure you've set up a Telegram bot and obtained the necessary tokens before enabling this feature.

## Grafana Dashboard (Optional)

To set up the Grafana dashboard:

1. Install and configure Grafana
2. Set up a data source (e.g., the log files or a database if you've implemented one)
3. Import the provided dashboard JSON or create custom panels

## Contributing

Please submit pull requests for any improvements or bug fixes.

## License

MIT
