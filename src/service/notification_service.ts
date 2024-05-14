import { Request, Response, NextFunction } from "express";
import axios, { HttpStatusCode } from "axios";
import admin from 'firebase-admin';

// class NotificationService {
//     public async sendNotification(message: any, response: Response, token: string): Promise<any> {
//         try {
//             const sendResponse = await admin.messaging().send(message);
//             console.log("Successfully sent message", sendResponse);
//             response.status(HttpStatusCode.Ok).json({ success: true, token: token });
//         } catch (error) {
//             console.log("Error sending message", error);
//             response.status(HttpStatusCode.NotFound).json({ success: false, error });
//         }
//     }
// }

class NotificationService {
    public async sendNotification(message: any, tokens: string[]): Promise<any> {
        try {
            const sendResponses = await Promise.all(tokens.map(async (token: string) => {
                const individualMessage = { ...message, token };
                return await admin.messaging().send(individualMessage);
            }));
            return { success: true };
        } catch (error) {
            console.log("Error sending messages", error);
            return { success: false, error };
        }
    }


    public async getLocationDetails(lat: number, long: number) {
        const apiKey = process.env.GOOGLE_API_KEY;
        const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`);
        return geoResponse.data.results[0].formatted_address;
    }
}



export default new NotificationService();