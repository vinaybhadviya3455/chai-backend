import { asyncHandler } from "../utils/asyncHandler.js";

import {Apierror} from "../utils/Apierror.js";

import {User} from "../models/user.model.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import { Apiresponse } from "../utils/Apiresponse.js";

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

    const {username,fullname,email,password}= req.body

    console.log("email :",email);



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

    const existedUser=User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new Apierror(409,"User With this email or username is already exists")
    }


    //check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;

    if (!avatarLocalPath) {

        throw new Apierror(400,"Avatar file is required")
        
    }


    //upload them on cloudinarry

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage=await uploadOnCloudinary(coverimageLocalPath)

    if(!avatar){
         throw new Apierror(400,"Avatar file is required")
    }


    //create user object db me entry banado

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(User._id).select(
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


export {registerUser,}