// Success Responses

const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        message,
        data,
    });
};


// Error Responses

const errorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        message,
        errors,
    });
};


module.exports = {
    successResponse,
    errorResponse,
};