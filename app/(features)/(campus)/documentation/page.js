'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FileSpreadsheet,
  LayoutDashboard,
  List,
  MessageSquare,
  Network,
  Newspaper,
  Package2,
  Receipt,
  ScrollText,
  Search,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Separator } from '@/app/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs'

const guides = [
  {
    id: 'dashboard',
    section: 'overview',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    summary: 'Start the day with payment exposure, dealer activity, and regional performance in one view.',
    purpose: 'Use the dashboard to identify which dealers need attention, then move into their records to act on the issue.',
    actions: ['Filter the picture by state and date range.', 'Review dealers with pending payments and open the related detail view.', 'Upload invoice or payment data when operational updates are due.', 'Send a broadcast message when a group needs the same follow-up.'],
    rules: ['Payment cards reflect the uploaded invoice and payment data.', 'Use the date and state controls before comparing regional performance.'],
    tags: ['payments', 'regions', 'follow-up'],
  },
  {
    id: 'dealers',
    section: 'sales',
    title: 'Dealers',
    href: '/dealers',
    icon: Users,
    summary: 'Maintain dealer records, their sales ownership, payment context, and direct communication.',
    purpose: 'The dealer directory is the working list for sales relationships and their financial follow-up.',
    actions: ['Search and filter the directory, then download the selected view.', 'Create a dealer individually or upload a prepared dealer file in bulk.', 'Assign a sales owner, update contact information, or activate and deactivate a dealer.', 'Open a dealer to review invoices, payments, receipts, and outstanding balances.', 'Broadcast a message to the relevant dealer audience.'],
    rules: ['A dealer remains in the historical record when deactivated, but is no longer active for new work.', 'Assign ownership carefully because it drives sales reporting and hierarchy visibility.'],
    tags: ['dealer', 'payments', 'bulk upload'],
  },
  {
    id: 'targets',
    section: 'sales',
    title: 'Targets',
    href: '/targets',
    icon: Target,
    summary: 'Track monthly ATL, VCL, and collection targets against actual achievement.',
    purpose: 'Use targets to turn sales goals into a month-by-month operating view for each dealer.',
    actions: ['Choose a month to view its target and actual values.', 'Search for a dealer and compare ATL, VCL, and collection achievement.', 'Download the template, complete it, and upload target values in bulk.', 'Download the current filtered view for review or sharing.'],
    rules: ['Achievement is calculated from actual divided by target for the selected month.', 'ATL and VCL are measured in boxes; collection is measured in INR.'],
    tags: ['monthly', 'atl', 'vcl', 'collection'],
  },
  {
    id: 'messages',
    section: 'sales',
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    summary: 'Find a dealer and send a focused outbound message from the workspace.',
    purpose: 'Use Messages for direct follow-up rather than publishing a workspace-wide update.',
    actions: ['Search for the intended dealer.', 'Review the selected recipient before sending.', 'Upload message data when preparing a larger prepared communication set.', 'Send the message and use the delivery history as reference.'],
    rules: ['Use the dealer search to avoid sending to the wrong account.', 'For broad company updates, use Feed instead.'],
    tags: ['communication', 'dealer', 'follow-up'],
  },
  {
    id: 'feed',
    section: 'sales',
    title: 'Feed',
    href: '/feed',
    icon: Newspaper,
    summary: 'Publish visual updates and announcements that the broader workspace can browse.',
    purpose: 'Feed is the shared communication channel for updates such as visits, launches, and business announcements.',
    actions: ['Create a post with an optional image and message.', 'Review posts in chronological order as the page scrolls.', 'Use concise, audience-ready text so posts can be understood without follow-up.'],
    rules: ['Wait for the image upload to finish before publishing a post.', 'Use Feed for shared visibility; use Messages for a single dealer conversation.'],
    tags: ['communication', 'announcement', 'image'],
  },
  {
    id: 'ledger',
    section: 'sales',
    title: 'Ledger',
    href: '/ledger',
    icon: List,
    summary: 'Convert a Tally-style ledger workbook into reviewed ATL, VCL, and payment records.',
    purpose: 'Ledger helps turn accounting exports into invoices and payments that can be checked before they become operational data.',
    actions: ['Select the ledger workbook and process the first sheet.', 'Review the parsed ATL invoices, VCL invoices, and payments in separate tabs.', 'Check amounts, dates, vouchers, and dealer sections before finalizing the import.', 'Reset the file and parse again when the source needs correction.'],
    rules: ['Outstanding balance is applied against the newest invoices first.', 'The parser identifies ATL and VCL sections from the ledger layout, then separates payments from invoice debits.'],
    tags: ['ledger', 'invoice', 'payments', 'reconciliation'],
  },
  {
    id: 'sales-hierarchy',
    section: 'sales',
    title: 'Sales hierarchy',
    href: '/sales2',
    icon: Network,
    summary: 'Browse the reporting chain from State Head through Sales Manager and Executive to Dealer.',
    purpose: 'Use this page to understand ownership, identify unmapped people, and maintain accurate sales-team details.',
    actions: ['Browse the expandable hierarchy or switch to Directory for a flat searchable list.', 'Search by name, ID, phone, or email and filter by role.', 'Select a person to inspect reporting context and direct reports.', 'Edit mobile, email, or designation; deactivate a user when needed.'],
    rules: ['State Head → Sales Manager → Sales Executive → Dealer is the intended reporting chain.', 'Deactivation keeps historical mapping and records intact while making the user inactive.'],
    tags: ['hierarchy', 'sales team', 'dealer mapping'],
  },
  {
    id: 'invoices',
    section: 'operations',
    title: 'Invoices',
    href: '/invoices',
    icon: Receipt,
    summary: 'Manage invoice records and prioritize unpaid or partially paid balances.',
    purpose: 'Invoices is the operational register for billing status, expiry, boxes, and pending value.',
    actions: ['Start with Not paid invoices, then switch status when reviewing other payment states.', 'Filter by ATL or VCL and search by invoice number.', 'Upload invoice files or create an invoice manually.', 'Open an invoice for its full detail, update it where needed, or remove an invalid entry.', 'Download the filtered listing for reconciliation.'],
    rules: ['Not paid, partially paid, and paid are separate operational states.', 'The days-left indicator is based on the invoice expiry date; expired invoices need prompt review.'],
    tags: ['invoice', 'expiry', 'atl', 'vcl'],
  },
  {
    id: 'offers',
    section: 'operations',
    title: 'Offers',
    href: '/offers',
    icon: Tag,
    summary: 'Create and manage time-bound offers for the business calendar.',
    purpose: 'Offers provides a single place to publish, review, and close promotional events.',
    actions: ['Create an offer with its relevant details.', 'Use the month filter to review the correct campaign window.', 'Close an offer when it is no longer available.', 'Delete an invalid offer after confirming the action.'],
    rules: ['Close an offer when it should stop appearing as active, rather than creating a duplicate replacement.', 'Review the selected month before deciding whether an offer is current.'],
    tags: ['campaign', 'promotion', 'calendar'],
  },
  {
    id: 'confirmations',
    section: 'operations',
    title: 'Confirmations',
    href: '/confirmations',
    icon: CheckCircle2,
    summary: 'Request and track balance confirmations for dealer accounts.',
    purpose: 'Use confirmations to formalize a dealer balance check and keep the response cycle visible.',
    actions: ['Create a confirmation request for the intended dealer and balance context.', 'Filter the list by month to review the correct request cycle.', 'Open an entry to inspect its details and current response state.', 'Remove a request only when it was created in error.'],
    rules: ['A confirmation is a balance-check workflow, not a substitute for an invoice or payment entry.', 'Keep the request month aligned with the business period being confirmed.'],
    tags: ['balance', 'dealer', 'follow-up'],
  },
  {
    id: 'designs',
    section: 'operations',
    title: 'Designs',
    href: '/designs',
    icon: Package2,
    summary: 'Maintain the design catalog, premium batches, standard stock, and design-level reservation activity.',
    purpose: 'Designs is the stock and catalog source for orders, batch allocation, and product browsing.',
    actions: ['Search and filter the catalog by size, then open a design for its details.', 'Add new designs from the template after choosing ATL or VCL; sizes are matched to existing size tags.', 'Add or remove stock through the supplied upload flows.', 'View active premium batches and design-related orders.', 'Update catalog details, set design of the day, or remove an obsolete design from active listings.', 'Download the catalog or download stock rows with available premium batches.'],
    rules: ['Premium stock is held in batches; standard stock is tracked at the design level.', 'The stock-with-batches export has one std row per design and one prm row per available batch.', 'Removing a design from the active list preserves historical order context.'],
    tags: ['catalog', 'stock', 'batches', 'excel'],
  },
  {
    id: 'orders',
    section: 'operations',
    title: 'Orders',
    href: '/orders',
    icon: ScrollText,
    summary: 'Create carts, review submitted items, allocate stock, route production, and monitor waitlist demand.',
    purpose: 'Orders is the control point for requested quantity through approval, production, and final status.',
    actions: ['Use Orders to browse carts and expand them into their order items; switch to Designs for a design-first view.', 'Search the complete eligible order set by cart, person, ID, design, product name, or status; clear search to reload the current filtered list.', 'Use Show Waitlist to load waitlisted orders and see cart-level counts and line-level positions.', 'Create an order for either a dealer or customer; create a customer when the search has no match.', 'Review a submitted item, add notes, compare previous orders for the design, then approve, reject, or mark out of stock.', 'For premium requests, select batches and quantities deliberately, or use Auto Approve to choose allocation or send the full request to production.', 'Download all orders or download one cart; exports include Basket, notes, and one row for each assigned batch.'],
    rules: ['The total selected quantity across premium batches cannot exceed the requested quantity.', 'A selected batch quantity cannot exceed that batch’s available quantity.', 'Unselected premium requests can be allocated automatically or routed fully to production; standard-stock requests follow their available stock.', 'Notes are saved with the next action and appear again when the item is reopened.'],
    tags: ['orders', 'search', 'approval', 'production', 'waitlist', 'batches'],
  },
  {
    id: 'app-reports',
    section: 'operations',
    title: 'App reports',
    href: '/appreports',
    icon: BarChart3,
    summary: 'Monitor app adoption and download activity across the active user base.',
    purpose: 'App reports gives operations a view of mobile app usage and the users most recently active.',
    actions: ['Review total downloads and the Android and iOS split.', 'Compare AnjaniTek users with overall visitors.', 'Browse recent app users, their last active time, opening count, and role.', 'Download the report in Excel for offline review.'],
    rules: ['Use last-active time and opening count together when judging engagement.', 'Downloads indicate installations, while the user list indicates observed activity.'],
    tags: ['adoption', 'usage', 'mobile app'],
  },
  {
    id: 'forecast',
    section: 'operations',
    title: 'Forecast',
    href: '/forecast',
    icon: TrendingUp,
    summary: 'Generate design-level forecasts from recent sales history and share the result with the planning team.',
    purpose: 'Forecast supports planning by showing recent sales across designs alongside a projected next month.',
    actions: ['Choose the reporting month and one of the available forecast models.', 'Generate the forecast and review the sales history and predicted value by design.', 'Copy the full result or a forecast column for planning use.', 'Send a message when the forecast needs a business follow-up.'],
    rules: ['Forecast values depend on the selected month and model, so compare like-for-like runs.', 'Use the output as a planning input alongside current stock and committed production.'],
    tags: ['planning', 'sales history', 'production'],
  },
]

