import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const DB_URI = process.env.MONGODB_URI;

        if (!DB_URI) {
            console.error("Error: MONGODB_URI not defined in .env");
            process.exit(1);
        }

        await mongoose.connect(DB_URI); 
        console.log("Database connected successfully");
        
    } catch (error) {
        console.error("OOPS.. connection failed!", error);
        process.exit(1);
    }
}

export default connectDB;