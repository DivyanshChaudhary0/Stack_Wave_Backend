
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Title is required"],
        minLength: [5, "Title should have at least 5 characters"],
        maxLength: [50, "Title is too long"]
    },
    body: {
        type: String,
        maxLength: [1000, "Question is too long, Make it short"]
    },
    tags: {
        type: [String],
        default: []
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    upvotedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    downvotedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    answersCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const questionModel = mongoose.model("Question", questionSchema);

module.exports = questionModel;
