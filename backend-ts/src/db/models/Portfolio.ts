import { Schema, model, Document } from 'mongoose';

export interface IPortfolio extends Document {
  userAddress: string;
  tokenAddress: string;
  balance: string;
  lastUpdatedLt: number;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userAddress: { type: String, required: true, index: true },
    tokenAddress: { type: String, required: true },
    balance: { type: String, default: '0' },
    lastUpdatedLt: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

PortfolioSchema.index({ userAddress: 1, tokenAddress: 1 }, { unique: true });
PortfolioSchema.index({ tokenAddress: 1 });

export const Portfolio = model<IPortfolio>('Portfolio', PortfolioSchema);
