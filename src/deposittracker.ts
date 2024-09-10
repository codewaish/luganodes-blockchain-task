import { ethers } from 'ethers';
import { RPCManager } from './rpcManager';
import { Deposit } from './types';
import { ErrorHandler } from './errorHandler';
import { Database } from './database';
import { TelegramNotifier } from './telegramNotifier';

export class DepositTracker {
  private rpcManager: RPCManager;
  private depositContract: ethers.Contract;
  private database: Database;
  private telegramNotifier: TelegramNotifier;

  constructor() {
    this.rpcManager = new RPCManager();
    this.depositContract = this.rpcManager.getContract(
      process.env.BEACON_DEPOSIT_CONTRACT as string,
      ['event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)']
    );
    this.database = new Database();
    this.telegramNotifier = new TelegramNotifier(process.env.TELEGRAM_BOT_TOKEN!, process.env.TELEGRAM_CHAT_ID!);
  }

  public async startTracking() {
    try {
      await this.database.connect();
      ErrorHandler.logInfo('Starting deposit tracking...');
      this.depositContract.on('DepositEvent', this.handleDeposit.bind(this));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'DepositTracker.startTracking');
      throw error;
    }
  }

  private async handleDeposit(pubkey: string, withdrawalCredentials: string, amount: string, signature: string, index: string, event: ethers.Event) {
    try {
      const block = await event.getBlock();
      const transaction = await event.getTransaction();

      const deposit: Deposit = {
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        fee: ethers.utils.formatEther(transaction.gasPrice.mul(transaction.gasLimit)),
        hash: event.transactionHash,
        pubkey: ethers.utils.hexlify(pubkey)
      };

      ErrorHandler.logInfo('New deposit detected', { deposit });

      await this.database.saveDeposit(deposit);
      await this.telegramNotifier.sendNotification(`New deposit detected: ${deposit.hash}`);

      await this.checkForMultipleDeposits(event.transactionHash);
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'DepositTracker.handleDeposit');
    }
  }

  private async checkForMultipleDeposits(txHash: string) {
    try {
      const receipt = await this.rpcManager.getTransactionReceipt(txHash);
      const depositEvents = receipt.logs.filter(log => 
        log.address.toLowerCase() === process.env.BEACON_DEPOSIT_CONTRACT?.toLowerCase()
      );

      if (depositEvents.length > 1) {
        ErrorHandler.logInfo(`Multiple deposits detected in transaction ${txHash}`, { count: depositEvents.length });
        // Handle multiple deposits if needed
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'DepositTracker.checkForMultipleDeposits');
    }
  }

  public async stopTracking() {
    try {
      this.depositContract.removeAllListeners();
      await this.database.close();
      ErrorHandler.logInfo('Deposit tracking stopped');
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'DepositTracker.stopTracking');
    }
  }
}