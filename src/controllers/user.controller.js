import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check fro avatar
    // upload them to cloudnary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // retrun res


    // extracted all data points from req.body
    const { fullName, email, username, password } = req.body
    // console.log("email:", email);

    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required")
    // }

    // check if user passed empty string
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user existed from email and username
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    // check if user exists and throw error 
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);


    // check avater local path
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // throw error if there is no avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // check if avatar is available and upload to cloudinary 
    // cloudinary doesn't throw error if localpath is not defined, it returns empty string
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // check if avater is not upload and throws error
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")

    }

    // if all good then creates  this object
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    // remove "-password -refreshToken" receive value 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // if user not created then throws error
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})


export {
    registerUser
}