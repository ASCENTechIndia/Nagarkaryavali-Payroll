const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const getDefaultPersonImage = () => {
  const imagePath = path.resolve(
    __dirname,
    "../../../public/Person.png"
  );

  if (!fs.existsSync(imagePath)) {
    return "";
  }

  const imageBuffer = fs.readFileSync(imagePath);

  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
};

const resolveEmployeePhoto = (photoImage) => {
  const fallback = getDefaultPersonImage();

  if (!photoImage) {
    return fallback;
  }

  const value = String(photoImage).trim();

  if (!value) {
    return fallback;
  }

  if (value.startsWith("data:image/")) {
    return value;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const cleanPath = value
    .replace(/^file:\/\//i, "")
    .replace(/^[/\\]+/, "");

  const possiblePaths = [
    path.resolve(
      __dirname,
      "../../../public",
      cleanPath
    ),
    path.resolve(
      __dirname,
      "../../../",
      cleanPath
    ),
  ];

  const imagePath = possiblePaths.find((filePath) =>
    fs.existsSync(filePath)
  );

  if (!imagePath) {
    return fallback;
  }

  const ext = path.extname(imagePath).toLowerCase();

  const mimeTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  const mimeType =
    mimeTypes[ext] || "image/png";

  const imageBuffer = fs.readFileSync(
    imagePath
  );

  return `data:${mimeType};base64,${imageBuffer.toString(
    "base64"
  )}`;
};

Handlebars.registerHelper(
  "formatDate",
  function (date) {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
);

Handlebars.registerHelper(
  "formatGender",
  function (gender) {
    if (!gender) return "";

    const genderMap = {
      M: "Male",
      F: "Female",
      O: "Other",
    };

    return genderMap[gender] || gender;
  }
);

Handlebars.registerHelper(
  "increment",
  function (index) {
    return Number(index) + 1;
  }
);

Handlebars.registerHelper(
  "toFixed",
  function (number, digits) {
    if (
      number === undefined ||
      number === null ||
      number === ""
    ) {
      return "0.00";
    }

    const value = Number(number);

    if (Number.isNaN(value)) {
      return "0.00";
    }

    return value.toFixed(digits || 2);
  }
);

Handlebars.registerHelper(
  "value",
  function (obj, key) {
    if (!obj || !key) return "";

    return obj[key] ?? "";
  }
);

Handlebars.registerHelper(
  "json",
  function (value) {
    return JSON.stringify(value || {});
  }
);

const first = (value) => {
  if (Array.isArray(value)) {
    return value[0] || {};
  }

  return value || {};
};

const array = (value) => {
  return Array.isArray(value) ? value : [];
};

const pick = (obj, ...keys) => {
  if (!obj) return "";

  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return "";
};

const normalizeAddress = (rows) => {
  const row = first(rows);

  return {
    ...row,

    PARMADDRES: pick(
      row,
      "PARMADDRES",
      "PERADDRESS",
      "PERMANENTADDRESS"
    ),

    PERADDRESS2: pick(
      row,
      "PERADDRESS2",
      "PARMADDRESS2"
    ),

    PARMADDRESS2: pick(
      row,
      "PARMADDRESS2",
      "PERADDRESS2"
    ),

    POSTOFFICE: pick(
      row,
      "POSTOFFICE",
      "PO"
    ),

    PO: pick(
      row,
      "POSTOFFICE",
      "PO"
    ),

    COMMADDRESS: pick(
      row,
      "COMMADDRESS"
    ),

    COMMADDRESS2: pick(
      row,
      "COMMADDRESS2"
    ),

    COMMCITY: pick(
      row,
      "COMMCITY",
      "PCITY"
    ),

    COMMPOSTOFF: pick(
      row,
      "COMMPOSTOFF",
      "COMMPO"
    ),

    COMMPO: pick(
      row,
      "COMMPOSTOFF",
      "COMMPO"
    ),

    COMMPINCODE: pick(
      row,
      "COMMPINCODE"
    ),

    MOBNO: pick(
      row,
      "MOBNO"
    ),

    ALTERMOBNO: pick(
      row,
      "ALTERMOBNO"
    ),

    TELNUMBER: pick(
      row,
      "TELNUMBER"
    ),
  };
};

const normalizeEmergency = (rows) => {
  const row = first(rows);

  return {
    ...row,

    EMERG_NAME: pick(
      row,
      "EMERG_NAME",
      "EMERGENCY_NAME",
      "NAME"
    ),

    EMERG_MOBILE: pick(
      row,
      "EMERG_MOBILE",
      "EMERGENCY_MOBILE",
      "MOBILE"
    ),

    EMERG_ALTNAME: pick(
      row,
      "EMERG_ALTNAME",
      "ALTERNATE_NAME"
    ),

    EMERG_RELATION: pick(
      row,
      "EMERG_RELATION",
      "RELATION"
    ),

    EMERG_ALTMOBILE: pick(
      row,
      "EMERG_ALTMOBILE",
      "ALTERNATE_MOBILE"
    ),

    EMERG_STD: pick(
      row,
      "EMERG_STD",
      "STD"
    ),

    EMERG_TEL: pick(
      row,
      "EMERG_TEL",
      "TELEPHONE"
    ),

    EMERG_RESSTD: pick(
      row,
      "EMERG_RESSTD",
      "RES_STD"
    ),

    EMERG_RESTEL: pick(
      row,
      "EMERG_RESTEL",
      "RES_TELEPHONE"
    ),
  };
};

const normalizeTraining = (rows) => {
  return array(rows).map((row) => ({
    ...row,

    TRAINING_NAME: pick(
      row,
      "TRAINING_NAME",
      "TRAININGNAME",
      "COURSE_NAME",
      "COURSENAME"
    ),

    FROM_DATE: pick(
      row,
      "FROM_DATE",
      "FROMDATE",
      "STARTDATE"
    ),

    TO_DATE: pick(
      row,
      "TO_DATE",
      "TODATE",
      "ENDDATE"
    ),

    OFFICER_NAME: pick(
      row,
      "OFFICER_NAME",
      "OFFICERNAME",
      "TRAINING_OFFICER"
    ),
  }));
};

const normalizePosting = (posting) => {
  const data = posting || {};

  return {
    ...data,

    esevaInfo: first(data.esevaInfo),

    previousService: array(
      data.previousService
    ),

    foreignService: array(
      data.foreignService
    ),

    verifiedService: array(
      data.verifiedService
    ),
  };
};

const normalizeLeave = (leave) => {
  const data = leave || {};

  return {
    ...data,

    earnedLeave: array(
      data.earnedLeave
    ),

    earnedLeaveHPL: array(
      data.earnedLeaveHPL
    ),

    leaveAvail: array(
      data.leaveAvail
    ),

    earnedLeaveAvailable: array(
      data.earnedLeaveAvailable ||
      data.leaveAvail
    ),

    leaveAvailHPL: array(
      data.leaveAvailHPL
    ),

    leaveAvailableHPL: array(
      data.leaveAvailableHPL ||
      data.leaveAvailHPL
    ),

    casualLeave: array(
      data.casualLeave
    ),

    extraOrdinaryLeave: array(
      data.extraOrdinaryLeave
    ),

    commutedLeave: array(
      data.commutedLeave
    ),

    childCareLeave: array(
      data.childCareLeave ||
      data.commutedLeave
    ),

    maternityLeave: array(
      data.maternityLeave
    ),

    paternityLeave: array(
      data.paternityLeave
    ),

    otherLeave: array(
      data.otherLeave
    ),

    ltaLeave: array(
      data.ltaLeave
    ),

    ltcDetails: array(
      data.ltcDetails ||
      data.ltaLeave
    ),
  };
};

const normalizeLoans = (loan) => {
  const data = loan || {};

  const advances = array(
    data.interestBearingAdvances
  ).map((row) => ({
    ...row,

    FIRSTRECOVERDATE: pick(
      row,
      "FIRSTRECOVERDATE",
      "FINSTALLDAT"
    ),

    MONTHLYINSTALLMENT: pick(
      row,
      "MONTHLYINSTALLMENT",
      "MONTHINSTALL"
    ),
  }));

  const installments = array(
    data.interestBearingAdvanceInstallments
  ).map((row) => ({
    ...row,

    FIN_YEAR: pick(
      row,
      "FIN_YEAR",
      "FINANCYEAR"
    ),

    ADVANCE: pick(
      row,
      "ADVANCE",
      "INTBERADV"
    ),

    OUTSTANDING: pick(
      row,
      "OUTSTANDING",
      "AMTOS"
    ),

    RECOVERED: pick(
      row,
      "RECOVERED",
      "AMTRECOVER"
    ),

    INTEREST: pick(
      row,
      "INTEREST",
      "INTACC"
    ),

    SIGNATURE: pick(
      row,
      "SIGNATURE",
      "SIGNDET"
    ),

    REMARKS: pick(
      row,
      "REMARKS",
      "REMARK"
    ),
  }));

  return {
    ...data,

    interestBearingAdvances:
      advances,

    interestBearingAdvanceInstallments:
      installments,

    installments,
  };
};

const normalizeReportData = (
  reportData
) => {
  const personalInfo = first(
    reportData.personalInfo
  );

  const addressDetails =
    normalizeAddress(
      reportData.addressDetails
    );

  const emergencyDetails =
    normalizeEmergency(
      reportData.emergencyDetails
    );

  const familyDetails = array(
    reportData.familyDetails
  );

  const educationDetails = array(
    reportData.education ||
    reportData.educationDetails
  );

  const additionalTraining = array(
    reportData.additionalTraining
  );

  const ptTraining = array(
    reportData.ptTraining
  );

  const training = normalizeTraining(
    reportData.training
  );

  const nominationDetails = array(
    reportData.nomination ||
    reportData.nominationDetails
  );

  const postingRecords =
    normalizePosting(
      reportData.posting ||
      reportData.postingRecords
    );

  const leaveRecords =
    normalizeLeave(
      reportData.leaveDetails ||
      reportData.leaveRecords
    );

  const loanAdvanceRecords =
    normalizeLoans(
      reportData.loanDetails ||
      reportData.loanAdvanceRecords
    );

  const appendixRecords = array(
    reportData.appendix
  );

  return {
    ...reportData,

    personalInfo,

    addressDetails,

    emergencyDetails,

    familyDetails,

    educationDetails,

    additionalTraining,

    ptTraining,

    subsequentQualifications:
      ptTraining,

    training,

    nominationDetails,

    postingRecords,

    leaveRecords,

    loanAdvanceRecords,

    appendixRecords,

    resolvedEmpCode:
      reportData.resolvedEmpCode ||
      personalInfo.EMPCODE ||
      personalInfo.empcode ||
      "",

    hasFamily:
      familyDetails.length > 0,

    hasEducation:
      educationDetails.length > 0,

    hasAdditionalTraining:
      additionalTraining.length > 0,

    hasPTTraining:
      ptTraining.length > 0,

    hasTraining:
      training.length > 0,

    hasNomination:
      nominationDetails.length > 0,

    hasPostingRecords:
      postingRecords.previousService
        .length > 0 ||
      postingRecords.foreignService
        .length > 0 ||
      postingRecords.verifiedService
        .length > 0,

    hasLeaveRecords:
      Object.values(
        leaveRecords
      ).some(
        (value) =>
          Array.isArray(value) &&
          value.length > 0
      ),

    hasLoanAdvances:
      loanAdvanceRecords
        .interestBearingAdvances
        .length > 0 ||
      loanAdvanceRecords
        .interestBearingAdvanceInstallments
        .length > 0,

    hasAppendix:
      appendixRecords.length > 0,
  };
};

const EsevaReportPDFHelper = async ({
  reportData,
  ulbId,
  userId,
  userName,
  corporationName,
  brNameMar,
  brAddMar,
}) => {
  if (!reportData) {
    throw new Error(
      "E-Seva report data is required"
    );
  }
  console.log("PDF HELPER")
  const templatePath = path.resolve(
    __dirname,
    "../../templates/FrmEsevaReport.html"
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `E-Seva report template not found: ${templatePath}`
    );
  }

  const htmlFile = fs.readFileSync(
    templatePath,
    "utf8"
  );

  const template =
    Handlebars.compile(htmlFile);

  const normalized =
    normalizeReportData(reportData);
  console.log("normalized")
  const employeePhoto =
    resolveEmployeePhoto(
      normalized.personalInfo?.PHOTOIMAGE
    );

  const templateData = {
    ...normalized,

    ulbId,

    userId,

    userName,

    employeePhoto,

    corporationName:
      corporationName ||
      normalized.corporationName ||
      "Municipal Corporation",

    brNameMar:
      brNameMar ||
      normalized.brNameMar ||
      "",

    brAddMar:
      brAddMar ||
      normalized.brAddMar ||
      "",

    reportDate:
      new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

    currentTime:
      new Date().toLocaleTimeString(
        "en-GB"
      ),
  };
  console.log("{templateData}")
  const html = template(
    templateData
  );

  const chromePath = path.resolve(
    __dirname,
    "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
  );

  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };

  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const pdfBuffer =
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
        },
      });
    console.log("pdfBuffer", pdfBuffer)
    const outputDir =
      path.resolve(
        __dirname,
        "../../../public/pdf"
      );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    const empCode =
      normalized.resolvedEmpCode ||
      normalized.personalInfo?.EMPCODE ||
      normalized.personalInfo?.empcode ||
      "unknown";

    const fileName =
      `Merged_Eseva_${empCode}_${Date.now()}.pdf`;

    const filePath =
      path.join(
        outputDir,
        fileName
      );

    fs.writeFileSync(
      filePath,
      pdfBuffer
    );
    console.log({ fileName, filePath })
    return {
      fileName,
      filePath,
    };
  } finally {
    await browser.close();
  }
};

module.exports = {
  EsevaReportPDFHelper,
};