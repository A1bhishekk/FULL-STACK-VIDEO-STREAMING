import express from 'express';
import { changePassword, getMyProfile, login, logout, register, updateProfile, updateProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } from '../controllers/userController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

// To register a new user
router.route("/register").post(singleUpload,register);

// Login a user
router.route("/login").post(login);

// Logout a user
router.route("/logout").get(logout);

//Get my profile
router.route("/me").get(isAuthenticated, getMyProfile);

//Delete my profile
router.route("/me").delete(isAuthenticated, deleteMyProfile);

// Change Password
router.route("/changepassword").put(isAuthenticated, changePassword);

//Update Profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

//Update Profile Picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload,updateProfilePicture);


//Forget Password
router.route("/forgetpassword").post(forgetPassword);

//Reset Password
router.route("/resetpassword/:token").put(resetPassword);

//add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);  

//remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);



// ADMIN ROUTES
// Get all users
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);

// update user role - only admin 
//delete user - only admin
// delete my profile - only admin
router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin, updateUserRole).
delete(isAuthenticated, authorizeAdmin,deleteUser);


export default router;