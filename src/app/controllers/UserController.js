const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment/moment");
const RoleEnum = require("../../enum/RoleEnum");

//@desc Get all users
//@route GET /api/users
//@access private
const getUsers = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.roleName !== RoleEnum.ADMIN) {
      res.status(403);
      throw new Error(
        "Chỉ có Admin có quyền truy xuất thông tin tất cả tài khoản khách hàng"
      );
    }
    let users = await User.find({ role: RoleEnum.CUSTOMER }).exec();
    if (!users) {
      res.status(400);
      throw new Error(
        "Có lỗi xảy ra khi Admin truy xuất thông tin tất cả tài khoản khách hàng"
      );
    }
    res.status(200).json(users);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Get all users
//@route GET /api/users
//@access private
const getArtists = asyncHandler(async (req, res, next) => {
  try {
    let users = await User.find({ role: RoleEnum.ARTIST }).exec();
    if (!users) {
      res.status(400);
      throw new Error(
        "Có lỗi xảy ra khi Admin truy xuất thông tin tất cả tài khoản thợ trang điểm"
      );
    }
    res.status(200).json(users);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Get all users
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found!");
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Get user
//@route GET /api/users/:id
//@access private
const getUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) {
      res.status(404);
      throw new Error("User Not Found!");
    }
    const userEmail = user.email;
    if (
      !(req.user.email === userEmail || req.user.roleName === RoleEnum.ADMIN)
    ) {
      res.status(403);
      throw new Error("You don't have permission to get user's profile");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(res.statusCode).send(error.message || "Internal Server Error");
  }
});

//@desc Update user
//@route PUT /api/users/:id
//@access private
const updateUsers = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User Not Found!");
    }

    if (req.user.email !== user.email) {
      res.status(403);
      throw new Error("You don't have permission to update user's profile");
    }

    const {
      fullname,
      avatar_url,
      dob,
      phone_number,
      gender,
      description,
      achivements,
      fanpage,
      experience,
      makeup_img_list,
    } = req.body;
    if (user.phone_number && phone_number != undefined) {
      const checkExistPhone = await User.findOne({
        phone_number: phone_number,
      });
      if (
        checkExistPhone &&
        checkExistPhone._id.toString() !== req.user.id.toString()
      ) {
        res.status(400);
        throw new Error("Số điện thoại đã tồn tại!");
      }
    }
    const updateFields = {
      fullname: fullname !== undefined ? fullname : user.fullname,
      avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url,
      dob: dob !== undefined ? dob : user.dob,
      gender: gender !== undefined ? gender : user.gender,
      phone_number:
        phone_number !== undefined ? phone_number : user.phone_number,
      description: description !== undefined ? description : user.description,
      achivements: achivements !== undefined ? achivements : user.achivements,
      fanpage: fanpage !== undefined ? fanpage : user.fanpage,
      experience: experience !== undefined ? experience : user.experience,
      makeup_img_list:
        makeup_img_list !== undefined ? makeup_img_list : user.makeup_img_list,
    };

    const updateUser = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
    });

    res.status(200).json(updateUser);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Delete user
