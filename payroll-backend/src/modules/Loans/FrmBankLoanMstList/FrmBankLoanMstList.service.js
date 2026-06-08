const { success } = require("zod");
const repo = require("./FrmBankLoanMstList.repo")

const getULBwiseEmployeeService = async(payload) => {
    console.log("Service: Fetch Employee List", payload);
    const data = await repo.getULBwiseEmployeeRepo(payload)

    return{
        success:true, 
        count:data.length, 
        data
    }
}

const getPayHeadService = async(payload) => {
    console.log("Service:Fetch PayHead List", payload)
    const data = await repo.getPayHead(payload)
    if (!data || data.length ===0) {
        return{
            success:false,
            message:"No data Found"
        }
    }
    return{
        success:true,
        count:data.length,
        data
    }
}

async function getBankLoanListService(payload) {
  console.log("📥 Service: Fetch Bank Loan List", payload);

  const data = await repo.getBankLoanListRepo(payload);
    if (!data || data.length ===0) {
        return{
            success:false,
            message:"No data Found"
        }
    }
    
  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
    getULBwiseEmployeeService,
    getPayHeadService,
    getBankLoanListService
}