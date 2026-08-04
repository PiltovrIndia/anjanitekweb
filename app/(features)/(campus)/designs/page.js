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
import { OperationProgress } from '@/app/components/operation-progress'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { ArrowDown, ArrowUp, ArrowUpDown, CheckIcon, HeartIcon, Loader2, Pencil, ScrollText, Search, Trash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet'
import { Label } from '@/app/components/ui/label'
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import DesignOrdersDialog from './design_orders_sheet'

const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'

const normalizeSizeTagValue = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s*mm\s*$/, '')
    .replace(/\s+/g, '');


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
fetch("/api/v2/designs/"+pass+"/U1.1/"+role+"/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update product
const upateProduct = async (pass, productId, tags, size) => 
fetch("/api/v2/designs/"+pass+"/U5/"+productId+"/"+tags+"/"+size, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// update product name
const updateProductName = async (pass, productId, name) => 
fetch("/api/v2/designs/"+pass+"/U10/"+productId+"/"+encodeURIComponent(name), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// soft-delete a product
const deleteProductAPI = async (pass, productId) =>
fetch("/api/v2/designs/"+pass+"/U12/"+productId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// design of the day
const designOfTheDay = async (pass, productData) =>
fetch("/api/v2/designs/"+pass+"/U8/"+productData, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// create product
const createProductAPI = async (pass, productData) => 
fetch("/api/v2/designs/"+pass+"/U7/"+productData, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// upload invoices data
const updateUploadStockData = async (pass, items1, adminId) =>

    fetch("/api/v2/designs/"+pass+"/U0/"+adminId+"/-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(items1),
    });

// remove stock in bulk — same payload shape as the upload, quantities are deducted
const removeStockDataAPI = async (pass, items1, adminId) =>

    fetch("/api/v2/designs/"+pass+"/U0.1/"+adminId+"/-", {
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
fetch("/api/v2/reservations/"+pass+"/U0/"+type+"/0?fromDate="+encodeURIComponent(fromDate)+"&toDate="+encodeURIComponent(toDate), {
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
export default function Products() {
    
    const { toast } = useToast();
    const router = useRouter();

    
    const [groupedTags, setGroupedTags] = useState([]);
    const [tagsList, setTags] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [file, setFile] = useState(null); 
        
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ordersSheetProduct, setOrdersSheetProduct] = useState(null); // design whose orders sheet is open
    const [batchesProduct, setBatchesProduct] = useState(null); // design whose stock batches are open
    const [designBatches, setDesignBatches] = useState([]);
    const [loadingDesignBatches, setLoadingDesignBatches] = useState(false);
    const [designBatchesError, setDesignBatchesError] = useState('');
    const [showEmptyBatches, setShowEmptyBatches] = useState(false);
    const [deletingDesign, setDeletingDesign] = useState(false);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [newDesignFile, setNewDesignFile] = useState(null);
    const [newDesignType, setNewDesignType] = useState('1');
    const [newDesignRows, setNewDesignRows] = useState([]);
    const [newDesignUploadError, setNewDesignUploadError] = useState('');
    const [downloadingDesigns, setDownloadingDesigns] = useState(false);
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
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);

    useEffect(() => {
            if (user && user.id) {
                getProductTags();
                getAllProducts();
                getReservations(); // Fetch reservations on load
            }
        }, [user]);

    // Load the prm stock batches for the design whose Active Batches count was clicked
    useEffect(() => {
        const design = batchesProduct?.design;
        if (!design) {
            setDesignBatches([]);
            setLoadingDesignBatches(false);
            setDesignBatchesError('');
            setShowEmptyBatches(false);
            return;
        }

        const controller = new AbortController();
        setLoadingDesignBatches(true);
        setDesignBatchesError('');
        setShowEmptyBatches(false);

        fetch(`/api/v2/designs/${process.env.NEXT_PUBLIC_API_PASS}/U11/${encodeURIComponent(design)}`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
        })
        .then(r => r.json())
        .then(data => {
            // U11 returns 201 with an empty list when the design has no batches
            setDesignBatches(data.status === 200 && Array.isArray(data.data) ? data.data : []);
            if (data.status !== 200 && data.status !== 201) {
                setDesignBatchesError(data.message || 'Could not load batches');
            }
        })
        .catch(err => {
            if (err.name !== 'AbortError') setDesignBatchesError('Could not load batches');
        })
        .finally(() => {
            if (!controller.signal.aborted) setLoadingDesignBatches(false);
        });

        return () => controller.abort();
    }, [batchesProduct?.design]);

    async function getProductTags(){
        
        setSearchingTags(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            
            const result  = await getTags(process.env.NEXT_PUBLIC_API_PASS)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    const result = queryResult.data;
                    
                    if (result && result.length > 0) {
                            setTags(result);
                            
                            var groupedTags1 =
                            result.reduce((acc, tag) => {
                                if (!acc[tag.type]) {
                                  acc[tag.type] = [];
                                }
                                acc[tag.type].push(tag);
                                return acc;
                              }, {});

                              setGroupedTags(groupedTags1);

                      } else {
                        console.log("No data found.");
                      }
                   
                    
                }
                
                
            }

            setSearchingTags(false);
            
        }
        catch (e){
            
            toast({
                description: "Issue loading tags, try again later!",
              });
        }
}


    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllProducts(){
        
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getProducts(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, offset) 
            const queryResult = await result.json() // get data

            // console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setAllProducts(queryResult.data);
                    setSearchedProducts(queryResult.data);
                        
                    // Filter products based on selected tags
                    // (selectedTags.length > 0)
                    //     ? setFilteredProducts(queryResult.data.filter((product) =>
                    //         selectedTags.every((tagId) => product.tags.split(",").includes(tagId.toString()))
                    //     ))
                    //     : 
                        setFilteredProducts(queryResult.data);
                        
                        setSearching(false);
                    // }
                    
                }
                else {
                    setAllProducts([]);
                }

                setSearching(false);
            }
            else if(queryResult.status == 401) {
                
                setSearching(false);
            }
            else if(queryResult.status == 404 || queryResult.status == 201) {
                setAllProducts([]);
                setSearching(false);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
    }

    async function downloadAllDesigns() {
        setDownloadingDesigns(true);

        try {
            const result = await getProducts(
                process.env.NEXT_PUBLIC_API_PASS,
                user?.role || 'superadmin',
                0
            );
            const queryResult = await result.json();

            if (queryResult.status !== 200) {
                throw new Error(queryResult.message || 'Failed to fetch designs for download.');
            }

            const designs = Array.isArray(queryResult.data) ? queryResult.data : [];
            if (designs.length === 0) {
                toast({ description: 'No designs are available to download.' });
                return;
            }

            const exportRows = designs.map((product) => ({
                design: product.design || '-',
                name: product.name || '-',
                size: product.size || '-',
                designType: Number(product.designType) === 1 ? 'ATL' : 'VCL',
                // tags: product.tags || '-',
                premiumStock: Number(product.prm || 0),
                standardStock: Number(product.std || 0),
                activeBatches: Number(product.activeBatches || 0),
                orders: Number(product.orderCount || 0),
                latestOrder: product.latestOrderOn ? dayjs(product.latestOrderOn).format('YYYY-MM-DD HH:mm:ss') : '-',
                // createdOn: product.createdOn ? dayjs(product.createdOn).format('YYYY-MM-DD HH:mm:ss') : '-',
            }));
            const worksheet = xlsx.utils.json_to_sheet(exportRows);
            worksheet['!cols'] = [
                { wch: 18 }, { wch: 32 }, { wch: 14 }, { wch: 12 }, { wch: 24 },
                { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 21 }, { wch: 21 },
            ];

            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Designs');
            xlsx.writeFile(workbook, `designs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);

            toast({ description: `${exportRows.length} designs downloaded successfully.` });
        } catch (error) {
            console.error('Error downloading designs:', error);
            toast({ description: error.message || 'Failed to download designs.' });
        } finally {
            setDownloadingDesigns(false);
        }
    }

    function resetNewDesignUpload() {
        setNewDesignFile(null);
        setNewDesignType('1');
        setNewDesignRows([]);
        setNewDesignUploadError('');
    }

    function handleNewDesignDialogChange(open) {
        if (!open && !creatingProduct) {
            resetNewDesignUpload();
        }
        setNewProductOn(open);
    }

    function handleNewDesignFileSelect(event) {
        const selectedFile = event.target.files?.[0];
        setNewDesignFile(selectedFile || null);
        setNewDesignRows([]);
        setNewDesignUploadError('');

        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const workbook = XLSX.read(loadEvent.target.result, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];

                if (!firstSheetName) {
                    throw new Error('The workbook does not contain a sheet.');
                }

                const spreadsheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
                if (spreadsheetRows.length === 0) {
                    throw new Error('The first sheet does not contain any designs.');
                }

                const headers = Object.keys(spreadsheetRows[0]).reduce((result, header) => {
                    result[String(header).trim().toLowerCase()] = header;
                    return result;
                }, {});
                const requiredColumns = ['design', 'name', 'size'];
                const missingColumns = requiredColumns.filter((column) => !headers[column]);

                if (missingColumns.length > 0) {
                    throw new Error(`Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}.`);
                }

                const rows = spreadsheetRows.map((row, index) => ({
                    rowNumber: index + 2,
                    design: String(row[headers.design] ?? '').trim(),
                    name: String(row[headers.name] ?? '').trim(),
                    size: String(row[headers.size] ?? '').trim(),
                })).filter((row) => row.design || row.name || row.size);

                if (rows.length === 0) {
                    throw new Error('The first sheet does not contain any usable design rows.');
                }

                const incompleteRow = rows.find((row) => !row.design || !row.name || !row.size);
                if (incompleteRow) {
                    throw new Error(`Row ${incompleteRow.rowNumber} must include design, name, and size.`);
                }

                const seenDesigns = new Set();
                const duplicateDesign = rows.find((row) => {
                    const key = row.design.toLowerCase();
                    if (seenDesigns.has(key)) return true;
                    seenDesigns.add(key);
                    return false;
                });
                if (duplicateDesign) {
                    throw new Error(`Design ${duplicateDesign.design} appears more than once in the sheet.`);
                }

                const sizeTags = tagsList.filter((tag) => String(tag.type || '').trim().toLowerCase() === 'size');
                if (sizeTags.length === 0) {
                    throw new Error('Size tags have not loaded yet. Please try again shortly.');
                }

                const unmatchedRow = rows.find((row) => !sizeTags.some((tag) => (
                    normalizeSizeTagValue(tag.name) === normalizeSizeTagValue(row.size)
                )));
                if (unmatchedRow) {
                    throw new Error(`Row ${unmatchedRow.rowNumber} has no matching size tag for "${unmatchedRow.size}".`);
                }

                setNewDesignRows(rows.map((row) => ({
                    ...row,
                    tagId: sizeTags.find((tag) => normalizeSizeTagValue(tag.name) === normalizeSizeTagValue(row.size)).tagId,
                })));
            } catch (error) {
                setNewDesignFile(null);
                setNewDesignUploadError(error.message || 'Could not read the workbook.');
            }
        };
        reader.onerror = () => {
            setNewDesignFile(null);
            setNewDesignUploadError('Could not read the selected file.');
        };
        reader.readAsArrayBuffer(selectedFile);
    }

    async function createNewDesigns() {
        if (newDesignRows.length === 0) {
            setNewDesignUploadError('Select a valid spreadsheet before creating designs.');
            return;
        }

        setCreatingProduct(true);
        setNewDesignUploadError('');

        try {
            const response = await fetch(`/api/v2/products/${process.env.NEXT_PUBLIC_API_PASS}/U13`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    designType: Number(newDesignType),
                    products: newDesignRows.map(({ design, name, size, tagId }) => ({ design, name, size, tagId })),
                }),
            });
            const result = await response.json();

            if (result.status !== 200 || !result.success) {
                throw new Error(result.message || 'Could not create designs.');
            }

            toast({ description: `${result.createdCount} design${result.createdCount === 1 ? '' : 's'} created successfully.` });
            resetNewDesignUpload();
            setNewProductOn(false);
            getAllProducts();
        } catch (error) {
            setNewDesignUploadError(error.message || 'Could not create designs.');
        } finally {
            setCreatingProduct(false);
        }
    }
    
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
    
    
    // for invocies upload
    const processStockData = () => handleStockFileUpload('add');

    // for stock removal upload — same excel format, quantities are deducted
    const processStockRemoval = () => handleStockFileUpload('remove');

    const handleStockFileUpload = (mode) => {
        // console.log('Check1');

        if (file) {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, {type: 'binary'});
                
                // print the length of sheets to console
                // console.log("Number of sheets:", workbook.SheetNames.length);

                var totalFlatRows = [];

                for (let index = 0; index < workbook.SheetNames.length; index++) {
                    const element = workbook.SheetNames[index];


                    // const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[element];

                    // Specify date format directly in the read operation
                    const data = XLSX.utils.sheet_to_json(worksheet, {
                        dateNF: 'yyyy-mm-dd hh:mm:ss', // Format date columns
                        raw: false, // Do not use raw values (this ensures that dates are processed)
                    });

                    // keep only DESIGN, QUANTITY, BATCH columns (case-insensitive) and normalize rows:
                    // BATCH = 'STD' marks the row's quantity as std stock, any
                    // other value is the prm batch number for that quantity
                    const allowed = ['DESIGN', 'QUANTITY', 'BATCH'];
                    const filteredRows = data
                        .map(row => {
                            const out = {};
                            Object.keys(row).forEach(k => {
                                const key = String(k).trim().toUpperCase();
                                if (allowed.includes(key)) out[key] = row[k];
                            });
                            return {
                                design: out['DESIGN'] ? String(out['DESIGN']).trim().replace(/-/g, '').replace('ATL', '').trim() : '',
                                qty: out['QUANTITY'] != null && out['QUANTITY'] !== '' && !isNaN(Number(out['QUANTITY'])) ? Number(out['QUANTITY']) : null,
                                batch: out['BATCH'] != null && out['BATCH'] !== '' ? String(out['BATCH']).trim() : '',
                            };
                        })
                        .filter(r => r.design && r.design.length);

                    totalFlatRows = totalFlatRows.concat(filteredRows);
                }

                // group rows by design: a 'STD' batch value adds the row's quantity
                // to the design's std stock (repeated rows are summed — the sheet
                // lists newly produced quantities, so two rows mean two lots);
                // every other batch value is a prm batch with its quantity
                const groupedByDesign = new Map();
                const skippedRows = []; // rows we can't route to std or to a batch
                totalFlatRows.forEach(r => {
                    if (!groupedByDesign.has(r.design)) {
                        groupedByDesign.set(r.design, {
                            design: r.design,
                            std: null,
                            batches: [],
                            createdOn: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        });
                    }
                    const entry = groupedByDesign.get(r.design);

                    if (r.qty == null) {
                        skippedRows.push(`${r.design} (no QUANTITY)`);
                        return;
                    }

                    if (r.batch.toUpperCase() === 'STD') {
                        entry.std = (entry.std == null ? 0 : entry.std) + r.qty;
                    } else if (!r.batch) {
                        // a blank BATCH names neither std nor a premium batch — routing it
                        // by guesswork would move the wrong stock, so flag it instead
                        skippedRows.push(`${r.design} (no BATCH — use STD or a batch number)`);
                    } else {
                        const existing = entry.batches.find(b => b.batch === r.batch);
                        if (existing) existing.qty += r.qty;
                        else entry.batches.push({ batch: r.batch, qty: r.qty });
                    }
                });

                const totalSheetData = Array.from(groupedByDesign.values())
                    .filter(entry => entry.std != null || entry.batches.length > 0);

                if (skippedRows.length > 0) {
                    console.warn('Skipped rows:', skippedRows);
                    toast({ description: `${skippedRows.length} row(s) skipped — ${skippedRows.slice(0, 3).join(', ')}${skippedRows.length > 3 ? ' …' : ''}` });
                }

                if (totalSheetData.length === 0) {
                    toast({ description: 'No usable rows found. Each row needs DESIGN, QUANTITY and BATCH (STD or a batch number).' });
                    return;
                }
                
                // Replace '/' with '***' in the invoiceNo field for each item in the data array
                // const updatedData = data.map(item => {
                //     if (item.design) {
                //         item.design = item.design.replace('-', ' ');
                //     }
                //     return item;
                // });
                // Optionally process amounts to ensure they are decimals with two decimal places
                // const processedData = data.map(item => ({
                //     ...item,
                //     amount: typeof item.amount === 'number' ? parseFloat(item.amount.toFixed(2)) : item.amount,
                // }));
                console.log(totalSheetData);
    
    
                // setItems(data);
                // getInvoiceDataDetails(data);
                uploadStockDetails(totalSheetData, mode);
                // const data = XLSX.utils.sheet_to_json(worksheet);
                // setItems(data);
                // getDataDetails(data);
            };
    
            reader.readAsBinaryString(file);
        } else {
            console.log("Please select a file first.");
        }
    }

    async function uploadStockDetails(items1, mode = 'add') {
        setUploadProgress(true);

        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < items1.length; i += batchSize) {
            batches.push(items1.slice(i, i + batchSize));
        }

        const userId = JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id;
        let totalSucceeded = 0;
        let totalFailed = 0;
        let totalQtyMoved = 0;   // units actually added/removed, so a no-op is visible
        const problems = [];     // per-design reasons a removal did not fully apply
        const totalRows = items1.length;
        let hasError = false;
        let errorMsg = '';

        for (let b = 0; b < batches.length; b++) {
            try {
                const result = mode === 'remove'
                    ? await removeStockDataAPI(
                        process.env.NEXT_PUBLIC_API_PASS,
                        batches[b],
                        userId
                    )
                    : await updateUploadStockData(
                        process.env.NEXT_PUBLIC_API_PASS,
                        batches[b],
                        userId
                    );
                const queryResult = await result.json();
                if (queryResult.status === 200) {
                    const summary = queryResult.data || [];
                    totalSucceeded += summary.filter(r => r.success).length;
                    totalFailed += summary.filter(r => !r.success).length;

                    summary.forEach(entry => {
                        if (mode === 'remove') {
                            totalQtyMoved += Number(entry?.std?.removedQty || 0) + Number(entry?.prm?.removedQty || 0);
                            const shortfall = Number(entry?.std?.shortfall || 0) + Number(entry?.prm?.shortfall || 0);
                            if (entry?.message) problems.push(`${entry.design}: ${entry.message}`);
                            else if (shortfall > 0) problems.push(`${entry.design}: ${shortfall} short${entry?.prm?.notes?.length ? ` (${entry.prm.notes.join(', ')})` : ''}`);
                        } else {
                            totalQtyMoved += Number(entry?.std?.uploadedQty || 0)
                                + (entry?.prm?.uploadedBatches || []).reduce((sum, b) => sum + Number(b.qty || 0), 0);
                            if (!entry?.success && entry?.message) problems.push(`${entry.design}: ${entry.message}`);
                        }
                    });
                } else {
                    hasError = true;
                    errorMsg = queryResult.message || 'Upload failed. Please try again!';
                    break;
                }
            } catch (e) {
                hasError = true;
                errorMsg = 'Network error. Please try again.';
                break;
            }
        }

        setUploadProgress(false);

        if (hasError) {
            toast({ description: errorMsg });
        } else {
            const verb = mode === 'remove' ? 'removed' : 'uploaded';

            // a run that touched nothing used to report success — say so plainly
            if (totalQtyMoved === 0) {
                toast({
                    description: `No stock was ${verb}. ${problems.length > 0 ? problems.slice(0, 3).join(' | ') : 'Check the DESIGN and BATCH values in the sheet.'}`,
                });
            } else {
                const msg = `${totalQtyMoved} units ${verb} across ${totalSucceeded} of ${totalRows} designs`
                    + (totalFailed > 0 ? ` (${totalFailed} not applied)` : '')
                    + '. Refresh to view updated data.';
                toast({ description: msg });

                if (problems.length > 0) {
                    console.warn('Stock ' + verb + ' issues:', problems);
                    toast({ description: `${problems.length} design(s) not fully ${verb}: ${problems.slice(0, 3).join(' | ')}${problems.length > 3 ? ' …' : ''}` });
                }
            }
        }
    }

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
    // toggle column sort: first click sorts ascending, second flips to descending
    function handleSort(key) {
        setSortConfig(prev => prev.key === key
            ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
            : { key, direction: 'asc' });
    }

    const numericSortKeys = ['prm', 'std', 'activeBatches', 'orderCount'];
    const sortedProducts = sortConfig.key
        ? [...filteredProducts].sort((a, b) => {
            let cmp;
            if (sortConfig.key === 'latestOrderOn') {
                // designs without orders always sort last, in both directions
                const av = a.latestOrderOn ? new Date(a.latestOrderOn).getTime() : null;
                const bv = b.latestOrderOn ? new Date(b.latestOrderOn).getTime() : null;
                if (av === null && bv === null) return 0;
                if (av === null) return 1;
                if (bv === null) return -1;
                cmp = av - bv;
            }
            else if (numericSortKeys.includes(sortConfig.key)) {
                cmp = Number(a[sortConfig.key] || 0) - Number(b[sortConfig.key] || 0);
            } else {
                cmp = String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || ''), undefined, { numeric: true });
            }
            return sortConfig.direction === 'asc' ? cmp : -cmp;
        })
        : filteredProducts;

    const sortIcon = (key) => sortConfig.key !== key
        ? <ArrowUpDown className="inline-block ml-1 h-3 w-3 text-slate-400" />
        : sortConfig.direction === 'asc'
            ? <ArrowUp className="inline-block ml-1 h-3 w-3" />
            : <ArrowDown className="inline-block ml-1 h-3 w-3" />;

return (

    // <div className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
    //       <div className='flex flex-row gap-2 items-center py-4' >
    //           <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
             
    <div className={`${inter.className} flex flex-col flex-1 min-h-0 w-full overflow-y-auto`} style={{ gap: '8px' }}>
        <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Designs</h2>

              <Dialog open={newProductOn} onOpenChange={handleNewDesignDialogChange}>
                    <DialogTrigger asChild>
                        <Button size="xs" className="bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase text-sm tracking-wider px-3 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            New Design
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New designs</DialogTitle>
                            <DialogDescription>
                                Upload an Excel file whose first sheet contains the string columns design, name, and size. Each size is matched to its existing size tag, ignoring a trailing mm.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new-design-type">Design type</Label>
                                <Select value={newDesignType} onValueChange={setNewDesignType} disabled={creatingProduct}>
                                    <SelectTrigger id="new-design-type">
                                        <SelectValue placeholder="Select design type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">ATL</SelectItem>
                                        <SelectItem value="2">VCL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="new-design-file">Excel file</Label>
                                    <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
                                        <a href="/design-upload-template.xlsx" download>
                                            <ArrowDown className="mr-1 h-3.5 w-3.5" />
                                            Download template
                                        </a>
                                    </Button>
                                </div>
                                <Input
                                    id="new-design-file"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleNewDesignFileSelect}
                                    disabled={creatingProduct}
                                />
                                {newDesignFile ? <p className="text-xs text-muted-foreground">{newDesignFile.name}</p> : null}
                            </div>

                            {newDesignUploadError ? <p role="alert" className="text-sm text-destructive">{newDesignUploadError}</p> : null}

                            {newDesignRows.length > 0 ? (
                                <div className="overflow-hidden rounded-md border">
                                    <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2 text-sm">
                                        <span className="font-medium">{newDesignRows.length} designs ready to create</span>
                                        <span className="text-muted-foreground">{newDesignType === '1' ? 'ATL' : 'VCL'}</span>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Design</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead className="text-right">Tag ID</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newDesignRows.map((row) => (
                                                    <TableRow key={`${row.design}-${row.rowNumber}`}>
                                                        <TableCell className="font-mono">{row.design}</TableCell>
                                                        <TableCell>{row.name}</TableCell>
                                                        <TableCell>{row.size}</TableCell>
                                                        <TableCell className="text-right font-mono">{row.tagId}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => handleNewDesignDialogChange(false)} disabled={creatingProduct}>Cancel</Button>
                            <Button onClick={createNewDesigns} disabled={creatingProduct || newDesignRows.length === 0}>
                                {creatingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Create designs
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              
              <Sheet>
                    <SheetTrigger asChild>
                        <Button size="xs" className="bg-green-600 hover:bg-green-700 text-white font-mono uppercase text-sm tracking-wider px-3 py-2" >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Stock
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                        <SheetTitle>File upload</SheetTitle>
                        <SheetDescription>
                            Upload only the newly produced quantities — they are added to the existing stock, not replacing it. Make sure you use the correct format. Click Upload now when file is selected.
                        </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <br/>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="picture">Data file</Label>
                                <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
                            </div>
                        </div>
                        <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={processStockData}>Upload now</Button>
                        </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
              
              <Sheet>
                    <SheetTrigger asChild>
                        <Button size="xs" className="bg-orange-600 hover:bg-orange-700 text-white font-mono uppercase text-sm tracking-wider px-3 py-2" >
                            <Plus className="mr-2 h-4 w-4" />
                            Remove Stock
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                        <SheetTitle>File upload</SheetTitle>
                        <SheetDescription>
                            Make sure you use the correct format. Click Upload now when file is selected.
                        </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <br/>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="picture">Data file</Label>
                                <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
                            </div>
                        </div>
                        <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={processStockRemoval}>Upload now</Button>
                        </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>


                {uploadProgress ? <OperationProgress title="Updating stock" description="Applying stock changes. Keep this page open." /> : null}

              <Toaster />
          </div>

          
          {/* <Tabs defaultValue="allProducts" className="">
            <TabsList className="w-fit bg-slate-100 p-1 border border-slate-300">
              <TabsTrigger value="allProducts" className="w-1/2">All Designs</TabsTrigger>
              <TabsTrigger value="reservations" className="w-1/2" onClick={()=>getReservations('All', 0)}>Reservations</TabsTrigger>
            </TabsList>
            <TabsContent value="allProducts" className="w-full"> */}
              {/* Content for all products */}
              <span className='text-sm text-slate-500'>{allProducts.length} Designs in total</span>

                <div className={`${styles.verticalsection} flex-1 flex flex-col`} style={{ width: '100%', gap: '8px', padding: '0px 0px 0px 0px' }}> 
                    {/* <div className='flex items-center justify-between py-4 px-2'>
                        <div className='flex items-center gap-4'></div>
                            <h2 className="text-lg font-semibold items-center">Collections - <span className='text-sm text-slate-500'>{allProducts.length} Designs in total</span></h2>
                        </div>
                        <div className='flex items-center gap-2'></div> */}

                    {!searching ?
                    <div className="mx-auto" style={{width:'100%',height:'100%'}}>
                    {/* <div className="container mx-auto py-10"> */}
                    

            {(filteredProducts.length > 0) ?
            <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row gap-4 items-center'>
                    <Input
                        type="text"
                        placeholder="Search Designs..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="my-2 w-[300px]" // You can adjust width and margin as needed
                    />

                    {(searchQuery.length > 0) ? <div className='pb-2 text-green-700 font-semibold text-xs'>{filteredProducts.length} matching designs</div> 
                    : (selectedSize != 'All') ?
                        <div className='pb-2 text-green-700 font-semibold text-xs'>{filteredProducts.length} {selectedSize} Designs</div>
                        // : <div className='pb-2 text-green-700 font-semibold'>{allInvoicesFiltered.length} Dealers in {selectedSize.split('-')[1]}</div>
                        // }
                    : ''}


                    {searching ?
                    <div className="flex flex-row m-12">    
                        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                        <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                    </div>
                    : ''}
                </div>

                
                <div className='flex flex-row gap-4 items-center'>

                    {/* {(selectedSize == 'All') ?
                        <div className='pb-2 text-slate-700 font-semibold'></div>
                        : <div className='pb-2 text-green-700 font-semibold text-xs'>{allInvoicesFiltered.length} Invoices with {selectedSize} status</div>
                    } */}
                    {filteredProducts.length == 0 ?
                        <div className="flex flex-row m-12">    
                            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                            <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                        </div>
                        :
                        <Select defaultValue={selectedSize} onValueChange={(e)=>filterBySize(e)} >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectItem key={'All'} value={'All'}>All sizes</SelectItem>
                                {Array.from(new Set(filteredProducts.map(product => product.size))).map((size) => (
                                <SelectItem key={size} value={size} >{size}</SelectItem>))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    }
                    
                    <Button variant="outline" onClick={downloadAllDesigns} disabled={downloadingDesigns}>
                        {downloadingDesigns ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                        {downloadingDesigns ? 'Preparing export' : 'Download'}
                    </Button>
                </div>
                {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> InOuting Students</Button> */}
                {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button> */}
            </div>
            : ''    
            }

        {downloadingDesigns ? (
            <div className="my-2 flex justify-end">
                <OperationProgress title="Preparing designs export" description="Collecting every design for your download." />
            </div>
        ) : null}

        <Card>
            {/* <div> */}
                        <Table>
            {/* <Table> */}
                <TableHeader>
                    <TableRow>
                        <TableHead className='cursor-pointer select-none' onClick={() => handleSort('name')}>Design{sortIcon('name')}</TableHead>
                        <TableHead className='cursor-pointer select-none' onClick={() => handleSort('design')}>Design Number{sortIcon('design')}</TableHead>
                        <TableHead className='cursor-pointer select-none' onClick={() => handleSort('size')}>Size{sortIcon('size')}</TableHead>
                        <TableHead className='cursor-pointer select-none text-right' onClick={() => handleSort('std')}>Standard stock{sortIcon('std')}</TableHead>
                        <TableHead className='cursor-pointer select-none text-right' onClick={() => handleSort('prm')}>Premium stock{sortIcon('prm')}</TableHead>
                        <TableHead className='cursor-pointer select-none text-right' onClick={() => handleSort('activeBatches')}>Active Batches{sortIcon('activeBatches')}</TableHead>
                        <TableHead className='cursor-pointer select-none text-right' onClick={() => handleSort('orderCount')}>Orders{sortIcon('orderCount')}</TableHead>
                        <TableHead className='cursor-pointer select-none text-right' onClick={() => handleSort('latestOrderOn')}>Latest Order{sortIcon('latestOrderOn')}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    
                    {(sortedProducts==null) ? '' :
                    sortedProducts.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                {/* <div className='flex flex-row gap-2 items-center text-blue-600 font-semibold py-4 w-max cursor-pointer' onClick={() => handleRowClick(product)}> {product.name} </div> */}


                                <Sheet>
                                                    <form>
                                                        <SheetTrigger asChild>
                                                        <span onClick={() => {
                                                    // pass the full hostel object to the details page via sessionStorage
                                                    try { 
                                                        // setSelectedHostel(hostel); 
                                                        showHostelRooms(hostel);
                                                    } catch (e) {}

                                                }} className='text-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer w-full py-4 font-mono'>{product.name} 
                                                
                                                <span>{(product.favorite == product.design) ? <HeartIcon className='inline-block ml-2 text-red-500' size={14} /> : ''}</span>
                                                </span>
                                                        </SheetTrigger>
                                                        <SheetContent side="right" className="sm:max-w-[825px] overflow-y-auto flex flex-col">
                                                        <SheetHeader>
                                                            <SheetTitle>{product.name}</SheetTitle>
                                                            <SheetDescription>
                                                                <p>
                                                                {/* <span className='text-black font-medium'>{product.design.split(',').length}</span> Rooms • <span className='text-black font-medium'>{hostel.studentCount}</span> Students • <span className='text-black font-medium'>{hostel.admin.split(',').length}</span> Admins */}
                                                                <span className='text-gray-800 font-medium font-mono'>{product.design}</span>
                                                                </p>
                                                            </SheetDescription>
                                                        </SheetHeader>

                                                        {(() => {
                                                            
                                                            // const [selectedTags, setSelectedTags] = useState(product.tags.split(",").map(Number));
                                                            var selectedTags = product.tags.split(",").map(Number);
                                                            var editedName = product.name;

                                                            const handleRemoveTag = (tagId) => {
                                                                selectedTags = selectedTags.filter((id) => id !== tagId);
                                                                product.tags = selectedTags.join(",");
                                                                setTagUpdateKey(prev => prev + 1);
                                                            };

                                                            const handleTagChange = (tagId, type) => {
                                                                selectedTags = selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId];
                                                                const tagsInGroup = groupedTags[type].map(tag => tag.tagId);
                                                                const selectedTagsInGroup = selectedTags.filter(id => tagsInGroup.includes(id));
                                                                
                                                                product.tags = selectedTags.join(",");
                                                                setTagUpdateKey(prev => prev + 1);
                                                            };

                                                            // a function to send an API to save product tags and name
                                                            async function onSave(productId, selectedTags){
                                                                
                                                                setSearching(true);
                                                                
                                                                try {    
                                                                    const result  = await upateProduct(process.env.NEXT_PUBLIC_API_PASS, productId, selectedTags.join(","), product.size) 
                                                                    const queryResult = await result.json() // get data

                                                                    console.log(queryResult);

                                                                    // check if name was changed and update it
                                                                    if(editedName && editedName !== product.name){
                                                                        const nameResult = await updateProductName(process.env.NEXT_PUBLIC_API_PASS, productId, editedName);
                                                                        const nameQueryResult = await nameResult.json();
                                                                        console.log('Name update:', nameQueryResult);
                                                                        if(nameQueryResult.status == 200){
                                                                            // update the product name in the local list
                                                                            product.name = editedName;
                                                                        }
                                                                    }

                                                                    // check for the status
                                                                    if(queryResult.status == 200){

                                                                        toast({
                                                                            description: "Product updated!",
                                                                            })
                                                                            
                                                                            setSearching(false);
                                                                        
                                                                    }
                                                                    else if(queryResult.status == 401 || queryResult.status == 201) {
                                                                        setSearching(false);
                                                                    }
                                                                    else if(queryResult.status == 404) {
                                                                        
                                                                        toast({
                                                                            description: "Facing issues, try again later!",
                                                                          })
                                                                          setSearching(false);
                                                                    }
                                                                }
                                                                catch (e){
                                                                    
                                                                    toast({
                                                                        description: "Issue loading, try again later!",
                                                                      })
                                                                      setSearching(false);
                                                                }
                                                            }
                                                            
                                                            // soft-delete the design and drop it from the listing
                                                            async function onDeleteDesign(){
                                                                if (!window.confirm(`Delete design ${product.design} (${product.name})? It will be removed from the listing.`)) return;

                                                                setDeletingDesign(true);
                                                                try {
                                                                    const result = await deleteProductAPI(process.env.NEXT_PUBLIC_API_PASS, product.productId);
                                                                    const queryResult = await result.json();

                                                                    if(queryResult.status == 200){
                                                                        toast({ description: "Design deleted!" });
                                                                        const drop = (list) => list.filter(p => p.productId !== product.productId);
                                                                        setAllProducts(prev => drop(prev));
                                                                        setSearchedProducts(prev => drop(prev));
                                                                        setFilteredProducts(prev => drop(prev));
                                                                    }
                                                                    else {
                                                                        toast({ description: queryResult.message || "Could not delete, try again later!" });
                                                                    }
                                                                }
                                                                catch (e){
                                                                    toast({ description: "Issue deleting, try again later!" });
                                                                }
                                                                finally {
                                                                    setDeletingDesign(false);
                                                                }
                                                            }

                                                            // a function to send an API to make the product as design of the day
                                                            async function addToDesignOfTheDay(product){
                                                                
                                                                setOfferCreationLoading(true);

                                                                const productData = {
                                                                    design: product.design,
                                                                    description: document.getElementById('description').value,
                                                                    media: product.design,
                                                                    // media: 'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.design+'_F1.jpeg?alt=media',
                                                                    createdOn: dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss')
                                                                };
                                                                
                                                                try {    
                                                                    console.log("/api/v2/designs/"+process.env.NEXT_PUBLIC_API_PASS+"/U8/"+JSON.stringify(productData));
                                                                    
                                                                    const result  = await designOfTheDay(process.env.NEXT_PUBLIC_API_PASS, JSON.stringify(productData)) 
                                                                    const queryResult = await result.json() // get data

                                                                    console.log(queryResult);
                                                                    // check for the status
                                                                    if(queryResult.status == 200){

                                                                        toast({
                                                                            description: "Design of the day created!",
                                                                            })
                                                                            
                                                                            setOfferCreationLoading(false);
                                                                        
                                                                    }
                                                                    else if(queryResult.status == 401 || queryResult.status == 201) {
                                                                        setOfferCreationLoading(false);
                                                                    }
                                                                    else if(queryResult.status == 404) {
                                                                        
                                                                        toast({
                                                                            description: "Facing issues, try again later!",
                                                                          })
                                                                          setOfferCreationLoading(false);
                                                                    }
                                                                }
                                                                catch (e){
                                                                    console.log(e);
                                                                    
                                                                    toast({
                                                                        description: "Issue loading, try again later!",
                                                                      })
                                                                      setOfferCreationLoading(false);
                                                                }
                                                            }

                                                            
                                                            const compressImageAndUpload = async (file) => {
                                                                const options = {
                                                                    maxSizeMB: 0.049, // Slightly less than 50KB
                                                                    maxWidthOrHeight: 1920,
                                                                    useWebWorker: true,
                                                                    fileType: "image/jpeg",
                                                                    initialQuality: 0.9, // Start with high quality
                                                                }
                                                            
                                                                try {
                                                                let compressedFile = await imageCompression(file, options)
                                                            
                                                                // If the file is still too large, gradually reduce quality
                                                                let currentQuality = 0.9
                                                                while (compressedFile.size > 50 * 1024 && currentQuality > 0.5) {
                                                                    currentQuality -= 0.1
                                                                    options.initialQuality = currentQuality
                                                                    compressedFile = await imageCompression(file, options)
                                                                }
                                                            
                                                                if (compressedFile.size <= 50 * 1024) {
                                                            
                                                                    // compressedFile.name = 'ss333_1.jpeg';
                                                                    // compressedFile.name = name;
                                                            
                                                                    // console.log(compressedFile.name);
                                                            
                                                                    setCompressedFileForUpload(compressedFile)
                                                            
                                                                    const metadata = {
                                                                        contentType: 'image/webp'
                                                                    };
                                                                    
                                                                    const storageRef = ref(storage, `uploads/offer_${dayjs(today).format('DD-MM-YYYY-hh-mm')}.jpeg`);
                                                                    const uploadTask = uploadBytesResumable(storageRef, compressedFile);
                                                                    setUploadProgress(1);
                                                                    uploadTask.on('state_changed',
                                                                        (snapshot) => {
                                                                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                                                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                                                        console.log(snapshot.bytesTransferred);
                                                                        
                                                                        setUploadProgress(progress);
                                                                        
                                                                        switch (snapshot.state) {
                                                                            case 'paused':
                                                                            
                                                                            break;
                                                                            case 'running':
                                                                            
                                                                            break;
                                                                        }
                                                                    }, 
                                                                    (error) => {
                                                                        console.log(error.message);
                                                                    switch (error.code) {
                                                                        
                                                                        case 'storage/unauthorized':
                                                                        // User doesn't have permission to access the object
                                                                        break;
                                                                        case 'storage/canceled':
                                                                        // User canceled the upload
                                                                        break;
                                                            
                                                                        // ...
                                                            
                                                                        case 'storage/unknown':
                                                                        // Unknown error occurred, inspect error.serverResponse
                                                                        break;
                                                                    }
                                                                    }, 
                                                                    () => {
                                                                            // Upload completed successfully, now we can get the download URL
                                                                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                                                                setUploadProgress(100);
                                                                            console.log('File available at', downloadURL);
                                                                            setEventMedia(`offer_${dayjs(today).format('DD-MM-YYYY-hh-mm')}.jpeg`);
                                                                        });
                                                                    }
                                                                    );
                                                                } else {
                                                                    setImageError("Image size if larger than expected")
                                                                    // console.log("Unable to compress image below 50KB while maintaining acceptable quality");
                                                                    
                                                                }
                                                                } catch (error) {
                                                                    setImageError("Error compressing image, upload another one")
                                                                    // console.log("Error compressing image:"+error.message)
                                                                }
                                                            }

                                                             async function createOfferEvent(){
                                                                    
                                                                    
                                                                    setOfferCreationLoading(true);
                                                                    // setOffset(offset+0); // update the offset for every call
                                                                    var eventInstance = dayjs(today).format('YYYY-MM-DD hh:mm:ss');
                                                                    try {    
                                                                        console.log("/api/v2/offers/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+eventTitle+"/"+eventDescription+"/"+eventMedia+"/"+ JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id);
                                                                        
                                                                        const result  = await createOfferEventAPI(process.env.NEXT_PUBLIC_API_PASS, eventTitle, eventDescription, eventMedia, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id) 
                                                                        const queryResult = await result.json() // get data
                                                                        console.log(queryResult);
                                                                        
                                                            
                                                                        // check for the status
                                                                        if(queryResult.status == 200){
                                                            
                                                                            setOfferCreationLoading(false);
                                                                            const newOfferEvent = {
                                                                                offerId: queryResult.data,
                                                                                title: eventTitle,
                                                                                description: eventDescription,
                                                                                media: eventMedia,
                                                                                isOpen: 1,
                                                                                createdBy: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                                                                                createdOn: eventInstance,
                                                                                responses: 0,
                                                                            };
                                                                            setAllOfferEvents([...allOfferEvents, newOfferEvent]);
                                                            
                                                                            setImageError('');
                                                                            setUploadProgress(0);
                                                                            setEventTitle('');
                                                                            setEventDescription('');
                                                                            setEventMedia('');
                                                            
                                                                        }
                                                                        else {
                                                                            setOfferCreationLoading(false);
                                                                            
                                                                        }
                                                                    }
                                                                    catch (e){
                                                                        console.log(e);
                                                                        
                                                                        // show and hide message
                                                                        // setResultType('error');
                                                                        // setResultMessage('Issue loading. Please refresh or try again later!');
                                                                        toast({
                                                                            description: "Issue loading. Please refresh or try again later!",
                                                                          })
                                                                        // setTimeout(function(){
                                                                        //     setResultType('');
                                                                        //     setResultMessage('');
                                                                        // }, 3000);
                                                                    }
                                                            }
                                                        

                                                            return (
                                                                
                                                                <section>
                                                                    
                                                                    {(tagsList.length == 0) ?
                                                                        <div className='flex flex-row items-center gap-2'>
                                                                            <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                                                            <p className='text-red-600'>Fetching...please wait</p> 
                                                                        </div>
                                                                        :
                                                                    <div className="flex flex-col flex-wrap md:grid-cols-2 gap-2 ">

                                                                        {/* Editable Product Name */}
                                                                                <div className="mb-2">
                                                                                    <Input
                                                                                        defaultValue={product.name}
                                                                                        onChange={(e) => { editedName = e.target.value; }}
                                                                                        className="text-lg font-semibold border-dashed"
                                                                                        placeholder="Product name"
                                                                                    />
                                                                                </div>
                                                                        {/* Selected Tags as Badges */}
                                                                                <div>
                                                                                    <Image
                                                                                    // src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/products%2F'+product.design+'_F1.jpeg?alt=media'}
                                                                                    src={product.media.split(',').length > 1 ? 'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/products%2F'+product.media.split(',')[0]+'.webp?alt=media' : 'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/products%2F'+product.media+'.webp?alt=media'}
                                                                                    alt={product.name}
                                                                                    className="w-full h-48 object-cover rounded-lg"
                                                                                    // layout="responsive"
                                                                                    width={400}
                                                                                    height={200}
                                                                                    />
                                                                                </div>
                                                                                <div className="mb-4 flex flex-wrap">
                                                                                  {selectedTags.map((tagId) => {
                                                                                    const tag = tagsList.find((t) => t.tagId === tagId);
                                                                                    return (
                                                                                        <span key={product.id+"-"+tagId} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">
                                                                                            {tag?.name}
                                                                                            <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tagId)} />
                                                                                        </span>
                                                                                    );
                                                                                  })}
                                                                                </div>
                                                                        
                                                                                {/* Scrollable Horizontal Grid of Tags */}
                                                                                {/* <div className="max-h-64 max-w-4xl overflow-x-auto border p-2 rounded-md flex gap-4"> */}
                                                                                <div className="flex-1 flex flex-wrap overflow-y-auto border p-2 rounded-md gap-8">
                                                                                  {Object.entries(groupedTags).map(([type, groupTags]) => (
                                                                                    <div key={product.id+"-"+type} className="flex-1 min-w-[200px]">
                                                                                      <h3 className="text-md font-semibold mb-2">{type}</h3>
                                                                                      <div className="flex flex-col gap-2">
                                                                                        {groupTags.map((tag) => (
                                                                                          <label key={product.id+"-"+tag.tagId} className="flex items-center gap-2">
                                                                                            <Checkbox
                                                                                              checked={selectedTags.includes(tag.tagId)}
                                                                                              onCheckedChange={() => handleTagChange(tag.tagId, type)}
                                                                                            />
                                                                                            {tag.name}
                                                                                          </label>
                                                                                        ))}
                                                                                      </div>
                                                                                    </div>
                                                                                  ))}
                                                                                </div>
                                                                        
                                                                                <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-4 flex flex-row gap-2 justify-end border-t">

                                                                                  <Button variant='outline' className="mr-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={onDeleteDesign} disabled={deletingDesign}>
                                                                                      <Trash size={16} className="mr-2"/> {deletingDesign ? 'Deleting...' : 'Delete Design'}
                                                                                  </Button>

                                                                                  <Sheet>
                                                                                    <SheetTrigger asChild>
                                                                                        <Button variant='secondary'><HeartIcon className='w-4 font-bold text-lg' /> &nbsp;Add to Design of the day</Button>
                                                                                    </SheetTrigger>
                                                                                    <SheetContent className='overflow-y-scroll'>
                                                                                    <SheetHeader>
                                                                                    <SheetTitle>Design of the day</SheetTitle>
                                                                                    <SheetDescription>
                                                                                        Provide a description to display while we show the design of the day.
                                                                                    </SheetDescription>
                                                                                    </SheetHeader>

                                                                                    <div className="grid w-full items-center gap-4 mt-8">
                                                                                        <div className="flex flex-col space-y-1.5">
                                                                                            
                                                                                        <label htmlFor="title" className="flex flex-col gap-2 text-sm font-medium leading-none">
                                                                                            Design: <br/>
                                                                                            <b>{product.name}</b>
                                                                                            <b>{product.design}</b>
                                                                                        </label>
                                                                                        {/* <Input
                                                                                            id="title"
                                                                                            type="text"
                                                                                            placeholder="Enter title"
                                                                                            value={eventTitle}
                                                                                            onChange={(e) => setEventTitle(e.target.value)}
                                                                                        /> */}
                                                                                        </div>
                                                                                        <div className="flex flex-col space-y-1.5">
                                                                                        <label htmlFor="description" className="text-sm font-medium leading-none">
                                                                                            Description
                                                                                        </label>
                                                                                        <Input
                                                                                            id="description"
                                                                                            type="text"
                                                                                            placeholder="Enter description"
                                                                                            value={eventDescription}
                                                                                            onChange={(e) => setEventDescription(e.target.value)}
                                                                                        />
                                                                                        </div>
                                                                                        <div className="flex flex-col space-y-1.5">
                                                                                        <label htmlFor="media" className="text-sm font-medium leading-none">
                                                                                            Graphic/Image
                                                                                        </label>

                                                                                        <Image
                                                                                            src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/products%2F'+product.design+'_F1.jpeg?alt=media'}
                                                                                            // src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.imageUrls.split(',')[0]+'?alt=media'}
                                                                                            alt={product.name}
                                                                                            className="w-full h-48 object-cover rounded-lg"
                                                                                            // layout="responsive"
                                                                                            width={400}
                                                                                            height={200}
                                                                                            />
                                                                                        {/* <Input
                                                                                            id="media"
                                                                                            type="file"
                                                                                            accept="image/*"
                                                                                            onChange={(e) => {
                                                                                            const selectedFile = e.target.files[0];
                                                                                            compressImageAndUpload(selectedFile);
                                                                                            }}
                                                                                        /> */}

                                                                                        {/* <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                                                            <div
                                                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                                                style={{ width: `${uploadProgress}%` }}
                                                                                            ></div>
                                                                                        </div> */}
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                                    {(imageError.length > 0) ?
                                                                                    <p className={`${inter.className} ${styles.text3}`}>{imageError}</p> 
                                                                                    : <p></p> 
                                                                                    }
                                                                                    
                                                                                    <SheetFooter className="mt-8">
                                                                                    <SheetClose asChild>
                                                                                    {/* {(uploadProgress > 0 && uploadProgress < 100) ?
                                                                                            <div className="flex flex-row m-12">    
                                                                                                <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                                                                                <p className={`${inter.className} ${styles.text3}`}>Uploading ...</p> 
                                                                                            </div>
                                                                                            :  */}
                                                                                            {offerCreationLoading ?
                                                                                            <div className="flex flex-row m-12">    
                                                                                                <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                                                                                <p className={`${inter.className} ${styles.text3}`}>Creating offer ...</p> 
                                                                                            </div>
                                                                                            :
                                                                                            <Button type="submit" onClick={() => addToDesignOfTheDay(product)}>Create</Button>
                                                                                        }
                                                                                    </SheetClose>
                                                                                    </SheetFooter>
                                                                                    </SheetContent>
                                                                                </Sheet>
                                                                                  
                                                                                  <Button onClick={() => onSave(product.productId, selectedTags)}  className="text-white bg-green-700">Save Changes</Button>
                                                                                </div>
                                                                        
                                                                        
                                                                    </div>
                                                        }
                                                                </section>
                                                            );
                                                        })()}
                                                        {/* <div className="grid gap-4">
                                                            <div className="grid gap-3">
                                                            <Label htmlFor="name-1">Name</Label>
                                                            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                                                            </div>
                                                            <div className="grid gap-3">
                                                            <Label htmlFor="username-1">Username</Label>
                                                            <Input id="username-1" name="username" defaultValue="@peduarte" />
                                                            </div>
                                                        </div> */}
                                                        {/* <SheetFooter>
                                                            <SheetClose asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                            </SheetClose>
                                                            <Button type="submit">Save changes</Button>
                                                        </SheetFooter> */}
                                                        </SheetContent>
                                                    </form>
                                                    </Sheet>
                            </TableCell>
                            <TableCell>
                                <div className="w-fit font-mono">
                                    {product.design} 
                                    {/* <br/><span className='text-muted-foreground text-xs font-normal'>{row.billTo}</span>  */}
                                </div>
                            </TableCell>
                            <TableCell className='font-mono'>{product.size}</TableCell>
                            <TableCell className='font-mono text-right'>
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{Number(product.std || 0)}
                                </span>
                            </TableCell>
                            <TableCell className='font-mono text-right'>
                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">{Number(product.prm || 0)}
                                </span>
                            </TableCell>
                            <TableCell className='font-mono text-right'>
                                {Number(product.activeBatches) > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setBatchesProduct(product)}
                                        title="View active batches"
                                        className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 hover:underline"
                                    >
                                        {product.activeBatches}
                                    </button>
                                ) : '-'}
                            </TableCell>
                            
                            <TableCell className='font-mono text-right'>
                                {Number(product.orderCount) > 0 ? (
                                    <span>{product.orderCount}</span>
                                ) : '-'}
                            </TableCell>
                            <TableCell className='font-mono text-right text-xs text-slate-500'>
                                {product.latestOrderOn ? dayjs(product.latestOrderOn).format('DD/MM/YYYY') : '-'}
                            </TableCell>
                            {/* <TableCell>{dayjs(row.invoiceDate).format("DD/MM/YY hh:mm A")}</TableCell> */}
                            
                                <TableCell>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button variant='link' size="sm" onClick={()=>setOrdersSheetProduct(product)} className="text-green-600 hover:text-green-800">Orders</Button>
                                    </div>
                                </TableCell>
                            
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* </div> */}
        </Card>

                </div>
            :
            <Skeleton className="h-4 w-[500px] h-[120px]" >
                <div className="flex flex-row m-12">    
                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                </div>
            </Skeleton> 
                


            }

        
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

          {/* Orders per design — same list and actions as the orders page designs tab */}
          <DesignOrdersDialog
            product={ordersSheetProduct}
            open={!!ordersSheetProduct}
            onClose={() => setOrdersSheetProduct(null)}
          />

          {/* PRM stock batches for a design, opened from the Active Batches count */}
          <Dialog open={!!batchesProduct} onOpenChange={(open) => { if (!open) setBatchesProduct(null); }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-mono">{batchesProduct?.design} — Stock Batches</DialogTitle>
                    <DialogDescription>
                        Premium stock batches for this design.
                    </DialogDescription>
                </DialogHeader>

                {loadingDesignBatches ? (
                    <div className="flex flex-row items-center gap-2 py-8 justify-center text-slate-500">
                        <SpinnerGap className="animate-spin" /> Loading batches ...
                    </div>
                ) : designBatchesError ? (
                    <div className="py-8 text-center text-sm text-red-600">{designBatchesError}</div>
                ) : (() => {
                    const activeBatches = designBatches.filter(b => b.status === 'Active' && Number(b.availableQty || 0) > 0);
                    const emptyBatches = designBatches.filter(b => !(b.status === 'Active' && Number(b.availableQty || 0) > 0));
                    const totalAvailable = activeBatches.reduce((sum, b) => sum + Number(b.availableQty || 0), 0);
                    const visibleBatches = showEmptyBatches ? [...activeBatches, ...emptyBatches] : activeBatches;

                    return (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-row items-center justify-between text-xs text-slate-600">
                                <span>
                                    <span className="font-medium">{activeBatches.length}</span> active {activeBatches.length === 1 ? 'batch' : 'batches'}
                                </span>
                                <span className="font-mono">
                                    Available <span className="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700">{totalAvailable}</span>
                                </span>
                            </div>

                            {visibleBatches.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">No active batches for this design.</div>
                            ) : (
                                <div className="max-h-[55vh] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Batch</TableHead>
                                                <TableHead>Received</TableHead>
                                                <TableHead className="text-right">Received Qty</TableHead>
                                                <TableHead className="text-right">Allocated</TableHead>
                                                <TableHead className="text-right">Available</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visibleBatches.map((batch) => {
                                                const initialQty = Number(batch.initialQty || 0);
                                                const availableQty = Number(batch.availableQty || 0);
                                                const allocatedQty = Math.max(0, initialQty - availableQty);
                                                const isActive = batch.status === 'Active' && availableQty > 0;

                                                return (
                                                    <TableRow key={batch.id} className={isActive ? '' : 'text-slate-400'}>
                                                        <TableCell className="font-mono">{batch.batchId || '(unnamed)'}</TableCell>
                                                        <TableCell className="font-mono text-xs">
                                                            {batch.receivedOn ? dayjs(batch.receivedOn).format('DD/MM/YYYY') : '-'}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-right">{initialQty}</TableCell>
                                                        <TableCell className="font-mono text-right">{allocatedQty}</TableCell>
                                                        <TableCell className="font-mono text-right font-medium">{availableQty}</TableCell>
                                                        <TableCell>
                                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {isActive ? 'Active' : batch.status}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {emptyBatches.length > 0 ? (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="self-start px-0 text-slate-500"
                                    onClick={() => setShowEmptyBatches(prev => !prev)}
                                >
                                    {showEmptyBatches ? 'Hide' : 'Show'} {emptyBatches.length} empty {emptyBatches.length === 1 ? 'batch' : 'batches'}
                                </Button>
                            ) : null}
                        </div>
                    );
                })()}
            </DialogContent>
          </Dialog>

    </div>
);
}
