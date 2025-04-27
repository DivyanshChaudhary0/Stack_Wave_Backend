
const { Router } = require("express");
const { leaderBoardController } = require("../controllers/user.controller");
const { userAuth } = require("../middlewares/auth.middleware");
const router = Router();

router.get("/", userAuth, leaderBoardController)


module.exports = router;