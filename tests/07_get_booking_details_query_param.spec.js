// @ts-check
const { test, expect } = require('@playwright/test');

test('should be able to get subset of booking details using query parameters - checkin date example', async ({
  request,
}) => {
  const response = await request.get('/booking', {
    params: {
      checkin: '2024-01-01',
      checkout: '2024-01-15',
    },
  });
  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(Array.isArray(body)).toBeTruthy();

  if (body.length > 0) {
    expect(body[0]).toEqual(
      expect.objectContaining({
        bookingid: expect.any(Number),
      })
    );
  }
});
