export const sendResponse = (_, res, status, message, success = true, data = null) => {
  return res.status(status).json({
    message,
    success,
    ...(data && { data }),
  });
};
