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

async function getSalaryDetailRepo({
    lstdate,
    ulbid,
    deptId,
    gender
}) {
    try {
        /*
         * ============================================================
         * 1. DEDUCTION QUERY
         * ============================================================
         */
        let deductionQuery = `
            SELECT
                var_payheads_shortname AS payheads_ename,
                SUM(num_salarydtl_amount) AS amount
            FROM aopr_salarydtl_def

            INNER JOIN aopr_salary_def
                ON num_salary_ulbid = num_salarydtl_ulbid
                AND date_salary_saldate = num_salarydtl_saldate
                AND num_salary_empid = num_salarydtl_empid

            INNER JOIN aopr_employee_def
                ON num_employee_ulbid = num_salary_ulbid
                AND num_employee_empid = num_salary_empid

            INNER JOIN aopr_payheads_def
                ON num_salarydtl_payheadid = num_payheads_id
                AND num_salarydtl_ulbid = num_payheads_ulbid

            WHERE num_payhead_subheadid = 55
              AND num_salarydtl_saldate = TO_DATE(:lstdate, 'DD-MM-YYYY')
              AND num_salarydtl_ulbid = :ulbid
              AND num_salary_deptid = :deptId
        `;

        const deductionBinds = {
            lstdate: String(lstdate),
            ulbid: Number(ulbid),
            deptId: Number(deptId)
        };

        /*
         * Original C#:
         *
         * if (ddlDept.SelectedValue == "406")
         *     gender = Male ? M : F
         */
        if (String(deptId) === "406") {
            deductionQuery += `
                AND var_employee_gender = :gender
            `;

            deductionBinds.gender =
                gender === "Male" ? "M" : "F";
        }

        deductionQuery += `
            GROUP BY
                num_payheads_orderno,
                var_payheads_shortname

            ORDER BY
                num_payheads_orderno
        `;

        const deductionResult = await executeQuery(
            deductionQuery,
            deductionBinds
        );

        if (!deductionResult.success) {
            throw new Error(deductionResult.error);
        }

        const dtDeduction = deductionResult.rows || [];

        /*
         * ============================================================
         * ORIGINAL C#:
         *
         * if (dtDeduction.Rows.Count > 0)
         * {
         *      create dtOverall
         * }
         *
         * else
         * {
         *      return null;
         * }
         * ============================================================
         */

        if (dtDeduction.length === 0) {
            return {
                rows: [],
                netEarning: 0
            };
        }

        /*
         * ============================================================
         * 2. CREATE COMBINED RESULT
         * ============================================================
         */

        const dtOverall = [];

        const deductionLimit = 20;
        const totalRows = dtDeduction.length;

        /*
         * Original C#:
         *
         * int maxRows = Math.Max(
         *      deductionLimit,
         *      totalRows - deductionLimit
         * );
         */
        const maxRows = Math.max(
            deductionLimit,
            totalRows - deductionLimit
        );

        for (let i = 0; i < maxRows; i++) {

            const row = {
                Earning_Head: null,
                Earning_Amount: null,
                Deduction_Head: null,
                Deduction_Amount: null
            };

            /*
             * --------------------------------------------------------
             * DEDUCTION SIDE
             * --------------------------------------------------------
             *
             * Original:
             *
             * if (i < deductionLimit && i < totalRows)
             */
            if (i < deductionLimit && i < totalRows) {

                row.Deduction_Head =
                    dtDeduction[i].PAYHEADS_ENAME;

                row.Deduction_Amount =
                    Number(dtDeduction[i].AMOUNT || 0);
            }

            /*
             * --------------------------------------------------------
             * EARNING SIDE
             * --------------------------------------------------------
             *
             * Original:
             *
             * int earningIndex = i + deductionLimit;
             */
            const earningIndex = i + deductionLimit;

            if (earningIndex < totalRows) {

                row.Earning_Head =
                    dtDeduction[earningIndex].PAYHEADS_ENAME;

                row.Earning_Amount =
                    Number(
                        dtDeduction[earningIndex].AMOUNT || 0
                    );
            }

            dtOverall.push(row);
        }

        /*
         * ============================================================
         * 3. PENSION / TOTAL AMOUNT QUERY
         * ============================================================
         *
         * This is the complete conversion of dtPension from C#.
         *
         * Row 0 = Total Earning - Total Deduction
         * Row 1 = Total Earning
         * Row 2 = Total Deduction
         * ============================================================
         */

        let pensionQuery = `
            SELECT
                NVL(
                    (
                        SELECT SUM(num_salary_totalearning)
                        FROM aopr_salary_def

                        INNER JOIN aopr_employee_def
                            ON num_employee_ulbid = num_salary_ulbid
                            AND num_employee_empid = num_salary_empid

                        WHERE date_salary_saldate =
                            TO_DATE(:lstdate, 'DD-MM-YYYY')

                          AND num_salary_ulbid = :ulbid
                          AND num_salary_deptid = :deptId
        `;

        const pensionBinds = {
            lstdate: String(lstdate),
            ulbid: Number(ulbid),
            deptId: Number(deptId)
        };

        /*
         * Gender filter for first subquery
         */
        if (String(deptId) === "406") {
            pensionQuery += `
                AND var_employee_gender = :gender
            `;

            pensionBinds.gender =
                gender === "Male" ? "M" : "F";
        }

        pensionQuery += `
                    ),
                    0
                )
                -
                NVL(
                    (
                        SELECT SUM(num_salary_totaldeduct)
                        FROM aopr_salary_def

                        INNER JOIN aopr_employee_def
                            ON num_employee_ulbid = num_salary_ulbid
                            AND num_employee_empid = num_salary_empid

                        WHERE date_salary_saldate =
                            TO_DATE(:lstdate, 'DD-MM-YYYY')

                          AND num_salary_ulbid = :ulbid
                          AND num_salary_deptid = :deptId
        `;

        /*
         * Gender filter for second subquery
         */
        if (String(deptId) === "406") {
            pensionQuery += `
                AND var_employee_gender = :gender
            `;
        }

        pensionQuery += `
                    ),
                    0
                ) AS TOTAMT

            FROM dual

            UNION ALL

            SELECT
                NVL(
                    SUM(num_salary_totalearning),
                    0
                ) AS TOTAMT

            FROM aopr_salary_def

            INNER JOIN aopr_employee_def
                ON num_employee_ulbid = num_salary_ulbid
                AND num_employee_empid = num_salary_empid

            WHERE date_salary_saldate =
                TO_DATE(:lstdate, 'DD-MM-YYYY')

              AND num_salary_ulbid = :ulbid
              AND num_salary_deptid = :deptId
        `;

        /*
         * Gender filter for total earning
         */
        if (String(deptId) === "406") {
            pensionQuery += `
                AND var_employee_gender = :gender
            `;
        }

        pensionQuery += `
            UNION ALL

            SELECT
                NVL(
                    SUM(num_salary_totaldeduct),
                    0
                ) AS TOTAMT

            FROM aopr_salary_def

            INNER JOIN aopr_employee_def
                ON num_employee_ulbid = num_salary_ulbid
                AND num_employee_empid = num_salary_empid

            WHERE date_salary_saldate =
                TO_DATE(:lstdate, 'DD-MM-YYYY')

              AND num_salary_ulbid = :ulbid
              AND num_salary_deptid = :deptId
        `;

        /*
         * Gender filter for total deduction
         */
        if (String(deptId) === "406") {
            pensionQuery += `
                AND var_employee_gender = :gender
            `;
        }

        const pensionResult = await executeQuery(
            pensionQuery,
            pensionBinds
        );

        if (!pensionResult.success) {
            throw new Error(pensionResult.error);
        }

        const tblPension = pensionResult.rows || [];

        /*
         * ============================================================
         * 4. ADD SUMMARY ROWS
         * ============================================================
         */

        let netEarning = 0;

        if (tblPension.length > 0) {

            /*
             * Oracle returns:
             *
             * Row 0 = total earning - total deduction
             * Row 1 = total earning
             * Row 2 = total deduction
             */

            const totalPaid =
                Number(tblPension[0]?.TOTAMT || 0);

            const totalEarning =
                Number(tblPension[1]?.TOTAMT || 0);

            const totalDeduction =
                Number(tblPension[2]?.TOTAMT || 0);

            /*
             * ========================================================
             * IMPORTANT
             *
             * Original C# expects the last 5 rows to already exist.
             *
             * Therefore add 5 rows before assigning them.
             * ========================================================
             */

            while (dtOverall.length < 5) {
                dtOverall.push({
                    Earning_Head: null,
                    Earning_Amount: null,
                    Deduction_Head: null,
                    Deduction_Amount: null
                });
            }

            /*
             * Row -5
             * एकूण कपात
             */
            dtOverall[dtOverall.length - 5].Earning_Head =
                "एकूण कपात";

            dtOverall[dtOverall.length - 5].Earning_Amount =
                totalDeduction;

            /*
             * Row -4
             * अदा रक्कम
             */
            dtOverall[dtOverall.length - 4].Earning_Head =
                "अदा रक्कम";

            dtOverall[dtOverall.length - 4].Earning_Amount =
                totalPaid;

            /*
             * Row -3
             * रोख
             */
            dtOverall[dtOverall.length - 3].Earning_Head =
                "रोख";

            dtOverall[dtOverall.length - 3].Earning_Amount =
                0;

            /*
             * Row -2
             * बँक अदा रक्कम
             */
            dtOverall[dtOverall.length - 2].Earning_Head =
                "बँक अदा रक्कम";

            dtOverall[dtOverall.length - 2].Earning_Amount =
                totalPaid;

            /*
             * Row -1
             * एकूण
             */
            dtOverall[dtOverall.length - 1].Earning_Head =
                "एकूण";

            dtOverall[dtOverall.length - 1].Earning_Amount =
                totalEarning;

            /*
             * Same as:
             *
             * ViewState["NetEarning"] =
             *      Convert.ToDouble(TblPension.Rows[1]["TOTAMT"]);
             */
            netEarning = totalEarning;
        }

        /*
         * ============================================================
         * 5. RETURN
         * ============================================================
         */

        console.log("deductionQuery: ", deductionQuery);
        console.log("pensionQuery: ", pensionQuery);

        return {
            rows: dtOverall,
            netEarning
        };

    } catch (error) {

        console.error(
            "GET SALARY DETAIL REPO ERROR:",
            error
        );

        throw error;
    }
}

