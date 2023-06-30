const router = require("express").Router();
const cloudinary = require("cloudinary");
const Product = require("../models/productModal");
const authGuard = require("../auth/authGuard");
const Order = require("../models/orderModal");
const userModel = require("../models/userModel");

router.post("/add", authGuard, async (req, res) => {
    console.log(req.body);
    const { productName, productPrice, productCategory, productDescription } = req.body;
    const { productImage } = req.files;
    if (!productName || !productPrice || !productCategory || !productDescription) {
        return res.status(422).json({ error: "Please add all the fields" });
    }

    const uploadedImage = await cloudinary.v2.uploader.upload(
        productImage.path,
        {
            folder: "onlinebazar",
            crop: "scale"
        },
    );


    try {

        const product = new Product({
            name: productName,
            price: productPrice,
            category: productCategory,
            description: productDescription,
            image: uploadedImage.secure_url,
        });

        await product.save();
        res.status(201).json({ message: "Product added successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }


});

// get all products
router.get("/get_products", async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// update product
router.put("/update/:id", authGuard, async (req, res) => {
    console.log(req.files);
    const { productName, productPrice, productCategory, productDescription } = req.body;
    const { productImage } = req.files;

    if (!productName || !productPrice || !productCategory || !productDescription) {
        return res.status(422).json({ error: "Please add all the fields" });
    }

    const uploadedImage = await cloudinary.v2.uploader.upload(
        productImage.path,
        {
            folder: "onlinebazar",
            crop: "scale"
        },
    );

    try {
        const product = await Product.findById(req.params.id);
        product.name = productName;
        product.price = productPrice;
        product.category = productCategory;
        product.description = productDescription;
        product.image = uploadedImage.secure_url;
        await product.save();
        res.status(201).json({ message: "Product updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//  fetch single product
router.get("/get_product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete product
router.delete("/delete/:id", authGuard, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// search product
router.get("/search/:name", async (req, res) => {
    try {
        const products = await Product.find({ name: { $regex: req.params.name, $options: "i" } });
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//  count products, pending orders, delivered orders, users
router.get("/get_counts", async (req, res) => {
    try {
        const productCount = await Product.countDocuments({});
        const pendingOrderCount = await Order.countDocuments({ status: "Pending" });
        const deliveredOrderCount = await Order.countDocuments({ status: "Delivered" });
        const userCount = await userModel.countDocuments({});
        res.status(200).json({ productCount, pendingOrderCount, deliveredOrderCount, userCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});












module.exports = router;

