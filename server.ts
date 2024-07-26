import { createServer } from "http";
import next from "next";
import CronJob from "./src/service/cron-job";
import { parse } from "url";
import "dotenv/config";

const port = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.MODE !== "DEV";
const app = next({ dev: !isProduction });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, async () => {
    CronJob();
    console.log(
      `> Server listening at http://localhost:${port} as ${
        !isProduction ? "development" : process.env.MODE
      }`
    );
  });
});

