import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get the contents of the homepage
router.get("/homepage", async (req, res) => {
    console.log("GET /api/homepage");
    let collection = await db.collection("homepage");
    let results = await collection.find({})
        .limit(50)
        .toArray();

    res.send(results).status(200);
});

export default router;
