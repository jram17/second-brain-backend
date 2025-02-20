import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function connectDB(): Promise<void> {
    try{
        const db=process.env.db_url as string;
        const connect =await mongoose.connect(db);
        console.log('Database connected:', connect.connection.name); 

            
    }catch(error){
        console.log("this was the error : ", error);
    }
}