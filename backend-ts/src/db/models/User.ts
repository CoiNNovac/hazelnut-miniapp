import { Schema, model, Document } from "mongoose";
import { UserRole } from "../../types";

export interface IUser extends Omit<Document, "_id"> {
  _id: string;
  username?: string;
  passwordHash?: string;
  address: string;
  role: UserRole;
  name?: string;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    address: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "farmer"],
      default: "farmer",
    },
    name: { type: String },
    isDisabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    _id: false,
  },
);

UserSchema.index({ role: 1 });
UserSchema.index({ isDisabled: 1 });

export const User = model<IUser>("User", UserSchema);
