import { Request, Response, NextFunction } from "express";
import otp_service from "../../service/mobile_otp_service";
import { HttpStatusCode } from "axios";
import token_management from "../../app-config/jwt-token-config";
import { Driver, DriverInterface } from "../../model/driver_model";

// Extend SessionData to include 'otp' property
declare module "express-session" {
  interface SessionData {
    otp: string;
  }
}

class AuthController {
  login = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { phone_number }: { phone_number: string } = request.body;
      const otp: string = otp_service.generateOtp();
      console.log(otp);
      await otp_service.sendOtp(otp, phone_number);
      otp_service.encryptAndStoreOtp(otp, request);
      response
        .status(HttpStatusCode.Ok)
        .json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
      next(err);
    }
  };

  verify_otp = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const {
        phone_number,
        mobile_otp,
      }: { phone_number: string; mobile_otp: string } = request.body;
      const stored_otp = otp_service.decryptStoredOtp(request);

      if (!stored_otp) {
        response.status(HttpStatusCode.Unauthorized).json({
          success: false,
          message: "Invalid OTP",
        });
        return;
      }

      const mobileOtpVerifiedAt: Date = new Date();

      if (mobile_otp === stored_otp) {
        let driver:any = await Driver.findOne({ phone_number });
        if (!driver) {
          driver = new Driver({ phone_number });
          await driver.save();
        }
        // await User.findByIdAndUpdate(user._id, {
        //   mobile_otp_verified_at: mobileOtpVerifiedAt,
        // });
        // const token = jwt.sign(
        //   { phone_number: user.phone_number },
        //   process.env.JWT_TOKEN_KEY ?? "",
        //   { expiresIn: "1h" }
        // );

        const { token, token_invalidate_before } =
          token_management.create_new_token({
            phone_number: driver.phone_number,
          });

        await Driver.findByIdAndUpdate(driver._id, {
          mobile_otp_verified_at: mobileOtpVerifiedAt,
          invalidate_token_before: token_invalidate_before,
        });
        delete request.session.otp;
        response
          .status(HttpStatusCode.Ok)
          .json({ success: true, user: driver, token: token });
      } else {
        response
          .status(HttpStatusCode.Unauthorized)
          .json({ success: false, message: "Invalid OTP" });
      }
    } catch (err) {
      next(err);
    }
  };


  logout = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const driver: DriverInterface = (request as any).driver;
      await Driver.findByIdAndUpdate(driver._id, {
        invalidate_token_before: null,
      });
      response.status(HttpStatusCode.NoContent).send();
    } catch (err) {
      next(err);
    }
};

}

export default new AuthController();
