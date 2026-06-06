import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, Formik } from "formik";
import { DatePicker } from "@/components/ui/calendar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmLoansAndAdvancesReceived = () => {
const [payheadOptions, setPayheadOptions] = useState([]);
const [selectedDate, setSelectedDate] = useState(new Date());
const { user } = useAuth();

const initialFormValues = {
  payhead: "",
};

// payhead func check
const fetchPayHeads = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/FrmPayHeadListMst/payheads-list`,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
  );
    setPayheadOptions(res.data?.rows || []);
  } catch (error) {
    console.error("Pay Head Dropdown API Error:", error);
  }
};

const handlePrint = async (values) => {
  setHasSearched(true);
  setLoading(true);

  try {
    const payload = {
      ulbid: Number(ulbId),
      payhead: Number(payHeadId),
      salaryDate:Date(salaryDate),
      employeeType: Var(employeeType),
    };

    const res = await axios.post(
      `${BASE_URL}/api/FrmLoanAndAdvancedReceived/LoanAdvancesReceived`,              
      payload,
      { headers: { Authorization: `Bearer ${user?.token}` }
      }
    );

    const apiData = res.data?.data?.data || res.data?.data || [];
    setFilteredData(apiData || []);

    if (apiData.length === 0) {
      Swal.fire({ text: "No records found" });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
  };

  useState(() => {
  fetchPayHeads();
}, []);

return (  
  <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={handlePrint}
    >
    {({ values, setFieldValue }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-2xl font-semibold">
                  Loans And Advances List
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Select Date" className="font-semibold"/>
                  </div>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    className="w-full h-9"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Payhead" className="font-semibold"/>                      
                  </div>
                  <Select
                    value={values.payhead}
                    onValueChange={(v) => setFieldValue("payhead", v)}
                  >
                    <SelectTrigger className="w-[300px] h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payheadOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                

              </div> 
              <CardContent className="p-6">
                  <div className="flex justify-center">
                    <Button className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" type="submit"
                    onClick={handlePrint}>
                    Print
                    </Button>
                  </div>
                </CardContent>
            </Card>
         </Form> 
        )
    }}
  </Formik> 
)
 
};

export default FrmLoansAndAdvancesReceived;