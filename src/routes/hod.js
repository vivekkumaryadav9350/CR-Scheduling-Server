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
// CREATE HOD
// POST /hod/post
// =====================================================

router.post("/post", async (req, res) => {
  const {
    name,
    email,
    password,
    employeeCode,
    hodGroup,
  } = req.body;

  try {
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "HOD name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "HOD email is required"
      );
    }

    if (!password) {
      return errorResponse(
        res,
        400,
        "HOD password is required"
      );
    }

    if (!employeeCode || !employeeCode.trim()) {
      return errorResponse(
        res,
        400,
        "Employee code is required"
      );
    }

    if (!hodGroup || !hodGroup.trim()) {
      return errorResponse(
        res,
        400,
        "HOD group is required"
      );
    }

    const hodName = name.trim();
    const hodEmail = email.trim().toLowerCase();
    const code = employeeCode.trim();
    const group = hodGroup.trim().toUpperCase();

    const allowedGroups = [
      "PRIMARY",
      "MIDDLE",
      "SENIOR",
    ];

    if (!allowedGroups.includes(group)) {
      return errorResponse(
        res,
        400,
        "HOD group must be PRIMARY, MIDDLE or SENIOR"
      );
    }

    const existingEmail = await prisma.hod.findUnique({
      where: {
        email: hodEmail,
      },
    });

    if (existingEmail) {
      return errorResponse(
        res,
        409,
        "HOD email already exists"
      );
    }

    const existingCode = await prisma.hod.findUnique({
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

    const existingGroup = await prisma.hod.findUnique({
      where: {
        hodGroup: group,
      },
    });

    if (existingGroup) {
      return errorResponse(
        res,
        409,
        "This HOD group already has an HOD"
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const hod = await prisma.hod.create({
      data: {
        name: hodName,
        email: hodEmail,
        password: hashedPassword,
        employeeCode: code,
        hodGroup: group,
      },
    });

    return successResponse(
      res,
      201,
      "HOD Created Successfully",
      {
        name: hod.name,
        email: hod.email,
        employeeCode: hod.employeeCode,
        hodGroup: hod.hodGroup,
        isActive: hod.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ALL HODS
// GET /hod/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const hods = await prisma.hod.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = hods.map((hod) => ({
      id: hod.id,
      name: hod.name,
      email: hod.email,
      employeeCode: hod.employeeCode,
      hodGroup: hod.hodGroup,
      isActive: hod.isActive,
    }));

    return successResponse(
      res,
      200,
      "HODs Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET HOD BY ID
// GET /hod/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid HOD ID"
    );
  }

  try {
    const hod = await prisma.hod.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!hod) {
      return errorResponse(
        res,
        404,
        "HOD not found"
      );
    }

    return successResponse(
      res,
      200,
      "HOD Fetched Successfully",
      {
        id: hod.id,
        name: hod.name,
        email: hod.email,
        employeeCode: hod.employeeCode,
        hodGroup: hod.hodGroup,
        isActive: hod.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE HOD
// PUT /hod/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    password,
    employeeCode,
    hodGroup,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid HOD ID"
    );
  }

  try {
    const hod = await prisma.hod.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!hod) {
      return errorResponse(
        res,
        404,
        "HOD not found"
      );
    }

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "HOD name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "HOD email is required"
      );
    }

    if (!employeeCode || !employeeCode.trim()) {
      return errorResponse(
        res,
        400,
        "Employee code is required"
      );
    }

    if (!hodGroup || !hodGroup.trim()) {
      return errorResponse(
        res,
        400,
        "HOD group is required"
      );
    }

    const hodName = name.trim();
    const hodEmail = email.trim().toLowerCase();
    const code = employeeCode.trim();
    const group = hodGroup.trim().toUpperCase();

    const allowedGroups = [
      "PRIMARY",
      "MIDDLE",
      "SENIOR",
    ];

    if (!allowedGroups.includes(group)) {
      return errorResponse(
        res,
        400,
        "HOD group must be PRIMARY, MIDDLE or SENIOR"
      );
    }

    const existingEmail = await prisma.hod.findFirst({
      where: {
        email: hodEmail,

        NOT: {
          id: id,
        },
      },
    });

    if (existingEmail) {
      return errorResponse(
        res,
        409,
        "HOD email already exists"
      );
    }

    const existingCode = await prisma.hod.findFirst({
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

    const existingGroup = await prisma.hod.findFirst({
      where: {
        hodGroup: group,

        NOT: {
          id: id,
        },
      },
    });

    if (existingGroup) {
      return errorResponse(
        res,
        409,
        "This HOD group already has an HOD"
      );
    }

    const data = {
      name: hodName,
      email: hodEmail,
      employeeCode: code,
      hodGroup: group,

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : hod.isActive,
    };

    if (password) {
      data.password = await bcrypt.hash(
        password,
        10
      );
    }

    const updatedHod = await prisma.hod.update({
      where: {
        id: id,
      },

      data: data,
    });

    return successResponse(
      res,
      200,
      "HOD Updated Successfully",
      {
        name: updatedHod.name,
        email: updatedHod.email,
        employeeCode: updatedHod.employeeCode,
        hodGroup: updatedHod.hodGroup,
        isActive: updatedHod.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE HOD
// DELETE /hod/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid HOD ID"
    );
  }

  try {
    const hod = await prisma.hod.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!hod) {
      return errorResponse(
        res,
        404,
        "HOD not found"
      );
    }

    const deletedHod = await prisma.hod.update({
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
      "HOD Deleted Successfully",
      {
        name: deletedHod.name,
        email: deletedHod.email,
        employeeCode: deletedHod.employeeCode,
        hodGroup: deletedHod.hodGroup,
        isActive: deletedHod.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;