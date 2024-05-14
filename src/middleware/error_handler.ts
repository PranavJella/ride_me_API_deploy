// import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
// import { MongoError } from 'mongodb';

// export const errorHandler = (err: any, request: Request, response: Response, next: NextFunction) => {
//     if (!err.statusCode) err.statusCode = HttpStatusCode.InternalServerError;
//     response
//         .status(err.statusCode)
//         .json({ success: false, message: err.message });
// };

// export const errorMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {
//     if (error instanceof MongoError) {
//         console.log(error);
//         switch (error.code) {
//             case 11000: // Duplicate key error
//                 if (error.message.includes('user_name')) {
//                     return response.status(HttpStatusCode.BadRequest).json({ success: false, message: 'Username already taken' });
//                 } else if (error.message.includes('email')) {
//                     return response.status(HttpStatusCode.BadRequest).json({ success: false, message: 'Email already exists' });
//                 }
//                 break;
//             default:
//                 return response.status(HttpStatusCode.InternalServerError).json({ success: false, message: 'MongoDB error' });
//         }
//     } else {
//         errorHandler(error, request, response, next);
//     }
// };



import { Request, Response, NextFunction } from 'express';
// import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';

export const errorHandler = (err: any, request: Request, response: Response, next: NextFunction) => {
    if (!err.statusCode) err.statusCode = HttpStatusCode.InternalServerError;
    response
        .status(err.statusCode)
        .json({ success: false, message: err.message });
};

export const errorMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof MongoError) {
        // console.log(error);
        switch (error.code) {
            case 11000: // Duplicate key error
                // Updated accessing properties
                const field = Object.keys((error as any).keyPattern)[0]; 
                if ((error as any).keyValue[field] === null) {
                    // return response.status(HttpStatusCode.BadRequest).json({ success: false, message: `${field} cannot be null` });
                    // next(error);
                    break;
                }
                if (field === 'user_name') {
                    return response.status(HttpStatusCode.BadRequest).json({ success: false, message: 'Username already taken' });
                } else if (field === 'email') {
                    return response.status(HttpStatusCode.BadRequest).json({ success: false, message: 'Email already exists' });
                }
                break;
            default:
                return response.status(HttpStatusCode.InternalServerError).json({ success: false, message: error });
        }
    } else {
        errorHandler(error, request, response, next);
    }
};


