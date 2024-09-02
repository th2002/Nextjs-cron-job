import { createServer } from "http";
import next from "next";
import CronJob from "./src/service/cron-job";
import { parse } from "url";
import "dotenv/config";
import logger from "./src/service/logger";

const port = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.MODE !== "DEV";
const app = next({ dev: !isProduction });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, async () => {
      CronJob();
      logger.info(
        `Server listening at http://localhost:${port} as ${
          !isProduction ? "development" : process.env.MODE
        }`
      );
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
      });
    });
  })
  .catch((err) => {
    logger.error("Error starting server:", err);
    process.exit(1);
  });

