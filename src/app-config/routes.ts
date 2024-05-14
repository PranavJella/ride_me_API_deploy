import express from "express";
import auth_controller from "../controller/user/auth_controller";
import driver_auth_controller from "../controller/driver/auth_controller";
import user_controller from "../controller/user/user_controller";
import driver_controller from "../controller/driver/driver_controller";
import authenticate_token from "../middleware/verify_token";

const router = express.Router();

// Authentication

router.post("/user/auth/login", auth_controller.login);
router.post("/user/auth/verify_otp", auth_controller.verify_otp);

router.post("/driver/auth/login", driver_auth_controller.login);
router.post("/driver/auth/verify_otp", driver_auth_controller.verify_otp);

// User management

router.use(authenticate_token);

// User
router.post("/user/update_user_details", user_controller.update_user_details);
router.post("/user/update_fcm_token", user_controller.update_fcm_token);
router.post("/user/send_email_otp", user_controller.send_email_otp);
router.post("/user/verify_email", user_controller.verify_email);
router.get("/user/get_user_details", user_controller.get_user_details);
router.post("/user/auth/logout", auth_controller.logout);

// Driver
router.post("/driver/update_user_details", driver_controller.update_user_details);
router.post("/driver/update_fcm_token", driver_controller.update_fcm_token);
router.post("/driver/auth/logout", driver_auth_controller.logout);
router.post("/driver/update_geo_loc", driver_controller.update_geo_loc);

// Ride Booking
router.post("/user/book_ride", user_controller.book_ride);
router.post("/driver/accept_ride", driver_controller.accept_ride);
router.post("/user/update_ride_details", user_controller.update_ride_details);



export default router;

