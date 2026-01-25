import mongoose, { Document, Schema } from "mongoose";

export interface IIndexerState extends Document {
  contractAddress: string;
  lastProcessedLt: string;
  lastProcessedHash: string;
  lastProcessedTime: Date;
  isRunning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const indexerStateSchema = new Schema<IIndexerState>(
  {
    contractAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastProcessedLt: {
      type: String,
      required: true,
      default: "0",
    },
    lastProcessedHash: {
      type: String,
      default: "",
    },
    lastProcessedTime: {
      type: Date,
      default: null,
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const IndexerState = mongoose.model<IIndexerState>(
  "IndexerState",
  indexerStateSchema,
);
