import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../model/user_model';
import { HttpStatusCode } from 'axios';
import { Driver } from "../model/driver_model";

interface CustomJwtPayload extends jwt.JwtPayload {
  phone_number: string;
}

const authenticate_token = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return response
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized request" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_TOKEN_KEY ?? ""
    ) as CustomJwtPayload;

    if (!decoded) {
      return response
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "Unauthorized request" });
    }

    const user:any = await User.findOne({ phone_number: decoded.phone_number });
    const driver:any = await Driver.findOne({ phone_number: decoded.phone_number });


    if (!user && !driver) {
      return response
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found!" });
    }

    if (user) {
      if (user.invalidate_token_before) {
        const date = new Date();
        if (date >= user.invalidate_token_before) {
          return response
            .status(HttpStatusCode.Unauthorized)
            .json({ message: "Unauthorized request" });
        }
      }

      (request as any).user = user;
    } else if (driver) {
      if (driver.invalidate_token_before) {
        const date = new Date();
        if (date >= driver.invalidate_token_before) {
          return response
            .status(HttpStatusCode.Unauthorized)
            .json({ message: "Unauthorized request" });
        }
      }
      (request as any).driver = driver;
    }

    next();
  } catch (error) {
    return response
      .status(HttpStatusCode.Unauthorized)
      .json({ message: "Unauthorized request" });
  }
};


export default authenticate_token;