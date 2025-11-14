'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt, CirclesFour, CircleDashed, CheckCircle, CheckSquare, CalendarBlank, Calendar, FileXls, FilePdf } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { Toaster } from "../../../components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"
import ProductCard from './product_card';
import FilterSidebar from './filtersidebar';
import TagDialog from './product_details';
import { Button } from '@/app/components/ui/button'
import NewProductDialog from './newproduct'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Search } from 'lucide-react'


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

// create product
const createProductAPI = async (pass, productData) => 
fetch("/api/v2/products/"+pass+"/U7/"+productData, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// pass state variable and the method to update state variable
export default function Products() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    const [selectedTags, setSelectedTags] = useState([]);
    const [groupedTags, setGroupedTags] = useState([]);
    const [tagsList, setTags] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);

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
    const [id, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [offset, setOffset] = useState(0);
    const [days, setDays] = useState(45);
    const [completed, setCompleted] = useState(false);
    
    // branch type selection whether all branches and years or specific ones
    const [viewTypeSelection, setViewTypeSelection] = useState('college');
    const [uploadProgress, setUploadProgress] = useState(false);
    const lastItemRef = useRef(null);
    const [file, setFile] = useState(null); 
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const [dataFound, setDataFound] = useState(true); 
    const [searchingStats, setSearchingStats] = useState(false);
    const [searching, setSearching] = useState(false);
    const [updatingTags, setUpdatingTags] = useState(false);
    



    
    // Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal',  // Use 'currency' for currency formatting
        minimumFractionDigits: 2,  // Minimum number of digits after the decimal
        maximumFractionDigits: 2   // Maximum number of digits after the decimal
    });

    // get the user and fire the data fetch
    useEffect(()=>{
        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                setRole(obj.role);
                setUserId(obj.id);
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);

    useEffect(() => {
        if (user && user.id && !completed) {
            
            getProductTags();
            getAllProducts();
        }
    }, [user, completed]);

    const handleTagChange = (tagId) => {
        setSelectedTags((tagsList) =>
          tagsList.includes(tagId) ? tagsList.filter((id) => id !== tagId) : [...tagsList, tagId]
        );
      };

      // on update product
      const handleSaveTags = (productId, updatedTags) => {
        setAllProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.productId === productId && product.tags !== updatedTags.join(",")
              ? { ...product, tags: updatedTags.join(",") }
              : product
          )
        );

        allProducts.map((product) =>
            (product.productId === productId && product.tags !== updatedTags.join(",")) ?
                // Call a method if the product tags are not the same as updatedTags
                updateProductTags(productId, updatedTags.join(",")) : null
            );
      };
    
      // on create product
      const createNewProduct = (productData) => {
        // setAllProducts((prevProducts) =>
        //   prevProducts.map((product) =>
        //     product.productId === productId && product.tags !== updatedTags.join(",")
        //       ? { ...product, tags: updatedTags.join(",") }
        //       : product
        //   )
        // );

        // allProducts.map((product) =>
        //     (product.productId === productId && product.tags !== updatedTags.join(",")) ?
                // Call a method if the product tags are not the same as updatedTags
                createProduct(productData) 
                // : null
            // );
      };
    
    //   const filteredProducts = selectedTags.length
    //     ? allProducts.filter((product) =>
    //         selectedTags.every((tagId) => product.tags.split(",").includes(tagId.toString()))
    //       )
    //     : allProducts;

    async function getProductTags(){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            
            const result  = await getTags(process.env.NEXT_PUBLIC_API_PASS)
            const queryResult = await result.json() // get data
            // console.log(queryResult);
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
                   
                    setDataFound(true);
                    setSearchingStats(false);
                }
                else {
                    
                    setDataFound(false);
                }

                setSearchingStats(false);
                setCompleted(false);
            }
            else {
                
                setSearchingStats(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            console.log(e);
            // show and hide message
            setResultType('error');
            setResultMessage('Issue loading. Please refresh or try again later!');
            setTimeout(function(){
                setResultType('');
                setResultMessage('');
            }, 3000);
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

                    // if(allProducts.length > 0){
                        
                    //     // setAllProducts(allProducts.push(queryResult.data));
                    //     // setAllProducts([]);
                    //     setAllProducts(allProducts.push(queryResult.data));
                    //     console.log("Checking");
                        
                    // }
                    // else{
                        setAllProducts(queryResult.data);
                        setSearchedProducts(queryResult.data);
                        
      // Filter products based on selected tags
      selectedTags.length
        ? setFilteredProducts(queryResult.data.filter((product) =>
            selectedTags.every((tagId) => product.tags.split(",").includes(tagId.toString()))
          ))
        : setFilteredProducts(queryResult.data);
                        
                        
                    // }
                    
                    setDataFound(true);
                }
                else {
                    setAllProducts([]);
                    setDataFound(false);
                }

                setSearching(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401) {
                
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllProducts([]);
                toast({
                    description: "Facing issues, try again later!",
                  })
                  
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                setAllProducts([]);
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
}

    // update product tags
    async function updateProductTags(productId, tags){
        
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call
        let sizeTag = '';
        
        tagsList.forEach(tag => {
            if (tag.type === 'Size') {
                
            tags.split(',').forEach(tagId => {
                
                if (tag.tagId == tagId) {
                    sizeTag = tag.name;
                }
            });
            }
        });
        console.log(sizeTag);
        
        try {    
            const result  = await upateProduct(process.env.NEXT_PUBLIC_API_PASS, productId, tags, sizeTag) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                

                        // setAllProducts(queryResult.data);
                        
                    setSelectedProduct(null); // Close dialog after save
                    toast({
                        description: "Details updated!",
                      })
                
                setUpdatingTags(false);
            }
            else if(queryResult.status == 401 || queryResult.status == 201) {
                
                setUpdatingTags(false);
            }
            else if(queryResult.status == 404) {
                
                toast({
                    description: "Facing issues, try again later!",
                  })
                  
                  setUpdatingTags(false);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
}
    // create product
    async function createProduct(productData){
        
        
        setSearching(true);
        setCreatingProduct(true);
        let sizeTag = '';
        
        tagsList.forEach(tag => {
            if (tag.type === 'Size') {
                
            productData.tags.split(',').forEach(tagId => {
                
                if (tag.tagId == tagId) {
                    sizeTag = tag.name;
                }
            });
            }
        });
        console.log(sizeTag);
        
        try {    
            // const result  = await createUser(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.stringify(updateDataBasic)+"/"+encodeURIComponent(JSON.stringify(updateDataDealer)))
            const result  = await createProductAPI(process.env.NEXT_PUBLIC_API_PASS, JSON.stringify(productData)) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                toast({
                    description: "Product created!",
                    })
                    setNewProductOn(false)
                    setCreatingProduct(false);

                    productData.productId = queryResult.productId;
                    setAllProducts((prevProducts) => [...prevProducts, productData]);
                
            }
            else if(queryResult.status == 401 || queryResult.status == 201) {
                setNewProductOn(false)
                setCreatingProduct(false);
            }
            else if(queryResult.status == 404) {
                
                toast({
                    description: "Facing issues, try again later!",
                  })
                  setNewProductOn(false)
                  setCreatingProduct(false);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
}

    
return (
    <div className={`${inter.className} flex flex-col lg:flex-row min-h-screen w-full`} style={{ gap: '8px' }}>
        <div className={`${styles.verticalsection} flex-1 flex flex-col`} style={{ width: '100%', gap: '8px', padding: '12px 0' }}>
            <div className='flex items-center justify-between py-4 px-2'>
                <div className='flex items-center gap-4'></div>
                    <h2 className="text-lg font-semibold">Collections</h2>
                </div>
                <div className='flex items-center gap-2'></div>

            {(viewTypeSelection == 'college') ?
                <div className="flex items-center py-2" style={{ gap: '10px' }}>
                </div>
                :
                <div className="flex items-center py-2" style={{ gap: '10px' }}>
                </div>
            }

            <div className="mx-auto" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex h-full gap-2">
                    {/* Sidebar with grouped filters */}
                    <div className='h-full overflow-y-auto pb-8 w-[300px]'>
                        <FilterSidebar groupedTags={groupedTags} selectedTags={selectedTags} onTagChange={handleTagChange} />
                    </div>

                    {/* Product Listing */}
                    {/* <div className="mx-auto px-2 overflow-y-auto pb-8"> */}
                        {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <div key={product.productId} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div> */}

                        {/* <div className="flex flex-col gap-4">
                            {filteredProducts.map((product) => (
                                <div key={product.productId} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div> */}


                         {searching ?
                                    <div className='flex flex-row items-center gap-2'>
                                        <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                        <p className='text-red-600'>Loading...please wait</p> 
                                    </div>
                                    :
                                    <div className='w-full'>
                                        <div className='flex flex-row justify-between items-baseline py-2'>
                                            {/* <h1 className='text-2xl font-bold tracking-wide'>Grievances</h1> */}
                                            {/* {grievancesListing.length > 0 && ( */}
                                                <div className="flex flex-row justify-end gap-2">

                                                {/* <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline">
                                                            Status options:&nbsp;<b> {statusSelected}</b> <CaretDown className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={()=>changeStatusSelection('All')}>
                                                            <CirclesFour className="mr-2 h-4 w-4" /> All Grievances
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={()=>changeStatusSelection('Submitted')}>
                                                            <CircleDashed className="mr-2 h-4 w-4" /> Submitted
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={()=>changeStatusSelection('Started')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Started
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={()=>changeStatusSelection('Resolved')}>
                                                            <CheckSquare className="mr-2 h-4 w-4" /> Resolved
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu> */}
                                                {/* <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button id="date" variant={"outline"} className={cn( "w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground" )} >
                                                    <CalendarBlank className="mr-2 h-4 w-4" />
                                                    {date?.from ? (
                                                        date.to ? (
                                                        <>
                                                            {format(date.from, "LLL dd, y")} -{" "}
                                                            {format(date.to, "LLL dd, y")}
                                                        </>
                                                        ) : (
                                                        format(date.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={1} />
                                                    {(date!=null) ?
                                                    <Button onClick={()=>{changeDatesSelection(date)}}>Apply selection</Button> : <br/>}
                                                </PopoverContent>
                                            </Popover> */}
                                                <Button variant="outline" onClick={() => downloadHostelsDataNowExcel()}  className='border-green-600 bg-green-600 text-white hover:bg-green-700 hover:text-white'>
                                                    <FileXls className="mr-2 h-6 w-6 text-white"/>
                                                    Download Excel
                                                </Button>
                                                <Button variant="outline" onClick={() => downloadHostelsDataNowPDF()}  className='border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white'>
                                                    <FilePdf className="mr-2 h-6 w-6 text-white"/>
                                                    Download PDF
                                                </Button>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search by Design or Name"
                                                        className="border border-gray-300 text-sm rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const searchTerm = value.toLowerCase().trim();

                                                            if (!searchTerm) {
                                                                // restore full list (refetch)
                                                                setFilteredProducts(allProducts);
                                                                return;
                                                            }

                                                            const filtered = searchedProducts.filter((product) =>
                                                                (product.design || '').toLowerCase().includes(searchTerm) ||
                                                                (product.name || '').toLowerCase().includes(searchTerm)
                                                            );
                                                            setFilteredProducts(filtered);
                                                            
                                                        }}
                                                    />
                                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    </div>

                                            </div> 
                                        </div>
                                                <div className='w-full mb-8'>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-sm text-gray-600">
                                                            Selected: { (lastItemRef.current && lastItemRef.current.size) ? lastItemRef.current.size : 0 }
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const list = Array.from((lastItemRef.current && lastItemRef.current.size) ? lastItemRef.current : []).join(",");
                                                                    setResultMessage(list);
                                                                    toast({ description: "Selected IDs saved" });
                                                                }}
                                                                className="border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                                            >
                                                                Save Selected
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <table className="table-auto border-collapse border border-gray-300 w-full text-left h-full overflow-y-auto ">
                                                        <thead>
                                                        <tr>
                                                            <th className="bg-green-100 border border-green-300 px-4 py-2 text-nowrap text-xs">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={(e) => {
                                                                        // toggle all visible rows
                                                                        if (!lastItemRef.current) lastItemRef.current = new Set();
                                                                        if (e.target.checked) {
                                                                            filteredProducts.forEach(p => lastItemRef.current.add(p.productId));
                                                                        } else {
                                                                            filteredProducts.forEach(p => lastItemRef.current.delete(p.productId));
                                                                        }
                                                                        // store current selection as comma string in resultMessage to trigger re-render
                                                                        setResultMessage(Array.from(lastItemRef.current).join(","));
                                                                    }}
                                                                    checked={filteredProducts.length > 0 && lastItemRef.current && filteredProducts.every(p => lastItemRef.current.has(p.productId))}
                                                                />
                                                            </th>
                                                            <th className="bg-green-100 border border-green-300 px-4 py-2 text-wrap text-xs">Design</th>
                                                            <th className="bg-green-100 border border-green-300 px-4 py-2 text-nowrap text-xs text-center">Number</th>
                                                            <th className="bg-green-100 border border-green-300 px-4 py-2 text-nowrap text-xs text-center">Size</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        
                                                        {filteredProducts.length > 0 ? (
                                                            filteredProducts.map((product, index) => (
                                                                
                                                                <tr key={product.productId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProduct(product)} >
                                                                    <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">
                                                                        <input
                                                                            type="checkbox"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={(e) => {
                                                                                if (!lastItemRef.current) lastItemRef.current = new Set();
                                                                                if (e.target.checked) {
                                                                                    lastItemRef.current.add(product.productId);
                                                                                } else {
                                                                                    lastItemRef.current.delete(product.productId);
                                                                                }
                                                                                // keep a comma-separated string of selected ids in resultMessage (also triggers re-render)
                                                                                setResultMessage(Array.from(lastItemRef.current).join(","));
                                                                            }}
                                                                            checked={!!(lastItemRef.current && lastItemRef.current.has(product.productId))}
                                                                        />
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-wrap text-sm text-green-600">{product.name}</td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-gray-600 text-nowrap text-sm font-mono">{product.design}</td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{product.size}</td>
                                                                    
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="9" className="border border-gray-300 px-4 py-2 text-nowrap text-center">
                                                                    No data available
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>

                                                {/* show the saved/comma-separated selected ids */}
                                                {resultMessage && (
                                                    <div className="mt-2 text-sm text-gray-700">
                                                        Selected IDs: <span className="font-mono">{resultMessage}</span>
                                                    </div>
                                                )}
                                            </div>
                                </div>
                            }

                                    {selectedProduct && (
                                        <TagDialog
                                            product={selectedProduct}
                                            tags={tagsList}
                                            isOpen={!!selectedProduct}
                                            onClose={() => setSelectedProduct(null)}
                                            onSave={handleSaveTags}
                                        />
                                    )}

                                    {newProductOn && (
                                        <NewProductDialog
                                            tags={tagsList}
                                            isOpen={!!newProductOn}
                                            onClose={() => setNewProductOn(false)}
                                            createProduct={createNewProduct}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
    // </div>
);
}

