import { Router } from "express";
import { getRegisterPage, registerUser, getLoginPage, loginUser, getHomePage, logoutUser,getProfile,getEditProfilePage,updateProfile ,deleteAccount} from "../controllers/userController";
import { requireAuth,redirectIfAuthenticated } from "../middleware/auth";

const router = Router();


router.use((req, res, next) => {
    console.log(` ${req.method} ${req.path}`);
    next();
});


router.get("/register",redirectIfAuthenticated, getRegisterPage);
router.post("/register", registerUser);


router.get("/login",redirectIfAuthenticated, getLoginPage);
router.post("/login", loginUser);


router.get("/home",requireAuth, getHomePage);


router.get("/profile",requireAuth,getProfile);
router.get("/editProfile",requireAuth, getEditProfilePage); 
router.post("/editProfile", requireAuth, updateProfile);   


router.get('/delete-account', requireAuth, deleteAccount);




router.get("/logout", logoutUser);


router.get("/", (req, res) => {
    console.log("Root route accessed - redirecting to login");
    res.redirect("/login");
});

export default router;