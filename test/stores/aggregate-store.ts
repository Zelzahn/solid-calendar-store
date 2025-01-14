import { expect } from "chai";
import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import { correctConfig, getEndpoint, aggregateNameConfig } from "./common";

describe("AggregateStore", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  describe("Default", () => {
    before(async () => {
      await cssServer.start(correctConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Aggregate should concat the events", async () => {
      const expectedResult = {
        events: [
          {
            description: "It works ;)",
            location: "my room",
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "[my first iCal] Example Event",
            url: "http://example.com/",
          },
          {
            description: "It works ;)",
            location: "my room",
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "[my first iCal] Example Event",
            url: "http://example.com/",
          },
        ],
      };

      const result = await getEndpoint("aggregate");

      expect(result).excluding("name").to.deep.equal(expectedResult);
    });

    it("Default name is used", async () => {
      const expectedResult = {
        name: "Aggregated calendar of my first iCal and my first iCal",
      };

      const result = await getEndpoint("aggregate");

      expect(result).excluding("events").to.deep.equal(expectedResult);
    });
  });

  describe("Alternate", function () {
    before(async () => {
      await cssServer.start(aggregateNameConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Calendar name is the custom defined name", async () => {
      const expectedResult = {
        name: "Custom calendar name",
      };

      const result = await getEndpoint("aggregate");

      expect(result).excluding("events").to.deep.equal(expectedResult);
    });
  });
});
