// @ts-check
const { test, expect } = require('@playwright/test');
import { faker } from '@faker-js/faker';
const { DateTime } = require("luxon");

const randomFirstName = faker.name.firstName()
const randomLastName = faker.name.lastName()
const randomNumber = faker.random.numeric(4)
const currentDate = DateTime.now().toFormat('yyyy-MM-dd')
const currentDatePlusFive = DateTime.now().plus({ days: 5 }).toFormat('yyyy-MM-dd')

test('should be able to create a booking', async ({ request }) => {
    const response = await request.post(`/booking`, {
        data: {
            "firstname": randomFirstName,
            "lastname": randomLastName,
            "totalprice": randomNumber,
            "depositpaid": true,
            "bookingdates": {
                "checkin": currentDate,
                "checkout": currentDatePlusFive
            },
            "additionalneeds": "Breakfast"
        }
    });
    console.log(await response.json());
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const responseBody = await response.json()
    expect(responseBody.booking).toHaveProperty("firstname", randomFirstName);
    expect(responseBody.booking).toHaveProperty("lastname", randomLastName);
});