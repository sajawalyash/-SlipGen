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
  absent: string
  halfDay: string
}

const FOUNDATION_LOGO = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HLF%20Logo%20Black-Roe5fhS7yL0HMDYzGyxFP6qEjLWFvl.png'

const initialData: PayslipData = {
  companyName: 'Hope for Life Foundation',
  employeeName: 'Employee',
  designation: 'Employee',
  payPeriod: 'Oct 1, 2026  –  Oct 31, 2026',
  paymentDate: 'Oct 2, 2026',
  basicPay: '0.00',
  absent: '0.00',
  halfDay: '0.00',
}

function money(value: string) {
  const amount = Number.parseFloat(value) || 0
  return `PKR ${amount.toFixed(2)}`
}

export default function Page() {
  const [data, setData] = useState(initialData)
  const [exportError, setExportError] = useState('')

  function updateField(field: keyof PayslipData, value: string) {
    setData((current) => ({ ...current, [field]: value }))
  }

  async function downloadPayslip() {
    const payslip = document.querySelector('[data-payslip]') as HTMLElement | null
    if (!payslip) return
    setExportError('')

    try {
      const canvas = await html2canvas(payslip, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const imageWidth = pageWidth - margin * 2
      const imageHeight = (canvas.height * imageWidth) / canvas.width
      const fittedHeight = Math.min(imageHeight, pageHeight - margin * 2)
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imageWidth, fittedHeight)
      pdf.save(`${data.employeeName || 'employee'}-payslip.pdf`)
    } catch {
      setExportError('Could not create the PDF. Please try again.')
    }
  }

  const earnings = Number.parseFloat(data.basicPay) || 0
  const deductions = (Number.parseFloat(data.absent) || 0) + (Number.parseFloat(data.halfDay) || 0)
  const netPay = earnings - deductions

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-[#182131] sm:px-8">
      <div className="mx-auto flex max-w-[980px] flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#647084]">Payroll workspace</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Payslip preview</h1><p className="mt-1 text-sm text-[#647084]">Edit the fields below to enter employee details.</p></div>
          <div className="flex gap-3"><Button variant="outline" className="border-[#cbd2dc] bg-white" onClick={downloadPayslip}><Download data-icon="inline-start" /> Download PDF</Button><Button className="bg-[#182131] text-white hover:bg-[#2b374b]" onClick={() => window.print()}><Printer data-icon="inline-start" /> Print</Button></div>
        </header>

        {exportError && <p role="alert" className="text-sm text-red-700">{exportError}</p>}

        <section className="rounded-xl border border-[#dce1e8] bg-white p-5 shadow-[0_10px_30px_rgba(24,33,49,0.05)] sm:p-8" aria-label="Payslip details">
          <div className="mb-6 border-b border-[#e4e8ee] pb-4"><h2 className="font-semibold">Payslip details</h2><p className="mt-1 text-sm text-[#647084]">Update the employee and payment information below.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Editor label="Company name" value={data.companyName} onChange={(value) => updateField('companyName', value)} />
            <Editor label="Employee name" value={data.employeeName} onChange={(value) => updateField('employeeName', value)} />
            <Editor label="Designation" value={data.designation} onChange={(value) => updateField('designation', value)} />
            <Editor label="Payment date" value={data.paymentDate} onChange={(value) => updateField('paymentDate', value)} />
            <Editor label="Pay period" value={data.payPeriod} onChange={(value) => updateField('payPeriod', value)} className="sm:col-span-2" />
            <Editor label="Basic pay (PKR)" value={data.basicPay} onChange={(value) => updateField('basicPay', value)} type="number" />
            <Editor label="Absent deduction" value={data.absent} onChange={(value) => updateField('absent', value)} type="number" />
            <Editor label="Half day deduction" value={data.halfDay} onChange={(value) => updateField('halfDay', value)} type="number" />
          </div>
        </section>

        <article data-payslip className="mx-auto w-full max-w-[760px] bg-white px-5 py-7 shadow-[0_8px_26px_rgba(24,33,49,0.06)] sm:px-10 sm:py-9">
          <div className="border-t-2 border-[#182131] pt-6">
            <div className="grid grid-cols-3 items-start gap-4"><div className="min-h-16"><img src={FOUNDATION_LOGO} alt="Hope for Life Foundation logo" className="max-h-12 max-w-28 object-contain object-left" /><p className="mt-1 text-xs font-semibold text-[#647084]">{data.companyName}</p></div><h2 className="text-center text-3xl font-bold tracking-tight">PAYSLIP</h2><div className="text-right text-xs font-bold uppercase tracking-[0.12em] text-[#465165]"><p>Payment date</p><p className="mt-1 text-sm tracking-normal text-[#182131]">{data.paymentDate}</p></div></div>
            <div className="mt-6 grid grid-cols-2 border-b border-t border-[#cbd2dc] py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#465165]"><div><p>Pay period</p><p className="mt-1 text-sm tracking-normal text-[#182131]">{data.payPeriod}</p></div><div className="text-right"><p>Employee</p><p className="mt-1 text-sm tracking-normal text-[#182131]">{data.employeeName}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#465165]">{data.designation}</p></div></div>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 sm:gap-0"><PayslipTable title="Earnings" rows={[['Basic Pay', money(data.basicPay)]]} /><PayslipTable title="Deductions" rows={[['Absent', money(data.absent)], ['Half Day', money(data.halfDay)]]} negative /></div>
            <div className="mt-7 border-t-2 border-[#182131] pt-8 sm:ml-auto sm:w-[52%]"><div className="flex justify-between text-sm"><span>Total Earnings</span><strong>{money(earnings.toFixed(2))}</strong></div><div className="mt-3 flex justify-between text-sm"><span>Total Deductions</span><strong className="text-red-600">-{money(deductions.toFixed(2))}</strong></div><div className="mt-5 flex justify-between border-t border-[#465165] pt-4 text-lg font-bold"><span>NET PAY</span><span>{money(netPay.toFixed(2))}</span></div><div className="mt-3 border-b-[5px] border-[#182131]" /></div>
          </div>
        </article>
      </div>
    </main>
  )
}

function Editor({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return <label className={`flex flex-col gap-1 text-xs font-semibold text-[#465165] ${className}`}><span>{label}</span><input type={type} value={value} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-[#cbd2dc] bg-white px-3 text-sm font-normal text-[#182131] outline-none focus:border-[#182131] focus:ring-2 focus:ring-[#dce1e8]" /></label>
}

function PayslipTable({ title, rows, negative = false }: { title: string; rows: [string, string][]; negative?: boolean }) {
  return <div className="border-b border-[#cbd2dc] sm:pr-5 sm:[&:last-child]:border-l sm:[&:last-child]:pl-5 sm:[&:last-child]:pr-0"><div className="flex justify-between border-b-2 border-[#182131] bg-[#f1f4f8] px-2 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#182131]"><span>{title}</span><span>Amount</span></div>{rows.map(([label, amount]) => <div key={label} className="flex justify-between border-b border-[#cbd2dc] px-0 py-4 text-sm"><span>{label}</span><strong className={negative ? 'text-red-600' : ''}>{amount}</strong></div>)}</div>
}
