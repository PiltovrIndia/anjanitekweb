'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt } from 'phosphor-react'
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
fetch("/api/v2/products/"+pass+"/U1/"+role+"/"+offset, {
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProductOn, setNewProductOn] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);

    // var groupedTags = [];



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
    
      // Filter products based on selected tags
      const filteredProducts = selectedTags.length
        ? allProducts.filter((product) =>
            selectedTags.every((tagId) => product.tags.split(",").includes(tagId.toString()))
          )
        : allProducts;

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
                        console.log("No invoices data found.");
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
    <div className={inter.className} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', height: '100vh', gap: '8px' }}>
        <div className={styles.verticalsection} style={{ height: '90vh', width: '100%', gap: '8px' }}>
            <div className='flex flex-row gap-2 items-center py-4'>
                <h2 className="text-lg font-semibold mr-4">Collections</h2>
                <Button onClick={() => setNewProductOn(true)}>Add Product</Button>
                <Toaster />
            </div>

            {(viewTypeSelection == 'college') ?
                <div className="flex items-center py-2" style={{ gap: '10px' }}>
                </div>
                :
                <div className="flex items-center py-2" style={{ gap: '10px' }}>
                </div>
            }

            <div className="mx-auto" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex h-full">
                    {/* Sidebar with grouped filters */}
                    <div className='h-full overflow-y-auto pb-8 w-[300px]'>
                        <FilterSidebar groupedTags={groupedTags} selectedTags={selectedTags} onTagChange={handleTagChange} />
                    </div>

                    {/* Product Listing */}
                    <div className="mx-auto px-2 overflow-y-auto pb-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <div key={product.productId} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

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
    </div>
);
}

