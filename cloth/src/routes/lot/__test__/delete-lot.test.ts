import request from "supertest";
import { app } from "../../../app";

// constants
import { Role, UserPayload } from "@fujingr/common";

// helpers
import { generateCookie, extractCookie, randomString } from "@fujingr/common";
import { createArticle } from "../../../helpers/article-test";
import { createLot, id } from "../../../helpers/lot-test";

// models
import { Lot } from "../../../models/lot";
import { Design } from "../../../models/design";
import { Item } from "../../../models/item";

test("send 401 when not provide cookie", async () => {
  await request(app).delete("/api/cloth/lot/delete/asdfas").expect(401);
});

test("send 401 when provide cookie with role customer", async () => {
  const cookie = generateCookie(Role.customer);

  const response = await request(app)
    .delete("/api/cloth/lot/delete/asdfas")
    .set("Cookie", cookie);

  const payload = extractCookie(cookie) as UserPayload;

  expect(response.statusCode).toEqual(401);
  expect([Role.admin, Role.employee].includes(payload.role)).not.toEqual(true);
});

test("bad request when param 'id' invalid", async () => {
  await request(app)
    .delete("/api/cloth/lot/delete/asdfas")
    .set("Cookie", generateCookie())
    .expect(400);
});

test("send 404 if lot not found", async () => {
  await request(app)
    .delete(`/api/cloth/lot/delete/${id}`)
    .set("Cookie", generateCookie())
    .expect(404);
});

test("designs and items has been deleted", async () => {
  const articleDoc = await createArticle();

  const [pureLotCode, article, supplier] = [
    randomString(5),
    articleDoc.id,
    "PT. Aliex Retail",
  ];
  const designs = [
    {
      code: "123",
      name: "test",
      color: "#fff",
      items: [{ length: 10, qty: 1 }],
    },
  ];

  await request(app)
    .post("/api/cloth/lot/create")
    .set("Cookie", generateCookie())
    .send({ pureLotCode, article, supplier, designs })
    .expect(201);

  const lot = await Lot.findOne({ pureLotCode });
  let totalDesignDocs = await Design.find().countDocuments();
  let totalItemDocs = await Item.find().countDocuments();

  expect(totalDesignDocs).toEqual(1);
  expect(totalItemDocs).toEqual(1);

  await request(app)
    .delete(`/api/cloth/lot/delete/${lot!.id}`)
    .set("Cookie", generateCookie())
    .expect(204);

  totalDesignDocs = await Design.find().countDocuments();
  totalItemDocs = await Item.find().countDocuments();

  expect(totalDesignDocs).toEqual(0);
  expect(totalItemDocs).toEqual(0);
});

test("successfully deleted lot", async () => {
  const lot = await createLot();

  await request(app)
    .delete(`/api/cloth/lot/delete/${lot.id}`)
    .set("Cookie", generateCookie())
    .expect(204);

  const checkLot = await Lot.findById(lot.id);
  expect(checkLot).toBeNull();
});
