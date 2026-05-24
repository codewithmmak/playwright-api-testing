// @ts-check
const { test, expect } = require('@playwright/test');
const { createBooking, expectBookingShape, makeBookingPayload } = require('./support/booking-api');

test('should be able to create a booking', async ({ request }) => {
  const payload = makeBookingPayload({
    additionalneeds: 'Dinner',
  });

  const { response, body } = await createBooking(request, payload);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  expectBookingShape(expect, body.booking);
  expect(body.booking).toMatchObject(payload);
});
