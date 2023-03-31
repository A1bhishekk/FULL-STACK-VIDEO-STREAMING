import app from './app.js';
import cloudinary from 'cloudinary';
import {connectDB} from "./config/database.js";
import razorpay from 'razorpay';


const PORT= 4000 || process.env.PORT;

connectDB();

// razorpay configuaration
export const instance = new razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_API_SECRET,
})


// cloudinary configuration 

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})

app.get('/',(req,res)=>{
    res.send("Hello World");
})
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`.rainbow);
})