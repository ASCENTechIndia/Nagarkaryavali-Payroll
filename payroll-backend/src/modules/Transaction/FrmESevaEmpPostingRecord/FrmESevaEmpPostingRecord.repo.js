const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");
const getConnection = require("../../../config/db");

async function getServiceDropdownRepo() {
  console.log("📤 Repo: Fetch Service Dropdown");

  const sql = `
        SELECT VAR_ESEVAPOSTSERV_NAME AS DISPLAY_TEXT,
               NUM_ESEVAPOSTSERV_ID   AS VALUE_ID
        FROM   aopr_esevapostserv_mas
        ORDER  BY VAR_ESEVAPOSTSERV_NAME
    `;

  const result = await executeQuery(sql, {});
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getPostingRecordRepo({ ulbid, empId, esevaEmpId }) {
  console.log("📤 Repo: Fetch Posting Record", { ulbid, empId, esevaEmpId });

  let connection;
  try {
    connection = await getConnection();

    const sql = `
            SELECT a.num_postingrecord_id,
                   a.num_postingrecord_empcode       AS empcode,
                   a.num_postingrecord_ulbid         AS ulbid,
                   a.num_postingrecord_esevaid       AS esevaid,
                   TO_CHAR(a.dat_postingrecord_fromdate, 'dd-MM-yyyy') AS fromdate,
                   TO_CHAR(a.dat_postingrecord_todate,   'dd-MM-yyyy') AS todate,
                   a.var_postingrecord_postheld      AS postheld,
                   a.var_postingrecord_dept          AS departmentname,
                   a.var_postingrecord_designation   AS designation,
                   a.num_postingrecord_recordnum     AS recordnum,
                   a.BLOB_POSTINGRECORD_SIGN         AS BLOB_SIGN,
                   a.num_postingrecord_serviceid     AS serviceid,
                   m.VAR_ESEVAPOSTSERV_NAME          AS service,
                   a.VAR_POSTINGRECORD_PURPOSE       AS purpose
            FROM   aopr_postingrecord_det a
            INNER JOIN aopr_esevapostserv_mas m
                    ON m.NUM_ESEVAPOSTSERV_ID = a.num_postingrecord_serviceid
            WHERE  a.num_postingrecord_ulbid   = :ulbid
              AND  a.num_postingrecord_empcode = :empId
              AND  a.num_postingrecord_esevaid = :esevaEmpId
        `;

    const result = await connection.execute(
      sql,
      { ulbid, empId, esevaEmpId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (!result.rows || result.rows.length === 0) return [];

    const readLob = async (lob) => {
      if (!lob) return null;
      if (Buffer.isBuffer(lob)) return lob;
      if (lob && typeof lob === "object" && typeof lob.on === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          lob.on("data", (chunk) => chunks.push(chunk));
          lob.on("error", reject);
          lob.on("end", () => resolve(Buffer.concat(chunks)));
        });
      }
      return null;
    };

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        const signBuffer = await readLob(row.BLOB_SIGN);
        return {
          NUM_POSTINGRECORD_ID: row.NUM_POSTINGRECORD_ID,
          EMPCODE: row.EMPCODE,
          ULBID: row.ULBID,
          ESEVAID: row.ESEVAID,
          FROMDATE: row.FROMDATE,
          TODATE: row.TODATE,
          POSTHELD: row.POSTHELD,
          DEPARTMENTNAME: row.DEPARTMENTNAME,
          DESIGNATION: row.DESIGNATION,
          RECORDNUM: row.RECORDNUM,
          SERVICEID: row.SERVICEID,
          SERVICE: row.SERVICE,
          PURPOSE: row.PURPOSE,
          BLOB_SIGN: signBuffer ? signBuffer.toString("base64") : null,
        };
      }),
    );

    return rows;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

async function insertPostingRecordRepo(payload) {
  console.log("Repo: Insert Posting Record", payload);

  const result = await executeProcedure({
    sql: `
            BEGIN
                aopr_postingrecord_ins(
                    :in_UserId,
                    :in_Mode,
                    :in_empcode,
                    :in_UlbId,
                    :in_esevaid,
                    :IN_STR,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
    binds: {
      in_UserId: payload.userid || "ADMIN",
      in_Mode: {
        val: Number(payload.mode) || 1,
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
      },
      in_empcode: {
        val: Number(payload.empid) || 0,
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
      },
      in_UlbId: {
        val: Number(payload.ulbid) || 0,
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
      },
      in_esevaid: {
        val: Number(payload.esevaempid) || 0,
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
      },
      IN_STR: payload.STR || "",
      out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_ErrorMsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
    },
  });

  console.log("Procedure Result =>", result);

  if (!result.success) throw new Error(result.error);

  return result.outBinds;
}

async function updateSignatureBlobRepo({ recordId, imageBuffer, empId, ulbid, esevaEmpId }) {
    console.log("Repo: updateSignatureBlobRepo", {
        recordId, empId, ulbid, esevaEmpId,
        bufferType: typeof imageBuffer,
        isBuffer:   Buffer.isBuffer(imageBuffer),
        bufferSize: imageBuffer?.length ?? 0
    });

    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error(`Invalid imageBuffer for recordId=${recordId}`);
    }

    let connection;
    try {
        connection = await getConnection();

        const sql = `
            UPDATE aopr_postingrecord_det
            SET    blob_postingrecord_sign = :img
            WHERE  num_postingrecord_recordnum = :recordId
              AND  num_postingrecord_empcode   = :empId
              AND  num_postingrecord_ulbid     = :ulbid
              AND  num_postingrecord_esevaid   = :esevaEmpId
        `;

        const result = await connection.execute(
            sql,
            {
                img:        { val: imageBuffer, dir: oracledb.BIND_IN, type: oracledb.BLOB },
                recordId:   Number(recordId),
                empId:      Number(empId),
                ulbid:      Number(ulbid),
                esevaEmpId: Number(esevaEmpId),
            },
            { autoCommit: true }
        );

        console.log(`BLOB updated: rowsAffected=${result.rowsAffected}`);

        return { success: true, rowsAffected: result.rowsAffected };
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

module.exports = {
  getServiceDropdownRepo,
  getPostingRecordRepo,
  insertPostingRecordRepo,
  updateSignatureBlobRepo,
};
