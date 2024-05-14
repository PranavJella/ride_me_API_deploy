import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "./user_model";
import { DriverInterface } from "./driver_model";

export enum Status {
    DriverConfirmed = "Driver Confirmed",
    Ongoing = "Ongoing",
    Complete = "Complete",
    Cancel = "Cancel"
}

export interface TripInterface extends Document {
    user: mongoose.Types.ObjectId | UserInterface;
    driver: mongoose.Types.ObjectId | DriverInterface;
    start_location: {
        type: string;
        coordinates: number[];
    };
    end_location: {
        type: string;
        coordinates: number[];
    };
    price: number;
    distance: number;
    booking_time: Date;
    start_time: Date;
    end_time: Date;
    status: Status;
    ETA: Date;
    otp: string;
    comments: string;
    rating: number;
}

const TripSchema: Schema<TripInterface> = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        driver: {
            type: mongoose.Types.ObjectId,
            ref: 'Driver',
            required: true
        },
        start_location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        },
        end_location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        },
        price: {
            type: Number,
        },
        distance: {
            type: Number,
        },
        booking_time: {
            type: Date,
            required: true
        },
        start_time: {
            type: Date,
        },
        end_time: {
            type: Date,
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.DriverConfirmed,
        },
        ETA: {
            type: Date,
        },
        otp: {
            type: String
        },
        comments: {
            type: String
        },
        rating: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

TripSchema.index({ start_location: '2dsphere', end_location: '2dsphere' });

export const Trip = mongoose.model<TripInterface>("Trip", TripSchema);
