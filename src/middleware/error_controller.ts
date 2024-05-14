import { Request, Response, NextFunction } from "express";

class GlobalErrorHandler {
    public static handle() {
        return (error: any, req: Request, res: Response, next: NextFunction) => {
            const statusCode = error.statusCode || 500;
            const status = error.status || 'error';
            res.status(statusCode).json({
                status,
                message: error.message
            });
        };
    }
}

export default GlobalErrorHandler;