import mongoose,{model,Schema} from 'mongoose';

const LinkSchema=new Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId,required:true,unique:true,ref:'User'}
});
export const Link=model('Link',LinkSchema);