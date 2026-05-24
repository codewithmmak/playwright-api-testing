// @ts-check
const { test, expect } = require('@playwright/test');

test('should be get all the booking details', async ({ request }) => {
  const response = await request.get('/booking');
  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(0);
  expect(body[0]).toEqual(
    expect.objectContaining({
      bookingid: expect.any(Number),
    })
  );
});
