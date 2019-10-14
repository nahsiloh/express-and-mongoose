const request = require("supertest");
const app = require("../app");
const Kitten = require("../models/Kitten");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

describe("/kittens", () => {
  // jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
  let mongoServer;
  beforeAll(async () => {
    try {
      mongoServer = new MongoMemoryServer();
      const mongoUri = await mongoServer.getConnectionString();
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
    } catch (err) {
      console.error(err);
    }
  });

  beforeEach(async () => {
    await Kitten.create([
      { name: "fluffy", age: 5, sex: "female" },
      { name: "puffy", age: 5, sex: "female" }
    ]);
  });

  afterEach(async () => {
    await Kitten.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("[GET]/kittens", () => {
    it("returns all kittens", async () => {
      const expectedKittens = [
        { name: "fluffy", age: 5, sex: "female" },
        { name: "puffy", age: 5, sex: "female" }
      ];

      const {body: actualKittens} = await request(app)
          .get("/kittens")
          .expect(200)
          .expect(({ body: actualKittens }) => {
            expectedKittens.forEach((kitten, index) => {
              expect(actualKittens[index]).toEqual(
                expect.objectContaining(kitten)
              );
            });
          })
      );
    });
  });

  describe("[POST]", () => {
    it("/kittens/new adds a new Kitten", () => {
      const expectedKittens = [
        { name: "fluffy", age: 5, sex: "female" },
        { name: "puffy", age: 5, sex: "female" },
        { name: "waffle", age: 5, sex: "male" }
      ];
      const addKitten = { name: "waffle", age: 5, sex: "male" };
      return request(app)
        .post("/kittens/new")
        .send(addKitten)
        .expect(200);
      // .expect(data => {
      //   expectedKittens.forEach((kitten, index) => {
      //     expect(data.body[index]).toEqual(expect.objectContaining(kitten));
      //   });
      // });
    });
  });

  describe("[PATCH]", () => {
    it("/kittens/:name updates a kitten", () => {
      const expectedKittens = [
        { name: "muffin", age: 5, sex: "male" },
        { name: "puffy", age: 5, sex: "female" },
        { name: "waffle", age: 5, sex: "male" }
      ];
      const newUpdate = { name: "muffin", age: 5, sex: "male" };
      return request(app)
        .patch("/kittens/fluffy")
        .send(newUpdate)
        .expect(200)
        .expect(data => {
          expect(data.body[0]).toEqual(
            expect.objectContaining(expectedKittens[0])
          );
        });
    });
  });

  describe("[DELETE]", () => {
    it("/kittens/:name deletes a kitten", () => {
      const expectedKittens = [{ name: "puffy", age: 5, sex: "female" }];
      return request(app)
        .delete("/kittens/fluffy")
        .expect(200)
        .expect(data => {
          expect(data.body[0]).toEqual(
            expect.objectContaining(expectedKittens[0])
          );
        });
    });
  });
});
