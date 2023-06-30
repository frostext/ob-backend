const jwt = require('jsonwebtoken');

const authGuard = (req, res, next) => {
  
 // destructuring header from request 
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  // if header is not present in request
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

    // if header is present, split it into two parts
  const token = authHeader.split(' ')[1];

    // if token is not present in header
  if (!token) {
    return res.status(401).json({ error: 'Token not found in authorization header' });
  }

  // if token is present, verify it
  try {
    console.log(token);
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    // check if user is admin
    if (decodedUser.isAdmin) {
      req.user = decodedUser;
      next();
    }
  } catch (err) {
    return res.status(401).json({ error: err });
  }
};

module.exports = authGuard;
