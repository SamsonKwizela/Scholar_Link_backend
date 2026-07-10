const test = require('node:test');
const assert = require('node:assert/strict');
const { createSuccessResponse, createErrorResponse, buildPaginationMeta } = require('../utils/response');

test('createSuccessResponse returns the expected envelope', () => {
  assert.deepEqual(createSuccessResponse({ ok: true }), { success: true, data: { ok: true } });
});

test('createErrorResponse returns the expected envelope', () => {
  assert.deepEqual(createErrorResponse('Invalid input'), { success: false, message: 'Invalid input' });
});

test('buildPaginationMeta computes pagination values', () => {
  assert.deepEqual(buildPaginationMeta(2, 10, 45), {
    page: 2,
    limit: 10,
    totalPages: 5,
    totalItems: 45,
    hasNextPage: true,
    hasPrevPage: true,
  });
});
