import { Account } from "../../domain/account.entity";
import {
  AccountCreationData,
  AccountRepository,
  AccountUpdateData,
} from "../../domain/account.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../domain/defaultAccount";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { DuplicateError } from "../../../../infrastructure/api/errors/duplicateError";
import AccountModel from "./Account";

export class MongoAccountRepository implements AccountRepository {
  existsForUser = async (userId: string, id: string): Promise<boolean> => {
    const exists = await AccountModel.exists({ _id: id, userId });

    return exists !== null;
  };

  getByIdForUser = async (userId: string, id: string): Promise<Account | null> => {
    const doc = await AccountModel.findOne({ _id: id, userId }).lean();

    return doc ? this.toEntity(doc) : null;
  };

  getByNameForUser = async (userId: string, name: string): Promise<Account | null> => {
    const doc = await AccountModel.findOne({ userId, name }).lean();

    return doc ? this.toEntity(doc) : null;
  };

  getAllForUser = async (userId: string): Promise<Account[]> => {
    const docs = await AccountModel.find({ userId }).lean();

    return docs.map((doc) => this.toEntity(doc));
  };

  create = async (userId: string, data: AccountCreationData): Promise<Account> => {
    try {
      const doc = await AccountModel.create({ ...data, userId });
      return this.toEntity(doc);
    } catch (error) {
      const e = error as { name?: string; code?: number } & Error;
      if (e.name === "MongoServerError" && e.code === 11000) {
        throw new DuplicateError(`La cuenta "${data.name}" ya existe`, e);
      }

      throw new DatabaseError("Error creando cuenta", e);
    }
  };

  update = async (
    userId: string,
    id: string,
    data: AccountUpdateData,
  ): Promise<Account | null> => {
    try {
      const doc = await AccountModel.findOneAndUpdate(
        { _id: id, userId },
        data,
        { returnDocument: "after", lean: true },
      );

      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      const e = error as { name?: string; code?: number } & Error;
      if (e.name === "MongoServerError" && e.code === 11000) {
        throw new DuplicateError(`La cuenta "${data.name}" ya existe`, e);
      }

      throw new DatabaseError("Error al guardar cuenta", e);
    }
  };

  delete = async (userId: string, id: string): Promise<void> => {
    const { deletedCount } = await AccountModel.deleteOne({ _id: id, userId });

    if (deletedCount === 0) {
      throw new DatabaseError(`Account ${id} not deleted`);
    }
  };

  getDefaultForUser = async (userId: string): Promise<Account | null> => {
    return this.getByNameForUser(userId, DEFAULT_ACCOUNT_NAME);
  };

  private toEntity(doc: any): Account {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      name: doc.name,
      type: doc.type,
      openingBalance: doc.openingBalance,
      cutoffDay: doc.cutoffDay,
      dueDay: doc.dueDay,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
