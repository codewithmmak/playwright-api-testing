const { faker } = require('@faker-js/faker');

async function parseResponseBody(response) {
  const contentType = response.headers()['content-type'] || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const textBody = await response.text();
  try {
    return JSON.parse(textBody);
  } catch {
    return textBody;
  }
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function makeBookingPayload(overrides = {}) {
  const checkinDate = new Date();
  const checkoutDate = new Date();
  checkoutDate.setDate(checkinDate.getDate() + 5);

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 999 }),
    depositpaid: true,
    bookingdates: {
      checkin: formatDate(checkinDate),
      checkout: formatDate(checkoutDate),
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

async function createAuthToken(request) {
  const username = process.env.BOOKER_USERNAME;
  const password = process.env.BOOKER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing BOOKER_USERNAME or BOOKER_PASSWORD in environment.');
  }

  const response = await request.post('/auth', {
    data: { username, password },
  });

  return {
    response,
    body: await parseResponseBody(response),
  };
}

async function createBooking(request, payload = makeBookingPayload()) {
  const response = await request.post('/booking', { data: payload });
  const body = await parseResponseBody(response);

  return {
    response,
    body,
    bookingId: body.bookingid,
    booking: body.booking,
    payload,
  };
}

async function getBookingById(request, bookingId) {
  const response = await request.get(`/booking/${bookingId}`);
  const body = await parseResponseBody(response);

  return { response, body };
}

async function updateBooking(request, bookingId, token, payload) {
  const response = await request.put(`/booking/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Cookie: `token=${token}`,
    },
    data: payload,
  });

  return {
    response,
    body: await parseResponseBody(response),
  };
}

async function patchBooking(request, bookingId, token, payload) {
  const response = await request.patch(`/booking/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Cookie: `token=${token}`,
    },
    data: payload,
  });

  return {
    response,
    body: await parseResponseBody(response),
  };
}

async function deleteBooking(request, bookingId, token) {
  const response = await request.delete(`/booking/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${token}`,
    },
  });

  return response;
}

function expectBookingShape(expect, booking) {
  expect(booking).toEqual(
    expect.objectContaining({
      firstname: expect.any(String),
      lastname: expect.any(String),
      totalprice: expect.any(Number),
      depositpaid: expect.any(Boolean),
      bookingdates: expect.objectContaining({
        checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    })
  );
}

module.exports = {
  createAuthToken,
  createBooking,
  deleteBooking,
  expectBookingShape,
  getBookingById,
  makeBookingPayload,
  patchBooking,
  updateBooking,
};
