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

        // Simulate user rating
        const rating = 4.93;
        const queryRating = rating - 1;

        console.log(`Testing with User Rating: ${rating}`);
        console.log(`Querying for documents with rating >= ${queryRating}`);

        const documents = await Document.find({ rating: { $gte: queryRating } })
            .limit(10)
            .select("name link rating");

        console.log(`Found ${documents.length} documents.`);
        console.log(documents);

        mongoose.connection.close();
    })
    .catch((err) => console.error(err));
