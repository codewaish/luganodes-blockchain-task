import { DepositTracker } from './deposittracker';

async function main() {
  const tracker = new DepositTracker();
  await tracker.startTracking();
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { createLogger, format, transports } from 'winston';

config();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'rpc.log' })
  ]
});

export class RPCManager {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.AlchemyProvider('mainnet', process.env.ALCHEMY_API_KEY);
  }

  public async getLatestBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      logger.info(`Latest block number: ${blockNumber}`);
      return blockNumber;
    } catch (error) {
      logger.error('Error fetching latest block number', { error });
      throw error;
    }
  }

  public async getTransactionReceipt(txHash: string): Promise<ethers.providers.TransactionReceipt> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      logger.info(`Transaction receipt fetched`, { txHash });
      return receipt;
    } catch (error) {
      logger.error('Error fetching transaction receipt', { error, txHash });
      throw error;
    }
  }

  public getContract(address: string, abi: ethers.ContractInterface): ethers.Contract {
    return new ethers.Contract(address, abi, this.provider);
  }
}
// src/index.ts

import { DepositTracker } from './depositTracker';
import { ErrorHandler } from './errorHandler';

async function main() {
  try {
    const tracker = new DepositTracker();
    await tracker.startTracking();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      ErrorHandler.logInfo('Received SIGINT. Graceful shutdown start');
      await tracker.stopTracking();
      process.exit(0);
    });

  } catch (error) {
    ErrorHandler.handleError(error as Error, 'main');
    process.exit(1);
  }
}

main();
