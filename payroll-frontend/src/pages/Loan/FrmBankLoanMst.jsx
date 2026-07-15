import React, { useMemo } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";

const PAGE_CONFIG = {
  "53": { title: "Computer Loan"},
  "30": { title: "Employee Society"},
  "32": { title: "Festival Advance"},
  "28": { title: "Public Provident Fund Loan"},
  "52": { title: "Other Org. Loan"},
};

const initialValues = {
  employeeId: "",
  payHeadId: "",
  accountNumber: "",
  loanAmount: "",
  interestRate: "",
  balanceAmount: "",
  installmentAmount: "",
  interestAmount: "",
  bankId: "",
  branchId: "",
  active: "Y",
  loanStartDate: null,
  loanEndDate: null,
  remark: "",
};

const FrmBankLoanMst = () => {
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get("@");
  const config = useMemo(() => { return ( PAGE_CONFIG[pageType] || { title: "Loans And Advances"})}, [pageType]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue}) => (
        <Form>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
          >
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold">
                  {config.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Employee"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.employeeId}
                      onValueChange={(value) =>setFieldValue("employeeId",value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Employee --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">Employee 1</SelectItem>
                        <SelectItem value="2">Employee 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Pay Head"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.payHeadId}
                      onValueChange={(value) =>
                        setFieldValue("payHeadId",value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Pay Head --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">Festival Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Account Number"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      value={values.accountNumber}
                      onChange={(e) =>setFieldValue("accountNumber",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Loan Amount"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="number"
                      value={values.loanAmount}
                      onChange={(e) =>setFieldValue("loanAmount",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Interest Rate"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="number"
                      value={values.interestRate}
                      onChange={(e) =>setFieldValue("interestRate",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Balance Amount"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="number"
                      value={values.balanceAmount}
                      onChange={(e) =>setFieldValue("balanceAmount",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Installment Amount"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="number"
                      value={values.installmentAmount}
                      onChange={(e) =>setFieldValue("installmentAmount",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Interest Amount"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="number"
                      value={values.interestAmount}
                      onChange={(e) =>setFieldValue("interestAmount",e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label text="Active" />
                      <span>:</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <Label text="Yes" className="flex items-center gap-2 cursor-pointer"/>
                        <Input
                          type="radio"
                          checked={values.active === "Y"}
                          onChange={() =>setFieldValue("active", "Y")}
                        />

                      <Label text="No" className="flex items-center gap-2 cursor-pointer"/>
                        <Input
                          type="radio"
                          checked={values.active === "N"}
                          onChange={() =>setFieldValue("active", "N")}
                        />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Bank"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.bankId}
                      onValueChange={(value) =>setFieldValue("bankId", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Bank --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">State Bank of India</SelectItem>
                        <SelectItem value="2">Bank of Maharashtra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Branch"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.branchId}
                      onValueChange={(value) =>setFieldValue("branchId", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Branch --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">Main Branch</SelectItem>
                        <SelectItem value="2">City Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Loan Start Date"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <div className="w-full">
                      <DatePicker />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Loan End Date"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>
                    <div className="w-full">
                      <DatePicker />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex sm:justify-between items-start pt-2">
                      <Label text="Remark" />
                      <span>:</span>
                    </div>

                    <Textarea
                      rows={3}
                      className="w-full"
                      value={values.remark}
                      onChange={(e) =>setFieldValue("remark", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 ">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmBankLoanMst;