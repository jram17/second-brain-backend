import mongoose,{model,Schema} from 'mongoose';

const ContentSchema =new Schema({
    // title:String,
    link:String,
    text:String ,
    tages:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    type:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
    timestamp:{type:Date,default:Date.now()},
},{
    toJSON: { virtuals: true },  // Enable virtuals in JSON output
    toObject: { virtuals: true } // Enable virtuals in object output
});

ContentSchema.virtual("scrapped", {
    ref: "Scrapped",
    localField: "_id",
    foreignField: "contentId",
    justOne: true ,
});
export const Content = model("Content",ContentSchema);