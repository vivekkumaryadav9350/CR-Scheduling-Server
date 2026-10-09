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
// CREATE SCHEDULE
// POST /schedule/post
// =====================================================

router.post("/post", async (req, res) => {

   console.log("=================================");
  console.log("POST /schedule/post HIT");
  console.log("BODY:", req.body);
  console.log("=================================");
  
  const {
    className,
    sectionName,
    teacherName,
    subjectName,
    startTime,
    endTime,
    scheduleDate,
    dayOfWeek,
  } = req.body;

  try {
    if (
      !className ||
      !sectionName ||
      !teacherName ||
      !subjectName ||
      !startTime ||
      !endTime ||
      !scheduleDate
    ) {
      return errorResponse(
        res,
        400,
        "All required fields are required"
      );
    }

    const classData = await prisma.class.findFirst({
      where: {
        name: className.trim(),
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

    const section = await prisma.section.findFirst({
      where: {
        name: sectionName.trim(),
        classId: classData.id,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!section) {
      return errorResponse(
        res,
        404,
        "Section not found in this class"
      );
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        name: teacherName.trim(),
        isActive: true,
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

    const subject = await prisma.subject.findFirst({
      where: {
        name: subjectName.trim(),
        isActive: true,
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

    const periodStart = new Date(
      `1970-01-01T${startTime}:00.000Z`
    );

    const periodEnd = new Date(
      `1970-01-01T${endTime}:00.000Z`
    );

    if (
      isNaN(periodStart.getTime()) ||
      isNaN(periodEnd.getTime())
    ) {
      return errorResponse(
        res,
        400,
        "Invalid time format. Use HH:mm"
      );
    }

    const period = await prisma.period.findFirst({
      where: {
        startTime: periodStart,
        endTime: periodEnd,
        isActive: true,
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

    const date = new Date(
      `${scheduleDate}T00:00:00.000Z`
    );

    if (isNaN(date.getTime())) {
      return errorResponse(
        res,
        400,
        "Invalid schedule date"
      );
    }

    // =====================================================
    // ACTIVE TEACHER CONFLICT
    // =====================================================

    const teacherConflict =
      await prisma.schedule.findFirst({
        where: {
          teacherId: teacher.id,
          scheduleDate: date,
          periodId: period.id,
          isDeleted: false,
          isActive: true,
        },
      });

    if (teacherConflict) {
      return errorResponse(
        res,
        409,
        "Teacher is already assigned at this time"
      );
    }

    // =====================================================
    // ACTIVE CLASS SECTION CONFLICT
    // =====================================================

    const classConflict =
      await prisma.schedule.findFirst({
        where: {
          classId: classData.id,
          sectionId: section.id,
          scheduleDate: date,
          periodId: period.id,
          isDeleted: false,
          isActive: true,
        },
      });

    if (classConflict) {
      return errorResponse(
        res,
        409,
        "Class section already has a schedule at this time"
      );
    }

    // =====================================================
    // CHECK SOFT-DELETED RECORD
    // =====================================================

    const deletedSchedule =
      await prisma.schedule.findFirst({
        where: {
          teacherId: teacher.id,
          scheduleDate: date,
          periodId: period.id,
          isDeleted: true,
        },
      });

    // =====================================================
    // REUSE DELETED RECORD
    // =====================================================

    if (deletedSchedule) {
      const restoredSchedule =
        await prisma.schedule.update({
          where: {
            id: deletedSchedule.id,
          },

          data: {
            classId: classData.id,
            sectionId: section.id,
            teacherId: teacher.id,
            subjectId: subject.id,
            periodId: period.id,
            scheduleDate: date,

            dayOfWeek: dayOfWeek
              ? dayOfWeek.trim()
              : null,

            isDeleted: false,
            isActive: true,
          },

          include: {
            class: true,
            section: true,
            teacher: true,
            subject: true,
            period: true,
          },
        });

      return successResponse(
        res,
        200,
        "Schedule Added Successfully",
        {
          id: restoredSchedule.id,
          className: restoredSchedule.class.name,
          sectionName: restoredSchedule.section.name,
          teacherName: restoredSchedule.teacher.name,
          subjectName: restoredSchedule.subject.name,
          startTime: restoredSchedule.period.startTime,
          endTime: restoredSchedule.period.endTime,
          scheduleDate: restoredSchedule.scheduleDate,
          dayOfWeek: restoredSchedule.dayOfWeek,
          isActive: restoredSchedule.isActive,
          isDeleted: restoredSchedule.isDeleted,
        }
      );
    }

    // =====================================================
    // CREATE NEW SCHEDULE
    // =====================================================

    const schedule = await prisma.schedule.create({
      data: {
        classId: classData.id,
        sectionId: section.id,
        teacherId: teacher.id,
        subjectId: subject.id,
        periodId: period.id,
        scheduleDate: date,

        dayOfWeek: dayOfWeek
          ? dayOfWeek.trim()
          : null,

        isActive: true,
        isDeleted: false,
      },

      include: {
        class: true,
        section: true,
        teacher: true,
        subject: true,
        period: true,
      },
    });

    return successResponse(
      res,
      201,
      "Schedule Created Successfully",
      {
        id: schedule.id,
        className: schedule.class.name,
        sectionName: schedule.section.name,
        teacherName: schedule.teacher.name,
        subjectName: schedule.subject.name,
        startTime: schedule.period.startTime,
        endTime: schedule.period.endTime,
        scheduleDate: schedule.scheduleDate,
        dayOfWeek: schedule.dayOfWeek,
        isActive: schedule.isActive,
        isDeleted: schedule.isDeleted,
      }
    );

  } catch (err) {
    console.error("CREATE SCHEDULE ERROR:", err);

    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET ALL SCHEDULES
// GET /schedule/get
// =====================================================

router.get("/get", async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        isDeleted: false,
      },

      include: {
        class: true,
        section: true,
        teacher: true,
        subject: true,
        period: true,
      },

      orderBy: [
        {
          scheduleDate: "asc",
        },
        {
          periodId: "asc",
        },
      ],
    });

    const result = schedules.map((schedule) => ({
      id: schedule.id,
      periodId: schedule.period.id,
      classId: schedule.class.id,
      sectionId: schedule.section.id,

      sectionName: schedule.section.name,
      teacherName: schedule.teacher.name,
      subjectName: schedule.subject.name,

      scheduleDate: schedule.scheduleDate,
      dayOfWeek: schedule.dayOfWeek,
      isActive: schedule.isActive,
    }));

    return successResponse(
      res,
      200,
      "Schedules Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// GET SCHEDULE BY ID
// GET /schedule/get/:id
// =====================================================

router.get("/get/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid schedule ID"
    );
  }

  try {
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },

      include: {
        class: true,
        section: true,
        teacher: true,
        subject: true,
        period: true,
      },
    });

    if (!schedule) {
      return errorResponse(
        res,
        404,
        "Schedule not found"
      );
    }

    const result = {
      className: schedule.class.name,
      sectionName: schedule.section.name,
      teacherName: schedule.teacher.name,
      subjectName: schedule.subject.name,
      startTime: schedule.period.startTime,
      endTime: schedule.period.endTime,
      scheduleDate: schedule.scheduleDate,
      dayOfWeek: schedule.dayOfWeek,
      isActive: schedule.isActive,
    };

    return successResponse(
      res,
      200,
      "Schedule Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// =====================================================
// UPDATE SCHEDULE
// PUT /schedule/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {
  const id = Number(req.params.id);

  const {
    className,
    sectionName,
    teacherName,
    subjectName,
    startTime,
    endTime,
    scheduleDate,
    dayOfWeek,
    isActive,
  } = req.body;

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid schedule ID"
    );
  }

  try {
    const existingSchedule =
      await prisma.schedule.findFirst({
        where: {
          id: id,
          isDeleted: false,
        },
      });

    if (!existingSchedule) {
      return errorResponse(
        res,
        404,
        "Schedule not found"
      );
    }

    if (
      !className ||
      !sectionName ||
      !teacherName ||
      !subjectName ||
      !startTime ||
      !endTime ||
      !scheduleDate
    ) {
      return errorResponse(
        res,
        400,
        "All required fields are required"
      );
    }

    const classData = await prisma.class.findFirst({
      where: {
        name: className.trim(),
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

    const section = await prisma.section.findFirst({
      where: {
        name: sectionName.trim(),
        classId: classData.id,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!section) {
      return errorResponse(
        res,
        404,
        "Section not found in this class"
      );
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        name: teacherName.trim(),
        isActive: true,
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

    const subject = await prisma.subject.findFirst({
      where: {
        name: subjectName.trim(),
        isActive: true,
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

    const periodStart = new Date(
      `1970-01-01T${startTime}:00.000Z`
    );

    const periodEnd = new Date(
      `1970-01-01T${endTime}:00.000Z`
    );

    if (
      isNaN(periodStart.getTime()) ||
      isNaN(periodEnd.getTime())
    ) {
      return errorResponse(
        res,
        400,
        "Invalid time format. Use HH:mm"
      );
    }

    const period = await prisma.period.findFirst({
      where: {
        startTime: periodStart,
        endTime: periodEnd,
        isActive: true,
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

    const date = new Date(
      `${scheduleDate}T00:00:00.000Z`
    );

    if (isNaN(date.getTime())) {
      return errorResponse(
        res,
        400,
        "Invalid schedule date"
      );
    }

    const teacherConflict =
      await prisma.schedule.findFirst({
        where: {
          teacherId: teacher.id,
          scheduleDate: date,
          periodId: period.id,
          isDeleted: false,

          NOT: {
            id: id,
          },
        },
      });

    if (teacherConflict) {
      return errorResponse(
        res,
        409,
        "Teacher is already assigned at this time"
      );
    }

    const classConflict =
      await prisma.schedule.findFirst({
        where: {
          classId: classData.id,
          sectionId: section.id,
          scheduleDate: date,
          periodId: period.id,
          isDeleted: false,

          NOT: {
            id: id,
          },
        },
      });

    if (classConflict) {
      return errorResponse(
        res,
        409,
        "Class section already has a schedule at this time"
      );
    }

    const updatedSchedule =
      await prisma.schedule.update({
        where: {
          id: id,
        },

        data: {
          classId: classData.id,
          sectionId: section.id,
          teacherId: teacher.id,
          subjectId: subject.id,
          periodId: period.id,

          scheduleDate: date,

          dayOfWeek: dayOfWeek
            ? dayOfWeek.trim()
            : null,

          isActive:
            isActive !== undefined
              ? Boolean(isActive)
              : existingSchedule.isActive,
        },

        include: {
          class: true,
          section: true,
          teacher: true,
          subject: true,
          period: true,
        },
      });

    return successResponse(
      res,
      200,
      "Schedule Updated Successfully",
      {
        className: updatedSchedule.class.name,
        sectionName: updatedSchedule.section.name,
        teacherName: updatedSchedule.teacher.name,
        subjectName: updatedSchedule.subject.name,
        startTime: updatedSchedule.period.startTime,
        endTime: updatedSchedule.period.endTime,
        scheduleDate: updatedSchedule.scheduleDate,
        dayOfWeek: updatedSchedule.dayOfWeek,
        isActive: updatedSchedule.isActive,
      }
    );

  } catch (err) {
    console.error("UPDATE SCHEDULE ERROR:", err);

    prismaErrorHandler(err, res);
  }
});

// =====================================================
// DELETE SCHEDULE
// DELETE /schedule/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return errorResponse(
      res,
      400,
      "Invalid schedule ID"
    );
  }

  try {
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!schedule) {
      return errorResponse(
        res,
        404,
        "Schedule not found"
      );
    }

    const deletedSchedule = await prisma.schedule.update({
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
      "Schedule Deleted Successfully",
      {
        id: deletedSchedule.id,
        classId: deletedSchedule.classId,
        sectionId: deletedSchedule.sectionId,
        teacherId: deletedSchedule.teacherId,
        subjectId: deletedSchedule.subjectId,
        periodId: deletedSchedule.periodId,
        isActive: deletedSchedule.isActive,
      }
    );

  } catch (err) {
    console.error("DELETE SCHEDULE ERROR:", err);

    prismaErrorHandler(err, res);
  }
});

// ==========================================
// GET ALL SCHEDULES OF TEACHER
// ==========================================

router.get("/teacher/:teacherName", async (req, res) => {
  const { teacherName } = req.params;

  try {
    if (!teacherName || !teacherName.trim()) {
      return errorResponse(
        res,
        400,
        "Teacher name is required"
      );
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        name: teacherName.trim(),
        isActive: true,
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

    const schedules = await prisma.schedule.findMany({
      where: {
        teacherId: teacher.id,
        isDeleted: false,
      },

      include: {
        class: true,
        section: true,
        subject: true,
        period: true,
        teacher: true,
      },

      orderBy: [
        {
          scheduleDate: "asc",
        },
        {
          period: {
            startTime: "asc",
          },
        },
      ],
    });

    const result = schedules.map((schedule) => ({
      id: schedule.id,
      periodId: schedule.period.id,
      classId: schedule.class.id,
      sectionId: schedule.section.id,
      subjectId: schedule.subject.id,

      className: schedule.class.name,
      sectionName: schedule.section.name,
      subjectName: schedule.subject.name,

      scheduleDate: schedule.scheduleDate
        .toISOString()
        .split("T")[0],

      dayOfWeek: schedule.dayOfWeek,
    }));

    return successResponse(
      res,
      200,
      "Teacher Schedules Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// ==========================================
// GET CLASS SCHEDULE
// ==========================================

router.get("/class/:className", async (req, res) => {
  const { className } = req.params;

  try {
    if (!className || !className.trim()) {
      return errorResponse(
        res,
        400,
        "Class name is required"
      );
    }

    const classData = await prisma.class.findFirst({
      where: {
        name: className.trim(),
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

    const schedules = await prisma.schedule.findMany({
      where: {
        classId: classData.id,
        isDeleted: false,
      },

      include: {
        section: true,
        teacher: true,
        subject: true,
        period: true,
      },

      orderBy: [
        {
          scheduleDate: "asc",
        },
        {
          period: {
            startTime: "asc",
          },
        },
      ],
    });

    const result = schedules.map((schedule) => ({
      periodId: schedule.period.id,
      sectionId: schedule.section.id,
      subjectId: schedule.subject.id,
      teacherId: schedule.teacher.id,

      sectionName: schedule.section.name,
      teacherName: schedule.teacher.name,
      subjectName: schedule.subject.name,

      scheduleDate: schedule.scheduleDate
        .toISOString()
        .split("T")[0],

      dayOfWeek: schedule.dayOfWeek,
    }));

    return successResponse(
      res,
      200,
      "Class Schedules Fetched Successfully",
      result
    );

  } catch (err) {
    prismaErrorHandler(err, res);
  }
});

// ==========================================
// GET SCHEDULES BY DATE
// ==========================================

router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;

    console.log("Requested Schedule Date:", date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const scheduleDate = new Date(
      `${date}T00:00:00.000Z`
    );

    const schedules = await prisma.schedule.findMany({
      where: {
        scheduleDate: scheduleDate,
        isDeleted: false,
        isActive: true,
      },

      orderBy: [
        {
          periodId: "asc",
        },
      ],
    });

    console.log(
      `Schedules found for ${date}:`,
      schedules.length
    );

    return res.status(200).json({
      success: true,
      date,
      data: schedules,
    });

  } catch (error) {
    console.error(
      "GET SCHEDULES BY DATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch schedules by date",
      error: error.message,
    });
  }
});

module.exports = router;