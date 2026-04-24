'use client'

import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import Biscuits from 'universal-cookie'
import { useRouter } from 'next/navigation'
import { SpinnerGap, UploadSimple, FileXls, ArrowCounterClockwise, CheckCircle } from 'phosphor-react'
import { toast } from 'sonner'
import { Toaster } from '@/app/components/ui/sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'

const biscuits = new Biscuits()

// Month abbreviation → zero-based index
const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

// Parse "20/Mar/2026" or "2026-03-20" or any dayjs-parseable string
function parseDate(val) {
  if (!val && val !== 0) return null
  const str = val.toString().trim()

  // "DD/MMM/YYYY" format (e.g. "20/Mar/2026")
  const ddMmmYyyy = str.match(/^(\d{1,2})\/([A-Za-z]{3})\/(\d{4})$/)
  if (ddMmmYyyy) {
    const month = MONTH_MAP[ddMmmYyyy[2].toLowerCase()]
    if (month !== undefined) {
      const d = dayjs(new Date(parseInt(ddMmmYyyy[3]), month, parseInt(ddMmmYyyy[1])))
      if (d.isValid()) return d
    }
  }

  // Excel serial date (number)
  if (!isNaN(str) && str.length < 6) {
    const d = dayjs(new Date(Date.UTC(1899, 11, 30) + parseInt(str) * 86400000))
    if (d.isValid()) return d
  }

  // ISO / other dayjs-parseable
  const d = dayjs(str)
  return d.isValid() ? d : null
}

// Parse a number that may have commas and a Dr/Cr suffix
// Returns { value: number, isDebit: boolean }
function parseBalance(val) {
  if (val === null || val === undefined || val === '') return { value: NaN, isDebit: true }
  const str = val.toString().trim()
  const isCredit = /cr$/i.test(str)
  const num = parseFloat(str.replace(/,/g, '').replace(/[a-z]+$/i, '').trim())
  return { value: isNaN(num) ? NaN : Math.abs(num), isDebit: !isCredit }
}

// Parse a plain number (Debit / Credit cells — no Dr/Cr suffix)
function parseNum(val) {
  if (val === null || val === undefined || val === '') return NaN
  return parseFloat(val.toString().replace(/,/g, '').trim())
}

// Distribute outstanding balance backwards over invoices (most recent first)
function applyBalance(invoices, balance) {
  if (!balance || isNaN(balance) || balance <= 0) return
  let remaining = balance
  for (let i = invoices.length - 1; i >= 0; i--) {
    if (remaining <= 0) break
    const inv = invoices[i]
    if (remaining >= inv.totalAmount) {
      inv.pending = inv.totalAmount
      inv.amountPaid = 0
      inv.status = 'NotPaid'
      remaining = parseFloat((remaining - inv.totalAmount).toFixed(2))
    } else {
      inv.pending = parseFloat(remaining.toFixed(2))
      inv.amountPaid = parseFloat((inv.totalAmount - remaining).toFixed(2))
      inv.status = 'PartialPaid'
      remaining = 0
    }
  }
}

