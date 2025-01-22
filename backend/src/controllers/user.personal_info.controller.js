// import files
import { User } from "../models/user.model.js";

// helper functions

const generateTokens = async (_id)=>{
    try{
    const user = await User.findById(_id);
    if(!user) return {accessToken : null, refreshToken : null};
     console.log(user);
     const accessToken = await user.generateAccessToken();
     const refreshToken =await user.generateRefreshToken();
     console.log(accessToken,refreshToken);
     if(!accessToken || !refreshToken){
        return {accessToken , refreshToken : null};
     }

      user.refreshToken = refreshToken;

     return {accessToken,refreshToken};
    }
    catch{
        console.log("Error during generating tokens");
        return {accessToken : null, refreshToken : null};;
    }
}


// routing functions

const SignUp = async (req, res) => {
    const { name, mobile, bio, password } = req.body;

    // Check for missing required fields
    if (!name || !mobile || !password) {
        return res.status(404).json({ message: "Required fields are missing" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const newUser = await User.create({
            name,
            mobile,
            bio,
            password,
        });

        // Retrieve the user without password
        const createdUser = await User.findOne({ mobile }).select("-password -refreshToken");

        // Send response
        return res.status(201).json({
            user: createdUser,
            message: "User registered successfully",
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Error during user registration" });
    }
};

const Login = async (req, res)=>{
        const {mobile ,password} = req.body;
        const regMobile = /^[1-9][0-9]{9}$/;
        console.log(mobile);
        if(!regMobile.test(mobile)){
           return res.status(400).json({
            message : "Mobile is not valid"
           });
        }
    try{
        const user = await User.findOne({mobile});

        if(!user){
            return res.status(404).json({
                message : "User Not Found",
            });
        }

        const passwordCheck = await user.comparePassword(password);
        
        if(!passwordCheck){
            return res.status(400).json({
                message : "Password is incorrect",
            });
        }
      const {accessToken , refreshToken} =await generateTokens(user?._id);
      console.log(accessToken,refreshToken);
    if(!accessToken || !refreshToken){
        return res.status(400).json({
            message : "Error During generating Tokens",
        });
    }
    const loginUser = await User.findById(user._id).select("-password -refreshToken");

    res.cookie(
         "accessToken" , accessToken,{
            maxAge : 3600000, // max age
            httpOnly : true, // only accessable by http req. || document.cookies = null
            secure : false // if true then only server sent cookies over https req. 
         }
    );
    res.cookie(
        "refreshToken" , refreshToken,{
           maxAge : 3600000,
           httpOnly : true
        }
   );
    return res.status(200).json({
        message : "Login Success",
        data :{
            user : loginUser,
            accessToken : accessToken,
        }
    });

    }
    catch(err){
        return res.status(400).json({
            message : `Error During Login ${err}`,
        });
    }
}

const getUser = async (req, res)=>{
      const user = req.user;
      if(!user){
        return res.status(400).json({
            message : "user not found"
        })
      }

      return res.status(400).json({
         user ,
         message : "user get successfully"
      });
}


export { SignUp, Login, getUser };

