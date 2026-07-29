import mongoose from "mongoose";
import dotenv from "dotenv";
import Document from "./src/models/Document.js";

dotenv.config();

/**
 * Structured DSA roadmap (NeetCode-150-style), grouped by topic in learning order.
 * Each entry: [name, difficulty, leetcode-slug]. The script derives the full link,
 * a global `order`, and a legacy `rating` (Easy=2, Medium=5, Hard=8) so the older
 * rating-based flow keeps working.
 */
const ROADMAP = [
    ["Arrays & Hashing", [
        ["Contains Duplicate", "Easy", "contains-duplicate"],
        ["Valid Anagram", "Easy", "valid-anagram"],
        ["Two Sum", "Easy", "two-sum"],
        ["Group Anagrams", "Medium", "group-anagrams"],
        ["Top K Frequent Elements", "Medium", "top-k-frequent-elements"],
        ["Product of Array Except Self", "Medium", "product-of-array-except-self"],
        ["Valid Sudoku", "Medium", "valid-sudoku"],
        ["Longest Consecutive Sequence", "Medium", "longest-consecutive-sequence"],
    ]],
    ["Two Pointers", [
        ["Valid Palindrome", "Easy", "valid-palindrome"],
        ["Two Sum II - Input Array Is Sorted", "Medium", "two-sum-ii-input-array-is-sorted"],
        ["3Sum", "Medium", "3sum"],
        ["Container With Most Water", "Medium", "container-with-most-water"],
        ["Trapping Rain Water", "Hard", "trapping-rain-water"],
    ]],
    ["Sliding Window", [
        ["Best Time to Buy and Sell Stock", "Easy", "best-time-to-buy-and-sell-stock"],
        ["Longest Substring Without Repeating Characters", "Medium", "longest-substring-without-repeating-characters"],
        ["Longest Repeating Character Replacement", "Medium", "longest-repeating-character-replacement"],
        ["Permutation in String", "Medium", "permutation-in-string"],
        ["Minimum Window Substring", "Hard", "minimum-window-substring"],
        ["Sliding Window Maximum", "Hard", "sliding-window-maximum"],
    ]],
    ["Stack", [
        ["Valid Parentheses", "Easy", "valid-parentheses"],
        ["Min Stack", "Medium", "min-stack"],
        ["Evaluate Reverse Polish Notation", "Medium", "evaluate-reverse-polish-notation"],
        ["Generate Parentheses", "Medium", "generate-parentheses"],
        ["Daily Temperatures", "Medium", "daily-temperatures"],
        ["Car Fleet", "Medium", "car-fleet"],
        ["Largest Rectangle in Histogram", "Hard", "largest-rectangle-in-histogram"],
    ]],
    ["Binary Search", [
        ["Binary Search", "Easy", "binary-search"],
        ["Search a 2D Matrix", "Medium", "search-a-2d-matrix"],
        ["Koko Eating Bananas", "Medium", "koko-eating-bananas"],
        ["Find Minimum in Rotated Sorted Array", "Medium", "find-minimum-in-rotated-sorted-array"],
        ["Search in Rotated Sorted Array", "Medium", "search-in-rotated-sorted-array"],
        ["Time Based Key-Value Store", "Medium", "time-based-key-value-store"],
        ["Median of Two Sorted Arrays", "Hard", "median-of-two-sorted-arrays"],
    ]],
    ["Linked List", [
        ["Reverse Linked List", "Easy", "reverse-linked-list"],
        ["Merge Two Sorted Lists", "Easy", "merge-two-sorted-lists"],
        ["Linked List Cycle", "Easy", "linked-list-cycle"],
        ["Reorder List", "Medium", "reorder-list"],
        ["Remove Nth Node From End of List", "Medium", "remove-nth-node-from-end-of-list"],
        ["Copy List with Random Pointer", "Medium", "copy-list-with-random-pointer"],
        ["Add Two Numbers", "Medium", "add-two-numbers"],
        ["Find the Duplicate Number", "Medium", "find-the-duplicate-number"],
        ["LRU Cache", "Medium", "lru-cache"],
        ["Merge k Sorted Lists", "Hard", "merge-k-sorted-lists"],
        ["Reverse Nodes in k-Group", "Hard", "reverse-nodes-in-k-group"],
    ]],
    ["Trees", [
        ["Invert Binary Tree", "Easy", "invert-binary-tree"],
        ["Maximum Depth of Binary Tree", "Easy", "maximum-depth-of-binary-tree"],
        ["Diameter of Binary Tree", "Easy", "diameter-of-binary-tree"],
        ["Balanced Binary Tree", "Easy", "balanced-binary-tree"],
        ["Same Tree", "Easy", "same-tree"],
        ["Subtree of Another Tree", "Easy", "subtree-of-another-tree"],
        ["Lowest Common Ancestor of a Binary Search Tree", "Medium", "lowest-common-ancestor-of-a-binary-search-tree"],
        ["Binary Tree Level Order Traversal", "Medium", "binary-tree-level-order-traversal"],
        ["Binary Tree Right Side View", "Medium", "binary-tree-right-side-view"],
        ["Count Good Nodes in Binary Tree", "Medium", "count-good-nodes-in-binary-tree"],
        ["Validate Binary Search Tree", "Medium", "validate-binary-search-tree"],
        ["Kth Smallest Element in a BST", "Medium", "kth-smallest-element-in-a-bst"],
        ["Construct Binary Tree from Preorder and Inorder Traversal", "Medium", "construct-binary-tree-from-preorder-and-inorder-traversal"],
        ["Binary Tree Maximum Path Sum", "Hard", "binary-tree-maximum-path-sum"],
        ["Serialize and Deserialize Binary Tree", "Hard", "serialize-and-deserialize-binary-tree"],
    ]],
    ["Tries", [
        ["Implement Trie (Prefix Tree)", "Medium", "implement-trie-prefix-tree"],
        ["Design Add and Search Words Data Structure", "Medium", "design-add-and-search-words-data-structure"],
        ["Word Search II", "Hard", "word-search-ii"],
    ]],
    ["Heap / Priority Queue", [
        ["Kth Largest Element in a Stream", "Easy", "kth-largest-element-in-a-stream"],
        ["Last Stone Weight", "Easy", "last-stone-weight"],
        ["K Closest Points to Origin", "Medium", "k-closest-points-to-origin"],
        ["Kth Largest Element in an Array", "Medium", "kth-largest-element-in-an-array"],
        ["Task Scheduler", "Medium", "task-scheduler"],
        ["Design Twitter", "Medium", "design-twitter"],
        ["Find Median from Data Stream", "Hard", "find-median-from-data-stream"],
    ]],
    ["Backtracking", [
        ["Subsets", "Medium", "subsets"],
        ["Combination Sum", "Medium", "combination-sum"],
        ["Permutations", "Medium", "permutations"],
        ["Subsets II", "Medium", "subsets-ii"],
        ["Combination Sum II", "Medium", "combination-sum-ii"],
        ["Word Search", "Medium", "word-search"],
        ["Palindrome Partitioning", "Medium", "palindrome-partitioning"],
        ["Letter Combinations of a Phone Number", "Medium", "letter-combinations-of-a-phone-number"],
        ["N-Queens", "Hard", "n-queens"],
    ]],
    ["Graphs", [
        ["Number of Islands", "Medium", "number-of-islands"],
        ["Max Area of Island", "Medium", "max-area-of-island"],
        ["Clone Graph", "Medium", "clone-graph"],
        ["Rotting Oranges", "Medium", "rotting-oranges"],
        ["Pacific Atlantic Water Flow", "Medium", "pacific-atlantic-water-flow"],
        ["Surrounded Regions", "Medium", "surrounded-regions"],
        ["Course Schedule", "Medium", "course-schedule"],
        ["Course Schedule II", "Medium", "course-schedule-ii"],
        ["Redundant Connection", "Medium", "redundant-connection"],
        ["Word Ladder", "Hard", "word-ladder"],
    ]],
    ["Advanced Graphs", [
        ["Network Delay Time", "Medium", "network-delay-time"],
        ["Cheapest Flights Within K Stops", "Medium", "cheapest-flights-within-k-stops"],
        ["Min Cost to Connect All Points", "Medium", "min-cost-to-connect-all-points"],
        ["Reconstruct Itinerary", "Hard", "reconstruct-itinerary"],
        ["Swim in Rising Water", "Hard", "swim-in-rising-water"],
    ]],
    ["1-D Dynamic Programming", [
        ["Climbing Stairs", "Easy", "climbing-stairs"],
        ["Min Cost Climbing Stairs", "Easy", "min-cost-climbing-stairs"],
        ["House Robber", "Medium", "house-robber"],
        ["House Robber II", "Medium", "house-robber-ii"],
        ["Longest Palindromic Substring", "Medium", "longest-palindromic-substring"],
        ["Palindromic Substrings", "Medium", "palindromic-substrings"],
        ["Decode Ways", "Medium", "decode-ways"],
        ["Coin Change", "Medium", "coin-change"],
        ["Maximum Product Subarray", "Medium", "maximum-product-subarray"],
        ["Word Break", "Medium", "word-break"],
        ["Longest Increasing Subsequence", "Medium", "longest-increasing-subsequence"],
        ["Partition Equal Subset Sum", "Medium", "partition-equal-subset-sum"],
    ]],
    ["2-D Dynamic Programming", [
        ["Unique Paths", "Medium", "unique-paths"],
        ["Longest Common Subsequence", "Medium", "longest-common-subsequence"],
        ["Best Time to Buy and Sell Stock with Cooldown", "Medium", "best-time-to-buy-and-sell-stock-with-cooldown"],
        ["Coin Change II", "Medium", "coin-change-ii"],
        ["Target Sum", "Medium", "target-sum"],
        ["Interleaving String", "Medium", "interleaving-string"],
        ["Edit Distance", "Medium", "edit-distance"],
        ["Longest Increasing Path in a Matrix", "Hard", "longest-increasing-path-in-a-matrix"],
        ["Distinct Subsequences", "Hard", "distinct-subsequences"],
        ["Burst Balloons", "Hard", "burst-balloons"],
        ["Regular Expression Matching", "Hard", "regular-expression-matching"],
    ]],
    ["Greedy", [
        ["Maximum Subarray", "Medium", "maximum-subarray"],
        ["Jump Game", "Medium", "jump-game"],
        ["Jump Game II", "Medium", "jump-game-ii"],
        ["Gas Station", "Medium", "gas-station"],
        ["Hand of Straights", "Medium", "hand-of-straights"],
        ["Merge Triplets to Form Target Triplet", "Medium", "merge-triplets-to-form-target-triplet"],
        ["Partition Labels", "Medium", "partition-labels"],
        ["Valid Parenthesis String", "Medium", "valid-parenthesis-string"],
    ]],
    ["Intervals", [
        ["Insert Interval", "Medium", "insert-interval"],
        ["Merge Intervals", "Medium", "merge-intervals"],
        ["Non-overlapping Intervals", "Medium", "non-overlapping-intervals"],
        ["Minimum Interval to Include Each Query", "Hard", "minimum-interval-to-include-each-query"],
    ]],
    ["Math & Geometry", [
        ["Plus One", "Easy", "plus-one"],
        ["Happy Number", "Easy", "happy-number"],
        ["Rotate Image", "Medium", "rotate-image"],
        ["Spiral Matrix", "Medium", "spiral-matrix"],
        ["Set Matrix Zeroes", "Medium", "set-matrix-zeroes"],
        ["Pow(x, n)", "Medium", "powx-n"],
        ["Multiply Strings", "Medium", "multiply-strings"],
        ["Detect Squares", "Medium", "detect-squares"],
    ]],
    ["Bit Manipulation", [
        ["Single Number", "Easy", "single-number"],
        ["Number of 1 Bits", "Easy", "number-of-1-bits"],
        ["Counting Bits", "Easy", "counting-bits"],
        ["Reverse Bits", "Easy", "reverse-bits"],
        ["Missing Number", "Easy", "missing-number"],
        ["Sum of Two Integers", "Medium", "sum-of-two-integers"],
        ["Reverse Integer", "Medium", "reverse-integer"],
    ]],
];

const RATING_BY_DIFFICULTY = { Easy: 2, Medium: 5, Hard: 8 };

// Flatten to documents with global order + legacy rating.
const docs = [];
let order = 1;
for (const [topic, problems] of ROADMAP) {
    for (const [name, difficulty, slug] of problems) {
        docs.push({
            name,
            link: `https://leetcode.com/problems/${slug}/`,
            difficulty,
            topic,
            order: order++,
            rating: RATING_BY_DIFFICULTY[difficulty] || 5,
        });
    }
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        await Document.deleteMany({}); // clean reseed
        const inserted = await Document.insertMany(docs);
        const byDiff = inserted.reduce((acc, d) => ((acc[d.difficulty] = (acc[d.difficulty] || 0) + 1), acc), {});
        console.log(`Seeded ${inserted.length} problems across ${ROADMAP.length} topics.`);
        console.log("By difficulty:", byDiff);
        await mongoose.disconnect();
        console.log("Done.");
    })
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    });
