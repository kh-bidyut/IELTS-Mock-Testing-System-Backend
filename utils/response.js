// Response utility functions for consistent API responses

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message = 'Error', statusCode = 400, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }
  
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = 'Forbidden access') => {
  return errorResponse(res, message, 403);
};

const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse
};