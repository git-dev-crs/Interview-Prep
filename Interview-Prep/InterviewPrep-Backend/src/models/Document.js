import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
    name: String,
    link: String,
    rating: Number,
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
