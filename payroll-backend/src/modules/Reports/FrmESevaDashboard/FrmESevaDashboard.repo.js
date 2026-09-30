const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");

async function getVibhagDashboardRepo({ ulbid }) {
    const sql = `
        SELECT zone_id,
               TOTALEMP,
               PROCCEDEMP,
               PENDINGEMP,
               VAR_ZONE_NAME
        FROM   v_eseva_dashbord
        WHERE  num_employee_ulbid = :ulbid
        ORDER  BY VAR_ZONE_NAME
    `;
    return await executeQuery(sql, { ulbid });
}

async function getEmployeeListRepo({ ulbid, vibhagId, pendingFlag = null }) {
    const sql = `
        SELECT ZONE_NAME,
               DEPTNAMEE,
               ENGNAME,
               JOINDATE,
               RETIREMNTDATE,
               PENDING,
               VIBHAGID,
               ULBID,
               Status
        FROM   v_eseva_dashbord_list
        WHERE  ULBID    = :ulbid
        AND    VIBHAGID = :vibhagId
        AND    (:pendingFlag IS NULL OR PENDING = :pendingFlag)
        ORDER  BY ENGNAME
    `;
    return await executeQuery(sql, { ulbid, vibhagId, pendingFlag });
}

module.exports = {
    getVibhagDashboardRepo,
    getEmployeeListRepo
};