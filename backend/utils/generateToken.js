    import jwt from "jsonwebtoken";

    export const generateToken = (user) => {
      return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
    };

    export default generateToken;

//   import generateToken from "../utils/generateToken.js";
// import User from "../models/User.js";

// // Example login controller
// export const login = async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(401).json({ message: "User not found" });

//   const isMatch = await user.matchPassword(password);
//   if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//   const token = generateToken(user);

//   res.json({
//     token,          // <-- this must be a valid JWT
//     user: {
//       id: user._id,
//       username: user.username,
//       role: user.role,
//     },
//   });
// };

// import jwt from "jsonwebtoken";

// const token = jwt.sign(
//   { id: user._id, role: user.role },
//   process.env.JWT_SECRET,
//   { expiresIn: "1d" }
// );

// res.json({ token, user });
