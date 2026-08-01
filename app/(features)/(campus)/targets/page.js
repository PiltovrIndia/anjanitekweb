'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { AlertCircle, Download, FileSpreadsheet, Loader2, Search, Target, Upload, Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Progress } from '@/app/components/ui/progress'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'

const categoryDefinitions = [
  { id: 1, key: 'vcl', label: 'VCL', unit: 'Boxes' },
  { id: 2, key: 'atl', label: 'ATL', unit: 'Boxes' },
  { id: 3, key: 'collection', label: 'Collection', unit: 'INR' },
]

const formatNumber = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))

function getTargetValues(item, categoryId) {
  const entries = Array.isArray(item.targets) ? item.targets.filter((target) => Number(target.categoryId) === categoryId) : []
  const targetAmount = Number(entries.find((target) => target.targetAmount !== undefined)?.targetAmount ?? 0)
  const actualAmount = Number(entries.find((target) => target.actualAmount !== undefined)?.actualAmount ?? 0)
  const achievement = targetAmount > 0 ? (actualAmount / targetAmount) * 100 : 0

  return { targetAmount, actualAmount, achievement }
}

function AchievementCell({ value }) {
  const safeValue = Math.max(0, Number(value || 0))
  const progressValue = Math.min(safeValue, 100)
  const tone = safeValue >= 100
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : safeValue >= 75
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <div className="min-w-[110px] space-y-2">
      <Badge variant="outline" className={tone}>{safeValue.toFixed(1)}%</Badge>
      <Progress value={progressValue} className="h-1.5" />
    </div>
  )
}

