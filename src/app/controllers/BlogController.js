const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");

const getAllBlogs = asyncHandler(async (req, res, next) => {
  try {
    let blogs = await Blog.find().exec();
    if (!blogs) {
      res.status(400);
      throw new Error("Có lỗi xảy ra khi truy xuất danh sách blog");
    }
    res.status(200).json(blogs);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const getBlogById = asyncHandler(async (req, res, next) => {
  try {
    const { blog_id } = req.params;
    let blog = await Blog.findById(blog_id).exec();
    if (!blog) {
      res.status(400);
      throw new Error("Không tìm thấy blog với ID đã cho");
    }
    res.status(200).json(blog);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const createBlog = asyncHandler(async (req, res, next) => {
  try {
    const { title, type, content, category, representative_img } = req.body;
    const blog = new Blog({
      title,
      type,
      content,
      category,
      representative_img,
    });
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const updateBlogById = asyncHandler(async (req, res, next) => {
  try {
    const { blog_id } = req.params;
    const updatedBlog = await Blog.findByIdAndUpdate(blog_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updatedBlog) {
      res.status(400);
      throw new Error("Không tìm thấy blog để cập nhật");
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const deleteBlogById = asyncHandler(async (req, res, next) => {
  try {
    const { blog_id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(blog_id).exec();
    if (!deletedBlog) {
      res.status(400);
      throw new Error("Không tìm thấy blog để xóa");
    }
    res.status(200).json(deletedBlog);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogById,
  deleteBlogById,
};
