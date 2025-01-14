import {BaseResourceStore, BasicRepresentation, Representation, ResourceIdentifier} from "@solid/community-server";
import fetch from 'node-fetch';
import {RepresentationPreferences} from "@solid/community-server/dist/ldp/representation/RepresentationPreferences";
const parseContentType = require('content-type').parse;

export class HttpGetStore extends BaseResourceStore {
    private readonly url: string;

    public constructor(options: {
        url: string;
    }) {
        super();
        this.url = options.url;
    }

    /**
     * Retrieves a JSON representation of events in the calender.
     */
    public async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences): Promise<Representation> {
        const response = await fetch(this.url);
        const text = await response.text();
        let contentType = response.headers.get('content-type') || 'text/plain';
        contentType = parseContentType(contentType).type;

        return new BasicRepresentation(text, identifier, contentType);
    }
}