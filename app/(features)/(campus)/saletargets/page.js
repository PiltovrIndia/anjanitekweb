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

const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'

// we could consider the sales done by each dealer in the system
// The payments made by them in a given date range will be equal to their collections target achievement for that period
// The sales made by them in a given date range will be equal to their sales target achievement for that period

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
const getSalesPersonsTargets = async (pass, month, monthStart, monthEnd, ids) => 
    
fetch("/api/v2/salespersons-targets/"+pass+"/U0/"+month+"/"+monthStart+"/"+monthEnd+"/"+ids, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// pass state variable and the method to update state variable
export default function SaleTargets() {
    
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
    const [payload, setPayload] = useState(null); 
        
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [offerCreationLoading, setOfferCreationLoading] = useState(false);

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
                
                // getProductTags();
                getAllProducts();
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
            console.log("/api/v2/salespersons-targets/"+process.env.NEXT_PUBLIC_API_PASS+"/U0/2025-10/2025-10-01/2025-10-31/All");
            const result  = await getSalesPersonsTargets(process.env.NEXT_PUBLIC_API_PASS, '2025-10', '2025-10-01', '2025-10-31', 'All') 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data['users'].length > 0){
                    
                    setAllProducts(queryResult.data['users']);
                    setSearchedProducts(queryResult.data['users']);
                        
                    // Filter products based on selected tags
                    // (selectedTags.length > 0)
                    //     ? setFilteredProducts(queryResult.data.filter((product) =>
                    //         selectedTags.every((tagId) => product.tags.split(",").includes(tagId.toString()))
                    //     ))
                    //     : 
                        setFilteredProducts(queryResult.data['users']);
                        
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
        const filtered = allProducts.filter(product => product.userName.toLowerCase().includes(query) );

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
    async function filterByMonth(e){
        
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


    function safeTrim(value) {
        if (value == null) return null;
        const s = String(value).trim();
        return s === '' ? null : s;
    }

    function toNumber(value) {
        if (value == null || value === '') return NaN;
        const n = Number(String(value).replace(/,/g, ''));
        return n;
    }

    function toNumberOrNull(value) {
        const n = toNumber(value);
        return Number.isNaN(n) ? null : n;
    }

    // type DailyActual = {
    //     date: string;
    //     amount: number;
    // };

    //     type MonthlyTarget = {
    //     targetAmount: number;
    //     stretchTargetAmount?: number | null;
    //     closingActualAmount?: number | null;
    //     closingBalanceAmount?: number | null;
    //     };

    //     type SalesRow = {
    //     categoryCode: 'ATL' | 'VCL' | 'COLLECTION';
    //     excelId: string;
    //     region: string | null;
    //     userId?: string | null;
    //     monthly: MonthlyTarget;
    //     daily: DailyActual[];
    //     };

    //     type ImportPayload = {
    //     monthDate: string;
    //     sheetNames: string[];
    //     rows: SalesRow[];
    //     };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
        // setStatus('Reading file…');

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const payload = parseWorkbookToImportPayload(workbook);
        console.log(payload);
        setPayload(payload);
        
            // uploadSaleTargets(payload);
        

        // setStatus('Import completed ✅');
        } catch (err) {
        console.error(err);
        console.log(err);
        
        // setStatus(`Error: ${err.message ?? 'Something went wrong'}`);
        }
    };

    function parseWorkbookToImportPayload(workbook) {
  const sheetNames = workbook.SheetNames.filter((name) =>
    ['ATL', 'VCL', 'COLLECTION'].includes(name.toUpperCase())
  );

  if (sheetNames.length === 0) {
    throw new Error('No ATL / VCL / COLLECTION sheets found');
  }

  const allRows = [];
  let detectedMonthDate = null;

  for (const sheetName of sheetNames) {
    const ws = workbook.Sheets[sheetName];
    // change below line to JS
    const categoryCode = sheetName.toUpperCase();// === 'ATL' || sheetName.toUpperCase() === 'VCL' || sheetName.toUpperCase() === 'COLLECTION';

    const data = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: false,
    });

    if (!data.length) continue;

    const headerRow = data[1];

    // ✅ NEW: detect date columns with a more flexible parser
    const dateColumns = [];
    headerRow.forEach((cell, colIndex) => {
      const iso = parseDateFromHeaderCell(cell);
      if (iso) {
        dateColumns.push({ colIndex, date: iso });
      }
    });

    if (!dateColumns.length) {
      console.warn('Header row for sheet', sheetName, headerRow);
      throw new Error(`Could not detect date columns in sheet ${sheetName}`);
    }

    // Use first date col's month as monthDate (YYYY-MM-01)
    if (!detectedMonthDate) {
      const firstDate = dateColumns[0].date; // '2025-10-01'
      detectedMonthDate = firstDate.slice(0, 7) + '-01';
    }

    // ... keep the rest of your row parsing logic as is
    // (excelId/region/monthly/daily) — unchanged
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      const excelId = safeTrim(row[0]);
      const region = safeTrim(row[2]);
      const targetAmount = toNumber(row[3]);

      const isSalesperson =
        !!excelId && typeof targetAmount === 'number' && !Number.isNaN(targetAmount);

      if (!isSalesperson) {
        continue;
      }

      const stretchTargetAmount = toNumberOrNull(row[3]);
      const closingActualAmount = toNumberOrNull(row[4]);
      const closingBalanceAmount = toNumberOrNull(row[5]);

      const daily = dateColumns.map(({ colIndex, date }) => {
        const amount = toNumberOrNull(row[colIndex]) ?? 0;
        return { date, amount };
      });

      const salesRow = {
        categoryCode,
        excelId,
        monthly: {
          targetAmount,
          stretchTargetAmount,
          closingActualAmount,
          closingBalanceAmount,
        },
        daily,
      };

      allRows.push(salesRow);
    }
  }

  if (!detectedMonthDate) {
    throw new Error('Could not determine month from date columns');
  }

  return {
    monthDate: detectedMonthDate,
    sheetNames,
    rows: allRows,
  };
}

