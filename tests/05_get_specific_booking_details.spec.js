// @ts-check
const { test, expect } = require('@playwright/test');

test('should be get specific booking details', async ({ request }) => {
    const response = await request.get(`/booking/1`);
    console.log(await response.json());
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
});