function parseLedgerWorkbook(workbook) {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  // ── 1. Read all rows as raw arrays ────────────────────────────────────────
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
    defval: '',
  })

  // ── 2. Find the global column header row ──────────────────────────────────
  let dateCol = 0, voucherCol = 1, particularCol = 2, debitCol = 3, creditCol = 4, balanceCol = 5
  let headerRowIdx = -1

  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const norm = (rows[i] || []).map(c => (c || '').toString().toLowerCase().trim())
    const di = norm.findIndex(v => v === 'debit')
    const bi = norm.findIndex(v => v === 'balance')
    if (di !== -1 && bi !== -1) {
      headerRowIdx = i
      debitCol   = di
      balanceCol = bi
      const ci = norm.findIndex(v => v === 'credit')
      if (ci !== -1) creditCol = ci
      const datei = norm.findIndex(v => v === 'date')
      if (datei !== -1) dateCol = datei
      const vi = norm.findIndex(v => v.includes('voucher') || v.includes('vch'))
      voucherCol = vi !== -1 ? vi : dateCol + 1
      const pi = norm.findIndex(v => v.includes('particular'))
      particularCol = pi !== -1 ? pi : voucherCol + 1
      break
    }
  }

  // ── 3. Content-based section detection ───────────────────────────────────
  // Tally exports often use styled (colored) rows rather than actual Excel merges,
  // so we cannot rely on worksheet['!merges']. Instead we scan for rows that:
  //   • have text content (letters)
  //   • have NO positive numeric values in the debit / credit / balance columns
  //   • are not sub-total, report-total, or date-header rows
  // These are dealer / section label rows that separate ATL from VCL data.
  const sectionHeaderRows = []
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i] || []
    const rowText = row.map(c => (c || '').toString()).join('|')

    // Skip rows that match totals or headers we handle elsewhere
    if (/sub\s*total|report\s*total/i.test(rowText)) continue

    const hasLetter = /[a-zA-Z]/.test(rowText)
    if (!hasLetter) continue

    // A data row has a positive Debit or Credit or a Balance value
    const debitVal  = parseNum(row[debitCol])
    const creditVal = parseNum(row[creditCol])
    const { value: balVal } = parseBalance(row[balanceCol])
    const isDataLike = (!isNaN(debitVal) && debitVal > 0)
                    || (!isNaN(creditVal) && creditVal > 0)
                    || (!isNaN(balVal)   && balVal   > 0)

    if (!isDataLike) {
      sectionHeaderRows.push(i)
    }
  }

  // ── 4. Build section boundaries (ATL = index 0, VCL = index 1) ───────────
  const TYPES = ['ATL', 'VCL']
  const sections = sectionHeaderRows.map((start, i) => ({
    start,
    end: i + 1 < sectionHeaderRows.length ? sectionHeaderRows[i + 1] : rows.length,
    type: TYPES[i] ?? `Section${i + 1}`,
  }))

  // ── 5. Parse one section ──────────────────────────────────────────────────
  function parseSection(start, end, invoiceType) {
    const invoices = []
    const payments = []
    let sectionBalance = 0
    let sectionIsDebit = true  // true = outstanding (Dr), false = leftover credit (Cr)
    let totalDebit  = 0
    let totalCredit = 0

    for (let i = start + 1; i < end; i++) {
      const row = rows[i] || []

      // Join ALL cells to detect sub-total / report-total anywhere in the row
      const rowText = row.map(c => (c || '').toString()).join('|')
      const isSubTotal    = /sub\s*total/i.test(rowText)
      const isReportTotal = /report\s*total/i.test(rowText)

      if (isReportTotal) continue

      if (isSubTotal) {
        const { value, isDebit } = parseBalance(row[balanceCol])
        if (!isNaN(value)) { sectionBalance = value; sectionIsDebit = isDebit }
        continue
      }

      // ── Data row: must have a parseable date ──
      const dateStr = (row[dateCol] || '').toString().trim()
      if (!dateStr || dateStr.toLowerCase() === 'date') continue

      const dateD = parseDate(dateStr)
      if (!dateD) continue

      const voucherNo  = (row[voucherCol]    || '').toString().trim()
      const particular = (row[particularCol] || '').toString().trim() || '-'

      // ── Invoice: positive Debit ──
      const debitVal = parseNum(row[debitCol])
      if (!isNaN(debitVal) && debitVal > 0 && voucherNo) {
        totalDebit += debitVal
        invoices.push({
          invoiceDate: dateD.format('YYYY-MM-DD 00:00:00'),
          invoiceNo:   voucherNo,
          invoiceType,
          totalAmount: parseFloat(debitVal.toFixed(2)),
          amountPaid:  parseFloat(debitVal.toFixed(2)),
          pending:     0,
          status:      'Paid',
          expiryDate:  dateD.add(45, 'day').format('YYYY-MM-DD 00:00:00'),
        })
      }

      // ── Payment: positive Credit ──
      const creditVal = parseNum(row[creditCol])
      if (!isNaN(creditVal) && creditVal > 0) {
        totalCredit += creditVal
        payments.push({
          amount:        parseFloat(creditVal.toFixed(2)),
          id:            sheetName,
          invoiceNo:     '-',
          transactionId: voucherNo || '-',
          paymentDate:   dateD.format('YYYY-MM-DD HH:mm:ss'),
          adminId:       'A0045',
          particular,
          balance:       0,
        })
      }
    }

    // Fallback: if Sub Total row wasn't found (or parsed as 0), compute outstanding
    // from the section's own debit/credit totals so payments are always reflected.
    if (sectionBalance === 0 && totalDebit > 0) {
      const computed = parseFloat((totalDebit - totalCredit).toFixed(2))
      sectionBalance = Math.abs(computed)
      sectionIsDebit = computed >= 0
    }

    return { invoices, payments, balance: sectionBalance, isDebit: sectionIsDebit }
  }

  // ── 6. Parse ATL and VCL sections ────────────────────────────────────────
  const atl = sections[0] ? parseSection(sections[0].start, sections[0].end, 'ATL') : { invoices: [], payments: [], balance: 0, isDebit: true }
  const vcl = sections[1] ? parseSection(sections[1].start, sections[1].end, 'VCL') : { invoices: [], payments: [], balance: 0, isDebit: true }

  // ── 7. Find REPORT TOTAL balance from the full sheet ─────────────────────
  let reportTotalBalance = 0
  let reportTotalIsDebit = true
  for (let i = 0; i < rows.length; i++) {
    const rowText = (rows[i] || []).map(c => (c || '').toString()).join('|')
    if (/report\s*total/i.test(rowText)) {
      const { value, isDebit } = parseBalance((rows[i] || [])[balanceCol])
      if (!isNaN(value)) { reportTotalBalance = value; reportTotalIsDebit = isDebit }
      break
    }
  }

  // ── 8. Assign REPORT TOTAL balance to the single latest payment by date ───
  const allPayments = [...atl.payments, ...vcl.payments]
  if (allPayments.length > 0 && reportTotalBalance > 0) {
    let latestIdx = 0
    let latestDate = dayjs(allPayments[0].paymentDate)
    for (let i = 1; i < allPayments.length; i++) {
      const d = dayjs(allPayments[i].paymentDate)
      if (d.isAfter(latestDate)) { latestDate = d; latestIdx = i }
    }
    allPayments[latestIdx].balance = reportTotalIsDebit ? reportTotalBalance : -reportTotalBalance
  }

  // ── 9. Apply outstanding balance over all invoices combined ──────────────
  // Use REPORT TOTAL so cross-section credits (e.g. VCL Cr) are netted against
  // Dr sections before marking invoice statuses. Fall back to the signed sum of
  // per-section balances when REPORT TOTAL isn't found in the sheet.
  let distributionBalance = reportTotalIsDebit ? reportTotalBalance : 0
  if (distributionBalance === 0) {
    const atlNet = atl.isDebit ? atl.balance : -atl.balance
    const vclNet = vcl.isDebit ? vcl.balance : -vcl.balance
    const net = parseFloat((atlNet + vclNet).toFixed(2))
    distributionBalance = net > 0 ? net : 0
  }

  // Objects in atl.invoices / vcl.invoices are references, so applyBalance
  // modifying the merged array also updates the originals for the UI.
  const allInvoices = [...atl.invoices, ...vcl.invoices]
    .sort((a, b) => dayjs(a.invoiceDate).valueOf() - dayjs(b.invoiceDate).valueOf())
  applyBalance(allInvoices, distributionBalance)

  return {
    dealerId: sheetName,
    atl,
    vcl,
    payments: allPayments,
  }
}

