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
app.use("/api/FrmEmployeeMstNewTest", require("./modules/Master/FrmEmployeeMstNewTest/FrmEmployeeMstNewTest.route"));
app.use("/api/FrmPayHeadListMst", require("./modules/Master/FrmPayHeadListMst/FrmPayHeadListMst.routes"));
app.use("/api/FrmDesgListMst", require("./modules/Master/FrmDesgListMst/FrmDesgListMst.routes"));
app.use("/api/FrmEmployeeMstList", require("./modules/Master/FrmEmployeeMstList/FrmEmployeeMstList.route"));
app.use("/api/CastMst", require("./modules/Master/FrmCastMst/FrmCastMstList.route"));
app.use("/api/BankList", require("./modules/Master/FrmBankListMst/FrmBankList.route"));
app.use("/api/Branchlist", require("./modules/Master/FrmBranchMst/FrmBranchMstList.route"));
app.use("/api/LeaveMaster", require("./modules/Master/FrmLeaveMst/FrmLeaveListMst.route"));
app.use("/api/LeaveApplication", require("./modules/Master/FrmLeaveApplication/FrmLeaveApplicationList.route"));
app.use("/api/FrmRelegionListMst", require("./modules/Master/FrmRelegionListMst/FrmRelegionListMst.routes"));
app.use("/api/FrmRelationListMst", require("./modules/Master/FrmRelationListMst/FrmRelationListMst.routes"));
app.use("/api/LeaveApproval", require("./modules/Master/FrmLeaveApproval/FrmLeaveApprovalList.route"));
app.use("/api/EmpleaveList", require("./modules/Master/FrmEmpLeave/FrmEmpLeaveList.route"));
app.use("/api/FrmPayCommissionListMst", require("./modules/Master/FrmPayCommissionListMst/FrmPayCommissionListMst.routes"));
app.use("/api/FrmPayScaleListMst", require("./modules/Master/FrmPayScaleListMst/FrmPayScaleListMst.routes"));
app.use("/api/FrmDeptListMst", require("./modules/Master/FrmDeptListMst/FrmDeptListMst.route"));
// app.use("/api/FrmBillGeneration", require("./modules/Master/FrmBillGeneration/FrmBillGeneration.route"));
// app.use("/api/FrmEsevaReport", require("./modules/Master/FrmEsevaReport/FrmEsevaReport.route"));
// app.use("/api/FrmLoanAndAdvancedReceived", require("./modules/Master/FrmLoanAndAdvancedReceived.route"));

// Configuration
app.use("/api/Branchconfi", require("./modules/ConfigurationP/FrmBranchConfiguration/FrmBranchConfig.route"))
app.use("/api/BankConfig", require("./modules/ConfigurationP/FrmBankConfiguration/FrmBankConfig.route"))
app.use("/api/LeaveConfig", require("./modules/ConfigurationP/FrmLeaveConfiguration/FrmLeaveConfig.route"))
app.use("/api/PayScaConfig", require("./modules/ConfigurationP/FrmPayScaleConfiguration/FrmPayScaleConfig.route"))
app.use("/api/FrmPayHeadConfigList", require("./modules/ConfigurationP/FrmPayHeadConfigList/FrmPayHeadConfigList.routes"))
app.use("/api/FrmBankRecovery", require("./modules/ConfigurationP/FrmBankRecovery/FrmBankRecovery.routes"));
app.use("/api/PayCommConf", require("./modules/ConfigurationP/FrmPayCommissionConfiguration/FrmPayCommissionConfig.route"))
app.use("/api/RelaCongif", require("./modules/ConfigurationP/FrmRelationConfiguration/FrmRelationConfig.route"))
app.use("/api/ReligConfig", require("./modules/ConfigurationP/FrmReligionConfiguration/FrmReligionConfig.route"))

//Transaction
app.use("/api/FrmMonthClose", require("./modules/Transaction/FrmMonthClose/FrmMonthClose.route"))
app.use("/api/FrmSalaryCalculation", require("./modules/Transaction/FrmSalaryCalculation/FrmSalaryCalculation.route"))
app.use("/api/FrmSalaryCalulation", require("./modules/Transaction/FrmSalaryCalulation/FrmSalaryCalulation.routes"))
app.use("/api/FrmAttendanceEntry", require("./modules/Transaction/FrmAttendanceEntry/FrmAttendanceEntry.routes"))
app.use("/api/FrmEmpTransferApproval", require("./modules/Transaction/FrmEmpTransferApproval/FrmEmpTransferApproval.route"))
app.use("/api/FrmOtherEarnEntryList", require("./modules/Transaction/FrmOtherEarnEntryList/FrmOtherEarnEntryList.routes"))

//Reports
app.use("/api/FrmSalaryConsolidationBanks", require("./modules/Reports/FrmSalaryConsolidationBanks/FrmSalaryConsolidationBanks.route"))
app.use("/api/FrmEmpSalPayheadsReport", require("./modules/Reports/FrmEmpSalPayheadsReport/FrmEmpSalPayheadsReport.route"))
app.use("/api/FrmOTherEarnEntryRpt", require("./modules/Reports/FrmOTherEarnEntryRpt/FrmOTherEarnEntryRpt.route"))
app.use("/api/RptLeaveStatus", require("./modules/Reports/RptLeaveStatus/RptLeaveStatus.route"))
app.use("/api/RptIncPromotion", require("./modules/Reports/RptIncPromotion/RptIncPromotion.route"))
app.use("/api/FrmEmpPayHeadListRpt", require("./modules/Reports/FrmEmpPayHeadListRpt/FrmEmpPayHeadListRpt.routes"))
app.use("/api/FrmPayrollDashbordMst", require("./modules/Reports/FrmPayrollDashbordMst/FrmPayrollDashbordMst.routes"))
app.use("/api/FrmPayHeadList", require("./modules/Reports/FrmPayHeadList/FrmPayHeadList.routes"))
app.use("/api/FrmPayrollReport", require("./modules/Reports/FrmPayrollReport/FrmPayrollReport.route"))
app.use("/api/FrmEmpLstRpt", require("./modules/Reports/FrmEmpLstRpt/FrmEmpLstRpt.routes"))

//Loans and Advances
app.use("/api/FrmBankLoanMstList", require("./modules/Loans/FrmBankLoanMstList/FrmBankLoanMstList.route"))
app.use("/api/FrmIncreamentPramotionMst", require("./modules/Loans/FrmIncreamentPramotionMst/FrmIncreamentPramotionMst.route"))

app.use(errorMiddleware);

app.use("/api/FrmPayrollReport", require("./modules/Reports/FrmPayrollReport/FrmPayrollReport.route"));
app.use("/api/FrmLoansAndAdvancesReceived", require("./modules/Reports/FrmLoansAndAdvancesReceived/FrmLoansAndAdvancesReceived.routes"));
app.use("/api/FrmLoansAndAdvancesRpt", require("./modules/Reports/FrmLoansAndAdvancesRpt/FrmLoansAndAdvancesRpt.route"));
app.use("/api/FrmNetPayRpt", require("./modules/Reports/FrmNetPayRpt/FrmNetPayRpt.route"));
app.use("/api/FrmDeductionPayheadsDtls", require("./modules/Reports/FrmDeductionPayheadsDtls/FrmDeductionPayheadsDtls.route"));
app.use("/api/FrmEsevaReport", require("./modules/Reports/FrmEsevaReport/FrmEsevaReport.route"));
module.exports = app;