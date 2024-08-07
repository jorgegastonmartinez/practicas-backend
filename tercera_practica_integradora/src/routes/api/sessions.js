import passport from "passport";
import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import {
   registerUser,
   failRegister,
   loginUser,
   failLogin,
   logoutUser,
   getCurrentUser,
   githubCallback,
   renderForgotPassword,
   renderResetPassword,
   renderResetPasswordExpired,
   forgotPassword,
   resetPassword
} from "../../controllers/sessions.controller.js";

const router = Router();

router.post("/register", registerUser);
router.get("/failregister", failRegister);
router.post("/login", loginUser);
router.get("/faillogin", failLogin);
router.post("/logout", logoutUser);
router.get("/current", isAuthenticated, getCurrentUser);
router.get("/github", passport.authenticate("github", { scope: ["user.email"] }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), githubCallback);
router.post('/forgot-password', forgotPassword);
router.get('/forgot-password', renderForgotPassword);
router.get('/reset-password-expired', renderResetPasswordExpired);
router.get('/reset-password', renderResetPassword);
router.post('/reset-password', resetPassword);

export default router;