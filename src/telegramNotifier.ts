import axios from 'axios';
import { ErrorHandler } from './errorHandler';

export class TelegramNotifier {
  private botToken: string;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  public async sendNotification(message: string) {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: this.chatId,
        text: message
      });

      if (response.status === 200) {
        ErrorHandler.logInfo('Telegram notification sent successfully');
      } else {
        throw new Error(`Failed to send Telegram notification: ${response.statusText}`);
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'TelegramNotifier.sendNotification');
    }
  }
}

// Usage in DepositTracker:
// 
// private telegramNotifier: TelegramNotifier;
// 
// constructor() {
//   // ...existing code...
//   this.telegramNotifier = new TelegramNotifier(process.env.TELEGRAM_BOT_TOKEN!, process.env.TELEGRAM_CHAT_ID!);
// }
// 
// In handleDeposit method:
// await this.telegramNotifier.sendNotification(`New deposit detected: ${deposit.hash}`);