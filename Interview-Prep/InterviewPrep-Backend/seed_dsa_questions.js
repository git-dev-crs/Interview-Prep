import mongoose from "mongoose";
import dotenv from "dotenv";
import Document from "./src/models/Document.js";

dotenv.config();

const questions = [
    // Easy (Rating 1-3)
    { name: "Two Sum", link: "https://leetcode.com/problems/two-sum/", rating: 1 },
    { name: "Best Time to Buy and Sell Stock", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", rating: 1 },
    { name: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", rating: 1 },
    { name: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", rating: 2 },
    { name: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", rating: 2 },
    { name: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", rating: 2 },
    { name: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", rating: 2 },
    { name: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", rating: 3 },
    { name: "Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/", rating: 3 },
    { name: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", rating: 3 },

    // Medium (Rating 4-7)
    { name: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", rating: 4 },
    { name: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", rating: 4 },
    { name: "Find Minimum in Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", rating: 4 },
    { name: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", rating: 5 },
    { name: "3Sum", link: "https://leetcode.com/problems/3sum/", rating: 5 },
    { name: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", rating: 5 },
    { name: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", rating: 6 },
    { name: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", rating: 6 },
    { name: "Word Break", link: "https://leetcode.com/problems/word-break/", rating: 6 },
    { name: "Combination Sum", link: "https://leetcode.com/problems/combination-sum/", rating: 6 },
    { name: "House Robber", link: "https://leetcode.com/problems/house-robber/", rating: 6 },
    { name: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", rating: 6 },
    { name: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", rating: 6 },
    { name: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", rating: 6 },
    { name: "Jump Game", link: "https://leetcode.com/problems/jump-game/", rating: 6 },
    { name: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", rating: 6 },
    { name: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", rating: 6 },

    // Hard (Rating 8-10)
    { name: "Merge k Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", rating: 8 },
    { name: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", rating: 8 },
    { name: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", rating: 8 },
    { name: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", rating: 8 },
    { name: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", rating: 9 },
    { name: "Sliding Window Maximum", link: "https://leetcode.com/problems/sliding-window-maximum/", rating: 9 },
    { name: "Trapping Rain Water", link: "https://leetcode.com/problems/trapping-rain-water/", rating: 9 },
    { name: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", rating: 10 },
    { name: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", rating: 10 },
    { name: "Regular Expression Matching", link: "https://leetcode.com/problems/regular-expression-matching/", rating: 10 }
];

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        // Clear existing? Maybe not, just add. Or duplicate check. 
        // Let's clear to ensure clean state for "best result" given the current state is messy.
        await Document.deleteMany({});
        console.log("Cleared existing documents");

        await Document.insertMany(questions);
        console.log(`Inserted ${questions.length} documents`);

        mongoose.connection.close();
    })
    .catch((err) => console.error(err));
