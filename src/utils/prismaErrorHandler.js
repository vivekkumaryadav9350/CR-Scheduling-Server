function prismaErrorHandler(err, res) {

    switch (err.code) {

        // Unique Constraint Failed
        case "P2002": {

            const target = err.meta?.target;

            if (Array.isArray(target)) {

                if (
                    target.includes("teacher_id") &&
                    target.includes("schedule_date") &&
                    target.includes("period_id")
                ) {
                    return res.status(409).json({
                        message: "Teacher is already assigned at this time."
                    });
                }

                if (
                    target.includes("class_id") &&
                    target.includes("section_id") &&
                    target.includes("schedule_date") &&
                    target.includes("period_id")
                ) {
                    return res.status(409).json({
                        message: "Class section already has a schedule at this time."
                    });
                }
            }

            if (
                Array.isArray(target) &&
                target.includes("email")
            ) {
                return res.status(409).json({
                    message: "Email already exists."
                });
            }

            return res.status(409).json({
                message: "A record with the same unique value already exists."
            });
        }

        // Foreign Key Constraint Failed
        case "P2003":
            return res.status(400).json({
                message: "Related record not found."
            });

        // Record Not Found
        case "P2025":
            return res.status(404).json({
                message: "Record not found."
            });

        // Value Too Long
        case "P2000":
            return res.status(400).json({
                message: "One or more field values are too long."
            });

        // Required Field Missing
        case "P2012":
            return res.status(400).json({
                message: "Required field is missing."
            });

        // Invalid Relation
        case "P2014":
            return res.status(400).json({
                message: "Invalid relation between records."
            });

        // Invalid ID
        case "P2023":
            return res.status(400).json({
                message: "Invalid ID format."
            });

        // Database Connection Error
        case "P1001":
            return res.status(500).json({
                message: "Cannot connect to database."
            });

        // Authentication Failed
        case "P1000":
            return res.status(500).json({
                message: "Database authentication failed."
            });

        // Database Doesn't Exist
        case "P1003":
            return res.status(500).json({
                message: "Database does not exist."
            });

        // Unknown Prisma Error
        default:
            console.error(err);

            return res.status(500).json({
                message: "Internal Server Error"
            });
    }
}

module.exports = prismaErrorHandler;