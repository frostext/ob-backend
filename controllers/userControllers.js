const router = require("express").Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authGuard = require("../auth/authGuard");
const cloudinary = require("cloudinary");
var nodemailer = require('nodemailer');

// ceate a test route
router.get("/test", (req, res) => {
  console.log(req.headers.authorization)
  res.send("Welcome to user API");
});

// create a route for user registration
router.post("/register", async (req, res) => {

  console.log(req.body);

  // destructuring
  const { fname, lname, email, password } = req.body;

  // validation
  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    //  check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // password hashing using bcrypt
    const salt = await bcrypt.genSaltSync(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a new user
    const newUser = new User({
      fname: fname,
      lname: lname,
      email: email,
      password: passwordHash,
    });

    // save the user
    newUser.save();
    res.json("User registered successfully");
  } catch (error) {
    res.status(500).json("User registration failed");
  }
});

// create a route for user login
router.post("/login", async (req, res) => {
  console.log("login");
  console.log(req.body);

  // destructuring
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    // find user
    const user = await User.findOne({ email });

    // if user does not exists
    if (!user) {
      return res.status(400).json({ msg: "User does not exists" });
    }

    // compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // create a token and send cookie
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send login successful response
    res.json({
      msg: "Login successful",
      token: token,
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// edit user profile fname, lname, email and profile picture
router.put("/update_profile", authGuard, async (req, res) => {
  console.log(req.files);
  const { fname, lname, email } = req.body;
  const { profileImage } = req.files;
  if (!fname || !lname || !email) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  const uploadedImage = await cloudinary.v2.uploader.upload(
    profileImage.path,
    {
      folder: "onlinebazar",
      crop: "scale"
    },
  );

  try {

    if (profileImage) {
      const user = await User.findByIdAndUpdate(req.user.id);
      user.fname = fname;
      user.lname = lname;
      user.email = email;
      user.profilePic = uploadedImage.secure_url;
      user.save();
      res.json(user);
    } else {

      const user = await User.findByIdAndUpdate(req.users.id);
      user.fname = fname;
      user.lname = lname;
      user.email = email;
      user.save();
      res.json(user);
    }

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


// forgot password
router.post("/forgot_password", async (req, res) => {
  
  // destructuring
  const { email } = req.body;

  // validation
  if (!email) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    //  check existing user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exists" });
    }

    // create a token
    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "15m" });

    // create a link
    const link = `http://localhost:5000/api/user/reset-password/${user._id}/${token}`;
    console.log(link);

    // send email through nodemailer
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'onlinebazar535@gmail.com',
        pass: 'jafsnkdzevumcezz'
      }
    });

    var mailOptions = {
      from: 'onlinebazar@gmail.com',
      to: email,
      subject: 'Password Reset Link',
      text: link
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
  } catch (error) {

  }
})

// reset password
router.post("/reset-password/:id/:token", async (req, res) => {
  // get id and token from params
  const { id, token } = req.params;

  // get password from body
  const { password } = req.body;

  // find user
  const oldUser = await User.findOne({ _id: id });
  // if user does not exists
  if (!oldUser) {
    return res.status(400).json({ msg: "User does not exists" });
  }
  // create a secret
  const secret = process.env.JWT_SECRET + oldUser.password;
  try {
    jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: id }, { $set: { password: encryptedPassword } });
    return res.status(200).json({ msg: "Password updated successfully" });

  } catch (error) {
    res.status(500).json("Password reset failed");
  }
})

// update password
router.get("/reset-password/:id/:token", async (req, res) => {
  // get id and token from params
  const { id, token } = req.params;

  // if id or token is not provided
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.status(400).json({ msg: "User does not exists" });
  }

  // verify token
  const secret = process.env.JWT_SECRET + oldUser.password;
  try {
    // verify token
    const verify = jwt.verify(token, secret);
    // if token is verified
    if (verify) {
      res.render('index', { email: verify.email })
    }

  } catch (error) {
    res.status(500).json("Password reset link not verified");
  }
})




module.exports = router;
