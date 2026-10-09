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
// CREATE SECTION
// POST /section/post
// =====================================================

router.post("/post", async (req, res) => {
   const { className, name } = req.body;
    try 
    { if (!className || !className.trim()) 
      { 
        return errorResponse( res, 400, "Class name is required" ); 
      } 
      if (!name || !name.trim())
         { 
          return errorResponse( res, 400, "Section name is required" );
         } 
         const classNameValue = className.trim(); 
         const sectionName = name.trim(); 
         const classData = await prisma.class.findFirst(
        {
        where: { name: classNameValue, isActive: true, isDeleted: false, },
        });
        if (!classData) 
        { 
        return errorResponse( res, 404, "Class not found" ); 
        } 
        const existingSection = await prisma.section.findFirst(
        {
        where: { classId: classData.id, name: sectionName, isDeleted: false,

        }, 
        }); 

        if (existingSection) 
        { 
        return errorResponse( res, 409, "Section already exists in this class" ); 
        } 

        const section = await prisma.section.create(
        { data: 
        {
            classId: classData.id, name: sectionName, 
          },
          include:
          { 
            class: true,
            },
          }); 
          
          return  successResponse( res, 201, "Section Created Successfully", 
          { 
            className: section.class.name, 
            name: section.name,
              isActive: section.isActive, 
            } 
          );
          }
          catch (err) {
              prismaErrorHandler(err, res);
              }
              }); 
// =====================================================
// GET ALL SECTIONS
// GET /section/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      where: {
        isDeleted: false,
      },

      include: {
        class: true,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = sections.map((section) => ({

      className: section.class.name,
      id:section.id,
      name: section.name,
      isActive: section.isActive,
    }));

    return successResponse(
      res,
      200,
      "Sections Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET SECTION BY ID
// GET /section/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid section ID"
    );
  }

  try {
    const section = await prisma.section.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },

      include: {
        class: true,
      },
    });

    if (!section) {
      return errorResponse(
        res,
        404,
        "Section not found"
      );
    }

    return successResponse(
      res,
      200,
      "Section Fetched Successfully",
      {
        className: section.class.name,
        id:section.id,
        name: section.name,
        isActive: section.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE SECTION
// PUT /section/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    className,
    name,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid section ID"
    );
  }

  try {
    const section = await prisma.section.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!section) {
      return errorResponse(
        res,
        404,
        "Section not found"
      );
    }

    if (!className || !className.trim()) {
      return errorResponse(
        res,
        400,
        "Class name is required"
      );
    }

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Section name is required"
      );
    }

    const classNameValue = className.trim();
    const sectionName = name.trim();

    const classData = await prisma.class.findFirst({
      where: {
        name: classNameValue,
        isActive: true,
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

    const existingSection = await prisma.section.findFirst({
      where: {
        classId: classData.id,
        name: sectionName,
        isDeleted: false,

        NOT: {
          id: id,
        },
      },
    });

    if (existingSection) {
      return errorResponse(
        res,
        409,
        "Section already exists in this class"
      );
    }

    const updatedSection = await prisma.section.update({
      where: {
        id: id,
      },

      data: {
        classId: classData.id,
        name: sectionName,

        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : section.isActive,
      },

      include: {
        class: true,
      },
    });

    return successResponse(
      res,
      200,
      "Section Updated Successfully",
      {
        className: updatedSection.class.name,
        name: updatedSection.name,
        isActive: updatedSection.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE SECTION
// DELETE /section/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid section ID"
    );
  }

  try {
    const section = await prisma.section.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!section) {
      return errorResponse(
        res,
        404,
        "Section not found"
      );
    }

    const deletedSection = await prisma.section.update({
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
      "Section Deleted Successfully",
      {
        id: deletedSection.id,
        name: deletedSection.name,
        isActive: deletedSection.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;