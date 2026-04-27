"use strict";
exports.config = {
    app_name: [`${process.env.NEW_RELIC_APP_NAME}`],
    license_key: `${process.env.NEW_RELIC_LICENSE_KEY}`,
    logging: {
        level: "info",
    },
    distributed_tracing: {
        enabled: true,
    },
    allow_all_headers: true,
    attributes: {
        exclude: ["request.headers.cookie", "response.headers.cookie"],
    },
    application_logging: {
        enabled: true
    },
};