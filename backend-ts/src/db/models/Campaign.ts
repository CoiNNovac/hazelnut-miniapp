import { Schema, model, Document } from 'mongoose';
import { CampaignStatus } from '../../types';

export interface ICampaign extends Document {
  _id: string;
  farmerId: string;
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  logoUrl?: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
  suggestedPrice: string;
  status: CampaignStatus;
  tokenAddress?: string;
  mintedAt?: Date;
  mintAmount?: string;
  mintTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    _id: { type: String, required: true },
    farmerId: { type: String, required: true, ref: 'User', index: true },
    name: { type: String, required: true },
    description: { type: String },
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    tokenSupply: { type: String, required: true },
    logoUrl: { type: String },
    imageUrl: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    suggestedPrice: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'running', 'paused', 'finished', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    tokenAddress: { type: String, sparse: true, index: true },
    mintedAt: { type: Date },
    mintAmount: { type: String },
    mintTxHash: { type: String },
  },
  {
    timestamps: true,
    _id: false,
  }
);

CampaignSchema.index({ status: 1, startTime: 1 });
CampaignSchema.index({ farmerId: 1, status: 1 });

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
