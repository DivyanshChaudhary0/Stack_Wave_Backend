
const { Router } = require("express");
const { userAuth } = require("../middlewares/auth.middleware");
const { getAllComments, createComment, updateComment, deleteComment, createReply, getReply } = require("../controllers/comment.controller");
const router = Router();

router.get("/:answerId", userAuth, getAllComments);

router.post("/:answerId", userAuth, createComment);

router.put("/:commentId", userAuth, updateComment);

router.delete("/:commentId", userAuth, deleteComment);

router.post("/:commentId/replies", userAuth, createReply);

router.get("/:commentId/replies", userAuth, getReply)

module.exports = router;
