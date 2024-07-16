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

    res.status(200).send(results);
});

// Insert a new document into the homepage collection
router.post("/homepage", async (req, res) => {
    console.log("POST /api/homepage");
    const newHomepageContent = req.body;

    if (!newHomepageContent || !newHomepageContent.banner || !Array.isArray(newHomepageContent.products)) {
        return res.status(400).send({ error: "Invalid homepage content format" });
    }

    try {
        let collection = await db.collection("homepage");
        const result = await collection.insertOne(newHomepageContent);

        res.status(201).send(result.ops[0]);
    } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).send({ error: "Error inserting document" });
    }
});

export default router;
