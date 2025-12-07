export const sendResponse = (res, statusCode, success, message, data) => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};
export const sendError = (res, statusCode, message, errors) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
