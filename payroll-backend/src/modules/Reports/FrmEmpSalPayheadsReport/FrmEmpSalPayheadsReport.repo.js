const { executeQuery } = require("../../../db/queryExecutor");

async function getMonthListRepo() {
    const sql = `
    SELECT
      NUM_MONTH_ID,
      VAR_MONTH_NAME
    FROM ADMINS.AOUP_CALENDAR
    ORDER BY NUM_MONTH_ID
  `;

    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getYearListRepo() {
    const sql = `
    SELECT
      NUM_YEAR_ID,
      VAR_YEAR
    FROM ADMINS.AOMA_YEAR
    ORDER BY NUM_YEAR_ID DESC
  `;

    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getEmpSalPayheadsReportRepo({ ulbid, salaryDate, deptId, reportType }) {
    const binds = { ulbid, salaryDate, deptId };

    let sql = "";

    if (reportType === "rbtEmp") {
        sql = ` WITH sal_tot AS(
SELECT num_salary_empid as empid,    num_salary_ulbid       AS ulbid,     num_salary_deptid      AS deptid,
date_salary_saldate    AS saldate,  num_salary_totalearning AS num_salary_totalearning, num_salary_totaldeduct AS num_salary_totaldeduct
FROM aopr_salary_def  WHERE 1 = 1    AND num_salary_ulbid = :ulbid 
AND TRUNC(date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD')
and num_salary_deptid= :deptId
),
pf_tot AS (
SELECT s.num_salary_empid as empid,   s.num_salary_ulbid    AS ulbid,    s.num_salary_deptid   AS deptid, s.date_salary_saldate AS saldate,
SUM(NVL(ap.num_addpayheads_amount, 0)) AS pensionfund  FROM aopr_salary_def s LEFT JOIN aopr_addpayheads_mas ap  ON ap.num_addpayheads_ulbid = s.num_salary_ulbid
AND ap.num_addpayheads_empid = s.num_salary_empid  AND ap.dat_addpayheads_saldate = s.date_salary_saldate 
AND ap.num_addpayheads_aphid = 1 WHERE 1 = 1 AND s.num_salary_ulbid = :ulbid  
AND TRUNC(s.date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD')
AND  num_salary_deptid= :deptId
GROUP BY s.num_salary_ulbid, s.num_salary_deptid, s.date_salary_saldate, num_salary_empid),
ph_tot AS (
SELECT s.num_salary_ulbid    AS ulbid,  s.num_salary_deptid   AS deptid,  s.date_salary_saldate AS saldate,    num_employee_empid as empid,
var_employee_engname as empname,  num_employee_gradeid as gradeid, num_employee_desigid as desigid,  num_employee_bankaccno as bankaccno,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 456 THEN sd.num_salarydtl_amount END), 0) AS BASIC,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 376 THEN sd.num_salarydtl_amount END), 0) AS GREADEVETAN,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 208 THEN sd.num_salarydtl_amount END), 0) AS DA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 210 THEN sd.num_salarydtl_amount END), 0) AS GHARBHADE,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 374 THEN sd.num_salarydtl_amount END), 0) AS VAHANBHATTA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 286 THEN sd.num_salarydtl_amount END), 0) AS NPA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 378 THEN sd.num_salarydtl_amount END), 0) AS ERNDCPS,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 671 THEN sd.num_salarydtl_amount END), 0) AS DHULAIBHATA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 375 THEN sd.num_salarydtl_amount END), 0) AS SAFAIBHATA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 649 THEN sd.num_salarydtl_amount END), 0) AS TYPINGBHATA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 650 THEN sd.num_salarydtl_amount END), 0) AS CASHALLOWANCE,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 213 THEN sd.num_salarydtl_amount END), 0) AS SHIKSHANBHATTA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 212 THEN sd.num_salarydtl_amount END), 0) AS VISHESHBHATTA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 211 THEN sd.num_salarydtl_amount END), 0) AS PRAVASBHATTA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 377 THEN sd.num_salarydtl_amount END), 0) AS ETARBHATTA,

NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 356 THEN sd.num_salarydtl_amount END), 0) AS col356,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 357 THEN sd.num_salarydtl_amount END), 0) AS col357,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 358 THEN sd.num_salarydtl_amount END), 0) AS col358,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 360 THEN sd.num_salarydtl_amount END), 0) AS col360,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 362 THEN sd.num_salarydtl_amount END), 0) AS col362,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 363 THEN sd.num_salarydtl_amount END), 0) AS col363,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 364 THEN sd.num_salarydtl_amount END), 0) AS col364,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 365 THEN sd.num_salarydtl_amount END), 0) AS col365,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 366 THEN sd.num_salarydtl_amount END), 0) AS col366,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 368 THEN sd.num_salarydtl_amount END), 0) AS col368,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 369 THEN sd.num_salarydtl_amount END), 0) AS col369,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 370 THEN sd.num_salarydtl_amount END), 0) AS col370,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 282 THEN sd.num_salarydtl_amount END), 0) AS col282,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 283 THEN sd.num_salarydtl_amount END), 0) AS col283,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 287 THEN sd.num_salarydtl_amount END), 0) AS col287,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 291 THEN sd.num_salarydtl_amount END), 0) AS col291,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 653 THEN sd.num_salarydtl_amount END), 0) AS col653,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 654 THEN sd.num_salarydtl_amount END), 0) AS col654,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 655 THEN sd.num_salarydtl_amount END), 0) AS col655,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 656 THEN sd.num_salarydtl_amount END), 0) AS col656,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 659 THEN sd.num_salarydtl_amount END), 0) AS col659,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 661 THEN sd.num_salarydtl_amount END), 0) AS col661,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 664 THEN sd.num_salarydtl_amount END), 0) AS col664,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 665 THEN sd.num_salarydtl_amount END), 0) AS col665,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 481 THEN sd.num_salarydtl_amount END), 0) AS col481,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 672 THEN sd.num_salarydtl_amount END), 0) AS col672,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 673 THEN sd.num_salarydtl_amount END), 0) AS col673,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 674 THEN sd.num_salarydtl_amount END), 0) AS col674,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 675 THEN sd.num_salarydtl_amount END), 0) AS col675,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 676 THEN sd.num_salarydtl_amount END), 0) AS col676,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 651 THEN sd.num_salarydtl_amount END), 0) AS col651,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 408 THEN sd.num_salarydtl_amount END), 0) AS col408,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 216 THEN sd.num_salarydtl_amount END), 0) AS col216,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 217 THEN sd.num_salarydtl_amount END), 0) AS col217,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 218 THEN sd.num_salarydtl_amount END), 0) AS col218,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 280 THEN sd.num_salarydtl_amount END), 0) AS col280,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 281 THEN sd.num_salarydtl_amount END), 0) AS col281,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 355 THEN sd.num_salarydtl_amount END), 0) AS col355,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 267 THEN sd.num_salarydtl_amount END), 0) AS col267,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 268 THEN sd.num_salarydtl_amount END), 0) AS col268,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 269 THEN sd.num_salarydtl_amount END), 0) AS col269,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 657 THEN sd.num_salarydtl_amount END), 0) AS paratjama,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 353 THEN sd.num_salarydtl_amount END), 0) AS PF,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 660 THEN sd.num_salarydtl_amount END), 0) AS GATVIMA,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 658 THEN sd.num_salarydtl_amount END), 0) AS JMHC,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 666 THEN sd.num_salarydtl_amount END), 0) AS ANDHANIDHI,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 663 THEN sd.num_salarydtl_amount END), 0) AS ONEDAYDEDUCTION,
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 662 THEN sd.num_salarydtl_amount END), 0) AS DUSHKALNIDHI,
nvl(sum(case when REGEXP_LIKE(var_payheads_mname, '^[0-9]') then sd.num_salarydtl_amount END), 0) AS BANKDEDUCTION
FROM aopr_payheads_def ph
INNER JOIN aopr_salarydtl_def sd ON sd.num_salarydtl_ulbid = ph.num_payheads_ulbid  AND sd.num_salarydtl_payheadid = ph.NUM_PAYHEADS_ID 
INNER JOIN aopr_salary_def s  ON s.num_salary_ulbid = sd.num_salarydtl_ulbid AND s.num_salary_empid = sd.num_salarydtl_empid 
AND s.date_salary_saldate = sd.num_salarydtl_saldate
INNER JOIN aopr_employee_def on num_employee_empid = s.num_salary_empid and num_employee_ulbid = s.num_salary_ulbid
WHERE ph.num_payheads_ulbid = :ulbid  
AND TRUNC(s.date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD')
 AND num_salary_deptid= :deptId
  GROUP BY 
  s.num_salary_ulbid,   s.num_salary_deptid,    s.date_salary_saldate, 
  num_employee_empid,  var_employee_engname, 
  num_employee_gradeid, num_employee_desigid, 
  num_employee_bankaccno 
 ), 
  sal_order as ( 
  select num_salaryorder_ulbid ulbid, num_salaryorder_deptid deptid,num_salaryorder_deptorder deptorder 
  from aopr_salaryorder_det  
  group by num_salaryorder_ulbid,num_salaryorder_deptid,num_salaryorder_deptorder 
) 
SELECT s.ulbid,  t.deptid, 
d.deptname,t.saldate AS date_salary_saldate, 
t.empid empcode,t.empname,var_grademst_gradename as gradename, 
ds.desig_ename, t.bankaccno, 
NVL(p.pensionfund, 0) AS pensionfund, 
T.BASIC,T.GREADEVETAN,T.DA,T.GHARBHADE,t.VAHANBHATTA,T.ERNDCPS,T.DHULAIBHATA,T.SAFAIBHATA,T.TYPINGBHATA,T.CASHALLOWANCE,T.SHIKSHANBHATTA, 
T.NPA , T.VISHESHBHATTA, T.PRAVASBHATTA,T.ETARBHATTA,NVL(s.num_salary_totalearning, 0) DEYVETAN,T.PF, t.col287 PF_BHANI, 
t.col358 VYAVSAYKAR, t.col282 AYKARID, t.col217 TDS, t.col283 AYURVIMA, t.col363 SOCIETY_1, 
t.col364 SOCIETY_2, t.col365 SOCIETY_3, t.col366 SOCIETY_4, T.BANKDEDUCTION,t.paratjama, 
t.col368 TASALMAT, t.col369 ESI, T.GATVIMA, t.col481 DCPS10, t.col357 DCPS, t.col267 MUSHHULK, T.JMHC,t.col370 GHARBHADE_VASULI, 
t.col672 GHARBHADEANUSHULK, t.col653 PANNIPATTI, t.col661 GHARPATTI, t.col269 DIWALIADVANCE, t.col281 EIDADVANCE, t.col362 SANADVANCE, 
t.col408 COMPLOAN, t.col280 DIFFERNECEANDOTHERS, t.col651 EXTRAOVERHEAD, t.col664 MOBILEBILL, t.col218 OTHERDEDUCTION, t.col665 MAHITIADHIKAR, 
t.col656 Taxable, t.col659 AGAUDILELYARAKKAMA, t.col655 JAMINKABJA, t.col268 DANDRAKKAM, t.col291 CTD, t.col673 KOTOMBIKVYAVHAR, t.col674 AUDITVASULI, 
t.col675 DANDVASULI, T.ANDHANIDHI,t.col216 MLWFUND, T.ONEDAYDEDUCTION,T.DUSHKALNIDHI,t.col654 DHWAJNIDHI, t.col676 VISHESHNIDHI, 
NVL(s.num_salary_totalearning, 0) TOTALERNING, 
s.num_salary_totaldeduct TOTALDEDUCTION, NVL(s.num_salary_totalearning, 0) -NVL(s.num_salary_totaldeduct, 0) NETEARNING 
FROM ph_tot t 
INNER JOIN sal_tot s ON s.ulbid = t.ulbid AND s.deptid = t.deptid AND s.saldate = t.saldate and s.empid = t.empid 
LEFT JOIN pf_tot p ON p.ulbid = t.ulbid AND p.deptid = t.deptid AND p.saldate = t.saldate and p.empid = s.empid 
INNER JOIN vw_deptconfig d  ON d.ulbid = t.ulbid AND d.deptid = t.deptid 
LEFT JOIN sal_order o ON o.ulbid = t.ulbid AND o.deptid = t.deptid 
left join vw_desigconfig ds on ds.desig_id = t.desigid and ds.ulbid = d.ulbid 
left join aopr_grademst_def on num_grademst_gradeid = t.gradeid 
    order by deptorder `;

    } else if (
        reportType === "rbtDept"
    ) {

        sql = `WITH sal_tot AS( 
SELECT    num_salary_ulbid AS ulbid, num_salary_deptid AS deptid, date_salary_saldate AS saldate, SUM(num_salary_totalearning) AS num_salary_totalearning,
SUM(num_salary_totaldeduct)  AS num_salary_totaldeduct  FROM aopr_salary_def   WHERE 1 = 1
AND num_salary_ulbid =:ulbid AND TRUNC(date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD') and num_salary_deptid=:deptId
GROUP BY num_salary_ulbid, num_salary_deptid, date_salary_saldate 
), 
pf_tot AS ( SELECT  s.num_salary_ulbid    AS ulbid,  s.num_salary_deptid   AS deptid, s.date_salary_saldate AS saldate, 
SUM(NVL(ap.num_addpayheads_amount, 0)) AS pensionfund  
FROM aopr_salary_def s 
LEFT JOIN aopr_addpayheads_mas ap ON ap.num_addpayheads_ulbid = s.num_salary_ulbid AND ap.num_addpayheads_empid = s.num_salary_empid 
AND ap.dat_addpayheads_saldate = s.date_salary_saldate AND ap.num_addpayheads_aphid = 1 
WHERE 1 = 1 AND s.num_salary_ulbid =:ulbid  AND TRUNC(s.date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD') AND num_salary_deptid=:deptId
GROUP BY s.num_salary_ulbid, s.num_salary_deptid, s.date_salary_saldate 
), 
ph_tot AS (  
SELECT  s.num_salary_ulbid    AS ulbid,  s.num_salary_deptid   AS deptid, s.date_salary_saldate AS saldate, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 456 THEN sd.num_salarydtl_amount END), 0) AS BASIC, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 376 THEN sd.num_salarydtl_amount END), 0) AS GREADEVETAN, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 208 THEN sd.num_salarydtl_amount END), 0) AS DA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 210 THEN sd.num_salarydtl_amount END), 0) AS GHARBHADE, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 374 THEN sd.num_salarydtl_amount END), 0) AS VAHANBHATTA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 286 THEN sd.num_salarydtl_amount END), 0) AS NPA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 378 THEN sd.num_salarydtl_amount END), 0) AS ERNDCPS, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 671 THEN sd.num_salarydtl_amount END), 0) AS DHULAIBHATA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 375 THEN sd.num_salarydtl_amount END), 0) AS SAFAIBHATA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 649 THEN sd.num_salarydtl_amount END), 0) AS TYPINGBHATA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 650 THEN sd.num_salarydtl_amount END), 0) AS CASHALLOWANCE, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 213 THEN sd.num_salarydtl_amount END), 0) AS SHIKSHANBHATTA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 212 THEN sd.num_salarydtl_amount END), 0) AS VISHESHBHATTA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 211 THEN sd.num_salarydtl_amount END), 0) AS PRAVASBHATTA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 377 THEN sd.num_salarydtl_amount END), 0) AS ETARBHATTA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 356 THEN sd.num_salarydtl_amount END), 0) AS col356, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 357 THEN sd.num_salarydtl_amount END), 0) AS col357, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 358 THEN sd.num_salarydtl_amount END), 0) AS col358, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 360 THEN sd.num_salarydtl_amount END), 0) AS col360, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 362 THEN sd.num_salarydtl_amount END), 0) AS col362, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 363 THEN sd.num_salarydtl_amount END), 0) AS col363, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 364 THEN sd.num_salarydtl_amount END), 0) AS col364, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 365 THEN sd.num_salarydtl_amount END), 0) AS col365, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 366 THEN sd.num_salarydtl_amount END), 0) AS col366, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 368 THEN sd.num_salarydtl_amount END), 0) AS col368, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 369 THEN sd.num_salarydtl_amount END), 0) AS col369, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 370 THEN sd.num_salarydtl_amount END), 0) AS col370, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 282 THEN sd.num_salarydtl_amount END), 0) AS col282, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 283 THEN sd.num_salarydtl_amount END), 0) AS col283, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 287 THEN sd.num_salarydtl_amount END), 0) AS col287, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 291 THEN sd.num_salarydtl_amount END), 0) AS col291, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 653 THEN sd.num_salarydtl_amount END), 0) AS col653, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 654 THEN sd.num_salarydtl_amount END), 0) AS col654, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 655 THEN sd.num_salarydtl_amount END), 0) AS col655, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 656 THEN sd.num_salarydtl_amount END), 0) AS col656, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 659 THEN sd.num_salarydtl_amount END), 0) AS col659, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 661 THEN sd.num_salarydtl_amount END), 0) AS col661, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 664 THEN sd.num_salarydtl_amount END), 0) AS col664, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 665 THEN sd.num_salarydtl_amount END), 0) AS col665, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 481 THEN sd.num_salarydtl_amount END), 0) AS col481, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 672 THEN sd.num_salarydtl_amount END), 0) AS col672, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 673 THEN sd.num_salarydtl_amount END), 0) AS col673, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 674 THEN sd.num_salarydtl_amount END), 0) AS col674, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 675 THEN sd.num_salarydtl_amount END), 0) AS col675, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 676 THEN sd.num_salarydtl_amount END), 0) AS col676, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 651 THEN sd.num_salarydtl_amount END), 0) AS col651, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 408 THEN sd.num_salarydtl_amount END), 0) AS col408, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 216 THEN sd.num_salarydtl_amount END), 0) AS col216, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 217 THEN sd.num_salarydtl_amount END), 0) AS col217, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 218 THEN sd.num_salarydtl_amount END), 0) AS col218, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 280 THEN sd.num_salarydtl_amount END), 0) AS col280, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 281 THEN sd.num_salarydtl_amount END), 0) AS col281, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 355 THEN sd.num_salarydtl_amount END), 0) AS col355, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 267 THEN sd.num_salarydtl_amount END), 0) AS col267, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 268 THEN sd.num_salarydtl_amount END), 0) AS col268, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 269 THEN sd.num_salarydtl_amount END), 0) AS col269, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 657 THEN sd.num_salarydtl_amount END), 0) AS paratjama, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 353 THEN sd.num_salarydtl_amount END), 0) AS PF, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 660 THEN sd.num_salarydtl_amount END), 0) AS GATVIMA, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 658 THEN sd.num_salarydtl_amount END), 0) AS JMHC, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 666 THEN sd.num_salarydtl_amount END), 0) AS ANDHANIDHI, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 663 THEN sd.num_salarydtl_amount END), 0) AS ONEDAYDEDUCTION, 
NVL(SUM(CASE WHEN ph.NUM_PAYHEADS_ID = 662 THEN sd.num_salarydtl_amount END), 0) AS DUSHKALNIDHI, 
nvl(sum(case when REGEXP_LIKE(var_payheads_mname, '^[0-9]') then sd.num_salarydtl_amount END), 0) AS BANKDEDUCTION 
FROM aopr_payheads_def ph 
INNER JOIN aopr_salarydtl_def sd 
ON sd.num_salarydtl_ulbid = ph.num_payheads_ulbid 
AND sd.num_salarydtl_payheadid = ph.NUM_PAYHEADS_ID 
INNER JOIN aopr_salary_def s 
ON s.num_salary_ulbid = sd.num_salarydtl_ulbid 
AND s.num_salary_empid = sd.num_salarydtl_empid 
AND s.date_salary_saldate = sd.num_salarydtl_saldate 
WHERE ph.num_payheads_ulbid =:ulbid AND TRUNC(s.date_salary_saldate) = TO_DATE(:salaryDate,'YYYY-MM-DD') AND  num_salary_deptid=:deptId
GROUP BY 
s.num_salary_ulbid, 
s.num_salary_deptid, 
s.date_salary_saldate 
), 
sal_order as ( 
select num_salaryorder_ulbid ulbid, num_salaryorder_deptid deptid,num_salaryorder_deptorder deptorder 
from aopr_salaryorder_det 
group by num_salaryorder_ulbid,num_salaryorder_deptid,num_salaryorder_deptorder 
) 
SELECT 
s.ulbid, t.deptid,   
d.deptname,  t.saldate AS date_salary_saldate, 
NVL(p.pensionfund, 0) AS pensionfund, 
T.BASIC,T.GREADEVETAN,T.DA,T.GHARBHADE,T.ERNDCPS,T.DHULAIBHATA,T.SAFAIBHATA,T.TYPINGBHATA,T.CASHALLOWANCE,T.SHIKSHANBHATTA, 
T.NPA , T.VISHESHBHATTA, T.PRAVASBHATTA,  T.ETARBHATTA,NVL(s.num_salary_totalearning, 0) DEYVETAN,T.PF, t.col287 PF_BHANI, 
t.col358 VYAVSAYKAR, t.col282 AYKARID, t.col217 TDS, t.col283 AYURVIMA, t.col363 SOCIETY_1, 
t.col364 SOCIETY_2, t.col365 SOCIETY_2, t.col366 SOCIETY_4, T.BANKDEDUCTION,t.paratjama, 
t.col368 TASALMAT, t.col369 ESI, T.GATVIMA, t.col481 DCPS10, t.col357 DCPS, t.col267 MUSHHULK, T.JMHC,t.col370 GHARBHADE_VASULI, 
t.col672 GHARBHADEANUSHULK, t.col653 PANNIPATTI, t.col661 GHARPATTI, t.col269 DIWALIADVANCE, t.col281 EIDADVANCE, t.col362 SANADVANCE, 
t.col408 COMPLOAN, t.col280 DIFFERNECEANDOTHERS, t.col651 EXTRAOVERHEAD, t.col664 MOBILEBILL, t.col218 OTHERDEDUCTION, t.col665 MAHITIADHIKAR, 
t.col656 Taxable, t.col659 AGAUDILELYARAKKAMA, t.col655 JAMINKABJA, t.col268 DANDRAKKAM, t.col291 CTD, t.col673 KOTOMBIKVYAVHAR, t.col674 AUDITVASULI, 
t.col675 DANDVASULI, T.ANDHANIDHI,t.col216 MLWFUND, T.ONEDAYDEDUCTION,T.DUSHKALNIDHI,t.col654 DHWAJNIDHI, t.col676 VISHESHNIDHI,  
NVL(s.num_salary_totalearning, 0) TOTALERNING,  
s.num_salary_totaldeduct TOTALDEDUCTION, NVL(s.num_salary_totalearning, 0) -NVL(s.num_salary_totaldeduct, 0) NETEARNING 
FROM ph_tot t  
INNER JOIN sal_tot s  ON s.ulbid = t.ulbid AND s.deptid = t.deptid AND s.saldate = t.saldate  
LEFT JOIN pf_tot p ON p.ulbid = t.ulbid AND p.deptid = t.deptid AND p.saldate = t.saldate  
INNER JOIN vw_deptconfig d  ON d.ulbid = t.ulbid AND d.deptid = t.deptid  
LEFT JOIN sal_order o ON o.ulbid = t.ulbid AND o.deptid = t.deptid  
order by deptorder  
`;
    } else {
        throw new Error(
            "Invalid reportType"
        );
    }
    const result = await executeQuery(sql,binds);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

module.exports = {
    getMonthListRepo,
    getYearListRepo,
    getEmpSalPayheadsReportRepo
};