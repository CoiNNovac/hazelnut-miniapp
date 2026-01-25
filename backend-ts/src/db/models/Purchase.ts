import { Schema, model, Document } from 'mongoose';
import { TransactionStatus } from '../../types';

export interface IPurchase extends Document {
  _id: string;
  userAddress: string;
  campaignId: string;
  mkoinPaid: string;
  tokensReceived: string;
  txHash?: string;
  status: TransactionStatus;
  purchasedAt: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    _id: { type: String, required: true },
    userAddress: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, ref: 'Campaign', index: true },
    mkoinPaid: { type: String, required: true },
    tokensReceived: { type: String, required: true },
    txHash: { type: String, unique: true, sparse: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
      index: true,
    },
    purchasedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
  },
  {
    timestamps: true,
    _id: false,
  }
);

PurchaseSchema.index({ userAddress: 1, campaignId: 1 });
PurchaseSchema.index({ campaignId: 1, status: 1 });
PurchaseSchema.index({ purchasedAt: -1 });

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema);