const sections = [
  { value: 'all', label: 'All guides' },
  { value: 'overview', label: 'Overview' },
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' },
]

function scrollToGuide(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function WorkflowMap({ title, steps, tone = 'blue' }) {
  const toneClasses = tone === 'green'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-blue-200 bg-blue-50 text-blue-800'

  return (
    <Card className='overflow-hidden shadow-none'>
      <CardHeader className='border-b bg-muted/20 px-5 py-4'>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='p-5'>
        <div className='flex flex-col gap-2 lg:flex-row lg:items-stretch'>
          {steps.map((step, index) => (
            <div key={step} className='flex flex-1 items-center gap-2 lg:gap-3'>
              <div className={`flex min-h-16 flex-1 items-center gap-3 border px-3 py-3 ${toneClasses}`}>
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full border border-current bg-background text-xs font-semibold'>{index + 1}</span>
                <span className='text-sm font-medium'>{step}</span>
              </div>
              {index < steps.length - 1 ? <ChevronRight className='hidden size-4 shrink-0 text-muted-foreground lg:block' /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GuideCard({ guide }) {
  const Icon = guide.icon

  return (
    <article id={guide.id} className='scroll-mt-24 border-b py-8 last:border-b-0'>
      <div className='grid gap-5 xl:grid-cols-[minmax(0,1fr)_235px]'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-start gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center border bg-muted/40'>
              <Icon className='size-5 text-foreground' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-xl font-semibold'>{guide.title}</h2>
                <Badge variant='outline' className='capitalize'>{guide.section}</Badge>
              </div>
              <p className='mt-1 text-sm leading-6 text-muted-foreground'>{guide.summary}</p>
            </div>
          </div>

          <p className='mt-5 text-sm leading-6'>{guide.purpose}</p>

          <div className='mt-5 grid gap-5 lg:grid-cols-2'>
            <div>
              <p className='mb-3 text-sm font-semibold'>What you can do</p>
              <ul className='space-y-2'>
                {guide.actions.map((action) => (
                  <li key={action} className='flex gap-2 text-sm leading-5 text-muted-foreground'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='border-l-0 border-muted pl-0 lg:border-l lg:pl-5'>
              <p className='mb-3 text-sm font-semibold'>Business rules to remember</p>
              <ul className='space-y-2'>
                {guide.rules.map((rule) => (
                  <li key={rule} className='flex gap-2 text-sm leading-5 text-muted-foreground'>
                    <CircleDot className='mt-0.5 size-4 shrink-0 text-blue-600' />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='mt-5 flex flex-wrap gap-2'>
            {guide.tags.map((tag) => <Badge key={tag} variant='secondary' className='font-normal'>{tag}</Badge>)}
          </div>
        </div>

        <div className='flex items-start xl:justify-end'>
          <Button asChild variant='outline' size='sm'>
            <Link href={guide.href}>
              Open {guide.title}
              <ArrowRight className='ml-2 size-4' />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function DocumentationPage() {
  const [query, setQuery] = useState('')
  const [section, setSection] = useState('all')
  const normalizedQuery = query.trim().toLowerCase()

  const visibleGuides = useMemo(() => guides.filter((guide) => {
    const matchesSection = section === 'all' || guide.section === section
    const searchText = [guide.title, guide.summary, guide.purpose, ...guide.actions, ...guide.rules, ...guide.tags].join(' ').toLowerCase()
    return matchesSection && (!normalizedQuery || searchText.includes(normalizedQuery))
  }), [normalizedQuery, section])

  const sectionLabel = sections.find((item) => item.value === section)?.label || 'All guides'

  return (
    <div className='min-h-full w-full pb-10'>
      <header className='flex min-h-[72px] w-full flex-wrap items-center gap-3'>
        <BookOpen className='size-5 shrink-0 text-muted-foreground' aria-hidden='true' />
        <h1 className='shrink-0 text-xl font-semibold'>Workspace guide</h1>
        <p className='mr-auto hidden min-w-0 text-sm text-muted-foreground lg:block'>Browse the business workflows available across the sales workspace.</p>
        <Badge variant='outline' className='hidden sm:inline-flex'>{guides.length} guides</Badge>
      </header>

      <div className='space-y-6 pt-6'>
        <section className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]'>
          <Card className='shadow-none'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2 text-blue-700'>
                <Sparkles className='size-4' />
                <span className='text-sm font-medium'>Find the right workflow</span>
              </div>
              <CardTitle className='text-lg'>From daily review to order fulfillment</CardTitle>
              <CardDescription>Search by a page name, action, business term, or status to jump directly to the relevant guide.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search orders, invoices, stock, targets, waitlist...' className='pl-9' />
              </div>
              <Tabs value={section} onValueChange={setSection}>
                <TabsList className='h-auto w-full justify-start gap-1 overflow-x-auto p-1'>
                  {sections.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card className='border-emerald-200 bg-emerald-50/40 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>How to use this guide</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm leading-5 text-muted-foreground'>
              <p>Choose a topic from the index, read the operating rules, then open the related page when you are ready to work.</p>
              <p>Guides describe the user-facing process and decision points, not backend setup.</p>
            </CardContent>
          </Card>
        </section>

        <section className='grid gap-4 xl:grid-cols-2'>
          <WorkflowMap title='Order fulfillment flow' tone='green' steps={['Create cart', 'Review request', 'Allocate or produce', 'Approve status', 'Track waitlist']} />
          <WorkflowMap title='Sales ownership flow' steps={['State Head', 'Sales Manager', 'Sales Executive', 'Dealer']} />
        </section>

        <div className='grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]'>
          <aside className='hidden xl:block'>
            <Card className='sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto shadow-none'>
              <CardHeader className='px-4 py-4'>
                <CardTitle className='text-sm'>On this page</CardTitle>
                <CardDescription>{visibleGuides.length} matching {visibleGuides.length === 1 ? 'guide' : 'guides'}</CardDescription>
              </CardHeader>
              <CardContent className='p-2 pt-0'>
                {visibleGuides.map((guide) => {
                  const Icon = guide.icon
                  return (
                    <Button key={guide.id} variant='ghost' className='h-auto w-full justify-start gap-2 rounded-md px-3 py-2 text-left' onClick={() => scrollToGuide(guide.id)}>
                      <Icon className='size-4 shrink-0 text-muted-foreground' />
                      <span className='truncate'>{guide.title}</span>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </aside>

          <section className='border px-5 sm:px-7'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b py-5'>
              <div>
                <p className='text-sm font-semibold'>{sectionLabel}</p>
                <p className='mt-1 text-sm text-muted-foreground'>Business workflows, key decisions, and direct workspace access.</p>
              </div>
              {normalizedQuery ? <Badge variant='secondary'>Results for “{query}”</Badge> : null}
            </div>

            {visibleGuides.length ? (
              visibleGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)
            ) : (
              <div className='flex min-h-[320px] flex-col items-center justify-center text-center'>
                <FileSpreadsheet className='mb-3 size-8 text-muted-foreground' />
                <p className='font-semibold'>No matching guide</p>
                <p className='mt-1 max-w-sm text-sm text-muted-foreground'>Try a broader term, such as “stock”, “dealer”, “payment”, or “approval”.</p>
                <Button className='mt-4' variant='outline' onClick={() => { setQuery(''); setSection('all') }}>Clear filters</Button>
              </div>
            )}
          </section>
        </div>

        <Separator />
        <Accordion type='single' collapsible className='mx-auto max-w-3xl'>
          <AccordionItem value='scope'>
            <AccordionTrigger>What this guide covers</AccordionTrigger>
            <AccordionContent className='leading-6 text-muted-foreground'>
              This guide documents the business-facing experience in the workspace: what each page is for, the actions available to users, and the decision rules that affect the outcome. Page access still depends on the signed-in role.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
