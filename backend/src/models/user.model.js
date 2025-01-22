// import packages
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
const UserSchema = new mongoose.Schema(
    {
        name : {
             type : String,
             required : true,
             trim : true,
        },
        mobile : {
            type : String,
            required : true,
            trim : true,
            unique : true,
            match : /^[0-9]{10}/
        },
        bio : {
            type : String,
            default : ""
        },
        password : {
            type : String,
            required : true,
            trim : true,
        },
        refreshToken:{
            type : String,
        }
    },
    {timestamps : true}
);

// methods

// hash password before save
UserSchema.pre('save',async function (next){
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10) //appand random values in password before hashing 
        this.password= await bcrypt.hash(this.password, salt);
    }
    next();
});

// compare login password and stored hash password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);    
 };

// generate access token
UserSchema.methods.generateAccessToken = async function () {
    console.log("generateAccessToken", process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRY)
  return jwt.sign({
        _id : this._id,
        name : this.name,
        mobile : this.mobile,
    },
    process.env.ACCESS_TOKEN_SECRET,
 {expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
}

// generate refresh token
UserSchema.methods.generateRefreshToken = async function () {
    console.log("generateRefreshToken")
   return jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
 {expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
}


export const User = mongoose.model("User", UserSchema);