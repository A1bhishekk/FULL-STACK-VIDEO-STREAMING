import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";


// Check if user is authenticated or not

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    
    if (!token) {
        return next(new ErrorHandler("Login first to access this resource", 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
});


// Admin Routes middleware

export const authorizeAdmin=(req,res,next)=>{
    if(req.user.role!=="admin"){
        return next(new ErrorHandler("Only admin can access this route",403));
    }
    next();
}