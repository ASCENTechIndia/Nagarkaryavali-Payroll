

import React, { useEffect, useState } from "react";

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

const FrmLeaveApprove = () => {
  const [fromDate, setFromDate] = useState(new Date());

  const [toDate, setToDate] = useState(new Date());

  const initialValues = {
    empName: "",
    empCode: "",
    department: "",
    designation: "",
    leaveType: "",
    fromDate: new Date(),
    toDate: new Date(),
    totalDays: "",
    halfDay: false,
    reason: "",
    contact: "",
    leaveStatus: "",
    remark: "",
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, setFieldValue, handleChange, resetForm }) => {
      

        return (
          <Form>
            <Card >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl ">
                  Leave Application Approval
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Employee Details */}
                <div className="border rounded-md p-6">
                  <h2 className="text-xl font-semibold text-center mb-8">
                    Employee Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Employee Name */}
                    <div className="space-y-2">
                      <Label text="Employee Name" required className="min-w-[180px]" />

                      <Input
                        name="empName"
                        value={values.empName}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* Employee Code */}
                    <div className="space-y-2">
                      <Label text="Employee Code" required  className="min-w-[180px]"/>

                      <Input
                        name="empCode"
                        value={values.empCode}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label text="Department" required />

                      <Input
                        name="department"
                        value={values.department}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <Label text="Designation" required />

                      <Input
                        name="designation"
                        value={values.designation}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="border rounded-md p-6">
                  <h2 className="text-xl font-semibold text-center mb-8">
                    Leave Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Leave Type */}
                    <div className="space-y-2">
                      <Label text="Leave Type" required />

                      <Input
                        name="leaveType"
                        value={values.leaveType}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* From Date */}
                    <div className="space-y-2">
                      <Label text="From Date" required />

                      <DatePicker
                        value={fromDate}
                        onChange={(date) => {
                          setFromDate(date);

                          setFieldValue("fromDate", date);
                        }}
                        className="h-10"
                      />
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                      <Label text="To Date" required />

                      <DatePicker
                        value={toDate}
                        onChange={(date) => {
                          setToDate(date);

                          setFieldValue("toDate", date);
                        }}
                        className="h-10"
                      />
                    </div>

                    {/* Total Days */}
                    <div className="space-y-2">
                      <Label text="Total No. Days" required />

                      <Input
                        name="totalDays"
                        value={values.totalDays}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* Half Day */}
                    <div className="space-y-2">
                      <Label text="Half Day" />

                      <div className="flex items-center gap-3 h-10 px-4 bg-background">
                        <Input
                          type="checkbox"
                          checked={values.halfDay}
                          onChange={(e) =>
                            setFieldValue("halfDay", e.target.checked)
                          }
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />

                        <span className="text-sm font-medium">
                          Half Day Leave
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                      <Label text="Reason" required />

                      <Textarea
                        name="reason"
                        value={values.reason}
                        readOnly
                        
                      />
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                      <Label text="Contact" required />

                      <Input
                        name="contact"
                        value={values.contact}
                        readOnly
                        className="h-10 bg-background"
                      />
                    </div>

                    {/* Leave Status */}
                    <div className="space-y-2">
                      <Label text="Leave Status" required />

                      <Select
                        value={values.leaveStatus}
                        onValueChange={(value) =>
                          setFieldValue("leaveStatus", value)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="A">Approved</SelectItem>

                          <SelectItem value="R">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remark */}
                    <div className="space-y-2">
                      <Label text="Remark" required />

                      <Textarea
                        name="remark"
                        value={values.remark}
                        onChange={handleChange}
                        placeholder="Enter Remark"
                       
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4 mt-10">
                    <Button type="submit">Submit</Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => resetForm()}
                      path="/Masters/FrmLeaveApprovalList"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmLeaveApprove;
