// @ts-check
const { test, expect } = require('@playwright/test');
const { createAuthToken, createBooking, deleteBooking } = require('./support/booking-api');

test('should be able to delete the booking details', async ({ request }) => {
  const { response: authResponse, body: authBody } = await createAuthToken(request);
  expect(authResponse.ok()).toBeTruthy();
  expect(authResponse.status()).toBe(200);
  expect(authBody.token).toEqual(expect.any(String));

  const created = await createBooking(request);
  const deleted = await deleteBooking(request, created.bookingId, authBody.token);

  expect(deleted.status()).toEqual(201);
  expect(deleted.statusText()).toBe('Created');

  const getAfterDelete = await request.get(`/booking/${created.bookingId}`);
  expect(getAfterDelete.status()).toBe(404);
});
