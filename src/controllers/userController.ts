import { Request, Response } from "express";
import User from "../model/userModel";
import bcrypt from "bcryptjs";
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        isAdmin?: boolean;
    }
}

export const getRegisterPage = async (req: Request, res: Response) => {
    try {
        console.log(" Register page requested");
        res.render("user/register");
    } catch (error) {
        console.error('Error loading register page:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email,phone, password } = req.body;
        
        console.log(" Registration...........:", { name, email });
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10);

        

        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashPassword,
            isAdmin: isFirstUser,  
            isBlocked: false
        });
        
        console.log(" User registered:", newUser.email, isFirstUser ? "(ADMIN)" : "");
        
        console.log("User registered:", newUser.email);
        
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully', 
            data: { 
                name: newUser.name, 
                email: newUser.email ,
                phone:newUser.phone
            }
        });
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

export const getLoginPage = (req: Request, res: Response) => {
    try {
        console.log('Login page requested');
        res.render("user/login");
    } catch (error) {
        console.error(' Error loading login page:', error);
        res.status(500).send('Internal server error');
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password} = req.body;
        console.log('login attempt:', { email });
        
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) { 
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

        req.session.userId = user._id.toString();
        req.session.isAdmin = user.isAdmin;
        console.log(" User logged in:", user.email);
        
        
        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
             redirectUrl: '/home' ,
            isAdmin: user.isAdmin 
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

export const getHomePage = async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        
        res.render("user/home", { user });
        
    } catch (error) {
        console.error(' Error loading home page:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getProfile=async(req:Request,res:Response)=>{
    try {
        if(!req.session.userId)return res.redirect("/login");
        const user=await User.findById(req.session.userId);
        if(!user){
            return res.redirect("/login")
        }
        res.render("user/profile",{user})
        
    } catch (error) {
         console.error("Profile page error:", error);
        res.status(500).json({message:"Internal server error"});
        
    }
}

export const getEditProfilePage =async(req:Request,res:Response)=>{
    try {
        if(!req.session.userId){
            return res.redirect('/login')
        }
        const user=await User.findById(req.session.userId);
        if(!user){
            return res.redirect('/login')
        }
        res.render("user/editProfile",{user})
    } catch (error) {
        console.error('Error loading edit profile page:', error);
        res.status(500).send('Internal Server Error');
        
    }
}

export const updateProfile=async(req:Request,res:Response):Promise<void>=>{
    try {
        if(!req.session.userId){
            res.status(401).json({message:'Not authenticated'});
            return ;
        }

        const {name,email,phone}=req.body;

        console.log(' Updating profile:', { name, email,phone }); 
        const existingUser =await User.findOne({
            email,
            _id:{$ne:req.session.userId}
        });

        if(existingUser){
            res.status(400).json({message:'email already exist'})
        }

        const updatedUser=await User.findByIdAndUpdate(
            req.session.userId,
            {name,email,phone},
            {new:true}
        )
            console.log(' Profile updated in DB:', updatedUser); 

            if(!updatedUser){
                res.status(404).json({message:'User not found'});
                return ;
                
            }

        res.status(200).json({
            success:true,
            message:'Profile updtaed successfully'
        })
        
    } catch (error) {
         console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
        
    }
}

export const deleteAccount=async(req:Request,res:Response)=>{
    try {
        const userId=req.session.userId
        if(userId){
            return res.redirect('/login')
        }
        await User.findByIdAndDelete(userId)

        req.session.destroy(()=>{
            res.redirect('/login')
        })
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
        
    }
}

export const logoutUser=(req:Request,res:Response):void=>{
    try {
        req.session.destroy((err:any)=>{
            if(err){
                console.log('err destroying session ',err);
                return res.status(500).send('could not logout')
                
            }
            res.clearCookie('connect.sid')
    //   req.flash("success", "Logged out successfully!");
            return res.redirect('/login')
            
        })
        
    } catch (error) {
         console.log("Logout error:", error);
        res.status(500).send("Server error");
    }
}