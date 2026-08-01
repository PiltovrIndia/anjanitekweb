'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Biscuits from 'universal-cookie'
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  Loader2,
  Mail,
  Network,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Store,
  UserRound,
  UserX,
  UsersRound,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Separator } from '@/app/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/app/components/ui/sheet'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip'

const biscuits = new Biscuits()

const hierarchyRoles = ['StateHead', 'SalesManager', 'SalesExecutive', 'Dealer']

const roleMeta = {
  StateHead: { label: 'State Head', icon: Crown, badgeClass: 'border-amber-200 bg-amber-50 text-amber-800' },
  SalesManager: { label: 'Sales Manager', icon: UsersRound, badgeClass: 'border-blue-200 bg-blue-50 text-blue-800' },
  SalesExecutive: { label: 'Sales Executive', icon: UserRound, badgeClass: 'border-violet-200 bg-violet-50 text-violet-800' },
  Dealer: { label: 'Dealer', icon: Store, badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
}

function hasMapping(person, peopleById) {
  const managerId = String(person.mapTo || '').trim()
  return Boolean(managerId && managerId !== '-' && peopleById.has(managerId))
}

function isPersonActive(person) {
  return person.isActive === true || Number(person.isActive) === 1
}

function matchesPerson(person, query, roleFilter) {
  if (roleFilter !== 'All' && person.role !== roleFilter) return false
  if (!query) return true

  const haystack = [person.name, person.id, person.email, person.mobile, person.designation]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function getChildPeople(person, childrenByParent) {
  return childrenByParent.get(person.id) || []
}

function personSort(first, second) {
  return String(first.name || first.id).localeCompare(String(second.name || second.id), undefined, { numeric: true })
}

function RoleBadge({ role }) {
  const meta = roleMeta[role] || { label: role || 'Unassigned', badgeClass: 'border-slate-200 bg-slate-50 text-slate-700' }
  return <Badge variant='outline' className={`shrink-0 font-medium ${meta.badgeClass}`}>{meta.label}</Badge>
}

function PersonAvatar({ person }) {
  const Icon = roleMeta[person.role]?.icon || UserRound
  return (
    <Avatar className='size-9 shrink-0 border bg-white'>
      <AvatarFallback className='bg-muted text-muted-foreground'>
        <Icon className='size-4' aria-hidden='true' />
      </AvatarFallback>
    </Avatar>
  )
}

function SummaryCard({ icon: Icon, label, value, detail, className = '' }) {
  return (
    <Card className={`rounded-md shadow-none ${className}`}>
      <CardContent className='flex min-h-[102px] flex-col justify-between p-4'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span className='text-sm font-medium'>{label}</span>
          <Icon className='size-4' aria-hidden='true' />
        </div>
        <div>
          <p className='text-2xl font-semibold leading-none'>{value}</p>
          <p className='mt-2 text-xs text-muted-foreground'>{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function HierarchyNode({ person, childrenByParent, query, roleFilter, expandedIds, onToggle, onSelect, forceOpen = false }) {
  const children = getChildPeople(person, childrenByParent)
  const selfMatches = matchesPerson(person, query, roleFilter)
  const visibleChildren = children.filter((child) => isVisibleInTree(child, childrenByParent, query, roleFilter))
  const visible = selfMatches || visibleChildren.length > 0

  if (!visible) return null

  const hasChildren = children.length > 0
  const expanded = forceOpen || expandedIds.has(person.id)
  const managerLabel = person.mapTo || '-'

  return (
    <li className='list-none'>
      <div className='group flex min-h-[64px] items-center gap-3 border-b bg-background px-3 py-2 transition-colors hover:bg-muted/50'>
        <div className='flex w-5 shrink-0 justify-center'>
          {hasChildren ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-7'
                  onClick={() => onToggle(person.id)}
                  aria-label={`${expanded ? 'Collapse' : 'Expand'} ${person.name}`}
                >
                  {expanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{expanded ? 'Collapse reports' : 'Expand reports'}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>

        <Button
          type='button'
          variant='ghost'
          className='h-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal p-0 text-left hover:bg-transparent'
          onClick={() => onSelect(person)}
        >
          <PersonAvatar person={person} />
          <span className='min-w-0 flex-1'>
            <span className='flex items-center gap-2'>
              <span className='truncate text-sm font-semibold'>{person.name || person.id}</span>
              {!isPersonActive(person) ? <Badge variant='secondary' className='shrink-0 text-[11px]'>Inactive</Badge> : null}
            </span>
            <span className='mt-0.5 block truncate font-mono text-xs text-muted-foreground'>{person.id}</span>
          </span>
        </Button>

        <div className='hidden min-w-[10rem] flex-1 text-xs text-muted-foreground xl:block'>
          {person.designation || (managerLabel === '-' ? 'No reporting manager' : `Reports to ${managerLabel}`)}
        </div>
        <span className='hidden min-w-[3rem] text-right text-xs text-muted-foreground md:block'>{children.length} report{children.length === 1 ? '' : 's'}</span>
        <RoleBadge role={person.role} />
      </div>

      {hasChildren && expanded ? (
        <ul className='ml-5 border-l border-border pl-3'>
          {visibleChildren.map((child) => (
            <HierarchyNode
              key={child.id}
              person={child}
              childrenByParent={childrenByParent}
              query={query}
              roleFilter={roleFilter}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              forceOpen={forceOpen}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function isVisibleInTree(person, childrenByParent, query, roleFilter) {
  if (matchesPerson(person, query, roleFilter)) return true
  return getChildPeople(person, childrenByParent).some((child) => isVisibleInTree(child, childrenByParent, query, roleFilter))
}

function Field({ label, children }) {
  return (
    <div className='flex items-start justify-between gap-5 py-3 text-sm'>
      <span className='shrink-0 text-muted-foreground'>{label}</span>
      <span className='min-w-0 text-right font-medium'>{children || '-'}</span>
    </div>
  )
}

export default function SalesHierarchyPage() {
  const router = useRouter()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editValues, setEditValues] = useState({ mobile: '', email: '', designation: '' })
  const [editError, setEditError] = useState('')
  const [savingUser, setSavingUser] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)

  const loadHierarchy = useCallback(async (signal) => {
    const cookieValue = biscuits.get('sc_user_detail')
    if (!cookieValue) {
      router.replace('/')
      return
    }

    let currentUser
    try {
      currentUser = JSON.parse(decodeURIComponent(cookieValue))
    } catch {
      biscuits.remove('sc_user_detail', { path: '/' })
      router.replace('/')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/v2/user/${process.env.NEXT_PUBLIC_API_PASS}/U7.1/${encodeURIComponent(currentUser.role || 'SuperAdmin')}`, { signal })
      const payload = await response.json()

      if (!response.ok || payload.status !== 200) {
        throw new Error(payload.message || 'Unable to load the sales hierarchy.')
      }

      const records = Array.isArray(payload.data)
        ? payload.data.filter((person) => hierarchyRoles.includes(person.role) && person.id)
        : []

      setPeople(records)
      setExpandedIds(new Set(records.filter((person) => ['StateHead', 'SalesManager'].includes(person.role)).map((person) => person.id)))
    } catch (loadError) {
      if (loadError.name !== 'AbortError') {
        setPeople([])
        setError(loadError.message || 'Unable to load the sales hierarchy.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()
    loadHierarchy(controller.signal)
    return () => controller.abort()
  }, [loadHierarchy])

  const model = useMemo(() => {
    const peopleById = new Map(people.map((person) => [String(person.id), person]))
    const childrenByParent = new Map()

    people.forEach((person) => {
      if (!hasMapping(person, peopleById)) return
      const parentId = String(person.mapTo)
      const children = childrenByParent.get(parentId) || []
      children.push(person)
      childrenByParent.set(parentId, children)
    })

    childrenByParent.forEach((children) => children.sort(personSort))

    const roots = people
      .filter((person) => person.role === 'StateHead')
      .sort(personSort)
    const unassigned = people
      .filter((person) => person.role !== 'StateHead' && !hasMapping(person, peopleById))
      .sort(personSort)

    return { peopleById, childrenByParent, roots, unassigned }
  }, [people])

  const normalizedQuery = query.trim().toLowerCase()
  const searchIsActive = Boolean(normalizedQuery || roleFilter !== 'All')
  const roleCounts = useMemo(() => Object.fromEntries(hierarchyRoles.map((role) => [role, people.filter((person) => person.role === role).length])), [people])
  const mappedCount = useMemo(() => people.filter((person) => hasMapping(person, model.peopleById)).length, [people, model.peopleById])
  const visibleDirectory = useMemo(
    () => people.filter((person) => matchesPerson(person, normalizedQuery, roleFilter)).sort(personSort),
    [people, normalizedQuery, roleFilter]
  )

  const togglePerson = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpandedIds(new Set(people.filter((person) => person.role !== 'Dealer').map((person) => person.id)))
  const collapseAll = () => setExpandedIds(new Set())
  const selectedManager = selectedPerson?.mapTo ? model.peopleById.get(String(selectedPerson.mapTo)) : null
  const selectedReports = selectedPerson ? getChildPeople(selectedPerson, model.childrenByParent) : []

  const applyUserUpdate = async (userId, updates) => {
    const response = await fetch(`/api/v2/user/${process.env.NEXT_PUBLIC_API_PASS}/U17`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: userId, ...updates }),
    })
    const payload = await response.json()

    if(!response.ok || payload.status !== 200 || !payload.data){
      throw new Error(payload.message || 'Unable to update user.')
    }

    setPeople((current) => current.map((person) => person.id === userId ? { ...person, ...payload.data } : person))
    setSelectedPerson((current) => current?.id === userId ? { ...current, ...payload.data } : current)
    return payload.data
  }

  const openEditDialog = () => {
    if(!selectedPerson) return
    setActionFeedback(null)
    setEditError('')
    setEditValues({
      mobile: selectedPerson.mobile === '-' ? '' : selectedPerson.mobile || '',
      email: selectedPerson.email === '-' ? '' : selectedPerson.email || '',
      designation: selectedPerson.designation === '-' ? '' : selectedPerson.designation || '',
    })
    setEditOpen(true)
  }

  const saveUserDetails = async (event) => {
    event.preventDefault()
    if(!selectedPerson) return

    setSavingUser(true)
    setActionFeedback(null)
    setEditError('')
    try {
      await applyUserUpdate(selectedPerson.id, editValues)
      setEditOpen(false)
      setActionFeedback({ type: 'success', message: 'User details updated.' })
    } catch (updateError) {
      setEditError(updateError.message || 'Unable to update user.')
    } finally {
      setSavingUser(false)
    }
  }

  const deactivateUser = async () => {
    if(!selectedPerson) return

    setSavingUser(true)
    setActionFeedback(null)
    try {
      await applyUserUpdate(selectedPerson.id, { isActive: 0 })
      setActionFeedback({ type: 'success', message: 'User deactivated.' })
    } catch (updateError) {
      setActionFeedback({ type: 'error', message: updateError.message || 'Unable to deactivate user.' })
    } finally {
      setSavingUser(false)
    }
  }

  return (
    <div className='flex min-h-full w-full flex-col gap-5 pb-6'>
      <div className='flex min-h-[72px] flex-wrap items-center justify-between gap-3'>
        <Network className='size-5 shrink-0 text-muted-foreground' aria-hidden='true' />
        <h2 className='mr-auto text-xl font-semibold'>
          Sales Hierarchy
          <span className='mt-1 block text-sm font-normal text-muted-foreground'>State heads, sales teams, and assigned dealers</span>
        </h2>
        <Button variant='outline' size='sm' onClick={() => loadHierarchy()} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <section className='grid grid-cols-2 gap-3 lg:grid-cols-4' aria-label='Hierarchy summary'>
        <SummaryCard icon={Crown} label='State Heads' value={roleCounts.StateHead || 0} detail='Top-level reporting owners' />
        <SummaryCard icon={UsersRound} label='Sales Managers' value={roleCounts.SalesManager || 0} detail='Managers in the reporting line' />
        <SummaryCard icon={UserRound} label='Sales Executives' value={roleCounts.SalesExecutive || 0} detail='Field sales contributors' />
        <SummaryCard icon={Store} label='Dealers' value={roleCounts.Dealer || 0} detail={`${mappedCount} people mapped to a manager`} />
      </section>

      <Tabs defaultValue='hierarchy' className='flex min-h-0 flex-1 flex-col gap-4'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <TabsList className='w-fit'>
            <TabsTrigger value='hierarchy'>Hierarchy</TabsTrigger>
            <TabsTrigger value='directory'>Directory</TabsTrigger>
          </TabsList>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative min-w-0 sm:w-[320px]'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search name, ID, phone, or email' className='pl-9' />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-full sm:w-[176px]'>
                <SelectValue placeholder='All roles' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='All'>All roles</SelectItem>
                {hierarchyRoles.map((role) => <SelectItem key={role} value={role}>{roleMeta[role].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertTitle>Hierarchy unavailable</AlertTitle>
            <AlertDescription className='flex items-center justify-between gap-4'>
              <span>{error}</span>
              <Button variant='outline' size='sm' onClick={() => loadHierarchy()}>Try again</Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <TabsContent value='hierarchy' className='mt-0 min-h-0 flex-1'>
          <div className='flex min-h-0 flex-col border'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3'>
              <div>
                <p className='text-sm font-semibold'>Reporting structure</p>
                <p className='text-xs text-muted-foreground'>Expand a person to browse their direct reports. Select a person for details.</p>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' onClick={expandAll} disabled={loading || searchIsActive}>Expand all</Button>
                <Button variant='ghost' size='sm' onClick={collapseAll} disabled={loading || searchIsActive}>Collapse all</Button>
              </div>
            </div>

            {loading ? (
              <div className='space-y-0'>
                {Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className='h-16 w-full rounded-none border-b' />)}
              </div>
            ) : (
              <ScrollArea className=''>
                {model.roots.length ? (
                  <ul className='m-0 p-0'>
                    {model.roots.map((person) => (
                      <HierarchyNode
                        key={person.id}
                        person={person}
                        childrenByParent={model.childrenByParent}
                        query={normalizedQuery}
                        roleFilter={roleFilter}
                        expandedIds={expandedIds}
                        onToggle={togglePerson}
                        onSelect={setSelectedPerson}
                        forceOpen={searchIsActive}
                      />
                    ))}
                  </ul>
                ) : null}

                {model.unassigned.length ? (
                  <div className={model.roots.length ? 'border-t' : ''}>
                    <div className='flex items-center justify-between bg-amber-50 px-4 py-3 text-amber-950'>
                      <div>
                        <p className='text-sm font-semibold'>Unmapped people</p>
                        <p className='text-xs text-amber-800'>These records do not point to an available manager.</p>
                      </div>
                      <Badge variant='outline' className='border-amber-200 bg-white text-amber-800'>{model.unassigned.length}</Badge>
                    </div>
                    <ul className='m-0 p-0'>
                      {model.unassigned.map((person) => (
                        <HierarchyNode
                          key={person.id}
                          person={person}
                          childrenByParent={model.childrenByParent}
                          query={normalizedQuery}
                          roleFilter={roleFilter}
                          expandedIds={expandedIds}
                          onToggle={togglePerson}
                          onSelect={setSelectedPerson}
                          forceOpen={searchIsActive}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}

                {!model.roots.length && !model.unassigned.length ? (
                  <div className='flex min-h-[360px] flex-col items-center justify-center px-6 text-center'>
                    <Building2 className='mb-3 size-8 text-muted-foreground' />
                    <p className='font-semibold'>No matching people</p>
                    <p className='mt-1 text-sm text-muted-foreground'>Try clearing the search or choosing another role.</p>
                  </div>
                ) : null}
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        <TabsContent value='directory' className='mt-0 min-h-0 flex-1'>
          <div className='overflow-hidden border'>
            <div className='border-b bg-muted/30 px-4 py-3'>
              <p className='text-sm font-semibold'>{visibleDirectory.length} people found</p>
              <p className='text-xs text-muted-foreground'>Search across every level, then select a person to inspect their reporting context.</p>
            </div>
            {loading ? (
              <div className='space-y-0'>{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className='h-16 w-full rounded-none border-b' />)}</div>
            ) : (
              <ScrollArea className=''>
                <div className='min-w-[760px]'>
                  <div className='grid grid-cols-[minmax(250px,1.3fr)_170px_minmax(220px,1fr)_120px] gap-4 border-b bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground'>
                    <span>Person</span><span>Role</span><span>Reports to</span><span className='text-right'>Direct reports</span>
                  </div>
                  {visibleDirectory.map((person) => {
                    const manager = person.mapTo ? model.peopleById.get(String(person.mapTo)) : null
                    const directReports = getChildPeople(person, model.childrenByParent).length
                    return (
                      <Button
                        key={person.id}
                        variant='ghost'
                        className='grid h-auto w-full grid-cols-[minmax(250px,1.3fr)_170px_minmax(220px,1fr)_120px] gap-4 rounded-none border-b px-4 py-3 text-left hover:bg-muted/50'
                        onClick={() => setSelectedPerson(person)}
                      >
                        <span className='flex min-w-0 items-center gap-3'>
                          <PersonAvatar person={person} />
                          <span className='min-w-0'><span className='block truncate font-semibold'>{person.name || person.id}</span><span className='block truncate font-mono text-xs text-muted-foreground'>{person.id}</span></span>
                        </span>
                        <span className='flex items-center'><RoleBadge role={person.role} /></span>
                        <span className='flex min-w-0 items-center truncate text-sm text-muted-foreground'>{manager?.name || 'Unmapped'}</span>
                        <span className='flex items-center justify-end text-sm font-medium'>{directReports}</span>
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(selectedPerson)} onOpenChange={(open) => !open && setSelectedPerson(null)}>
        <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
          {selectedPerson ? (
            <>
              <SheetHeader className='text-left'>
                <div className='flex items-center gap-3 pr-8'>
                  <PersonAvatar person={selectedPerson} />
                  <div className='min-w-0'>
                    <SheetTitle className='truncate'>{selectedPerson.name || selectedPerson.id}</SheetTitle>
                    <SheetDescription className='font-mono'>{selectedPerson.id}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className='mt-6'>
                <RoleBadge role={selectedPerson.role} />
                <Separator className='my-4' />
                <Field label='Reports to'>{selectedManager ? selectedManager.name : 'Unmapped'}</Field>
                <Separator />
                <Field label='Designation'>{selectedPerson.designation}</Field>
                <Separator />
                <Field label='Status'>{isPersonActive(selectedPerson) ? 'Active' : 'Inactive'}</Field>
                <Separator />
                <Field label='Phone'>
                  {selectedPerson.mobile && selectedPerson.mobile !== '-' ? <span className='inline-flex items-center gap-1'><Phone className='size-3.5' />{selectedPerson.mobile}</span> : '-'}
                </Field>
                <Separator />
                <Field label='Email'>
                  {selectedPerson.email && selectedPerson.email !== '-' ? <span className='inline-flex items-center gap-1 break-all'><Mail className='size-3.5 shrink-0' />{selectedPerson.email}</span> : '-'}
                </Field>
              </div>

              {actionFeedback ? (
                <Alert className={`mt-5 py-3 ${actionFeedback.type === 'error' ? 'border-destructive/50 text-destructive' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
                  <AlertDescription>{actionFeedback.message}</AlertDescription>
                </Alert>
              ) : null}

              <div className='mt-6 flex flex-wrap gap-2'>
                <Button variant='outline' size='sm' onClick={openEditDialog} disabled={savingUser}>
                  <Pencil className='mr-2 size-4' />
                  Edit details
                </Button>
                {isPersonActive(selectedPerson) ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive' size='sm' disabled={savingUser}>
                        <UserX className='mr-2 size-4' />
                        Deactivate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate {selectedPerson.name || selectedPerson.id}?</AlertDialogTitle>
                        <AlertDialogDescription>This user will no longer be active in the application. Their hierarchy assignment and existing records will remain intact.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={savingUser}>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='bg-destructive text-destructive-foreground hover:bg-destructive/90' onClick={deactivateUser} disabled={savingUser}>
                          {savingUser ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
                          Deactivate user
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : <Badge variant='secondary' className='px-3'>User is inactive</Badge>}
              </div>

              <Separator className='my-6' />
              <div>
                <div className='mb-3 flex items-center justify-between'>
                  <div><p className='text-sm font-semibold'>Direct reports</p><p className='text-xs text-muted-foreground'>People mapped directly to this person</p></div>
                  <Badge variant='secondary'>{selectedReports.length}</Badge>
                </div>
                {selectedReports.length ? (
                  <ScrollArea className='h-[280px] border'>
                    <div>
                      {selectedReports.map((person) => (
                        <Button key={person.id} variant='ghost' className='h-auto w-full justify-start gap-3 rounded-none border-b px-3 py-2 text-left last:border-b-0' onClick={() => setSelectedPerson(person)}>
                          <PersonAvatar person={person} />
                          <span className='min-w-0 flex-1'><span className='block truncate text-sm font-medium'>{person.name || person.id}</span><span className='block truncate font-mono text-xs text-muted-foreground'>{person.id}</span></span>
                          <RoleBadge role={person.role} />
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : <p className='py-6 text-center text-sm text-muted-foreground'>No direct reports are mapped.</p>}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user details</DialogTitle>
          </DialogHeader>
          <form className='grid gap-4' onSubmit={saveUserDetails}>
            <div className='grid gap-2'>
              <Label htmlFor='edit-mobile'>Mobile</Label>
              <Input id='edit-mobile' value={editValues.mobile} onChange={(event) => setEditValues((current) => ({ ...current, mobile: event.target.value }))} inputMode='tel' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-email'>Email</Label>
              <Input id='edit-email' type='email' value={editValues.email} onChange={(event) => setEditValues((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-designation'>Designation</Label>
              <Input id='edit-designation' value={editValues.designation} onChange={(event) => setEditValues((current) => ({ ...current, designation: event.target.value }))} />
            </div>
            {editError ? <Alert variant='destructive'><AlertDescription>{editError}</AlertDescription></Alert> : null}
            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setEditOpen(false)} disabled={savingUser}>Cancel</Button>
              <Button type='submit' disabled={savingUser}>
                {savingUser ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
