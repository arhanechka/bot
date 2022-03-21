import axiousApi from "./axious-api";
import { Data } from "./data";

const existingTown = "Kyiv";
const nonExistingTown = "Any";

describe("`Api Service`", () => {
  beforeEach(() => {
    Data.set("temperature", undefined);
  });

  it("should get temperature for existing towns", async () => {
    await axiousApi(existingTown);
    expect(Data.get("temperature")).toBeDefined();
  });

  it("should not get temperature for non-existing towns", async () => {
    await axiousApi(nonExistingTown);
    expect(Data.get("temperature")).toBe(undefined);
  });

  it("should get status code 200 for existing towns", async () => {
    const response = await axiousApi(existingTown);
    expect(response?.status).toBe(200);
  });

  it("should get status code 404 for non-existing towns", async () => {
    const response = await axiousApi(nonExistingTown);
    expect(response.response?.status).toBe(404);
  });
});
