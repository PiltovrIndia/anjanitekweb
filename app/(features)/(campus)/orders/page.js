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
import { ArrowDown, CheckIcon, ChevronDown, ChevronRight, HeartIcon, Pencil, Search, Trash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet'
import { Label } from '@/app/components/ui/label'
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import StockOrderDialog from '../products/stock_order_dialog'

const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'

const ORDER_PAGE_SIZE = 20;


// get tags for the products
const getTags = async (pass) => 
    fetch("/api/v2/products/"+pass+"/U0/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get products
const getProducts = async (pass, role, offset) => 
fetch("/api/v2/products/"+pass+"/U1.1/"+role+"/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update product
const upateProduct = async (pass, productId, tags, size) => 
fetch("/api/v2/products/"+pass+"/U5/"+productId+"/"+tags+"/"+size, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update product name
const updateProductName = async (pass, productId, name) => 
fetch("/api/v2/products/"+pass+"/U10/"+productId+"/"+encodeURIComponent(name), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// design of the day
const designOfTheDay = async (pass, productData) => 
fetch("/api/v2/products/"+pass+"/U8/"+productData, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// create product
const createProductAPI = async (pass, productData) => 
fetch("/api/v2/products/"+pass+"/U7/"+productData, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// upload invoices data
const updateUploadStockData = async (pass, items1, adminId) => 
    
    fetch("/api/v2/products/"+pass+"/U0/"+adminId+"/-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(items1),
    });


// get orders
const getOrdersAPI = async (pass, type, offset, role, userId, sortBy, isProduction) => 
fetch("/api/v2/orders/"+pass+"/U0.1/"+type+"/"+offset+"/"+role+"/"+userId+"/"+sortBy+"/"+isProduction, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get design grouped orders
const getDesignOrdersAPI = async (pass, type, page, role, userId, sortBy) =>
fetch("/api/v2/orders/"+pass+"/U00.1/"+type+"/"+page+"/"+role+"/"+userId+"/"+sortBy, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get design group specific order items
const getDesignOrderItemsAPI = async (pass, design, stockType = 'All') =>
fetch("/api/v2/orders/"+pass+"/U00.2/"+encodeURIComponent(design)+"/"+stockType, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get report specific listing
const getOrdersByDateAPI = async (pass, type, fromDate, toDate, isProduction) =>
fetch("/api/v2/orders/"+pass+"/report/"+type+"/"+encodeURIComponent(fromDate)+","+encodeURIComponent(toDate)+"/"+isProduction, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


const getOrdersByDesignAPI = async (pass, design, signal) =>
fetch("/api/v2/orders/"+pass+"/U2/"+encodeURIComponent(design), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    signal,
});

// update order status
const updateOrderStatusAPI = async (pass, path, orderId, qty, userId, actionDate, design) => 
fetch("/api/v2/orders/"+pass+"/"+path+"/"+orderId+"/"+qty+"/"+userId+"/"+actionDate+"/"+encodeURIComponent(design), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// pass state variable and the method to update state variable
export default function Orders() {
    
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
    const [isProduction, setisProduction] = useState('All');
    const [activeOrdersTab, setActiveOrdersTab] = useState('Orders');
    const [downloadingOrders, setDownloadingOrders] = useState(false);
    const [resOffset, setResOffset] = useState(0);
    const [resStatus, setResStatus] = useState('All');
    const [resSearch, setResSearch] = useState('');
    const [downloadFromDate, setDownloadFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [downloadToDate, setDownloadToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showDownloadPopover, setShowDownloadPopover] = useState(false);
    const [stockOrderOpen, setStockOrderOpen] = useState(false);
    const [expandedCartGroups, setExpandedCartGroups] = useState({});
    const [designOrders, setDesignOrders] = useState([]);
    const [totalDesignOrders, setTotalDesignOrders] = useState(0);
    const [designOrdersPage, setDesignOrdersPage] = useState(1);
    const [designOrdersLoading, setDesignOrdersLoading] = useState(false);
    const [expandedDesignRows, setExpandedDesignRows] = useState({});
    const [designOrderItems, setDesignOrderItems] = useState({});
    const [loadingDesignOrderItems, setLoadingDesignOrderItems] = useState({});

    // Approval Dialog State
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [approvalQty, setApprovalQty] = useState('');
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
    const reviewDesignTimer = useRef(null)
    const reviewDesignRef = useRef(null)

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
                totalDesigns: rows.length,
                totalRequestedQty: rows.reduce((sum, item) => sum + Number(item.requestedQty || 0), 0),
                totalApprovedQty: rows.reduce((sum, item) => sum + Number(item.approvedQty || 0), 0),
                totalProductionQty: rows.reduce((sum, item) => sum + Number(item.productionQty || 0), 0),
                requestedQty: rows.reduce((sum, item) => sum + Number(item.requestedQty || 0), 0),
                approvedQty: rows.reduce((sum, item) => sum + Number(item.approvedQty || 0), 0),
                waitlistItems: rows.filter((item) => hasWaitlistPosition(item.waitlistPosition)).length,
                stockTypes: [...new Set(rows.map((item) => item.stockType).filter(Boolean))],
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
        return 'bg-gray-100 text-gray-700'
    }

    function getOrderStatusLabel(status) {
        return status === 'Submitted' ? 'Pending' : status || '-'
    }

    async function getOrders(val, offsetR, userObj = user, productionFilter = isProduction){
        
        
        setResLoading(true);
        // setOffset(offset+0); // update the offset for every call
        

        if (!userObj?.role || !userObj?.id) {
            setResLoading(false);
            return;
        }

        try {    
            const result  = await getOrdersAPI(process.env.NEXT_PUBLIC_API_PASS,val, offsetR, userObj['role'], userObj['id'], 'createdOn', productionFilter) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(Array.isArray(queryResult.data) && queryResult.data.length > 0){
                    
                    setOrders(normalizeCartOrders(queryResult.data));
                    setTotalOrders(queryResult.totalOrders ?? queryResult.count ?? queryResult.data.length);
                        
                        setResLoading(false);
                    // }
                    
                }
                else {
                    setOrders([]);
                    setTotalOrders(0);
                }

                setResLoading(false);
            }
            else if(queryResult.status == 401) {
                
                setResLoading(false);
            }
            else if(queryResult.status == 404 || queryResult.status == 201) {
                setOrders([]);
                setResLoading(false);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
            setResLoading(false);
        }
    }

    async function getDesignOrders(val, page = 1, userObj = user) {
        setDesignOrdersLoading(true);

        if (!userObj?.role || !userObj?.id) {
            setDesignOrdersLoading(false);
            return;
        }

        try {
            const result = await getDesignOrdersAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                val,
                page,
                userObj.role,
                userObj.id,
                'createdOn'
            );
            const queryResult = await result.json();

            if (queryResult.status === 200 && Array.isArray(queryResult.data)) {
                setDesignOrders(queryResult.data);
                setTotalDesignOrders(queryResult.totalDesigns ?? queryResult.data.length);
                setDesignOrdersPage(queryResult.page ?? page);
            } else {
                setDesignOrders([]);
                setTotalDesignOrders(0);
            }
        } catch (e) {
            toast({ description: "Issue loading designs, try again later!" });
        } finally {
            setDesignOrdersLoading(false);
        }
    }

    async function getDesignOrderItems(design, stockType = 'All') {
        if (!design || designOrderItems[design]) {
            return;
        }

        setLoadingDesignOrderItems((prev) => ({
            ...prev,
            [design]: true,
        }));

        try {
            const result = await getDesignOrderItemsAPI(process.env.NEXT_PUBLIC_API_PASS, design, stockType);
            const queryResult = await result.json();

            setDesignOrderItems((prev) => ({
                ...prev,
                [design]: queryResult.status === 200 && Array.isArray(queryResult.data)
                    ? queryResult.data.map((item) => ({
                        ...item,
                        waitlistPosition: item.waitlistPosition ?? item.waitlistSequence,
                        isProduction: Number(item.productionQty || 0) > 0 ? 1 : 0,
                    }))
                    : [],
            }));
        } catch (e) {
            toast({ description: "Issue loading design orders, try again later!" });
            setDesignOrderItems((prev) => ({
                ...prev,
                [design]: [],
            }));
        } finally {
            setLoadingDesignOrderItems((prev) => ({
                ...prev,
                [design]: false,
            }));
        }
    }

    async function downloadOrdersNow() {
        const statusToDownload = resStatus || 'All';

        setDownloadingOrders(true);
        setShowDownloadPopover(false);

        try {
            const result = await getOrdersByDateAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                statusToDownload,
                downloadFromDate,
                downloadToDate,
                isProduction
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
                        mobile: order.mobile,
                        mapTo: order.mapTo,
                    }))
                    : [order]
            ));

            if (allOrders.length === 0) {
                toast({ description: 'No orders available to download' });
                return;
            }

            const orderRows = allOrders.map((res) => ({
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
                approvedQty: Number(res.approvedQty || 0),
                stockType: res.stockType || '-',
                waitlistPosition: res.waitlistPosition || '-',
                size: res.size || '-',
                status: res.status || '-',
                submittedOn: res.createdOn ? dayjs(res.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss') : '-',
                approvedOn: res.approvedOn ? dayjs(res.approvedOn).subtract(5, 'hours').subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss') : '-',
                modifiedOn: res.modifiedOn ? dayjs(res.modifiedOn).subtract(5, 'hours').subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss') : '-',
                requestType: res.isProduction == 1 || Number(res.productionQty || 0) > 0 ? 'Production' : 'Current',
            }));

            const worksheet = xlsx.utils.json_to_sheet(orderRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
            xlsx.writeFile(workbook, `orders${isProduction != 'All' ? (isProduction == 1 ? '_Production' : '_Current') : ''}_${statusToDownload.toLowerCase()}_${downloadFromDate}_to_${downloadToDate}.xlsx`);

            toast({ description: `Downloaded ${orderRows.length} orders` });
        } catch (e) {
            toast({ description: e.message || 'Failed to download orders' });
        } finally {
            setDownloadingOrders(false);
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
        setSelectedRes(res);
        setApprovalQty(res.requestedQty); // Default to requested quantity
        setSelectedReviewDesign(res)
        setReviewDesignQuery('')
        setReviewDesignResults([])
        setShowReviewDesignDrop(false)
        setDesignOrderHistory([])
        setDesignOrderHistoryError('')
        setShowDesignOrderHistory(false)
        setIsEditingOrderItem(res.status === 'Submitted')
        
            setIsActionDialogOpen(true);
        
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
                const res = await fetch(`/api/v2/products/${process.env.NEXT_PUBLIC_API_PASS}/U4/${encodeURIComponent(value)}/0`, {
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

    const selectReviewDesign = (product) => {
        setSelectedReviewDesign(product)
        setReviewDesignQuery('')
        setReviewDesignResults([])
        setShowReviewDesignDrop(false)
        setShowDesignOrderHistory(false)
        setDesignOrderHistory([])
        setDesignOrderHistoryError('')
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

        setResLoading(true);
        try {
            var path = '';
            // check if the status is already approved, modified or rejected, if yes then update the record with modified status with modifiedOn value
            if(selectedRes.status.toLowerCase() == 'submitted' || selectedRes.status.toLowerCase() == 'approved' || selectedRes.status.toLowerCase() == 'modified' || selectedRes.status.toLowerCase() == 'rejected'){
                path = 'U0.2';
            }
            else if(selectedRes.status.toLowerCase() == 'rejected'){
                path = 'U0.3';
            }
            console.log("/api/v2/orders/"+process.env.NEXT_PUBLIC_API_PASS+"/"+path+"/"+selectedRes.id+"/"+approvalQty+"/"+selectedRes.userId+"/"+dayjs().format('YYYY-MM-DD HH:mm:ss')+"/"+encodeURIComponent(selectedReviewDesign.design));
            
            const result = await updateOrderStatusAPI(
                process.env.NEXT_PUBLIC_API_PASS, path,
                selectedRes.id, 
                approvalQty,
                selectedRes.userId,
                dayjs().format('YYYY-MM-DD HH:mm:ss'), // Set expiry to 7 days from now
                selectedReviewDesign.design,
            );
            const queryResult = await result.json();
            if (queryResult.status === 200) {
                toast({ description: `Order marked as ${status.toLowerCase()}!` });
                setIsActionDialogOpen(false);
                getOrders(resStatus, resOffset, user); // Refresh list
            } else {
                toast({ description: queryResult.message || `Failed to ${status.toLowerCase()}` });
            }
        } catch (e) {
            toast({ description: "Error submitting approval: " + e.message });
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

    function toggleDesignRow(design) {
        const nextExpanded = !expandedDesignRows[design];

        setExpandedDesignRows((prev) => ({
            ...prev,
            [design]: nextExpanded,
        }));

        if (nextExpanded) {
            getDesignOrderItems(design);
        }
    }

    const filteredOrders = useMemo(() => {
        return orders.filter((group) => {
            if (!resSearch.trim()) return true
            const q = resSearch.trim().toLowerCase()
            const rows = Array.isArray(group.rows) ? group.rows : []

            return (
                (group.dealer || '').toLowerCase().includes(q) ||
                (group.orderedBy || '').toLowerCase().includes(q) ||
                String(group.userId || '').toLowerCase().includes(q) ||
                String(group.cartId || '').toLowerCase().includes(q) ||
                rows.some((res) => (
                    (res.design || '').toLowerCase().includes(q) ||
                    (res.name || '').toLowerCase().includes(q) ||
                    (res.status || '').toLowerCase().includes(q)
                ))
            )
        })
    }, [orders, resSearch])

    const groupedOrders = useMemo(() => {
        return filteredOrders
    }, [filteredOrders])

    const filteredDesignOrders = useMemo(() => {
        if (!resSearch.trim()) {
            return designOrders
        }

        const q = resSearch.trim().toLowerCase()
        return designOrders.filter((designOrder) => (
            (designOrder.design || '').toLowerCase().includes(q) ||
            (designOrder.name || '').toLowerCase().includes(q) ||
            String(designOrder.productId || '').toLowerCase().includes(q) ||
            (designOrder.designOrderStatus || '').toLowerCase().includes(q)
        ))
    }, [designOrders, resSearch])

    function handleStatusChange(val) {
        setResStatus(val);
        setResOffset(0);
        setDesignOrdersPage(1);
        setExpandedCartGroups({});
        setExpandedDesignRows({});
        setDesignOrderItems({});
        setLoadingDesignOrderItems({});

        if (activeOrdersTab === 'Designs') {
            getDesignOrders(val, 1, user);
        } else {
            getOrders(val, 0, user);
        }
    }

    function handleOrdersTabChange(val) {
        setActiveOrdersTab(val);
        setResSearch('');

        if (val === 'Designs' && designOrders.length === 0) {
            getDesignOrders(resStatus, designOrdersPage, user);
        }
    }

    // const percentage = getPercentageCompletion((res) => {
    //     return res.totalApprovedQty == 0 ? 0.0 : res.totalApprovedQty / res.totalRequestedQty
    // })
    
    
return (

    // <div className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
    //       <div className='flex flex-row gap-2 items-center py-4' >
    //           <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
             
    <div className={`${inter.className} flex flex-col min-h-screen w-full overflow-auto`} style={{ gap: '8px' }}>
        <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Orders</h2>
              
              <Toaster />
          </div>

          
          
            <div className="w-full">
                <div className="flex flex-row justify-between items-center py-4">
                    
                    <span className='text-sm text-slate-500'>{activeOrdersTab === 'Designs' ? totalDesignOrders : totalOrders} {activeOrdersTab === 'Designs' ? 'Designs' : 'Orders'} found</span>
                    <div className="flex flex-row items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={activeOrdersTab === 'Designs' ? 'Search design or product' : 'Search cart, dealer, or design'}
                                value={resSearch}
                                onChange={e => setResSearch(e.target.value)}
                                className="pl-8 w-56"
                            />
                        </div>
                        <Select value={resStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Submitted">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Modified">Modified</SelectItem>
                                <SelectItem value="OutOfStock">OutofStock</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setStockOrderOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock Order
                            </Button>
                        <Popover open={showDownloadPopover} onOpenChange={setShowDownloadPopover}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" disabled={downloadingOrders}>
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    {downloadingOrders ? 'Downloading...' : 'Download Orders'}
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
                </div>

                <Tabs
                    value={activeOrdersTab}
                    onValueChange={handleOrdersTabChange}
                    className="mb-4"
                >
                    <TabsList className="grid w-full max-w-[260px] grid-cols-2 rounded-2xl bg-slate-100 p-1 shadow-sm">
                        <TabsTrigger
                            value="Orders"
                            className="rounded-xl text-sm font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            Orders
                        </TabsTrigger>
                        <TabsTrigger
                            value="Designs"
                            className="rounded-xl text-sm font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            Designs
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {activeOrdersTab === 'Orders' ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ordered by</TableHead>
                                <TableHead>Dealer</TableHead>
                                <TableHead>Design</TableHead>
                                <TableHead className="text-right">Requested</TableHead>
                                <TableHead className="text-right">Approved</TableHead>
                                <TableHead className="text-right">Production</TableHead>
                                <TableHead className="text-right">%</TableHead>
                                <TableHead className="text-right">Waitlist</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Request Type</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resLoading ? (
                                <TableRow><TableCell colSpan={12} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : groupedOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={12} className="text-center py-10">No orders found</TableCell></TableRow>
                            ) : groupedOrders.map((group) => {
                                const isExpanded = Boolean(expandedCartGroups[group.cartId])
                                const hasMultipleRows = group.rows.length > 0

                                const percentage1 = ((group.totalApprovedQty === 0 ? 0 : group.totalApprovedQty / group.totalRequestedQty) * 100)
                                const percentage = percentage1 > 0 ? percentage1.toFixed(1) : 0
                                const textColor = percentage < 50 ? 'text-red-500' : 'text-green-600'; // Red if < 50%, Green otherwise


                                return (
                                    <React.Fragment key={group.cartId}>
                                        <TableRow
                                            className={`text-sm transition-colors ${hasMultipleRows ? 'cursor-pointer bg-slate-50/80 hover:bg-slate-100/80' : 'bg-slate-50/40 hover:bg-slate-100/60'}`}
                                            onClick={hasMultipleRows ? () => toggleCartGroup(group.cartId) : undefined}
                                        >
                                            <TableCell className="py-4">
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
                                                        <span className='text-xs text-slate-500'>{group.first.userId}</span>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                #{group.first.cartId || group.cartId}

                                                            </span>
                                                            {/* <span className={textColor}>{percentage}%</span> */}
                                                            {/* <span className="text-[11px] text-slate-500">
                                                                {group.rows.length} item{group.rows.length > 1 ? 's' : ''}
                                                            </span> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className='font-medium'>{group.first.dealer}</span><br/>
                                                <span className='text-xs text-slate-500'>{group.first.dealerId}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-800">
                                                    {`${group.totalDesigns || group.rows.length} design${Number(group.totalDesigns || group.rows.length) === 1 ? '' : 's'}`}
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
                                            <TableCell className="text-right font-mono"><span className={textColor}>{percentage}%</span></TableCell>
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
                                                        <span key={`${group.cartId}-${status.label}`} className={`px-2 py-1 rounded-full text-xs ${status.label === 'Approved' || status.label === 'Fully Approved' ? 'bg-green-100 text-green-700' : status.label === 'Rejected' ? 'bg-red-100 text-red-700' : status.label === 'Modified' || status.label === 'Action Required' || status.label === 'Partially Approved' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {status.label == 'Submitted' ? 'Pending' : status.label} {status.count > 1 ? `(${status.count})` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {group.requestTypes.map((requestType) => (
                                                        <span key={`${group.cartId}-${requestType}`} className={`px-2 py-1 rounded-full text-xs font-medium ${requestType === 'Production' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {requestType}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className='font-mono text-xs text-slate-500'>{dayjs(group.first.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A')}</TableCell>
                                            <TableCell className="text-right">
                                                {hasMultipleRows ? (
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {isExpanded ? 'Hide items' : 'View items'}
                                                    </span>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        {group.first.status === 'Submitted' && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="secondary" className="bg-blue-600 shadow-md text-white hover:bg-blue-700" onClick={() => handleUpdateStatus(group.first)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                            </div>
                                                        )}
                                                        {(group.first.status === 'Approved' || group.first.status === 'Modified' || group.first.status === 'Rejected') && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(group.first)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {hasMultipleRows && isExpanded && group.rows.map((res) => (
                                            
                                            <TableRow key={`${group.cartId}-${res.id}`} className="bg-white text-sm hover:bg-slate-50/80">
                                                <TableCell className="py-4 pl-16">
                                                    <span className='font-medium'>{res.orderedBy}</span><br/>
                                                    <span className='text-xs text-slate-500'>{res.userId}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className='font-medium'>{res.dealer}</span><br/>
                                                    <span className='text-xs text-slate-500'>{res.dealerId}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {res.design}<br/>
                                                    <span className='text-xs text-slate-500'>{res.name}</span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{res.requestedQty}</TableCell>
                                                <TableCell className="text-right font-mono">{res.approvedQty}</TableCell>
                                                <TableCell className="text-right font-mono">{res.productionQty}</TableCell>
                                                <TableCell className="text-right font-mono"><span className={((res.approvedQty === 0 ? 0 : res.approvedQty / res.requestedQty) * 100).toFixed(1) > 50 ? 'text-green-600' : 'text-red-500'}>{((res.approvedQty === 0 ? 0 : res.approvedQty / res.requestedQty) * 100).toFixed(1)}%</span></TableCell>
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
                                                    <span className={`px-2 py-1 rounded-full text-xs ${res.status === 'Approved' ? 'bg-green-100 text-green-700' : res.status === 'Rejected' ? 'bg-red-100 text-red-700' : res.status === 'Modified' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {res.status} {(res.status === 'Approved' || res.status == 'Rejected') ? '- '+dayjs(res.approvedOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY') : (res.status === 'Modified') ? '- '+dayjs(res.modifiedOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY') : ''}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(res.isProduction == 1) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {(res.isProduction == 1) ? 'Production' : 'Current'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='font-mono text-xs text-slate-500'>{dayjs(res.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {res.status === 'Submitted' && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="outline" className="bg-blue-600 shadow-md text-white hover:bg-blue-700 hover:text-white" onClick={() => handleUpdateStatus(res)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                            </div>
                                                        )}
                                                        {(res.status === 'Approved' || res.status === 'Modified' || res.status === 'Rejected') && (
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(res)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                            </div>
                                                        )}
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
                ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Design</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead className="text-right">Requested</TableHead>
                                <TableHead className="text-right">Approved</TableHead>
                                <TableHead className="text-right">Production</TableHead>
                                <TableHead className="text-right">Waitlist</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Latest Order</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {designOrdersLoading ? (
                                <TableRow><TableCell colSpan={10} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : filteredDesignOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={10} className="text-center py-10">No designs found</TableCell></TableRow>
                            ) : filteredDesignOrders.map((designOrder) => {
                                const isExpanded = Boolean(expandedDesignRows[designOrder.design])
                                const childRows = designOrderItems[designOrder.design] || []
                                const isLoadingItems = Boolean(loadingDesignOrderItems[designOrder.design])

                                return (
                                    <React.Fragment key={designOrder.design}>
                                        <TableRow
                                            className="cursor-pointer bg-slate-50/80 text-sm transition-colors hover:bg-slate-100/80"
                                            onClick={() => toggleDesignRow(designOrder.design)}
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-1 text-slate-500">
                                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-900">{designOrder.design}</span><br/>
                                                        <span className="text-xs text-slate-500">{designOrder.size || '-'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="font-medium">{designOrder.name || '-'}</span><br/>
                                                <span className="text-xs text-slate-500">{designOrder.productId || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{designOrder.totalOrders}</TableCell>
                                            <TableCell className="text-right font-mono">{designOrder.totalRequestedQty}</TableCell>
                                            <TableCell className="text-right font-mono">{designOrder.totalApprovedQty}</TableCell>
                                            <TableCell className="text-right font-mono">{designOrder.totalProductionQty}</TableCell>
                                            <TableCell className="text-right">
                                                {Number(designOrder.waitlistItems || 0) > 0 ? (
                                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                        {designOrder.waitlistItems}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-slate-400">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">PRM {Number(designOrder.prm || 0)}</span>
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">STD {Number(designOrder.std || 0)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`rounded-full px-2 py-1 text-xs ${designOrder.designOrderStatus === 'Fully Approved' ? 'bg-green-100 text-green-700' : designOrder.designOrderStatus === 'Rejected' ? 'bg-red-100 text-red-700' : designOrder.designOrderStatus === 'Action Required' || designOrder.designOrderStatus === 'Partially Approved' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {getOrderStatusLabel(designOrder.designOrderStatus)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {designOrder.latestCreatedOn ? dayjs(designOrder.latestCreatedOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A') : '-'}
                                            </TableCell>
                                        </TableRow>

                                        {isExpanded && (
                                            isLoadingItems ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="bg-white py-6 text-center text-sm text-slate-500">
                                                        <SpinnerGap className="mr-2 inline-block h-4 w-4 animate-spin" />
                                                        Loading order items...
                                                    </TableCell>
                                                </TableRow>
                                            ) : childRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="bg-white py-6 text-center text-sm text-slate-500">
                                                        No order items found
                                                    </TableCell>
                                                </TableRow>
                                            ) : childRows.map((res) => (
                                                <TableRow key={`${designOrder.design}-${res.id}`} className="bg-white text-sm hover:bg-slate-50/80">
                                                    <TableCell className="py-4 pl-16">
                                                        <span className="font-medium">{res.orderedBy || '-'}</span><br/>
                                                        <span className="text-xs text-slate-500">{res.userId || '-'}</span>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <span className="font-medium">{res.dealer || '-'}</span><br/>
                                                        <span className="text-xs text-slate-500">{res.dealerId || '-'}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">{res.requestedQty}</TableCell>
                                                    <TableCell className="text-right font-mono">{res.approvedQty}</TableCell>
                                                    <TableCell className="text-right font-mono">{res.productionQty}</TableCell>
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
                                                        <span className={`rounded-full px-2 py-1 text-xs ${getOrderStatusClass(res.status)}`}>
                                                            {getOrderStatusLabel(res.status)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-500">
                                                        {res.createdOn ? dayjs(res.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {res.status === 'Submitted' && (
                                                                <Button size="sm" variant="outline" className="bg-blue-600 shadow-md text-white hover:bg-blue-700 hover:text-white" onClick={() => handleUpdateStatus(res)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                            )}
                                                            {(res.status === 'Approved' || res.status === 'Modified' || res.status === 'Rejected') && (
                                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(res)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
                )}
                
                <div className="flex items-center justify-end space-x-2 py-4">
                    {activeOrdersTab === 'Designs' ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const next = Math.max(1, designOrdersPage - 1);
                                    setDesignOrdersPage(next);
                                    getDesignOrders(resStatus, next, user);
                                }}
                                disabled={designOrdersPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const next = designOrdersPage + 1;
                                    setDesignOrdersPage(next);
                                    getDesignOrders(resStatus, next, user);
                                }}
                                disabled={(designOrdersPage * ORDER_PAGE_SIZE) >= totalDesignOrders}
                            >
                                Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => { const next = Math.max(0, resOffset - ORDER_PAGE_SIZE); setResOffset(next); getOrders(resStatus, next, user); }} disabled={resOffset === 0}>Previous</Button>
                            <Button variant="outline" size="sm" onClick={() => { const next = resOffset + ORDER_PAGE_SIZE; setResOffset(next); getOrders(resStatus, next, user); }} disabled={resOffset + orders.length >= totalOrders}>Next</Button>
                        </>
                    )}
                </div>
            </div>
          
          <StockOrderDialog
              isOpen={stockOrderOpen}
              onClose={() => setStockOrderOpen(false)}
              pass={process.env.NEXT_PUBLIC_API_PASS}
              role={user?.role}
              onSuccess={(msg) => { toast({ description: msg }); getOrders(resStatus, resOffset, user); }}
          />

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
                                <div>{selectedRes?.createdOn ? dayjs(selectedRes.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A') : '-'}</div>
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
                            <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                                <div className="text-slate-500">Production</div>
                                <div className="font-mono font-medium text-slate-900">{Number(selectedRes?.productionQty || 0)}</div>
                            </div>
                        </div>
                    </div>
                    ) : null}

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
                                    {reviewDesignResults.map((product) => (
                                        <div
                                            key={product.productId}
                                            className="cursor-pointer px-3 py-2.5 hover:bg-gray-50"
                                            onMouseDown={() => selectReviewDesign(product)}
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
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showReviewDesignDrop && !searchingReviewDesigns && reviewDesignResults.length === 0 && reviewDesignQuery.trim() && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white p-3 text-sm text-gray-500 shadow">
                                    No designs found
                                </div>
                            )}
                        </div>
                        {/* <p className="text-xs text-slate-500">
                            Current order: <span className="font-medium text-slate-700">{selectedRes?.design}</span>
                        </p> */}
                    </div>
                    
                    
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="qty" className="text-left mt-4">Requested <span className={`font-bold ${selectedReviewDesign?.stockType == 'prm' ? 'text-violet-600' : 'text-blue-600'} uppercase`}>{selectedReviewDesign?.stockType}</span> Quantity</Label>
                        {/* <Label htmlFor="qty" className="text-right">Requested Quantity</Label> */}
                        {/* {(selectedRes?.status === 'Submitted' || selectedRes?.status === 'Approved') ? */}
                            <Input
                                id="qty"
                                type="number"
                                value={approvalQty}
                                onChange={(e) => setApprovalQty(e.target.value)}
                                className="col-span-3"
                            />
                            {/* :
                            <Label htmlFor="qty" className="text-right">{approvalQty}</Label>    
                        } */}
                    </div>
                    </>
                    ) : null}

                    {(!isEditingOrderItem || selectedRes?.status === 'Submitted') ? (
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
                                    <span className="text-xs font-medium text-slate-600">Orders found</span>
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
                                            No other orders found
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
                                                                {order.userId || '-'} to {order.dealerId || '-'} • {order.createdOn ? dayjs(order.createdOn).subtract(5, 'hours').subtract(30, 'minutes').format('DD/MM/YYYY hh:mm A') : '-'}
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
                                                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                                                            <div className="text-slate-500">Production</div>
                                                            <div className="font-mono font-medium text-slate-900">{Number(order.productionQty || 0)}</div>
                                                        </div>
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
                            {selectedRes?.status === 'Submitted' ? (
                                <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={resLoading}>Close</Button>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditingOrderItem(false)} disabled={resLoading}>Cancel Edit</Button>
                            )}

                            {(selectedReviewDesign?.stockType == 'std' && selectedReviewDesign?.std === 0) ?  
                            null :
                            
                                (<Button className="bg-green-600 text-white" onClick={() => submitApproval((selectedRes?.status === 'Approved' || selectedRes?.status === 'Modified' || selectedRes?.status === 'Rejected') ? 'Modified' :'Approved')} disabled={resLoading}>
                                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                        Approve
                                    </Button>)
                                }
                           
                            
                            
                            
                            
                                <Button className="bg-red-600 text-white" onClick={() => submitApproval('Rejected')} disabled={resLoading}>
                                    {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                    Reject
                                </Button>

                            
                                <Button className="bg-gray-600 text-white" onClick={() => submitApproval('OutOfStock')} disabled={resLoading}>
                                    {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                                    Mark Out of Stock
                                </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Close</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => { setShowDesignOrderHistory(false); setIsEditingOrderItem(true); }}>
                                {selectedRes?.status === 'Submitted' ? 'Review Order' : 'Edit Order'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
          </Dialog>
          
    </div>
);
}
