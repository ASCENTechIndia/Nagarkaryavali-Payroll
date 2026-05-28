import React, { useState } from "react";

import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { DatePicker } from "@/components/ui/calendar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const FrmLeaveApplication = () => {
  const [showDetails, setShowDetails] = useState(false);

  const initialValues = {
    employee: "",
    department: "",
    designation: "",
    leaveType: "",
    allottedLeaves: "",
    balancedLeaves: "",
    fromDate: new Date(),
    toDate: new Date(),
    totalDays: "1",
    halfDay: false,
    reason: "",
    contact: "",
  };

  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <Card >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Leave Application
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Search Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                {/* Employee */}
                <div className="space-y-2">
                  <Label text="Employee Name" required className="min-w-[180px]" />

                  <Select
                    value={values.employee}
                    onValueChange={(value) => setFieldValue("employee", value)}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        2227 - मंगला ज्ञानदेव मडके
                      </SelectItem>

                      <SelectItem value="2">
                        3126 - प्रद्युम्न प्रसाद जोशी
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div>
                  <Button
                    type="button"
                    
                    onClick={() => setShowDetails(true)}
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Show After Search */}
              {showDetails && (
                <div className="border rounded-md p-6 space-y-6">
                  {/* Top Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department */}
                    <div className="space-y-2">
                      <Label text="Department" required />

                      <Select
                        value={values.department}
                        onValueChange={(value) =>
                          setFieldValue("department", value)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">
                            महापालिका मध्यवर्ती भांडार कक्ष
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <Label text="Designation" required />

                      <Select
                        value={values.designation}
                        onValueChange={(value) =>
                          setFieldValue("designation", value)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Designation" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">अधीक्षक</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Leave Type */}
                    <div className="space-y-2">
                      <Label text="Leave Type" required />

                      <Select
                        value={values.leaveType}
                        onValueChange={(value) =>
                          setFieldValue("leaveType", value)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="CL">Casual Leave</SelectItem>

                          <SelectItem value="EL">अर्जित रजा</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Allotted Leaves */}
                    <div className="space-y-2">
                      <Label text="Allotted Leaves" required className="min-w-[180px]" />

                      <Input
                        name="allottedLeaves"
                        value={values.allottedLeaves}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>

                    {/* Balanced Leaves */}
                    <div className="space-y-2">
                      <Label text="Balanced Leaves" required className="min-w-[180px]" />

                      <Input
                        name="balancedLeaves"
                        value={values.balancedLeaves}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>

                    {/* From Date */}
                    <div className="space-y-2">
                      <Label text="From Date" required />

                      <DatePicker
                        value={values.fromDate}
                        onChange={(date) => setFieldValue("fromDate", date)}
                      />
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                      <Label text="To Date" required />

                      <DatePicker
                        value={values.toDate}
                        onChange={(date) => setFieldValue("toDate", date)}
                      />
                    </div>

                    {/* Half Day */}
                    <div className="space-y-2">
                      <Label text="Half Day" />

                      <div className="flex items-center gap-3 h-10  px-4">
                        <Input
                          type="checkbox"
                          checked={values.halfDay}
                          onChange={(e) =>
                            setFieldValue("halfDay", e.target.checked)
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-sm font-medium">Half Day</span>
                      </div>
                    </div>

                    {/* Total Days */}
                    <div className="space-y-2">
                      <Label text="Total No. Days" required />

                      <Input
                        name="totalDays"
                        value={values.totalDays}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                      <Label text="Reason" required />

                      <Textarea
                        name="reason"
                        value={values.reason}
                        onChange={handleChange}
                        className=" min-h-[11px]"
                      />
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                      <Label text="Contact" required />

                      <Input
                        name="contact"
                        value={values.contact}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button type="submit">Submit</Button>

                    <Button type="button" variant="secondary" path="/Dashboard" >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmLeaveApplication;
