import { Schema, model, Document } from "mongoose";
import { TransactionStatus } from "../../types";

export interface IMkoinMint extends Omit<Document, "_id"> {
  _id: string;
  recipientAddress: string;
  amount: string;
  txHash?: string;
  mintedBy?: string;
  status: TransactionStatus;
  mintedAt: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MkoinMintSchema = new Schema<IMkoinMint>(
  {
    _id: { type: String, required: true },
    recipientAddress: { type: String, required: true, index: true },
    amount: { type: String, required: true },
    txHash: { type: String, unique: true, sparse: true, index: true },
    mintedBy: { type: String, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
      index: true,
    },
    mintedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
  },
  {
    timestamps: true,
    _id: false,
  },
);

MkoinMintSchema.index({ mintedAt: -1 });
MkoinMintSchema.index({ recipientAddress: 1, status: 1 });

export const MkoinMint = model<IMkoinMint>("MkoinMint", MkoinMintSchema);
