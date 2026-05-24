// @ts-check
const { test, expect } = require('@playwright/test');
const { createBooking } = require('./support/booking-api');

test('should be able to get subset of booking details using query parameters', async ({
  request,
}) => {
  const seeded = await createBooking(request, {
    firstname: 'Susan',
    lastname: 'Jackson',
    totalprice: 245,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-08-10',
      checkout: '2026-08-18',
    },
    additionalneeds: 'Lunch',
  });

  const response = await request.get('/booking', {
    params: {
      firstname: 'Susan',
      lastname: 'Jackson',
    },
  });
  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(0);
  expect(body.some((booking) => booking.bookingid === seeded.bookingId)).toBeTruthy();
});
