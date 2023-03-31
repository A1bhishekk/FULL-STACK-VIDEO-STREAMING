import express from 'express';
import { getAllCourses,createCourse, getCourseLectures, addLecture, deleteLecture, deleteCourse } from '../controllers/courseController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router=express.Router();

//get all courses without lectures
router.route("/courses").get(getAllCourses)

//create a new course - only admin
router.route("/createcourse").post(isAuthenticated,authorizeAdmin,singleUpload,createCourse)

//Add lectures,Delete course ,get course details 

router.route("/course/:id").get(getCourseLectures).post(isAuthenticated,authorizeAdmin,singleUpload,addLecture).
delete(isAuthenticated,authorizeAdmin,deleteCourse)



//delete lecture
router.route("/lecture").delete(isAuthenticated,authorizeAdmin,deleteLecture)



export default router;