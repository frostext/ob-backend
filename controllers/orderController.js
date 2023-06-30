const router = require("express").Router();
const authGuard = require("../auth/authGuard");
const Order = require("../models/orderModal");


router.post("/create", authGuard, async (req, res) => {
  try {
    const { cart, totalAmount, shippingAddress } = req.body;
    console.log(req.body);

    // Create a new order instance
    const order = new Order({
      cart,
      totalAmount,
      shippingAddress,
      user: req.user.id,
    });

    // Save the order to the database
    await order.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// get order by user id
router.get("/getOrdersByUserId", authGuard, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// get all orders
router.get("/getAllOrders", async (req, res) => {
  try {
    const orders = await Order.find({})
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// chnge order status
router.put("/change_status/:id", async (req, res) => {
  // console.log(req.params.id);
  console.log("helo");

  try {
    const order = await Order.findById(req.params.id);
    order.status = req.body.status;
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});





module.exports = router;

