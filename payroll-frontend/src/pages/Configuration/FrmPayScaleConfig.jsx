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

const FrmPayScaleConfig = () => {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const token = user?.token;
  const userId = user?.userId || localStorage.getItem("UserId");

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [payScaleData, setPayScaleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedULB, setSelectedULB] = useState("");
  const [mode, setMode] = useState(1);
  const [payScaleConfigId, setPayScaleConfigId] = useState([]);

  const tableHeaders = [
    "निवडा",
    "Pay Scale"
  ];

  const keyMapping = {
    "निवडा": "checked",
    "Pay Scale": "payscalename"
  };

  const columnStyles = {
    "निवडा": { width: "10%", minWidth: "60px" },
    "Pay Scale": { width: "90%", minWidth: "200px" }
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
        `${BASE_URL}/api/PayScaConfig/payscalelist`,
        { 
          ulbId: Number(ulbIdValue)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let data = [];
      if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
        data = response.data.data.rows;
      } else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
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
          payscaleid: item.NUM_PAYSCALEMST_PAYSCALEID || item.payscaleid || "",
          payscalename: item.VAR_PAYSCALEMST_PAYSCALENAME || item.payscalename || "-",
          payscalemname: item.VAR_PAYSCALEMST_PAYSCALEMNAME || item.payscalemname || "-",
          groupname: item.VAR_PAYSCALEMST_GROUPNAME || item.groupname || "-",
          groupid: item.NUM_PAYSCALEMST_GROUPID || item.groupid || "",
          status: item.VAR_PAYSLCONFIG_ACTIVEFLAG || item.status || "N",
          checked: (item.VAR_PAYSLCONFIG_ACTIVEFLAG === 'Y' || item.status === 'Y'),
          IsChecked: (item.VAR_PAYSLCONFIG_ACTIVEFLAG === 'Y' || item.status === 'Y'),
          previousStatus: (item.VAR_PAYSLCONFIG_ACTIVEFLAG === 'Y' || item.status === 'Y') ? "Y" : "N",
          currentStatus: (item.VAR_PAYSLCONFIG_ACTIVEFLAG === 'Y' || item.status === 'Y') ? "Y" : "N"
        }));
        
        setPayScaleData(formattedData);
        setSelectedULB(ulbIdValue);
        setPayScaleConfigId([]);
        setMode(1);
        return formattedData;
      } else {
        setPayScaleData([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching pay scale data:", err);
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.response?.data?.message || "Failed to fetch pay scale data",
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
      `${BASE_URL}/api/PayScaConfig/configuredpayscalelist`,
      { ulbId: Number(ulbIdValue) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Configured response:", response.data);

    let configData = [];
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      configData = response.data.data.data;
    } else if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
      configData = response.data.data.rows;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      configData = response.data.data;
    } else if (Array.isArray(response.data)) {
      configData = response.data;
    }

    console.log("Configured pay scales:", configData);

    setPayScaleConfigId(configData);

    let updatedData = [...dtData];

    const configuredIds = new Set(
      configData.map(config => String(config.CONFIPAYSCALE_ID || config.payscaleid))
    );

    console.log("Configured IDs set:", configuredIds);

    updatedData = updatedData.map(item => {
      const isConfigured = configuredIds.has(String(item.payscaleid));
      return {
        ...item,
        checked: isConfigured,
        IsChecked: isConfigured,
        previousStatus: isConfigured ? "Y" : "N",
        currentStatus: isConfigured ? "Y" : "N"
      };
    });

    updatedData.sort((a, b) => {
      if (a.checked === b.checked) return 0;
      return a.checked ? -1 : 1;
    });
    
    setPayScaleData(updatedData);
    setMode(configData.length > 0 ? 2 : 1);
    
    return updatedData;
  } catch (err) {
    console.error("Error fetching pay scale config:", err);
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
        setPayScaleData([]);
      }
    } else {
      setPayScaleData([]);
    }
  };

  const handleSelectAllChange = (checked) => {
    const updatedData = payScaleData.map(item => ({
      ...item,
      checked: checked === true,
      IsChecked: checked === true,
      currentStatus: checked === true ? "Y" : "N"
    }));
    setPayScaleData(updatedData);
  };

  const handleRowCheckChange = (row, checked) => {
    const updatedData = payScaleData.map(item => {
      if (item.payscaleid === row.payscaleid) {
        return {
          ...item,
          checked: checked,
          IsChecked: checked,
          currentStatus: checked ? "Y" : "N"
        };
      }
      return item;
    });
    setPayScaleData(updatedData);
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
  
  let paramStr = "";
  let chkFlag = false;

  for (const item of payScaleData) {
    const payScaleId = item.payscaleid || "";
    const isChecked = item.checked || false;
    
    const chkedCount = payScaleConfigId.filter(config => 
      String(config.CONFIPAYSCALE_ID || config.payscaleid) === String(payScaleId)
    ).length;

    if (mode === 1) {
      if (isChecked) {
        paramStr += `${payScaleId}#N#Y$`;
        chkFlag = true;
      } else {
        paramStr += `${payScaleId}#N#N$`;
      }
    } else {
      if (isChecked && chkedCount > 0) {
        paramStr += `${payScaleId}#Y#Y$`;
        chkFlag = true;
      } else if (isChecked && chkedCount <= 0) {
        paramStr += `${payScaleId}#N#Y$`;
        chkFlag = true;
      } else if (!isChecked && chkedCount > 0) {
        paramStr += `${payScaleId}#Y#N$`;
        chkFlag = true;
      } else if (!isChecked && chkedCount <= 0) {
        paramStr += `${payScaleId}#N#N$`;
      }
    }
  }

  if (paramStr.length > 0 && chkFlag) {
    paramStr = paramStr.slice(0, -1);
  } else {
    Swal.fire({
      text: "Select atleast one pay scale to save",
      confirmButtonText: 'OK'
    });
    return;
  }

  try {
    setLoading(true);

    const payload = {
      userId: userId,
      ulbId: Number(selectedULB),
      payScaleStr: paramStr,
      mode: mode
    };

    console.log("Save payload:", payload);

    const res = await axios.post(
      `${BASE_URL}/api/PayScaConfig/savepayscaleconfiguration`,
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

    if (errorCode === 9999 || errorCode === 0 || responseData.success === true) {
      Swal.fire({
        text: errorMsg || "Pay scale configuration saved successfully",
        confirmButtonText: 'OK'
      });
      
      if (selectedULB) {
        const freshData = await getData(selectedULB);
        if (freshData.length > 0) {
          await setGrdRecMode(selectedULB, freshData);
        }
        setPayScaleData([...freshData]);
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
        const freshData = await getData(selectedULB);
        if (freshData.length > 0) {
          await setGrdRecMode(selectedULB, freshData);
        }
        setPayScaleData([...freshData]);
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
            Pay Config
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

          {payScaleData.length > 0 && (
            <div className="mt-4">
              {isLoadingList ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading...</span>
                </div>
              ) : (
                <ShadCNTable
                  headers={tableHeaders}
                  data={payScaleData}
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

          {!isLoadingList && selectedULB && selectedULB !== "0" && payScaleData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              निवडलेल्या नगरपालिकेसाठी कोणतीही वेतनश्रेणी डेटा उपलब्ध नाही.
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
              path="/"
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

export default FrmPayScaleConfig;