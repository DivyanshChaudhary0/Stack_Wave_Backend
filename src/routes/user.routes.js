
const {Router} = require("express");
const { findUserController, updateUserController, leaderBoardController } = require("../controllers/user.controller");
const { userAuth, imageUpload } = require("../middlewares/auth.middleware");
const router = Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/:id", userAuth, findUserController);     // get user profile

router.put("/:id", userAuth, upload.single("image"), imageUpload, updateUserController);  // update user profile

router.get("/leaderboard", userAuth, leaderBoardController)   // Leaderboard data


module.exports = router;
