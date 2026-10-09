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
// CREATE SUBJECT
// POST /subject/post
// =====================================================

router.post("/post", async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Subject name is required"
      );
    }

    const subjectName = name.trim();

    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: subjectName,
        isDeleted: false,
      },
    });

    if (existingSubject) {
      return errorResponse(
        res,
        409,
        "Subject already exists"
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name: subjectName,
      },
    });

    return successResponse(
      res,
      201,
      "Subject Created Successfully",
      {
        name: subject.name,
        isActive: subject.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ALL SUBJECTS
// GET /subject/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      isActive: subject.isActive,
    }));

    return successResponse(
      res,
      200,
      "Subjects Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET SUBJECT BY ID
// GET /subject/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid subject ID"
    );
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!subject) {
      return errorResponse(
        res,
        404,
        "Subject not found"
      );
    }

    return successResponse(
      res,
      200,
      "Subject Fetched Successfully",
      {
        id: subject.id,
        name: subject.name,
        isActive: subject.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE SUBJECT
// PUT /subject/update/:id
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
      "Invalid subject ID"
    );
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!subject) {
      return errorResponse(
        res,
        404,
        "Subject not found"
      );
    }

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Subject name is required"
      );
    }

    const subjectName = name.trim();

    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: subjectName,
        isDeleted: false,

        NOT: {
          id: id,
        },
      },
    });

    if (existingSubject) {
      return errorResponse(
        res,
        409,
        "Subject already exists"
      );
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id: id,
      },

      data: {
        name: subjectName,

        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : subject.isActive,
      },
    });

    return successResponse(
      res,
      200,
      "Subject Updated Successfully",
      {
        name: updatedSubject.name,
        isActive: updatedSubject.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE SUBJECT
// DELETE /subject/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid subject ID"
    );
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!subject) {
      return errorResponse(
        res,
        404,
        "Subject not found"
      );
    }

    const deletedSubject = await prisma.subject.update({
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
      "Subject Deleted Successfully",
      {
        name: deletedSubject.name,
        isActive: deletedSubject.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;