export default function TargetsPage() {
  const [file, setFile] = useState(null)
  const [targets, setTargets] = useState([])
  const [dealerSearch, setDealerSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM-01'))
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const filteredTargets = useMemo(() => targets.filter((item) => (
    `${item?.name || ''} ${item?.userId || item?.id || ''}`.toLowerCase().includes(dealerSearch.trim().toLowerCase())
  )), [dealerSearch, targets])

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const date = dayjs().subtract(index, 'month')
    return { label: date.format('MMM YYYY'), value: date.format('YYYY-MM-01') }
  }), [])

  const summary = useMemo(() => categoryDefinitions.map((category) => {
    const totals = filteredTargets.reduce((result, item) => {
      const values = getTargetValues(item, category.id)
      result.target += values.targetAmount
      result.actual += values.actualAmount
      return result
    }, { target: 0, actual: 0 })

    return {
      ...category,
      ...totals,
      achievement: totals.target > 0 ? (totals.actual / totals.target) * 100 : 0,
    }
  }), [filteredTargets])

  const fetchTargets = useCallback(async (month) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const usersResponse = await fetch(`/api/v2/user/${process.env.NEXT_PUBLIC_API_PASS}/U7/superadmin`)
      const usersData = await usersResponse.json()

      if (usersData.status !== 200) {
        throw new Error(usersData.message || 'Failed to fetch dealers')
      }

      const ids = (usersData.data || []).map((item) => item.id).filter(Boolean).join(',')
      if (!ids) {
        setTargets([])
        return
      }

      const targetsResponse = await fetch(`/api/v2/targets/${process.env.NEXT_PUBLIC_API_PASS}/T1/${month}/${ids}`)
      const targetsData = await targetsResponse.json()

      if (!targetsData.success) {
        throw new Error(targetsData.message || 'Failed to fetch targets')
      }

      setTargets(targetsData.data || [])
    } catch (error) {
      console.error('Error fetching targets:', error)
      setTargets([])
      setMessage({ type: 'error', text: error.message || 'Failed to fetch targets' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTargets(selectedMonth)
  }, [fetchTargets, selectedMonth])

  function processExcelData(rows) {
    const monthDate = selectedMonth
    const processedTargets = []

    rows.forEach((row) => {
      const userId = row['GST ID']
      if (!userId) return

      const rowsByCategory = [
        { categoryId: 2, target: row.ATL, actual: row.ATL_Actual },
        { categoryId: 1, target: row.VCL, actual: row.VCL_Actual },
        { categoryId: 3, target: row.COLLECTION, actual: row.Collection_Actual },
      ]

      rowsByCategory.forEach(({ categoryId, target, actual }) => {
        if (target !== undefined || actual !== undefined) {
          processedTargets.push({
            userId,
            categoryId,
            monthDate,
            targetAmount: parseFloat(target) || 0,
            actualAmount: parseFloat(actual) || 0,
          })
        }
      })
    })

    return processedTargets
  }

  async function handleUpload() {
    if (!file) {
      setMessage({ type: 'error', text: 'Select an Excel file to upload.' })
      return
    }

    setUploading(true)
    try {
      const workbook = XLSX.read(await file.arrayBuffer())
      const rows = workbook.SheetNames.flatMap((sheetName) => XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]))
      const processedTargets = processExcelData(rows)

      const response = await fetch('/api/v2/targets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: processedTargets }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      setFile(null)
      setIsUploadOpen(false)
      setMessage({ type: 'success', text: 'Targets uploaded successfully.' })
      fetchTargets(selectedMonth)
    } catch (error) {
      console.error('Error uploading targets:', error)
      setMessage({ type: 'error', text: error.message || 'Error processing file' })
    } finally {
      setUploading(false)
    }
  }

  function downloadTemplate() {
    const worksheet = XLSX.utils.json_to_sheet([{
      'S.NO.': 1,
      'DEALER NAME': 'Example Dealer',
      'GST ID': '37EXAMPLE1Z0',
      ATL: 10000,
      ATL_Actual: 0,
      VCL: 6000,
      VCL_Actual: 0,
      COLLECTION: 3000000,
      Collection_Actual: 0,
    }])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Targets')
    XLSX.writeFile(workbook, 'targets_template.xlsx')
  }

  function downloadTargets() {
    const headers = ['Dealer', 'VCL Target', 'VCL Actual', 'VCL Achieved %', 'ATL Target', 'ATL Actual', 'ATL Achieved %', 'Collection Target', 'Collection Actual', 'Collection Achieved %']
    const rows = filteredTargets.map((item) => {
      const vcl = getTargetValues(item, 1)
      const atl = getTargetValues(item, 2)
      const collection = getTargetValues(item, 3)
      return [item.name, vcl.targetAmount, vcl.actualAmount, vcl.achievement.toFixed(1), atl.targetAmount, atl.actualAmount, atl.achievement.toFixed(1), collection.targetAmount, collection.actualAmount, collection.achievement.toFixed(1)]
    })
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Targets')
    XLSX.writeFile(workbook, `targets_${dayjs(selectedMonth).format('YYYY-MM')}.xlsx`)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-6">
      <header className="flex w-full flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Targets</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Template
          </Button>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Upload targets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload targets</DialogTitle>
                <DialogDescription>Import the target workbook for {dayjs(selectedMonth).format('MMMM YYYY')}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="targets-file">Excel file</Label>
                <Input id="targets-file" type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                {file ? <Badge variant="secondary" className="max-w-full truncate">{file.name}</Badge> : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={downloadTemplate}>Download template</Button>
                <Button onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {message.text ? (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{message.type === 'error' ? 'Unable to complete request' : 'Targets updated'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col justify-between gap-3 border-y py-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={dealerSearch} onChange={(event) => setDealerSearch(event.target.value)} placeholder="Search dealer or GST ID" className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={loading}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {monthOptions.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadTargets} disabled={loading || filteredTargets.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.key} className="rounded-md shadow-none">
            <CardHeader className="p-4 pb-0">
              <CardDescription>{item.label} target ({item.unit})</CardDescription>
              <CardTitle className="text-2xl">{formatNumber(item.actual)} <span className="text-sm font-medium text-muted-foreground">/ {formatNumber(item.target)}</span></CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Achievement</span><span>{item.achievement.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(item.achievement, 100)} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="w-full rounded-md shadow-none">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full rounded-md shadow-none">
          <Table className="min-w-[1180px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead rowSpan={2} className="w-[260px]">Dealer</TableHead>
                {categoryDefinitions.map((category) => <TableHead key={category.key} colSpan={3} className="bg-muted/50 text-center">{category.label} <span className="font-normal">({category.unit})</span></TableHead>)}
              </TableRow>
              <TableRow className="hover:bg-transparent">
                {categoryDefinitions.flatMap((category) => [
                  <TableHead key={`${category.key}-target`} className="bg-muted/30 text-right">Target</TableHead>,
                  <TableHead key={`${category.key}-actual`} className="bg-muted/30 text-right">Actual</TableHead>,
                  <TableHead key={`${category.key}-achieved`} className="bg-muted/30">Achieved</TableHead>,
                ])}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTargets.length ? filteredTargets.map((item, index) => {
                const values = categoryDefinitions.map((category) => getTargetValues(item, category.id))
                return (
                  <TableRow key={item.userId || item.id || index}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"><Users className="h-4 w-4 text-muted-foreground" /></div>
                        <div className="min-w-0"><p className="truncate font-medium">{item.name || 'Unknown dealer'}</p><p className="truncate text-xs text-muted-foreground">{item.userId || item.id || '-'}</p></div>
                      </div>
                    </TableCell>
                    {values.flatMap((value, valueIndex) => [
                      <TableCell key={`${valueIndex}-target`} className="text-right font-medium">{formatNumber(value.targetAmount)}</TableCell>,
                      <TableCell key={`${valueIndex}-actual`} className="text-right">{formatNumber(value.actualAmount)}</TableCell>,
                      <TableCell key={`${valueIndex}-achievement`}><AchievementCell value={value.achievement} /></TableCell>,
                    ])}
                  </TableRow>
                )
              }) : (
                <TableRow><TableCell colSpan={10} className="h-48 text-center text-muted-foreground">{targets.length ? 'No dealers match the current search.' : 'No targets found for this month.'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
