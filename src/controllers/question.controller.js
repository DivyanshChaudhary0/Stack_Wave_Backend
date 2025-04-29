
const mongoose = require("mongoose");
const questionModel = require("../models/question.model");
const userModel = require("../models/user.model");
const answerModel = require("../models/answer.model");
const commentModel = require("../models/comment.model");


const allQuestionsController = async function(req,res){
    try{
        const {_id} = req.user;
        const { filter, page = 1, limit = 3 } = req.query;

        if(!_id){
            return res.status(401).json({ message: "Unauthorized" })
        }        

        if(filter){
            let questions = null

            if(filter === "Newest"){
                questions = await questionModel.find()
                .skip((page - 1) * limit)
                .limit(3)
                .sort({ createdAt: -1 })
                .populate("authorId",["username","avatar"]);
            }
            else if(filter === "Top Voted"){
                questions = await questionModel.find()
                .skip((page - 1) * limit)
                .limit(3)
                .sort({ votes: -1 })
                .populate("authorId",["username","avatar"]);
            }
            else{
                questions = await questionModel.find({ answersCount: 0 })
                .skip((page - 1) * limit)
                .limit(3)
                .populate("authorId",["username","avatar"]);
            }

            return res.status(200).json({
                questions,
                message: "Questions fetched successfully"
            })

        }

        const questions = await questionModel.find()
            .skip((page - 1) * limit)
            .limit(3)
            .sort({ createdAt: -1 })
            .populate("authorId",["username","avatar"]);

        res.status(200).json({
            questions,
            message: "Questions fetched successfully"
        })
    }
    catch(err){
        res.status(500).json({ message: err.message })
    }
}

const createQuestionController = async function(req,res){
    try{
        const user = await userModel.findById(req.user._id);
        if(!user){
            return res.status(401).json({
                message: "User not found"
            })
        }

        const {title, body, tags} = req.body;

        if(!title || !tags ||!body){
            return res.status(400).json({ message: "All fields are required" })
        }

        const question = await questionModel.create({
            title,
            body,
            tags,
            authorId: req.user._id
        })

        user.questionsAskedCount++;
        await user.save();

        res.status(201).json({
            question,
            message: "Question created successfully"
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getOneController = async function(req,res){
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({message: "Question is not found"})
        }

        const question = await questionModel.findById(id).populate("authorId");
        if(!question){
            return res.status(400).json({
                message: "Question not found"
            })
        }

        res.status(200).json({
            question,
            message: "Question fetched successfully"
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const updateController = async function(req,res){
    try{
        const id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"id is not valid"})
        }

        const userId = req.user._id;

        if(!id){
            return res.status(400).json({message: "id is empty"})
        }

        const isQuestionExist = await questionModel.findById(id);

        if (!isQuestionExist) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (isQuestionExist?.authorId?.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to modify this question" });
        }

        const allowedFields = ["title", "body", "tags"];
        const updatedFields = {};

        Object.keys(req.body).forEach((key) => {
            if(allowedFields.includes(key)){
                updatedFields[key] = req.body[key]
            }
        })

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        const updatedQuestion = await questionModel.findByIdAndUpdate(
            id, 
            { $set: updatedFields }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Question updated successfully", updatedQuestion });

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const deleteController = async function(req,res){
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({message: "id is empty"})
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"id is not valid"})
        }

        const userId = req.user._id;

        const isQuestionExist = await questionModel.findById(id);

        if (!isQuestionExist) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (isQuestionExist?.authorId?.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this question" });
        }

        await questionModel.findByIdAndDelete(id);
        const answer = await answerModel.deleteMany({ questionId: id });
        await commentModel.deleteMany({ answerId: answer._id });

        const user = await userModel.findById(userId);
        user.questionsAskedCount--;
        await user.save();

        res.status(200).json({
            message: "Question is deleted",
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const upVoteController = async function(req,res){
    try{
        const questionId = req.body?.id;
        const userId = req?.user?._id;

        if(!questionId){
            return res.status(400).json({
                message: "Question not found"
            })
        }
        
        const question  = await questionModel.findById(questionId);

        if(userId.toString() === question.authorId.toString()){
            return res.status().json({
                message: "Can not upVote or downVote to your question"
            })
        }

        if(!question){
            return res.status(404).json({
                message: "Question not found"
            })
        }

        const alreadyUpVoted = question.upvotedBy.some((id) => id.toString() === userId.toString());
        const alreadyDownVoted = question.downvotedBy.some((id) => id.toString() === userId.toString());

        if(alreadyUpVoted){
            question.upvotedBy = question.upvotedBy.filter((id) => id.toString() !== userId.toString());
            question.votes--;
        }
        else if(alreadyDownVoted){
            question.downvotedBy = question.downvotedBy.filter((id) => id.toString() !== userId.toString());
            question.upvotedBy.push(userId);
            question.votes++;
        }
        else{
            question.upvotedBy.push(userId);
            question.votes++;
        }

        await question.save();

        res.status(200).json({
            message: "upVote successfully",
            question
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

const downVoteController = async function(req,res){
    try{
        const questionId = req.body?.id;
        const userId = req?.user?._id;

        if(!questionId){
            return res.status(400).json({
                message: "Question not found"
            })
        }
        
        const question  = await questionModel.findById(questionId);

        if(!question){
            return res.status(400).json({
                message: "Question not found"
            })
        }

        if(userId.toString() === question.authorId.toString()){
            return res.status(400).json({
                message: "Can not upVote or downVote to your question"
            })
        }

        const alreadyUpVoted = question.upvotedBy.some((id) => id.toString() === userId.toString());
        const alreadyDownVoted = question.downvotedBy.some((id) => id.toString() === userId.toString());

        if(alreadyDownVoted){
            question.downvotedBy = question.downvotedBy.filter((id) => id.toString() !== userId.toString());
            question.votes++;
        }
        else if(alreadyUpVoted){
            question.upvotedBy = question.upvotedBy.filter((id) => id.toString() !== userId.toString());
            question.downvotedBy.push(userId);
            question.votes--;
        }
        else{
            question.downvotedBy.push(userId);
            question.votes--;
        }

        await question.save();

        res.status(200).json({
            message: "downVote successfully",
            question
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}


module.exports = {
    allQuestionsController,
    createQuestionController,
    getOneController,
    updateController,
    deleteController,
    upVoteController,
    downVoteController
}