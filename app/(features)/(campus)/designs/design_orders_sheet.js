'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { SpinnerGap } from 'phosphor-react'
import { ArrowDown, ArrowUp, ArrowUpDown, CheckIcon, Pencil, Search } from 'lucide-react'
import * as xlsx from 'xlsx'

import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useToast } from '@/app/components/ui/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'

// status-wise order counts for a design (tab labels)
const getDesignOrderCountsAPI = async (pass, design) =>
fetch("/api/v2/orders_test/"+pass+"/U00.3/"+encodeURIComponent(design), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// paged orders of a design filtered by status — 50 per page
const getDesignOrdersByStatusAPI = async (pass, design, status, page) =>
fetch("/api/v2/orders_test/"+pass+"/U00.4/"+encodeURIComponent(design)+"/"+status+"/"+page, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// all orders of a design in a date range with batch allocations, for download
const getDesignOrdersByDateAPI = async (pass, design, fromDate, toDate) =>
fetch("/api/v2/orders_test/"+pass+"/U00.5/"+encodeURIComponent(design)+"/"+encodeURIComponent(fromDate)+","+encodeURIComponent(toDate), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getOrdersByDesignAPI = async (pass, design, signal) =>
fetch("/api/v2/orders_test/"+pass+"/U2/"+encodeURIComponent(design), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    signal,
});

const updateOrderStatusAPI = async (pass, path, orderId, qty, userId, actionDate, design, batchSeq) =>
fetch("/api/v2/orders_test/"+pass+"/"+path+"/"+orderId+"/"+qty+"/"+userId+"/"+actionDate+"/"+encodeURIComponent(design)+(Array.isArray(batchSeq) && batchSeq.length > 0 ? "?batchSeq="+batchSeq.join(',') : ""), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const markOrderInReviewAPI = async (pass, orderId) =>
fetch("/api/v2/orders_test/"+pass+"/U0.7/"+orderId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

function hasWaitlistPosition(value) {
    return value !== null && value !== undefined && value !== '' && !Number.isNaN(Number(value))
}

function getOrderStatusClass(status) {
    if (status === 'Approved') return 'bg-green-100 text-green-700'
    if (status === 'Rejected') return 'bg-red-100 text-red-700'
    if (status === 'Modified') return 'bg-yellow-100 text-yellow-700'
    if (status === 'OutOfStock') return 'bg-orange-100 text-orange-700'
    if (status === 'SaleOrder') return 'bg-emerald-100 text-emerald-700'
    if (status === 'InReview') return 'bg-sky-100 text-sky-700'
    return 'bg-gray-100 text-gray-700'
}

function getOrderStatusLabel(status) {
    if (status === 'Submitted') return 'Pending'
    if (status === 'SaleOrder') return 'Sale Order'
    if (status === 'InReview') return 'In Review'
    return status || '-'
}

// tab order for the per-design listing — Submitted first, then down the lifecycle
const ORDER_STATUS_TABS = ['Submitted', 'InReview', 'Approved', 'Modified', 'Rejected', 'OutOfStock', 'SaleOrder'];
const PAGE_SIZE = 50;

// Dialog listing every order of one design with the same review/edit actions
// as the designs tab of the orders page; the dialog hugs the table width so
// the listing never scrolls horizontally
export default function DesignOrdersDialog({ product, open, onClose }) {
    const { toast } = useToast();

    const design = product?.design;

    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [statusCounts, setStatusCounts] = useState({}); // status -> order count for tab labels
    const [activeStatus, setActiveStatus] = useState('Submitted');
    const [page, setPage] = useState(1);
    const [totalForStatus, setTotalForStatus] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Download state
    const [showDownloadPopover, setShowDownloadPopover] = useState(false);
    const [downloadingOrders, setDownloadingOrders] = useState(false);
    const [downloadFromDate, setDownloadFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [downloadToDate, setDownloadToDate] = useState(dayjs().format('YYYY-MM-DD'));

    // Approval Dialog State (mirrors the orders page review dialog)
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [approvalQty, setApprovalQty] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [reviewDesignQuery, setReviewDesignQuery] = useState('')
    const [reviewDesignResults, setReviewDesignResults] = useState([])
    const [searchingReviewDesigns, setSearchingReviewDesigns] = useState(false)
    const [showReviewDesignDrop, setShowReviewDesignDrop] = useState(false)
    const [selectedReviewDesign, setSelectedReviewDesign] = useState(null)
    const [designOrderHistory, setDesignOrderHistory] = useState([])
    const [loadingDesignOrderHistory, setLoadingDesignOrderHistory] = useState(false)
    const [designOrderHistoryError, setDesignOrderHistoryError] = useState('')
    const [isEditingOrderItem, setIsEditingOrderItem] = useState(false)
    const [showDesignOrderHistory, setShowDesignOrderHistory] = useState(false)
    const [designBatches, setDesignBatches] = useState([])
    const [loadingDesignBatches, setLoadingDesignBatches] = useState(false)
    const [batchSequence, setBatchSequence] = useState([]) // admin-chosen batch allocation order (stock batch ids)
    const [orderAllocations, setOrderAllocations] = useState([]) // batches allocated to the approved order under review
    const [loadingOrderAllocations, setLoadingOrderAllocations] = useState(false)
    const reviewDesignTimer = useRef(null)
    const reviewDesignRef = useRef(null)

    // refresh the tab counts for this design
    async function loadCounts() {
        if (!design) return;
        try {
            const result = await getDesignOrderCountsAPI(process.env.NEXT_PUBLIC_API_PASS, design);
            const queryResult = await result.json();
            const counts = {};
            if (queryResult.status === 200 && Array.isArray(queryResult.data)) {
                queryResult.data.forEach(row => { counts[row.status] = Number(row.count || 0); });
            }
            setStatusCounts(counts);
        } catch (e) {
            setStatusCounts({});
        }
    }

    // load one page of the design's orders for a status
    async function loadItems(status, pageNo) {
        if (!design) return;
        setLoadingItems(true);
        try {
            const result = await getDesignOrdersByStatusAPI(process.env.NEXT_PUBLIC_API_PASS, design, status, pageNo);
            const queryResult = await result.json();
            if (queryResult.status === 200 && Array.isArray(queryResult.data)) {
                setItems(queryResult.data.map((item) => ({
                    ...item,
                    waitlistPosition: item.waitlistPosition ?? item.waitlistSequence,
                    isProduction: Number(item.productionQty || 0) > 0 ? 1 : 0,
                })));
                setTotalForStatus(Number(queryResult.total || 0));
            } else {
                setItems([]);
                setTotalForStatus(0);
            }
        } catch (e) {
            setItems([]);
            setTotalForStatus(0);
            toast({ description: "Issue loading design orders, try again later!" });
        } finally {
            setLoadingItems(false);
        }
    }

    // start fresh on the Submitted tab every time the sheet opens
    useEffect(() => {
        if (!open || !design) {
            setItems([]);
            setStatusCounts({});
            setTotalForStatus(0);
            return;
        }

        setActiveStatus('Submitted');
        setPage(1);
        loadCounts();
        loadItems('Submitted', 1);
    }, [open, design]);

    function handleStatusTabChange(status) {
        setActiveStatus(status);
        setPage(1);
        loadItems(status, 1);
    }

    function goToPage(pageNo) {
        setPage(pageNo);
        loadItems(activeStatus, pageNo);
    }

    // download every order of this design in the chosen date range; an order
    // allocated from multiple batches becomes one row per batch (same as the
    // orders page download)
    async function downloadOrdersNow() {
        setDownloadingOrders(true);
        setShowDownloadPopover(false);

        try {
            const result = await getDesignOrdersByDateAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                design,
                downloadFromDate,
                downloadToDate
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'No orders available to download');
            }

            const allOrders = Array.isArray(queryResult.data) ? queryResult.data : [];

            if (allOrders.length === 0) {
                toast({ description: 'No orders available to download' });
                return;
            }

            const orderRows = allOrders.flatMap((res) => {
                const buildRow = (batchNo, batchQty) => ({
                    dealerName: res.dealer || '-',
                    orderedBy: res.orderedBy || '-',
                    userId: res.userId || '-',
                    mobile: res.mobile || '-',
                    design: res.design || '-',
                    productName: res.name || '-',
                    requestedQty: Number(res.requestedQty || 0),
                    approvedQty: Number(res.approvedQty || 0),
                    batchNo,
                    batchQty,
                    stockType: res.stockType || '-',
                    waitlistPosition: res.waitlistSequence || '-',
                    size: res.size || '-',
                    status: res.status || '-',
                    submittedOn: res.createdOn ? dayjs(res.createdOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                    approvedOn: res.approvedOn ? dayjs(res.approvedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                    modifiedOn: res.modifiedOn ? dayjs(res.modifiedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                    requestType: res.isProduction == 1 || Number(res.productionQty || 0) > 0 ? 'Production' : 'Current',
                });

                const allocations = Array.isArray(res.batchAllocations) ? res.batchAllocations : [];
                if (allocations.length === 0) {
                    return [buildRow('-', '-')];
                }
                return allocations.map((alloc) => buildRow(alloc.batchId || 'UNNAMED', Number(alloc.qty || 0)));
            });

            const worksheet = xlsx.utils.json_to_sheet(orderRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
            xlsx.writeFile(workbook, `orders_${design}_${downloadFromDate}_to_${downloadToDate}.xlsx`);

            toast({ description: `Downloaded ${allOrders.length} orders` });
        } catch (e) {
            toast({ description: e.message || 'Failed to download orders' });
        } finally {
            setDownloadingOrders(false);
        }
    }

    // toggle column sort: first click sorts ascending, second flips to descending
    function handleSort(key) {
        setSortConfig(prev => prev.key === key
            ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
            : { key, direction: 'asc' });
    }

    // sorts the loaded page client-side
    const numericSortKeys = ['requestedQty', 'approvedQty', 'productionQty'];
    const sortedItems = sortConfig.key
        ? [...items].sort((a, b) => {
            let cmp;
            if (sortConfig.key === 'percent') {
                const pct = (r) => Number(r.requestedQty) > 0 ? Number(r.approvedQty || 0) / Number(r.requestedQty) : 0;
                cmp = pct(a) - pct(b);
            } else if (sortConfig.key === 'waitlistPosition') {
                // orders without a waitlist position always sort last
                const pos = (r) => hasWaitlistPosition(r.waitlistPosition) ? Number(r.waitlistPosition) : Infinity;
                cmp = pos(a) - pos(b);
            } else if (numericSortKeys.includes(sortConfig.key)) {
                cmp = Number(a[sortConfig.key] || 0) - Number(b[sortConfig.key] || 0);
            } else {
                cmp = String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || ''), undefined, { numeric: true });
            }
            return sortConfig.direction === 'asc' ? cmp : -cmp;
        })
        : items;

    const sortIcon = (key) => sortConfig.key !== key
        ? <ArrowUpDown className="inline-block ml-1 h-3 w-3 text-slate-400" />
        : sortConfig.direction === 'asc'
            ? <ArrowUp className="inline-block ml-1 h-3 w-3" />
            : <ArrowDown className="inline-block ml-1 h-3 w-3" />;

    useEffect(() => {
        const handler = (e) => {
            if (reviewDesignRef.current && !reviewDesignRef.current.contains(e.target)) {
                setShowReviewDesignDrop(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (!isActionDialogOpen) {
            clearTimeout(reviewDesignTimer.current)
            setReviewDesignQuery('')
            setReviewDesignResults([])
            setShowReviewDesignDrop(false)
            setSearchingReviewDesigns(false)
            setSelectedReviewDesign(null)
            setDesignOrderHistory([])
            setLoadingDesignOrderHistory(false)
            setDesignOrderHistoryError('')
            setIsEditingOrderItem(false)
            setShowDesignOrderHistory(false)
        }
    }, [isActionDialogOpen])

    useEffect(() => {
        if (!isActionDialogOpen || !showDesignOrderHistory || !selectedReviewDesign?.design) {
            setDesignOrderHistory([])
            setLoadingDesignOrderHistory(false)
            setDesignOrderHistoryError('')
            return
        }

        const controller = new AbortController()

        async function fetchDesignOrderHistory() {
            setLoadingDesignOrderHistory(true)
            setDesignOrderHistoryError('')

            try {
                const result = await getOrdersByDesignAPI(
                    process.env.NEXT_PUBLIC_API_PASS,
                    selectedReviewDesign.design,
                    controller.signal
                )
                const queryResult = await result.json()

                if (controller.signal.aborted) {
                    return
                }

                if (queryResult.status === 200 && Array.isArray(queryResult.data)) {
                    setDesignOrderHistory(queryResult.data.filter((order) => String(order.id) !== String(selectedRes?.id)))
                } else {
                    setDesignOrderHistory([])
                }
            } catch (e) {
                if (e.name !== 'AbortError') {
                    setDesignOrderHistory([])
                    setDesignOrderHistoryError('Could not load previous orders')
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingDesignOrderHistory(false)
                }
            }
        }

        fetchDesignOrderHistory()

        return () => controller.abort()
    }, [isActionDialogOpen, showDesignOrderHistory, selectedReviewDesign?.design, selectedRes?.id])

    // Clamp approvalQty to availableStd whenever the dialog opens or fresh stock arrives
    useEffect(() => {
        if (!selectedRes || selectedRes.stockType !== 'std' || !['Submitted', 'InReview'].includes(selectedRes.status)) return;
        const availableStd = Number(selectedReviewDesign?.std || 0) - Number(selectedRes?.approvedQty || 0);
        if (availableStd <= 0) {
            setApprovalQty('0');
        } else {
            setApprovalQty(prev => String(Math.min(Number(prev), availableStd)));
        }
    }, [selectedRes?.id, selectedRes?.status, selectedReviewDesign?.std, selectedRes?.approvedQty])

    // Load the PRM stock batches for the design under review
    useEffect(() => {
        const reviewDesign = selectedReviewDesign?.design || selectedRes?.design;
        if (!isActionDialogOpen || selectedRes?.stockType !== 'prm' || !reviewDesign) {
            setDesignBatches([]);
            setLoadingDesignBatches(false);
            setBatchSequence([]);
            return;
        }

        let cancelled = false;
        setLoadingDesignBatches(true);
        setBatchSequence([]);

        fetch(`/api/v2/designs/${process.env.NEXT_PUBLIC_API_PASS}/U11/${encodeURIComponent(reviewDesign)}`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .then(r => r.json())
        .then(data => {
            if (!cancelled) setDesignBatches(data.status === 200 && Array.isArray(data.data) ? data.data : []);
        })
        .catch(() => {
            if (!cancelled) setDesignBatches([]);
        })
        .finally(() => {
            if (!cancelled) setLoadingDesignBatches(false);
        });

        return () => { cancelled = true; };
    }, [isActionDialogOpen, selectedRes?.stockType, selectedReviewDesign?.design, selectedRes?.design])

    // For an approved PRM order, load the batches its stock is allocated from
    useEffect(() => {
        if (!isActionDialogOpen || selectedRes?.stockType !== 'prm' || selectedRes?.status !== 'Approved' || !selectedRes?.id) {
            setOrderAllocations([]);
            setLoadingOrderAllocations(false);
            return;
        }

        let cancelled = false;
        setLoadingOrderAllocations(true);

        fetch(`/api/v2/orders_test/${process.env.NEXT_PUBLIC_API_PASS}/U0.6/${selectedRes.id}`, {
            headers: { 'Content-Type': 'application/json' },
        })
        .then(r => r.json())
        .then(data => {
            if (!cancelled) setOrderAllocations(data.status === 200 && Array.isArray(data.data) ? data.data : []);
        })
        .catch(() => {
            if (!cancelled) setOrderAllocations([]);
        })
        .finally(() => {
            if (!cancelled) setLoadingOrderAllocations(false);
        });

        return () => { cancelled = true; };
    }, [isActionDialogOpen, selectedRes?.stockType, selectedRes?.status, selectedRes?.id])

    // Pre-fill the manual allocation order with this order's existing batch
    // allocations when editing an already-approved prm order, so the admin
    // edits from what's currently reserved instead of starting blank
    useEffect(() => {
        if (!isEditingOrderItem || selectedRes?.stockType !== 'prm' || selectedRes?.status !== 'Approved') return;
        if (loadingDesignBatches || loadingOrderAllocations) return;
        if (batchSequence.length > 0 || orderAllocations.length === 0 || designBatches.length === 0) return;
        const preselected = orderAllocations
            .map((alloc) => designBatches.find((b) => b.batchId === alloc.batchId)?.id)
            .filter(Boolean);
        if (preselected.length > 0) setBatchSequence(preselected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditingOrderItem, selectedRes?.stockType, selectedRes?.status, loadingDesignBatches, loadingOrderAllocations, orderAllocations, designBatches])

    function patchItems(updates) {
        setItems(prev => prev.map(item => {
            const patch = updates.get(String(item.id));
            return patch ? { ...item, ...patch } : item;
        }));
    }

    async function handleUpdateStatus(res) {
        // opening a Submitted item for review moves it to InReview right away
        let reviewRes = res;
        if (res.status === 'Submitted') {
            reviewRes = { ...res, status: 'InReview' };

            markOrderInReviewAPI(process.env.NEXT_PUBLIC_API_PASS, res.id)
                .then(() => loadCounts())
                .catch(() => {});

            patchItems(new Map([[String(res.id), { status: 'InReview' }]]));
        }

        setSelectedRes(reviewRes);

        setApprovalQty(reviewRes.requestedQty); // Default to requested quantity
        setSelectedReviewDesign(reviewRes)
        setReviewDesignQuery('')
        setReviewDesignResults([])
        setShowReviewDesignDrop(false)
        setDesignOrderHistory([])
        setDesignOrderHistoryError('')
        setShowDesignOrderHistory(false)
        setIsEditingOrderItem(reviewRes.status === 'InReview')

        setIsActionDialogOpen(true);

        // Fetch fresh stock for this design in the background
        if (res.design) {
            fetch(`/api/v2/designs/${process.env.NEXT_PUBLIC_API_PASS}/U4/${encodeURIComponent(res.design)}/0`, {
                headers: { 'Content-Type': 'application/json' },
            })
            .then(r => r.json())
            .then(data => {
                if (data.status === 200 && data.data?.length) {
                    const match = data.data.find(p => p.design === res.design) || data.data[0];
                    setSelectedReviewDesign(match);
                }
            })
            .catch(() => {});
        }
    }

    const handleReviewDesignSearch = (value) => {
        setReviewDesignQuery(value)
        clearTimeout(reviewDesignTimer.current)
        if (!value.trim()) {
            setReviewDesignResults([])
            setShowReviewDesignDrop(false)
            return
        }

        reviewDesignTimer.current = setTimeout(async () => {
            setSearchingReviewDesigns(true)
            try {
                const res = await fetch(`/api/v2/designs/${process.env.NEXT_PUBLIC_API_PASS}/U4/${encodeURIComponent(value)}/0`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setReviewDesignResults(data.status === 200 ? data.data : [])
                setShowReviewDesignDrop(true)
            } catch {
                setReviewDesignResults([])
            } finally {
                setSearchingReviewDesigns(false)
            }
        }, 400)
    }

    const selectReviewDesign = (productResult) => {
        setSelectedReviewDesign(productResult)
        setReviewDesignQuery('')
        setReviewDesignResults([])
        setShowReviewDesignDrop(false)
        setShowDesignOrderHistory(false)
        setDesignOrderHistory([])
        setDesignOrderHistoryError('')
    }

    // when editing an already-approved prm order, a batch's true selectable
    // capacity is its current availableQty plus whatever this order already
    // has reserved on it — that reservation gets released back to the batch
    // before the new selection is drained on submit
    const isEditingApprovedPrm = isEditingOrderItem && selectedRes?.stockType === 'prm' && selectedRes?.status === 'Approved';
    const reservedQtyByBatch = useMemo(() => {
        const map = {};
        orderAllocations.forEach((alloc) => { map[alloc.batchId] = Number(alloc.allocatedQty || 0); });
        return map;
    }, [orderAllocations]);
    const getEffectiveAvailableQty = (batch) => Number(batch.availableQty || 0) + (isEditingApprovedPrm ? Number(reservedQtyByBatch[batch.batchId] || 0) : 0);

    // panel showing which batches an approved order's stock was allocated from
    const renderAllocatedBatchesPanel = () => (
        <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">Allocated batches</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {orderAllocations.length}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500">{selectedRes?.design || '-'}</div>
                </div>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                    Allocated {orderAllocations.reduce((sum, alloc) => sum + Number(alloc.allocatedQty || 0), 0)}
                </span>
            </div>

            {loadingOrderAllocations ? (
                <div className="flex items-center justify-center border-t border-slate-100 px-3 py-4 text-sm text-slate-500">
                    <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                    Loading allocations...
                </div>
            ) : orderAllocations.length === 0 ? (
                <div className="border-t border-slate-100 px-3 py-4 text-center text-sm text-slate-500">
                    No batch allocations recorded for this order
                </div>
            ) : (
                <div className="max-h-44 divide-y divide-slate-100 overflow-y-auto border-t border-slate-100">
                    {orderAllocations.map((alloc) => (
                        <div key={alloc.batchId || 'unnamed'} className="flex items-center justify-between gap-3 px-3 py-2">
                            <div className="text-sm font-medium text-slate-900">{alloc.batchId || 'Unnamed batch'}</div>
                            <span className="font-mono font-medium text-slate-900">{Number(alloc.allocatedQty || 0)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // tap a batch row to add/remove it from the manual allocation order.
    // a batch fully reserved by this order shows as 'Empty' (its stock is
    // drained into the reservation) but is still selectable — its effective
    // qty already accounts for that reservation
    function toggleBatchInSequence(batch) {
        if (!isEditingOrderItem) return;
        if (getEffectiveAvailableQty(batch) <= 0) return;
        setBatchSequence(prev => prev.includes(batch.id)
            ? prev.filter(id => id !== batch.id)
            : [...prev, batch.id]);
    }

    async function submitApproval(status) {
        if (!approvalQty || isNaN(approvalQty)) {
            toast({ description: "Please enter a valid quantity" });
            return;
        }

        if (!selectedReviewDesign?.design) {
            toast({ description: "Please choose a design before updating this order" });
            return;
        }

        setActionLoading(true);
        try {
            var path = '';
            // check if the status is already approved, modified or rejected, if yes then update the record with modified status with modifiedOn value
            if(status.toLowerCase() == 'submitted' || status.toLowerCase() == 'approved' || status.toLowerCase() == 'modified'){
                path = 'U0.2';
            }
            else if(status.toLowerCase() == 'rejected'){
                path = 'U0.3';
            }
            else if(status.toLowerCase() == 'outofstock'){
                path = 'U0.31';
            }

            const result = await updateOrderStatusAPI(
                process.env.NEXT_PUBLIC_API_PASS, path,
                selectedRes.id,
                approvalQty,
                selectedRes.userId,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                selectedReviewDesign.design,
                path === 'U0.2' && selectedRes.stockType === 'prm' ? batchSequence : [],
            );
            const queryResult = await result.json();

            if (queryResult.status === 200) {
                toast({ description: `Order marked as ${status.toLowerCase()}!` });
                setIsActionDialogOpen(false);

                // the order moved to another status tab — refresh counts and the current page
                loadCounts();
                loadItems(activeStatus, page);
            } else {
                toast({ description: queryResult.message || `Failed to ${status.toLowerCase()}` });
            }
        } catch (e) {
            toast({ description: "Error submitting approval: " + e.message });
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <>
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose?.(); }}>
            <DialogContent className="w-fit min-w-[720px] max-w-[95vw] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center pb-2">{product?.name || design}
                        {/* Lets show total orders count from all statuses in a chip here */}
                        <span className="ml-3 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {Object.values(statusCounts).reduce((a, b) => a + b, 0)} orders
                        </span>

                    </DialogTitle>
                    <DialogDescription>
                        <span className='text-gray-800 font-medium font-mono'>{design}</span>
                        <span className="ml-3 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">PRM {Number(product?.prm || 0)}</span>
                        <span className="ml-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">STD {Number(product?.std || 0)}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* status tabs with counts — Submitted first — plus date-range download */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 shadow-sm w-fit">
                        {ORDER_STATUS_TABS.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusTabChange(status)}
                                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${activeStatus === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                {getOrderStatusLabel(status)} ({Number(statusCounts[status] || 0)})
                            </button>
                        ))}
                    </div>

                    <Popover open={showDownloadPopover} onOpenChange={setShowDownloadPopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" disabled={downloadingOrders}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                {downloadingOrders ? 'Downloading...' : 'Download'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4" align="end">
                            <p className="text-sm font-semibold mb-3">Select date range</p>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">From</Label>
                                    <Input
                                        type="date"
                                        value={downloadFromDate}
                                        onChange={e => setDownloadFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">To</Label>
                                    <Input
                                        type="date"
                                        value={downloadToDate}
                                        onChange={e => setDownloadToDate(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full mt-1"
                                    onClick={downloadOrdersNow}
                                    disabled={!downloadFromDate || !downloadToDate}
                                >
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="mt-1 flex-1 min-h-0 overflow-y-auto rounded-md border border-slate-100">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-slate-100">
                            <TableRow className="bg-slate-100 text-slate-600 text-sm font-semibold">
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('orderedBy')}>
                                    <span className="flex items-center">By{sortIcon('orderedBy')}</span>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('dealer')}>
                                    <span className="flex items-center">Dealer{sortIcon('dealer')}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('requestedQty')}>
                                    <span className="flex items-center justify-end">Requested{sortIcon('requestedQty')}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('approvedQty')}>
                                    <span className="flex items-center justify-end">Approved{sortIcon('approvedQty')}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('productionQty')}>
                                    <span className="flex items-center justify-end">Production{sortIcon('productionQty')}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('percent')}>
                                    <span className="flex items-center justify-end">%{sortIcon('percent')}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('waitlistPosition')}>
                                    <span className="flex items-center justify-end">Waitlist{sortIcon('waitlistPosition')}</span>
                                </TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('stockType')}>
                                    <span className="flex items-center">Stock{sortIcon('stockType')}</span>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleSort('createdOn')}>
                                    <span className="flex items-center">Submitted On{sortIcon('createdOn')}</span>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingItems ? (
                                <TableRow><TableCell colSpan={11} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : sortedItems.length === 0 ? (
                                <TableRow><TableCell colSpan={11} className="text-center py-10">No orders listed</TableCell></TableRow>
                            ) : sortedItems.map((res) => (
                                <TableRow key={res.id} className="bg-white text-sm hover:bg-slate-50/80">
                                    <TableCell className="py-4">
                                        <span className="font-medium">{res.orderedBy || '-'}</span><br/>
                                        {/* <span className="text-xs text-slate-500">{res.userId || '-'}</span> */}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="font-medium">{res.dealer || '-'}</span><br/>
                                        <span className="text-xs text-slate-500">{res.dealerId || '-'}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{res.requestedQty}</TableCell>
                                    <TableCell className="text-right font-mono">{res.approvedQty}</TableCell>
                                    <TableCell className="text-right font-mono">{res.productionQty}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {res.status === 'Rejected' ? (
                                            <span className="text-red-500">-</span>
                                        ) : (
                                            <span className={((res.approvedQty === 0 ? 0 : res.approvedQty / res.requestedQty) * 100).toFixed(1) > 50 ? 'text-green-600' : 'text-red-500'}>{((res.approvedQty === 0 ? 0 : res.approvedQty / res.requestedQty) * 100).toFixed(1)}%</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {hasWaitlistPosition(res.waitlistPosition) ? (
                                            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                #{res.waitlistPosition}
                                            </span>
                                        ) : (
                                            <span className="font-mono text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${res.stockType === 'prm' ? 'bg-purple-100 text-purple-700' : res.stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {res.stockType || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`rounded-full px-2 py-1 text-xs ${getOrderStatusClass(res.status)} uppercase font-medium`}>
                                            {getOrderStatusLabel(res.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {res.createdOn ? dayjs(res.createdOn).format('DD MMM hh:mm A') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {['Submitted', 'InReview'].includes(res.status) && (
                                                <Button size="sm" variant="outline" className="bg-blue-600 shadow-md text-white hover:bg-blue-700 hover:text-white" onClick={() => handleUpdateStatus(res)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                            )}
                                            {(res.status === 'Approved' || res.status === 'Modified' || res.status === 'Rejected') && (
                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(res)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* fixed 50-per-page pagination — pinned below the scrolling table */}
                {totalForStatus > 0 ? (
                    <div className="flex items-center justify-between pt-2 text-sm text-slate-500 shrink-0">
                        <span>
                            {totalForStatus} {getOrderStatusLabel(activeStatus).toLowerCase()} order{totalForStatus > 1 ? 's' : ''}
                            {totalForStatus > PAGE_SIZE ? ` • Page ${page} of ${Math.ceil(totalForStatus / PAGE_SIZE)}` : ''}
                        </span>
                        {totalForStatus > PAGE_SIZE ? (
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" disabled={loadingItems || page <= 1} onClick={() => goToPage(page - 1)}>Previous</Button>
                                <Button size="sm" variant="outline" disabled={loadingItems || page >= Math.ceil(totalForStatus / PAGE_SIZE)} onClick={() => goToPage(page + 1)}>Next</Button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>

        {/* Approval Confirmation Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Review Order</DialogTitle>
                    <DialogDescription>
                        for <b>{selectedRes?.dealer}</b>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    {!isEditingOrderItem ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-sm text-slate-900">{selectedRes?.design || '-'}</span>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getOrderStatusClass(selectedRes?.status)}`}>
                                        {getOrderStatusLabel(selectedRes?.status)}
                                    </span>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${selectedRes?.stockType === 'prm' ? 'bg-purple-100 text-purple-700' : selectedRes?.stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {selectedRes?.stockType || '-'}
                                    </span>
                                    {hasWaitlistPosition(selectedRes?.waitlistPosition) ? (
                                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                            Waitlist #{selectedRes?.waitlistPosition}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                    {selectedRes?.name || 'Selected order item'} • Cart {selectedRes?.cartId || '-'}
                                </div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                                <div>{selectedRes?.createdOn ? dayjs(selectedRes.createdOn).format('DD/MM/YYYY hh:mm A') : '-'}</div>
                                <div>{selectedRes?.orderedBy || selectedRes?.userId || '-'} to {selectedRes?.dealer || selectedRes?.dealerId || '-'}</div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                                <div className="text-slate-500">Requested</div>
                                <div className="font-mono font-medium text-slate-900">{Number(selectedRes?.requestedQty || 0)}</div>
                            </div>
                            <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                                <div className="text-slate-500">Reserved</div>
                                <div className="font-mono font-medium text-slate-900">{Number(selectedRes?.approvedQty || 0)}</div>
                            </div>
                            {selectedRes?.stockType === 'prm' ? (
                            <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                                <div className="text-slate-500">Production</div>
                                <div className="font-mono font-medium text-slate-900">{Number(selectedRes?.productionQty || 0)}</div>
                            </div>
                            ) : null}
                        </div>
                    </div>
                    ) : null}

                    {!isEditingOrderItem && selectedRes?.stockType === 'prm' && selectedRes?.status === 'Approved' ? renderAllocatedBatchesPanel() : null}

                    {isEditingOrderItem ? (
                    <>
                    <div className="space-y-2" ref={reviewDesignRef}>
                        <Label>Requested Design: <span className="font-bold text-black uppercase">{selectedRes?.design}</span></Label>
                        {selectedReviewDesign?.design ? (
                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="font-medium text-sm text-slate-900">{selectedReviewDesign.design}</div>
                                    <div className="text-xs text-slate-500 flex flex-row items-center gap-1">
                                        {selectedReviewDesign.name || 'Selected design'}
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-row items-center gap-1">
                                        Current Stock:
                                        <span className="font-medium text-violet-600">PRM <span className="font-bold">{selectedReviewDesign.prm}</span></span>
                                                  •  <span className="font-medium text-blue-600">STD <span className="font-bold">{selectedReviewDesign.std}</span></span>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-slate-500 hover:text-slate-800"
                                    onClick={() => {
                                        setSelectedReviewDesign(null)
                                        setReviewDesignQuery(selectedRes?.design || '')
                                        setShowDesignOrderHistory(false)
                                        setDesignOrderHistory([])
                                        setDesignOrderHistoryError('')
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : null}
                        <div className="relative">
                            <Input
                                placeholder="Search design by code or name..."
                                value={reviewDesignQuery}
                                onChange={(e) => handleReviewDesignSearch(e.target.value)}
                                onFocus={() => reviewDesignResults.length > 0 && setShowReviewDesignDrop(true)}
                                className="pr-9"
                            />
                            {searchingReviewDesigns ? (
                                <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                            )}
                            {showReviewDesignDrop && reviewDesignResults.length > 0 && (
                                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                                    {reviewDesignResults.map((productResult) => (
                                        <div
                                            key={productResult.productId}
                                            className="cursor-pointer px-3 py-2.5 hover:bg-gray-50"
                                            onMouseDown={() => selectReviewDesign(productResult)}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="font-medium text-sm text-slate-900">{productResult.design}</div>
                                                    <div className="text-xs text-slate-500">{productResult.name}</div>
                                                </div>
                                                <div className="flex gap-3 text-xs shrink-0">
                                                    <span className="font-medium text-violet-600">PRM <span className="font-bold">{productResult.prm ?? 0}</span></span>
                                                    <span className="font-medium text-blue-600">STD <span className="font-bold">{productResult.std ?? 0}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showReviewDesignDrop && !searchingReviewDesigns && reviewDesignResults.length === 0 && reviewDesignQuery.trim() && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white p-3 text-sm text-gray-500 shadow">
                                    No designs listed
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex flex-col gap-4">
                        <Label htmlFor="qty" className="text-left mt-4">Requested <span className={`font-bold ${selectedRes?.stockType == 'prm' ? 'text-violet-600' : 'text-blue-600'} uppercase`}>{selectedRes?.stockType}</span> Quantity</Label>
                        {(() => {
                            const isStdType   = selectedRes?.stockType === 'std';
                            const availableStd = Number(selectedReviewDesign?.std || 0) - Number(selectedRes?.approvedQty || 0);
                            const maxQty      = isStdType ? availableStd : undefined;
                            return (
                                <>
                                    <Input
                                        id="qty"
                                        type="number"
                                        value={approvalQty}
                                        max={maxQty}
                                        onChange={(e) => {
                                            const newVal = Number(e.target.value) >= 0 ? Number(e.target.value) : 0;
                                            if (isStdType) {
                                                if (availableStd <= 0 && ['Submitted', 'InReview'].includes(selectedRes.status)) {
                                                    setApprovalQty('0');
                                                } else if (newVal > availableStd) {
                                                    setApprovalQty(String(availableStd));
                                                } else {
                                                    setApprovalQty(String(newVal));
                                                }
                                            } else {
                                                setApprovalQty(String(newVal));
                                            }
                                        }}
                                        className="col-span-3"
                                    />
                                    {isStdType && (
                                        <p className={`text-xs -mt-2 ${(availableStd === 0 || availableStd <= selectedRes?.requestedQty) ? 'text-red-500' : 'text-slate-500'}`}>
                                            {(availableStd === 0 || availableStd <= selectedRes?.requestedQty)
                                                ? 'No STD stock available — cannot increase quantity'
                                                : `Max STD available: ${availableStd}`}
                                        </p>
                                    )}
                                    {!isStdType && (() => {
                                        const batchAvailable = designBatches.reduce((sum, b) => sum + (b.status === 'Active' ? Number(b.availableQty || 0) : 0), 0);
                                        const isReApproval = ['Approved', 'Modified'].includes(selectedRes?.status);
                                        const effectiveAvailable = batchAvailable + (isReApproval ? Number(selectedRes?.approvedQty || 0) : 0);
                                        return (
                                            <p className="text-xs -mt-2 text-slate-500">
                                                {loadingDesignBatches
                                                    ? 'Checking batch availability...'
                                                    : <>Available PRM from batches: <span className="font-medium text-violet-600">{effectiveAvailable}</span>{isReApproval ? ' (incl. this order’s reservation)' : ''} • excess moves to production</>}
                                            </p>
                                        );
                                    })()}
                                </>
                            );
                        })()}
                    </div>

                    {selectedRes?.stockType === 'prm' ? (
                    <div className="rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900">PRM stock batches</span>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                        {designBatches.filter((batch) => getEffectiveAvailableQty(batch) > 0).length}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500">{selectedReviewDesign?.design || selectedRes?.design || '-'}</div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {batchSequence.length > 0 ? (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
                                        onClick={() => setBatchSequence([])}
                                    >
                                        Clear order
                                    </Button>
                                ) : null}
                                {batchSequence.length > 0 ? (() => {
                                    // running total of what the selected batches can supply vs the qty being approved
                                    const selectedSum = designBatches.filter((b) => batchSequence.includes(b.id)).reduce((sum, b) => sum + getEffectiveAvailableQty(b), 0);
                                    const qty = Number(approvalQty || 0);
                                    return (
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${selectedSum >= qty ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            Selected {Math.min(selectedSum, qty)} / {qty}{selectedSum < qty ? ` • ${qty - selectedSum} to production` : ''}
                                        </span>
                                    );
                                })() : null}
                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                    Available {designBatches.reduce((sum, b) => sum + getEffectiveAvailableQty(b), 0)}
                                </span>
                            </div>
                        </div>

                        {loadingDesignBatches || (isEditingApprovedPrm && loadingOrderAllocations) ? (
                            <div className="flex items-center justify-center border-t border-slate-100 px-3 py-4 text-sm text-slate-500">
                                <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                                Loading batches...
                            </div>
                        ) : designBatches.length === 0 ? (
                            <div className="border-t border-slate-100 px-3 py-4 text-center text-sm text-slate-500">
                                No batches listed for this design
                            </div>
                        ) : (
                            <>
                                <div className="max-h-44 divide-y divide-slate-100 overflow-y-auto border-t border-slate-100">
                                    {designBatches.filter((batch) => getEffectiveAvailableQty(batch) > 0).map((batch) => {
                                        const seqIndex = batchSequence.indexOf(batch.id);
                                        const effectiveQty = getEffectiveAvailableQty(batch);
                                        const selectable = effectiveQty > 0;
                                        const reservedQty = Number(reservedQtyByBatch[batch.batchId] || 0);
                                        return (
                                        <div
                                            key={batch.id}
                                            onClick={() => toggleBatchInSequence(batch)}
                                            className={`flex items-center justify-between gap-3 px-3 py-2 ${selectable ? 'cursor-pointer hover:bg-slate-50' : 'opacity-60'} ${seqIndex >= 0 ? 'bg-violet-50 hover:bg-violet-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {seqIndex >= 0 ? (
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                                                        {seqIndex + 1}
                                                    </span>
                                                ) : null}
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{batch.batchId || 'Unnamed batch'}</div>
                                                    <div className="text-xs text-slate-500">
                                                        Received {batch.receivedOn ? dayjs(batch.receivedOn).format('DD/MM/YYYY') : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2 text-xs">
                                                {reservedQty > 0 ? (
                                                    <span className="rounded-full bg-violet-100 px-2 py-1 font-medium text-violet-700">
                                                        Reserved {reservedQty}
                                                    </span>
                                                ) : null}
                                                <span className={`rounded-full px-2 py-1 font-medium ${batch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {batch.status}
                                                </span>
                                                <span className="font-mono font-medium text-slate-900">
                                                    {Number(batch.availableQty || 0)}<span className="text-slate-400"> / {Number(batch.initialQty || 0)}</span>
                                                </span>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                    {batchSequence.length > 0
                                        ? 'Stock will be taken from the numbered batches in order; any remainder moves to production.'
                                        : 'Tap batches to set the allocation order — otherwise stock is taken from the smallest batches first, and any excess moves to production.'}
                                </div>
                            </>
                        )}
                    </div>
                    ) : null}
                    </>
                    ) : null}

                    {(!isEditingOrderItem || ['Submitted', 'InReview'].includes(selectedRes?.status)) ? (
                    <div className="rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Other orders for design</div>
                                <div className="text-xs text-slate-500">{selectedReviewDesign?.design || selectedRes?.design || '-'}</div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDesignOrderHistory((prev) => !prev)}
                            >
                                {showDesignOrderHistory ? 'Hide Orders' : 'View Orders'}
                            </Button>
                        </div>

                        {showDesignOrderHistory ? (
                            <>
                                <div className="flex items-center justify-between border-y border-slate-200 bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600">Orders listed</span>
                                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                        {designOrderHistory.length}
                                    </span>
                                </div>
                                <div className="h-56 overflow-y-auto">
                                    {loadingDesignOrderHistory ? (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                                            Loading orders...
                                        </div>
                                    ) : designOrderHistoryError ? (
                                        <div className="flex h-full items-center justify-center text-sm text-red-600">
                                            {designOrderHistoryError}
                                        </div>
                                    ) : designOrderHistory.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            No other orders listed
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {designOrderHistory.map((order) => (
                                                <div key={order.id} className="px-3 py-3 hover:bg-slate-50">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-medium text-sm text-slate-900">{order.cartId || `Order ${order.id}`}</span>
                                                                <span className={`rounded-full px-2 py-1 text-xs ${getOrderStatusClass(order.status)}`}>
                                                                    {getOrderStatusLabel(order.status)}
                                                                </span>
                                                                {hasWaitlistPosition(order.waitlistSequence ?? order.waitlistPosition) ? (
                                                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                                        Waitlist #{order.waitlistSequence ?? order.waitlistPosition}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-500">
                                                                {order.userId || '-'} to {order.dealerId || '-'} • {order.createdOn ? dayjs(order.createdOn).format('DD/MM/YYYY hh:mm A') : '-'}
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${order.stockType === 'prm' ? 'bg-purple-100 text-purple-700' : order.stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {order.stockType || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                                                            <div className="text-slate-500">Requested</div>
                                                            <div className="font-mono font-medium text-slate-900">{Number(order.requestedQty || 0)}</div>
                                                        </div>
                                                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                                                            <div className="text-slate-500">Reserved</div>
                                                            <div className="font-mono font-medium text-slate-900">{Number(order.approvedQty || 0)}</div>
                                                        </div>
                                                        {order.stockType === 'prm' ? (
                                                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                                                            <div className="text-slate-500">Production</div>
                                                            <div className="font-mono font-medium text-slate-900">{Number(order.productionQty || 0)}</div>
                                                        </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                    ) : null}
                </div>
                <div className="flex justify-end gap-3">
                    {isEditingOrderItem ? (
                        <>
                            {['Submitted', 'InReview'].includes(selectedRes?.status) ? (
                                <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={actionLoading}>Close</Button>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditingOrderItem(false)} disabled={actionLoading}>Cancel Edit</Button>
                            )}

                            {/* prm: 'Auto Approve' (smallest batches first, leftover to production) when
                                nothing is selected; 'Approve' (selected batches only, shortfall to
                                production) once at least one batch is picked */}
                                {
                                    selectedRes?.stockType === 'prm' && batchSequence.length === 0 ? (
                                        <Button className="bg-green-600 text-white" onClick={() => submitApproval((selectedRes?.status === 'Approved' || selectedRes?.status === 'Modified' || selectedRes?.status === 'Rejected') ? 'Modified' :'Approved')} disabled={actionLoading}>
                                            {actionLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                            Auto Approve
                                        </Button>
                                    ) : (
                                        <Button className="bg-green-600 text-white" onClick={() => submitApproval((selectedRes?.status === 'Approved' || selectedRes?.status === 'Modified' || selectedRes?.status === 'Rejected') ? 'Modified' :'Approved')} disabled={actionLoading}>
                                            {actionLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                            Approve
                                        </Button>
                                    )
                                }

                            <Button className="bg-red-600 text-white" onClick={() => submitApproval('Rejected')} disabled={actionLoading}>
                                {actionLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                Reject
                            </Button>

                            <Button className="bg-gray-600 text-white" onClick={() => submitApproval('OutOfStock')} disabled={actionLoading}>
                                {actionLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                Mark Out of Stock
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Close</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => { setShowDesignOrderHistory(false); setIsEditingOrderItem(true); }}>
                                {['Submitted', 'InReview'].includes(selectedRes?.status) ? 'Review Order' : 'Edit Order'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
