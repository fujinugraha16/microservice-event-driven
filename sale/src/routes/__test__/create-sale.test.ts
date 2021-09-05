import request from "supertest";
import { app } from "../../app";

// constants
import { randomString, Role, UserPayload } from "@fujingr/common";

// helpers
import { generateCookie, extractCookie } from "@fujingr/common";
import { createSale } from "../../helpers/sale-test";
import { createItem } from "../../helpers/item-test";

// import
import { Item } from "../../models/item";

// events
import { natsWrapper } from "../../nats-wrapper";

test("send 401 when not provide cookie", async () => {
  await request(app).post("/api/sale/create").send({}).expect(401);
});

test("send 401 when provide cookie with role customer", async () => {
  const cookie = generateCookie(Role.customer);

  const response = await request(app)
    .post("/api/sale/create")
    .set("Cookie", cookie)
    .send({});

  const payload = extractCookie(cookie) as UserPayload;

  expect(response.statusCode).toEqual(401);
  expect([Role.admin, Role.employee].includes(payload.role)).not.toEqual(true);
});

test("bad request when fields not filled", async () => {
  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({})
    .expect(400);
});

test("bad request when field array not filled with array", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = ["test", "test", "test"];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field numeric not filled with numeric or less than 0", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = ["test", "test", "test"];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'retailItems' filled array string", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    ["test"],
    [
      {
        qrCode: randomString(5),
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [
          { qrCode: randomString(5), lengthInMeters: 60, lengthInYards: 59 },
        ],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'retailItems' wrong or less key of object array", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        wkoko: 50,
      },
    ],
    [
      {
        qrCode: randomString(5),
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [randomString(5)],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'wholesalerItems' filled array string", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    ["test"],
    [
      {
        price: 2_000_000,
        items: [randomString(5)],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'wholesalerItems' wrong or less key of object array", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    [
      {
        wkerw: randomString(5),
        lengthInMeters: 60,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [randomString(5)],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'lotItems' filled array string", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    [
      {
        qrCode: randomString(5),
        price: 400_000,
      },
    ],
    ["test"],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'lotItems' wrong or less key of object array", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    [
      {
        qrCode: randomString(5),
        price: 400_000,
      },
    ],
    [
      {
        werdf: ["asdfas"],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("bad request when field 'lotItems' have 'items' with wrong types", async () => {
  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = ["1_000_000", -100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    [
      {
        qrCode: randomString(5),
        lengthInMeters: 60,
        lengthInYards: 59,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [234324234],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("send 400 when sale already exist", async () => {
  const saleDoc = await createSale();

  const [code, customerName] = [saleDoc.code, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: randomString(5),
        price: 20_000,
        lengthInMeters: 50,
      },
    ],
    [
      {
        qrCode: randomString(5),
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [randomString(5)],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(400);
});

test("succeffully update items", async () => {
  const item1 = await createItem();
  const item2 = await createItem();
  const item3 = await createItem();

  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: item1.qrCode,
        price: 20_000,
        lengthInMeters: 10,
      },
    ],
    [
      {
        qrCode: item2.qrCode,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [item3.qrCode],
      },
    ],
  ];

  await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(201);

  const existingItem1 = await Item.findById(item1.id);
  const existingItem2 = await Item.findById(item2.id);
  const existingItem3 = await Item.findById(item3.id);

  expect(existingItem1!.lengthInMeters).toEqual(30);
  expect(existingItem1!.lengthInYards).toEqual(30 * 1.09);
  expect(existingItem2!.lengthInMeters).toEqual(0);
  expect(existingItem2!.lengthInYards).toEqual(0);
  expect(existingItem3!.lengthInMeters).toEqual(0);
  expect(existingItem3!.lengthInYards).toEqual(0);
});

test("send 201 and response notFoundItemsQrCode if provided", async () => {
  const qrCode1 = randomString(5);
  const qrCode2 = randomString(5);
  const qrCode3 = randomString(5);

  const [code, customerName] = [`SL-${randomString(5)}`, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: qrCode1,
        price: 20_000,
        lengthInMeters: 10,
      },
    ],
    [
      {
        qrCode: qrCode2,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [qrCode3],
      },
    ],
  ];

  const response = await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(201);

  expect(Object.keys(response.body).includes("notFoundItemsQrCode")).toEqual(
    true
  );
  expect(response.body.notFoundItems[0]).toEqual(qrCode1);
  expect(response.body.notFoundItems[1]).toEqual(qrCode2);
  expect(response.body.notFoundItems[2]).toEqual(qrCode3);
});

test("send 201 when successfully create sale", async () => {
  const item1 = await createItem();
  const item2 = await createItem();
  const item3 = await createItem();

  const saleCode = `SL-${randomString(5)}`;

  const [code, customerName] = [saleCode, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: item1.qrCode,
        price: 20_000,
        lengthInMeters: 10,
      },
    ],
    [
      {
        qrCode: item2.qrCode,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [item3.qrCode],
      },
    ],
  ];

  const response = await request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(201);

  expect(response.body.code).toEqual(saleCode);
  expect(response.body.totalQty).toEqual(3);
  expect(response.body.totalPrice).toEqual(20_000 + 400_000 + 2_000_000);
});

test("emits an sale created event", async () => {
  const item1 = await createItem();
  const item2 = await createItem();
  const item3 = await createItem();

  const saleCode = `SL-${randomString(5)}`;

  const [code, customerName] = [saleCode, "Test Customer"];
  const [totalPrice, totalQty] = [1_000_000, 100];
  const [retailItems, wholesalerItems, lotItems] = [
    [
      {
        qrCode: item1.qrCode,
        price: 20_000,
        lengthInMeters: 10,
      },
    ],
    [
      {
        qrCode: item2.qrCode,
        price: 400_000,
      },
    ],
    [
      {
        price: 2_000_000,
        items: [item3.qrCode],
      },
    ],
  ];

  request(app)
    .post("/api/sale/create")
    .set("Cookie", generateCookie())
    .send({
      code,
      customerName,
      totalPrice,
      totalQty,
      retailItems,
      wholesalerItems,
      lotItems,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
