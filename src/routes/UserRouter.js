const express = require("express");
const bodyParser = require("body-parser");
const userRouter = express.Router();
userRouter.use(bodyParser.json());
const {
  getUsers,
  getUserById,
  updateUsers,
  deleteUsers,
  currentUser,
  changePassword,
  checkOldPassword,
  statisticsAccountByStatus,
  searchAccountByEmail,
  banAccountByAdmin,
  unBanAccountByAdmin,
  deleteUsersNoAuth,
  updateUserInfoForAdmin,
  forgotPassword,
  resetPassword,
  upMembershipByAccountBalance,
} = require("../app/controllers/UserController");
const {
  validateToken,
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         fullname:
 *           type: string
 *           maxLength: 255
 *           description: "User's full name"
 *         dob:
 *           type: string
 *           format: date
 *           description: "User's date of birth"
 *         email:
 *           type: string
 *           maxLength: 255
 *           description: "User's email address"
 *         phone_number:
 *           type: string
 *           maxLength: 10
 *           description: "User's phone number"
 *         country:
 *           type: string
 *           description: "User's country of residence"
 *         gender:
 *           type: string
 *           description: "User's gender"
 *         password:
 *           type: string
 *           description: "User's password"
 *         avatar_url:
 *           type: string
 *           description: "URL of the user's avatar image"
 *         rank:
 *           type: string
 *           default: "NORMAL"
 *           description: "User's rank (e.g., NORMAL, ADMIN)"
 *         role:
 *           type: string
 *           description: "User's role in the application"
 *         status:
 *           type: boolean
 *           default: true
 *           description: "Indicates if the user account is active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "User account creation timestamp"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "User account last update timestamp"
 */

/**
 * @swagger
 * /api/users/delete-no-auth/{id}:
 *   delete:
 *     summary: Delete user no auth
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.route("/delete-no-auth/:id").delete(deleteUsersNoAuth);

userRouter.use(validateToken);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   put:
 *     summary: Update user info for admin (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 maxLength: 255
 *                 description: "User's full name"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: "User's date of birth"
 *               email:
 *                 type: string
 *                 description: "User's email address"
 *               phone_number:
 *                 type: string
 *                 description: "User's phone number"
 *               country:
 *                 type: string
 *                 description: "User's country of residence"
 *               gender:
 *                 type: string
 *                 description: "User's gender"
 *               password:
 *                 type: string
 *                 description: "User's password"
 *               avatar_url:
 *                 type: string
 *                 description: "URL of the user's avatar image"
 *               rank:
 *                 type: string
 *                 description: "User's ranlk (e.g., Normal, Premium)"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.route("/admin/:id").put(validateTokenAdmin, updateUserInfoForAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 maxLength: 255
 *                 description: "User's full name"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: "User's date of birth"
 *               country:
 *                 type: string
 *                 description: "User's country of residence"
 *               gender:
 *                 type: string
 *                 description: "User's gender"
 *               avatar_url:
 *                 type: string
 *                 description: "URL of the user's avatar image"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.route("/").get(getUsers).put(updateUsers);

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get current user's information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's information
 *       404:
 *         description: User not found
 */
userRouter.get("/current", currentUser);

/**
 * @swagger
 * /api/users/statisticsAccount:
 *   get:
 *     summary: Get account statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account statistics
 *       403:
 *         description: Forbidden
 */
userRouter
  .route("/statisticsAccount")
  .get(validateTokenAdmin, statisticsAccountByStatus);

/**
 * @swagger
 * /api/users/searchAccountByEmail:
 *   get:
 *     summary: Search accounts by email (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: Email to search for
 *     responses:
 *       200:
 *         description: List of matching accounts
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 */
userRouter
  .route("/searchAccountByEmail")
  .get(validateTokenAdmin, searchAccountByEmail);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.route("/:id").get(getUserById).delete(deleteUsers);

/**
 * @swagger
 * /api/users/checkOldPassword/{id}:
 *   post:
 *     summary: Check old password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Old password is correct
 *       401:
 *         description: Old password is incorrect
 *       404:
 *         description: User not found
 */
userRouter.route("/checkOldPassword/:id").post(checkOldPassword);

/**
 * @swagger
 * /api/users/changePassword/{id}:
 *   put:
 *     summary: Change user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.route("/changePassword/:id").put(changePassword);

/**
 * @swagger
 * /api/users/banAccountByAdmin/{account_id}:
 *   patch:
 *     summary: Ban a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: account_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Account ID to ban
 *     responses:
 *       200:
 *         description: Account banned successfully
 *       400:
 *         description: Cannot ban admin account
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 */
userRouter
  .route("/banAccountByAdmin/:account_id")
  .patch(validateTokenAdmin, banAccountByAdmin);

/**
 * @swagger
 * /api/users/unBanAccountByAdmin/{account_id}:
 *   patch:
 *     summary: UnBan a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: account_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Account ID to unBan
 *     responses:
 *       200:
 *         description: Account unBanned successfully
 *       400:
 *         description: Cannot unBan admin account
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 */
userRouter
  .route("/unBanAccountByAdmin/:account_id")
  .patch(validateTokenAdmin, unBanAccountByAdmin);

userRouter.post("/forgotPassword/:email", forgotPassword);

userRouter.post("/resetPassword", resetPassword);

userRouter.post("/upMembershipByAccountBalance", upMembershipByAccountBalance);

module.exports = userRouter;
