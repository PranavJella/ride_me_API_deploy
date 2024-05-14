import { Request, Response, NextFunction } from "express";
import { User, UserInterface } from "../../model/user_model";
import { HttpStatusCode, request } from "axios";
import otp_service from "../../service/mobile_otp_service";
import email_otp_service from "../../service/email_otp_service";
import notification_service from "../../service/notification_service";
import { Driver, DriverInterface } from "../../model/driver_model";
import { Trip, TripInterface } from "../../model/trip_model";


class UserController {
  update_user_details = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      const { user_name, email }: { user_name: string; email: string } =
        request.body;

      const updatedUser: UserInterface | any = await User.findByIdAndUpdate(user._id, {
        user_name: user_name,
        email: email,
      });

      if (!updatedUser) {
        return response.status(HttpStatusCode.NotFound).json({
          success: false,
          message: "Failed to update user details.",
        });
      }

      response.status(HttpStatusCode.Created).json({
        success: true,
        message: "User details updated successfully.",
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  };

  send_email_otp = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      const emailOtp = otp_service.generateOtp();
      await email_otp_service.sendOtp(user.email, emailOtp);
      request.session.otp = emailOtp;
      response
        .status(HttpStatusCode.Ok)
        .json({ success: true, message: "OTP sent to your mail" });
    } catch (err) {
      next(err);
    }
  };

  verify_email = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      const { email_otp }: { email_otp: string } = request.body;
      const stored_otp = request.session.otp;

      if (!stored_otp) {
        response
          .status(HttpStatusCode.Unauthorized)
          .json({ success: false, message: "Invalid OTP" });
        return;
      }
      if (email_otp === stored_otp) {
        await User.findByIdAndUpdate(user._id, {
          email_otp_verified_at: new Date(),
        });
        delete request.session.otp;
        response
          .status(HttpStatusCode.Created)
          .json({ success: true, message: "Email verified successfully" });
      } else {
        delete request.session.otp;
        response
          .status(HttpStatusCode.Created)
          .json({ success: false, message: "Email verification failed" });
      }
    } catch (err) {
      next(err);
    }
  };

  get_user_details = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      response.status(HttpStatusCode.Ok).json({ success: true, user: user });
    } catch (err) {
      next(err);
    }
  };

  update_fcm_token = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      const { fcm_token }: { fcm_token: string } = request.body;
      const update_token: UserInterface | any = await User.findByIdAndUpdate(user._id, { fcm_token: fcm_token });
      if (!update_token) {
        return response.status(HttpStatusCode.NotFound).json({
          success: false,
          message: "Failed to update user fcm token.",
        });
      }
      response.status(HttpStatusCode.Created).json({
        success: true,
        message: "User fcm token updated successfully.",
      });
    } catch (err) {
      next(err);
    }
  }


  book_ride = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      console.log("start");

      const user: UserInterface = (request as any).user;
      const { start_location, end_location, distance, fare }: { start_location: number[]; end_location: number[]; distance: string; fare: string } = request.body;
      const [start_loc_lat, start_loc_long] = start_location;
      const [end_loc_lat, end_loc_long] = end_location;
      const radius: number = 1000;
      const nearbyDrivers: DriverInterface[] = await Driver.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [start_loc_lat, start_loc_long]
            },
            $maxDistance: radius
          }
        }
      });

      if (nearbyDrivers.length === 0) {
        return response.status(HttpStatusCode.NotFound).json({ success: false, error: "No drivers available nearby" });
      }

      const received_tokens = nearbyDrivers.map(driver => driver.fcm_token).filter(token => token !== null) as string[];
 
      const locationResult: string = await notification_service.getLocationDetails(start_loc_lat, start_loc_long);
      const endLocationResult: string = await notification_service.getLocationDetails(end_loc_lat, end_loc_long);

      const message = {
        notification: {
          title: `New Ride Request from ${user.user_name}`,
          body: `start location: ${locationResult} \n end location: ${endLocationResult} \n distance: ${distance} \n fare: ${fare}`
        },
        data: {
          user_id: `${user._id}`,
          user_name: user.user_name,
          user_email: user.email,
        },
      };

      await notification_service.sendNotification(message, received_tokens);
      console.log("end");
      return response.status(HttpStatusCode.Ok).json({ success: true });
    } catch (err) {
      next(err);
    }
  };


  update_ride_details = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserInterface = (request as any).user;
      const { trip_id, start_location, end_location, distance, fare, price }: { trip_id: string, start_location: number[]; end_location: number[]; distance: string; fare: string; price: number } = request.body;
      
      const otp: number = Math.floor(1000 + Math.random() * 9000);

      const updateObject = {
        start_location: {
          type: 'Point',
          coordinates: start_location
        },
        end_location: {
          type: 'Point',
          coordinates: end_location
        },
        distance: parseFloat(distance),
        fare: parseFloat(fare),
        price: price,
        otp: otp
      };

      const updatedTrip: TripInterface | any = await Trip.findOneAndUpdate(
        { _id: trip_id, user: user._id }, 
        updateObject,
        { new: true }
      );

      if (!updatedTrip) {
        return response.status(HttpStatusCode.NotFound).json({
          success: false,
          message: "Trip not found for the user",
        });
      }

      response.status(HttpStatusCode.Ok).json({
        success: true,
        message: "Trip updated successfully",
        ride_otp: updatedTrip.otp,
      });

    } catch (err) {
      next(err);
    }
  }



}


export default new UserController();
