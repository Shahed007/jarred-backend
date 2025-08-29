import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {Application, NextFunction, Request, Response} from "express";
import httpStatus from "http-status";
import path from "path";
import {initializeCronJobs} from "./app/jobs";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import {PaymentController} from "./app/modules/Payment/payment.controller";
import router from "./app/routes";

const app: Application = express();

export const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8002",
        "http://10.0.10.74:3000", "http://172.252.13.76:8002",
        "https://crolling.com","www.crolling.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.post(
    "/webhook",
    express.raw({type: "application/json"}),
    PaymentController.paymentWebhook
);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({limit: "20mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Route handler for the root endpoint
app.get("/", (req: Request, res: Response) => {
    res.send({
        message: "How's Project API",
    });
});

// app.use("/uploads", express.static(path.join("/var/www/uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // Serve static files from the "uploads" directory

// Log incoming requests
// app.use((req: Request, res: Response, next: NextFunction) => {
//   logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
//   next();
// });

// Setup API routes
app.use("/api/v1", router);

// health check
app.get("/api/v1/health", (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: "Server is healthy",
    });
});

// Error handling middleware
app.use(GlobalErrorHandler);

initializeCronJobs();

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});

export default app;
