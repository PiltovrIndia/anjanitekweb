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


// get reservations
const getReservationsAPI = async (pass, type, offset, isProduction) => 
fetch("/api/v2/reservations/"+pass+"/U0.1/"+type+"/"+offset+"/"+isProduction, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getReservationsByDateAPI = async (pass, type, fromDate, toDate, isProduction) =>
fetch("/api/v2/reservations/"+pass+"/report/"+type+"/"+encodeURIComponent(fromDate)+","+encodeURIComponent(toDate)+"/"+isProduction, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update reservation status
const updateReservationStatusAPI = async (pass, path, reservationId, status, qty, userId, actionDate, design) => 
fetch("/api/v2/reservations/"+pass+"/"+path+"/"+reservationId+"/"+status+"/"+qty+"/"+userId+"/"+actionDate+"/"+encodeURIComponent(design), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// pass state variable and the method to update state variable
export default function Reservations() {
    
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

    // Reservations State
    const [totalReservations, setTotalReservations] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [isProduction, setisProduction] = useState('All');
    const [downloadingReservations, setDownloadingReservations] = useState(false);
    const [resOffset, setResOffset] = useState(0);
    const [resStatus, setResStatus] = useState('All');
    const [resSearch, setResSearch] = useState('');
    const [downloadFromDate, setDownloadFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [downloadToDate, setDownloadToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showDownloadPopover, setShowDownloadPopover] = useState(false);
    const [stockOrderOpen, setStockOrderOpen] = useState(false);
    const [expandedCartGroups, setExpandedCartGroups] = useState({});

    // Approval Dialog State
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [approvalQty, setApprovalQty] = useState('');
    const [reviewDesignQuery, setReviewDesignQuery] = useState('')
    const [reviewDesignResults, setReviewDesignResults] = useState([])
    const [searchingReviewDesigns, setSearchingReviewDesigns] = useState(false)
    const [showReviewDesignDrop, setShowReviewDesignDrop] = useState(false)
    const [selectedReviewDesign, setSelectedReviewDesign] = useState(null)
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
    const [offset, setOffset] = useState(0);
    const [offsetReservations, setOffsetReservations] = useState(0);
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
                getReservations(resStatus, 0); // fetch reservations on load with default status and offset
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
        }
    }, [isActionDialogOpen])

    // useEffect(() => {
    //         if (user && user.id) {
    //             getReservations(); // Fetch reservations on load
    //         }
    //     }, [user]);

    
    // fetch the reservations
    async function getReservations(val, offsetR, productionFilter = isProduction){
        
        
        setResLoading(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getReservationsAPI(process.env.NEXT_PUBLIC_API_PASS,val, offsetR, productionFilter) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setReservations(queryResult.data);
                    setTotalReservations(queryResult.count);
                        
                        setResLoading(false);
                    // }
                    
                }
                else {
                    setReservations([]);
                    setTotalReservations(0);
                }

                setResLoading(false);
            }
            else if(queryResult.status == 401) {
                
                setResLoading(false);
            }
            else if(queryResult.status == 404 || queryResult.status == 201) {
                setReservations([]);
                setResLoading(false);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
    }

    async function downloadReservationsNow() {
        const statusToDownload = resStatus || 'All';

        setDownloadingReservations(true);
        setShowDownloadPopover(false);

        try {
            const result = await getReservationsByDateAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                statusToDownload,
                downloadFromDate,
                downloadToDate,
                isProduction
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Failed to download reservations');
            }

            const allReservations = Array.isArray(queryResult.data) ? queryResult.data : [];

            if (allReservations.length === 0) {
                toast({ description: 'No reservations available to download' });
                return;
            }

            const reservationRows = allReservations.map((res) => ({
                // reservationId: res.id,
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
                status: res.status || '-',
                submittedOn: res.createdOn ? dayjs(res.createdOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                approvedOn: res.approvedOn ? dayjs(res.approvedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                modifiedOn: res.modifiedOn ? dayjs(res.modifiedOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                requestType: res.isProduction == 1 ? 'Production' : 'Current',
            }));

            const worksheet = xlsx.utils.json_to_sheet(reservationRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Reservations');
            xlsx.writeFile(workbook, `reservations${isProduction != 'All' ? (isProduction == 1 ? '_Production' : '_Current') : ''}_${statusToDownload.toLowerCase()}_${downloadFromDate}_to_${downloadToDate}.xlsx`);

            toast({ description: `Downloaded ${reservationRows.length} reservations` });
        } catch (e) {
            toast({ description: e.message || 'Failed to download reservations' });
        } finally {
            setDownloadingReservations(false);
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
    }

    async function submitApproval(status) {
        if (!approvalQty || isNaN(approvalQty)) {
            toast({ description: "Please enter a valid quantity" });
            return;
        }

        if (!selectedReviewDesign?.design) {
            toast({ description: "Please choose a design before updating this reservation" });
            return;
        }

        setResLoading(true);
        try {
            var path = 'U3';
            // check if the status is already approved, modified or rejected, if yes then update the record with modified status with modifiedOn value
            if(selectedRes.status.toLowerCase() == 'approved' || selectedRes.status.toLowerCase() == 'modified' || selectedRes.status.toLowerCase() == 'rejected'){
                path = 'U3.1';
            }
            const result = await updateReservationStatusAPI(
                process.env.NEXT_PUBLIC_API_PASS, path,
                selectedRes.id, 
                status, 
                approvalQty,
                selectedRes.userId,
                dayjs().format('YYYY-MM-DD HH:mm:ss'), // Set expiry to 7 days from now
                selectedReviewDesign.design,
            );
            const queryResult = await result.json();
            if (queryResult.status === 200) {
                toast({ description: `Reservation ${status.toLowerCase()} successfully` });
                setIsActionDialogOpen(false);
                getReservations(resStatus, resOffset); // Refresh list
            } else {
                toast({ description: queryResult.message || `Failed to ${status.toLowerCase()}` });
            }
        } catch (e) {
            toast({ description: "Error submitting approval" });
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

    const filteredReservations = useMemo(() => {
        return reservations.filter((res) => {
            if (!resSearch.trim()) return true
            const q = resSearch.trim().toLowerCase()
            return (
                (res.dealer || '').toLowerCase().includes(q) ||
                (res.orderedBy || '').toLowerCase().includes(q) ||
                String(res.userId || '').toLowerCase().includes(q) ||
                (res.design || '').toLowerCase().includes(q) ||
                String(res.cartId || '').toLowerCase().includes(q)
            )
        })
    }, [reservations, resSearch])

    const groupedReservations = useMemo(() => {
        const groups = []
        const groupMap = new Map()

        filteredReservations.forEach((reservation) => {
            const groupKey = reservation.cartId || `single-${reservation.id}`
            if (!groupMap.has(groupKey)) {
                const nextGroup = {
                    cartId: groupKey,
                    rows: [],
                }
                groupMap.set(groupKey, nextGroup)
                groups.push(nextGroup)
            }
            groupMap.get(groupKey).rows.push(reservation)
        })

        return groups.map((group) => {
            const first = group.rows[0]
            const requestedQty = group.rows.reduce((sum, item) => sum + Number(item.requestedQty || 0), 0)
            const approvedQty = group.rows.reduce((sum, item) => sum + Number(item.approvedQty || 0), 0)
            const requestTypes = [...new Set(group.rows.map((item) => item.isProduction == 1 ? 'Production' : 'Current'))]
            const stockTypes = [...new Set(group.rows.map((item) => item.stockType).filter(Boolean))]
            const statusCounts = group.rows.reduce((counts, item) => {
                if (!item.status) {
                    return counts
                }

                counts.set(item.status, (counts.get(item.status) || 0) + 1)
                return counts
            }, new Map())
            const statuses = Array.from(statusCounts.entries()).map(([label, count]) => ({
                label,
                count,
            }))

            return {
                ...group,
                first,
                requestedQty,
                approvedQty,
                requestTypes,
                stockTypes,
                statuses,
            }
        })
    }, [filteredReservations])
    
    
return (

    // <div className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
    //       <div className='flex flex-row gap-2 items-center py-4' >
    //           <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
             
    <div className={`${inter.className} flex flex-col min-h-screen w-full overflow-auto`} style={{ gap: '8px' }}>
        <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Stock Reservations</h2>
              
              <Toaster />
          </div>

          
          
            <div className="w-full">
                <div className="flex flex-row justify-between items-center py-4">
                    
                    <span className='text-sm text-slate-500'>{totalReservations} Reservations found</span>
                    <div className="flex flex-row items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search dealer ID or design"
                                value={resSearch}
                                onChange={e => setResSearch(e.target.value)}
                                className="pl-8 w-56"
                            />
                        </div>
                        <Select value={resStatus} onValueChange={(val) => { setResStatus(val); getReservations(val, 0); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Submitted">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Modified">Modified</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setStockOrderOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock Order
                            </Button>
                        <Popover open={showDownloadPopover} onOpenChange={setShowDownloadPopover}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" disabled={downloadingReservations}>
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    {downloadingReservations ? 'Downloading...' : 'Download Reservations'}
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
                                        onClick={downloadReservationsNow}
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
                    value={isProduction}
                    onValueChange={(val) => {
                        setisProduction(val)
                        setResOffset(0)
                        getReservations(resStatus, 0, val)
                    }}
                    className="mb-4"
                >
                    <TabsList className="grid w-full max-w-[360px] grid-cols-3 rounded-2xl bg-slate-100 p-1 shadow-sm">
                        <TabsTrigger
                            value="All"
                            className="rounded-xl text-sm font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="1"
                            className="rounded-xl text-sm font-semibold text-slate-600 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-sm"
                        >
                            Production
                        </TabsTrigger>
                        <TabsTrigger
                            value="0"
                            className="rounded-xl text-sm font-semibold text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                        >
                            Current
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ordered by</TableHead>
                                <TableHead>Dealer</TableHead>
                                <TableHead>Design</TableHead>
                                <TableHead className="text-right">Requested</TableHead>
                                <TableHead className="text-right">Approved</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Request Type</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resLoading ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : groupedReservations.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-10">No reservations found</TableCell></TableRow>
                            ) : groupedReservations.map((group) => {
                                const isExpanded = Boolean(expandedCartGroups[group.cartId])
                                const hasMultipleRows = group.rows.length > 1

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
                                                        {/* <div className="mt-2 flex flex-wrap items-center gap-2"> */}
                                                            {/* <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                Cart {group.first.cartId || group.cartId}
                                                            </span> */}
                                                            {/* <span className="text-[11px] text-slate-500">
                                                                {group.rows.length} item{group.rows.length > 1 ? 's' : ''}
                                                            </span> */}
                                                        {/* </div> */}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className='font-medium'>{group.first.dealer}</span><br/>
                                                <span className='text-xs text-slate-500'>{group.first.dealerId}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-800">
                                                    {hasMultipleRows ? `${group.rows.length} designs` : group.first.design}
                                                </span><br/>
                                                {/* <span className='text-xs text-slate-500'>
                                                    {hasMultipleRows
                                                        ? group.rows.length
                                                        : group.first.name}
                                                </span> */}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{group.requestedQty}</TableCell>
                                            <TableCell className="text-right font-mono">{group.approvedQty}</TableCell>
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
                                                        <span key={`${group.cartId}-${status.label}`} className={`px-2 py-1 rounded-full text-xs ${status.label === 'Approved' ? 'bg-green-100 text-green-700' : status.label === 'Rejected' ? 'bg-red-100 text-red-700' : status.label === 'Modified' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
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
                                            <TableRow key={res.id} className="bg-white text-sm hover:bg-slate-50/80">
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
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${res.stockType === 'prm' ? 'bg-purple-100 text-purple-700' : res.stockType === 'std' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {res.stockType}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${res.status === 'Approved' ? 'bg-green-100 text-green-700' : res.status === 'Rejected' ? 'bg-red-100 text-red-700' : res.status === 'Modified' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {res.status} {(res.status === 'Approved' || res.status == 'Rejected') ? '- '+dayjs(res.approvedOn).format('DD/MM/YYYY') : (res.status === 'Modified') ? '- '+dayjs(res.modifiedOn).format('DD/MM/YYYY') : ''}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(res.isProduction == 1) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {(res.isProduction == 1) ? 'Production' : 'Current'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='font-mono text-xs text-slate-500'>{dayjs(res.createdOn).format('DD/MM/YYYY hh:mm A')}</TableCell>
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
                
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => { const next = Math.max(0, resOffset - 10); setResOffset(next); getReservations(resStatus, next); }} disabled={resOffset === 0}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => { const next = resOffset + 10; setResOffset(next); getReservations(resStatus, next); }} disabled={reservations.length < 10}>Next</Button>
                </div>
            </div>
          
          <StockOrderDialog
              isOpen={stockOrderOpen}
              onClose={() => setStockOrderOpen(false)}
              pass={process.env.NEXT_PUBLIC_API_PASS}
              role={user?.role}
              onSuccess={(msg) => { toast({ description: msg }); getReservations(resStatus, resOffset); }}
          />

          {/* Approval Confirmation Dialog */}
          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Review Reservation</DialogTitle>
                    <DialogDescription>
                        for <b>{selectedRes?.dealer}</b>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div className="space-y-2" ref={reviewDesignRef}>
                        <Label>Requested Design: <span className="font-bold text-black uppercase">{selectedReviewDesign?.stockType}</span></Label>
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
                        <p className="text-xs text-slate-500">
                            Current reservation: <span className="font-medium text-slate-700">{selectedRes?.design}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="qty" className="text-right">Requested Quantity</Label>
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
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
                    <Button className="bg-green-600 text-white" onClick={() => submitApproval((selectedRes?.status === 'Approved' || selectedRes?.status === 'Modified' || selectedRes?.status === 'Rejected') ? 'Modified' :'Approved')} disabled={resLoading}>
                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                        Approve
                    </Button>
                    <Button className="bg-red-600 text-white" onClick={() => submitApproval('Rejected')} disabled={resLoading}>
                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                        Reject
                    </Button>
                </div>
            </DialogContent>
          </Dialog>
          
    </div>
);
}

