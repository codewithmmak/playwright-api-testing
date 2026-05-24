// @ts-check
const { test, expect } = require('@playwright/test');
const {
  createAuthToken,
  createBooking,
  getBookingById,
  patchBooking,
} = require('./support/booking-api');

test('should be able to partial update the booking details', async ({ request }) => {
  const { response: authResponse, body: authBody } = await createAuthToken(request);
  expect(authResponse.ok()).toBeTruthy();
  expect(authResponse.status()).toBe(200);
  expect(authBody.token).toEqual(expect.any(String));

  const created = await createBooking(request, {
    firstname: 'Original',
    lastname: 'Value',
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-01',
      checkout: '2026-11-10',
    },
    additionalneeds: 'Breakfast',
  });

  const partialPayload = {
    firstname: 'Sim',
    lastname: 'Son',
    totalprice: 333,
    depositpaid: false,
  };

  const partialUpdate = await patchBooking(
    request,
    created.bookingId,
    authBody.token,
    partialPayload
  );

  expect(partialUpdate.response.ok()).toBeTruthy();
  expect(partialUpdate.response.status()).toBe(200);
  expect(partialUpdate.body).toMatchObject(partialPayload);

  const latest = await getBookingById(request, created.bookingId);
  expect(latest.response.ok()).toBeTruthy();
  expect(latest.response.status()).toBe(200);
  expect(latest.body).toMatchObject(partialPayload);
  expect(latest.body.bookingdates).toMatchObject(created.payload.bookingdates);
  expect(latest.body.additionalneeds).toBe(created.payload.additionalneeds);
});
