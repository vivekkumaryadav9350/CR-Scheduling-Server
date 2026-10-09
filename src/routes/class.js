const express = require("express");
const router = express.Router();

const {
  successResponse,
  errorResponse,
} = require("../utils/apiResponse");

const prismaErrorHandler = require("../utils/prismaErrorHandler");

const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// =====================================================
// CREATE CLASS
// POST /class/post
// =====================================================

router.post("/post", async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Class name is required"
      );
    }

    const className = name.trim();

    const existingClass = await prisma.class.findFirst({
      where: {
        name: className,
        isDeleted: false,
      },
    });

    if (existingClass) {
      return errorResponse(
        res,
        409,
        "Class already exists"
      );
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        name: className,
      },
    });

    return successResponse(
      res,
      201,
      "Class Created Successfully",
      {
        name: newClass.name,
        isActive: newClass.isActive,
      }
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});
// =====================================================
// GET ALL CLASSES
// GET /class/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = classes.map((item) => ({
      id: item.id,
      name: item.name,
      isActive: item.isActive,
    }));

    return successResponse(
      res,
      200,
      "Classes Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET CLASS BY ID
// GET /class/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid class ID"
    );
  }

  try {
    const classData = await prisma.class.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!classData) {
      return errorResponse(
        res,
        404,
        "Class not found"
      );
    }

    return successResponse(
      res,
      200,
      "Class Fetched Successfully",
      {
         id: classData.id,
        name: classData.name,
        isActive: classData.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE CLASS
// PUT /class/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    name,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid class ID"
    );
  }

  try {
    // Find existing class
    const existingClass = await prisma.class.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!existingClass) {
      return errorResponse(
        res,
        404,
        "Class not found"
      );
    }

    // Validation
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Class name is required"
      );
    }

    const className = name.trim();

    // Check duplicate
    const duplicateClass = await prisma.class.findFirst({
      where: {
        name: className,
        isDeleted: false,

        NOT: {
          id: id,
        },
      },
    });

    if (duplicateClass) {
      return errorResponse(
        res,
        409,
        "Class already exists"
      );
    }

    // Update class
    const updatedClass = await prisma.class.update({
      where: {
        id: id,
      },

      data: {
        name: className,

        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : existingClass.isActive,
      },
    });

    return successResponse(
      res,
      200,
      "Class Updated Successfully",
      {
        name: updatedClass.name,
        isActive: updatedClass.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE CLASS
// DELETE /class/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid class ID"
    );
  }

  try {
    // Find class
    const classData = await prisma.class.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!classData) {
      return errorResponse(
        res,
        404,
        "Class not found"
      );
    }

    // Soft delete
    const deletedClass = await prisma.class.update({
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
      "Class Deleted Successfully",
      {
        name: deletedClass.name,
        isActive: deletedClass.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;