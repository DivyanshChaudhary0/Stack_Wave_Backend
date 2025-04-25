
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: [true, "Unique roomId is required"],
        unique: true,
        index: true
    },
    name: {
        type: String,
        trim: true
    },
    language: {
        type: String,
        required: [true, "language is required"],
        default: 'javascript'
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    codeContent: {
        type: String,
        default: ''
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const roomModel = mongoose.model("Room", roomSchema);
module.exports = roomModel;