const repo = require("./FrmESevaEmpMaster.repo");

async function getNationalityDropdownService() {
    const result = await repo.getNationalityDropdownRepo();
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getReligionDropdownService() {
    const result = await repo.getReligionDropdownRepo();
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getCategoryDropdownService({ ulbid }) {
    if (!ulbid) throw new Error("ulbid is required");
    const result = await repo.getCategoryDropdownRepo({ ulbid });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getBloodGroupDropdownService() {
    const result = await repo.getBloodGroupDropdownRepo();
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getRelationDropdownService() {
    const result = await repo.getRelationDropdownRepo();
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getCasteDropdownService({ ulbid, religionId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!religionId) throw new Error("religionId is required");
    const result = await repo.getCasteDropdownRepo({ ulbid, religionId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getSubCasteDropdownService({ ulbid, casteId, religionId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!casteId) throw new Error("casteId is required");
    if (!religionId) throw new Error("religionId is required");
    const result = await repo.getSubCasteDropdownRepo({ ulbid, casteId, religionId });
    if (!result.success) throw new Error(result.error);
    return result.rows;
}

async function getNewEsevaEmpIdService({ ulbid, empId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    const result = await repo.getNewEsevaEmpIdRepo({ ulbid, empId });
    // if (!result.success) throw new Error(result.error);
     if (!result || result.rows.length === 0) {
        return {success: false, message: "No ESeva Employee ID found", data: []};
    }
    // if (result.rows.length === 0) throw new Error("No employee found");
    return result.rows[0];
}
async function getEmployeeDefService({ ulbid, empId }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");
    const result = await repo.getEmployeeDefRepo({ ulbid, empId });
    if (!result.success) throw new Error(result.error);
    if (result.rows.length === 0) throw new Error("No employee found");
    return result.rows[0];
}

async function getEsevaEmpDetailsService({ ulbid, empId, esevaEmpId, mode }) {
    if (!ulbid) throw new Error("ulbid is required");
    if (!empId) throw new Error("empId is required");

    if (mode == 1 || !esevaEmpId) {
        const result = await repo.getEmployeeDefRepo({ ulbid, empId });
        if (!result.success) throw new Error(result.error);
        if (result.rows.length === 0) throw new Error("No employee found");
        return { mode: 1, data: result.rows[0], family: [] };
    }

    const masterResult = await repo.getEsevaEmpMasterRepo({ ulbid, empId, esevaEmpId });
    if (!masterResult.success) throw new Error(masterResult.error);
    if (masterResult.rows.length === 0) throw new Error("No master record found");

    const familyResult = await repo.getFamilyDetailsRepo({ ulbid, empId, esevaEmpId });
    const family = familyResult.success ? familyResult.rows : [];

    return {
        data: masterResult.rows[0],
        family
    };
}

async function insertEsevaEmpService(payload) {
    if (!payload.Name || payload.Name.trim() === "") throw new Error("Please enter name");
    if (!payload.FatherName || payload.FatherName.trim() === "") throw new Error("Please enter fathers name");
    if (!payload.MotherName || payload.MotherName.trim() === "") throw new Error("Please enter mothers name");
    if (!payload.Nationality || payload.Nationality === 0) throw new Error("Please select nationality");
    if (!payload.Category || payload.Category === 0) throw new Error("Please select category");
    if (!payload.MobileNumber) throw new Error("Please enter mobile no");
    if (!payload.EmailId || payload.EmailId.trim() === "") throw new Error("Please enter email id");
    if (payload.IsMarried === "Y" && (!payload.SpouseName || payload.SpouseName.trim() === "")) {
        throw new Error("Please enter spouse name");
    }
    if (payload.IsPhysicallyHandicapped === "Y" && (!payload.HandicappedDetails || payload.HandicappedDetails.trim() === "")) {
        throw new Error("Please specify physically handicapped details");
    }
    if (!payload.Height || payload.Height.trim() === "") throw new Error("Please enter exact height by measurement");
    if (!payload.PermanentAddress || payload.PermanentAddress.trim() === "") throw new Error("Please enter permanent address");
    if (!payload.PermanentDistrict || payload.PermanentDistrict.trim() === "") throw new Error("Please enter district");
    if (!payload.PermanentState || payload.PermanentState.trim() === "") throw new Error("Please enter state");
    if (!payload.PermanentCountry || payload.PermanentCountry.trim() === "") throw new Error("Please enter country");
    if (!payload.PermanentPincode) throw new Error("Please enter pincode");

    const result = await repo.insertEsevaEmpRepo(payload);

    if (result.errorCode === 9999) {
        const idResult = await repo.getNewEsevaEmpIdRepo({
            ulbid: payload.ulbid,
            empId: payload.empid
        });

        let newEsevaEmpId = 0;
        if (idResult.success && idResult.rows.length > 0) {
            newEsevaEmpId = idResult.rows[0].NUM_ESEVAEMP_ID;
        }

        return {
            success: true,
            errorCode: result.errorCode,
            message: result.errorMsg || "Employee personal info saved successfully",
            esevaEmpId: newEsevaEmpId
        };
    } else {
        return {
            success: false,
            errorCode: result.errorCode,
            message: result.errorMsg
        };
    }
}

module.exports = {
    getNationalityDropdownService,
    getReligionDropdownService,
    getCategoryDropdownService,
    getBloodGroupDropdownService,
    getRelationDropdownService,
    getCasteDropdownService,
    getSubCasteDropdownService,
    getEmployeeDefService,
    getEsevaEmpDetailsService,
    insertEsevaEmpService,
    getNewEsevaEmpIdService
};