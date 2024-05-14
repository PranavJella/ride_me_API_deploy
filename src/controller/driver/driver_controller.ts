import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import notification_service from "../../service/notification_service";
import { Driver, DriverInterface } from "../../model/driver_model";
import { User, UserInterface } from "../../model/user_model";
import { Status, Trip, TripInterface } from "../../model/trip_model";


class RiderController {

  update_user_details = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const driver: DriverInterface = (request as any).driver;
      const { user_name, email, first_name, last_name }: { user_name: string; email: string; first_name: string, last_name: string } =
        request.body;

        const updatedUser: DriverInterface | any = await Driver.findByIdAndUpdate(driver._id, {
          user_name: user_name,
          email: email,
          first_name: first_name,
          last_name: last_name
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

    } catch (e) {
      next(e);
    }
  }


  accept_ride = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const driver: DriverInterface = (request as any).driver;
      const { user_id }: { user_id: string } = request.body;

      const user: UserInterface | any = await User.findById(user_id);

      if (!user) {
        return response.status(HttpStatusCode.NotFound).json({
          success: false,
          message: "User not found",
        });
      }

      // use start and end location to find 
      const existingTrip: TripInterface | any = await Trip.findOne({ user: user_id, status: Status.DriverConfirmed });

      if (existingTrip) {
        return response.status(HttpStatusCode.NotFound).json({ success: false, message: "Ride not found" });
      }

      // status kepp it as enum

      const newTrip: TripInterface | any = new Trip({ user: user_id, driver: driver._id, status: Status.DriverConfirmed, booking_time: Date.now() });
      await newTrip.save();

      const received_token = [user.fcm_token].filter(token => token !== null) as string[];

      const message = {
        notification: {
          title: "Ride Confirmation",
          body: `Your ride has been Confirmed by ${driver.user_name}`
        },
        data: {
          driver_id: `${driver._id}`,
          driver_name: `${driver.user_name}`,
          driver_email: `${driver.email}`,
        }
      };

      await notification_service.sendNotification(message, received_token);
      return response.status(HttpStatusCode.Ok).json({ success: true, trip: newTrip._id });

    } catch (err: any) {
      next(err);
    }
  };


  update_fcm_token = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const driver: DriverInterface = (request as any).driver;
      const { fcm_token }: { fcm_token: string } = request.body;
      const update_token: DriverInterface | any = await Driver.findByIdAndUpdate(driver._id, { fcm_token: fcm_token });
      if (!update_token) {
        return response.status(HttpStatusCode.NotFound).json({
          success: false,
          message: "Failed to update driver fcm token.",
        });
      }
      response.status(HttpStatusCode.Created).json({
        success: true,
        message: "Driver fcm token updated successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  update_geo_loc = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const driver: DriverInterface = (request as any).driver;
      const { coordinates }: { coordinates: number[] } = request.body;

      const update_geo_loc: DriverInterface | any = await Driver.findByIdAndUpdate(driver._id, {
        location: {
          type: 'Point',
          coordinates
        }
      })
      const save_geo_loc = await update_geo_loc?.save()
      response.status(201).json(save_geo_loc);
    } catch (err) {
      next(err);
    }
  }


}

export default new RiderController();