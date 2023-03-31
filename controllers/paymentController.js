import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { instance } from "../server.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";


// buy subscription - only logged in user
export const buySubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if(user.role==="admin") return next(new ErrorHandler("Admin cannot buy subscription",400));

    const plan_id=process.env.PLAN_ID;

    const subscription=await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
    });

    user.subscription.id=subscription.id;
    user.subscription.status=subscription.status;

    await user.save();

    res.status(201).json({
        success: true,
        message: "Subscription added successfully",
        subscriptionId: subscription.id,
    });

});


// payment verification - only logged in user

export const paymentVerification = catchAsyncError(async (req, res, next) => {
    const {razorpay_signature,razorpay_payment_id,razorpay_subscription_id}=req.body;
    const user = await User.findById(req.user._id);

    const subscription_id=user.subscription.id;

    const generated_signature=crypto.createHmac("sha256",process.env.RAZORPAY_SECRET_KEY)
    .update(razorpay_payment_id+"|"+subscription_id,"utf-8").digest("hex");

    const isAuthentic=generated_signature===razorpay_signature;

    if(!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

    // database comes here
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id,
    });

    user.subscription.status="active";
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`);
});


// razorpay key 
export const getRazorpayKey = catchAsyncError(async (req, res, next) => {
    
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY,
    });

});

// cancel subscription - only logged in user

export const cancelSubscription = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const subscriptionId=user.subscription.id;

    await instance.subscriptions.cancel(subscriptionId);

    const payment=await Payment.findOne({razorpay_subscription_id:subscriptionId});

    const gap=Date.now()-payment.createdAt;
    const refundTime=process.env.REFUND_DAYS*24*60*60*1000;

    if(refundTime>gap){
        await instance.payments.refund(payment.razorpay_payment_id);
        refund=true
    }
    await payment.remove();

    user.subscription.id=undefined;
    user.subscription.status=undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: refund?"Subscription cancelled successfully and refund initiated within 7 days"
        :"Subscription cancelled successfully no refund initiated as time limit exceeded",
    });
});