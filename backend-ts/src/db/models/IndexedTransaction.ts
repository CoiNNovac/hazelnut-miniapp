import mongoose, { Document, Schema } from "mongoose";

export interface IIndexedTransaction extends Document {
  hash: string;
  lt: string;
  utime: number;
  contractAddress: string;
  inMsg?: {
    source?: string;
    destination: string;
    value: string;
    body?: string;
  };
  outMsgs: Array<{
    source: string;
    destination?: string;
    value: string;
    body?: string;
  }>;
  eventType?: string;
  parsedData?: any;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const indexedTransactionSchema = new Schema<IIndexedTransaction>(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lt: {
      type: String,
      required: true,
      index: true,
    },
    utime: {
      type: Number,
      required: true,
      index: true,
    },
    contractAddress: {
      type: String,
      required: true,
      index: true,
    },
    inMsg: {
      source: String,
      destination: String,
      value: String,
      body: String,
    },
    outMsgs: [
      {
        source: String,
        destination: String,
        value: String,
        body: String,
      },
    ],
    eventType: {
      type: String,
      index: true,
    },
    parsedData: Schema.Types.Mixed,
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
indexedTransactionSchema.index({ contractAddress: 1, lt: -1 });
indexedTransactionSchema.index({ contractAddress: 1, processed: 1 });

export const IndexedTransaction = mongoose.model<IIndexedTransaction>(
  "IndexedTransaction",
  indexedTransactionSchema,
);
