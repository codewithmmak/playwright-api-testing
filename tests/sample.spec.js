// @ts-check
const { test, expect } = require('@playwright/test');

test('should be able to create a booking', async ({ request }) => {
    const response = await request.put(`https://petstore.swagger.io/v2/pet`, {
        data: {
            "id": 0,
            "category": {
                "id": 0,
                "name": "string"
            },
            "name": "doggie",
            "photoUrls": [
                "string"
            ],
            "tags": [
                {
                    "id": 0,
                    "name": "string"
                }
            ],
            "status": "available"
        }
    });
    console.log(await response.json());
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.category).toHaveProperty("id", 0);
    expect(responseBody.category).toHaveProperty("name", "string");
    expect(responseBody).toHaveProperty("name", "doggie");
    expect(responseBody).toHaveProperty("status", "available");
});