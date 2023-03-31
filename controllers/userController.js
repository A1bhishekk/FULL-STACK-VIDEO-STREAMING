import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js"
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/SendToken.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";


// Register a user => /api/v1/register
export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    // const file=req.file;
    if(!name || !email || !password) return next(new ErrorHandler("Please enter all fields",400));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User already exists",409));

    //upload image to cloudinary

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "avatars/0",
            url: "https://res.cloudinary.com/dfqz3qz8l/image/upload/v1623593130/avatars/0.jpg",
        },
    });

    sendToken(res, user,"Registered Successfully", 201);
});




// Login user => /api/v1/login
export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) return next(new ErrorHandler("Please enter all fields",400));

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Incorrect email or Password ",401));

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Incorrect email or Password ",401));

    sendToken(res, user,`Welcome back ${user.name}`, 200);
});


// Logout user => /api/v1/logout
export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        // httpOnly: true,
        // sameSite:"none"
    }).json({
        success: true,
        message: "Logged out Successfully",
    });
});


// Get currently logged in user details => /api/v1/me

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user,
    });
});



// Update / Change password => /api/v1/changepassword

export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return next(new ErrorHandler("Please enter all fields",400));

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) return next(new ErrorHandler("Old password is incorrect",400));

    user.password = newPassword;

    await user.save();

    sendToken(res, user, "Password changed successfully", 200);

  
});


// Update user profile => /api/v1/me/update

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if(name) user.name=name;
    if(email) user.email=email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user
    });
});


//Update profile picture => /api/v1/me/updatepicture

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {

    res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
    });
});


// Forgot password => /api/v1/password/forgot

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user= await User.findOne({email});

    if(!user) return next(new ErrorHandler("User not found",404));

    const resetToken = user.getResetToken();

    await user.save({ validateBeforeSave: false });
    // console.log(process.env.FRONTEND_URL)

    const url=`${process.env.FRONTEND_URL}/resettoken/${resetToken}`;
    const message=`Your password reset token is as follow:\n\n${url}\n\nIf you have not requested this email, then ignore it.`;
    // console.log(message)

    // send token via email
    await sendEmail(user.email, "Technical Abhi Reset Password ", message);

    res.status(200).json({
        success: true,
        message: `Password reset link sent to your email: ${user.email}`
    });

});


// Reset password => /api/v1/password/reset/:token

export const resetPassword = catchAsyncError(async (req, res, next) => {
    const {token}=req.params;

    const ResetPasswordToken=crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user=await User.findOne({
        ResetPasswordToken,
        ResetPasswordExpire:{$gt:Date.now()}
    });

    if(!user) return next(new ErrorHandler("Password reset token is invalid or has been expired",400));
    user.password=req.body.password;
    user.ResetPasswordToken=undefined;
    user.ResetPasswordExpire=undefined;


    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });

   
});


//add to playlist => /api/v1/addToPlaylist/:id

export const addToPlaylist = catchAsyncError(async (req, res, next) => {

    const user=await User.findById(req.user._id);
    const course=await Course.findById(req.body.id);

    if(!course) return next(new ErrorHandler("Course not found",404));

    const itemExist=user.playlist.find(item=>item.course.toString()===course._id.toString());

    if(itemExist) return next(new ErrorHandler("Course already added to playlist",409));

    user.playlist.push({
        course:course._id,
        poster:course.poster.url,
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Course added to playlist successfully",
    });
});



//remove from playlist => /api/v1/removeFromPlaylist/:id

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
    const user=await User.findById(req.user._id);
    const course=await Course.findById(req.query.id);
    if(!course) return next(new ErrorHandler("Course not found",404));

    const newPlaylist=user.playlist.filter(item=>item.course.toString()!==course._id.toString());

    user.playlist=newPlaylist;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Remove from playlist successfully",
    });


});