function buildInvoicePayload(parsed) {
  const { dealerId, atl, vcl } = parsed
  return [...atl.invoices, ...vcl.invoices].map(inv => ({
    invoiceNo:     inv.invoiceNo.replace(/\//g, '***'),
    invoiceType:   inv.invoiceType,
    invoiceDate:   inv.invoiceDate,
    dealerId,
    invoiceAmount: inv.totalAmount,
    amountPaid:    inv.amountPaid,
    expiryDate:    inv.expiryDate,
    boxes:         '-',
  }))
}

function buildPaymentPayload(parsed) {
  return parsed.payments
}

// ── UI helpers ────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function StatusBadge({ status }) {
  const cls = {
    Paid:        'bg-green-100 text-green-800',
    PartialPaid: 'bg-yellow-100 text-yellow-800',
    NotPaid:     'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function InvoiceTable({ invoices }) {
  if (!invoices.length) {
    return <p className="text-sm text-gray-400 py-6 text-center">No debit entries found in this section.</p>
  }
  return (
    <div className="overflow-x-auto rounded border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Expiry Date (+45d)</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Amount Paid</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
              <TableCell className="text-sm">{dayjs(inv.invoiceDate).format('DD/MM/YYYY')}</TableCell>
              <TableCell className="text-sm">{dayjs(inv.expiryDate).format('DD/MM/YYYY')}</TableCell>
              <TableCell className="text-right text-sm">₹{fmt.format(inv.totalAmount)}</TableCell>
              <TableCell className="text-right text-sm">₹{fmt.format(inv.amountPaid)}</TableCell>
              <TableCell className="text-right text-sm">₹{fmt.format(inv.pending)}</TableCell>
              <TableCell><StatusBadge status={inv.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PaymentTable({ payments }) {
  if (!payments.length) {
    return <p className="text-sm text-gray-400 py-6 text-center">No credit/payment entries found in the ledger.</p>
  }
  return (
    <div className="overflow-x-auto rounded border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Particular</TableHead>
            <TableHead className="text-right">Amount (Credit)</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
              <TableCell className="text-sm">{dayjs(p.paymentDate).format('DD/MM/YYYY')}</TableCell>
              <TableCell className="text-sm">{p.particular}</TableCell>
              <TableCell className="text-right text-sm">₹{fmt.format(p.amount)}</TableCell>
              <TableCell className={`text-right text-sm font-medium ${p.balance < 0 ? 'text-green-700' : p.balance > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                {p.balance < 0 ? `−₹${fmt.format(Math.abs(p.balance))}` : p.balance > 0 ? `₹${fmt.format(p.balance)}` : '₹0.00'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────────

export default function LedgerImport() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [file, setFile]       = useState(null)
  const [parsed, setParsed]   = useState(null)
  const [processing, setProcessing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const cookieVal = biscuits.get('sc_user_detail')
    if (cookieVal) {
      setUser(JSON.parse(decodeURIComponent(cookieVal)))
    } else {
      router.push('/')
    }
  }, [])

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (f) { setFile(f); setParsed(null) }
  }

  function processFile() {
    if (!file) return
    setProcessing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const result   = parseLedgerWorkbook(workbook)
        const totalInv = result.atl.invoices.length + result.vcl.invoices.length
        const totalPay = result.payments.length
        if (totalInv === 0 && totalPay === 0) {
          toast.warning('Nothing found. Check that the file has correct column headers (Date, Voucher No, Debit, Credit, Balance).')
        } else {
          toast.success(`Parsed ${totalInv} invoice${totalInv !== 1 ? 's' : ''} and ${totalPay} payment${totalPay !== 1 ? 's' : ''}.`)
        }
        setParsed(result)
      } catch (err) {
        console.error(err)
        toast.error('Failed to parse the file: ' + err.message)
      } finally {
        setProcessing(false)
      }
    }
    reader.onerror = () => { toast.error('Could not read the file.'); setProcessing(false) }
    reader.readAsBinaryString(file)
  }

  async function submitAll() {
    if (!parsed || !user) return
    const invoicePayload  = buildInvoicePayload(parsed)
    const paymentPayload  = buildPaymentPayload(parsed)

    if (!invoicePayload.length && !paymentPayload.length) {
      toast.error('Nothing to submit.')
      return
    }

    setSubmitting(true)
    try {
      // Submit invoices
      if (invoicePayload.length) {
        const res  = await fetch(
          `/api/v2/amount/${process.env.NEXT_PUBLIC_API_PASS}/U7/${user.id}/-`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(invoicePayload) }
        )
        const data = await res.json()
        if (data.status !== 200) {
          toast.error('Invoice submission failed: ' + (data.message ?? 'Unknown error'))
          return
        }
      }

      // Submit payments
      if (paymentPayload.length) {
        const res2  = await fetch(
          `/api/v2/payments/${process.env.NEXT_PUBLIC_API_PASS}/ledgerbulk`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(paymentPayload) }
        )
        const data2 = await res2.json()
        if (data2.status !== 200) {
          toast.error('Payment submission failed: ' + (data2.message ?? 'Unknown error'))
          return
        }
      }

      toast.success(`Inserted ${invoicePayload.length} invoice${invoicePayload.length !== 1 ? 's' : ''} and ${paymentPayload.length} payment${paymentPayload.length !== 1 ? 's' : ''} successfully.`)
      setFile(null)
      setParsed(null)
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalInvoices = parsed ? parsed.atl.invoices.length + parsed.vcl.invoices.length : 0
  const totalPayments = parsed ? parsed.payments.length : 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Toaster />

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileXls size={22} weight="duotone" />
            Upload General Ledger
          </CardTitle>
          <CardDescription>
            Select the dealer&apos;s General Ledger Excel file (.xlsx). The sheet name must be the dealer&apos;s GST number.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={processFile} disabled={!file || processing} className="flex items-center gap-2">
              {processing
                ? <><SpinnerGap size={16} className="animate-spin" /> Processing…</>
                : <><UploadSimple size={16} /> Process File</>}
            </Button>
            {parsed && (
              <Button variant="outline" onClick={() => { setFile(null); setParsed(null) }} className="flex items-center gap-2">
                <ArrowCounterClockwise size={16} /> Re-upload
              </Button>
            )}
          </div>
          {file && <p className="text-sm text-gray-500">Selected: <span className="font-medium">{file.name}</span></p>}
        </CardContent>
      </Card>

      {/* Preview */}
      {parsed && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-0.5">Dealer GST</p>
                <p className="font-mono font-semibold text-sm">{parsed.dealerId}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-0.5">ATL — {parsed.atl.invoices.length} invoices</p>
                <p className="font-semibold text-sm">Outstanding: ₹{fmt.format(parsed.atl.balance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-0.5">VCL — {parsed.vcl.invoices.length} invoices</p>
                <p className="font-semibold text-sm">Outstanding: ₹{fmt.format(parsed.vcl.balance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-0.5">Payments received</p>
                <p className="font-semibold text-sm">{parsed.payments.length} credit entr{parsed.payments.length !== 1 ? 'ies' : 'y'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Data tables */}
          <Card>
            <CardContent className="pt-4">
              <Tabs defaultValue="atl">
                <TabsList className="mb-4">
                  <TabsTrigger value="atl">ATL ({parsed.atl.invoices.length})</TabsTrigger>
                  <TabsTrigger value="vcl">VCL ({parsed.vcl.invoices.length})</TabsTrigger>
                  <TabsTrigger value="payments">Payments ({parsed.payments.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="atl">
                  <InvoiceTable invoices={parsed.atl.invoices} />
                </TabsContent>
                <TabsContent value="vcl">
                  <InvoiceTable invoices={parsed.vcl.invoices} />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentTable payments={parsed.payments} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={submitAll}
              disabled={submitting || (totalInvoices === 0 && totalPayments === 0)}
              className="flex items-center gap-2"
            >
              {submitting
                ? <><SpinnerGap size={18} className="animate-spin" /> Inserting…</>
                : <><CheckCircle size={18} /> Insert {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''} + {totalPayments} payment{totalPayments !== 1 ? 's' : ''}</>}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
