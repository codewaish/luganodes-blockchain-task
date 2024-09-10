import { ethers } from 'ethers';
import { RPCManager } from './rpcManager';
import { Deposit } from './types';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'deposits.log' })
  ]
});

export class DepositTracker {
  private rpcManager: RPCManager;
  private depositContract: ethers.Contract;

  constructor() {
    this.rpcManager = new RPCManager();
    this.depositContract = this.rpcManager.getContract(
      process.env.BEACON_DEPOSIT_CONTRACT as string,
      ['event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)']
    );
  }

  public async startTracking() {
    logger.info('Starting deposit tracking...');
    this.depositContract.on('DepositEvent', this.handleDeposit.bind(this));
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

      logger.info('New deposit detected', { deposit });

      // Here you would typically save the deposit to a database
      await this.saveDeposit(deposit);

      // Check for multiple deposits in a single transaction
      await this.checkForMultipleDeposits(event.transactionHash);
    } catch (error) {
      logger.error('Error handling deposit', { error, event });
    }
  }

  private async saveDeposit(deposit: Deposit) {
    // Implement database saving logic here
    logger.info('Deposit saved to database', { deposit });
  }

  private async checkForMultipleDeposits(txHash: string) {
    try {
      const receipt = await this.rpcManager.getTransactionReceipt(txHash);
      const depositEvents = receipt.logs.filter((log: { address: string; }) => 
        log.address.toLowerCase() === process.env.BEACON_DEPOSIT_CONTRACT?.toLowerCase()
      );

      if (depositEvents.length > 1) {
        logger.info(`Multiple deposits detected in transaction ${txHash}`, { count: depositEvents.length });
        // Handle multiple deposits if needed
      }
    } catch (error) {
      logger.error('Error checking for multiple deposits', { error, txHash });
    }
  }
  
}
export default class ErrorHandler {
    // ... your class methods
}