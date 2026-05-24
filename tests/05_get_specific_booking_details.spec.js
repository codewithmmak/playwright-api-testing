// @ts-check
const { test, expect } = require('@playwright/test');
const { createBooking, expectBookingShape, getBookingById } = require('./support/booking-api');

test('should be get specific booking details', async ({ request }) => {
  const { bookingId, payload } = await createBooking(request);
  const { response, body } = await getBookingById(request, bookingId);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expectBookingShape(expect, body);
  expect(body).toMatchObject(payload);
});
