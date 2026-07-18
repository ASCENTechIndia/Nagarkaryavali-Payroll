const repo = require("./FrmRetiredEmpRpt.repo");

async function getRetiredEmployeeListService({
  ulbid,
  zoneId,
  deptId,
  subDeptId,
  billNo,
  month,
  year
}) {
  console.log("Service called with:", { ulbid, zoneId, deptId, subDeptId, billNo, month, year });

  if (!ulbid) {
    throw new Error("ULB ID is required");
  }

  if (!zoneId || zoneId === "0" || zoneId === "-1") {
    throw new Error("Please select Zone");
  }

  if (!month || month === "0") {
    throw new Error("Please select Month");
  }

  if (!year) {
    throw new Error("Please select Year");
  }

  const data = await repo.getRetiredEmployeeListRepo({
    ulbid,
    zoneId,
    deptId,
    subDeptId,
    billNo,
    month,
    year
  });

  console.log("Raw data from repo:", data ? data.length : 0, "records");
  
  if (data && data.length > 0) {
    console.log("Raw first record:", JSON.stringify(data[0], null, 2));
    console.log("Raw first record keys:", Object.keys(data[0]));
  }

  if (!data || data.length === 0) {
    throw new Error("Record not Found");
  }

  // Calculate retire date range for display
  const lastDate = new Date(parseInt(year), parseInt(month), 0);
  const retireDate = `${String(lastDate.getDate()).padStart(2, "0")}/${String(lastDate.getMonth() + 1).padStart(2, "0")}/${lastDate.getFullYear()}`;

  // Get department name if selected
  let departmentName = "-- ALL --";
  if (deptId && deptId !== "-1" && data.length > 0) {
    departmentName = data[0].DEPARTMENT || data[0].department || "-- ALL --";
  }

  // IMPORTANT: Map data to match what the PDF template expects
  // The PDF template uses these exact field names: billno, name, retiredate, department, type, etc.
  const mappedData = data.map(row => {
    // Log each row to see what we're getting
    console.log("Mapping row:", JSON.stringify(row, null, 2));
    
    return {
      billno: row.BILLNO || row.billno || "",
      name: row.NAME || row.name || "",
      retiredate: row.RETIREDATE || row.retiredate || "",
      department: row.DEPARTMENT || row.department || "",
      type: row.TYPE || row.type || "",
      grade: row.GRADE || row.grade || "",
      dob: row.DOB || row.dob || "",
      designation: row.DESIGNATION || row.designation || "",
      subdept: row.SUBDEPT || row.subdept || "",
      oldslipno: row.OLDSLIPNO || row.oldslipno || String(row.OLDSLIPNO || ""),
      newslipno: row.NEWSLIPNO || row.newslipno || "",
      oldempno: row.OLDEMPNO || row.oldempno || "",
      ulbid: row.ULBID || row.ulbid || "",
      empid: row.EMPID || row.empid || "",
    };
  });

  console.log("Mapped first record:", JSON.stringify(mappedData[0], null, 2));

  return {
    success: true,
    count: mappedData.length,
    data: mappedData,
    retireDate: retireDate,
    departmentName: departmentName
  };
}

module.exports = {
  getRetiredEmployeeListService
};