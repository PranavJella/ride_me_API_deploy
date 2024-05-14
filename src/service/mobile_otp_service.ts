import axios, { AxiosResponse } from "axios";
import randomstring from "randomstring";
import { Request } from "express";
import { AES, enc } from "crypto-js";

class OtpService {
  public async sendOtp(otp: string, phoneNumber: string): Promise<any> {
    try {
      if (phoneNumber.length !== 10) {
        throw new Error("Phone number must be 10 digits long");
      }
      const route: string = "otp";

      const requestBody: any = {
        route,
        variables_values: otp.toString(),
        numbers: phoneNumber.toString(),
      };

      const headers: any = {
        Authorization: process.env.OTP_API_KEY,
        "Content-Type": "application/json",
      };

      const response: AxiosResponse<any> = await axios.post(
        process.env.FAST_2_SMS ?? "",
        requestBody,
        { headers }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Something went wrong! please try again sometime`);
    }
  }

  public generateOtp(): string {
    return randomstring.generate({
      length: 6,
      charset: "numeric",
    });
  }

  public encryptAndStoreOtp(otp: string, request: Request): void {
    const encryptedOtp = AES.encrypt(
      otp,
      process.env.ENCRYPT_DECRYPT_KEY ?? ""
    ).toString(); // Encrypt OTP
    request.session.otp = encryptedOtp;
  }

  public decryptStoredOtp(request: Request): string | null {
    const storedOtp = request.session.otp;
    if (storedOtp) {
      const decryptedOtp = AES.decrypt(
        storedOtp,
        process.env.ENCRYPT_DECRYPT_KEY ?? ""
      ).toString(enc.Utf8); // Decrypt OTP
      return decryptedOtp;
    }
    return null;
  }
}

export default new OtpService();
