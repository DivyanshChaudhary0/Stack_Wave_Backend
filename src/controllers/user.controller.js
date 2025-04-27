
const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const questionModel = require("../models/question.model");
const answerModel = require("../models/answer.model");

const findUserController = async function(req,res){
    try{
        const id = req?.params?.id;
        if(!id){
            return res.status(400).json({
                message: "Id is required to find user"
            })
        }

        const user = await userModel.findById(id);

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user,
            message: "User found successfully"
        })
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const updateUserController = async function(req,res){
    try{
        const id = req?.params?.id;
        const userId = req?.user?._id;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Id is not valid"
            })
        }

        if(id.toString() !== userId.toString()){
            return res.status(403).json({
                message: "You cant update user"
            })
        }

        const allowUpdates = ["bio","avatar","username"];
        const updates = {};

        Object.keys(req.body).forEach((key) => {
            if(allowUpdates.includes(key)){
                updates[key] = req.body[key]
            }
        })

        if(req.avatar){
            updates.avatar = req.avatar;
        }

        if(updates?.bio && updates.bio.length > 100){
            return res.status(400).json({
                message: "Bio should less than 100 characters"
            })
        }

        const user = await userModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user,
            message: "User updated successfully"
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const leaderBoardController = async function(req,res){
    try{

        const {limit = 3} = req.query;

        const topUsers = await userModel.find().sort({reputation : - 1}).limit(limit);

        // const leaderboardData = await Promise.all(topUsers.map( async(user) => {
        //     let questionCount = await questionModel.countDocuments({ authorId: user?._id })
        //     let answerCount = await answerModel.countDocuments({ authorId: user?._id })

        //     return {
        //         username: user?.username,
        //         avatar: user?.avatar,
        //         reputation: user?.reputation,
        //         questions: questionCount,
        //         answers: answerCount, 
        //     }
        // }))

        res.status(200).json({
            data: topUsers,
            message: "data fetched successfully"
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}


module.exports = {
    findUserController,
    updateUserController,
    leaderBoardController
}
