
const {Router} = require("express");
const { userAuth } = require("../middlewares/auth.middleware");
const { getAnswersController, addAnswerController, editAnswerController, deleteAnswerController, upVoteAnswerController, downVoteAnswerController } = require("../controllers/answer.controller");
const router = Router();

router.get("/:questionId", userAuth, getAnswersController);

router.post("/:questionId", userAuth, addAnswerController);

router.put("/:answerId", userAuth, editAnswerController);

router.delete("/:answerId", userAuth, deleteAnswerController);

router.post("/upVote/:answerId", userAuth, upVoteAnswerController);

router.post("/downVote/:answerId", userAuth, downVoteAnswerController);


module.exports = router;