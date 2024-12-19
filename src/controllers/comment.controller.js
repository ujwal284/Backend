import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const options = {
        page: parentInt(page, 10),
        limit: parseInt(limit, 10),
        populate: ["owner"],
    };

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([{ $match: { video: mongoose.Types.ObjectId(videoId) } }]),
        options
    );

    res.status(200)
        .json(
            new ApiResponse(200, "Comment fetched successfully", comments)
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    });

    res.status(201)
        .json(
            new ApiResponse(201, "Comment added successfully", comment)
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        { content },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found or not authorized")
    }

    res.status(200)
        .json(
            new ApiResponse(200, "Comment updated successfully", comment)
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(404, "Comment not found or not aothorized")
    }

    res.status(200)
        .json(
            new ApiResponse(200, "Comment deleted successfully")
        )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}