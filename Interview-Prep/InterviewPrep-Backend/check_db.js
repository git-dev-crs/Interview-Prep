import mongoose from "mongoose";
import dotenv from "dotenv";
import Document from "./src/models/Document.js";

dotenv.config();

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        const count = await Document.countDocuments();
        console.log(`JSON_OUTPUT_START`);
        console.log(JSON.stringify({ total: count }));

        if (count > 0) {
            const ratings = await Document.aggregate([
                { $group: { _id: "$rating", count: { $sum: 1 } } }
            ]);
            console.log(JSON.stringify({ ratings }));
        }
        console.log(`JSON_OUTPUT_END`);
        mongoose.connection.close();
    })
    .catch((err) => console.error(err));