function parseDateFromHeaderCell(cell) {
  if (cell == null) return null;
  const raw = String(cell).trim();
  if (!raw) return null;

  // 1) Already in ISO-like format YYYY-MM-DD...
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return toIsoDate(y, m, d);
  }

  // 2) Slash format: M/D/YYYY or D/M/YYYY (we just normalize)
  const slashMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    let [, a, b, c] = slashMatch; // a/b/c
    let year = c;
    if (year.length === 2) {
      // naive pivot – adjust if you ever have older years
      year = Number(year) > 70 ? '19' + year : '20' + year;
    }
    // We don't know whether it's D/M or M/D, but for your case
    // "10/1/2025" clearly means Oct 1, 2025 → a=10 (month), b=1 (day)
    const month = a;
    const day = b;
    return toIsoDate(year, month, day);
  }

  // 3) 1-Oct-2025 or 01-Oct-25
  const textMonthMatch = raw.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})/
  );
  if (textMonthMatch) {
    let [, d, monStr, y] = textMonthMatch;
    const month = monthNameToNumber(monStr);
    if (!month) return null;

    let year = y;
    if (year.length === 2) {
      year = Number(year) > 70 ? '19' + year : '20' + year;
    }
    return toIsoDate(year, month, d);
  }

  // 4) Fallback – try JS Date parser (less strict, but works for many cases)
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    const dt = new Date(parsed);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1);
    const d = String(dt.getDate());
    return toIsoDate(String(y), m, d);
  }

  return null;
}

function monthNameToNumber(mon) {
  const map = {
    jan: '1',
    january: '1',
    feb: '2',
    february: '2',
    mar: '3',
    march: '3',
    apr: '4',
    april: '4',
    may: '5',
    jun: '6',
    june: '6',
    jul: '7',
    july: '7',
    aug: '8',
    august: '8',
    sep: '9',
    sept: '9',
    september: '9',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  };

  const key = mon.toLowerCase();
  return map[key] ?? null;
}

function toIsoDate(year, month, day) {
  const y = year.padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}


    

    async function uploadSaleTargets(){
        
        setUploadProgress(true);
        console.log("Started");
        
        if(!payload){
            toast({description: "Please select a valid file first!"});
            setUploadProgress(false);
            return;
        }
        
        try {    

            // setStatus('Uploading to server…');
            const res = await fetch(`/api/v2/saletargets`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            });

            // if (!res.ok) {
            //     const text = await res.text();
            //     throw new Error(text || 'Upload failed');
            // }

            // const result  = await updateUploadStockData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await res.json() // get data
            console.log(queryResult);
            
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);
                toast({description: "Upload success. Refresh to view updated data"});
                setPayload(null);

                // getAllInvoices('','');

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
                toast({description: "Upload success. Refresh to view updated data"});
                setPayload(null);
            }
        }
        catch (e){
            console.log(e);
            toast({description: "Issue loading. Please refresh or try again later!"});
            setPayload(null);
            setUploadProgress(false);
        }
    }
    
    
