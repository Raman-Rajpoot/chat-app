// import packages
import mongoose from "mongoose";
import dotenv from 'dotenv'
import seedUsers from "../seeders/user.seeder.js";

// import files


// config
dotenv.config()

// connect db
const MONGO_URL = process.env.MONGO_URL;

const connectDB = async ()=>{
    try{
       await mongoose.connect(MONGO_URL);

    console.log('Database connected successfully');
    
    }
    catch(err){
        console.log('Error connecting to database :- ', err);
    }
    // seedUsers(5)
}

export default connectDB;