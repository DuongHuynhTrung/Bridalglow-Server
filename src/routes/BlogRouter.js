const express = require("express");
const blogRouter = express.Router();

const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogById,
  deleteBlogById,
} = require("../app/controllers/BlogController");

const {
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");

blogRouter.get("/", getAllBlogs);
blogRouter.get("/:blog_id", getBlogById);
blogRouter.route("/").post(validateTokenAdmin, createBlog);
blogRouter.put("/:blog_id", validateTokenAdmin, updateBlogById);
blogRouter.delete("/:blog_id", validateTokenAdmin, deleteBlogById);

module.exports = blogRouter;
