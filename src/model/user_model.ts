import mongoose, { Schema, Document } from 'mongoose';
import validator from "validator";
import { isNotEmpty } from "../custom_validators/custom_validators";

// Define the UserDoc interface
export interface UserInterface extends Document {
  user_name: string;
  phone_number: string;
  email: string;
  mobile_otp_verified_at: Date | null;
  email_otp_verified_at: Date | null;
  invalidate_token_before: Date | null;
  fcm_token: String | null;
  // location: {
  //   type: string;
  //   coordinates: number[];
  // };
}

// Define the UserSchema
const UserSchema: Schema<UserInterface> = new mongoose.Schema(
  {
    user_name: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      required: false, // Allow null values
      validate: {
        validator: isNotEmpty,
        message: "Username cannot be empty",
      },
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return /\d{10}/.test(value);
        },
        message: "Invalid mobile number",
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      required: false, // Allow null values
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
        message: "Invalid email address",
      },
    },
    mobile_otp_verified_at: {
      type: Date,
      default: null,
    },
    email_otp_verified_at: {
      type: Date,
      default: null,
    },
    invalidate_token_before: {
      type: Date,
      default: null,
    },
    fcm_token: {
      type: String,
      default: null,
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ['Point'],
    //     required: true
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true
    //   }
    // }
  },
  {
    timestamps: true,
  }
);

// Define the User model
export const User = mongoose.model<UserInterface>("User", UserSchema);


