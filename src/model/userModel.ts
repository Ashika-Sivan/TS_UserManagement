import mongoose,{Schema,Document,Types} from "mongoose";
export interface IUser extends Document{
    _id:Types.ObjectId;
    name:string;
    email:string;
    password:string;
    phone:string;
    isAdmin:boolean;
    isBlocked:boolean;
    createdAt:Date;
}


const userSchema:Schema<IUser>=new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowerCase:true
        },
        password:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true,

        },
        isBlocked:{
            type:Boolean,
            default:false
        },
        isAdmin:{
            type:Boolean,
            default:false
        }
    },
    {timestamps:true}

);

const User=mongoose.model<IUser>("User",userSchema)

export default User;