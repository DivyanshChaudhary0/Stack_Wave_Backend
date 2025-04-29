
const { Router } = require("express");
const router = Router();
const { userAuth } = require("../middlewares/auth.middleware");
const questionValidation = require("../middlewares/question.middleware");
const {allQuestionsController, createQuestionController, getOneController, updateController, deleteController, upVoteController, downVoteController} = require("../controllers/question.controller")


router.get("/", userAuth, allQuestionsController);   // get-All questions

router.post("/", userAuth, questionValidation, createQuestionController);  // create a question

router.get("/:id", userAuth, getOneController);   // get one question

router.put("/:id", userAuth, updateController)     // update question

router.delete("/:id", userAuth, deleteController)    // delete question

router.post("/upVote/:questionId", userAuth, upVoteController);

router.post("/downVote/:questionId", userAuth, downVoteController);


module.exports = router;
