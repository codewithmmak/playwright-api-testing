// @ts-check
const { test, expect } = require('@playwright/test');
const { createBooking, expectBookingShape } = require('./support/booking-api');

test('should be able to create a booking', async ({ request }) => {
  const payload = {
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-06-01',
      checkout: '2026-06-15',
    },
    additionalneeds: 'Breakfast',
  };

  const { response, body } = await createBooking(request, payload);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  expectBookingShape(expect, body.booking);
  expect(body.booking).toMatchObject(payload);
});
