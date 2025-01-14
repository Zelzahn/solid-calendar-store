import { expect } from "chai";
import { JsonToIcsConverter } from "../../src/json-to-ics-converter";
import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
  BadRequestHttpError,
} from "@solid/community-server";
import { convertToJSON } from "./common";

const convertToIcs = async (input: object) => {
  const inputStream = guardedStreamFrom(JSON.stringify(input));
  return await new JsonToIcsConverter().handle({
    identifier: { path: "text/calendar" },
    representation: {
      metadata: new RepresentationMetadata("text/calendar"),
      data: inputStream,
      binary: false,
    },
    preferences: {},
  });
};

describe("JsonToIcsConverter", function () {
  this.timeout(4000);

  describe("Verify converter on correct input", () => {
    it("#1", async () => {
      const event = {
        name: "Test for Solid calendar",
        events: [
          {
            title: "Correctly converted",
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
          },
        ],
      };

      const convertedRepresentation = await convertToIcs(event);
      const dataIcs = await readableToString(convertedRepresentation.data);
      const result = await convertToJSON(dataIcs);
      const dataJson = await readableToString(result.data);
      const resultTyped = JSON.parse(dataJson);

      expect(resultTyped).to.deep.equal(event);
    });

    it("#2", async () => {
      const event = {
        name: "Test for Solid calendar",
        events: [
          {
            title: "Correctly converted",
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
            description: "An event",
            location: "My room",
            url: "http://example.com",
          },
        ],
      };

      const convertedRepresentation = await convertToIcs(event);
      const dataIcs = await readableToString(convertedRepresentation.data);
      const result = await convertToJSON(dataIcs);
      const dataJson = await readableToString(result.data);
      const resultTyped = JSON.parse(dataJson);

      expect(resultTyped).to.deep.equal(event);
    });
  });

  describe("Verify converter on incorrect input", () => {
    it("#1 - 400", async () => {
      const event = {
        events: [
          {
            title: "Correctly converted",
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
          },
        ],
      };

      await expect(convertToIcs(event))
        .to.eventually.be.rejectedWith("Calendar name needs to be provided")
        .and.be.an.instanceOf(BadRequestHttpError);
    });

    it("#2 - 400", async () => {
      const event_1 = {
        name: "Test for Solid calendar",
        events: [
          {
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
          },
        ],
      };

      await expect(convertToIcs(event_1))
        .to.eventually.be.rejectedWith(
          "Each event needs a title to be provided"
        )
        .and.be.an.instanceOf(BadRequestHttpError);

      const event_2 = {
        name: "Test for Solid calendar",
        events: [
          {
            title: "Correctly converted",
            endDate: "2021-04-08T17:00:00.000Z",
          },
        ],
      };

      await expect(convertToIcs(event_2))
        .to.eventually.be.rejectedWith(
          "Each event needs a startDate to be provided"
        )
        .and.be.an.instanceOf(BadRequestHttpError);

      const event_3 = {
        name: "Test for Solid calendar",
        events: [
          {
            startDate: "2021-04-08T15:00:00.000Z",
            title: "Correctly converted",
          },
        ],
      };

      await expect(convertToIcs(event_3))
        .to.eventually.be.rejectedWith(
          "Each event needs an endDate to be provided"
        )
        .and.be.an.instanceOf(BadRequestHttpError);
    });
  });
});
