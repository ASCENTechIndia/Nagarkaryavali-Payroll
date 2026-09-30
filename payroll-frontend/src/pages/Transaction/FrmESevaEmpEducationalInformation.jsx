import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";

const FrmESevaEmpEducationalInformation = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const empId = location.state?.empId;
  const mode = location.state?.mode || 1;
  const esevaEmpId = location.state?.esevaEmpId;

  // ==================== EDUCATIONAL INFO STATE ====================
  const [eduDegree, setEduDegree] = useState("");
  const [eduUniversity, setEduUniversity] = useState("");
  const [eduPassingYear, setEduPassingYear] = useState("");
  const [eduTableData, setEduTableData] = useState([]);
  const [eduEditId, setEduEditId] = useState(null);

  // ==================== ADDITIONAL TRAINING STATE ====================
  const [atCourseName, setAtCourseName] = useState("");
  const [atOrgDetails, setAtOrgDetails] = useState("");
  const [atCommencementDate, setAtCommencementDate] = useState("");
  const [atTableData, setAtTableData] = useState([]);
  const [atEditId, setAtEditId] = useState(null);

  // ==================== PROFESSIONAL TRAINING STATE ====================
  const [ptDegree, setPtDegree] = useState("");
  const [ptUniversity, setPtUniversity] = useState("");
  const [ptPassingYear, setPtPassingYear] = useState("");
  const [ptTableData, setPtTableData] = useState([]);
  const [ptEditId, setPtEditId] = useState(null);

  // ==================== LOAD EXISTING DATA (EDIT MODE) ====================
  useEffect(() => {
    if (!token) return;
    if (mode === 2 && empId && esevaEmpId) {
      loadExistingData();
    }
  }, [token, mode, empId, esevaEmpId]);

  const loadExistingData = async () => {
    Swal.fire({
      text: "Loading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        ulbid: Number(ulbId),
        empId: Number(empId),
        esevaEmpId: Number(esevaEmpId),
      };

      const headers = { Authorization: `Bearer ${token}` };

      const [eduRes, atRes, ptRes] = await Promise.allSettled([
        axios.post(
          `${BASE_URL}/api/FrmESevaEmpEducationalInformation/education-info`,
          payload,
          { headers }
        ),
        axios.post(
          `${BASE_URL}/api/FrmESevaEmpEducationalInformation/additional-training`,
          payload,
          { headers }
        ),
        axios.post(
          `${BASE_URL}/api/FrmESevaEmpEducationalInformation/professional-training`,
          payload,
          { headers }
        ),
      ]);

      // Educational Info
      if (eduRes.status === "fulfilled") {
        const rows = eduRes.value?.data?.data || [];
        setEduTableData(
          rows.map((row, idx) => ({
            Id: idx + 1,
            Degree: row.DEGREE || row.degree || "",
            University: row.UNIVERSITY || row.university || "",
            PassingYear: row.PASSYEAR || row.passyear || "",
          }))
        );
      } else {
        console.error("Education fetch failed:", eduRes.reason);
      }

      // Additional Training
      if (atRes.status === "fulfilled") {
        const rows = atRes.value?.data?.data || [];
        setAtTableData(
          rows.map((row, idx) => ({
            Id: idx + 1,
            CourseName: row.COURSENAME || row.coursename || "",
            OrganizationDetails: row.ORGDETAILS || row.orgdetails || "",
            CommencementDates: row.COMMENCEDATE || row.commencedate || "",
          }))
        );
      } else {
        console.error("Additional training fetch failed:", atRes.reason);
      }

      // Professional Training
      if (ptRes.status === "fulfilled") {
        const rows = ptRes.value?.data?.data || [];
        setPtTableData(
          rows.map((row, idx) => ({
            Id: idx + 1,
            Degree: row.DEGREE || row.degree || "",
            University: row.UNIVERSITY || row.university || "",
            PassingYear: row.PASSYEAR || row.passyear || "",
          }))
        );
      } else {
        console.error("Professional training fetch failed:", ptRes.reason);
      }

      Swal.close();
    } catch (error) {
      Swal.close();
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load data",
      });
    }
  };

  const getNextId = (data) =>
    data.length > 0 ? Math.max(...data.map((r) => r.Id)) + 1 : 1;

  // ==================== EDUCATIONAL INFO: ADD / UPDATE ====================
  const handleAddEducation = () => {
    if (!eduDegree.trim()) {
      Swal.fire({ text: "Please enter degree.", icon: "warning" });
      return;
    }
    if (!eduUniversity.trim()) {
      Swal.fire({ text: "Please enter university.", icon: "warning" });
      return;
    }
    if (!eduPassingYear.trim()) {
      Swal.fire({ text: "Please enter passing year.", icon: "warning" });
      return;
    }

    if (eduEditId !== null) {
      setEduTableData(
        eduTableData.map((r) =>
          r.Id === eduEditId
            ? {
                ...r,
                Degree: eduDegree.trim(),
                University: eduUniversity.trim(),
                PassingYear: eduPassingYear.trim(),
              }
            : r
        )
      );
      setEduEditId(null);
    } else {
      setEduTableData([
        ...eduTableData,
        {
          Id: getNextId(eduTableData),
          Degree: eduDegree.trim(),
          University: eduUniversity.trim(),
          PassingYear: eduPassingYear.trim(),
        },
      ]);
    }

    setEduDegree("");
    setEduUniversity("");
    setEduPassingYear("");
  };

  // ==================== ADDITIONAL TRAINING: ADD / UPDATE ====================
  const handleAddAdditionalTraining = () => {
    if (!atCourseName.trim()) {
      Swal.fire({ text: "Course Name cannot be blank", icon: "warning" });
      return;
    }
    if (!atOrgDetails.trim()) {
      Swal.fire({ text: "Organization cannot be blank", icon: "warning" });
      return;
    }
    if (!atCommencementDate.trim()) {
      Swal.fire({ text: "Commencement Date cannot be blank", icon: "warning" });
      return;
    }

    if (atEditId !== null) {
      setAtTableData(
        atTableData.map((r) =>
          r.Id === atEditId
            ? {
                ...r,
                CourseName: atCourseName.trim(),
                OrganizationDetails: atOrgDetails.trim(),
                CommencementDates: atCommencementDate.trim(),
              }
            : r
        )
      );
      setAtEditId(null);
    } else {
      setAtTableData([
        ...atTableData,
        {
          Id: getNextId(atTableData),
          CourseName: atCourseName.trim(),
          OrganizationDetails: atOrgDetails.trim(),
          CommencementDates: atCommencementDate.trim(),
        },
      ]);
    }

    setAtCourseName("");
    setAtOrgDetails("");
    setAtCommencementDate("");
  };

  // ==================== PROFESSIONAL TRAINING: ADD / UPDATE ====================
  const handleAddProfessionalTraining = () => {
    if (!ptDegree.trim()) {
      Swal.fire({ text: "Please enter degree.", icon: "warning" });
      return;
    }
    if (!ptUniversity.trim()) {
      Swal.fire({ text: "Please enter university.", icon: "warning" });
      return;
    }
    if (!ptPassingYear.trim()) {
      Swal.fire({ text: "Please enter passing year.", icon: "warning" });
      return;
    }

    if (ptEditId !== null) {
      setPtTableData(
        ptTableData.map((r) =>
          r.Id === ptEditId
            ? {
                ...r,
                Degree: ptDegree.trim(),
                University: ptUniversity.trim(),
                PassingYear: ptPassingYear.trim(),
              }
            : r
        )
      );
      setPtEditId(null);
    } else {
      setPtTableData([
        ...ptTableData,
        {
          Id: getNextId(ptTableData),
          Degree: ptDegree.trim(),
          University: ptUniversity.trim(),
          PassingYear: ptPassingYear.trim(),
        },
      ]);
    }

    setPtDegree("");
    setPtUniversity("");
    setPtPassingYear("");
  };

  // ==================== UPDATE ====================
  const handleUpdateEducation = (row) => {
    setEduDegree(row.Degree);
    setEduUniversity(row.University);
    setEduPassingYear(row.PassingYear);
    setEduEditId(row.Id);
  };

  const handleUpdateAdditionalTraining = (row) => {
    setAtCourseName(row.CourseName);
    setAtOrgDetails(row.OrganizationDetails);
    setAtCommencementDate(row.CommencementDates);
    setAtEditId(row.Id);
  };

  const handleUpdateProfessionalTraining = (row) => {
    setPtDegree(row.Degree);
    setPtUniversity(row.University);
    setPtPassingYear(row.PassingYear);
    setPtEditId(row.Id);
  };

  // ==================== DELETE ====================
  const handleDeleteRow = (tableType, id) => {
    if (tableType === "edu") {
      setEduTableData(eduTableData.filter((r) => r.Id !== id));
      if (eduEditId === id) {
        setEduEditId(null);
        setEduDegree("");
        setEduUniversity("");
        setEduPassingYear("");
      }
    } else if (tableType === "at") {
      setAtTableData(atTableData.filter((r) => r.Id !== id));
      if (atEditId === id) {
        setAtEditId(null);
        setAtCourseName("");
        setAtOrgDetails("");
        setAtCommencementDate("");
      }
    } else if (tableType === "pt") {
      setPtTableData(ptTableData.filter((r) => r.Id !== id));
      if (ptEditId === id) {
        setPtEditId(null);
        setPtDegree("");
        setPtUniversity("");
        setPtPassingYear("");
      }
    }
  };

  // ==================== SAVE ALL ====================
  const handleSave = async () => {
    try {
      if (eduTableData.length === 0) {
        Swal.fire({
          text: "Please Add At least One Educational Information",
          icon: "warning",
        });
        return;
      }

      const buildString = (data, fields) =>
        data.map((row) => fields.map((f) => row[f] || "").join("$")).join("#");

      const strEdu = buildString(eduTableData, [
        "Degree",
        "University",
        "PassingYear",
      ]);
      const strAT = buildString(atTableData, [
        "CourseName",
        "OrganizationDetails",
        "CommencementDates",
      ]);
      const strPT = buildString(ptTableData, [
        "Degree",
        "University",
        "PassingYear",
      ]);

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userid: user?.userId,
        esevaempid: Number(esevaEmpId),
        ulbid: Number(ulbId),
        empid: Number(empId),
        STR: strEdu,
        STR_AT: strAT,
        STR_PT: strPT,
        mode: mode,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaEmpEducationalInformation/insert-education-info`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      const errorCode = res?.data?.data?.errorCode;
      const errorMsg =
        res?.data?.data?.message || res?.data?.message || "Saved successfully";

      if (errorCode === 9999) {
        await Swal.fire({ text: errorMsg, icon: "success" });
        navigate("/Transactions/FrmESevaEmpNomin", {
          state: { empId, esevaEmpId, mode },
        });
      } else {
        await Swal.fire({ text: errorMsg, icon: "info" });
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
      });
    }
  };

  // ==================== TABLE ROW BUILDERS ====================
  const buildEduRows = () =>
    eduTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdateEducation(row)}
        >
          Update
        </Button>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteRow("edu", row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  const buildATRows = () =>
    atTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdateAdditionalTraining(row)}
        >
          Update
        </Button>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteRow("at", row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  const buildPTRows = () =>
    ptTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdateProfessionalTraining(row)}
        >
          Update
        </Button>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteRow("pt", row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">
            Educational Information
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Educational Information
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Degree" />
                    <span>:</span>
                  </div>
                  <Input
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    placeholder="Enter degree"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="University" />
                    <span>:</span>
                  </div>
                  <Input
                    value={eduUniversity}
                    onChange={(e) => setEduUniversity(e.target.value)}
                    placeholder="Enter university"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Passing Year" />
                    <span>:</span>
                  </div>
                  <Input
                    value={eduPassingYear}
                    onChange={(e) => setEduPassingYear(e.target.value)}
                    placeholder="Enter passing year"
                  />
                </div>
              </div>

              <div className="flex justify-center my-3">
                <Button onClick={handleAddEducation}>
                  {eduEditId !== null ? "Update" : "Add"}
                </Button>
              </div>

              {eduTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
                    "Sr No",
                    "Degree",
                    "University",
                    "Passing Year",
                  ]}
                  data={buildEduRows()}
                  keyMapping={{
                    Delete: "Delete",
                    Update: "Update",
                    "Sr No": "SrNo",
                    Degree: "Degree",
                    University: "University",
                    "Passing Year": "PassingYear",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Additional Training
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Course Name" />
                    <span>:</span>
                  </div>
                  <Input
                    value={atCourseName}
                    onChange={(e) => setAtCourseName(e.target.value)}
                    placeholder="Enter course name"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Organization Details" />
                    <span>:</span>
                  </div>
                  <Input
                    value={atOrgDetails}
                    onChange={(e) => setAtOrgDetails(e.target.value)}
                    placeholder="Enter organization"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Commencement Dates (In Year)" />
                    <span>:</span>
                  </div>
                  <Input
                    type="date"
                    value={atCommencementDate}
                    onChange={(e) => setAtCommencementDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-center my-3">
                <Button onClick={handleAddAdditionalTraining}>
                  {atEditId !== null ? "Update" : "Add"}
                </Button>
              </div>

              {atTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
                    "Sr No",
                    "Course Name",
                    "Organization Details",
                    "Commencement Date",
                  ]}
                  data={buildATRows()}
                  keyMapping={{
                    Delete: "Delete",
                    Update: "Update",
                    "Sr No": "SrNo",
                    "Course Name": "CourseName",
                    "Organization Details": "OrganizationDetails",
                    "Commencement Date": "CommencementDates",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Professional And Technical Training After Appointment
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Degree" />
                    <span>:</span>
                  </div>
                  <Input
                    value={ptDegree}
                    onChange={(e) => setPtDegree(e.target.value)}
                    placeholder="Enter degree"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="University" />
                    <span>:</span>
                  </div>
                  <Input
                    value={ptUniversity}
                    onChange={(e) => setPtUniversity(e.target.value)}
                    placeholder="Enter university"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Passing Year" />
                    <span>:</span>
                  </div>
                  <Input
                    value={ptPassingYear}
                    onChange={(e) => setPtPassingYear(e.target.value)}
                    placeholder="Enter passing year"
                  />
                </div>
              </div>

              <div className="flex justify-center my-3">
                <Button onClick={handleAddProfessionalTraining}>
                  {ptEditId !== null ? "Update" : "Add"}
                </Button>
              </div>

              {ptTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
                    "Sr No",
                    "Degree",
                    "University",
                    "Passing Year",
                  ]}
                  data={buildPTRows()}
                  keyMapping={{
                    Delete: "Delete",
                    Update: "Update",
                    "Sr No": "SrNo",
                    Degree: "Degree",
                    University: "University",
                    "Passing Year": "PassingYear",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={handleSave} className="min-w-32">
              Process
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaEmpEducationalInformation;