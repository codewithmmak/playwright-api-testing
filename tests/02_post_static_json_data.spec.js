// @ts-check
const { test, expect } = require('@playwright/test');
const bookingDetails = require('../test-data/booking-details.json');
const { createBooking, expectBookingShape } = require('./support/booking-api');

test('should be able to create a booking', async ({ request }) => {
  const { response, body } = await createBooking(request, bookingDetails);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  expectBookingShape(expect, body.booking);
  expect(body.booking).toMatchObject(bookingDetails);
});
