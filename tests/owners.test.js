const request = require("supertest");
const app = require("../app");
const Owner = require("../models/Owner");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("jsonwebtoken");

describe("/owners", () => {
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
    await Owner.create([
      { userName: "don_draper", password: "qwertyuiop" }
      // { userName: "mary_smiths", password: "asdfghjkl" }
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await Owner.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("[GET]/owners", () => {
    it("returns all owners", () => {
      const expectedOwners = [
        { userName: "don_draper", password: "qwertyuiop" }
      ];
      return request(app)
        .get("/owners")
        .expect(200)
        .expect(({ body: owners }) => {
          expect(owners[0].userName).toEqual(expectedOwners[0].userName);
        });
    });
  });

  describe("[POST]", () => {
    it("/owners/new adds a new owner", async () => {
      const expectedOwners = [
        { userName: "don_draper", password: "qwertyuiop" },
        { userName: "mary_waters", password: "asdfghjkl" }
      ];
      const addOwner = { userName: "mary_waters", password: "asdfghjkl" };
      await request(app)
        .post("/owners/new")
        .send(addOwner)
        .expect(200);
      // .expect(({ body: actualOwners }) => {
      //   expectedOwners.forEach((owner, index) => {
      //     expect(actualOwners[index]).toEqual(expect.objectContaining(owner));
      //   });
      // });
    });

    it("/owners/login logs in the user", async () => {
      const userName = "don_draper";
      const password = "qwertyuiop";
      // const bcrypt = require("bcryptjs");
      const { body: owner } = await request(app)
        .post("/owners/login")
        .send({ userName, password })
        .expect(200);
      // expect(bcrypt.compare(password, owner.password)).toBe(true);
    });
  });

  describe("[GET]/owners/:firstname - protected routes", () => {
    it("denies access when no token is provided", async () => {
      await request(app)
        .get("/owners/don")
        .expect(401);

      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("denies access when owner is not authorised", async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("Unauthorised");
      });
      await request(app)
        .get("/owners/notAuthorised")
        .set("Cookie", "token=invalid-token")
        .expect(401);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });

    it("grants access when owner is authorised", async () => {
      jwt.verify.mockReturnValueOnce({});

      await request(app)
        .get("/owners/don")
        //to insert item in headers
        .set("Cookie", "token=valid-token")
        .expect(200);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });
  });
});
