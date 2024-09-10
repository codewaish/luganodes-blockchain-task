// src/database.ts

import "reflect-metadata";
import { createConnection, Connection, Repository, EntitySchema } from "typeorm";
import { Deposit } from "./types";
import ErrorHandler from "./errorHandler";

export class Database {
  private connection: Connection | null = null;
  private depositRepository: Repository<Deposit> | null = null;

  private readonly DepositSchema = new EntitySchema<Deposit>({
    name: "Deposit",
    target: this.getDeposit,
    columns: {
      hash: {
        primary: true,
        type: "varchar",
      },
      blockNumber: {
        type: "int",
      },
      blockTimestamp: {
        type: "int",
      },
      fee: {
        type: "varchar",
      },
      pubkey: {
        type: "varchar",
      },
    },
  });

  public async connect(): Promise<void> {
    try {
      this.connection = await createConnection({
        type: "sqlite",
        database: "deposits.sqlite",
        entities: [this.DepositSchema],
        synchronize: true,
        logging: false,
      });
      this.depositRepository = this.connection.getRepository(Deposit);
      ErrorHandler.logInfo("Database connected successfully");
    } catch (error) {
      ErrorHandler.handleError(error as Error, "Database.connect");
      throw error;
    }
  }

  public async saveDeposit(deposit: Deposit): Promise<void> {
    try {
      if (!this.depositRepository) {
        throw new Error("Database not connected");
      }
      await this.depositRepository.save(deposit);
      ErrorHandler.logInfo(`Deposit saved: ${deposit.hash}`);
    } catch (error) {
      ErrorHandler.handleError(error as Error, "Database.saveDeposit");
      throw error;
    }
  }

  public async getDeposit(hash: string): Promise<Deposit | null> {
    try {
      if (!this.depositRepository) {
        throw new Error("Database not connected");
      }
      return await this.depositRepository.findOne(hash);
    } catch (error) {
      ErrorHandler.handleError(error as Error, "Database.getDeposit");
      throw error;
    }
  }

  public async getAllDeposits(): Promise<Deposit[]> {
    try {
      if (!this.depositRepository) {
        throw new Error("Database not connected");
      }
      return await this.depositRepository.find();
    } catch (error) {
      ErrorHandler.handleError(error as Error, "Database.getAllDeposits");
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
        ErrorHandler.logInfo("Database connection closed");
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, "Database.close");
      throw error;
    }
  }
}