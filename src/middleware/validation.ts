import {Request,Response,NextFunction}from "express"

export const validateRegister=(req:Request,res:Response,next:NextFunction):void=>{
    const {name,email,phonne,password}=req.body;

    const errors:string[]=[];

    if(!name||name.trim().length<2){
        errors.push('Name must ne atleast 2 character long')

    }

    const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!email||!emailRegex.test(email)){
        errors.push('please provide a valid email address')
    }



    if(!password||password.length<6){
        errors.push('password must be atleast 6 character long')
    }

    if(errors.length>0){
        res.status(400).json({
            success:false,
            message:'validation failed',
            errors
        })
        return 
    }
    next()
}