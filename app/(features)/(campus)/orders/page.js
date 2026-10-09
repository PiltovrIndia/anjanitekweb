'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt, CirclesFour, CircleDashed, CheckCircle, CheckSquare, CalendarBlank, Calendar, FileXls, FilePdf, Tag, GridFour } from 'phosphor-react'
import React, { useMemo, useRef, useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { Toaster } from "../../../components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"
import { Button } from '@/app/components/ui/button'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command'
import { ArrowDown, CheckIcon, ChevronDown, ChevronRight, HeartIcon, MessageSquare, Pencil, Search, Trash, UserRound, UsersRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Switch } from '@/app/components/ui/switch'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet'
import { Label } from '@/app/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Badge } from '@/app/components/ui/badge'
import * as XLSX from 'xlsx';
import StockOrderDialog from '../products/stock_order_dialog'

const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'

const ORDER_PAGE_SIZE = 0;

// get orders
const getOrdersAPI = async (pass, type, offset, role, userId, sortBy, isProduction, search = '', executiveId = '', basketType = 'All', dealerState = 'All', signal) => {
const searchParams = new URLSearchParams()
if (search.trim()) searchParams.set('search', search.trim())
if (executiveId) searchParams.set('executiveId', executiveId)
if (basketType !== 'All') searchParams.set('basketType', basketType)
if (dealerState !== 'All') searchParams.set('dealerState', dealerState)
return fetch("/api/v2/orders_test/"+pass+"/U0.1/"+type+"/"+offset+"/"+role+"/"+userId+"/"+sortBy+"/"+isProduction+(searchParams.size ? `?${searchParams.toString()}` : ''), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    signal,
});
};

// get waitlisted order items, grouped by cart
const getWaitlistOrdersAPI = async (pass, type, offset, role, userId, sortBy, isProduction, search = '', executiveId = '', basketType = 'All', dealerState = 'All', signal) => {
const searchParams = new URLSearchParams()
if (search.trim()) searchParams.set('search', search.trim())
if (executiveId) searchParams.set('executiveId', executiveId)
if (basketType !== 'All') searchParams.set('basketType', basketType)
if (dealerState !== 'All') searchParams.set('dealerState', dealerState)
return fetch("/api/v2/orders_test/"+pass+"/U0.8/"+type+"/"+offset+"/"+role+"/"+userId+"/"+sortBy+"/"+isProduction+(searchParams.size ? `?${searchParams.toString()}` : ''), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    signal,
});
};

