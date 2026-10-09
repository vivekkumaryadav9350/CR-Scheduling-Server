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



// CREATE ADMIN


router.post("/post", async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  try {
   
    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Admin name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "Admin email is required"
      );
    }

    if (!password) {
      return errorResponse(
        res,
        400,
        "Admin password is required"
      );
    }

    const adminName = name.trim();
    const adminEmail = email.trim().toLowerCase();

    // =================================================
    // Check Duplicate Email
    // =================================================

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingAdmin) {
      return errorResponse(
        res,
        409,
        "Admin email already exists"
      );
    }

    // =================================================
    // Hash Password
    // =================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =================================================
    // Create Admin
    // =================================================

    const admin = await prisma.admin.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
      },
    });

    return successResponse(
      res,
      201,
      "Admin Created Successfully",
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});



//  ALL ADMINS
// GET /admin/get


router.get("/get", async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        id: "asc",
      },
    });

    const result = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
    }));

    return successResponse(
      res,
      200,
      "Admins Fetched Successfully",
      admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
    }))
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});



// GET ADMIN BY ID
// GET /admin/get/:id


router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid admin ID"
    );
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return errorResponse(
        res,
        404,
        "Admin not found"
      );
    }

    return successResponse(
      res,
      200,
      "Admin Fetched Successfully",
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});



// UPDATE ADMIN
// PUT /admin/update/:id


router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    password,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid admin ID"
    );
  }

  try {
   

    const admin = await prisma.admin.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return errorResponse(
        res,
        404,
        "Admin not found"
      );
    }

  

    if (!name || !name.trim()) {
      return errorResponse(
        res,
        400,
        "Admin name is required"
      );
    }

    if (!email || !email.trim()) {
      return errorResponse(
        res,
        400,
        "Admin email is required"
      );
    }

    const adminName = name.trim();
    const adminEmail = email.trim().toLowerCase();

   

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: adminEmail,

        NOT: {
          id: id,
        },
      },
    });

    if (existingAdmin) {
      return errorResponse(
        res,
        409,
        "Admin email already exists"
      );
    }

    

    const data = {
      name: adminName,
      email: adminEmail,

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : admin.isActive,
    };

 

    if (password) {
      data.password = await bcrypt.hash(
        password,
        10
      );
    }



    const updatedAdmin = await prisma.admin.update({
      where: {
        id: id,
      },

      data: data,
    });

    return successResponse(
      res,
      200,
      "Admin Updated Successfully",
      {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        isActive: updatedAdmin.isActive,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});



// DELETE ADMIN
// DELETE /admin/delete/:id


router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid admin ID"
    );
  }

  try {
  

    const admin = await prisma.admin.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!admin) {
      return errorResponse(
        res,
        404,
        "Admin not found"
      );
    }


    const deletedAdmin = await prisma.admin.update({
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
      "Admin Deleted Successfully",
      {
        id: deletedAdmin.id,
        name: deletedAdmin.name,
        email: deletedAdmin.email,
      }
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});


module.exports = router;