// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { NODE_ENV } = require("./config/env");
const errorMiddleware = require("./middlewares/error.middleware");
const { rateLimitMiddleware } = require("./middlewares/rateLimit.middleware");
const requestLogger = require("./middlewares/requestLogger.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const tasksRoutes = require("./modules/tasks/tasks.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const healthRoutes = require("./routes/health.routes");
const path = require("path");

const app = express();

// trust proxy (important for rate-limit & IP)
app.set("trust proxy", 1);

// security & parsing
app.use(cors({ origin: NODE_ENV === "production" ? ["https://yourdomain.com"] : "*", credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use(helmet({ contentSecurityPolicy: false }));

// logging
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/pdf", express.static(path.join(__dirname, "../public/pdf")));

// health first (no rate limit)
app.use("/api", healthRoutes);

// global limiter
app.use(rateLimitMiddleware());

// root
app.get("/", (req, res) => res.send("API Running ✅"));

// routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/menu-access", require("./modules/MenuAccess/MenuAccess.routes"));

//MASTER
app.use("/api/FrmEmployeeMstList", require("./modules/Master/FrmEmployeeMstList/FrmEmployeeMstList.route"));
app.use("/api/FrmEmployeeMstNewTest",require("./modules/Master/FrmEmployeeMstNewTest/FrmEmployeeMstNewTest.route"))
app.use("/api/FrmPayHeadListMst", require("./modules/Master/FrmPayHeadListMst/FrmPayHeadListMst.routes"));
app.use("/api/FrmDesgListMst", require("./modules/Master/FrmDesgListMst/FrmDesgListMst.routes"));
app.use("/api/FrmEmployeeMstList",require("./modules/Master/FrmEmployeeMstList/FrmEmployeeMstList.route"));
app.use("/api/CastMst", require("./modules/Master/FrmCastMst/FrmCastMstList.route"));
app.use("/api/BankList",require("./modules/Master/FrmBankListMst/FrmBankList.route"));
app.use("/api/Branchlist", require("./modules/Master/FrmBranchMst/FrmBranchMstList.route"));
app.use("/api/LeaveMaster", require("./modules/Master/FrmLeaveMst/FrmLeaveListMst.route"));
app.use("/api/LeaveApplication", require("./modules/Master/FrmLeaveApplication/FrmLeaveApplicationList.route"))
app.use("/api/FrmRelegionListMst", require("./modules/Master/FrmRelegionListMst/FrmRelegionListMst.routes"));
app.use("/api/FrmRelationListMst", require("./modules/Master/FrmRelationListMst/FrmRelationListMst.routes"));
app.use("/api/LeaveApproval", require("./modules/Master/FrmLeaveApproval/FrmLeaveApprovalList.route"))
app.use("/api/EmpleaveList",require("./modules/Master/FrmEmpLeave/FrmEmpLeaveList.route"))





// Configuration
app.use("/api/Branchconfi", require("./modules/ConfigurationP/FrmBranchConfiguration/FrmBranchConfig.route"))
app.use("/api/BankConfig", require("./modules/ConfigurationP/FrmBankConfiguration/FrmBankConfig.route"))
app.use("/api/LeaveConfig", require("./modules/ConfigurationP/FrmLeaveConfiguration/FrmLeaveConfig.route"))
app.use("/api/PayScaConfig", require("./modules/ConfigurationP/FrmPayScaleConfiguration/FrmPayScaleConfig.route"))




app.use(errorMiddleware);

module.exports = app;
