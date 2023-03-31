
import express from 'express';
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from '../controllers/paymentController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();


// Buy Subscription - only logged in user

router.route("/subscribe").get(isAuthenticated, buySubscription);

//payment verification

router.route("/paymentverification").post(isAuthenticated,paymentVerification);


// get razorpay key 

router.route("/razorpaykey").get(getRazorpayKey)

//cancel subscription

router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription)

export default router;
