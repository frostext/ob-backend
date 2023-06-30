const express = require('express');
const connectDB = require('./database/Database');
const cors = require('cors')
const app = express();

const cloudinary = require("cloudinary");
const multipart = require('connect-multiparty');



// Dotenv Config
require("dotenv").config();

// cors
const corsOptions = {
    origin: true,
    credentials: true,
    openSuccessStatus: 200
};

app.use(cors(corsOptions))
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


// express json
app.use(express.json());
app.use(multipart())


//  create a route
app.post('/', (req, res) => {
    console.log(req.body);
    res.send('Welcome to API');
});

// middleware for user controller
app.use('/api/user', require('./controllers/userControllers'));
app.use('/api/product', require('./controllers/productController'));
app.use('/api/order', require('./controllers/orderController'));


// connect to database
connectDB();

// listen to the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});



