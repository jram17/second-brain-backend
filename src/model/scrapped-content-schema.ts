import mongoose, { model, Schema } from "mongoose";

const ScrappedSchema = new Schema({
    contentId: {
        type: mongoose.Types.ObjectId,
        ref: 'Content',
        required: true
    },

    author: { type: String },
    title: { type: String },
    publisher: { type: String },
    imageUrl: { type: String },
    originUrl: { type: String },
    url: { type: String },
    description: { type: String },
    logoUrl: { type: String },
});
export const Scrapped = model("Scrapped", ScrappedSchema);