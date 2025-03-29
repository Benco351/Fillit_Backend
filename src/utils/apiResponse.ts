export const apiResponse = <T>(data: T, message = 'Success') => ({
    status: 'ok',
    message,
    data
  });