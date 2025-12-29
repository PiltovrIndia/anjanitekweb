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
import { ArrowDown, HeartIcon, Search, Trash } from 'lucide-react'
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

// update reservation status
const updateReservationStatusAPI = async (pass, reservationId, status, qty) => 
fetch("/api/v2/reservations/"+pass+"/U3/"+reservationId+"/"+status+"/"+qty, {
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
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [file, setFile] = useState(null); 
        
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [offerCreationLoading, setOfferCreationLoading] = useState(false);

    // Reservations State
    const [reservations, setReservations] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [resOffset, setResOffset] = useState(0);
    const [resStatus, setResStatus] = useState('All');

    // Approval Dialog State
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
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
    
    // fetch the reservations
    async function getReservations(val, offsetR){
        
        
        setResLoading(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getReservationsAPI(process.env.NEXT_PUBLIC_API_PASS,val, offsetR) 
            const queryResult = await result.json() // get data

            console.log("RESERVATIONS::::");
            
            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setReservations(queryResult.data);
                        
                        setResLoading(false);
                    // }
                    
                }
                else {
                    setReservations([]);
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
    const processStockData = (e) => {
        // console.log('Check1');
        
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, {type: 'binary'});
                
                // print the length of sheets to console
                // console.log("Number of sheets:", workbook.SheetNames.length);

                var totalSheetData = [];
                
                for (let index = 0; index < workbook.SheetNames.length; index++) {
                    const element = workbook.SheetNames[index];
                    
                
                    // const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[element];
                    
                    // Specify date format directly in the read operation
                    const data = XLSX.utils.sheet_to_json(worksheet, {
                        dateNF: 'yyyy-mm-dd hh:mm:ss', // Format date columns
                        raw: false, // Do not use raw values (this ensures that dates are processed)
                    });

                    // keep only DESIGN, PRM, STD columns (case-insensitive) and normalize rows
                    const allowed = ['DESIGN', 'PRM', 'STD'];
                    const filteredRows = data
                        .map(row => {
                            const out = {};
                            Object.keys(row).forEach(k => {
                                const key = String(k).trim().toUpperCase();
                                if (allowed.includes(key)) out[key] = row[k];
                            });
                            return {
                                design: out['DESIGN'] ? String(out['DESIGN']).trim().replace('-', '').replace('ATL', '').trim() : '',
                                prm: out['PRM'] != null && out['PRM'] !== '' ? (isNaN(Number(out['PRM'])) ? out['PRM'] : Number(out['PRM'])) : null,
                                std: out['STD'] != null && out['STD'] !== '' ? (isNaN(Number(out['STD'])) ? out['STD'] : Number(out['STD'])) : null,
                                createdOn: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                            };
                        })
                        .filter(r => r.design && r.design.length);

                    // replace original data array contents with filtered rows so subsequent code uses them
                    data.length = 0;
                    filteredRows.forEach(r => data.push(r));

                    totalSheetData = totalSheetData.concat(data);
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
                uploadStockDetails(totalSheetData);
                // const data = XLSX.utils.sheet_to_json(worksheet);
                // setItems(data);
                // getDataDetails(data);
            };
    
            reader.readAsBinaryString(file);
        } else {
            console.log("Please select a file first.");
        }
    }

    async function uploadStockDetails(items1){
        
        setUploadProgress(true);
        console.log("Started");
        
        
        try {    
            const result  = await updateUploadStockData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);
                toast({description: "Upload success. Refresh to view updated data"});

                // getAllInvoices('','');

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
                toast({description: "Upload success. Refresh to view updated data"});
            }
        }
        catch (e){
            console.log(e);
            toast({description: "Issue loading. Please refresh or try again later!"});
        }
    }

    async function handleUpdateStatus(res) {
        setSelectedRes(res);
        setApprovalQty(res.requestedQty); // Default to requested quantity
        setIsApprovalDialogOpen(true);
    }

    async function submitApproval() {
        if (!approvalQty || isNaN(approvalQty)) {
            toast({ description: "Please enter a valid quantity" });
            return;
        }

        setResLoading(true);
        try {
            const result = await updateReservationStatusAPI(
                process.env.NEXT_PUBLIC_API_PASS, 
                selectedRes.id, 
                'Approved', 
                approvalQty
            );
            const queryResult = await result.json();
            if (queryResult.status === 200) {
                toast({ description: "Reservation approved successfully" });
                setIsApprovalDialogOpen(false);
                getReservations(resStatus, resOffset); // Refresh list
            } else {
                toast({ description: queryResult.message || "Failed to approve" });
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
              <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
              <Sheet>
                    <SheetTrigger asChild>
                        <Button className="text-white bg-green-600"><GridFour className='font-bold text-lg'/>&nbsp; Upload Stock</Button>
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
                            <Button type="submit" onClick={processStockData}>Upload now</Button>
                        </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
                

                {uploadProgress ? <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Uploading ...</CardTitle>
                        <CardDescription>Do not close</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Skeleton className="h-4 w-[100px] h-[20px]" />
                            </div>
                            
                        </div>
                        </form>
                    </CardContent>
                </Card> : null}

              <Toaster />
          </div>

          
          <Tabs defaultValue="allProducts" className="w-fit">
            <TabsList className="w-fit bg-slate-100 p-1 border border-slate-300">
              <TabsTrigger value="allProducts" className="w-1/2">All Designs</TabsTrigger>
              <TabsTrigger value="reservations" className="w-1/2" onClick={()=>getReservations('All', 0)}>Reservations</TabsTrigger>
            </TabsList>
            <TabsContent value="allProducts" className="w-full">
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
                    
                    <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button>
                </div>
                {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> InOuting Students</Button> */}
                {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button> */}
            </div>
            : ''    
            }

        <Card>
            {/* <div> */}
                        <Table>
            {/* <Table> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Design</TableHead>
                        <TableHead>Design Number</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Premium stock</TableHead>
                        <TableHead>Standard stock</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    
                    {(filteredProducts==null) ? '' :
                    filteredProducts.map((product) => (
                        <TableRow key={product.id} >
                            <TableCell>
                                {/* <div className='flex flex-row gap-2 items-center text-blue-600 font-semibold py-4 w-max cursor-pointer' onClick={() => handleRowClick(product)}> {product.name} </div> */}


                                <Dialog  modal={false}>
                                                    <form>
                                                        <DialogTrigger asChild>
                                                        <span onClick={() => {
                                                    // pass the full hostel object to the details page via sessionStorage
                                                    try { 
                                                        // setSelectedHostel(hostel); 
                                                        showHostelRooms(hostel);
                                                    } catch (e) {}

                                                }} className='text-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer w-full py-4'>{product.name} 
                                                
                                                <span>{(product.favorite == product.design) ? <HeartIcon className='inline-block ml-2 text-red-500' size={14} /> : ''}</span>
                                                </span>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[825px] max-h-[90vh] overflow-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>{product.name}</DialogTitle>
                                                            <DialogDescription>
                                                                <p>
                                                                {/* <span className='text-black font-medium'>{product.design.split(',').length}</span> Rooms • <span className='text-black font-medium'>{hostel.studentCount}</span> Students • <span className='text-black font-medium'>{hostel.admin.split(',').length}</span> Admins */}
                                                                <span className='text-gray-800 font-medium font-mono'>{product.design}</span>
                                                                </p>
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {(() => {
                                                            
                                                            // const [selectedTags, setSelectedTags] = useState(product.tags.split(",").map(Number));
                                                            var selectedTags = product.tags.split(",").map(Number);

                                                            const handleRemoveTag = (tagId) => {
                                                                selectedTags = selectedTags.filter((id) => id !== tagId);
                                                            };

                                                            const handleTagChange = (tagId, type) => {
                                                                selectedTags = selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId];
                                                                const tagsInGroup = groupedTags[type].map(tag => tag.tagId);
                                                                const selectedTagsInGroup = selectedTags.filter(id => tagsInGroup.includes(id));
                                                                
                                                                // if (selectedTagsInGroup.length === 0) {
                                                                //     // Show toast message
                                                                //     alert(`You must select at least one tag from the ${type} group.`);
                                                                //     return prev; // Prevent unchecking the last tag in the group
                                                                //     }
                                                                    
                                                                // return selectedTags;
                                                            };

                                                            // a function to send an API to make the product as design of the day
                                                            async function onSave(productId, selectedTags){
                                                                
                                                                setSearching(true);
                                                                
                                                                try {    
                                                                    const result  = await upateProduct(process.env.NEXT_PUBLIC_API_PASS, productId, selectedTags.join(","), product.size) 
                                                                    const queryResult = await result.json() // get data

                                                                    console.log(queryResult);
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
                                                                    console.log("/api/v2/products/"+process.env.NEXT_PUBLIC_API_PASS+"/U8/"+JSON.stringify(productData));
                                                                    
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

                                                                        {/* Selected Tags as Badges */}
                                                                                <div>
                                                                                    <Image
                                                                                    src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.design+'_F1.jpeg?alt=media'}
                                                                                    // src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.imageUrls.split(',')[0]+'?alt=media'}
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
                                                                                        <span key={tagId} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">
                                                                                            {tag?.name}
                                                                                            <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tagId)} />
                                                                                        </span>
                                                                                    );
                                                                                  })}
                                                                                </div>
                                                                        
                                                                                {/* Scrollable Horizontal Grid of Tags */}
                                                                                <div className="max-h-64 max-w-4xl overflow-x-auto border p-2 rounded-md flex gap-4">
                                                                                  {Object.entries(groupedTags).map(([type, groupTags]) => (
                                                                                    <div key={type} className="flex-1 min-w-[200px]">
                                                                                      <h3 className="text-md font-semibold mb-2">{type}</h3>
                                                                                      <div className="flex flex-col gap-2">
                                                                                        {groupTags.map((tag) => (
                                                                                          <label key={tag.tagId} className="flex items-center gap-2">
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
                                                                        
                                                                                <div className="mt-4 flex flex-row gap-2 justify-end">
                                                                                  
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
                                                                                            src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.design+'_F1.jpeg?alt=media'}
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
                                                        {/* <DialogFooter>
                                                            <DialogClose asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                            </DialogClose>
                                                            <Button type="submit">Save changes</Button>
                                                        </DialogFooter> */}
                                                        </DialogContent>
                                                    </form>
                                                    </Dialog>
                            </TableCell>
                            <TableCell>
                                <div className="w-fit">
                                    {product.design} 
                                    {/* <br/><span className='text-muted-foreground text-xs font-normal'>{row.billTo}</span>  */}
                                </div>
                            </TableCell>
                            <TableCell>{product.size}</TableCell>
                            <TableCell>{product.prm}</TableCell>
                            <TableCell>{product.std}</TableCell>
                            {/* <TableCell>{dayjs(row.invoiceDate).format("DD/MM/YY hh:mm A")}</TableCell> */}
                            
                                <TableCell>
                                    {searching ?
                                    <div className="flex flex-row m-12">    
                                        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                        <p className={`${inter.className} ${styles.text3}`}>Deleting...</p> 
                                    </div>
                                    :
                                    <div className="flex flex-row items-center gap-2">
                                        <Button variant='outline' className="mx-2 px-2 text-red-600" onClick={()=>{handleDeleteClick(row)}}><Trash size={24} className="text-red-600"/> &nbsp;Delete</Button>            
                                        {/* <Button variant='outline' className="mx-2 px-2 text-red-600" onClick={()=>{setSelectedInvoice(row),setIsDialogOpen(true)}}><Trash size={24} className="text-red-600"/> &nbsp;Delete</Button>             */}
                                        {/* Dialog Component */}
                                        
                                    </div>
                                    }
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
            </TabsContent>
            <TabsContent value="reservations" className="w-full">
                <div className="flex flex-row justify-between items-center py-4">
                    <span className='text-sm text-slate-500'>{reservations.length} Reservations found</span>
                    <Select value={resStatus} onValueChange={(val) => { setResStatus(val); getReservations(val, 0); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Submitted">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Design</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Approved Quantity</TableHead>
                                <TableHead>Stock Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resLoading ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10"><SpinnerGap className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                            ) : reservations.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10">No reservations found</TableCell></TableRow>
                            ) : reservations.map((res) => (
                                <TableRow key={res.id} className="hover:bg-gray-50 text-sm">
                                    <TableCell className="font-medium  py-4">{res.userId}</TableCell>
                                    <TableCell>{res.design}</TableCell>
                                    <TableCell>{res.requestedQty}</TableCell>
                                    <TableCell>{res.approvedQty}</TableCell>
                                    <TableCell>{res.stockType}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${res.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {res.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{dayjs(res.createdOn).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {res.status === 'Submitted' && (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleUpdateStatus(res)}>Approve</Button>
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
            </TabsContent>
          </Tabs>
          
          {/* Approval Confirmation Dialog */}
          <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
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
                        <Input
                            id="qty"
                            type="number"
                            value={approvalQty}
                            onChange={(e) => setApprovalQty(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>Cancel</Button>
                    <Button className="bg-green-600 text-white" onClick={submitApproval} disabled={resLoading}>
                        {resLoading ? <SpinnerGap className="animate-spin mr-2" /> : null}
                        Confirm Approval
                    </Button>
                </div>
            </DialogContent>
          </Dialog>
          
    </div>
);
}

