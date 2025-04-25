
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "questionId is required"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        maxLength: 2000
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "authorId is required"],
    },
    commentCount: {
        type: Number,
        default: 0
    },
    vote: {
        type: Number,
        default: 0
    },
    upvotedby: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    downvotedby: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    
},{ timestamps: true })

const answerModel = mongoose.model("Answer", answerSchema);

module.exports = answerModel;
