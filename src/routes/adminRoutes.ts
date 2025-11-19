import {Router} from "express"
import express from "express"
import{getAdminLoginPage,postAdminLogin,getDashboard,getUserList,blockUser,unBlockUser,adminLogout} from "../controllers/adminController";
import { preventCache, redirectIfAdminAuthenticated, requireAdmin} from "../middleware/auth";
const router=express.Router()

router.get("/loginAdmin",redirectIfAdminAuthenticated,getAdminLoginPage);
router.post('/loginAdmin',postAdminLogin)

router.get('/dashboard',requireAdmin,getDashboard)
router.get('/user-list',requireAdmin,getUserList)

router.post('/user-list/blockUser', requireAdmin, blockUser);
router.post('/user-list/unBlockUser', requireAdmin, unBlockUser);

router.get('/logout',adminLogout)


export default router;