async function getEmployeeSubDetailRepo({
    lstdate,
    ulbid,
    deptId,
    gender
}) {
    let query = `
        SELECT
            COUNT(num_employee_desigid) AS post,
            0 AS newjoined,
            0 AS working,
            0 AS rikt,
            num_employee_desigid AS desigid,
            var_desigmst_designationname AS designation
        FROM aopr_employee_def

        INNER JOIN aopr_designationmst_def
            ON num_desigmst_designationid = num_employee_desigid

        WHERE num_employee_ulbid = :ulbid
          AND num_employee_deptid = :deptId
    `;

    const binds = {
        ulbid: Number(ulbid),
        deptId: Number(deptId)
    };

    // Same condition as original C#:
    // if (ddlDept.SelectedValue == "406")

    if (String(deptId) === "406") {
        query += `
            AND var_employee_gender = :gender
        `;

        binds.gender = gender === "Male" ? "M" : "F";
    }

    query += `
        GROUP BY
            num_employee_desigid,
            var_desigmst_designationname
    `;

    const result = await executeQuery(query, binds);

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.rows || [];
}

async function getPayheadSalaryDetailRepo({
    lstdate,
    ulbid,
    deptId,
    gender
}) {
    try {
        let query = "";
        const binds = {
            ulbid: Number(ulbid),
            lstdate,
            deptId: Number(deptId)
        };

        if (String(deptId) === "406") {

            query = `
                SELECT *
                FROM vw_wardwisepayheadsaldmc
                WHERE num_salarydtl_ulbid = :ulbid
                  AND num_salarydtl_saldate = :lstdate
                  AND num_employee_deptid = :deptId
                  AND gender = :gender
            `;

            binds.gender = gender;

        } else {

            query = `
                SELECT *
                FROM vw_desigwisepayheadsaldmc
                WHERE num_salarydtl_ulbid = :ulbid
                  AND num_salarydtl_saldate = :lstdate
                  AND num_employee_deptid = :deptId
            `;
        }

        const result = await executeQuery(query, binds);

        if (!result.success) {
            throw new Error(result.error);
        }

        return result.rows || [];

    } catch (error) {
        console.error(
            "GET PAYHEAD SALARY DETAIL REPO ERROR:",
            error
        );

        throw error;
    }
}
module.exports = {
    getEmployeeListRepo,
    getSalaryDetailRepo,
    getEmployeeSubDetailRepo,
    getPayheadSalaryDetailRepo
};
