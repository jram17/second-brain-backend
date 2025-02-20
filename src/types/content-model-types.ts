import { Document, Types } from "mongoose";

// Define the interface for Scrapped content
interface IScrapped {
    title: string;
    description: string;
    url: string;
    author: string;
    publisher: string;
    imageUrl: string;
}

// Define the interface for Content, ensuring proper types
export interface IContent extends Document {
    link: string;
    text: string;
    tages: Types.ObjectId[];
    type: string;
    userId: Types.ObjectId; // Fix applied here
    timestamp: Date;
    scrapped?: IScrapped;
}
