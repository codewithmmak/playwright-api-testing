// @ts-check
const { test, expect } = require('@playwright/test');

test('should be able to get subset of booking details using query parameters - checkin date example', async ({ request }) => {
    const response = await request.get(`/booking`, {
        params: {
            checkin: "2021-01-15",
            checkout: "2023-03-25"
        },
    });
    console.log(await response.json());
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
});