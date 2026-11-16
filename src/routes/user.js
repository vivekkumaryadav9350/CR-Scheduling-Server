
const express = require("express");
const router = express.Router();

const {
  successResponse,
  errorResponse,
} = require("../utils/apiResponse");

const prismaErrorHandler = require("../utils/prismaErrorHandler");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


// =====================================================
// LOGIN
// POST /login
// =====================================================

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return errorResponse(
        res,
        400,
        "Email and password are required"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user || user.isDeleted) {
      return errorResponse(
        res,
        404,
        "User not found"
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        "User account is inactive"
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return errorResponse(
        res,
        401,
        "Invalid Password"
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRETKEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return successResponse(
      res,
      200,
      "Login Successful",
      {
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});


// =====================================================
// REGISTER
// POST /register
// =====================================================

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  try {
    if (!name || !email || !password) {
      return errorResponse(
        res,
        400,
        "Name, email and password are required"
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (existingUser) {
      return errorResponse(
        res,
        409,
        "Email already registered"
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        isActive: true,
      },
    });

    return successResponse(
      res,
      201,
      "User Registered Successfully",
      {
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});


// =====================================================
// UPDATE USER
// PUT /update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    password,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid user ID"
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user || user.isDeleted) {
      return errorResponse(
        res,
        404,
        "User not found"
      );
    }

    const data = {};

    if (name !== undefined) {
      data.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: {
            id: id,
          },
        },
      });

      if (existingUser) {
        return errorResponse(
          res,
          409,
          "Email already registered"
        );
      }

      data.email = normalizedEmail;
    }

    if (password) {
      data.password = await bcrypt.hash(
        password,
        10
      );
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: data,
    });

    return successResponse(
      res,
      200,
      "User Updated Successfully",
      {
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});


// =====================================================
// DELETE USER
// DELETE /delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid user ID"
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user || user.isDeleted) {
      return errorResponse(
        res,
        404,
        "User not found"
      );
    }

    const deletedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });

    return successResponse(
      res,
      200,
      "User Deleted Successfully",
      {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        isActive: deletedUser.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});


module.exports = router;
