import { config } from "dotenv";
import Client from "./client/client";
import { owners } from "./config.json";
config();

new Client({ ownerID: Array.isArray(owners) ? owners : [] }).start();