// get report specific listing
const getOrdersByDateAPI = async (pass, type, fromDate, toDate, isProduction, executiveId = '', role = '', basketType = 'All', dealerState = 'All') => {
const searchParams = new URLSearchParams()
if (executiveId) {
    searchParams.set('executiveId', executiveId)
    searchParams.set('role', role)
}
if (basketType !== 'All') searchParams.set('basketType', basketType)
if (dealerState !== 'All') searchParams.set('dealerState', dealerState)
return fetch("/api/v2/orders_test/"+pass+"/report/"+type+"/"+encodeURIComponent(fromDate)+","+encodeURIComponent(toDate)+"/"+isProduction+(searchParams.size ? `?${searchParams.toString()}` : ''), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
};

const getExecutiveOrderSummariesAPI = async (pass, type, role, userId, isProduction, { search = '', waitlistOnly = false, basketType = 'All', dealerState = 'All' } = {}, signal) => {
const searchParams = new URLSearchParams()
if (search.trim()) searchParams.set('search', search.trim())
if (waitlistOnly) searchParams.set('waitlist', '1')
if (basketType !== 'All') searchParams.set('basketType', basketType)
if (dealerState !== 'All') searchParams.set('dealerState', dealerState)
return fetch("/api/v2/orders_test/"+pass+"/U0.10/"+type+"/"+role+"/"+userId+"/"+isProduction+(searchParams.size ? `?${searchParams.toString()}` : ''), {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal,
});
};

const getOrderStatesAPI = async (pass, role, userId, signal) =>
fetch(`/api/v2/orders_test/${pass}/U0.16/${role}/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal,
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

// update order status
const updateOrderStatusAPI = async (pass, path, orderId, qty, userId, actionDate, design, batchSeq, notes, allocationMode) => {
const searchParams = new URLSearchParams({ notes: notes || '' })
if (Array.isArray(batchSeq) && batchSeq.length > 0) searchParams.set('batchSeq', batchSeq.join(','))
if (allocationMode === 'production') searchParams.set('allocationMode', 'production')
return fetch("/api/v2/orders_test/"+pass+"/"+path+"/"+orderId+"/"+qty+"/"+userId+"/"+actionDate+"/"+encodeURIComponent(design)+"?"+searchParams.toString(), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
};

const changePrmOrderToStdAPI = async (pass, orderId, userId, actionDate, notes = '') => {
const searchParams = new URLSearchParams({ notes: notes || '' })
return fetch(`/api/v2/orders_test/${pass}/U0.11/${orderId}/${userId}/${actionDate}?${searchParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
};

const changeStdOrderToPrmAPI = async (pass, orderId, userId, actionDate, notes = '') => {
const searchParams = new URLSearchParams({ notes: notes || '' })
return fetch(`/api/v2/orders_test/${pass}/U0.12/${orderId}/${userId}/${actionDate}?${searchParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
};

const changePendingOrderDesignAPI = async (pass, orderId, userId, design, actionDate, notes = '') => {
const searchParams = new URLSearchParams({ notes: notes || '' })
return fetch(`/api/v2/orders_test/${pass}/U0.13/${orderId}/${userId}/${encodeURIComponent(design)}/${actionDate}?${searchParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
};

const updateOrderNotesAPI = async (pass, orderId, userId, actionDate, notes = '') => {
const searchParams = new URLSearchParams({ notes: notes || '' })
return fetch(`/api/v2/orders_test/${pass}/U0.14/${orderId}/${userId}/${actionDate}?${searchParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
};

// mark all order items of a cart as sale order
const markCartAsSaleOrderAPI = async (pass, cartId, adminId, actionDate) =>
fetch("/api/v2/orders_test/"+pass+"/U0.5/"+encodeURIComponent(cartId)+"/"+adminId+"/"+actionDate, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// mark one approved order item as a sale order without changing its basket peers
const markOrderAsSaleOrderAPI = async (pass, orderId, actorId, actionDate) =>
fetch(`/api/v2/orders_test/${pass}/U0.15/${orderId}/${actorId}/${actionDate}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// mark a submitted order item as in review
const markOrderInReviewAPI = async (pass, orderId, actorId) =>
fetch("/api/v2/orders_test/"+pass+"/U0.7/"+orderId+"?"+new URLSearchParams({ actorId: actorId || '' }).toString(), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getOrderActionHistoryAPI = async (pass, orderId, role, userId, signal) =>
fetch("/api/v2/orders_test/"+pass+"/U0.9/"+orderId+"/"+encodeURIComponent(role || '')+"/"+encodeURIComponent(userId || ''), {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal,
});

function OrderNotesPreview({ entries = [] }) {
    if (entries.length === 0) {
        return <span className="text-xs text-slate-300">-</span>;
    }

    const preview = entries.length === 1 ? entries[0].note : `${entries.length} notes`;

    return (
        <HoverCard openDelay={250} closeDelay={100}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    className="block max-w-40 truncate text-left text-xs text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    onClick={(event) => event.stopPropagation()}
                    aria-label="View order notes"
                >
                    {preview}
                </button>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80 p-3">
                <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Notes</div>
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                    {entries.map((entry) => (
                        <div key={entry.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            {entry.label ? <div className="mb-1 text-xs font-medium text-slate-700">{entry.label}</div> : null}
                            <p className="whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">{entry.note}</p>
                        </div>
                    ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

function OrderActionPreview({ action }) {
    if (!action?.lastActionByName) {
        return <span className="text-xs text-slate-300">-</span>;
    }

    return (
        <HoverCard openDelay={250} closeDelay={100}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    className="block max-w-28 truncate text-left text-xs font-medium text-slate-600 transition-colors hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Latest action by ${action.lastActionByName}`}
                >
                    {action.lastActionByName}
                </button>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-64 p-3">
                <div className="text-sm font-semibold text-slate-900">{action.lastActionByName}</div>
                <div className="mt-1 text-xs text-slate-500">
                    {action.lastActionType || 'Updated'}{action.lastActionOn ? ` • ${dayjs(action.lastActionOn).format('DD MMM YYYY, hh:mm A')}` : ''}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

// pass state variable and the method to update state variable
export default function OrdersV2() {
    
    const { toast } = useToast();
    const router = useRouter();

    
    const [groupedTags, setGroupedTags] = useState([]);
    const [tagsList, setTags] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState('All');
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [file, setFile] = useState(null); 
        
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [offerCreationLoading, setOfferCreationLoading] = useState(false);
    const [tagUpdateKey, setTagUpdateKey] = useState(0);

    // Orders State
    const [totalOrders, setTotalOrders] = useState(0);
    const [orders, setOrders] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [isProduction, setisProduction] = useState('All');
    const [basketTypeFilter, setBasketTypeFilter] = useState('All');
    const [dealerStateFilter, setDealerStateFilter] = useState('All');
    const [orderStates, setOrderStates] = useState([]);
    const [loadingOrderStates, setLoadingOrderStates] = useState(false);
    const [downloadingOrders, setDownloadingOrders] = useState(false);
    const [downloadingExecutiveId, setDownloadingExecutiveId] = useState(null);
    const [resOffset, setResOffset] = useState(0);
    const [resStatus, setResStatus] = useState('All');
    const [resSearch, setResSearch] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [isSearchingOrders, setIsSearchingOrders] = useState(false);
    const [ordersView, setOrdersView] = useState('orders');
    const [selectedExecutive, setSelectedExecutive] = useState(null);
    const [executivePickerOpen, setExecutivePickerOpen] = useState(false);
    const [executiveSummaries, setExecutiveSummaries] = useState([]);
    const [executiveSummaryQuery, setExecutiveSummaryQuery] = useState('');
    const [loadingExecutiveSummaries, setLoadingExecutiveSummaries] = useState(false);
    const [executiveSummariesError, setExecutiveSummariesError] = useState('');
    const [downloadFromDate, setDownloadFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [downloadToDate, setDownloadToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showDownloadPopover, setShowDownloadPopover] = useState(false);
    const [downloadingCartId, setDownloadingCartId] = useState(null);
    const [downloadingSodCartId, setDownloadingSodCartId] = useState(null);
    const [stockOrderOpen, setStockOrderOpen] = useState(false);
    const [addToCartGroup, setAddToCartGroup] = useState(null);
    const [basketReviewGroup, setBasketReviewGroup] = useState(null);
    const [basketReviewReturnCartId, setBasketReviewReturnCartId] = useState(null);
    const [expandedCartGroups, setExpandedCartGroups] = useState({});

    // Sort state
    const [ordersSortKey, setOrdersSortKey] = useState(null);
    const [ordersSortDir, setOrdersSortDir] = useState(null);

    // Approval Dialog State
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [approvalQty, setApprovalQty] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [notesDialogOrder, setNotesDialogOrder] = useState(null)
    const [notesDialogValue, setNotesDialogValue] = useState('')
    const [savingOrderNotes, setSavingOrderNotes] = useState(false)
    const [reviewDesignQuery, setReviewDesignQuery] = useState('')
    const [reviewDesignResults, setReviewDesignResults] = useState([])
    const [searchingReviewDesigns, setSearchingReviewDesigns] = useState(false)
    const [changingReviewDesign, setChangingReviewDesign] = useState(false)
    const [showReviewDesignDrop, setShowReviewDesignDrop] = useState(false)
    const [selectedReviewDesign, setSelectedReviewDesign] = useState(null)
    const [designOrderHistory, setDesignOrderHistory] = useState([])
    const [loadingDesignOrderHistory, setLoadingDesignOrderHistory] = useState(false)
    const [designOrderHistoryError, setDesignOrderHistoryError] = useState('')
    const [orderActionHistory, setOrderActionHistory] = useState([])
    const [loadingOrderActionHistory, setLoadingOrderActionHistory] = useState(false)
    const [orderActionHistoryError, setOrderActionHistoryError] = useState('')
    const [isEditingOrderItem, setIsEditingOrderItem] = useState(false)
    const [showDesignOrderHistory, setShowDesignOrderHistory] = useState(false)
    const [showOrderActionHistory, setShowOrderActionHistory] = useState(false)
    const [designBatches, setDesignBatches] = useState([])
    const [loadingDesignBatches, setLoadingDesignBatches] = useState(false)
    const [batchSequence, setBatchSequence] = useState([]) // admin-chosen batch allocation order (stock batch ids)
    const [batchQtyById, setBatchQtyById] = useState({}) // admin-chosen qty per selected batch id
    const [orderAllocations, setOrderAllocations] = useState([]) // batches allocated to the approved order under review
    const [loadingOrderAllocations, setLoadingOrderAllocations] = useState(false)
    const [showAutoApproveChoice, setShowAutoApproveChoice] = useState(false)
    const [saleOrderCartId, setSaleOrderCartId] = useState(null) // cartId currently being marked as Sale Order
    const [saleOrderOrderId, setSaleOrderOrderId] = useState(null) // order item currently being marked as Sale Order
    const reviewDesignTimer = useRef(null)
    const reviewDesignRef = useRef(null)
    const ordersEndRef = useRef(null)
    const loadMoreOrdersRef = useRef(null)
    const isLoadingMoreRef = useRef(false)
    const orderSearchTimerRef = useRef(null)
    const orderSearchControllerRef = useRef(null)
    const ordersRequestVersionRef = useRef(0)

    // var groupedTags = [];
    const [imgSrc, setImgSrc] = useState(``);
    // const [imgSrc, setImgSrc] = useState(`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/${product.imageUrls.split(',')[0]}?alt=media`);
    const handleError = () => {
        setImgSrc(`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/placeholder.webp?alt=media`);
      };

    function getImageUrl(design){
        return `https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F${design.design}_F1.jpeg?alt=media`;
    }


    // user state and requests variable
    const [user, setUser] = useState();
    const [userId, setUserId] = useState();
    const [role, setRole] = useState();
    const [offset, setOffset] = useState(0);
    const [offsetOrders, setOffsetOrders] = useState(0);
    const [searching, setSearching] = useState(false);
    const [searchingTags, setSearchingTags] = useState(false);

    const [selectedOffer,  setSelectedOffer] = useState('');
    const [eventTitle,  setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventMedia, setEventMedia] = useState('-');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageError, setImageError] = useState('');
    const canBrowseExecutives = ['GlobalAdmin', 'SuperAdmin'].includes(user?.role);
    const selectedExecutiveId = selectedExecutive?.executiveId || '';
    const shouldShowOrdersListing = !canBrowseExecutives || ordersView === 'orders' || Boolean(selectedExecutiveId);
    
    // get the user and fire the data fetch
    useEffect(()=>{
        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                setUserId(obj['id']);
                setRole(obj['role']);
                getOrders(resStatus, 0, obj); // fetch orders on load with default status and offset
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);

    useEffect(() => {
        if (!canBrowseExecutives || !user?.role || !user?.id) {
            setExecutiveSummaries([]);
            setExecutiveSummariesError('');
            setLoadingExecutiveSummaries(false);
            return;
        }

        const controller = new AbortController();
        setLoadingExecutiveSummaries(true);
        setExecutiveSummariesError('');

        getExecutiveOrderSummariesAPI(
            process.env.NEXT_PUBLIC_API_PASS,
            resStatus,
            user.role,
            user.id,
            isProduction,
            { search: activeSearchQuery, waitlistOnly: showWaitlist, basketType: basketTypeFilter, dealerState: dealerStateFilter },
            controller.signal
        )
            .then(async (response) => {
                const payload = await response.json();
                if (!response.ok || payload.status !== 200) {
                    throw new Error(payload.message || 'Unable to load executive summaries');
                }
                if (!controller.signal.aborted) setExecutiveSummaries(Array.isArray(payload.data) ? payload.data : []);
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    setExecutiveSummaries([]);
                    setExecutiveSummariesError(error.message || 'Unable to load executive summaries');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingExecutiveSummaries(false);
            });

        return () => controller.abort();
    }, [canBrowseExecutives, user?.role, user?.id, resStatus, isProduction, showWaitlist, activeSearchQuery, basketTypeFilter, dealerStateFilter]);

    useEffect(() => {
        if (!user?.role || !user?.id) return;

        const controller = new AbortController();
        setLoadingOrderStates(true);

        getOrderStatesAPI(process.env.NEXT_PUBLIC_API_PASS, user.role, user.id, controller.signal)
            .then(async (response) => {
                const payload = await response.json();
                if (!response.ok || payload.status !== 200) {
                    throw new Error(payload.message || 'Unable to load order states');
                }
                if (!controller.signal.aborted) {
                    setOrderStates(Array.isArray(payload.data) ? payload.data.filter(Boolean) : []);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) setOrderStates([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingOrderStates(false);
            });

        return () => controller.abort();
    }, [user?.role, user?.id]);

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
            setChangingReviewDesign(false)
            setSelectedReviewDesign(null)
            setDesignOrderHistory([])
            setLoadingDesignOrderHistory(false)
            setDesignOrderHistoryError('')
            setOrderActionHistory([])
            setLoadingOrderActionHistory(false)
            setOrderActionHistoryError('')
            setIsEditingOrderItem(false)
            setShowDesignOrderHistory(false)
            setShowOrderActionHistory(false)
        }
    }, [isActionDialogOpen])

    useEffect(() => {
        if (isActionDialogOpen || !basketReviewReturnCartId) return;

        const refreshedBasket = orders.find((group) => String(group.cartId) === String(basketReviewReturnCartId));
        if (refreshedBasket) setBasketReviewGroup(refreshedBasket);
        setBasketReviewReturnCartId(null);
    }, [isActionDialogOpen, basketReviewReturnCartId, orders])

    useEffect(() => {
        const basketId = basketReviewGroup?.cartId;
        if (!basketId) return;

        const refreshedBasket = orders.find((group) => String(group.cartId) === String(basketId));
        if (refreshedBasket && refreshedBasket !== basketReviewGroup) setBasketReviewGroup(refreshedBasket);
    }, [orders, basketReviewGroup])

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

    useEffect(() => {
        if (!isActionDialogOpen || !showOrderActionHistory || !selectedRes?.id || !user?.id) {
            setOrderActionHistory([])
            setLoadingOrderActionHistory(false)
            setOrderActionHistoryError('')
            return
        }

        const controller = new AbortController()

        async function fetchOrderActionHistory() {
            setLoadingOrderActionHistory(true)
            setOrderActionHistoryError('')

            try {
                const result = await getOrderActionHistoryAPI(
                    process.env.NEXT_PUBLIC_API_PASS,
                    selectedRes.id,
                    user.role,
                    user.id,
                    controller.signal
                )
                const queryResult = await result.json()
                if (!controller.signal.aborted) {
                    setOrderActionHistory(queryResult.status === 200 && Array.isArray(queryResult.data) ? queryResult.data : [])
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setOrderActionHistory([])
                    setOrderActionHistoryError('Could not load action history')
                }
            } finally {
                if (!controller.signal.aborted) setLoadingOrderActionHistory(false)
            }
        }

        fetchOrderActionHistory()
        return () => controller.abort()
    }, [isActionDialogOpen, showOrderActionHistory, selectedRes?.id, user?.id, user?.role])

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
        const design = selectedReviewDesign?.design || selectedRes?.design;
        const shouldLoadPrmBatches = selectedRes?.stockType === 'prm' || (isEditingOrderItem && selectedRes?.stockType === 'std');
        if (!isActionDialogOpen || !shouldLoadPrmBatches || !design) {
            setDesignBatches([]);
            setLoadingDesignBatches(false);
            setBatchSequence([]);
            setBatchQtyById({});
            return;
        }

        let cancelled = false;
        setLoadingDesignBatches(true);
        setBatchSequence([]);
        setBatchQtyById({});

        fetch(`/api/v2/designs/${process.env.NEXT_PUBLIC_API_PASS}/U11/${encodeURIComponent(design)}`, {
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
    }, [isActionDialogOpen, isEditingOrderItem, selectedRes?.stockType, selectedReviewDesign?.design, selectedRes?.design])

    // For a reserved PRM order, load the batches its stock is allocated from.
    useEffect(() => {
        if (!isActionDialogOpen || selectedRes?.stockType !== 'prm' || !['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status) || !selectedRes?.id) {
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
    // allocations when editing an already-reserved PRM order, so the admin
    // edits from what's currently reserved instead of starting blank
    useEffect(() => {
        if (!isEditingOrderItem || selectedRes?.stockType !== 'prm' || !['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status)) return;
        if (loadingDesignBatches || loadingOrderAllocations) return;
        if (batchSequence.length > 0 || orderAllocations.length === 0 || designBatches.length === 0) return;
        const preselected = orderAllocations
            .map((alloc) => designBatches.find((b) => b.batchId === alloc.batchId)?.id)
            .filter(Boolean);
        if (preselected.length > 0) {
            setBatchSequence(preselected);
            setBatchQtyById(orderAllocations.reduce((qtyMap, alloc) => {
                const batch = designBatches.find((b) => b.batchId === alloc.batchId);
                if (!batch) return qtyMap;
                qtyMap[batch.id] = Number(alloc.allocatedQty || 0);
                return qtyMap;
            }, {}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditingOrderItem, selectedRes?.stockType, selectedRes?.status, loadingDesignBatches, loadingOrderAllocations, orderAllocations, designBatches])

    useEffect(() => {
        if (!shouldShowOrdersListing) return;

        const sentinel = ordersEndRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMoreOrdersRef.current?.();
        }, { threshold: 0 });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [shouldShowOrdersListing]);

    // useEffect(() => {
    //         if (user && user.id) {
    //             getOrders(); // Fetch orders on load
    //         }
    //     }, [user]);

    
    // fetch the orders
    function normalizeCartOrders(data = []) {
        if (!Array.isArray(data)) {
            return []
        }

        const hasCartGroups = data.some((order) => Array.isArray(order.items))

        if (hasCartGroups) {
            return data.map((order) => {
                const rows = Array.isArray(order.items)
                    ? order.items.map((item) => ({
                        ...item,
                        cartId: order.cartId,
                        userId: order.userId,
                        dealerId: order.dealerId,
                        orderedBy: order.orderedBy,
                        dealer: order.dealer,
                        dealerState: order.dealerState,
                        mobile: order.mobile,
                        mapTo: order.mapTo,
                        isProduction: Number(item.productionQty || 0) > 0 ? 1 : 0,
                    }))
                    : []

                return {
                    ...order,
                    rows,
                    first: rows[0] || order,
                    requestedQty: Number(order.totalRequestedQty || 0),
                    approvedQty: Number(order.totalApprovedQty || 0),
                    productionQty: Number(order.totalProductionQty || 0),
                    waitlistItems: Number(order.waitlistItems || 0),
                    stockTypes: [...new Set(rows.map((item) => item.stockType).filter(Boolean))],
                    basketTypes: [...new Set(rows.map((item) => Number(item.designType) === 1 ? 'ATL' : Number(item.designType) === 2 ? 'VCL' : null).filter(Boolean))],
                    requestTypes: [...new Set(rows.map((item) => Number(item.productionQty || 0) > 0 ? 'Production' : 'Current'))],
                    statuses: order.orderStatus
                        ? [{ label: order.orderStatus, count: 1 }]
                        : getStatusCounts(rows),
                }
            })
        }

        const groupMap = new Map()
        data.forEach((order) => {
            const groupKey = order.cartId || `single-${order.id}`
            if (!groupMap.has(groupKey)) {
                groupMap.set(groupKey, {
                    cartId: groupKey,
                    rows: [],
                })
            }
            groupMap.get(groupKey).rows.push(order)
        })

        return Array.from(groupMap.values()).map((group) => {
            const rows = group.rows
            const first = rows[0] || {}

            return {
                ...group,
                ...first,
                first,
                totalDesigns: new Set(rows.map((item) => item.design).filter(Boolean)).size,
                totalRequestedQty: rows.reduce((sum, item) => sum + Number(item.requestedQty || 0), 0),
                totalApprovedQty: rows.reduce((sum, item) => sum + Number(item.approvedQty || 0), 0),
                totalProductionQty: rows.reduce((sum, item) => sum + Number(item.productionQty || 0), 0),
                requestedQty: rows.reduce((sum, item) => sum + Number(item.requestedQty || 0), 0),
                approvedQty: rows.reduce((sum, item) => sum + Number(item.approvedQty || 0), 0),
                waitlistItems: rows.filter((item) => hasWaitlistPosition(item.waitlistPosition)).length,
                stockTypes: [...new Set(rows.map((item) => item.stockType).filter(Boolean))],
                basketTypes: [...new Set(rows.map((item) => Number(item.designType) === 1 ? 'ATL' : Number(item.designType) === 2 ? 'VCL' : null).filter(Boolean))],
                requestTypes: [...new Set(rows.map((item) => item.isProduction == 1 || Number(item.productionQty || 0) > 0 ? 'Production' : 'Current'))],
                statuses: getStatusCounts(rows),
            }
        })
    }

    function getStatusCounts(rows = []) {
        const statusCounts = rows.reduce((counts, item) => {
            if (!item.status) {
                return counts
            }

            counts.set(item.status, (counts.get(item.status) || 0) + 1)
            return counts
        }, new Map())

        return Array.from(statusCounts.entries()).map(([label, count]) => ({
            label,
            count,
        }))
    }

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

    async function getOrders(
        val,
        offsetR,
        userObj = user,
        productionFilter = isProduction,
        append = false,
        waitlistOnly = showWaitlist,
        searchQuery = activeSearchQuery,
        { signal, keepRows = false, executiveId = selectedExecutiveId, basketType = basketTypeFilter, dealerState = dealerStateFilter } = {}
    ){
        const requestVersion = append ? ordersRequestVersionRef.current : ordersRequestVersionRef.current + 1;
        if (!append) {
            ordersRequestVersionRef.current = requestVersion;
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
            if (keepRows) setResLoading(false);
            else setIsSearchingOrders(false);
        }

        const isCurrentRequest = () => !signal?.aborted && requestVersion === ordersRequestVersionRef.current;
        const setOrdersLoading = append
            ? (loading) => {
                isLoadingMoreRef.current = loading;
                setIsLoadingMore(loading);
            }
            : keepRows ? setIsSearchingOrders : setResLoading;

        setOrdersLoading(true);
        // setOffset(offset+0); // update the offset for every call
        

        if (!userObj?.role || !userObj?.id) {
            if (isCurrentRequest()) setOrdersLoading(false);
            return;
        }

        try {    
            const result = await (waitlistOnly
                ? getWaitlistOrdersAPI(process.env.NEXT_PUBLIC_API_PASS, val, offsetR, userObj['role'], userObj['id'], 'createdOn', productionFilter, searchQuery, executiveId, basketType, dealerState, signal)
                : getOrdersAPI(process.env.NEXT_PUBLIC_API_PASS, val, offsetR, userObj['role'], userObj['id'], 'createdOn', productionFilter, searchQuery, executiveId, basketType, dealerState, signal));
            const queryResult = await result.json() // get data

            if (!isCurrentRequest()) return false;

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(Array.isArray(queryResult.data) && queryResult.data.length > 0){
                    const normalized = normalizeCartOrders(queryResult.data);
                    append ? setOrders(prev => [...prev, ...normalized]) : setOrders(normalized);
                    setTotalOrders(queryResult.totalOrders ?? queryResult.count ?? queryResult.data.length);
                }
                else {
                    if (!append) { setOrders([]); setTotalOrders(0); }
                }

                return true;
            }
            else if(queryResult.status == 401) {
                return false;
            }
            else if(queryResult.status == 404 || queryResult.status == 201) {
                if (!append) setOrders([]);
                return false;
            }
            toast({
                description: queryResult.message || "Issue loading orders, try again later!",
            });
            return false;
        }
        catch (e){
            if (e.name === 'AbortError' || signal?.aborted) return false;

            toast({
                description: "Issue loading, try again later!",
            })
            return false;
        }
        finally {
            if (isCurrentRequest()) setOrdersLoading(false);
        }
    }

    function buildOrderDownloadRows(allOrders = []) {
        return allOrders.flatMap((res) => {
            const buildRow = (batchNo, rowApprovedQty = res.approvedQty) => ({
                Basket: res.cartId || '-',
                // orderId: res.id,
                dealerName: res.dealer || '-',
                orderedBy: res.orderedBy || '-',
                userId: res.userId || '-',
                mobile: res.mobile || '-',
                // salesPerson: res.mapTo || '-',
                design: res.design || '-',
                productName: res.name || '-',
                // productId: res.productId || '-',
                requestedQty: Number(res.requestedQty || 0),
                approvedQty: Number(rowApprovedQty || 0),
                productionQty: Number(res.productionQty || 0),
                batchNo,
                stockType: res.stockType || '-',
                waitlistPosition: res.waitlistPosition || res.waitlistSequence || '-',
                notes: res.notes || '-',
                size: res.size || '-',
                status: res.status || '-',
                submittedOn: res.createdOn ? dayjs(res.createdOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                approvedOn: res.approvedOn ? dayjs(res.approvedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                modifiedOn: res.modifiedOn ? dayjs(res.modifiedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                requestType: res.isProduction == 1 || Number(res.productionQty || 0) > 0 ? 'Production' : 'Current',
            });

            const allocations = Array.isArray(res.batchAllocations) ? res.batchAllocations : [];
            if (allocations.length === 0) {
                return [buildRow('-')];
            }
            return allocations.map((alloc) => {
                const allocatedQty = Number(alloc.qty || 0);
                return buildRow(alloc.batchId || 'UNNAMED', allocatedQty);
            });
        });
    }

    function writeOrdersWorkbook(orderRows, filename) {
        const worksheet = xlsx.utils.json_to_sheet(orderRows);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
        xlsx.writeFile(workbook, filename);
    }

    async function downloadOrdersNow({ executive = selectedExecutive, source = 'toolbar' } = {}) {
        const statusToDownload = resStatus || 'All';
        const executiveId = executive?.executiveId || '';
        const isExecutiveCardDownload = source === 'executive-card';

        if (isExecutiveCardDownload) setDownloadingExecutiveId(executiveId);
        else setDownloadingOrders(true);
        setShowDownloadPopover(false);

        try {
            console.log("/api/v2/orders_test/"+process.env.NEXT_PUBLIC_API_PASS+"/report/"+statusToDownload+"/"+encodeURIComponent(downloadFromDate)+","+encodeURIComponent(downloadToDate)+"/"+isProduction);
            
            const result = await getOrdersByDateAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                statusToDownload,
                downloadFromDate,
                downloadToDate,
                isProduction,
                executiveId,
                user?.role || '',
                basketTypeFilter,
                dealerStateFilter
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Failed to download orders');
            }

            const allOrdersRaw = Array.isArray(queryResult.data) ? queryResult.data : [];
            const allOrders = allOrdersRaw.flatMap((order) => (
                Array.isArray(order.items)
                    ? order.items.map((item) => ({
                        ...item,
                        cartId: order.cartId,
                        userId: order.userId,
                        dealerId: order.dealerId,
                        orderedBy: order.orderedBy,
                        dealer: order.dealer,
                        dealerState: order.dealerState,
                        mobile: order.mobile,
                        mapTo: order.mapTo,
                    }))
                    : [order]
            ));

            if (allOrders.length === 0) {
                toast({ description: 'No orders available to download' });
                return;
            }

            const orderRows = buildOrderDownloadRows(allOrders);
            const executiveSuffix = executiveId ? `_executive_${executiveId}` : '';
            writeOrdersWorkbook(orderRows, `orders${isProduction != 'All' ? (isProduction == 1 ? '_Production' : '_Current') : ''}${executiveSuffix}_${statusToDownload.toLowerCase()}_${downloadFromDate}_to_${downloadToDate}.xlsx`);

            toast({ description: `Downloaded ${allOrders.length} orders (${orderRows.length} rows)${executive?.executiveName ? ` for ${executive.executiveName}` : ''}` });
        } catch (e) {
            toast({ description: e.message || 'Failed to download orders' });
        } finally {
            if (isExecutiveCardDownload) setDownloadingExecutiveId(null);
            else setDownloadingOrders(false);
        }
    }

    function downloadCartOrders(group, event) {
        event?.stopPropagation();

        const cartId = group.first?.cartId || group.cartId;
        const cartRows = group.rows?.length ? group.rows : [group.first].filter(Boolean);

        if (cartRows.length === 0) {
            toast({ description: 'No cart orders available to download' });
            return;
        }

        setDownloadingCartId(group.cartId);

        try {
            const orderRows = buildOrderDownloadRows(cartRows);
            writeOrdersWorkbook(orderRows, `orders_cart_${cartId || 'unknown'}.xlsx`);
            toast({ description: `Downloaded cart ${cartId || ''} (${orderRows.length} rows)` });
        } catch (e) {
            toast({ description: e.message || 'Failed to download cart orders' });
        } finally {
            setDownloadingCartId(null);
        }
    }

    function buildCartSodRows(cartRows = []) {
        return cartRows.flatMap((order) => {
            const approvedQty = Number(order.approvedQty || 0);
            if (approvedQty <= 0) return [];

            const design = String(order.design || '').trim();
            const isAtl = Number(order.designType) === 1 || String(order.designType || '').toUpperCase() === 'ATL';
            const stockType = String(order.stockType || '').toLowerCase();
            const productCode = `${isAtl ? `T31ATL${design}J` : design}${stockType === 'prm' ? 'A' : 'B'}`;
            const buildRow = (batchId, qty) => ({
                productCode,
                productName: order.name || '',
                batchId: stockType === 'prm' ? (batchId || '') : '',
                qty: Number(qty || 0),
            });

            if (stockType !== 'prm') return [buildRow('', approvedQty)];

            const allocations = Array.isArray(order.batchAllocations) ? order.batchAllocations : [];
            let remainingQty = approvedQty;
            const allocationRows = allocations.reduce((rows, allocation) => {
                const allocatedQty = Math.min(Number(allocation.qty || 0), remainingQty);
                if (allocatedQty > 0) {
                    rows.push(buildRow(allocation.batchId, allocatedQty));
                    remainingQty -= allocatedQty;
                }
                return rows;
            }, []);

            return remainingQty > 0 ? [...allocationRows, buildRow('', remainingQty)] : allocationRows;
        }).filter((row) => row.qty > 0);
    }

    function downloadCartSod(group, event) {
        event?.stopPropagation();

        const cartId = group.first?.cartId || group.cartId;
        const cartRows = group.rows?.length ? group.rows : [group.first].filter(Boolean);
        const exportRows = buildCartSodRows(cartRows);

        if (exportRows.length === 0) {
            toast({ description: 'No approved quantities are available for this basket SOD download.' });
            return;
        }

        setDownloadingSodCartId(group.cartId);
        try {
            const headers = ['', 'Sl No.', 'Product Code', 'Product Name', 'Batch No', 'Serial No.', 'HSN', 'UOM', 'Qty'];
            const worksheetRows = exportRows.map((row, index) => ([
                '',
                index + 1,
                row.productCode,
                row.productName,
                row.batchId,
                '',
                '',
                'BOX',
                row.qty,
            ]));
            const worksheet = xlsx.utils.aoa_to_sheet([headers, ...worksheetRows]);
            worksheet['!cols'] = [
                { wch: 3 }, { wch: 8 }, { wch: 18 }, { wch: 42 }, { wch: 14 },
                { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
            ];
            worksheetRows.forEach((_, index) => {
                worksheet[`I${index + 2}`].z = '0.00';
            });

            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'SOD');
            xlsx.writeFile(workbook, `sod_basket_${cartId || 'unknown'}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
            toast({ description: `${worksheetRows.length} SOD row${worksheetRows.length === 1 ? '' : 's'} downloaded for basket ${cartId || ''}.` });
        } catch (error) {
            toast({ description: error.message || 'Failed to download basket SOD.' });
        } finally {
            setDownloadingSodCartId(null);
        }
    }

    // create product
//     async function createProduct(productData){
        
        
//         setSearching(true);
//         setCreatingProduct(true);
//         let sizeTag = '';
        
//         tagsList.forEach(tag => {
//             if (tag.type === 'Size') {
                
//             productData.tags.split(',').forEach(tagId => {
                
//                 if (tag.tagId == tagId) {
//                     sizeTag = tag.name;
//                 }
//             });
//             }
//         });
//         console.log(sizeTag);
        
//         try {    
//             // const result  = await createUser(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.stringify(updateDataBasic)+"/"+encodeURIComponent(JSON.stringify(updateDataDealer)))
//             const result  = await createProductAPI(process.env.NEXT_PUBLIC_API_PASS, JSON.stringify(productData)) 
//             const queryResult = await result.json() // get data

//             console.log(queryResult);
//             // check for the status
//             if(queryResult.status == 200){

//                 toast({
//                     description: "Product created!",
//                     })
//                     setNewProductOn(false)
//                     setCreatingProduct(false);

//                     productData.productId = queryResult.productId;
//                     setAllProducts((prevProducts) => [...prevProducts, productData]);
                
//             }
//             else if(queryResult.status == 401 || queryResult.status == 201) {
//                 setNewProductOn(false)
//                 setCreatingProduct(false);
//             }
//             else if(queryResult.status == 404) {
                
//                 toast({
//                     description: "Facing issues, try again later!",
//                   })
//                   setNewProductOn(false)
//                   setCreatingProduct(false);
//             }
//         }
//         catch (e){
            
//             toast({
//                 description: "Issue loading, try again later!",
//               })
//         }
// }



  // Function to handle search input change
  const handleSearchChange = (e) => {
    if(e.target.value.length == 0){
        setSearchQuery('');
        setAllProducts(allProducts);
        setFilteredProducts(allProducts);
    }
    else {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter the invoice based on the search query
        const filtered = allProducts.filter(product => product.design.toLowerCase().includes(query) || product.name.toLowerCase().includes(query) );

        if(filtered.length > 0){
            // console.log('OK');
            setFilteredProducts(filtered); // Update the filtered dealers list
        }
        else {
            // console.log('NOT OK');
            // getMatchingAllProducts(e.target.value.toLowerCase());
        }
    }
  };

    // Filter the dealers list by states
    async function filterBySize(e){
        
        setSelectedSize(e);
        if(e == 'All'){
            setFilteredProducts(allProducts);
        }
        else {
            const filteredDealers = allProducts.filter(product => product.size === e);
            setFilteredProducts(filteredDealers);
        }
    }


    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);  // Update state
        } else {
            console.log("No file selected.");
        }
    };
    
    

    async function handleUpdateStatus(res) {
        // opening a Submitted item for review moves it to InReview right away
        let reviewRes = res;
        if (res.status === 'Submitted') {
            reviewRes = { ...res, status: 'InReview' };

            markOrderInReviewAPI(process.env.NEXT_PUBLIC_API_PASS, res.id, user?.id).catch(() => {});

            // reflect the new status in the orders listing
            setOrders(prev => prev.map(group => {
                if (!group.rows?.some(row => String(row.id) === String(res.id))) return group;
                const updatedRows = group.rows.map(row => String(row.id) === String(res.id) ? {
                    ...row,
                    status: 'InReview',
                    lastActionById: user?.id,
                    lastActionByName: user?.name,
                    lastActionType: 'InReview',
                    lastActionOn: new Date().toISOString(),
                } : row);
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest;
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest;
                }, null);
                return {
                    ...group,
                    rows: updatedRows,
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                    first: updatedRows[0] || group.first,
                    status: group.rows.length === 1 ? 'InReview' : group.status,
                    statuses: getStatusCounts(updatedRows),
                };
            }));
        }

        setSelectedRes(reviewRes);

        setApprovalQty(reviewRes.requestedQty); // Default to requested quantity
        setOrderNotes(reviewRes.notes || '');
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

    const selectReviewDesign = async (product) => {
        if (!selectedRes?.id) {
            toast({ description: 'Select an order item before changing its design.' })
            return
        }
        if (!user?.id) {
            toast({ description: 'Your session is unavailable. Please sign in again.' })
            return
        }
        if (!product?.design || product.design === selectedRes.design) {
            setSelectedReviewDesign(selectedRes)
            setReviewDesignQuery('')
            setReviewDesignResults([])
            setShowReviewDesignDrop(false)
            return
        }

        setChangingReviewDesign(true)
        setShowReviewDesignDrop(false)
        setReviewDesignQuery('')
        setReviewDesignResults([])
        try {
            const result = await changePendingOrderDesignAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                selectedRes.id,
                user.id,
                product.design,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                orderNotes,
            )
            const queryResult = await result.json()
            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Unable to change the requested design')
            }

            const actionOn = queryResult.data?.lastActionOn || new Date().toISOString()
            const designPatch = {
                design: product.design,
                name: product.name,
                description: product.description,
                size: product.size,
                tags: product.tags,
                media: product.media,
                productId: product.productId,
                prm: queryResult.data?.remainingPrm ?? product.prm,
                std: queryResult.data?.remainingStd ?? product.std,
                designType: product.designType,
                notes: queryResult.data?.notes ?? orderNotes ?? null,
                lastActionById: queryResult.data?.lastActionById || user.id,
                lastActionByName: queryResult.data?.lastActionByName || user.name,
                lastActionType: queryResult.data?.lastActionType || 'DesignChanged',
                lastActionOn: actionOn,
            }

            setSelectedRes((current) => current ? { ...current, ...designPatch } : current)
            setSelectedReviewDesign({
                ...product,
                prm: queryResult.data?.remainingPrm ?? product.prm,
                std: queryResult.data?.remainingStd ?? product.std,
            })
            setShowDesignOrderHistory(false)
            setDesignOrderHistory([])
            setDesignOrderHistoryError('')
            setBatchSequence([])
            setBatchQtyById({})
            setOrderAllocations((queryResult.data?.batchAllocations || []).map((allocation) => ({
                batchId: allocation.batch,
                allocatedQty: allocation.qty,
            })))
            setOrders((previousOrders) => previousOrders.map((group) => {
                if (!group.rows?.some((row) => String(row.id) === String(selectedRes.id))) return group

                const updatedRows = group.rows.map((row) => (
                    String(row.id) === String(selectedRes.id) ? { ...row, ...designPatch } : row
                ))
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest
                }, null)

                return {
                    ...group,
                    rows: updatedRows,
                    first: updatedRows[0] || group.first,
                    totalDesigns: new Set(updatedRows.map((row) => row.design).filter(Boolean)).size,
                    basketTypes: [...new Set(updatedRows.map((row) => Number(row.designType) === 1 ? 'ATL' : Number(row.designType) === 2 ? 'VCL' : null).filter(Boolean))],
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                }
            }))
            toast({ description: `Requested design changed to ${product.design}.` })
        } catch (error) {
            setSelectedReviewDesign(selectedRes)
            toast({ description: error.message || 'Unable to change the requested design' })
        } finally {
            setChangingReviewDesign(false)
        }
    }

    const openOrderNotesDialog = (order, event) => {
        event?.stopPropagation?.()
        setNotesDialogOrder(order)
        setNotesDialogValue(typeof order?.notes === 'string' && order.notes !== '-' ? order.notes : '')
    }

    const saveOrderNotes = async () => {
        if (!notesDialogOrder?.id || !user?.id) {
            toast({ description: 'Your session is unavailable. Please sign in again.' })
            return
        }

        setSavingOrderNotes(true)
        try {
            const response = await updateOrderNotesAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                notesDialogOrder.id,
                user.id,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                notesDialogValue,
            )
            const result = await response.json()
            if (result.status !== 200) {
                throw new Error(result.message || 'Unable to update notes')
            }

            const notePatch = {
                notes: result.data?.notes ?? null,
                lastActionById: result.data?.lastActionById || user.id,
                lastActionByName: result.data?.lastActionByName || user.name,
                lastActionType: result.data?.lastActionType || 'NotesUpdated',
                lastActionOn: result.data?.lastActionOn || new Date().toISOString(),
            }
            const orderId = notesDialogOrder.id

            setOrders((previousOrders) => previousOrders.map((group) => {
                if (!group.rows?.some((row) => String(row.id) === String(orderId))) return group

                const updatedRows = group.rows.map((row) => (
                    String(row.id) === String(orderId) ? { ...row, ...notePatch } : row
                ))
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest
                }, null)

                return {
                    ...group,
                    rows: updatedRows,
                    first: updatedRows[0] || group.first,
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                }
            }))
            setSelectedRes((current) => String(current?.id) === String(orderId) ? { ...current, ...notePatch } : current)
            if (String(selectedRes?.id) === String(orderId)) setOrderNotes(notePatch.notes || '')
            setNotesDialogOrder(null)
            toast({ description: 'Notes saved.' })
        } catch (error) {
            toast({ description: error.message || 'Unable to update notes' })
        } finally {
            setSavingOrderNotes(false)
        }
    }

    // Sale Order is a cart-wide transition. It clears production quantities
    // without creating additional production tracking lines.
    async function handleMarkSaleOrder(group, e) {
        e?.stopPropagation?.();
        if (saleOrderCartId) return;

        const confirmed = window.confirm(`Mark all items of cart #${group.first?.cartId || group.cartId} as Sale Order? Any production quantities in this basket will be set to 0.`);
        if (!confirmed) return;

        setSaleOrderCartId(group.cartId);
        try {
            const result = await markCartAsSaleOrderAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                group.first?.cartId || group.cartId,
                user?.id,
                dayjs().format('YYYY-MM-DD HH:mm:ss')
            );
            const queryResult = await result.json();

            if (queryResult.status === 200) {
                toast({ description: `Cart marked as Sale Order (${queryResult.data?.updatedItems ?? 0} items updated)` });

                setOrders(prev => prev.map(g => {
                    if (String(g.cartId) !== String(group.cartId)) return g;

                    const updatedRows = g.rows.map(row => ['Cancelled', 'Rejected', 'Deleted'].includes(row.status)
                        ? { ...row, productionQty: 0 }
                        : { ...row, status: 'SaleOrder', productionQty: 0 });

                    const totalRequestedQty  = updatedRows.reduce((s, r) => s + Number(r.requestedQty  || 0), 0);
                    const totalApprovedQty   = updatedRows.reduce((s, r) => s + Number(r.approvedQty   || 0), 0);
                    const totalProductionQty = updatedRows.reduce((s, r) => s + Number(r.productionQty || 0), 0);
                    const waitlistItems      = updatedRows.filter(r => Number(r.productionQty || 0) > 0).length;

                    return {
                        ...g,
                        rows: updatedRows,
                        first: updatedRows[0] || g.first,
                        totalRequestedQty, totalApprovedQty, totalProductionQty,
                        requestedQty: totalRequestedQty,
                        approvedQty: totalApprovedQty,
                        productionQty: totalProductionQty,
                        waitlistItems,
                        status: updatedRows[0]?.status || g.status,
                        requestTypes: [...new Set(updatedRows.map(r => Number(r.productionQty || 0) > 0 ? 'Production' : 'Current'))],
                        statuses: getStatusCounts(updatedRows),
                    };
                }));
            } else {
                toast({ description: queryResult.message || 'Failed to mark cart as Sale Order' });
            }
        } catch (e) {
            toast({ description: 'Error marking cart as Sale Order' });
        } finally {
            setSaleOrderCartId(null);
        }
    }

    // Unlike the basket action above, this transition applies only to the
    // selected approved line item and leaves the rest of the basket unchanged.
    async function handleMarkOrderAsSaleOrder(order, e) {
        e?.stopPropagation?.();
        if (!order?.id || saleOrderCartId || saleOrderOrderId) return;

        const confirmed = window.confirm(`Mark ${order.design || 'this order item'} as Sale Order? Its production quantity will be set to 0.`);
        if (!confirmed) return;

        const actionDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
        setSaleOrderOrderId(order.id);
        try {
            const result = await markOrderAsSaleOrderAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                order.id,
                user?.id,
                actionDate,
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Failed to mark order item as Sale Order');
            }

            const data = queryResult.data || {};
            const itemPatch = {
                status: 'SaleOrder',
                productionQty: 0,
                modifiedOn: data.modifiedOn || actionDate,
                lastActionById: data.lastActionById || user?.id,
                lastActionByName: data.lastActionByName || user?.name,
                lastActionType: data.lastActionType || 'SaleOrder',
                lastActionOn: data.lastActionOn || actionDate,
            };

            setOrders((previousOrders) => previousOrders.map((group) => {
                if (!group.rows?.some((row) => String(row.id) === String(order.id))) return group;

                const updatedRows = group.rows.map((row) => (
                    String(row.id) === String(order.id) ? { ...row, ...itemPatch } : row
                ));
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest;
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest;
                }, null);
                const totalRequestedQty = updatedRows.reduce((sum, row) => sum + Number(row.requestedQty || 0), 0);
                const totalApprovedQty = updatedRows.reduce((sum, row) => sum + Number(row.approvedQty || 0), 0);
                const totalProductionQty = updatedRows.reduce((sum, row) => sum + Number(row.productionQty || 0), 0);

                return {
                    ...group,
                    rows: updatedRows,
                    first: updatedRows[0] || group.first,
                    totalRequestedQty,
                    totalApprovedQty,
                    totalProductionQty,
                    requestedQty: totalRequestedQty,
                    approvedQty: totalApprovedQty,
                    productionQty: totalProductionQty,
                    waitlistItems: updatedRows.filter((row) => Number(row.productionQty || 0) > 0).length,
                    requestTypes: [...new Set(updatedRows.map((row) => Number(row.productionQty || 0) > 0 ? 'Production' : 'Current'))],
                    statuses: getStatusCounts(updatedRows),
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                };
            }));
            toast({ description: 'Order item marked as Sale Order.' });
        } catch (error) {
            toast({ description: error.message || 'Failed to mark order item as Sale Order' });
        } finally {
            setSaleOrderOrderId(null);
        }
    }

    // when editing an already-approved prm order, a batch's true selectable
    // capacity is its current availableQty plus whatever this order already
    // has reserved on it — that reservation gets released back to the batch
    // before the new selection is drained on submit
    const isEditingApprovedPrm = isEditingOrderItem && selectedRes?.stockType === 'prm' && ['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status);
    const reservedQtyByBatch = useMemo(() => {
        const map = {};
        orderAllocations.forEach((alloc) => { map[alloc.batchId] = Number(alloc.allocatedQty || 0); });
        return map;
    }, [orderAllocations]);
    const getEffectiveAvailableQty = (batch) => Number(batch.availableQty || 0) + (isEditingApprovedPrm ? Number(reservedQtyByBatch[batch.batchId] || 0) : 0);

    // panel showing which batches a reserved order's stock was allocated from
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
        setBatchSequence(prev => {
            if (prev.includes(batch.id)) {
                setBatchQtyById(qtyMap => {
                    const next = { ...qtyMap };
                    delete next[batch.id];
                    return next;
                });
                return prev.filter(id => id !== batch.id);
            }

            const remainingQty = Math.max(0, Number(approvalQty || 0) - prev.reduce((sum, id) => sum + Number(batchQtyById[id] || 0), 0));
            const availableQty = getEffectiveAvailableQty(batch);
            setBatchQtyById(qtyMap => ({
                ...qtyMap,
                [batch.id]: Math.max(1, Math.min(availableQty, remainingQty || availableQty)),
            }));
            return [...prev, batch.id];
        });
    }

    function updateBatchAllocationQty(batch, value) {
        const availableQty = getEffectiveAvailableQty(batch);
        const otherSelectedQty = batchSequence
            .filter((id) => String(id) !== String(batch.id))
            .reduce((sum, id) => sum + Number(batchQtyById[id] || 0), 0);
        const remainingApprovalQty = Math.max(0, Number(approvalQty || 0) - otherSelectedQty);
        const maxQty = Math.min(availableQty, remainingApprovalQty);
        const nextQty = maxQty <= 0 ? 0 : Math.max(1, Math.min(Number(value || 0), maxQty));
        setBatchQtyById(prev => ({
            ...prev,
            [batch.id]: nextQty,
        }));
    }

    function getBatchAllocationPayload() {
        let remainingQty = Number(approvalQty || 0);
        return batchSequence.map((id) => {
            const batch = designBatches.find((item) => String(item.id) === String(id));
            const availableQty = batch ? getEffectiveAvailableQty(batch) : 0;
            const selectedQty = Math.max(0, Math.min(Number(batchQtyById[id] || availableQty || 0), availableQty, remainingQty));
            remainingQty -= selectedQty;
            return `${id}:${selectedQty}`;
        }).filter((entry) => !entry.endsWith(':0'));
    }

    function getApprovalStatus() {
        if (selectedRes?.status === 'SaleOrder') return 'SaleOrder';
        return ['Approved', 'Modified', 'Rejected'].includes(selectedRes?.status) ? 'Modified' : 'Approved';
    }

    async function submitApproval(status, allocationMode) {
        if (!approvalQty || isNaN(approvalQty)) {
            toast({ description: "Please enter a valid quantity" });
            return;
        }

        if (!selectedReviewDesign?.design) {
            toast({ description: "Please choose a design before updating this order" });
            return;
        }

        if (!user?.id) {
            toast({ description: "Your session is unavailable. Please sign in again." });
            return;
        }

        setResLoading(true);
        try {
            var path = '';
            // check if the status is already approved, modified or rejected, if yes then update the record with modified status with modifiedOn value
            if(status.toLowerCase() == 'submitted' || status.toLowerCase() == 'approved' || status.toLowerCase() == 'modified' || status.toLowerCase() == 'saleorder'){
                path = 'U0.2';
            }
            else if(status.toLowerCase() == 'rejected'){
                path = 'U0.3';
            }
            else if(status.toLowerCase() == 'outofstock'){
                path = 'U0.31';
            }
            // console.log("/api/v2/orders_test/"+process.env.NEXT_PUBLIC_API_PASS+"/"+path+"/"+selectedRes.id+"/"+approvalQty+"/"+selectedRes.userId+"/"+dayjs().format('YYYY-MM-DD HH:mm:ss')+"/"+encodeURIComponent(selectedReviewDesign.design));
            
            const result = await updateOrderStatusAPI(
                process.env.NEXT_PUBLIC_API_PASS, path,
                selectedRes.id,
                approvalQty,
                user?.id,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                selectedReviewDesign.design,
                path === 'U0.2' && selectedRes.stockType === 'prm' ? getBatchAllocationPayload() : [],
                orderNotes,
                allocationMode,
            );
            const queryResult = await result.json();

            if (queryResult.status === 200) {
                toast({ description: status === 'SaleOrder' ? 'Sale Order updated.' : `Order marked as ${status.toLowerCase()}!` });
                setIsActionDialogOpen(false);

                const data = queryResult.data;
                if (data?.orderId) {
                    // Normalize field names — first-approval uses approvedQty, re-approval uses newApprovedQty
                    const mainPatch = {
                        approvedQty: data.newApprovedQty ?? data.approvedQty,
                        productionQty: data.newProductionQty ?? data.productionQty,
                        requestedQty: data.newRequestedQty ?? data.requestedQty,
                        notes: orderNotes || null,
                        status: status === 'Rejected' ? 'Rejected' : status === 'OutOfStock' ? 'OutOfStock' : status === 'SaleOrder' ? 'SaleOrder' : 'Approved',
                        lastActionById: data.lastActionById || user?.id,
                        lastActionByName: data.lastActionByName || user?.name,
                        lastActionType: data.lastActionType || (status === 'Rejected' ? 'Rejected' : status === 'OutOfStock' ? 'OutOfStock' : status === 'SaleOrder' ? 'SaleOrderModified' : getApprovalStatus() === 'Modified' ? 'Modified' : 'Approved'),
                        lastActionOn: data.lastActionOn || new Date().toISOString(),
                    };

                    // Build id→patch map for the main order + every waitlist allocation
                    const updates = new Map([[String(data.orderId), mainPatch]]);
                    for (const alloc of (data.waitlistAllocations ?? [])) {
                        updates.set(String(alloc.orderId), {
                            approvedQty: alloc.approvedQty,
                            productionQty: alloc.productionQty,
                        });
                    }

                    // Patch the orders list in place
                    setOrders(prev => prev.map(group => {
                        if (!group.rows.some(row => updates.has(String(row.id)))) return group;

                        const updatedRows = group.rows.map(row => {
                            const patch = updates.get(String(row.id));
                            return patch ? { ...row, ...patch } : row;
                        });

                        const totalRequestedQty  = updatedRows.reduce((s, r) => s + Number(r.requestedQty  || 0), 0);
                        const totalApprovedQty   = updatedRows.reduce((s, r) => s + Number(r.approvedQty   || 0), 0);
                        const totalProductionQty = updatedRows.reduce((s, r) => s + Number(r.productionQty || 0), 0);
                        const waitlistItems      = updatedRows.filter(r => Number(r.productionQty || 0) > 0).length;
                        const latestActionRow = updatedRows.reduce((latest, row) => {
                            if (!row.lastActionOn) return latest;
                            return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest;
                        }, null);

                        return {
                            ...group,
                            rows: updatedRows,
                            first: updatedRows[0] || group.first,
                            totalRequestedQty, totalApprovedQty, totalProductionQty,
                            requestedQty: totalRequestedQty,
                            approvedQty: totalApprovedQty,
                            productionQty: totalProductionQty,
                            waitlistItems,
                            lastActionById: latestActionRow?.lastActionById,
                            lastActionByName: latestActionRow?.lastActionByName,
                            lastActionType: latestActionRow?.lastActionType,
                            lastActionOn: latestActionRow?.lastActionOn,
                            statuses: getStatusCounts(updatedRows),
                        };
                    }));
                } else {
                    getOrders(resStatus, resOffset, user, isProduction, false, showWaitlist, activeSearchQuery, { keepRows: Boolean(activeSearchQuery) });
                }
            } else {
                toast({ description: queryResult.message || `Failed to ${status.toLowerCase()}` });
            }
        } catch (e) {
            toast({ description: "Error submitting approval: " + e.message });
        } finally {
            setResLoading(false);
        }
    }

    async function changePrmOrderToStd() {
        const requestedQty = Number(selectedRes?.requestedQty || 0);
        const availableStd = Number(selectedReviewDesign?.std || 0);

        if (!selectedRes?.id || selectedRes.stockType !== 'prm') return;
        if (!selectedReviewDesign?.design || selectedReviewDesign.design !== selectedRes.design) {
            toast({ description: 'Restore the requested design before changing its stock type' });
            return;
        }
        if (availableStd < requestedQty) {
            toast({ description: `STD stock must be at least ${requestedQty} to change this order` });
            return;
        }
        if (!user?.id) {
            toast({ description: 'Your session is unavailable. Please sign in again.' });
            return;
        }

        setResLoading(true);
        try {
            const result = await changePrmOrderToStdAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                selectedRes.id,
                user.id,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                orderNotes,
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Unable to change the order to STD');
            }

            const data = queryResult.data || {};
            const convertedOn = new Date().toISOString();
            const convertedPatch = {
                stockType: 'std',
                approvedQty: data.approvedQty ?? selectedRes.approvedQty,
                productionQty: data.productionQty ?? selectedRes.productionQty,
                status: data.status ?? selectedRes.status,
                notes: orderNotes || null,
                lastActionById: user.id,
                lastActionByName: user.name,
                lastActionType: 'StockTypeChanged',
                lastActionOn: convertedOn,
            };

            setOrders((previousOrders) => previousOrders.map((group) => {
                if (!group.rows?.some((row) => String(row.id) === String(selectedRes.id))) return group;

                const updatedRows = group.rows.map((row) => (
                    String(row.id) === String(selectedRes.id) ? { ...row, ...convertedPatch } : row
                ));
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest;
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest;
                }, null);

                return {
                    ...group,
                    rows: updatedRows,
                    first: updatedRows[0] || group.first,
                    stockTypes: [...new Set(updatedRows.map((row) => row.stockType).filter(Boolean))],
                    statuses: getStatusCounts(updatedRows),
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                };
            }));

            setSelectedRes((previous) => previous ? { ...previous, ...convertedPatch } : previous);
            setSelectedReviewDesign((previous) => previous ? {
                ...previous,
                std: data.remainingStd ?? previous.std,
            } : previous);
            setBatchSequence([]);
            setBatchQtyById({});
            setOrderAllocations([]);
            toast({ description: 'Order item changed from PRM to STD' });

            if (data.wasApproved) setIsActionDialogOpen(false);
        } catch (error) {
            toast({ description: error.message || 'Unable to change the order to STD' });
        } finally {
            setResLoading(false);
        }
    }

    async function changeStdOrderToPrm() {
        const requestedQty = Number(selectedRes?.requestedQty || 0);
        const availablePrm = designBatches.reduce((sum, batch) => (
            sum + (batch.status === 'Active' ? Number(batch.availableQty || 0) : 0)
        ), 0);

        if (!selectedRes?.id || selectedRes.stockType !== 'std') return;
        if (!selectedReviewDesign?.design || selectedReviewDesign.design !== selectedRes.design) {
            toast({ description: 'Restore the requested design before changing its stock type' });
            return;
        }
        if (loadingDesignBatches || availablePrm < requestedQty) {
            toast({ description: `PRM batch stock must be at least ${requestedQty} to change this order` });
            return;
        }
        if (!user?.id) {
            toast({ description: 'Your session is unavailable. Please sign in again.' });
            return;
        }

        setResLoading(true);
        try {
            const result = await changeStdOrderToPrmAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                selectedRes.id,
                user.id,
                dayjs().format('YYYY-MM-DD HH:mm:ss'),
                orderNotes,
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Unable to change the order to PRM');
            }

            const data = queryResult.data || {};
            const convertedOn = new Date().toISOString();
            const convertedPatch = {
                stockType: 'prm',
                approvedQty: data.approvedQty ?? selectedRes.approvedQty,
                productionQty: data.productionQty ?? selectedRes.productionQty,
                status: data.status ?? selectedRes.status,
                notes: orderNotes || null,
                lastActionById: user.id,
                lastActionByName: user.name,
                lastActionType: 'StockTypeChanged',
                lastActionOn: convertedOn,
            };

            setOrders((previousOrders) => previousOrders.map((group) => {
                if (!group.rows?.some((row) => String(row.id) === String(selectedRes.id))) return group;

                const updatedRows = group.rows.map((row) => (
                    String(row.id) === String(selectedRes.id) ? { ...row, ...convertedPatch } : row
                ));
                const latestActionRow = updatedRows.reduce((latest, row) => {
                    if (!row.lastActionOn) return latest;
                    return !latest?.lastActionOn || new Date(row.lastActionOn) > new Date(latest.lastActionOn) ? row : latest;
                }, null);

                return {
                    ...group,
                    rows: updatedRows,
                    first: updatedRows[0] || group.first,
                    stockTypes: [...new Set(updatedRows.map((row) => row.stockType).filter(Boolean))],
                    statuses: getStatusCounts(updatedRows),
                    lastActionById: latestActionRow?.lastActionById,
                    lastActionByName: latestActionRow?.lastActionByName,
                    lastActionType: latestActionRow?.lastActionType,
                    lastActionOn: latestActionRow?.lastActionOn,
                };
            }));

            setSelectedRes((previous) => previous ? { ...previous, ...convertedPatch } : previous);
            setSelectedReviewDesign((previous) => previous ? {
                ...previous,
                prm: data.remainingPrm ?? previous.prm,
                std: data.remainingStd ?? previous.std,
            } : previous);
            setBatchSequence([]);
            setBatchQtyById({});
            toast({ description: 'Order item changed from STD to PRM' });

            if (data.wasApproved) setIsActionDialogOpen(false);
        } catch (error) {
            toast({ description: error.message || 'Unable to change the order to PRM' });
        } finally {
            setResLoading(false);
        }
    }

    function toggleCartGroup(cartId) {
        setExpandedCartGroups((prev) => ({
            ...prev,
            [cartId]: !prev[cartId],
        }))
    }

    function getEligibleOrderSearchQuery(value = resSearch) {
        const query = value.trim();
        return query.length >= 3 ? query : '';
    }

    function cancelOrderSearch() {
        clearTimeout(orderSearchTimerRef.current);
        orderSearchTimerRef.current = null;
        orderSearchControllerRef.current?.abort();
        orderSearchControllerRef.current = null;
        ordersRequestVersionRef.current += 1;
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
        setIsSearchingOrders(false);
    }

    function handleOrderSearchChange(event) {
        const nextValue = event.target.value;
        const nextQuery = getEligibleOrderSearchQuery(nextValue);

        cancelOrderSearch();
        setResSearch(nextValue);

        if (!nextQuery) {
            setActiveSearchQuery('');
        }

        if (!nextValue.trim() && user) {
            setResOffset(0);
            setExpandedCartGroups({});
            getOrders(resStatus, 0, user, isProduction, false, showWaitlist, '', { keepRows: true });
        }
    }

    function clearOrderSearch() {
        handleOrderSearchChange({ target: { value: '' } });
    }

    useEffect(() => {
        const query = getEligibleOrderSearchQuery();
        if (!user || !query) return;

        const controller = new AbortController();
        orderSearchControllerRef.current = controller;
        orderSearchTimerRef.current = setTimeout(() => {
            setActiveSearchQuery(query);
            setResOffset(0);
            setExpandedCartGroups({});
            getOrders(resStatus, 0, user, isProduction, false, showWaitlist, query, {
                signal: controller.signal,
                keepRows: true,
            });
        }, 300);

        return () => {
            clearTimeout(orderSearchTimerRef.current);
            controller.abort();
        };
        // Search requests are cancelled explicitly before status or waitlist filters reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resSearch, user]);

    const groupedOrders = useMemo(() => {
        if (!ordersSortKey || !ordersSortDir) return orders;
        return [...orders].sort((a, b) => {
            let aVal, bVal;
            if (ordersSortKey === 'designs') {
                aVal = Number(a.totalDesigns || a.rows?.length || 0);
                bVal = Number(b.totalDesigns || b.rows?.length || 0);
            } else if (ordersSortKey === 'requested') {
                aVal = Number(a.requestedQty || 0);
                bVal = Number(b.requestedQty || 0);
            } else if (ordersSortKey === 'approved') {
                aVal = Number(a.approvedQty || 0);
                bVal = Number(b.approvedQty || 0);
            } else if (ordersSortKey === 'production') {
                aVal = Number(a.productionQty || 0);
                bVal = Number(b.productionQty || 0);
            } else if (ordersSortKey === 'percent') {
                aVal = Number(a.totalApprovedQty || 0) === 0 ? 0 : Number(a.totalApprovedQty) / Number(a.totalRequestedQty);
                bVal = Number(b.totalApprovedQty || 0) === 0 ? 0 : Number(b.totalApprovedQty) / Number(b.totalRequestedQty);
            } else if (ordersSortKey === 'submittedOn') {
                aVal = new Date(a.first?.createdOn || 0).getTime();
                bVal = new Date(b.first?.createdOn || 0).getTime();
            } else {
                return 0;
            }
            if (aVal < bVal) return ordersSortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return ordersSortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [orders, ordersSortKey, ordersSortDir])

    function handleStatusChange(val) {
        cancelOrderSearch();
        const searchQuery = getEligibleOrderSearchQuery();
        setResStatus(val);
        setActiveSearchQuery(searchQuery);
        setResOffset(0);
        setExpandedCartGroups({});

        getOrders(val, 0, user, isProduction, false, showWaitlist, searchQuery, { keepRows: true });
    }

    function handleBasketTypeChange(value) {
        cancelOrderSearch();
        const searchQuery = getEligibleOrderSearchQuery();
        setBasketTypeFilter(value);
        setActiveSearchQuery(searchQuery);
        setResOffset(0);
        setExpandedCartGroups({});

        getOrders(resStatus, 0, user, isProduction, false, showWaitlist, searchQuery, {
            keepRows: true,
            basketType: value,
        });
    }

    function handleDealerStateChange(value) {
        cancelOrderSearch();
        const searchQuery = getEligibleOrderSearchQuery();
        setDealerStateFilter(value);
        setActiveSearchQuery(searchQuery);
        setResOffset(0);
        setExpandedCartGroups({});

        getOrders(resStatus, 0, user, isProduction, false, showWaitlist, searchQuery, {
            keepRows: true,
            dealerState: value,
        });
    }

    function handleExecutiveSelection(executive) {
        const nextExecutive = executive || null;
        const nextExecutiveId = nextExecutive?.executiveId || '';

        cancelOrderSearch();
        setSelectedExecutive(nextExecutive);
        setExecutivePickerOpen(false);
        setResOffset(0);
        setExpandedCartGroups({});

        if (user) {
            getOrders(resStatus, 0, user, isProduction, false, showWaitlist, getEligibleOrderSearchQuery(), {
                keepRows: true,
                executiveId: nextExecutiveId,
            });
        }
    }

    async function handleWaitlistToggle(checked) {
        if (resLoading || isLoadingMore || isSearchingOrders || !user) return;

        cancelOrderSearch();
        const searchQuery = getEligibleOrderSearchQuery();
        const previousValue = showWaitlist;
        setShowWaitlist(checked);
        setActiveSearchQuery(searchQuery);
        setResOffset(0);
        setExpandedCartGroups({});

        const loaded = await getOrders(resStatus, 0, user, isProduction, false, checked, searchQuery, { keepRows: true });
        if (!loaded) setShowWaitlist(previousValue);
    }

    function handleOrdersSort(key) {
        if (ordersSortKey !== key) {
            setOrdersSortKey(key);
            setOrdersSortDir('asc');
        } else if (ordersSortDir === 'asc') {
            setOrdersSortDir('desc');
        } else {
            setOrdersSortKey(null);
            setOrdersSortDir(null);
        }
    }

    const sortIcon = (key, activeKey, dir) => {
        if (key !== activeKey || !dir) return <span className="ml-1 opacity-30 text-xs">↕</span>;
        return <span className="ml-1 text-xs">{dir === 'asc' ? '↑' : '↓'}</span>;
    };

    loadMoreOrdersRef.current = () => {
        if (resLoading || isSearchingOrders || isLoadingMore || isLoadingMoreRef.current || resSearch.trim() !== activeSearchQuery || orders.length >= totalOrders) return;
        // const next = resOffset + ORDER_PAGE_SIZE;
        const next = resOffset + 20;
        
        setResOffset(next);
        getOrders(resStatus, next, user, isProduction, true, showWaitlist, activeSearchQuery);
    };

    const visibleExecutiveSummaries = useMemo(() => {
        const query = executiveSummaryQuery.trim().toLowerCase();
        if (!query) return executiveSummaries;
        return executiveSummaries.filter((executive) => (
            [executive.executiveName, executive.executiveId]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query)
        ));
    }, [executiveSummaries, executiveSummaryQuery]);

return (

    // <div className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
    //       <div className='flex flex-row gap-2 items-center py-4' >
    //           <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
             
    <div className={`${inter.className} flex flex-col min-h-screen w-full overflow-auto`} style={{ gap: '8px' }}>
        <div className='flex flex-row gap-2 items-center justify-between' >
              <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">Orders</h2>
                  <div className="flex items-center gap-2">
                      <Label htmlFor="show-waitlist" className="text-sm font-medium text-slate-600">Show Waitlist</Label>
                      {resLoading && <SpinnerGap className="h-4 w-4 animate-spin text-slate-500" />}
                      <Switch
                          id="show-waitlist"
                          checked={showWaitlist}
                          disabled={resLoading || isLoadingMore || isSearchingOrders || !user}
                          onCheckedChange={handleWaitlistToggle}
                          aria-label="Show waitlist orders"
                      />
                  </div>
              </div>
              <div className="flex flex-row flex-wrap gap-2 justify-between items-center">
                    
                    <span className='text-sm text-slate-500'>{totalOrders}</span>
                    <div className="flex flex-row flex-wrap items-center gap-3">
                        <div className="relative">
                            {isSearchingOrders ? (
                                <SpinnerGap className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input
                                placeholder='Search cart, dealer, or design'
                                value={resSearch}
                                onChange={handleOrderSearchChange}
                                className="w-56 pl-8 pr-8"
                            />
                            {resSearch ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0.5 top-0.5 h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={clearOrderSearch}
                                    aria-label="Clear order search"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                        <Select value={resStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px]  font-mono uppercase text-sm tracking-wider">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Submitted">Pending</SelectItem>
                                <SelectItem value="InReview">InReview</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Modified">Modified</SelectItem>
                                <SelectItem value="OutOfStock">OutofStock</SelectItem>
                                <SelectItem value="SaleOrder">SaleOrder</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={basketTypeFilter} onValueChange={handleBasketTypeChange}>
                            <SelectTrigger className="w-[130px] font-mono uppercase text-sm tracking-wider" aria-label="Filter orders by basket type">
                                <SelectValue placeholder="Basket type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All types</SelectItem>
                                <SelectItem value="ATL">ATL</SelectItem>
                                <SelectItem value="VCL">VCL</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dealerStateFilter} onValueChange={handleDealerStateChange} disabled={loadingOrderStates || !user}>
                            <SelectTrigger className="w-[190px] font-mono text-sm tracking-wider" aria-label="Filter orders by dealer state">
                                <SelectValue placeholder="Dealer state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All states</SelectItem>
                                {orderStates.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {canBrowseExecutives ? (
                            <Popover open={executivePickerOpen} onOpenChange={setExecutivePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[210px] justify-between font-medium" aria-label="Filter orders by sales executive">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate">{selectedExecutive?.executiveName || 'All Executives'}</span>
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[290px] p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search executives..." />
                                        <CommandList>
                                            <CommandEmpty>No executives match these filters.</CommandEmpty>
                                            <CommandGroup heading="Order creators">
                                                <CommandItem value="all executives" onSelect={() => handleExecutiveSelection(null)}>
                                                    <UsersRound className="mr-2 h-4 w-4" />
                                                    <span>All Executives</span>
                                                    {!selectedExecutiveId ? <CheckIcon className="ml-auto h-4 w-4" /> : null}
                                                </CommandItem>
                                                {executiveSummaries.map((executive) => (
                                                    <CommandItem
                                                        key={executive.executiveId}
                                                        value={`${executive.executiveName || ''} ${executive.executiveId || ''}`}
                                                        onSelect={() => handleExecutiveSelection(executive)}
                                                    >
                                                        <UserRound className="mr-2 h-4 w-4" />
                                                        <span className="truncate">{executive.executiveName || executive.executiveId}</span>
                                                        {Number(executive.executiveIsActive) !== 1 ? <span className="ml-2 text-xs text-muted-foreground">Inactive</span> : null}
                                                        {selectedExecutiveId === executive.executiveId ? <CheckIcon className="ml-auto h-4 w-4" /> : null}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        ) : null}
                        <Button size="xs" onClick={() => setStockOrderOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-mono uppercase text-sm tracking-wider px-3 py-2" >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Order
                            </Button>
                        <Popover open={showDownloadPopover} onOpenChange={setShowDownloadPopover}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="xs" disabled={downloadingOrders} className=' font-mono uppercase text-sm tracking-wider px-3 py-2'>
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
                                        className="w-full mt-1 font-mono uppercase text-sm tracking-wide"
                                        onClick={() => downloadOrdersNow()}
                                        disabled={!downloadFromDate || !downloadToDate}
                                    >
                                        <ArrowDown className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
              
              <Toaster />
          </div>

          {canBrowseExecutives ? (
              <Tabs value={ordersView} onValueChange={setOrdersView} className="w-full">
                  <TabsList aria-label="Order browsing mode">
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="executives">By Executive</TabsTrigger>
                  </TabsList>
                  <TabsContent value="executives" className="mt-4">
                      <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                  <h3 className="text-base font-semibold">Executive order activity</h3>
                                  <p className="text-sm text-muted-foreground">Choose an executive to browse their carts using the current order filters.</p>
                              </div>
                              <div className="relative w-full sm:w-64">
                                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                      value={executiveSummaryQuery}
                                      onChange={(event) => setExecutiveSummaryQuery(event.target.value)}
                                      placeholder="Search executives..."
                                      className="pl-8"
                                  />
                              </div>
                          </div>

                          {loadingExecutiveSummaries ? (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                  {[0, 1, 2, 3, 4, 5].map((index) => <Skeleton key={index} className="h-40 rounded-md" />)}
                              </div>
                          ) : executiveSummariesError ? (
                              <Card className="border-red-200 bg-red-50 shadow-none">
                                  <CardContent className="p-4 text-sm text-red-700">{executiveSummariesError}</CardContent>
                              </Card>
                          ) : visibleExecutiveSummaries.length === 0 ? (
                              <Card className="border-dashed shadow-none">
                                  <CardContent className="p-8 text-center text-sm text-muted-foreground">No executives have matching orders.</CardContent>
                              </Card>
                          ) : (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                  {visibleExecutiveSummaries.map((executive) => {
                                      const isSelected = selectedExecutiveId === executive.executiveId;
                                      const isDownloadingExecutive = downloadingExecutiveId === executive.executiveId;
                                      return (
                                          <Card
                                              key={executive.executiveId}
                                              onClick={() => handleExecutiveSelection(executive)}
                                              onKeyDown={(event) => {
                                                  if (event.key === 'Enter' || event.key === ' ') {
                                                      event.preventDefault();
                                                      handleExecutiveSelection(executive);
                                                  }
                                              }}
                                              role="button"
                                              tabIndex={0}
                                              className={`h-full cursor-pointer rounded-md text-left shadow-none transition-colors hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${isSelected ? 'border-slate-900 bg-slate-50' : ''}`}
                                          >
                                              <CardContent className="p-4">
                                                  <div className="flex items-start justify-between gap-3">
                                                      <div className="min-w-0">
                                                          <div className="flex items-center gap-2">
                                                              <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                              <p className="truncate font-semibold">{executive.executiveName || executive.executiveId}</p>
                                                          </div>
                                                          <p className="mt-1 truncate text-xs text-muted-foreground">{executive.executiveId}</p>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                          {Number(executive.executiveIsActive) === 1 ? null : <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">Inactive</span>}
                                                          <Button
                                                              type="button"
                                                              variant="outline"
                                                              size="icon"
                                                              className="h-8 w-8"
                                                              disabled={isDownloadingExecutive}
                                                              onClick={(event) => {
                                                                  event.stopPropagation();
                                                                  downloadOrdersNow({ executive, source: 'executive-card' });
                                                              }}
                                                              onKeyDown={(event) => event.stopPropagation()}
                                                              aria-label={`Download orders for ${executive.executiveName || executive.executiveId}`}
                                                              title="Download executive orders"
                                                          >
                                                              {isDownloadingExecutive ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
                                                          </Button>
                                                      </div>
                                                  </div>
                                                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                                      <div><p className="text-xs text-muted-foreground">Carts</p><p className="mt-1 font-semibold">{Number(executive.cartCount || 0).toLocaleString()}</p></div>
                                                      <div><p className="text-xs text-muted-foreground">Waitlist</p><p className="mt-1 font-semibold text-orange-700">{Number(executive.waitlistItems || 0).toLocaleString()}</p></div>
                                                      <div><p className="text-xs text-muted-foreground">Requested</p><p className="mt-1 font-mono">{Number(executive.totalRequestedQty || 0).toLocaleString()}</p></div>
                                                      <div><p className="text-xs text-muted-foreground">Approved / Production</p><p className="mt-1 font-mono">{Number(executive.totalApprovedQty || 0).toLocaleString()} / {Number(executive.totalProductionQty || 0).toLocaleString()}</p></div>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      );
                                  })}
                              </div>
                          )}
                      </div>
                  </TabsContent>
              </Tabs>
          ) : null}

          {ordersView === 'executives' && selectedExecutive ? (
              <div className="flex items-center justify-between gap-3 border-y py-3">
                  <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Browsing orders created by</p>
                      <p className="truncate font-semibold">{selectedExecutive.executiveName || selectedExecutive.executiveId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExecutiveSelection(null)}>
                      <X className="mr-2 h-4 w-4" /> Clear executive
                  </Button>
              </div>
          ) : null}

          {shouldShowOrdersListing ? (
            <div className="w-full">

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100 text-slate-600 text-sm font-semibold">
                                <TableHead>Ordered by</TableHead>
                                <TableHead>Dealer</TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('designs')}>
                                    <span className="flex items-center">Designs{sortIcon('designs', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('requested')}>
                                    <span className="flex items-center justify-end">Requested{sortIcon('requested', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('approved')}>
                                    <span className="flex items-center justify-end">Approved{sortIcon('approved', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('production')}>
                                    <span className="flex items-center justify-end">Production{sortIcon('production', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('percent')}>
                                    <span className="flex items-center justify-end">%{sortIcon('percent', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right">Waitlist</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-28">Action by</TableHead>
                                <TableHead className="w-40">Notes</TableHead>
                                <TableHead>Order Type</TableHead>
                                <TableHead className="cursor-pointer select-none hover:bg-slate-50" onClick={() => handleOrdersSort('submittedOn')}>
                                    <span className="flex items-center">Submitted On{sortIcon('submittedOn', ordersSortKey, ordersSortDir)}</span>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resLoading ? (
                                <TableRow><TableCell colSpan={15} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : groupedOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={15} className="text-center py-10">No orders listed</TableCell></TableRow>
                            ) : groupedOrders.map((group) => {
                                const isExpanded = Boolean(expandedCartGroups[group.cartId])
                                const hasMultipleRows = group.rows.length > 0
                                const groupNotes = group.rows.reduce((entries, row) => {
                                    const note = typeof row.notes === 'string' ? row.notes.trim() : '';
                                    if (note && note !== '-') {
                                        entries.push({
                                            id: `${group.cartId}-${row.id}`,
                                            label: row.design ? `${row.design}${row.name ? ` - ${row.name}` : ''}` : '',
                                            note,
                                        });
                                    }
                                    return entries;
                                }, []);

                                const percentage1 = ((group.totalApprovedQty === 0 ? 0 : group.totalApprovedQty / group.totalRequestedQty) * 100)
                                const percentage = percentage1 > 0 ? percentage1.toFixed(1) : 0
                                const textColor = percentage < 50 ? 'text-red-500' : 'text-green-600'; // Red if < 50%, Green otherwise


                                return (
                                    <React.Fragment key={group.id}>
                                        <TableRow
                                            className={`text-sm transition-colors ${hasMultipleRows ? 'cursor-pointer bg-white hover:bg-slate-100/80' : 'bg-white hover:bg-slate-100/60'}`}
                                            onClick={hasMultipleRows ? () => toggleCartGroup(group.cartId) : undefined}
                                        >
                                            <TableCell className="py-2">
                                                <div className="flex items-start gap-3">
                                                    {/* <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-1 text-slate-500">
                                                        {hasMultipleRows ? (
                                                            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <GridFour className="h-4 w-4" />
                                                        )}
                                                    </div> */}
                                                    {hasMultipleRows ?
                                                    <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-1 text-slate-500">
                                                        
                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        
                                                        </div>  : 
                                                    <div className="mt-0.5 p-3 text-slate-500"></div>}
                                                    <div>
                                                        <span className='font-medium'>{group.first.orderedBy}</span><br/>
                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                            <span className="rounded-full bg-white px-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                #{group.first.cartId || group.cartId}
                                                            </span>
                                                            {(group.basketTypes || []).map((basketType) => (
                                                                <span
                                                                    key={`${group.cartId}-${basketType}`}
                                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${basketType === 'ATL' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'}`}
                                                                >
                                                                    {basketType}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {/* <span className='text-xs text-slate-500'>{group.first.userId}</span> */}
                                                        {/* <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span className="rounded-full bg-white px-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                #{group.first.cartId || group.cartId}

                                                            </span>
                                                            <span className={textColor}>{percentage}%</span>
                                                            <span className="text-[11px] text-slate-500">
                                                                {group.rows.length} item{group.rows.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className='font-medium'>{group.first.dealer}<br/>{group.first.dealerState ? ` (${group.first.dealerState})` : ''}</span><br/>
                                                {/* <span className='text-xs text-slate-500'>{group.first.dealerId}</span> */}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-800">
                                                    {`${group.totalDesigns || group.rows.length}`}
                                                </span><br/>
                                                {/* <span className='text-xs text-slate-500'>
                                                    {hasMultipleRows
                                                        ? group.rows.length
                                                        : group.first.name}
                                                </span> */}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{group.requestedQty}</TableCell>
                                            <TableCell className="text-right font-mono">{group.approvedQty}</TableCell>
                                            <TableCell className="text-right font-mono">{group.productionQty}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {group.statuses.every(status => status.label === 'Rejected') ? (
                                                    <span className={textColor}></span>
                                                ) : (
                                                    <span className={textColor}>{percentage}%</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(group.waitlistItems || 0) > 0 ? (
                                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                        {group.waitlistItems}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-slate-400">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-row gap-1">
                                                    {group.stockTypes.map((stockType) => (
                                                        <span key={`${group.cartId}-${stockType}`} className={`px-2 py-1 rounded-full text-xs font-medium ${stockType === 'prm' ? 'bg-purple-100 text-purple-700' : stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {stockType}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {group.statuses.map((status) => (
                                                        <span key={`${group.cartId}-${status.label}`} className={`uppercase font-medium px-2 py-1 rounded-full text-xs ${status.label === 'Approved' || status.label === 'Fully Approved' ? 'bg-green-100 text-green-700' : status.label === 'Rejected' ? 'bg-red-100 text-red-700' : status.label === 'SaleOrder' ? 'bg-emerald-100 text-emerald-700' : status.label === 'InReview' ? 'bg-sky-100 text-sky-700' : status.label === 'Modified' || status.label === 'Action Required' || status.label === 'Partially Approved' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {status.label == 'Submitted' ? 'Pending' : status.label == 'SaleOrder' ? 'Sale Order' : status.label == 'InReview' ? 'In Review' : status.label} {status.count > 1 ? `(${status.count})` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <OrderActionPreview action={group} />
                                            </TableCell>
                                            <TableCell>
                                                <OrderNotesPreview entries={groupNotes} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {group.requestTypes.map((requestType) => (
                                                        <span key={`${group.cartId}-${requestType}`} className={`uppercase font-mono px-2 py-1 rounded-full text-xs font-semibold ${requestType === 'Production' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {requestType == 'Current' ? 'C' : 'P'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className='font-mono text-xs text-slate-500'>{dayjs(group.first.createdOn).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const groupRows = group.rows?.length ? group.rows : [group.first];
                                                    const canAddOrderItem = Boolean(group.first?.cartId);
                                                    const hasReviewableItems = groupRows.some((row) => ['Submitted', 'InReview'].includes(row?.status));
                                                    const saleOrderEligible = groupRows.some(r => r?.status === 'Approved') && !groupRows.some(r => ['Submitted', 'InReview'].includes(r?.status));
                                                    const isMarking = saleOrderCartId === group.cartId;
                                                    const isAnySaleOrderActionPending = Boolean(saleOrderCartId || saleOrderOrderId);
                                                    const isDownloadingCart = downloadingCartId === group.cartId;
                                                    const isDownloadingSod = downloadingSodCartId === group.cartId;
                                                    const downloadButton = (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isDownloadingCart}
                                                            onClick={(e) => downloadCartOrders(group, e)}
                                                        >
                                                            {isDownloadingCart ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
                                                        </Button>
                                                    );
                                                    const addOrderItemButton = (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title={`Add order item to basket ${group.cartId}`}
                                                            aria-label={`Add order item to basket ${group.cartId}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAddToCartGroup(group);
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    );
                                                    const reviewBasketButton = hasReviewableItems ? (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBasketReviewGroup(group);
                                                            }}
                                                        >
                                                            <CheckIcon className="mr-2 h-4 w-4" />Review Basket
                                                        </Button>
                                                    ) : null;
                                                    const saleOrderButton = saleOrderEligible ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                            disabled={isAnySaleOrderActionPending}
                                                            onClick={(e) => handleMarkSaleOrder(group, e)}
                                                        >
                                                            {isMarking ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'SO'}
                                                        </Button>
                                                    ) : null;
                                                    const sodButton = (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                            disabled={isDownloadingSod}
                                                            title={`Download SOD for basket ${group.cartId}`}
                                                            onClick={(e) => downloadCartSod(group, e)}
                                                        >
                                                            {isDownloadingSod ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'SOD'}
                                                        </Button>
                                                    );

                                                    return hasMultipleRows ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            {canAddOrderItem ? addOrderItemButton : null}
                                                            {downloadButton}
                                                            {reviewBasketButton}
                                                            {saleOrderButton}
                                                            {sodButton}
                                                            {/* <span className="text-xs font-medium text-slate-500">
                                                                {isExpanded ? 'Hide items' : 'View items'}
                                                            </span> */}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            {canAddOrderItem ? addOrderItemButton : null}
                                                            {downloadButton}
                                                            {reviewBasketButton}
                                                            {['Submitted', 'InReview'].includes(group.first.status) && (
                                                                <div className='flex flex-row items-center gap-2'>
                                                                    <Button size="sm" variant="secondary" className="bg-blue-600 shadow-md text-white hover:bg-blue-700" onClick={() => handleUpdateStatus(group.first)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                                </div>
                                                            )}
                                                            {!['Submitted', 'InReview'].includes(group.first.status) && (
                                                                <div className='flex flex-row items-center gap-2'>
                                                                    <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(group.first)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                                </div>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                                                title="Edit notes"
                                                                aria-label={`Edit notes for ${group.first.design}`}
                                                                onClick={(event) => openOrderNotesDialog(group.first, event)}
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                            {saleOrderButton}
                                                            {sodButton}
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                        {hasMultipleRows && isExpanded && group.rows.map((res) => (
                                            
                                            <TableRow key={`${group.cartId}-${res.id}`} className="bg-white text-sm hover:bg-slate-50/80">
                                                <TableCell className="py-4 pl-16">
                                                    <span className='font-medium'>{res.orderedBy}</span><br/>
                                                    <span className='text-xs text-slate-500'>{res.userId}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className='font-medium'>{res.dealer}{res.dealerState ? ` (${res.dealerState})` : ''}</span><br/>
                                                    <span className='text-xs text-slate-500'>{res.dealerId}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {res.design}<br/>
                                                    <span className='text-xs text-slate-500'>{res.name}</span>
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${res.stockType === 'prm' ? 'bg-purple-100 text-purple-700' : res.stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {res.stockType}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${res.status === 'Approved' ? 'bg-green-100 text-green-700' : res.status === 'Rejected' ? 'bg-red-100 text-red-700' : res.status === 'SaleOrder' ? 'bg-emerald-100 text-emerald-700' : res.status === 'InReview' ? 'bg-sky-100 text-sky-700' : res.status === 'Modified' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {res.status === 'SaleOrder' ? 'Sale Order' : res.status === 'InReview' ? 'In Review' : res.status} {(res.status === 'Approved' || res.status == 'Rejected') ? '- '+dayjs(res.approvedOn).format('DD/MM/YYYY') : (res.status === 'Modified' || res.status === 'SaleOrder') ? '- '+dayjs(res.modifiedOn).format('DD/MM/YYYY') : ''}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <OrderActionPreview action={res} />
                                                </TableCell>
                                                <TableCell>
                                                    <OrderNotesPreview
                                                        entries={typeof res.notes === 'string' && res.notes.trim() && res.notes.trim() !== '-'
                                                            ? [{ id: res.id, label: '', note: res.notes.trim() }]
                                                            : []}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 font-mono uppercase rounded-full text-xs font-bold ${(res.isProduction == 1) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {(res.isProduction == 1) ? 'P' : 'C'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='font-mono text-xs text-slate-500'>{dayjs(res.createdOn).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {['Submitted', 'InReview'].includes(res.status) && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="outline" className="bg-blue-600 shadow-md text-white hover:bg-blue-700 hover:text-white" onClick={() => handleUpdateStatus(res)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                            </div>
                                                        )}
                                                        {!['Submitted', 'InReview'].includes(res.status) && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(res)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                            </div>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                                            title="Edit notes"
                                                            aria-label={`Edit notes for ${res.design}`}
                                                            onClick={(event) => openOrderNotesDialog(res, event)}
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                        {res.status === 'Approved' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                                disabled={Boolean(saleOrderCartId || saleOrderOrderId)}
                                                                title={`Mark ${res.design} as Sale Order`}
                                                                onClick={(event) => handleMarkOrderAsSaleOrder(res, event)}
                                                            >
                                                                {saleOrderOrderId === res.id ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'SO'}
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
                <div ref={ordersEndRef} className="flex min-h-12 items-center justify-center py-3 text-center text-sm text-slate-400">
                    {isLoadingMore && orders.length > 0 && <><SpinnerGap className="mr-2 inline-block h-4 w-4 animate-spin" />Loading more orders...</>}
                    {!isLoadingMore && orders.length > 0 && orders.length >= totalOrders && <span>All {totalOrders} orders loaded</span>}
                </div>
            </div>
          ) : null}
          
          <StockOrderDialog
            id={userId}
              isOpen={stockOrderOpen}
              onClose={() => setStockOrderOpen(false)}
              pass={process.env.NEXT_PUBLIC_API_PASS}
              role={user?.role}
              onSuccess={(msg) => {
                  toast({ description: msg });
                  getOrders(resStatus, resOffset, user, isProduction, false, showWaitlist, activeSearchQuery, { keepRows: Boolean(activeSearchQuery) });
              }}
          />
          <StockOrderDialog
            id={userId}
            isOpen={Boolean(addToCartGroup)}
            onClose={() => setAddToCartGroup(null)}
            pass={process.env.NEXT_PUBLIC_API_PASS}
            role={user?.role}
            existingCart={addToCartGroup}
            onSuccess={(msg) => {
                toast({ description: msg });
                setResOffset(0);
                setExpandedCartGroups({});
                getOrders(resStatus, 0, user, isProduction, false, showWaitlist, activeSearchQuery, { keepRows: true });
            }}
          />

          <Dialog open={Boolean(notesDialogOrder)} onOpenChange={(open) => {
              if (!open && !savingOrderNotes) setNotesDialogOrder(null)
          }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Order Notes</DialogTitle>
                    <DialogDescription>
                        {notesDialogOrder?.design || 'Order item'}{notesDialogOrder?.name ? ` - ${notesDialogOrder.name}` : ''}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="inline-order-notes">Notes</Label>
                    <Textarea
                        id="inline-order-notes"
                        value={notesDialogValue}
                        onChange={(event) => setNotesDialogValue(event.target.value)}
                        placeholder="Add context for this order item"
                        maxLength={2000}
                        disabled={savingOrderNotes}
                        className="min-h-[136px] resize-y"
                    />
                    <p className="text-right text-xs text-slate-500">{notesDialogValue.length}/2000</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={savingOrderNotes} onClick={() => setNotesDialogOrder(null)}>Cancel</Button>
                    <Button disabled={savingOrderNotes} onClick={saveOrderNotes}>
                        {savingOrderNotes ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save notes
                    </Button>
                </div>
            </DialogContent>
          </Dialog>

          <Dialog open={Boolean(basketReviewGroup)} onOpenChange={(open) => {
              if (!open) {
                  setBasketReviewGroup(null);
                  setBasketReviewReturnCartId(null);
              }
          }}>
            <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="border-b px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                        <div>
                            <DialogTitle>Review Basket</DialogTitle>
                            <DialogDescription className="mt-1">
                                {basketReviewGroup?.first?.dealer || basketReviewGroup?.first?.dealerId || 'Recipient'} · Basket {basketReviewGroup?.first?.cartId || basketReviewGroup?.cartId || '-'}
                            </DialogDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {(basketReviewGroup?.basketTypes || []).map((basketType) => (
                                <Badge key={basketType} variant="secondary" className={basketType === 'ATL' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'}>{basketType}</Badge>
                            ))}
                            <OrderActionPreview action={basketReviewGroup} />
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 px-6 py-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        <Card className="border-slate-200 shadow-none"><CardContent className="p-3"><div className="text-xs text-slate-500">Designs</div><div className="mt-1 font-mono text-lg font-semibold text-slate-900">{basketReviewGroup?.totalDesigns || 0}</div></CardContent></Card>
                        <Card className="border-slate-200 shadow-none"><CardContent className="p-3"><div className="text-xs text-slate-500">Requested</div><div className="mt-1 font-mono text-lg font-semibold text-slate-900">{Number(basketReviewGroup?.requestedQty || 0)}</div></CardContent></Card>
                        <Card className="border-slate-200 shadow-none"><CardContent className="p-3"><div className="text-xs text-slate-500">Approved</div><div className="mt-1 font-mono text-lg font-semibold text-green-700">{Number(basketReviewGroup?.approvedQty || 0)}</div></CardContent></Card>
                        <Card className="border-slate-200 shadow-none"><CardContent className="p-3"><div className="text-xs text-slate-500">Production</div><div className="mt-1 font-mono text-lg font-semibold text-amber-700">{Number(basketReviewGroup?.productionQty || 0)}</div></CardContent></Card>
                        <Card className="border-slate-200 shadow-none"><CardContent className="p-3"><div className="text-xs text-slate-500">Waitlist</div><div className="mt-1 font-mono text-lg font-semibold text-orange-700">{Number(basketReviewGroup?.waitlistItems || 0)}</div></CardContent></Card>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Order items</div>
                            <div className="text-xs text-slate-500">Select a pending item to open the existing order review.</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {(basketReviewGroup?.statuses || []).map((status) => (
                                <Badge key={status.label} variant="secondary" className={getOrderStatusClass(status.label)}>
                                    {getOrderStatusLabel(status.label)} {status.count > 1 ? `(${status.count})` : ''}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="h-[360px] rounded-md border border-slate-200">
                        <div className="divide-y divide-slate-100">
                            {(basketReviewGroup?.rows || []).map((row) => {
                                const canReviewItem = ['Submitted', 'InReview'].includes(row.status);
                                const hasNote = typeof row.notes === 'string' && row.notes.trim() && row.notes.trim() !== '-';

                                return (
                                    <div key={row.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-sm font-semibold text-slate-900">{row.design || '-'}</span>
                                                <span className="truncate text-sm text-slate-600">{row.name || 'Order item'}</span>
                                                <Badge variant="secondary" className={row.stockType === 'prm' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>{row.stockType || '-'}</Badge>
                                                <Badge variant="secondary" className={getOrderStatusClass(row.status)}>{getOrderStatusLabel(row.status)}</Badge>
                                                {hasWaitlistPosition(row.waitlistPosition) ? <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Waitlist #{row.waitlistPosition}</Badge> : null}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span>Requested <b className="font-mono text-slate-800">{Number(row.requestedQty || 0)}</b></span>
                                                <span>Approved <b className="font-mono text-slate-800">{Number(row.approvedQty || 0)}</b></span>
                                                <span>Production <b className="font-mono text-slate-800">{Number(row.productionQty || 0)}</b></span>
                                                {hasNote ? <OrderNotesPreview entries={[{ id: row.id, label: 'Item notes', note: row.notes.trim() }]} /> : <span className="text-slate-400">No notes</span>}
                                            </div>
                                        </div>
                                        {canReviewItem ? (
                                            <Button
                                                size="sm"
                                                className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                                                onClick={() => {
                                                    setBasketReviewReturnCartId(basketReviewGroup.cartId);
                                                    setBasketReviewGroup(null);
                                                    handleUpdateStatus(row);
                                                }}
                                            >
                                                <CheckIcon className="mr-2 h-4 w-4" />{row.status === 'InReview' ? 'Continue Review' : 'Review'}
                                            </Button>
                                        ) : (
                                            <span className="shrink-0 text-xs font-medium text-slate-400">Read only</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
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
                        {orderNotes ? (
                        <div className="mt-3 border-t border-slate-200 pt-3 text-sm">
                            <div className="mb-1 text-xs font-medium text-slate-500">Notes</div>
                            <p className="whitespace-pre-wrap text-slate-700">{orderNotes}</p>
                        </div>
                        ) : null}
                    </div>
                    ) : null}

                    {!isEditingOrderItem && selectedRes?.stockType === 'prm' && ['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status) ? renderAllocatedBatchesPanel() : null}

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
                                    disabled={changingReviewDesign}
                                    onClick={() => {
                                        setSelectedReviewDesign(null)
                                        setReviewDesignQuery('')
                                        setShowDesignOrderHistory(false)
                                        setDesignOrderHistory([])
                                        setDesignOrderHistoryError('')
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : null}
                        {!selectedReviewDesign?.design ? (
                        <div className="relative">
                            <Input
                                placeholder="Search design by code or name..."
                                value={reviewDesignQuery}
                                onChange={(e) => handleReviewDesignSearch(e.target.value)}
                                onFocus={() => reviewDesignResults.length > 0 && setShowReviewDesignDrop(true)}
                                disabled={changingReviewDesign}
                                className="pr-9"
                            />
                            {searchingReviewDesigns || changingReviewDesign ? (
                                <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                            )}
                            {showReviewDesignDrop && reviewDesignResults.length > 0 && (
                                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                                    {reviewDesignResults.map((product) => (
                                        <button
                                            type="button"
                                            key={product.productId}
                                            className="block w-full cursor-pointer px-3 py-2.5 text-left hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
                                            disabled={changingReviewDesign}
                                            onClick={() => selectReviewDesign(product)}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="font-medium text-sm text-slate-900">{product.design}</div>
                                                    <div className="text-xs text-slate-500">{product.name}</div>
                                                </div>
                                                <div className="flex gap-3 text-xs shrink-0">
                                                    <span className="font-medium text-violet-600">PRM <span className="font-bold">{product.prm ?? 0}</span></span>
                                                    <span className="font-medium text-blue-600">STD <span className="font-bold">{product.std ?? 0}</span></span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showReviewDesignDrop && !searchingReviewDesigns && reviewDesignResults.length === 0 && reviewDesignQuery.trim() && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white p-3 text-sm text-gray-500 shadow">
                                    No designs listed
                                </div>
                            )}
                        </div>
                        ) : null}
                        {changingReviewDesign ? (
                            <p className="text-xs text-slate-500">Updating requested design...</p>
                        ) : null}
                        {/* <p className="text-xs text-slate-500">
                            Current order: <span className="font-medium text-slate-700">{selectedRes?.design}</span>
                        </p> */}
                    </div>
                    
                    
                    <div className="flex flex-col gap-4">
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <Label htmlFor="qty" className="text-left">Requested <span className={`font-bold ${selectedRes?.stockType == 'prm' ? 'text-violet-600' : 'text-blue-600'} uppercase`}>{selectedRes?.stockType}</span> Quantity</Label>
                            {selectedRes?.stockType === 'prm' && selectedReviewDesign?.design === selectedRes?.design ? (() => {
                                const requestedQty = Number(selectedRes?.requestedQty || 0);
                                const availableStd = Number(selectedReviewDesign?.std || 0);
                                const canChangeToStd = availableStd >= requestedQty;
                                return (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 shrink-0 border-blue-200 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                        disabled={!canChangeToStd || resLoading}
                                        onClick={changePrmOrderToStd}
                                        title={`STD stock: ${availableStd} available / ${requestedQty} required`}
                                        aria-label={`Change this PRM order to STD. ${availableStd} STD available and ${requestedQty} required`}
                                    >
                                        {resLoading ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Change to STD
                                    </Button>
                                );
                            })() : selectedRes?.stockType === 'std' && selectedReviewDesign?.design === selectedRes?.design ? (() => {
                                const requestedQty = Number(selectedRes?.requestedQty || 0);
                                const availablePrm = designBatches.reduce((sum, batch) => (
                                    sum + (batch.status === 'Active' ? Number(batch.availableQty || 0) : 0)
                                ), 0);
                                const canChangeToPrm = !loadingDesignBatches && availablePrm >= requestedQty;
                                return (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 shrink-0 border-violet-200 text-xs text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                                        disabled={!canChangeToPrm || resLoading}
                                        onClick={changeStdOrderToPrm}
                                        title={loadingDesignBatches ? 'Checking PRM batch stock' : `PRM batch stock: ${availablePrm} available / ${requestedQty} required`}
                                        aria-label={loadingDesignBatches ? 'Checking PRM batch stock' : `Change this STD order to PRM. ${availablePrm} PRM available and ${requestedQty} required`}
                                    >
                                        {resLoading || loadingDesignBatches ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Change to PRM
                                    </Button>
                                );
                            })() : null}
                        </div>
                        {(() => {
                            const isStdType   = selectedRes?.stockType === 'std';
                            const hasExistingStockReservation = ['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status);
                            const availableStd = Number(selectedReviewDesign?.std || 0) + (hasExistingStockReservation ? Number(selectedRes?.approvedQty || 0) : 0);
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
                                        const isReApproval = ['Approved', 'Modified', 'SaleOrder'].includes(selectedRes?.status);
                                        const effectiveAvailable = batchAvailable + (isReApproval ? Number(selectedRes?.approvedQty || 0) : 0);
                                        return (
                                            <p className="text-xs -mt-2 text-slate-500">
                                                {loadingDesignBatches
                                                    ? 'Checking batch availability...'
                                                    : <>Available PRM from batches: <span className="font-medium text-violet-600">{effectiveAvailable}</span>{isReApproval ? ' (incl. this order’s reservation)' : ''}{selectedRes?.status === 'SaleOrder' ? ' • full quantity required' : ' • excess moves to production'}</>}
                                            </p>
                                        );
                                    })()}
                                </>
                            );
                        })()}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="review-order-notes">Notes</Label>
                            <span className="text-xs text-slate-500">Saved with your next action</span>
                        </div>
                        <Textarea
                            id="review-order-notes"
                            value={orderNotes}
                            onChange={(event) => setOrderNotes(event.target.value)}
                            placeholder="Add context for this order item"
                            disabled={resLoading}
                            className="min-h-[88px] resize-y"
                        />
                    </div>

                    {selectedRes?.stockType === 'prm' ? (
                    <div className="rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900">PRM batches</span>
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
                                        onClick={() => {
                                            setBatchSequence([]);
                                            setBatchQtyById({});
                                        }}
                                    >
                                        Clear order
                                    </Button>
                                ) : null}
                                {batchSequence.length > 0 ? (() => {
                                    // running total of what the selected batches can supply vs the qty being approved
                                    const selectedSum = batchSequence.reduce((sum, id) => sum + Number(batchQtyById[id] || 0), 0);
                                    const qty = Number(approvalQty || 0);
                                    return (
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${selectedSum >= qty ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            Selected {Math.min(selectedSum, qty)} / {qty}{selectedSum < qty && selectedRes?.status !== 'SaleOrder' ? ` • ${qty - selectedSum} to production` : ''}
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
                                        const selectedQty = Number(batchQtyById[batch.id] || 0);
                                        const otherSelectedQty = batchSequence
                                            .filter((id) => String(id) !== String(batch.id))
                                            .reduce((sum, id) => sum + Number(batchQtyById[id] || 0), 0);
                                        const maxSelectedQty = Math.min(effectiveQty, Math.max(0, Number(approvalQty || 0) - otherSelectedQty));
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
                                                {seqIndex >= 0 ? (
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={maxSelectedQty}
                                                        value={selectedQty}
                                                        onClick={(event) => event.stopPropagation()}
                                                        onChange={(event) => updateBatchAllocationQty(batch, event.target.value)}
                                                        className="h-8 w-24 text-right text-xs"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                    {batchSequence.length > 0
                                        ? selectedRes?.status === 'SaleOrder'
                                            ? 'The selected batches must cover the full Sale Order quantity.'
                                            : 'Stock will be taken from the numbered batches in order; any remainder moves to production.'
                                        : selectedRes?.status === 'SaleOrder'
                                            ? 'Save changes allocates the full Sale Order quantity from available PRM batches. Production is unavailable.'
                                            : 'Tap batches to set the allocation order. Auto Approve lets you allocate available stock or send the full quantity to production.'}
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
                    <div className="rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Action history</div>
                                <div className="text-xs text-slate-500">Recorded updates for this order item</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setShowOrderActionHistory((prev) => !prev)}>
                                {showOrderActionHistory ? 'Hide History' : 'View History'}
                            </Button>
                        </div>
                        {showOrderActionHistory ? (
                            <div className="h-56 overflow-y-auto border-t border-slate-200">
                                {loadingOrderActionHistory ? (
                                    <div className="flex h-full items-center justify-center text-sm text-slate-500"><SpinnerGap className="mr-2 h-4 w-4 animate-spin" />Loading history...</div>
                                ) : orderActionHistoryError ? (
                                    <div className="flex h-full items-center justify-center text-sm text-red-600">{orderActionHistoryError}</div>
                                ) : orderActionHistory.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No actions recorded yet</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {orderActionHistory.map((entry) => (
                                            <div key={entry.id} className="px-3 py-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">{entry.actorName || 'Unknown user'}</div>
                                                        <div className="mt-0.5 text-xs text-slate-500">{entry.actionType || 'Updated'}</div>
                                                    </div>
                                                    <div className="shrink-0 text-right text-xs text-slate-500">{entry.actionOn ? dayjs(entry.actionOn).format('DD MMM YYYY, hh:mm A') : '-'}</div>
                                                </div>
                                                {entry.actionNotes ? <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">{entry.actionNotes}</p> : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    {isEditingOrderItem ? (
                        <>
                            {['Submitted', 'InReview'].includes(selectedRes?.status) ? (
                                <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={resLoading}>Close</Button>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditingOrderItem(false)} disabled={resLoading}>Cancel Edit</Button>
                            )}

                            {selectedRes?.status === 'SaleOrder' ? (
                                <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => submitApproval('SaleOrder')} disabled={resLoading}>
                                    {resLoading ? <SpinnerGap className="mr-2 animate-spin" /> : null}
                                    Save changes
                                </Button>
                            ) : selectedRes?.stockType === 'prm' && batchSequence.length === 0 ? (
                                <Button className="bg-green-600 text-white" onClick={() => setShowAutoApproveChoice(true)} disabled={resLoading}>
                                    {resLoading ? <SpinnerGap className="mr-2 animate-spin" /> : null}
                                    Auto Approve
                                </Button>
                            ) : (
                                <Button className="bg-green-600 text-white" onClick={() => submitApproval(getApprovalStatus())} disabled={resLoading}>
                                    {resLoading ? <SpinnerGap className="mr-2 animate-spin" /> : null}
                                    Approve
                                </Button>
                            )}
                                   
                           
                            
                            
                            
                            
                            {selectedRes?.status !== 'SaleOrder' ? (
                                <>
                                    <Button className="bg-red-600 text-white" onClick={() => submitApproval('Rejected')} disabled={resLoading}>
                                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                        Reject
                                    </Button>
                                    <Button className="bg-gray-600 text-white" onClick={() => submitApproval('OutOfStock')} disabled={resLoading}>
                                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                        Mark Out of Stock
                                    </Button>
                                </>
                            ) : null}
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
                <AlertDialog open={showAutoApproveChoice} onOpenChange={setShowAutoApproveChoice}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Choose PRM approval method</AlertDialogTitle>
                            <AlertDialogDescription>
                                Allocate available stock uses PRM batches, starting with the smallest suitable batch. Send to production reserves no batches and routes the full requested quantity to production.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:space-x-0">
                            <AlertDialogCancel disabled={resLoading}>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-amber-600 text-white hover:bg-amber-700" onClick={() => submitApproval(getApprovalStatus(), 'production')} disabled={resLoading}>
                                Send to production
                            </AlertDialogAction>
                            <AlertDialogAction className="bg-green-600 text-white hover:bg-green-700" onClick={() => submitApproval(getApprovalStatus())} disabled={resLoading}>
                                Allocate stock
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
          </Dialog>
          
    </div>
);
}
