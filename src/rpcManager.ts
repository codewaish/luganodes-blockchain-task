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