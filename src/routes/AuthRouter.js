const express = require("express");
const authRouter = express.Router();
const {
  login,
  logout,
  registerUser,
  loginGoogle,
} = require("../app/controllers/AuthController");
const loginLimiter = require("../app/middleware/loginLimiter");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth management API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               fullname:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
authRouter.route("/register").post(registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: All fields must not be empty
 *       401:
 *         description: Email or Password is not Valid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
authRouter.route("/login").post(loginLimiter, login);

/**
 * @swagger
 * /api/auth/loginGoogle:
 *   post:
 *     summary: Login Google user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: All fields must not be empty
 *       401:
 *         description: Email or Password is not Valid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
authRouter.route("/loginGoogle").post(loginLimiter, loginGoogle);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cookie cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       204:
 *         description: No Content (no cookie to clear)
 *       500:
 *         description: Internal Server Error
 */
authRouter.route("/logout").post(logout);

module.exports = authRouter;
