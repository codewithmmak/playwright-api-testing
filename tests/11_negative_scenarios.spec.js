// @ts-check
const { test, expect } = require('@playwright/test');
const { createBooking, updateBooking, makeBookingPayload } = require('./support/booking-api');

test('should return 404 for non-existing booking id', async ({ request }) => {
  const response = await request.get('/booking/99999999');
  expect(response.status()).toBe(404);
});

test('should return 403 while updating booking without auth', async ({ request }) => {
  const created = await createBooking(request);
  const updatePayload = makeBookingPayload({ firstname: 'Unauthorized' });

  const response = await request.put(`/booking/${created.bookingId}`, {
    data: updatePayload,
  });

  expect(response.status()).toBe(403);
});

test('should reject invalid auth credentials', async ({ request }) => {
  const response = await request.post('/auth', {
    data: {
      username: 'invalid-user',
      password: 'invalid-pass',
    },
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.reason).toMatch(/Bad credentials/i);
});

test('should return 403 when deleting booking with invalid token', async ({ request }) => {
  const created = await createBooking(request);
  const response = await request.delete(`/booking/${created.bookingId}`, {
    headers: {
      Cookie: 'token=invalid-token',
    },
  });

  expect(response.status()).toBe(403);
});

test('should return 403 when updating booking with invalid token', async ({ request }) => {
  const created = await createBooking(request);
  const updatePayload = makeBookingPayload({ firstname: 'InvalidToken' });

  const updated = await updateBooking(request, created.bookingId, 'invalid-token', updatePayload);

  expect(updated.response.status()).toBe(403);
});
