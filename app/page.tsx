'use client'

import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

type PayslipData = {
  companyName: string
  employeeName: string
  designation: string
  payPeriod: string
  paymentDate: string
  basicPay: string
  totalAbsents: string
  allowance: string
  halfDay: string
  loanDeduction: string
  loanInstallmentNumber: string
}

const FOUNDATION_LOGO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HLF%20Logo%20Black-Roe5fhS7yL0HMDYzGyxFP6qEjLWFvl.png'

const DEFAULT_DESIGNATIONS = ['Manager', 'IT Manager', 'Principal'] as const
const ADD_DESIGNATION = '__add__'

const initialData: PayslipData = {
  companyName: 'Hope for Life Foundation',
  employeeName: 'Employee',
  designation: 'Manager',
  payPeriod: 'Oct 1, 2026  –  Oct 31, 2026',
  paymentDate: 'Oct 2, 2026',
  basicPay: '0.00',
  totalAbsents: '0',
  allowance: '0.00',
  halfDay: '0.00',
  loanDeduction: '0.00',
  loanInstallmentNumber: '',
}

const inputClassName =
  'h-10 rounded-md border border-[#cbd2dc] bg-white px-3 text-sm font-normal text-[#182131] outline-none focus:border-[#182131] focus:ring-2 focus:ring-[#dce1e8]'

function money(value: string | number) {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value) || 0
  return `PKR ${amount.toFixed(2)}`
}

function toNumber(value: string) {
  return Number.parseFloat(value) || 0
}

