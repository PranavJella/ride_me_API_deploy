import mongoose, { Schema, Document } from "mongoose";
import { isNotEmpty } from "../custom_validators/custom_validators";
import validator from "validator";

export interface DriverInterface extends Document {
  user_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  mobile_otp_verified_at: Date | null;
  email_otp_verified_at: Date | null;
  invalidate_token_before: Date | null;
  fcm_token: String | null;
  location: {
    type: string;
    coordinates: number[];
  };
}

const DriverSchema: Schema<DriverInterface> = new mongoose.Schema(
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
    first_name: {
      type: String,
      validate: {
        validator: isNotEmpty,
        message: "First name cannot be empty",
      },
    },
    last_name: {
      type: String,
      validate: {
        validator: isNotEmpty,
        message: "Last name cannot be empty",
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      }
    }
  },
  {
    timestamps: true,
  }
);

DriverSchema.index({ location: '2dsphere' });

// Define the User model
export const Driver = mongoose.model<DriverInterface>("Driver", DriverSchema);
