import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js"
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// get all courses without lectures
export const getAllCourses = catchAsyncError(async (req, res, next) => {
    const courses = await Course.find().select("-lectures");
    res.status(200).json({
        success: true,
        courses,
    });
})




//create a new Course
export const createCourse = catchAsyncError(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return next(new ErrorHandler("please add all fields properly", 400));
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    // upload to cloudinary
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }

    })
    res.status(201).json({
        success: true,
        message: "Course created successfully.You can add Lecture now",
        course,
    });
});



// get a course with lectures

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    course.views += 1;
    await course.save();

    res.status(200).json({
        success: true,
        lectures: course.lectures,
    });
});



// add lectures to a course

export const addLecture = catchAsyncError(async (req, res, next) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return next(new ErrorHandler("please add all fields properly", 400));
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    // upload to cloudinary max 100mb

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video",
    });


    course.lectures.push({
        title,
        description,
        video: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture added successfully",
    });
});



// delete a course with all lectures

export const deleteCourse = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, { resource_type: "video" });
    }

    await course.remove();

    res.status(200).json({
        success: true,
        message: "Course deleted successfully",
    });

});


// delete lecture from a course

export const deleteLecture = catchAsyncError(async (req, res, next) => {
    const { courseId, lectureId } = req.query;

    // console.log(courseId, lectureId)

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    const lecture = course.lectures.filter((item) => {
        if (item._id.toString() === lectureId.toString()) return item;
    });

    console.log(lecture)

    await cloudinary.v2.uploader.destroy(lecture[0].video.public_id, { resource_type: "video" });

    course.lectures = course.lectures.filter((item) => {
        if (item._id.toString() !== lectureId.toString()) return item;
    });


    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture deleted successfully",
    });

});