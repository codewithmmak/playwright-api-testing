// @ts-check
const { test, expect } = require('@playwright/test');
const {
  createAuthToken,
  createBooking,
  expectBookingShape,
  getBookingById,
  makeBookingPayload,
  updateBooking,
} = require('./support/booking-api');

test('should be able to update the booking details', async ({ request }) => {
  const { response: authResponse, body: authBody } = await createAuthToken(request);
  expect(authResponse.ok()).toBeTruthy();
  expect(authResponse.status()).toBe(200);
  expect(authBody.token).toEqual(expect.any(String));

  const created = await createBooking(request);
  const updatedPayload = makeBookingPayload({
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-09-01',
      checkout: '2026-09-15',
    },
    additionalneeds: 'Dinner',
  });

  const updated = await updateBooking(request, created.bookingId, authBody.token, updatedPayload);

  expect(updated.response.ok()).toBeTruthy();
  expect(updated.response.status()).toBe(200);
  expectBookingShape(expect, updated.body);
  expect(updated.body).toMatchObject(updatedPayload);

  const latest = await getBookingById(request, created.bookingId);
  expect(latest.response.ok()).toBeTruthy();
  expect(latest.response.status()).toBe(200);
  expect(latest.body).toMatchObject(updatedPayload);
});
