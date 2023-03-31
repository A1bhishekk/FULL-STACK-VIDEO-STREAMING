import express from 'express';
import { changePassword, getMyProfile, login, logout, register, updateProfile, updateProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// To register a new user
router.route("/register").post(register);

// Login a user
router.route("/login").post(login);

// Logout a user
router.route("/logout").get(logout);

//Get my profile
router.route("/me").get(isAuthenticated, getMyProfile);

// Change Password
router.route("/changepassword").put(isAuthenticated, changePassword);

//Update Profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

//Update Profile Picture
router.route("/updateprofilepicture").put(isAuthenticated, updateProfilePicture);


//Forget Password
router.route("/forgetpassword").post(forgetPassword);

//Reset Password
router.route("/resetpassword/:token").put(resetPassword);

//add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);  

//remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

export default router;