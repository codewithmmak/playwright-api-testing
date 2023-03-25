// @ts-check
const { test, expect } = require('@playwright/test');

var token

test('should be able to partial update the booking details', async ({ request }) => {

    // Create a Token which will be used in PATCH request

    const response = await request.post(`/auth`, {
        data: {
            "username": "admin",
            "password": "password123"
        }
    });
    console.log(await response.json());
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    token = responseBody.token;
    console.log("New Token is: " + token);

    // PATCH

    const partialUpdateRequest = await request.patch(`/booking/1`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}`
        },
        data: {
            "firstname": "Sim",
            "lastname": "Son",
            "totalprice": 333,
            "depositpaid": false
        }
    });
    console.log(await partialUpdateRequest.json());
    expect(partialUpdateRequest.ok()).toBeTruthy();
    expect(partialUpdateRequest.status()).toBe(200);
    const partialUpdatedResponseBody = await partialUpdateRequest.json()
    expect(partialUpdatedResponseBody).toHaveProperty("firstname", "Sim");
    expect(partialUpdatedResponseBody).toHaveProperty("lastname", "Son");
    expect(partialUpdatedResponseBody).toHaveProperty("totalprice", 333);
    expect(partialUpdatedResponseBody).toHaveProperty("depositpaid", false);
});