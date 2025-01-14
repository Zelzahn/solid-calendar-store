import {
  BadRequestHttpError,
  BasicRepresentation,
  InternalServerError,
  readableToString,
  Representation,
  RepresentationConverterArgs,
  TypedRepresentationConverter,
} from "@solid/community-server";

interface Event {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  url?: string;
  location?: string;
}

const ICAL = require("ical.js");
const outputType = "application/json";

export class IcsToJsonConverter extends TypedRepresentationConverter {
  public constructor() {
    super("text/calendar", outputType);
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    const data = await readableToString(representation.data);
    const events: Event[] = [];

    if (!data || !data.length)
      throw new BadRequestHttpError("Empty input is not allowed");

    const jcalData = ICAL.parse(data);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    for (const vevent of vevents) {
      const summary = vevent.getFirstPropertyValue("summary");

      if (!summary)
        throw new BadRequestHttpError("Summary needs to be provided");

      let startDate = vevent.getFirstPropertyValue("dtstart");

      if (!startDate)
        throw new BadRequestHttpError("Dtstart needs to be provided");

      startDate = new Date(startDate).toISOString();
      let endDate = vevent.getFirstPropertyValue("dtend");
      endDate = new Date(endDate).toISOString();

      const event: Event = {
        title: summary,
        startDate,
        endDate,
      };

      if (vevent.hasProperty("description"))
        event.description = vevent.getFirstPropertyValue("description");
      if (vevent.hasProperty("url"))
        event.url = vevent.getFirstPropertyValue("url");
      if (vevent.hasProperty("location"))
        event.location = vevent.getFirstPropertyValue("location");

      events.push(event);
    }

    const calendar = {
      name: vcalendar.getFirstPropertyValue("x-wr-calname") as string,
      events,
    };

    if (!calendar || !calendar.name || !calendar.name.trim().length)
      throw new InternalServerError("No calendar name found");

    return new BasicRepresentation(
      JSON.stringify(calendar),
      representation.metadata,
      outputType
    );
  }
}
