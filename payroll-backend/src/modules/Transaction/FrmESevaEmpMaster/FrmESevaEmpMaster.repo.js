const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getNationalityDropdownRepo() {
    const sql = `
        SELECT VAR_NATIONALITY_ENAME AS DISPLAY_TEXT, 
               NUM_NATIONALITY_ID   AS VALUE_ID 
        FROM   aopr_nationality_mas
        ORDER  BY VAR_NATIONALITY_ENAME
    `;
    return await executeQuery(sql, {});
}

async function getReligionDropdownRepo() {
    const sql = `
        SELECT VAR_RELIGION_ENAME AS DISPLAY_TEXT, 
               NUM_RELIGION_ID    AS VALUE_ID 
        FROM   aopr_religion_mas
        ORDER  BY VAR_RELIGION_ENAME
    `;
    return await executeQuery(sql, {});
}

async function getCategoryDropdownRepo({ ulbid }) {
    let sql = "";
    if (ulbid == 770 || ulbid == 1750) {
        sql = `
            SELECT CASE WHEN UPPER(VAR_CATEGORY_NAME) = 'REGULAR' 
                        THEN 'Permanent' 
                        ELSE VAR_CATEGORY_NAME 
                   END                AS DISPLAY_TEXT,
                   NUM_CATEGORY_ID    AS VALUE_ID
            FROM   aopr_category_mas
            ORDER  BY DISPLAY_TEXT
        `;
    } else {
        sql = `
            SELECT VAR_CATEGORY_NAME AS DISPLAY_TEXT,
                   NUM_CATEGORY_ID   AS VALUE_ID
            FROM   aopr_category_mas
            ORDER  BY VAR_CATEGORY_NAME
        `;
    }
    return await executeQuery(sql, {});
}

async function getBloodGroupDropdownRepo() {
    const sql = `
        SELECT VAR_BLOODGROUP_NAME AS DISPLAY_TEXT, 
               NUM_BLOODGROUP_ID   AS VALUE_ID 
        FROM   aopr_bloodgroup_mas
        ORDER  BY VAR_BLOODGROUP_NAME
    `;
    return await executeQuery(sql, {});
}

async function getRelationDropdownRepo() {
    const sql = `
        SELECT VAR_RELATION_NAME      AS DISPLAY_TEXT, 
               NUM_RELATION_RELATIONID AS VALUE_ID 
        FROM   aopr_relation_def
        ORDER  BY VAR_RELATION_NAME
    `;
    return await executeQuery(sql, {});
}

async function getCasteDropdownRepo({ ulbid, religionId }) {
    const sql = `
        SELECT castenamem AS DISPLAY_TEXT, 
               casteid    AS VALUE_ID
        FROM   vw_caste
        WHERE  ulbid      = :ulbid
          AND  religionid = :religionId
        ORDER  BY castenamem
    `;
    return await executeQuery(sql, { ulbid, religionId });
}

async function getSubCasteDropdownRepo({ ulbid, casteId, religionId }) {
    const sql = `
        SELECT SUBCASTEMNAME AS DISPLAY_TEXT, 
               SUBCASTEID    AS VALUE_ID
        FROM   vw_subcaste
        WHERE  ulbid      = :ulbid
          AND  CASTEID    = :casteId
          AND  religionid = :religionId
        ORDER  BY SUBCASTEMNAME
    `;
    return await executeQuery(sql, { ulbid, casteId, religionId });
}

async function getEmployeeDefRepo({ ulbid, empId }) {
    const sql = `
        SELECT * 
        FROM   aopr_employee_def 
        WHERE  num_employee_ulbid = :ulbid 
          AND  num_employee_empid = :empId
    `;
    return await executeQuery(sql, { ulbid, empId });
}

async function getEsevaEmpMasterRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT * 
        FROM   aopr_esevaemp_mas 
        WHERE  num_esevaemp_ulbid   = :ulbid 
          AND  num_esevaemp_empcode = :empId 
          AND  num_esevaemp_id      = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}

async function getFamilyDetailsRepo({ ulbid, empId, esevaEmpId }) {
    const sql = `
        SELECT * 
        FROM   aopr_esevaemp_det 
        WHERE  num_esevaempdet_ulbid      = :ulbid 
          AND  num_esevaempdet_empcode    = :empId 
          AND  num_esevaempdet_esevaempid = :esevaEmpId
    `;
    return await executeQuery(sql, { ulbid, empId, esevaEmpId });
}

async function getRelationNameRepo({ relationId }) {
    const sql = `
        SELECT VAR_RELATION_NAME, NUM_RELATION_RELATIONID 
        FROM   aopr_relation_def 
        WHERE  NUM_RELATION_RELATIONID = :relationId
    `;
    return await executeQuery(sql, { relationId });
}

async function getNewEsevaEmpIdRepo({ ulbid, empId }) {
    const sql = `
        SELECT num_esevaemp_id 
        FROM   aopr_esevaemp_mas 
        WHERE  num_esevaemp_ulbid   = :ulbid 
          AND  num_esevaemp_empcode = :empId
        ORDER  BY num_esevaemp_id DESC
    `;
    return await executeQuery(sql, { ulbid, empId });
}

