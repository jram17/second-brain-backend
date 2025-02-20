import {model,Schema} from 'mongoose';

const TagsSchema= new Schema({
    title:[{type:String,unique:true}]
})
export const Tags=model('Tags',TagsSchema);