//@route DELETE /api/users/:id
//@access private
const deleteUsers = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User Not Found!");
    }
    if (req.user.roleName !== RoleEnum.ADMIN) {
      res.status(403);
      throw new Error("You don't have permission to update user's profile");
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json(user);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Delete user no auth
//@route DELETE /api/users/:id
//@access public
const deleteUsersNoAuth = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User Not Found!");
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json(user);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc User change password
//@route GET /api/users/checkOldPassword/:id
//@access private
const checkOldPassword = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const { password } = req.body;
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      res.status(401);
      throw new Error("Old password is incorrect");
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc User change password
//@route GET /api/users/changePassword/:id
//@access private
const changePassword = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not Found!");
    }
    if (req.user.id !== id) {
      res.status(403);
      throw new Error("You don't have permission to change other password!");
    }
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      res.status(400);
      throw new Error("All field not be empty!");
    }
    if (password !== confirmPassword) {
      res.status(400);
      throw new Error("Password and confirm password are different!");
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      res.status(500);
      throw new Error(
        "Something when wrong in hashPassword of changePassword function!"
      );
    }
    const updatePassword = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      { new: true }
    );
    if (!updatePassword) {
      res.status(500);
      throw new Error("Something when wrong in changePassword");
    }
    res.status(200).json(updatePassword);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const statisticsAccountByStatus = asyncHandler(async (req, res) => {
  try {
    const accounts = await User.find({ role: RoleEnum.CUSTOMER });
    if (!accounts || accounts.length === 0) {
      return null;
    }

    const tmpCountData = {
      Active: 0,
      InActive: 0,
    };

    accounts.forEach((account) => {
      if (account.status) {
        tmpCountData["Active"] = tmpCountData["Active"] + 1;
      } else {
        tmpCountData["InActive"] = tmpCountData["InActive"] + 1;
      }
    });

    const result = Object.keys(tmpCountData).map((key) => ({
      key,
      value: tmpCountData[key],
    }));
    res.status(200).json(result);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const searchAccountByEmail = asyncHandler(async (req, res, next) => {
  try {
    const searchEmail = req.query.searchEmail;
    if (!searchEmail || searchEmail === undefined) {
      res.status(400);
      throw new Error("Không được để trống thông tin yêu cầu");
    }
    let users = await User.find({
      email: { $regex: searchEmail, $options: "i" },
      role: RoleEnum.CUSTOMER,
    });
    if (!users) {
      res.status(500);
      throw new Error("Có lỗi xảy ra khi tìm kiếm tài khoản theo email");
    }
    res.json(users);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const banAccountByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { account_id } = req.params;
    const user = await User.findById(account_id).exec();
    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy tài khoản!");
    }
    if (user.role === RoleEnum.ADMIN) {
      res.status(400);
      throw new Error("Không thể khóa tài khoản admin");
    }
    if (!user.status) {
      res.status(400);
      throw new Error("Tài khoản đang bị khóa");
    }
    user.status = false;
    const result = await user.save();
    if (!result) {
      res.status(500);
      throw new Error("Có lỗi xảy ra khi khóa tài khoản");
    }
    res.status(200).json(result);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const unBanAccountByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { account_id } = req.params;
    const user = await User.findById(account_id).exec();
    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy tài khoản!");
    }
    if (user.role === RoleEnum.ADMIN) {
      res.status(400);
      throw new Error("Không thể khóa tài khoản admin");
    }
    if (user.status) {
      res.status(400);
      throw new Error("Tài khoản không bị khóa");
    }
    user.status = true;
    const result = await user.save();
    if (!result) {
      res.status(500);
      throw new Error("Có lỗi xảy ra khi khóa tài khoản");
    }
    res.status(200).json(result);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const updateUserInfoForAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  const { password } = req.body;
  if (password) {
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  await user.save();
  res.status(200).json(user);
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      res.status(404);
      throw new Error("Email invalid");
    }
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    user.otpExpired = new Date();
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password OTP",
      html: `<body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe
                UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
                <div style="width:50vw; margin: 0 auto">
                  
                    <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                        width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;margin-bottom: 25px;">
                                        Xin chào
                                        <a style="font-size:16px;line-height:22px;margin:16px 0;font-weight: bold;">${
                                          user.fullname
                                        },</a>
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Bạn vừa yêu cầu nhận mã OTP để xác thực đăng nhập/tài khoản. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:
                                    </p>

                                    <div style="margin-left: 25px;">

                                        <p style="font-size:14px;line-height:22px;margin:10px 0px 0px 0px;color:#3c4043">MÃ OTP:
                                            <a style=" font-weight:bold;text-decoration:none;font-size:14px;line-height:22px">
                                                ${otp}
                                            </a>
                                        </p>
                                    </div>
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Mã OTP này có hiệu lực trong vòng ${10} phút. Vui lòng Không chia sẻ mã này với bất kỳ ai vì lý do bảo mật.
                                        Nếu bạn không yêu cầu mã này, hãy bỏ qua email hoặc liên hệ ngay với chúng tôi để được hỗ trợ.
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                                    </p>
                                    
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Trân trọng,</p>
                                    <p
                                        style="font-weight:bold;font-size:16px;line-height:22px;margin:16px 0px 0px 0px;color:#3c4043">
                                        BRIDAL GLOW</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </body>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    res.status(200).json("OTP sent to email");
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(404);
      throw new Error("Invalid email or otp");
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.otp.toString() !== otp) {
      res.status(400);
      throw new Error("Wrong OTP! Please try again");
    }
    const currentTime = moment(new Date());
    const otpExpired = moment(user.otpExpired);
    const isExpired = currentTime.diff(otpExpired, "minutes");
    if (isExpired > 10) {
      res.status(400);
      throw new Error("OTP is expired! Please try again");
    }
    const newPassword = Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
      },
      { new: true }
    );
    if (!updateUser) {
      res.status(500);
      throw new Error(
        "Something went wrong when updating new password in reset password!"
      );
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Thông tin đăng nhập mới",
      html: `<body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe
                UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
                <div style="width:50vw; margin: 0 auto">
                  
                    <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                        width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;margin-bottom: 25px;">
                                        Xin chào
                                        <a style="font-size:16px;line-height:22px;margin:16px 0;font-weight: bold;">${user.fullname},</a>
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ phía bạn. Vui lòng không chia sẻ thông tin
                                        đăng nhập này với bất
                                        kỳ ai. Chúng tôi không bao giờ yêu cầu thông tin đăng nhập qua email hoặc các phương tiện
                                        khác ngoài trang web chính thức của chúng tôi. Dưới đây là
                                        thông tin cần thiết để bạn có thể đăng nhập vào hệ thống:
                                    </p>

                                    <div style="margin-left: 25px;">
                                        <p style="font-size:14px;line-height:22px;margin:10px 0;color:#3c4043">EMAIL:
                                            <a style="font-weight:bold;text-decoration:none;font-size:14px;line-height:22px">
                                                ${user.email}
                                            </a>
                                        </p>
                                        <p style="font-size:14px;line-height:22px;margin:10px 0px 0px 0px;color:#3c4043">MẬT KHẨU
                                            MỚI:
                                            <a style=" font-weight:bold;text-decoration:none;font-size:14px;line-height:22px">
                                                ${newPassword}
                                            </a>
                                        </p>
                                    </div>
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Để đảm bảo tính bảo mật, chúng tôi khuyến nghị bạn đổi mật khẩu sau khi đăng nhập lần đầu
                                        tiên. Nếu bạn không thực hiện yêu cầu này, vui lòng thông báo cho chúng tôi ngay lập tức.
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Nếu có bất kỳ câu hỏi hoặc vấn đề gì, đừng ngần ngại liên hệ với chúng tôi qua địa chỉ email
                                        này.
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                        Chúng tôi rất cảm ơn sự hợp tác của bạn.
                                    </p>
                                    <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Trân trọng,</p>
                                    <p
                                        style="font-weight:bold;font-size:16px;line-height:22px;margin:16px 0px 0px 0px;color:#3c4043">
                                        BRIDAL GLOW</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </body>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    res.status(200).json("Reset password successfully");
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const upMembershipByAccountBalance = asyncHandler(async (req, res) => {
  try {
    const { user_id, membership, amount } = req.body;
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng");
    }
    if (user.account_balance < amount) {
      res.status(400);
      throw new Error("Số dư tài khoản không đủ để nâng cấp gói thành viên");
    }
    user.membership = membership;
    user.account_balance -= amount;
    await user.save();

    // Create Notification
    const notification = new Notification({
      receiver_id: user_id,
      noti_describe: `Chúc mừng! Tài khoản của bạn đã được nâng cấp thành công lên gói thành viên ${membership}`,
      noti_title: "Tài khoản của bạn đã được nâng cấp",
      noti_type: NotificationTypeEnum.UP_MEMBERSHIP,
    });
    await notification.save();

    _io.emit(`new-noti-${user_id}`, notification);
    _io.emit(`user-info-${user_id}`, user);

    res.status(200).json(user);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

//@desc Get user
//@route GET /api/users/:id
//@access private
const upRoleArtistByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id).exec();
    if (!user) {
      res.status(404);
      throw new Error("User Not Found!");
    }
    user.role = RoleEnum.ARTIST;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(res.statusCode).send(error.message || "Internal Server Error");
  }
});

module.exports = {
  getUsers,
  getArtists,
  getUserById,
  updateUsers,
  deleteUsers,
  deleteUsersNoAuth,
  currentUser,
  checkOldPassword,
  changePassword,
  statisticsAccountByStatus,
  searchAccountByEmail,
  banAccountByAdmin,
  unBanAccountByAdmin,
  updateUserInfoForAdmin,
  forgotPassword,
  resetPassword,
  upMembershipByAccountBalance,
  upRoleArtistByAdmin,
};
