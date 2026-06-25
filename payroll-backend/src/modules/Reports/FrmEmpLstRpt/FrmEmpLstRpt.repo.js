const { executeQuery } = require("../../../db/queryExecutor");

async function getEmployeeListRepo({
    ulbid,
    empId,
    categoryId,
    deptId,
    desigId,
    gender,
    empStatus
}) {
    let sql = "select * from VWEMPDTL ";
    sql += " where num_employee_ulbid='" + ulbid + "'";

    if (empId && empId.trim() !== "") {
        sql += " and empid=" + empId;
    }

    sql += " and paysheetid = '" + categoryId + "'";

    if (deptId && deptId !== "-1") {
        sql += " and deptid='" + deptId + "'";
    }

    if (desigId && desigId !== "-1") {
        sql += " and desigid='" + desigId + "'";
    }

    if (gender === "both") {
        sql += " and genderf in('M','F') ";
    } else {
        sql += " and genderf = '" + gender + "'";
    }

    sql += " and emptypeF = '" + empStatus + "'";

    const result = await executeQuery(sql);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.rows;
}

module.exports = {
    getEmployeeListRepo
};