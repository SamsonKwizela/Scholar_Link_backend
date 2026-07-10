const createSuccessResponse = (data) => ({
  success: true,
  data,
});

const createErrorResponse = (message) => ({
  success: false,
  message,
});

const buildPaginationMeta = (page, limit, totalItems) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse,
  buildPaginationMeta,
};