return (

    // <div className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
    //       <div className='flex flex-row gap-2 items-center py-4' >
    //           <h2 className="text-xl font-semibold mr-4">Designs</h2>
              
             
    <div className={`${inter.className} flex flex-col min-h-screen w-full overflow-auto`} style={{ gap: '8px' }}>
        <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Sale Targets</h2>
              
              <Sheet>
                    <SheetTrigger asChild>
                        <Button className="text-white bg-green-600"><GridFour className='font-bold text-lg'/>&nbsp; Upload Targets</Button>
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
                                {/* <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} /> */}
                                <input
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
      />
                            </div>
                        </div>
                        <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={uploadSaleTargets}>Upload now</Button>
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
          
        <span className='text-sm text-slate-500'>{allProducts.length} Sales Persons in total</span>

        <div className={`${styles.verticalsection} flex-1 flex flex-col`} style={{ width: '100%', gap: '8px', padding: '0px 0px 0px 0px' }}> 
            {/* <div className='flex items-center justify-between py-4 px-2'>
                <div className='flex items-center gap-4'></div>
                    <h2 className="text-lg font-semibold items-center">Collections - <span className='text-sm text-slate-500'>{allProducts.length} Sales Persons in total</span></h2>
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
                placeholder="Search Sales Persons..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="my-2 w-[300px]" // You can adjust width and margin as needed
            />

            {(searchQuery.length > 0) ? <div className='pb-2 text-green-700 font-semibold text-xs'>{filteredProducts.length} matching sales persons</div> 
            : (selectedSize != 'All') ?
                <div className='pb-2 text-green-700 font-semibold text-xs'>{filteredProducts.length} {selectedSize} Sales Persons</div>
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

            {filteredProducts.length == 0 ?
                <div className="flex flex-row m-12">    
                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                </div>
                :
                <Select defaultValue={selectedSize} onValueChange={(e)=>filterByMonth(e)} >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem key={'All'} value={'All'}>All</SelectItem>
                            {Array.from({ length: 12 }).map((_, i) => {
                                const m = dayjs().subtract(i, 'month');
                                const value = m.format('YYYY-MM'); // e.g. "2025-10"
                                const label = m.format('MMMM YYYY'); // e.g. "October 2025"
                                return (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                );
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            }

            <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button>
        {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button> */}
    </div>
    </div>
    : ''    
    }

        <Card className="mb-8">
            {/* <div> */}
                        <Table>
            {/* <Table> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>salesperson</TableHead>
                        <TableHead>Total Target</TableHead>
                        <TableHead>Total Achieved</TableHead>
                        <TableHead>ATL/VCL/Collections</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    
                    {(filteredProducts==null) ? '' :
                    filteredProducts.map((product) => (
                        <TableRow key={product.id} >
                            
                            <TableCell>
                                <div className="w-fit">
                                    {product.userName} 
                                    {/* <br/><span className='text-muted-foreground text-xs font-normal'>{row.billTo}</span>  */}
                                </div>
                            </TableCell>
                            <TableCell>{product.totalTarget}</TableCell>
                            <TableCell>{product.totalAchieved}</TableCell>
                            <TableCell>{product.collectionAchieved}</TableCell>
                            {/* <TableCell>{dayjs(row.invoiceDate).format("DD/MM/YY hh:mm A")}</TableCell> */}
                            
                            <TableCell>
                                {product.categories.map((c) => (
                                    <div key={c.categoryId}>
                                        {c.categoryCode}: {c.achievedAmount}/{c.targetAmount}
                                    </div>
                                ))}
                            </TableCell>
                            
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* </div> */}
        </Card>

        {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                Are you sure you want to delete this invoice? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
                </Button>
                <Button variant="destructive" onClick={()=>deleteSelectedInvoice()}>
                Delete
                </Button>
            </DialogFooter>
            </DialogContent>
</Dialog> */}

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
    </div>
);
}

