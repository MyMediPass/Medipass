"use client";

import { init } from "@instantdb/react";
import schema from "@/instant.schema";

// ID for app: medipass
const APP_ID = "2b6eeee0-8b48-45af-9fe3-07dd73520df1";

const db = init({ appId: APP_ID, schema });

export { db, schema };