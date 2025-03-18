import qs from "qs";
import { ENTRYPOINT } from "./config";

const MIME_TYPE = "application/ld+json";

export default async function (id, options = {}) {
    if (typeof options.headers === "undefined") {
        Object.assign(options, { headers: new Headers() });
    }
    console.log(options)

    if (options.headers.get("Accept") === null) {
        options.headers.set("Accept", MIME_TYPE);
    }

    if (
        options.body !== undefined &&
        !(options.body instanceof FormData) &&
        options.headers.get("Content-Type") === null
    ) {
        options.headers.set("Content-Type", MIME_TYPE);

        if (typeof options.body === "object") {
            // options.body = JSON.stringify(options.body);
        }
    }

    if (options.params) {
        const queryString = qs.stringify(options.params);
        id = `${id}?${queryString}`;
    }

    // enable CORS for all requests
    Object.assign(options, {
        mode: "cors",
        // credentials: 'include', // when credentials needed
    });

    console.log(options)
    const response = await fetch(new URL(id, ENTRYPOINT), options);

    if (!response.ok) {
        const data = await response.json();
        const error = data["description"] || response.statusText;
        if (!data.violations) throw Error(error);

        throw new Error(error);
    }

    return response;
}