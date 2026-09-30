const repo = require("./FrmESevaDashboard.repo");

async function getVibhagDashboardService({ ulbid }) {
    if (!ulbid) throw new Error("ulbid is required");

    const result = await repo.getVibhagDashboardRepo({ ulbid });
    if (!result.success) throw new Error(result.error);

    return result.rows;
}

async function getEmployeeListService({ ulbid, vibhagId, type }) {
    if (!ulbid)    throw new Error("ulbid is required");
    if (!vibhagId) throw new Error("vibhagId is required");
    if (!type)     throw new Error("type is required");

    let pendingFlag = null;
    if (type === "Proceed") {
        pendingFlag = "Y";
    } else if (type === "Pending") {
        pendingFlag = "N";
    } else if (type === "Total") {
        pendingFlag = null;
    } else {
        throw new Error("Invalid type. Allowed: Total | Proceed | Pending");
    }

    const result = await repo.getEmployeeListRepo({ ulbid, vibhagId, pendingFlag });
    if (!result.success) throw new Error(result.error);

    return result.rows;
}

module.exports = {
    getVibhagDashboardService,
    getEmployeeListService
};