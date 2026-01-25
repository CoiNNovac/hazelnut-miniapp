import { Schema, model, Document } from 'mongoose';

export interface IToken extends Document {
  address: string;
  symbol?: string;
  name?: string;
  metadataUrl?: string;
  isAgriToken: boolean;
  totalSupply?: string;
  campaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    address: { type: String, required: true, unique: true },
    symbol: { type: String },
    name: { type: String },
    metadataUrl: { type: String },
    isAgriToken: { type: Boolean, default: false },
    totalSupply: { type: String },
    campaignId: { type: String, ref: 'Campaign', sparse: true },
  },
  {
    timestamps: true,
  }
);

TokenSchema.index({ symbol: 1 });
TokenSchema.index({ isAgriToken: 1 });

export const Token = model<IToken>('Token', TokenSchema);
