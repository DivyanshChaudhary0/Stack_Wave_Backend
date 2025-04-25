
const roomModel = require("../models/room.modal");

const createRoomcontroller = async function(req,res){
    try{
        const { nanoid } = await import('nanoid');

        const {name,language} = req.body;

        if(!language){
            return res.status(400).json({
                message: "language is required"
            })
        }

        const userId = req.user?._id;
        if(!userId){
            return res.status(401).json({
                message: "User not authenticated" 
            })
        }

        const generatedRoomId = nanoid(10);

        const room = await roomModel.create({
            roomId: generatedRoomId,
            name : name?.trim() || `Room-${generatedRoomId.substring(0,4)}`,
            language,
            host: userId,
            participants: [userId]
        })

        res.status(201).json({
            message: "Room created successfully",
            room: {
                name: room.name,
                roomId: room.roomId,
                language: room.language
            }
        })

    }
    catch(err){
        if (err.code === 11000) {
            return res.status(409).json({ message: "Failed to generate a unique room ID. Please try again." });
        }
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: "Validation Error", errors: err.errors });
        }

        res.status(500).json({
            message: "An internal server error occurred while creating the room."
        });
    }
}

const findRoomsController = async function(req,res){
    try{
        const userId = req.user._id;
        if(!userId){
            return res.status(401).json({
                message: "User not found"
            })
        }

        const rooms = await roomModel.find({host: userId}).populate("participants","username avatar")

        res.status(200).json({
            message: "Rooms fetched successfully",
            rooms
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const deleteRoomController = async function(req,res){
    try{
        const roomId = req.params.id;
        if(!roomId){
            return res.status(400).json({
                message: "RoomId is not found"
            })
        }

        const room = await roomModel.findOneAndDelete({ roomId },{ new:true });

        res.status(200).json({
            message: "room deleted successfully",
            room
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    createRoomcontroller,
    findRoomsController,
    deleteRoomController
}