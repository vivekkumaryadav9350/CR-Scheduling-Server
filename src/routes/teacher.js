const express = require("express");
const router = express.Router();

const {
  successResponse,
  errorResponse,
} = require("../utils/apiResponse");

const prismaErrorHandler = require("../utils/prismaErrorHandler");

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
// CREATE TEACHER
// POST /teacher/post
// =====================================================

router.post("/post", async (req, res) => {
  const {
    name,
    email,
    password,
    employeeCode,
  } = req.body;

  try {
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Teacher name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "Teacher email is required"
      );
    }

    if (!password) {
      return errorResponse(
        res,
        400,
        "Teacher password is required"
      );
    }

    if (!employeeCode || !employeeCode.trim()) {
      return errorResponse(
        res,
        400,
        "Employee code is required"
      );
    }

    const teacherName = name.trim();
    const teacherEmail = email.trim().toLowerCase();
    const code = employeeCode.trim();

    const existingEmail = await prisma.teacher.findUnique({
      where: {
        email: teacherEmail,
      },
    });

    if (existingEmail) {
      return errorResponse(
        res,
        409,
        "Teacher email already exists"
      );
    }

    const existingCode = await prisma.teacher.findUnique({
      where: {
        employeeCode: code,
      },
    });

    if (existingCode) {
      return errorResponse(
        res,
        409,
        "Employee code already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const teacher = await prisma.teacher.create({
      data: {
        name: teacherName,
        email: teacherEmail,
        password: hashedPassword,
        employeeCode: code,
      },
    });

    return successResponse(
      res,
      201,
      "Teacher Created Successfully",
      {
        name: teacher.name,
        email: teacher.email,
        employeeCode: teacher.employeeCode,
        isActive: teacher.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ALL TEACHERS
// GET /teacher/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      employeeCode: teacher.employeeCode,
      isActive: teacher.isActive,
    }));

    return successResponse(
      res,
      200,
      "Teachers Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET TEACHER BY ID
// GET /teacher/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid teacher ID"
    );
  }

  try {
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!teacher) {
      return errorResponse(
        res,
        404,
        "Teacher not found"
      );
    }

    return successResponse(
      res,
      200,
      "Teacher Fetched Successfully",
      {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        employeeCode: teacher.employeeCode,
        isActive: teacher.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE TEACHER
// PUT /teacher/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    password,
    employeeCode,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid teacher ID"
    );
  }

  try {
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!teacher) {
      return errorResponse(
        res,
        404,
        "Teacher not found"
      );
    }

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Teacher name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "Teacher email is required"
      );
    }

    if (!employeeCode || !employeeCode.trim()) {
      return errorResponse(
        res,
        400,
        "Employee code is required"
      );
    }

    const teacherName = name.trim();
    const teacherEmail = email.trim().toLowerCase();
    const code = employeeCode.trim();

    const existingEmail = await prisma.teacher.findFirst({
      where: {
        email: teacherEmail,

        NOT: {
          id: id,
        },
      },
    });

    if (existingEmail) {
      return errorResponse(
        res,
        409,
        "Teacher email already exists"
      );
    }

    const existingCode = await prisma.teacher.findFirst({
      where: {
        employeeCode: code,

        NOT: {
          id: id,
        },
      },
    });

    if (existingCode) {
      return errorResponse(
        res,
        409,
        "Employee code already exists"
      );
    }

    const data = {
      name: teacherName,
      email: teacherEmail,
      employeeCode: code,

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : teacher.isActive,
    };

    if (password) {
      data.password = await bcrypt.hash(
        password,
        10
      );
    }

    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: id,
      },

      data: data,
    });

    return successResponse(
      res,
      200,
      "Teacher Updated Successfully",
      {
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        employeeCode: updatedTeacher.employeeCode,
        isActive: updatedTeacher.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE TEACHER
// DELETE /teacher/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid teacher ID"
    );
  }

  try {
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!teacher) {
      return errorResponse(
        res,
        404,
        "Teacher not found"
      );
    }

    const deletedTeacher = await prisma.teacher.update({
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
      "Teacher Deleted Successfully",
      {
        name: deletedTeacher.name,
        email: deletedTeacher.email,
        employeeCode: deletedTeacher.employeeCode,
        isActive: deletedTeacher.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;