export default function Page() {
  const [data, setData] = useState(initialData)
  const [designations, setDesignations] = useState<string[]>([...DEFAULT_DESIGNATIONS])
  const [designationMode, setDesignationMode] = useState<'preset' | 'custom'>('preset')
  const [customDesignation, setCustomDesignation] = useState('')
  const [exportError, setExportError] = useState('')

  function updateField(field: keyof PayslipData, value: string) {
    setData((current) => ({ ...current, [field]: value }))
  }

  function handleDesignationSelect(value: string) {
    if (value === ADD_DESIGNATION) {
      setDesignationMode('custom')
      setCustomDesignation('')
      return
    }

    setDesignationMode('preset')
    updateField('designation', value)
  }

  function addCustomDesignation() {
    const next = customDesignation.trim()
    if (!next) return

    setDesignations((current) => (current.includes(next) ? current : [...current, next]))
    updateField('designation', next)
    setDesignationMode('preset')
    setCustomDesignation('')
  }

  async function downloadPayslip() {
    const payslip = document.querySelector('[data-payslip]') as HTMLElement | null
    if (!payslip) return
    setExportError('')

    try {
      const canvas = await html2canvas(payslip, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: payslip.scrollWidth,
        windowWidth: Math.max(payslip.scrollWidth, 900),
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      // One wide payslip across the top half of A4
      const marginX = 10
      const marginY = 8
      const maxWidth = pageWidth - marginX * 2
      const maxHeight = pageHeight / 2 - marginY * 2
      // Prefer full page width so the slip stays horizontal
      let imageWidth = maxWidth
      let imageHeight = (canvas.height * imageWidth) / canvas.width
      if (imageHeight > maxHeight) {
        imageHeight = maxHeight
        imageWidth = (canvas.width * imageHeight) / canvas.height
      }
      const offsetX = marginX + (maxWidth - imageWidth) / 2
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, marginY, imageWidth, imageHeight)
      pdf.save(`${data.employeeName || 'employee'}-payslip.pdf`)
    } catch {
      setExportError('Could not create the PDF. Please try again.')
    }
  }

  const basicPay = toNumber(data.basicPay)
  const totalAbsents = toNumber(data.totalAbsents)
  const allowance = toNumber(data.allowance)
  const halfDay = toNumber(data.halfDay)
  const loanDeduction = toNumber(data.loanDeduction)
  const absentDeduction = (basicPay / 30) * totalAbsents
  const earnings = basicPay + allowance
  const deductions = absentDeduction + halfDay + loanDeduction
  const netPay = earnings - deductions

  const selectValue =
    designationMode === 'custom'
      ? ADD_DESIGNATION
      : designations.includes(data.designation)
        ? data.designation
        : ADD_DESIGNATION

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-[#182131] sm:px-8">
      <div className="mx-auto flex max-w-[980px] flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#647084]">Payroll workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Payslip preview</h1>
            <p className="mt-1 text-sm text-[#647084]">Edit the fields below to enter employee details.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[#cbd2dc] bg-white" onClick={downloadPayslip}>
              <Download data-icon="inline-start" /> Download PDF
            </Button>
            <Button className="bg-[#182131] text-white hover:bg-[#2b374b]" onClick={() => window.print()}>
              <Printer data-icon="inline-start" /> Print
            </Button>
          </div>
        </header>

        {exportError && (
          <p role="alert" className="text-sm text-red-700">
            {exportError}
          </p>
        )}

        <section
          className="rounded-xl border border-[#dce1e8] bg-white p-5 shadow-[0_10px_30px_rgba(24,33,49,0.05)] sm:p-8"
          aria-label="Payslip details"
        >
          <div className="mb-6 border-b border-[#e4e8ee] pb-4">
            <h2 className="font-semibold">Payslip details</h2>
            <p className="mt-1 text-sm text-[#647084]">Update the employee and payment information below.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Editor label="Company name" value={data.companyName} onChange={(value) => updateField('companyName', value)} />
            <Editor label="Employee name" value={data.employeeName} onChange={(value) => updateField('employeeName', value)} />

            <label className="flex flex-col gap-1 text-xs font-semibold text-[#465165]">
              <span>Designation</span>
              <select
                value={selectValue}
                onChange={(event) => handleDesignationSelect(event.target.value)}
                className={inputClassName}
              >
                {designations.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
                <option value={ADD_DESIGNATION}>Add Designation</option>
              </select>
            </label>

            {designationMode === 'custom' && (
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#465165] sm:col-span-2 lg:col-span-1">
                <span>New designation</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDesignation}
                    onChange={(event) => setCustomDesignation(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addCustomDesignation()
                      }
                    }}
                    placeholder="Enter designation"
                    className={`${inputClassName} min-w-0 flex-1`}
                  />
                  <Button type="button" className="h-10 bg-[#182131] text-white hover:bg-[#2b374b]" onClick={addCustomDesignation}>
                    Add
                  </Button>
                </div>
              </label>
            )}

            <Editor label="Payment date" value={data.paymentDate} onChange={(value) => updateField('paymentDate', value)} />
            <Editor
              label="Pay period"
              value={data.payPeriod}
              onChange={(value) => updateField('payPeriod', value)}
              className="sm:col-span-2"
            />
            <Editor
              label="Basic pay (PKR)"
              value={data.basicPay}
              onChange={(value) => updateField('basicPay', value)}
              type="number"
            />
            <Editor
              label="Allowance (PKR)"
              value={data.allowance}
              onChange={(value) => updateField('allowance', value)}
              type="number"
            />
            <Editor
              label="Total absents"
              value={data.totalAbsents}
              onChange={(value) => updateField('totalAbsents', value)}
              type="number"
              step="1"
            />
            <Editor
              label="Absent deduction (auto)"
              value={absentDeduction.toFixed(2)}
              onChange={() => undefined}
              type="number"
              readOnly
            />
            <Editor
              label="Half day deduction (PKR)"
              value={data.halfDay}
              onChange={(value) => updateField('halfDay', value)}
              type="number"
            />
            <Editor
              label="Loan deduction (PKR)"
              value={data.loanDeduction}
              onChange={(value) => updateField('loanDeduction', value)}
              type="number"
            />
            <Editor
              label="Loan installment number"
              value={data.loanInstallmentNumber}
              onChange={(value) => updateField('loanInstallmentNumber', value)}
            />
          </div>
        </section>

        <div className="payslip-print-sheet mx-auto w-full max-w-[920px]">
          <PayslipCard
            data={data}
            basicPay={basicPay}
            allowance={allowance}
            totalAbsents={totalAbsents}
            absentDeduction={absentDeduction}
            halfDay={halfDay}
            loanDeduction={loanDeduction}
            earnings={earnings}
            deductions={deductions}
            netPay={netPay}
          />
        </div>
      </div>
    </main>
  )
}

