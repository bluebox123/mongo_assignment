import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get the contents of the homepage
router.get("/homepage", async (req, res) => {
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

// Get product details by ID
router.get("/products/:id", async (req, res) => {
    const productId = req.params.id;

    try {
        let collection = await db.collection("homepage");
        const homepageContent = await collection.findOne({});
        if (!homepageContent || !Array.isArray(homepageContent.products)) {
            return res.status(404).send({ error: "Homepage content not found" });
        }

        const product = homepageContent.products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send({ error: "Product not found" });
        }

        res.status(200).send(product);
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send({ error: "Error fetching product details" });
    }
});

// Add product to cart
router.post("/cart", async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).send({ error: "Invalid product ID or quantity" });
    }

    try {
        const collection = await db.collection("homepage");
        const homepageContent = await collection.findOne({});
        if (!homepageContent || !Array.isArray(homepageContent.products)) {
            return res.status(404).send({ error: "Homepage content not found" });
        }

        const product = homepageContent.products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send({ error: "Product not found" });
        }

        // Check if the cart exists
        const cartCollection = await db.collection("cart");
        let cart = await cartCollection.findOne({});

        if (!cart) {
            // If the cart is null or not defined, create a new cart object
            cart = {
                products: []
            };
        }

        // Check if the product already exists in the cart
        const existingProduct = cart.products.find(p => p.productId === productId);
        if (existingProduct) {
            // If the product exists, update its quantity
            existingProduct.quantity += quantity;
        } else {
            // If the product does not exist, add it to the cart
            cart.products.push({
                productId: product.id,
                quantity: quantity,
                addedAt: new Date()
            });
        }

        // Save the updated cart back to the database
        await cartCollection.updateOne({}, { $set: cart }, { upsert: true });

        res.status(201).send(cart);
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send({ error: "Error adding product to cart" });
    }
});


// Remove product from cart
router.delete("/cart/:productId", async (req, res) => {
    const productId = req.params.productId;

    try {
        const cartCollection = await db.collection("cart");
        const result = await cartCollection.updateOne(
            {},
            { $pull: { products: { productId: productId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send({ error: "Product not found in cart" });
        }

        res.status(200).send({ message: "Product removed from cart" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).send({ error: "Error removing product from cart" });
    }
});


// Update product quantity in cart
router.put("/cart/:productId", async (req, res) => {
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).send({ error: "Invalid quantity" });
    }

    try {
        const cartCollection = await db.collection("cart");
        const result = await cartCollection.updateOne(
            { "products.productId": productId },
            { $set: { "products.$.quantity": quantity } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: "Product not found in cart" });
        }

        res.status(200).send({ message: "Product quantity updated in cart" });
    } catch (error) {
        console.error("Error updating product quantity in cart:", error);
        res.status(500).send({ error: "Error updating product quantity in cart" });
    }
});


// Get current state of the cart
router.get("/cart", async (req, res) => {
    try {
        const cartCollection = await db.collection("cart");
        const cart = await cartCollection.findOne({});

        if (!cart || cart.products.length === 0) {
            return res.status(200).send({ products: [], totalItems: 0, totalPrice: 0 });
        }

        const collection = await db.collection("homepage");
        const homepageContent = await collection.findOne({});

        if (!homepageContent || !Array.isArray(homepageContent.products)) {
            return res.status(404).send({ error: "Homepage content not found" });
        }

        let totalItems = 0;
        let totalPrice = 0;

        const cartProducts = cart.products.map(item => {
            const product = homepageContent.products.find(p => p.id === item.productId);
            if (product) {
                totalItems += item.quantity;
                totalPrice += item.quantity * product.price;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    addedAt: item.addedAt,
                    product: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        imageUrl: product.imageUrl
                    }
                };
            }
        }).filter(Boolean); // Remove any undefined items

        res.status(200).send({ products: cartProducts, totalItems, totalPrice });
    } catch (error) {
        console.error("Error fetching cart state:", error);
        res.status(500).send({ error: "Error fetching cart state" });
    }
});


export default router;
