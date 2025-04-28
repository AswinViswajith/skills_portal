  const jwt = require("jsonwebtoken");
  const { OAuth2Client } = require("google-auth-library");
  const User = require("../models/User");
  const MasterUser = require("../models/MasterUser");

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const JWT_SECRET = process.env.JWT_SECRET;

  exports.googleSignIn = async (req, res) => {
    const { token } = req.body;
    console.log(token);
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub, email, name, picture } = payload;

      let user = await User.findOne({ googleId: sub });
      if (!user) {
        const master = await MasterUser.findOne({ email: email });
        if (master) {
          user = await User.create({
            googleId: sub,
            email,
            name,
            picture,
            userType: master.userType,
            department: master.department,
            batchYear: master.batchYear,
          });
        } else {
          user = await User.create({
            googleId: sub,
            email,
            name,
            picture,
            userType: "student",
            department: "",
            batch: "0000",
          });
        }
      }

      const jwtToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      // console.log("jwt token:", jwtToken);
      // console.log("user:", user);

      res.json({ token: jwtToken, user });
    } catch (error) {
      console.error("Error verifying Google token:", error);
      res.status(401).json({ message: "Invalid Google token" });
    }
  };

  exports.validateToken = (req, res) => {
    const { token } = req.body;
    console.log("validate token:", token);

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }


    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, user: decoded });
      console.log("Token verified:", decoded);
    } catch (error) {
      res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
  };
