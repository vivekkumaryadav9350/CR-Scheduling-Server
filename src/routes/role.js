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
// CREATE ROLE
// POST /role/post
// =====================================================

router.post("/post", async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Role name is required"
      );
    }

    const roleName = name.trim();

    const existingRole = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (existingRole) {
      return errorResponse(
        res,
        409,
        "Role already exists"
      );
    }

    const role = await prisma.role.create({
      data: {
        name: roleName,
      },
    });

    return successResponse(
      res,
      201,
      "Role Created Successfully",
      {
        name: role.name,
        isActive: role.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ALL ROLES
// GET /role/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = roles.map((role) => ({
      id: role.id,
      name: role.name,
      isActive: role.isActive,
    }));

    return successResponse(
      res,
      200,
      "Roles Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ROLE BY ID
// GET /role/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid role ID"
    );
  }

  try {
    const role = await prisma.role.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    return successResponse(
      res,
      200,
      "Role Fetched Successfully",
      {
        id:role.id,
        name: role.name,
        isActive: role.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE ROLE
// PUT /role/update/:id
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
      "Invalid role ID"
    );
  }

  try {
    const role = await prisma.role.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Role name is required"
      );
    }

    const roleName = name.trim();

    const existingRole = await prisma.role.findFirst({
      where: {
        name: roleName,

        NOT: {
          id: id,
        },
      },
    });

    if (existingRole) {
      return errorResponse(
        res,
        409,
        "Role name already exists"
      );
    }

    const updatedRole = await prisma.role.update({
      where: {
        id: id,
      },

      data: {
        name: roleName,

        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : role.isActive,
      },
    });

    return successResponse(
      res,
      200,
      "Role Updated Successfully",
      {
        name: updatedRole.name,
        isActive: updatedRole.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE ROLE
// DELETE /role/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid role ID"
    );
  }

  try {
    const role = await prisma.role.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    const deletedRole = await prisma.role.update({
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
      "Role Deleted Successfully",
      {
        name: deletedRole.name,
        isActive: deletedRole.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;