async function insertEsevaEmpRepo(payload) {
    const result = await executeProcedure({
        sql: `
            BEGIN
                aopr_esevaemp_ins(
                    :in_UserId,
                    :in_Mode,
                    :in_empcode,
                    :in_UlbId,
                    :in_esevaempid,
                    :in_esevaempdetid,
                    :in_name,
                    :in_fatname,
                    :in_motname,
                    :in_dob,
                    :in_nationality,
                    :in_relogion,
                    :in_empcast,
                    :in_subcast,
                    :in_category,
                    :in_mobno,
                    :in_email,
                    :in_bloodgrp,
                    :in_phyhandicapped,
                    :in_phyhandicap_ify,
                    :in_marrgstatus,
                    :in_marrgstatus_ify,
                    :in_parmaddres,
                    :in_district,
                    :in_state,
                    :in_country,
                    :in_postoffice,
                    :in_pincode,
                    :in_mobno_1,
                    :in_altermobno,
                    :in_commaddress,
                    :in_commdistrict,
                    :in_commstate,
                    :in_commcountry,
                    :in_commpostoff,
                    :in_commpincode,
                    :in_commmobno,
                    :in_commaltermobno,
                    :in_emrgncycontact,
                    :in_relation,
                    :in_emrgncymobno,
                    :in_emrgncycontact_1,
                    :in_relation_1,
                    :in_emrgncymobno_1,
                    :in_hometown,
                    :in_nearrailway,
                    :in_nearairport,
                    :in_subhometown,
                    :in_subnearrailway,
                    :in_subnearairport,
                    :in_famdetstr,
                    :in_height,
                    :in_idenmark,
                    :in_medrptcrtno,
                    :in_medrptcrtdate,
                    :in_medrptissauth,
                    :in_note,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;
        `,
        binds: {
            in_UserId: payload.userid,
            in_Mode: { val: payload.mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_empcode: { val: payload.empid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_UlbId: { val: payload.ulbid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_esevaempid: { val: payload.esevaempid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_esevaempdetid: { val: payload.esevaempdetid || 0, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_name: payload.Name,
            in_fatname: payload.FatherName,
            in_motname: payload.MotherName,
            in_dob: payload.DateOfBirth ? { val: new Date(payload.DateOfBirth), dir: oracledb.BIND_IN, type: oracledb.DATE } : { val: null, dir: oracledb.BIND_IN, type: oracledb.DATE },
            in_nationality: { val: payload.Nationality, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_relogion: { val: payload.Religion, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_empcast: { val: payload.Cast, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_subcast: { val: payload.SubCast, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_category: { val: payload.Category, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_mobno: { val: payload.MobileNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_email: payload.EmailId,
            in_bloodgrp: { val: payload.BloodGroup, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_phyhandicapped: payload.IsPhysicallyHandicapped,
            in_phyhandicap_ify: payload.HandicappedDetails,
            in_marrgstatus: payload.IsMarried,
            in_marrgstatus_ify: payload.SpouseName,
            in_parmaddres: payload.PermanentAddress,
            in_district: payload.PermanentDistrict,
            in_state: payload.PermanentState,
            in_country: payload.PermanentCountry,
            in_postoffice: payload.PermanentPostOffice,
            in_pincode: { val: payload.PermanentPincode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_mobno_1: { val: payload.PermanentMobileNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_altermobno: { val: payload.PermanentAlternateNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_commaddress: payload.CommunicationAddress,
            in_commdistrict: payload.CommunicationDistrict,
            in_commstate: payload.CommunicationState,
            in_commcountry: payload.CommunicationCountry,
            in_commpostoff: payload.CommunicationPostOffice,
            in_commpincode: { val: payload.CommunicationPincode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_commmobno: { val: payload.CommunicationMobileNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_commaltermobno: { val: payload.CommunicationAlternateNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_emrgncycontact: payload.EmergencyContactName,
            in_relation: { val: payload.EmergencyContactRelation, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_emrgncymobno: { val: payload.EmergencyContactMobileNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_emrgncycontact_1: payload.EmergencyAlternateContactName,
            in_relation_1: { val: payload.EmergencyAlternateRelation, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_emrgncymobno_1: { val: payload.EmergencyAlternateMobileNumber, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            in_hometown: payload.HometownAtJoining,
            in_nearrailway: payload.HometownNearRailwayStation,
            in_nearairport: payload.HometownNearAirport,
            in_subhometown: payload.SubsequenceHometown,
            in_subnearrailway: payload.SubsequenceNearRailwayStation,
            in_subnearairport: payload.SubsequenceNearAirport,
            in_famdetstr: payload.FamilyDetStr,
            in_height: payload.Height,
            in_idenmark: payload.PerIdentificationMark,
            in_medrptcrtno: payload.MedTestRptCertNo,
            in_medrptcrtdate: payload.MedTestRptDate ? { val: new Date(payload.MedTestRptDate), dir: oracledb.BIND_IN, type: oracledb.DATE } : { val: null, dir: oracledb.BIND_IN, type: oracledb.DATE },
            in_medrptissauth: payload.MedTestRptAuthAndDesig,
            in_note: payload.Note,
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
        }
    });

    if (!result.success) throw new Error(result.error);

    console.log("result", result);

    return {
        errorCode: result.outBinds.out_ErrorCode, 
        errorMsg:  result.outBinds.out_ErrorMsg 
    };
}

module.exports = {
    getNationalityDropdownRepo,
    getReligionDropdownRepo,
    getCategoryDropdownRepo,
    getBloodGroupDropdownRepo,
    getRelationDropdownRepo,
    getCasteDropdownRepo,
    getSubCasteDropdownRepo,
    getEmployeeDefRepo,
    getEsevaEmpMasterRepo,
    getFamilyDetailsRepo,
    getRelationNameRepo,
    getNewEsevaEmpIdRepo,
    insertEsevaEmpRepo
};