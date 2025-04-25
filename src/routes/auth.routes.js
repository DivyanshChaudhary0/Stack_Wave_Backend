
const {Router} = require("express")
const router = Router();
const { signUpController, loginController, profileController, verifyController, googleLoginController, resendController, logoutController } = require("../controllers/auth.controller");
const { userAuth, signUpValidations, loginValidation } = require("../middlewares/auth.middleware");

router.post("/signUp", signUpValidations, signUpController)

router.post("/login", loginValidation, loginController)

router.get("/me", userAuth, profileController)

router.post("/verify", verifyController)

router.post("/google-login", googleLoginController)

router.post("/resend-otp", resendController)

router.post("/logout", userAuth, logoutController)

module.exports = router;