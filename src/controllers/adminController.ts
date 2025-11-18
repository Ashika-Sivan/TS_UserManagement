import {Request,Response}from 'express';
import User from "../model/userModel";
import bcrypt from "bcryptjs";
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;  
     adminName?: string;  
  }
}



export const getAdminLoginPage=(req:Request,res:Response)=>{
    res.render("admin/loginAdmin")
}
export const postAdminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });

        if (!admin) {
            res.render("admin/loginAdmin", { error: 'Invalid admin credentials' });
            return;
        }
        if (admin.isBlocked) {
            res.render("admin/loginAdmin", { error: 'Your account has been blocked' });
            return;
        }

    
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            res.render("admin/loginAdmin", { error: 'Invalid admin credentials' });
            return;
        }

        req.session.userId = admin._id.toString();
        req.session.isAdmin = true;
        req.session.adminName = admin.name;

        console.log("Admin logged in:", admin.email);

        res.redirect("/admin/dashboard");

    } catch (error) {
        console.error(" Admin login error:", error);
        res.status(500).send("Server error");
    }
}

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const adminId = req.session.userId;

        if (!adminId || !req.session.isAdmin) {
            return res.redirect("/admin/loginAdmin");
        }

        const admin = await User.findById(adminId);

        if (!admin || !admin.isAdmin) {
            return res.redirect("/admin/loginAdmin");
        }


        const users = await User.find({ 
            _id: { $ne: adminId } 
        }).sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments({ isAdmin: false });
        const activeUsers = await User.countDocuments({ isAdmin: false, isBlocked: false });
        const blockedUsers = await User.countDocuments({ isAdmin: false, isBlocked: true });

        res.render("admin/dashboard", {
            admin,
            users,
            totalUsers,
            activeUsers,
            blockedUsers
        });

    } catch (error) {
        console.error(" Dashboard Error:", error);
        res.status(500).send("Server Error");
    }
};

export const getUserList=async(req:Request,res:Response)=>{
    try {
        
        if(!req.session.isAdmin){
            return res.redirect("/admin/loginAdmin");
        }

        const page=parseInt(req.query.page as string)||1;
        const limit=10;
        const skip=(page-1)*limit;

        const users=await User.find({isAdmin:false})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)



        const totalUsers=await User.countDocuments({isAdmin:false});
        const totalPages=Math.ceil(totalUsers/limit)

        res.render("admin/user-list",{
            users,
            currentPage:page,
            totalPages,
            totalUsers,
            adminName:req.session.adminName

        })
            
        
    } catch (error) {
        console.error("Error loading user list:", error);
        res.status(500).json({message:"Server Error"});
        
    }
}

export const blockUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "UserId missing" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.json({ success: true, isBlocked: user.isBlocked });

    } catch (error) {
        console.error("Block user error:", error);
        res.json({ success: false, message: "Server error" });
    }
};



export const unBlockUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBlocked = false;
        await user.save();

          res.json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked
        });

    } catch (error) {
        console.error("Unblock user error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const adminLogout = (req: Request, res: Response) => {
    console.log("🚪 Admin logging out:", req.session.adminName);
    
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Logout failed");
        }
        console.log(" Admin logged out successfully");
        res.redirect("/admin/loginAdmin");
    });
}
