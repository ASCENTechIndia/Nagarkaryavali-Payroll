const repo = require("./FrmIncreamentPramotionMst.repo");

async function getEmployeeListService(payload) {
    console.log("📥Service: Fetch Employee List", payload);
    const data = await repo.getEmployeeListRepo(payload);

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getSubDepartmentListService(payload) {
    console.log("Service: Fetch Sub Department List", payload);
    const data = await repo.getSubDepartmentListRepo(payload);

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }
    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getPromotionListService() {
    console.log("Service: Fetch Promotion List");
    const data = await repo.getPromotionListRepo();

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }
    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getIncrementTypeListService() {
    console.log("Service: Fetch Increment Type List");

    const data = await repo.getIncrementTypeListRepo();
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getPayScaleListService() {
    console.log("Service: Fetch Pay Scale List");

    const data = await repo.getPayScaleListRepo();
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getGradeListService() {
    console.log("Service: Fetch Grade List");

    const data = await repo.getGradeListRepo();
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getDesignationListService(payload) {
    console.log("Service: Fetch Designation List", payload);

    const data = await repo.getDesignationListRepo(payload);
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function getBillListService(payload) {
    console.log("📥 Service: Fetch Bill List", payload);

    const data = await repo.getBillListRepo(payload);

    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found"
        }
    }

    return {
        success: true,
        count: data.length,
        data,
    };
}

async function saveIncrementPromotionService(payload) {
  console.log("Service: Save Increment Promotion", payload);

  const result = await repo.saveIncrementPromotionRepo(payload);

  return {
    success: result?.out_ErrorCode === 9999,
    errorCode: result?.out_ErrorCode,
    message: result?.out_ErrorMsg,
    incPromoId: result?.out_IncPromoId,
  };
}

async function updateDocumentService(payload) {
  console.log("📥 Service: Update Document", payload);

  const data = await repo.updateDocumentRepo(payload);
  return {
    success: true,
    data,
  };
}

module.exports = {
    getEmployeeListService,
    getSubDepartmentListService,
    getPromotionListService,
    getIncrementTypeListService,
    getPayScaleListService,
    getGradeListService,
    getDesignationListService,
    getBillListService,
    saveIncrementPromotionService,
    updateDocumentService
};