function Editor({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
  step = '0.01',
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  className?: string
  step?: string
  readOnly?: boolean
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-[#465165] ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? step : undefined}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} ${readOnly ? 'bg-[#f1f4f8] text-[#465165]' : ''}`}
      />
    </label>
  )
}

function PayslipCard({
  data,
  basicPay,
  allowance,
  totalAbsents,
  absentDeduction,
  halfDay,
  loanDeduction,
  earnings,
  deductions,
  netPay,
}: {
  data: PayslipData
  basicPay: number
  allowance: number
  totalAbsents: number
  absentDeduction: number
  halfDay: number
  loanDeduction: number
  earnings: number
  deductions: number
  netPay: number
}) {
  return (
    <article
      data-payslip
      className="payslip-copy w-full bg-white px-6 py-5 shadow-[0_8px_26px_rgba(24,33,49,0.06)]"
    >
      <div className="border-t-2 border-[#182131] pt-4">
        <div className="grid grid-cols-[1.1fr_auto_1.1fr] items-center gap-3">
          <div className="min-w-0">
            <img
              src={FOUNDATION_LOGO}
              alt="Hope for Life Foundation logo"
              className="max-h-10 max-w-24 object-contain object-left"
            />
            <p className="mt-1 truncate text-[11px] font-semibold text-[#647084]">{data.companyName}</p>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight">PAYSLIP</h2>
          <div className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[#465165]">
            <p>Payment date</p>
            <p className="mt-0.5 text-sm font-semibold tracking-normal text-[#182131]">{data.paymentDate}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 border-b border-t border-[#cbd2dc] py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#465165]">
          <div>
            <p>Pay period</p>
            <p className="mt-1 text-sm font-semibold tracking-normal normal-case text-[#182131]">{data.payPeriod}</p>
          </div>
          <div>
            <p>Employee</p>
            <p className="mt-1 text-sm font-semibold tracking-normal normal-case text-[#182131]">{data.employeeName}</p>
          </div>
          <div>
            <p>Designation</p>
            <p className="mt-1 text-sm font-semibold tracking-normal normal-case text-[#182131]">{data.designation}</p>
          </div>
          <div className="text-right">
            <p>Total absents</p>
            <p className="mt-1 text-sm font-semibold tracking-normal normal-case text-[#182131]">{totalAbsents}</p>
            {data.loanInstallmentNumber.trim() && (
              <>
                <p className="mt-2">Loan installment</p>
                <p className="mt-1 text-sm font-semibold tracking-normal normal-case text-[#182131]">
                  {data.loanInstallmentNumber}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-0">
          <PayslipTable
            title="Earnings"
            rows={[
              ['Basic Pay', money(basicPay)],
              ['Allowance', money(allowance)],
            ]}
          />
          <PayslipTable
            title="Deductions"
            rows={[
              ['Absent', money(absentDeduction)],
              ['Half Day', money(halfDay)],
              [
                data.loanInstallmentNumber.trim()
                  ? `Loan (Inst. ${data.loanInstallmentNumber.trim()})`
                  : 'Loan',
                money(loanDeduction),
              ],
            ]}
            negative
          />
        </div>

        <div className="mt-4 grid grid-cols-3 items-end gap-4 border-t-2 border-[#182131] pt-3">
          <div className="flex justify-between text-sm">
            <span>Total Earnings</span>
            <strong>{money(earnings)}</strong>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Deductions</span>
            <strong className="text-red-600">-{money(deductions)}</strong>
          </div>
          <div>
            <div className="flex justify-between text-base font-bold">
              <span>NET PAY</span>
              <span>{money(netPay)}</span>
            </div>
            <div className="mt-2 border-b-[4px] border-[#182131]" />
          </div>
        </div>
      </div>
    </article>
  )
}

function PayslipTable({
  title,
  rows,
  negative = false,
}: {
  title: string
  rows: [string, string][]
  negative?: boolean
}) {
  return (
    <div className="border-b border-[#cbd2dc] pr-4 last:border-l last:pl-4 last:pr-0">
      <div className="flex justify-between border-b-2 border-[#182131] bg-[#f1f4f8] px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#182131]">
        <span>{title}</span>
        <span>Amount</span>
      </div>
      {rows.map(([label, amount]) => (
        <div key={label} className="flex justify-between border-b border-[#cbd2dc] px-0 py-2.5 text-sm">
          <span>{label}</span>
          <strong className={negative ? 'text-red-600' : ''}>{amount}</strong>
        </div>
      ))}
    </div>
  )
}
