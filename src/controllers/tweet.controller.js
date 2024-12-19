import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { owner, content } = req.body;

    // Debugging: Log the incoming owner ID
    console.log("Owner ID:", owner);

    // Validate owner ID
    if (!owner || !isValidObjectId(owner)) {
        throw new ApiError(400, "Invalid owner ID");
    }

    // Check if the owner exists
    const user = await User.findById(owner);
    if (!user) {
        throw new ApiError(404, "Owner not found");
    }

    // Debugging: Log the user details
    console.log("User Found:", user);

    // Create a new tweet
    const tweet = await Tweet.create({ owner, content });

    return res.status(201).json(
        new ApiResponse(201, "Tweet created successfully", tweet)
    );

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { ownerId } = req.params;

    if (!isValidObjectId(ownerId)) {
        throw new ApiError(400, "Invalid owner ID");
    }

    // fetch tweets for the owner
    const tweets = await Tweet.find({ owner: ownerId }).populate("owner")

    return res.status(200).json(
        new ApiResponse(200, "Owner tweets fetched successfully", tweets)
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    // update the tweet
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(
        new ApiResponse(200, "Tweet updated successfully", tweet)
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    // Delete the tweet
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(
        new ApiResponse(200, "Tweet deleted successfully", tweet)
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}