import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmDesignationConfig = () => {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const token = user?.token;
  const userId = user?.userId || localStorage.getItem("UserId");

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedULB, setSelectedULB] = useState("");
  const [mode, setMode] = useState(1);
  const [desigConfigId, setDesigConfigId] = useState([]);

  const tableHeaders = [
    "निवडा",
    "पदनाम इंग्रजी मध्ये",
    "पदनाम मराठी मध्ये"
  ];

  const keyMapping = {
    "निवडा": "checked",
    "पदनाम इंग्रजी मध्ये": "desigantion_engname",
    "पदनाम मराठी मध्ये": "desigantion_marname"
  };

  const columnStyles = {
    "निवडा": { width: "10%", minWidth: "60px" },
    "पदनाम इंग्रजी मध्ये": { width: "45%", minWidth: "200px" },
    "पदनाम मराठी मध्ये": { width: "45%", minWidth: "200px" }
  };

  useEffect(() => {
    if (ulbId && token) {
      fetchCorporation();
    }
  }, [ulbId, token]);

  const fetchCorporation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmDesignationConfig/corporation-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data || res.data?.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.CORPORATIONNAME || item.corporationname || item.name,
          value: String(item.CORPORATIONID || item.corporationid || item.id),
        }));
        setCorporationOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching corporation:", err);
    }
  };

  const getData = async (ulbIdValue) => {
    try {
      setIsLoadingList(true);
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmDesignationConfig/get-designation-data`,
        { 
          ulbId: Number(ulbIdValue)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let data = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data) {
        data = response.data.data;
      }

      if (data.length > 0) {
        const formattedData = data.map((item) => ({
          desigantion_id: item.DESIGANTION_ID || item.desigantion_id || item.NUM_DESIGMST_DESIGNATIONID || "",
          desigantion_engname: item.DESIGANTION_ENGNAME || item.desigantion_engname || item.VAR_DESIGMST_DESIGNATIONNAME || "-",
          desigantion_marname: item.DESIGANTION_MARNAME || item.desigantion_marname || item.VAR_DESIGMST_DESIGNATIONNAME || "-",
          checked: false,
          IsChecked: false,
          previousStatus: "N",
          currentStatus: "N"
        }));
        setDesignationData(formattedData);
        setSelectedULB(ulbIdValue);
        setDesigConfigId([]);
        setMode(1);
        return formattedData;
      } else {
        setDesignationData([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching designation data:", err);
      Swal.fire({
        title: 'Error',
        text: "Failed to fetch designation data",
        confirmButtonText: 'OK'
      });
      return [];
    } finally {
      setIsLoadingList(false);
    }
  };

  const setGrdRecMode = async (ulbIdValue, dtData) => {
    try {
      setIsLoadingList(true);
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmDesignationConfig/get-designation-config`,
        { 
          ulbId: Number(ulbIdValue)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let configData = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        configData = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        configData = response.data.data;
      } else if (Array.isArray(response.data)) {
        configData = response.data;
      } else if (response.data?.data) {
        configData = response.data.data;
      }

      setDesigConfigId(configData);

      let updatedData = [...dtData];

      if (configData.length > 0) {
        setMode(2);
        updatedData = updatedData.map(item => {
          const found = configData.some(config => 
            String(config.DESIG_ID || config.desig_id) === String(item.desigantion_id)
          );
          return {
            ...item,
            checked: found,
            IsChecked: found,
            previousStatus: found ? "Y" : "N",
            currentStatus: found ? "Y" : "N"
          };
        });
      } else {
        setMode(1);
        updatedData = updatedData.map(item => ({
          ...item,
          checked: false,
          IsChecked: false,
          previousStatus: "N",
          currentStatus: "N"
        }));
      }

      updatedData.sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? -1 : 1;
      });

      setDesignationData(updatedData);
      return updatedData;
    } catch (err) {
      console.error("Error fetching designation config:", err);
      return dtData;
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleULBChange = async (value) => {
    setSelectedULB(value);
    
    if (value && value !== "0") {
      const data = await getData(value);
      if (data.length > 0) {
        await setGrdRecMode(value, data);
      } else {
        setDesignationData([]);
      }
    } else {
      setDesignationData([]);
    }
  };

  const handleSelectAllChange = (checked) => {
    const updatedData = designationData.map(item => ({
      ...item,
      checked: checked === true,
      IsChecked: checked === true,
      currentStatus: checked === true ? "Y" : "N"
    }));
    setDesignationData(updatedData);
  };

  const handleRowCheckChange = (row, checked) => {
    const updatedData = designationData.map(item => {
      if (item.desigantion_id === row.desigantion_id) {
        return {
          ...item,
          checked: checked,
          IsChecked: checked,
          currentStatus: checked ? "Y" : "N"
        };
      }
      return item;
    });
    setDesignationData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedULB || selectedULB === "0") {
      Swal.fire({
        text: "Select ULB Name",
        confirmButtonText: 'OK'
      });
      return;
    }
    let recStr = "";
    let chkFlag = false;

    for (const item of designationData) {
      const desigId = item.desigantion_id || "";
      const isChecked = item.checked || false;
      
      // Check if this designation was initially configured
      const chkedCount = desigConfigId.filter(config => 
        String(config.DESIG_ID || config.desig_id) === String(desigId)
      ).length;

      if (mode === 1) {
        // Mode 1: New configuration
        if (isChecked) {
          recStr += `${desigId}#N#Y$`;
          chkFlag = true;
        } else {
          recStr += `${desigId}#N#N$`;
        }
      } else {
        // Mode 2: Update existing configuration
        if (isChecked && chkedCount > 0) {
          recStr += `${desigId}#Y#Y$`;
          chkFlag = true;
        } else if (isChecked && chkedCount <= 0) {
          recStr += `${desigId}#N#Y$`;
          chkFlag = true;
        } else if (!isChecked && chkedCount > 0) {
          recStr += `${desigId}#Y#N$`;
          chkFlag = true;
        } else if (!isChecked && chkedCount <= 0) {
          recStr += `${desigId}#N#N$`;
        }
      }
    }

    if (recStr.length > 0 && chkFlag) {
      recStr = recStr.slice(0, -1);
    } 
    {/* else {
      Swal.fire({
        text: "कृपया किमान एक चेकबॉक्स निवडा!",
        confirmButtonText: 'OK'
      });
      return;
    }*/}

    try {
      setLoading(true);

      const payload = {
        userId: userId,
        ulbId: Number(selectedULB),
        desigStr: recStr,
        mode: mode,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmDesignationConfig/save-designation-config`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = res.data?.data || res.data || {};
      const errorCode = responseData.errorCode || responseData.ErrorCode || 0;
      const errorMsg = responseData.errorMsg || responseData.ErrorMsg || responseData.message || "";

      if (errorCode === 9999 || responseData.success === true) {
        Swal.fire({
          text: errorMsg || "Configuration saved successfully",
          confirmButtonText: 'OK'
        });
        if (selectedULB) {
          const data = await getData(selectedULB);
          if (data.length > 0) {
            await setGrdRecMode(selectedULB, data);
          }
        }
      } else {
        Swal.fire({
          text: errorMsg || "An error occurred",
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Submit Error", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to save data";
      if (errorMessage.toLowerCase().includes("inserted successfully") || 
          errorMessage.toLowerCase().includes("successfully") ||
          errorMessage.toLowerCase().includes("success") ||
          errorMessage.toLowerCase().includes("saved")) {
        Swal.fire({
          text: errorMessage,
          confirmButtonText: 'OK'
        });
        if (selectedULB) {
          const data = await getData(selectedULB);
          if (data.length > 0) {
            await setGrdRecMode(selectedULB, data);
          }
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-2xl font-semibold">
            पदनाम वर्गीकरण
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-md space-y-2">
              <Label className="font-semibold whitespace-nowrap">
                नगरपालिकेचे नाव
              </Label>
              <Select
                value={selectedULB}
                onValueChange={handleULBChange}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">-- Select Option --</SelectItem>
                  {corporationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {designationData.length > 0 && (
            <div className="mt-4">
              {isLoadingList ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading...</span>
                </div>
              ) : (
                <ShadCNTable
                  headers={tableHeaders}
                  data={designationData}
                  keyMapping={keyMapping}
                  columnStyles={columnStyles}
                  pagination={false}
                  onSelectAllChange={handleSelectAllChange}
                  onRowCheckChange={handleRowCheckChange}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                />
              )}
            </div>
          )}

          {!isLoadingList && selectedULB && selectedULB !== "0" && designationData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              निवडलेल्या नगरपालिकेसाठी कोणताही पदनाम डेटा उपलब्ध नाही.
            </div>
          )}

          <div className="flex justify-center gap-3 mt-8 pt-4 border-t">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "साठवा"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              path="/HomePage/FrmHomePage"
              className="bg-gray-200 text-black hover:bg-gray-300"
            >
              परत
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrmDesignationConfig;