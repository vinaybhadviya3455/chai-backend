import { asyncHandler } from "../utils/asyncHandler.js";

import {Apierror} from "../utils/Apierror.js";

import {User} from "../models/user.model.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import { Apiresponse } from "../utils/Apiresponse.js";


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //db mein add user se pura properties aa gyi user ki

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})


        return {accessToken,refreshToken}



    } catch (error) {
        throw new Apierror(500,"Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    // res.status(200).json({
    //     message: "Chai Aur Code"
    // })  this part is of video 12 before logic building video


    //for registering a user
    //1.get user details from frontened which are been used in modelling
    //validation(email empty,username empty,wrong email)we check(not empty here)
    //check if user already exists:by username and email you will be able to check
    //check for images,check for avatar
    //upload them to cloudinarry , avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response


    //user se data lena

    const {username,fullname,email,password}= req.body;

    //console.log("email :",email);



    //validation

    //if else sabke liye alag alag beginners method ese hume sabke liye if else likhna padega fullname username sabke liye

    // if(fullname===""){

    //     throw new Apierror(400,"fullname is required")

    // }


    //advanced or newer mrthod

    if(
        [fullname,email,username,password].some((field) => field?.trim()==="")
    ){
        throw new Apierror(400,"All fields are compulsory/required")
    }


    //check if user already exixt or not

    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new Apierror(409,"User With this email or username is already exists")
    }

    //console.log(req.files);


    //check for images , check for avatar
    //const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const avatarLocalPath = req.files?.avatar[0]?.path;  //initial code yhi tha upar wali line tab likhna hai jab hum niche avatarlocalpath ka check jab nahi laga rahe ho
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;  //we dont check here for coverimage then we have also do so for coverimage without this checking


    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {

        throw new Apierror(400,"Avatar file is required")
        
    }


    //upload them on cloudinarry

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
         throw new Apierror(400,"Avatar file is required")
    }


    //create user object db me entry banado

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new Apierror(500,"something went wrong while registering the user")
    }



    //return response

    return res.status(201).json(
        new Apiresponse(200,createdUser,"User Regitered Successfully")
    )
} )


const loginUser = asyncHandler(async(req,res)=>{
     //req body -> data le aao
     //username or email
     //find the user
     //password check
     //access and refresh token generate and give to user
     //send access and refresh token in cookies



     //req body se data le aao

     const {email,username,password} = req.body

     if(!username || !email){
        throw new Apierror(400,"username or password is required")
     }

     const user = User.findOne({
        $or:[{username},{email}]
     })

     if (!user) {
        throw new Apierror(404,"user does not exist")
     }

     const isPsswordValid = await user.isPasswordCorrect(password)

     if (!isPsswordValid) {
        throw new Apierror(401,"Invalid User Credentials")
     }

     const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)


     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



     //now send in cookies

     const options = {
        httpOnly:true,
        secure:true
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new Apiresponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged in successfully"
        )
     )
})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
            {
                new:true
            }
    )

    const options = {
        httpOnly:true,
        secure:true
     }

     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new Apiresponse(200,{},"User Logged Out"))

    
})


export {
    registerUser,
    loginUser,
    logoutUser
       

}