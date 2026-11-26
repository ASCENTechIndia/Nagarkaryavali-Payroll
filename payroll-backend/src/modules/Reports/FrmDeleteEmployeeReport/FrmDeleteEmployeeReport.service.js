const repo = require("./FrmDeleteEmployeeReport.repo");
const { AppError } = require("../../../libs/errors");

async function getDepartmentListService({ ulbid }) {
    if (!ulbid) throw new AppError("ulbid is required", 400);

    const data = await repo.getDepartmentListRepo({ ulbid: Number(ulbid) });
    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getBillNoListService({ ulbid, deptId }) {
    if (!ulbid) throw new AppError("ulbid is required", 400);

    const data = await repo.getBillNoListRepo({
        ulbid: Number(ulbid),
        deptId: deptId || "-1",
    });

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getDeleteEmployeeReportService({ ulbid, deptId, billNo, empName, slipNo }) {
    if (!ulbid) throw new AppError("ulbid is required", 400);

    const data = await repo.getDeleteEmployeeReportRepo({
        ulbid: Number(ulbid),
        deptId: deptId || "-1",
        billNo: billNo || "-1",
        empName: empName || "",
        slipNo: slipNo || "",
    });

    if (!data || data.length === 0) {
        throw new AppError("Record not Found", 404);
    }

    return {
        success: true,
        count: data.length,
        data,
        filters: {
            ulbid,
            deptId: deptId || "-1",
            billNo: billNo || "-1",
            empName: empName || "",
            slipNo: slipNo || "",
        },
    };
}

module.exports = {
    getDepartmentListService,
    getBillNoListService,
    getDeleteEmployeeReportService,
};
