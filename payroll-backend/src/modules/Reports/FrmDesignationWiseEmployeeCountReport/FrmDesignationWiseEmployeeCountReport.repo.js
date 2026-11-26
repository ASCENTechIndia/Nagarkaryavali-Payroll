const { executeQuery } = require("../../../db/queryExecutor");

async function getDepartmentListRepo({ ulbid }) {
    const sql = `
        SELECT deptname, deptid
        FROM vw_deptconfig
        WHERE ulbid = :ulbid
        ORDER BY deptname
    `;
    const result = await executeQuery(sql, { ulbid });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getDesigwiseEmpCountRepo({ ulbid, deptId, lstdate }) {
    const binds = { ulbid, lstdate };

    let query = `
        SELECT
            desigid,
            designation,
            SUM(working)              AS working,
            SUM(rikt)                 AS rikt,
            SUM(working) + SUM(rikt)  AS post
        FROM VW_AKRITIBANDH_DESIGNATION_SUMMARY
        WHERE ulbid   = :ulbid
          AND saldate = TO_DATE(:lstdate, 'DD-MON-YYYY')
    `;

    if (deptId != null && String(deptId) !== "-1" && String(deptId) !== "0" && deptId !== "") {
        query += ` AND deptid = :deptId`;
        binds.deptId = Number(deptId);
    }

    query += `
        GROUP BY desigid, designation
        ORDER BY designation
    `;

    const result = await executeQuery(query, binds);
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

module.exports = {
    getDepartmentListRepo,
    getDesigwiseEmpCountRepo,
};
