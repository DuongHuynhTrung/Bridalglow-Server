const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RoleEnum = require("../../enum/RoleEnum");
const { jwtDecode } = require("jwt-decode");

//@desc Register New user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password, fullname, phone_number } = req.body;
    if (email === undefined || password === undefined) {
      res.status(400);
      throw new Error("All field not be empty!");
    }
    const userEmailAvailable = await User.findOne({ email });
    if (userEmailAvailable) {
      res.status(400);
      throw new Error("User has already registered with Email!");
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      fullname,
      phone_number,
      role: RoleEnum.CUSTOMER,
    });

    if (!user) {
      res.status(400);
      throw new Error("User data is not Valid!");
    }
    const accessToken = jwt.sign(
      {
        user: {
          fullname: user.fullname,
          email: user.email,
          roleName: user.role,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        user: {
          fullname: user.fullname,
          email: user.email,
          roleName: user.role,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: "None", //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const loginGoogle = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const googlePayload = jwtDecode(token);
  try {
    const user = await User.findOne({ email: googlePayload.email });
    if (user) {
      if (!user.status) {
        throw new BadRequestException(
          "Tài khoản của bạn đã bị khóa. Hãy liên hệ với admin để mở khóa!"
        );
      }

      const accessToken = jwt.sign(
        {
          user: {
            fullname: user.fullname,
            email: user.email,
            roleName: user.role,
            avatar_url: user.avatar_url,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({ accessToken });
    } else {
      const newUser = await User.create({
        email: googlePayload.email,
        fullname: googlePayload.name,
        avatar_url: googlePayload.picture,
        role: RoleEnum.CUSTOMER,
      });
      if (!newUser) {
        res.status(500);
        throw new Error(
          "Có lỗi xảy ra khi tạo người dùng mới. Vui lòng kiểm tra lại thông tin"
        );
      }

      const accessToken = jwt.sign(
        {
          user: {
            fullname: newUser.fullname,
            email: newUser.email,
            roleName: newUser.role,
            avatar_url: newUser.avatar_url,
            id: newUser.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.status(200).json({ accessToken });
    }
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Login user
//@route POST /api/auth/login
//@access public
const login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("All field not be empty!");
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error(`User with email ${email} not found`);
    }
    //compare password to hashedPassword
    const matches = await bcrypt.compare(password, user.password);
    if (user && matches) {
      if (!user.status) {
        res.status(401);
        throw new Error(
          "User has already been blocked! Please contact the administrator!"
        );
      }
      const accessToken = jwt.sign(
        {
          user: {
            fullname: user.fullname,
            email: user.email,
            roleName: user.role,
            avatar_url: user.avatar_url,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        {
          user: {
            fullname: user.fullname,
            email: user.email,
            roleName: user.role,
            avatar_url: user.avatar_url,
            id: user.id,
          },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      // Create secure cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: "None", //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
      });

      res.status(200).json({ accessToken });
    } else {
      res.status(401);
      throw new Error("Email or Password is not Valid!");
    }
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res.sendStatus(204);
      throw new Error("No Content!");
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json({ message: "Cookie cleared" });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
};

module.exports = { registerUser, login, loginGoogle, logout };
