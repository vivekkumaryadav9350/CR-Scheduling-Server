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

function convertTimeToDate(time) {
  if (!time || typeof time !== "string") {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  const date = new Date(`1970-01-01T${time}:00.000Z`);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatTime(date) {
  return date.toISOString().substring(11, 16);
}

router.post("/post", async (req, res) => {
  const { startTime, endTime } = req.body;

  try {
    if (!startTime || !endTime) {
      return errorResponse(
        res,
        400,
        "Start time and end time are required"
      );
    }

    const start = convertTimeToDate(startTime);
    const end = convertTimeToDate(endTime);

    if (!start || !end) {
      return errorResponse(
        res,
        400,
        "Time must be in HH:mm format"
      );
    }

    if (start >= end) {
      return errorResponse(
        res,
        400,
        "End time must be greater than start time"
      );
    }

    const existingPeriod = await prisma.period.findFirst({
      where: {
        startTime: start,
        endTime: end,
        isDeleted: false,
      },
    });

    if (existingPeriod) {
      return errorResponse(
        res,
        409,
        "Period with this time already exists"
      );
    }

    const period = await prisma.period.create({
      data: {
        startTime: start,
        endTime: end,
      },
    });

    return successResponse(
      res,
      201,
      "Period Created Successfully",
      {
        id: period.id,
        startTime: formatTime(period.startTime),
        endTime: formatTime(period.endTime),
        isActive: period.isActive,
      }
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

router.get("/get", async (req, res) => {
  try {
    const periods = await prisma.period.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        id: "asc",
      },
    });

    const formattedPeriods = periods.map((period) => ({
      id: period.id,
      startTime: formatTime(period.startTime),
      endTime: formatTime(period.endTime),
      isActive: period.isActive,
    }));

    return successResponse(
      res,
      200,
      "Periods Fetched Successfully",
      formattedPeriods
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid period ID"
    );
  }

  try {
    const period = await prisma.period.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!period) {
      return errorResponse(
        res,
        404,
        "Period not found"
      );
    }

    return successResponse(
      res,
      200,
      "Period Fetched Successfully",
      {
        id: period.id,
        startTime: formatTime(period.startTime),
        endTime: formatTime(period.endTime),
        isActive: period.isActive,
      }
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    startTime,
    endTime,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid period ID"
    );
  }

  try {
    const period = await prisma.period.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!period) {
      return errorResponse(
        res,
        404,
        "Period not found"
      );
    }

    if (!startTime || !endTime) {
      return errorResponse(
        res,
        400,
        "Start time and end time are required"
      );
    }

    const start = convertTimeToDate(startTime);
    const end = convertTimeToDate(endTime);

    if (!start || !end) {
      return errorResponse(
        res,
        400,
        "Time must be in HH:mm format"
      );
    }

    if (start >= end) {
      return errorResponse(
        res,
        400,
        "End time must be greater than start time"
      );
    }

    const existingPeriod = await prisma.period.findFirst({
      where: {
        startTime: start,
        endTime: end,
        isDeleted: false,
        NOT: {
          id: id,
        },
      },
    });

    if (existingPeriod) {
      return errorResponse(
        res,
        409,
        "Period with this time already exists"
      );
    }

    const updatedPeriod = await prisma.period.update({
      where: {
        id: id,
      },
      data: {
        startTime: start,
        endTime: end,
        isActive:
          isActive !== undefined
            ? Boolean(isActive)
            : period.isActive,
      },
    });

    return successResponse(
      res,
      200,
      "Period Updated Successfully",
      {
        id: updatedPeriod.id,
        startTime: formatTime(updatedPeriod.startTime),
        endTime: formatTime(updatedPeriod.endTime),
        isActive: updatedPeriod.isActive,
      }
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid period ID"
    );
  }

  try {
    const period = await prisma.period.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!period) {
      return errorResponse(
        res,
        404,
        "Period not found"
      );
    }

    const deletedPeriod = await prisma.period.update({
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
      "Period Deleted Successfully",
      {
        id: deletedPeriod.id,
        startTime: formatTime(deletedPeriod.startTime),
        endTime: formatTime(deletedPeriod.endTime),
        isActive: deletedPeriod.isActive,
      }
    );
  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

module.exports = router;