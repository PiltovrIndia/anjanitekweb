'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt, CirclesFour, CircleDashed, CheckCircle, CheckSquare, CalendarBlank, Calendar, FileXls, FilePdf, Tag, GridFour } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
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
import { ArrowDown, CheckIcon, HeartIcon, Pencil, Search, Trash } from 'lucide-react'
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
const getReservationsAPI = async (pass, type, offset) => 
fetch("/api/v2/reservations/"+pass+"/U0/"+type+"/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getReservationsByDateAPI = async (pass, type, fromDate, toDate) =>
fetch("/api/v2/reservations/"+pass+"/report/"+type+"/"+encodeURIComponent(fromDate)+","+encodeURIComponent(toDate), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update reservation status
const updateReservationStatusAPI = async (pass, path, reservationId, status, qty, userId, actionDate) => 
fetch("/api/v2/reservations/"+pass+"/"+path+"/"+reservationId+"/"+status+"/"+qty+"/"+userId+"/"+actionDate, {
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
    const [downloadingReservations, setDownloadingReservations] = useState(false);
    const [resOffset, setResOffset] = useState(0);
    const [resStatus, setResStatus] = useState('All');
    const [resSearch, setResSearch] = useState('');
    const [downloadFromDate, setDownloadFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [downloadToDate, setDownloadToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showDownloadPopover, setShowDownloadPopover] = useState(false);

    // Approval Dialog State
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [approvalQty, setApprovalQty] = useState('');

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

    // useEffect(() => {
    //         if (user && user.id) {
    //             getReservations(); // Fetch reservations on load
    //         }
    //     }, [user]);

    
    // fetch the reservations
    async function getReservations(val, offsetR){
        
        
        setResLoading(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getReservationsAPI(process.env.NEXT_PUBLIC_API_PASS,val, offsetR) 
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
console.log(`${process.env.NEXT_PUBLIC_API_PASS}/report/${statusToDownload}/${downloadFromDate},${downloadToDate}`);

        try {
            const result = await getReservationsByDateAPI(
                process.env.NEXT_PUBLIC_API_PASS,
                statusToDownload,
                downloadFromDate,
                downloadToDate
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
                requestType: res.isProduction == 1 ? 'Production request' : 'Reserved',
            }));

            const worksheet = xlsx.utils.json_to_sheet(reservationRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Reservations');
            xlsx.writeFile(workbook, `reservations_${statusToDownload.toLowerCase()}_${downloadFromDate}_to_${downloadToDate}.xlsx`);

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
        
            setIsActionDialogOpen(true);
        
    }

    async function submitApproval(status) {
        if (!approvalQty || isNaN(approvalQty)) {
            toast({ description: "Please enter a valid quantity" });
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
                dayjs().format('YYYY-MM-DD HH:mm:ss') // Set expiry to 7 days from now
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

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
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
                            ) : reservations.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-10">No reservations found</TableCell></TableRow>
                            ) : reservations
                            .filter(res => {
                                if (!resSearch.trim()) return true
                                const q = resSearch.trim().toLowerCase()
                                return (
                                    (res.dealer || '').toLowerCase().includes(q) ||
                                    String(res.userId || '').toLowerCase().includes(q) ||
                                    (res.design || '').toLowerCase().includes(q)
                                )
                            })
                            .map((res) => (
                                <TableRow key={res.id} className="hover:bg-gray-50 text-sm">
                                    <TableCell className="py-4">
                                        <span className='font-medium  '>{res.dealer}</span><br/>
                                        <span className='text-xs text-slate-500'>{res.userId}</span>
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
                                            {(res.isProduction == 1) ? 'Production request' : 'Reserved'}
                                        </span>
                                    </TableCell>
                                    <TableCell className='font-mono'>{dayjs(res.createdOn).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {res.status === 'Submitted' && (
                                                <div className='flex flex-row items-center gap-2'>
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleUpdateStatus(res)}><CheckIcon className="mr-2 h-4 w-4" />Review</Button>
                                                {/* <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => handleUpdateStatus(res)}>Reject</Button> */}
                                                </div>
                                            )}
                                            {(res.status === 'Approved' || res.status === 'Modified' || res.status === 'Rejected') && (
                                                <div className='flex flex-row items-center gap-2'>
                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600" onClick={() => handleUpdateStatus(res)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                                {/* <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => handleUpdateStatus(res)}>Reject</Button> */}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
                
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => { const next = Math.max(0, resOffset - 10); setResOffset(next); getReservations(resStatus, next); }} disabled={resOffset === 0}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => { const next = resOffset + 10; setResOffset(next); getReservations(resStatus, next); }} disabled={reservations.length < 10}>Next</Button>
                </div>
            </div>
          
          {/* Approval Confirmation Dialog */}
          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Approve Reservation</DialogTitle>
                    <DialogDescription>
                        Confirm the quantity to approve for <b>{selectedRes?.design}</b> requested by <b>{selectedRes?.userId}</b>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="qty" className="text-right">Quantity</Label>
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

