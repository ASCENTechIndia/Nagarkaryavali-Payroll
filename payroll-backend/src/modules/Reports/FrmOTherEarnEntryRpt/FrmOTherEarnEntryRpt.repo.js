const {executeQuery} = require("../../../db/queryExecutor")

const getEmployeeRepo = async() => {
    const sql = `
    select num_employee_empid || ' - ' || var_employee_engname EmpName, to_char(num_employee_empid) num_employee_empid 
    from aopr_employee_def 
    where num_employee_ulbid=870  order by var_employee_engname
    `
    const result = await executeQuery(sql);
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.rows
}

const getEarnEntryRepo = async({ulbid, salaryYear, empid}) => {
    const binds = { ulbid, salaryYear }

    const conditions = [
        "ulbid = :ulbid",
        "SALYEAR = :salaryYear"
    ]

    if (empid && Number(empid) > 0) {
        conditions.push("empid = :empid")
        binds.empid = empid;
    }
    const sql = `
    select * from vw_empotherearnings
    where 1=1 and
    ${conditions.join(" AND ")}

    `

    const result = await executeQuery(sql,binds)
    if (!result.success) {
        throw new Error(result.error)
    }

    return result.rows
}

module.exports = {
    getEmployeeRepo,
    getEarnEntryRepo
}