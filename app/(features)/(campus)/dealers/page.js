'use client'

import { Inter } from 'next/font/google'
import { PencilSimpleLine, UserMinus, Check, Info, SpinnerGap, X, Plus, UserPlus } from 'phosphor-react'
import React, { useCallback, useEffect, useState } from 'react'
import { XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Area, AreaChart } from 'recharts';
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// const storage = getStorage();
import firebase from '../../../firebase';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel} from '@/app/components/ui/select'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/app/components/ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,} from "@/app/components/ui/drawer"
import { Separator } from "@/app/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"

import BlockDatesBtn from '../../../components/myui/blockdatesbtn'
import OutingRequest from '../../../components/myui/outingrequest'
const storage = getStorage(firebase, "gs://smartcampusimages-1.appspot.com");
import Image from 'next/image'
// import fs from 'fs'
import path from 'path'



// import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Toaster } from "../../../../app/components/ui/sonner"
import { toast, ToastAction } from "sonner"
import Toast from '../../../../app/components/myui/toast'
import { useToast } from "@/app/components/ui/use-toast"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/app/components/ui/table"
  
import {columns} from "./columns"
import {DataTable} from "./data-table"
import {
    Card
  } from "../../../../app/components/ui/card"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../../../app/components/ui/sheet"


// create user
const createUser = async (pass, role, updateDataBasic) =>   
    fetch("/api/v2/user/"+pass+"/U12/"+role+"/"+updateDataBasic, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// update user
const updateUser = async (pass, role, id, updateDataBasic) =>   
    fetch("/api/v2/user/"+pass+"/U13/"+role+"/"+id+"/"+updateDataBasic, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get the dealers for SuperAdmin/Admin
const getAllDealersDataAPI = async (pass, role, id) => 
  
fetch("/api/v2/user/"+pass+"/U6/"+role+"/"+id, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// get the SalesManagers for SalesExecutives
const getAllSalesPersonsDataAPI = async (pass, role, offset) => 
  
    fetch("/api/v2/user/"+pass+"/U7/"+role+"/"+offset, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });


// get message to dealers
const sendBroadcastMessage = async (pass, sender, receiver, sentAt, message, seen, state) => 
  
fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});





// pass state variable and the method to update state variable
export default function Outing() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [selectedState, setSelectedState] = useState('All');
    const [selectedMapToPerson, setSelectedMapToPerson] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [offset, setOffset] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [updatingPerson, setupdatingPerson] = useState(false);
    const [searching, setSearching] = useState(true);
    const [searchingSales, setSearchingSales] = useState(false);
    const [loadingIds, setLoadingIds] = useState(new Set());
    
    // branch type selection whether all branches and years or specific ones
    const [updateEmail, setUpdateEmail] = useState('');
    const [updateMobile, setUpdateMobile] = useState('');
        
    // get all sales people for changing the value
    const [allSalesPeople, setAllSalesPeople] = useState([]);

    const [dataFound, setDataFound] = useState(false);
    const [messaging, setMessaging] = useState(false);
    const [creating, setCreating] = useState(false);
    const [allDealers, setAllDealers] = useState([]);
    const [allDealersFiltered, setAllDealersFiltered] = useState([]);
    const [allStates, setAllStates] = useState([]);
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [initialDatesValues, setInititalDates] = React.useState({from: dayjs().subtract(0,'day'),to: dayjs(),});
    // const [currentStatus, setCurrentStatus] = useState('All');
    const [currentStatus, setCurrentStatus] = useState('InOuting');
    //create new date object
    const today = new dayjs();
    
    const [showBlockOuting, setShowBlockOuting] = useState(false);
    const toggleShowBlockOuting = async () => {
        // setSelectedStudent(selectedStudent);
        setShowBlockOuting(!showBlockOuting)
    }
    const getDataData = async () => {
        console.log("Hello1");
    }

    ///////////////////////////////
    // IMPORTANT
    ///////////////////////////////
    // handle accept click to update a row
    const handleMessageSendClick = (row) => {
        
        setLoadingIds(prev => new Set(prev.add(row.getValue('dealerId'))));

        // Simulate API call
        sendSingleMessageNow(row.getValue('dealerId'), () => {
            setLoadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(row.getValue('dealerId'));
                return newSet;
            });

            toast({description: "Message Sent!",});
        });
        
    };


  async function sendSingleMessageNow(dealerId, callback){

    try {    
        var updatedOn = dayjs(new dayjs()).format("YYYY-MM-DD");
        
        // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+dealerId+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+document.getElementById('message').value+"/0/-");
        const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,dealerId,dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),document.getElementById('message').value,"0","-");
        
        const queryResult = await result.json() // get data

        // check for the status
        if(queryResult.status == 200){

          // toast({description: "Appointment updated!",});
        //   handleRemoveAppointment(row);
          callback();
          
        }
        else if(queryResult.status == 201) {
            
            // setSearching(false);
            // setDataFound(false);
            // setCompleted(true);
        }
    }
    catch (e){
      //   console.log(e);
    }
  }
    


    // get the user and fire the data fetch
    useEffect(()=>{
        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                // setRole(obj.role);
                
                // if(!completed){
                //     getAllDealers(initialDatesValues.from,initialDatesValues.to);
                // }
                // else {
                //     console.log("DONE READING");
                // }
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);


    useEffect(() => {
        if (user && user.id && !completed) {
            getAllDealers(initialDatesValues.from,initialDatesValues.to);
        }
    }, [user, completed]);



    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllDealers(from, to){
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getAllDealersDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, user.id) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){

                    if(allDealers.length > 0){
                        setAllDealers(allDealers.push(queryResult.data));
                        setAllDealersFiltered(allDealers.push(queryResult.data));
                    }
                    else{
                        setAllDealers(queryResult.data);
                        setAllDealersFiltered(queryResult.data);

                        const getDistinctStates = (list) => {
                            // Use reduce to accumulate distinct states
                            const distinctStates = list.reduce((acc, person) => {
                            if (!acc.includes(person.state)) {
                                acc.push(person.state);
                            }
                            return acc;
                            }, []);
                        
                            // Add "All" at the beginning of the array
                            distinctStates.unshift("All");
                        
                            return distinctStates;
                        };
                          
                          // Usage
                          const distinctStates = getDistinctStates(queryResult.data);
                          
                          setAllStates(distinctStates);
                    }
                    
                    setDataFound(true);
                }
                else {
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
                setAllDealers([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
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



    // Get all sales people data
    // role – SuperAdmin
    async function getSalesPersons(){
        
        setSearchingSales(true);

        try {    
            
            const result  = await getAllSalesPersonsDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, 'SalesManager', offset) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setAllSalesPeople(queryResult.data);
                    
                    setDataFound(true);
                }
                else {
                    setAllSalesPeople([]);
                    setDataFound(false);
                }

                setSearchingSales(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401 || queryResult.status == 201 ) {
                setAllSalesPeople([]);
                setSearchingSales(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllSalesPeople([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                  setSearchingSales(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            
            toast({ description: "Issue loading. Please refresh or try again later!", })
        }
    }


    function selectSalesPerson(e) {
        setSelectedMapToPerson(e);

        const mapTo = allSalesPeople.find(row => row.id === e).mapTo;
        console.log(mapTo);
        
        const SM = allSalesPeople.find(row => row.id === mapTo).name;
        console.log(SM);

        setSelectedManager(SM);
        
    }
    
    const getNextId = (list) => {
        // Extract numeric part from each ID and find the highest number
        const maxIdNumber = list.reduce((max, item) => {
        const currentIdNumber = parseInt(item.id.slice(1)); // Remove the prefix 'A' and parse the rest as an integer
        return Math.max(max, currentIdNumber);
        }, 0);
    
        // Increment the highest number to generate the next ID
        const nextIdNumber = maxIdNumber + 1;
    
        // Format the next ID by adding leading zeros if necessary (assuming IDs are always 4 characters long)
        const nextId = `A${String(nextIdNumber).padStart(3, '0')}`;
    
        return nextId;
    };

    // create Dealer
    async function createDealer(){
        
        // receiver is always the dealer
        try{
            if(document.getElementById('name').value.length > 0 && 
            document.getElementById('dealerId').value.length > 0 && 
            document.getElementById('email').value.length > 0 && 
            document.getElementById('mobile').value.length > 0 && 
            document.getElementById('address1').value.length > 0 && 
            document.getElementById('address2').value.length > 0 && 
            document.getElementById('address3').value.length > 0 && 
            document.getElementById('city').value.length > 0 && 
            document.getElementById('district').value.length > 0 && 
            document.getElementById('state').value.length > 0 && 
            document.getElementById('gst').value.length > 0){
                
                setCreatingPerson(true);

                // show and hide message
                toast({description: "Creating Dealer. Please wait ...",});

                // var id = getNextId(allDealers); // get the next salesID
                var id = document.getElementById('dealerId').value;
                var name = document.getElementById('name').value;
                var emailaddress = document.getElementById('email').value;
                var mobilenumber = document.getElementById('mobile').value;
                var address1 = document.getElementById('address1').value;
                var address2 = document.getElementById('address2').value;
                var address3 = document.getElementById('address3').value;
                var city = document.getElementById('city').value;
                var district = document.getElementById('district').value;
                var state = document.getElementById('state').value;
                var gst = document.getElementById('gst').value;

                const updateDataBasic = {
                    id: id,
                    name: name,
                    designation: "Dealer",
                    email: emailaddress,
                    mobile: mobilenumber,
                    role: 'Dealer',
                    mapTo: selectedMapToPerson,
                    userImage: '-',
                    gcm_regId: '-',
                    isActive: 1
                };
                const updateDataDealer = {
                    dealerId: id,
                    accountName: name,
                    salesId: selectedMapToPerson,
                    address1: address1,
                    address2: address2,
                    address3: address3,
                    city: city,
                    district: district,
                    state: state,
                    gst: gst
                };
                
                if (Object.keys(updateDataBasic).length > 0 && Object.keys(updateDataDealer).length > 0) {

                    console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U12/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role+"/"+JSON.stringify(updateDataBasic)+"/"+JSON.stringify(updateDataDealer));
                    const result  = await createUser(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.stringify(updateDataBasic)+"/"+JSON.stringify(updateDataDealer))
                    const queryResult = await result.json() // get data
                    console.log(queryResult);
                    
                    // check if query result status is 200
                    if(queryResult.status == 200) {
                        // set the state variables with the user data
                        
                        allDealers([updateDataBasic, ...allDealers]);
                        // setAllSalesPeople([...allSalesPeople, updateDataBasic]);
                        toast({description: "Dealer created and added to the list",});
                        setCreatingPerson(false);

                    } else if(queryResult.status == 404) {
                        setCreatingPerson(false);
                        // show and hide message
                        toast({description: "Facing issues, try again later!",});
                    }

                }
            }
            else {
                // show and hide message
                toast({description: "Fill in all the fields to submit.",});
            }
        }
            
        catch (e){
            console.log(e);
            
            // show and hide message
            toast({description: "Facing issues, try again later!",});
        }
    }
    
    // Filter the dealers list by states
    async function filterByStates(e){
        
        setSelectedState(e);

        if(e == 'All'){
            setAllDealersFiltered(allDealers);
        }
        else {
            const filteredDealers = allDealers.filter(dealer => dealer.state === e);
            setAllDealersFiltered(filteredDealers);
        }
    }
    
    // select Dealer to Update
    async function selectDealerForUpdate(row){
        console.log("Checking");
        console.log(row.name);
        
        if(allSalesPeople.length == 0) {
            getSalesPersons()
        }

        setUpdateEmail(row.email);
        setUpdateMobile(row.mobile);
        setSelectedMapToPerson(row.salesperson);

    }

    // update Dealer
    async function updateDealer(id){
        
        // receiver is always the dealer
        try{
            if(updateEmail.length > 0 && updateMobile.length > 0){
                
                setupdatingPerson(true);

                // show and hide message
                toast({description: "Updating. Please wait ...",});

                const updateDataBasic = {
                    email: updateEmail,
                    mobile: updateMobile,
                    mapTo: selectedMapToPerson,
                };

                
                if (Object.keys(updateDataBasic).length > 0) {

                    console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U13/"+role+"/"+id+"/"+JSON.stringify(updateDataBasic));
                    
                    const result  = await updateUser(process.env.NEXT_PUBLIC_API_PASS, role, id, JSON.stringify(updateDataBasic))
                    const queryResult = await result.json() // get data
                    console.log(queryResult);
                    
                    // check if query result status is 200
                    if(queryResult.status == 200) {
                        
                        // update the dealer inline
                        const updatedDealerPeople = allDealers.map((dealer) => {
                            if (dealer.id === id) {
                              // Update the specific object with the new name
                              return { ...dealer, email: updateEmail, mobile: updateMobile, mapTo: selectedMapToPerson, salesperson: allSalesPeople.find(item => item.id === selectedMapToPerson).name };
                            }
                            return dealer; // Keep other objects unchanged
                          });
                      
                          setAllDealers(updatedDealerPeople);

                        toast({description: "Update success!",});
                        setupdatingPerson(false);

                    } else if(queryResult.status == 404) {
                        setupdatingPerson(false);
                        // show and hide message
                        toast({description: "Facing issues, try again later!",});
                    }

                }
            }
            else {
                // show and hide message
                toast({description: "Fill in all the fields to submit.",});
            }
        }
            
        catch (e){
            console.log(e);
            
            // show and hide message
            toast({description: "Facing issues, try again later!",});
        }
    }


    // Activiate or Deactivate
    async function updateActiveStatus(id, isActive){
        
        try {    
            // show and hide message
            if(isActive == 1) {
                toast({description: "Activating dealer. Please wait ...",})
            }
            else {
                toast({description: "Deactivating dealer. Please wait ...",})
            }

            const updateDataBasic = {
                isActive: isActive,
            };
            const result  = await updateUser(process.env.NEXT_PUBLIC_API_PASS,role, id, JSON.stringify(updateDataBasic)) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // update the dealer inline
                const updatedDealerPeople = allDealers.map((dealer) => {
                    if (dealer.id === id) {
                      // Update the specific object with the new name
                      return { ...dealer, isActive: isActive };
                    }
                    return dealer; // Keep other objects unchanged
                  });
              
                  setAllDealers(updatedDealerPeople);
                  toast({description: "Update success!",});
            }
            else if(queryResult.status == 401 || queryResult.status == 201 ) {
                
                toast({description: "Facing issues, try again later!",});
            }
            else if(queryResult.status == 404) {
                
                toast({description: "Facing issues, try again later!",});
            }
        }
        catch (e){
            
            toast({ description: "Issue loading. Please refresh or try again later!", })
        }
    }

    



const sendMessageNow = async (e) => {
    
    setMessaging(true);
    
    try {    
        

        const result  = await sendBroadcastMessage(process.env.NEXT_PUBLIC_API_PASS, 
            JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, 'All', dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), document.getElementById('message').value,0,'-') 
        const queryResult = await result.json() // get data

        // console.log(queryResult);
        // check for the status
        if(queryResult.status == 200){

            setMessaging(false);
            toast({description: "Message sent to all dealers",});
            // toast("Message sent!", {
            //     description: "Message sent to all dealers",
            //     action: {
            //       label: "Okay",
            //       onClick: () => console.log("Okay"),
            //     },
            //   });

        }
        else if(queryResult.status != 200) {
            
            setMessaging(false);
        }
    }
    catch (e){
        
        // show and hide message
        setMessaging(false);
        setResultType('error');
        setResultMessage('Issue loading. Please refresh or try again later!');
        setTimeout(function(){
            setResultType('');
            setResultMessage('');
        }, 3000);
    }
    
}
  
    
  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Dealers</h2>

            {(!messaging) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button className="text-white bg-green-600">Broadcast message</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Broadcast message</SheetTitle>
                    <SheetDescription>
                        Enter your message to send it to all the dealers.
                    </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <br/>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Message</Label>
                            <Textarea id="message" placeholder="Type your message here." />
                            
                        </div>
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={sendMessageNow}>Send now</Button>
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Broadcasting...</Label>
                </div>
                }
            
            {(!creating) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button className="text-white bg-blue-700" onClick={()=>{allSalesPeople.length > 0 ? null : getSalesPersons()}}>Create Dealer</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Create Dealer</SheetTitle>
                    <SheetDescription>
                        Enter dealer details below and Click on Create.
                    
                    <div className="grid gap-4 px-1 py-4" style={{overflow:'scroll', height:'80vh'}}>
                        <br/>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="name" className="text-right">
                            Dealer ID:
                            </Label>
                            {/* <p className='font-semibold text-black'>{getNextId(allDealers)}</p> */}
                            <Input id="dealerId" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="name" className="text-right">
                            Dealer Account Name:
                            </Label>
                            <Input id="name" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="email" className="text-right">
                            Email:
                            </Label>
                            <Input id="email" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="mobile" className="text-right">
                            Mobile:
                            </Label>
                            <Input id="mobile" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="gst" className="text-right">
                            GST number:
                            </Label>
                            <Input id="gst" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="mapTo" className="text-right">
                            Sales Executive:
                            </Label>
                            {searchingSales ?
                                <div className="flex flex-row m-12">    
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                    <p className={`${inter.className} ${styles.text3}`}>Loading sales persons...</p> 
                                </div>
                                :
                                <Select onValueChange={(e)=>selectSalesPerson(e)}>
                                    <SelectTrigger className="text-black">
                                        <SelectValue placeholder="Select Sales Person" className="text-black" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectLabel className="text-black">Select Sales Person</SelectLabel>
                                            {allSalesPeople.filter(row => row.role === 'SalesExecutive').map((row) => (
                                                <SelectItem key={row.id} value={row.id} className="text-black">{row.name}<br/>{row.mapTo}</SelectItem>))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            }
                        </div>

                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="SM" className="text-right">
                            Sales Manager:
                            </Label>
                            <Input disabled id="SM" value={selectedManager} className="col-span-3 text-black" />
                            {/* {searchingSales ?
                                <div className="flex flex-row m-12">    
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                    <p className={`${inter.className} ${styles.text3}`}>Loading sales persons...</p> 
                                </div>
                                :
                                <Select onValueChange={(e)=>setSelectedMapToPerson(e)}>
                                    <SelectTrigger className="text-black">
                                        <SelectValue placeholder="Select Sales Person" className="text-black" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectLabel className="text-black">Select Sales Person</SelectLabel>
                                            {allSalesPeople.map((row) => (
                                                <SelectItem key={row.id} value={row.id} className="text-black">{row.name}</SelectItem>))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            } */}
                        </div>
                        <Separator />
                        <p className='text-black font-semibold'>Address Details</p>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="address1" className="text-right">
                            Address 1:
                            </Label>
                            <Input id="address1" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="address2" className="text-right">
                            Address 2:
                            </Label>
                            <Input id="address2" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="address3" className="text-right">
                            Address 3:
                            </Label>
                            <Input id="address3" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="city" className="text-right">
                            City:
                            </Label>
                            <Input id="city" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="district" className="text-right">
                            District:
                            </Label>
                            <Input id="district" className="col-span-3 text-black" />
                        </div>
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <Label htmlFor="state" className="text-right">
                            State:
                            </Label>
                            <Input id="state" className="col-span-3 text-black" />
                        </div>
                    </div>
                    </SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={createDealer}>Send now</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Creating Dealer...</Label>
                </div>
                }
              <Toaster />
          </div>      

            {/* <div style={{width:'100%',display:'flex', flexDirection:'row',justifyContent:'space-between'}}>
                <div className={styles.horizontalsection}>
                <Button  onClick={getDataData}>
                  <Plus className="mr-2 h-4 w-4" /> Declare outing
                </Button>
                    <div className={`${styles.primarybtn} `} style={{display:'flex', flexDirection:'row', width:'fit-content', cursor:'pointer', gap:'4px'}} onClick={toggleShowBlockOuting}> 
                        <Plus />
                        <p className={`${inter.className}`}>Declare outing</p>
                    </div> */}
                    {/* <BlockDatesBtn titleDialog={false} /> */}
                    {/* <OutingRequest /> */}
                    {/* <div className={`${styles.overlayBackground} ${showBlockOuting ? styles.hideshowdivshow : styles.hideshowdiv}`}>
                        <BlockDatesBtn toggleShowBlockOuting={toggleShowBlockOuting} titleDialog={false} /> 
                    </div>
                </div>
               
            </div> */}
          
           
          
         
    <div className={styles.verticalsection} style={{height:'80vh', width:'100%',gap:'8px'}}>

{!searching ?
<div className="mx-auto" style={{width:'100%',height:'100%'}}>
{/* <div className="container mx-auto py-10"> */}

<div className='flex flex-row justify-between items-center mb-2'>
    <div className='pb-2 text-slate-700 font-semibold'>{allDealers.length} Dealers in total</div>
    
    {(selectedState == 'All') ?
    <div className='pb-2 text-slate-700 font-semibold'></div>
    : <div className='pb-2 text-green-700 font-semibold'>{allDealersFiltered.length} Dealers in {selectedState.split('-')[1]}</div>
    }
    {allStates.length == 0 ?
        <div className="flex flex-row m-12">    
            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
            <p className={`${inter.className} ${styles.text3}`}>Loading sales persons...</p> 
        </div>
        :
        // setSelectedMapToPerson(e.target.value)
        <Select defaultValue={selectedState} onValueChange={(e)=>filterByStates(e)} >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                {/* <SelectLabel>All</SelectLabel> */}
                {allStates.map((row) => (
                <SelectItem key={row} value={row} >{row}</SelectItem>))}
                </SelectGroup>
            </SelectContent>
        </Select>
    }
</div>

<Card>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sales Person</TableHead>
                <TableHead>State</TableHead>
                <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {allDealersFiltered.map((row) => (
                <TableRow key={row.id}>
                    <TableCell className="py-2">{row.accountName}<br/>
                        <p className="text-muted-foreground">
                            {row.id} 
                        </p>
                    </TableCell>
                    <TableCell onClick={()=>console.log(row.mapTo)}>
                        <div className="text-sm text-slate-500 bg-slate-50 px-1 py-1 w-fit border border-slate-200 rounded">
                            {row.salesperson}
                        </div>
                        </TableCell>
                    <TableCell>{row.state}</TableCell>
                    <TableCell>
                    {/* {allSalesPeople.length == 0 ? getSalesPersons() : null}} */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant='outline' className="mx-2 px-2 text-green-600" onClick={()=>selectDealerForUpdate(row)}><PencilSimpleLine size={24} className="text-green-600"/> &nbsp;Edit</Button>            
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                    <SheetTitle>Edit {row.accountName}</SheetTitle>
                                    <SheetDescription>
                                        Edit details below and click update.
                                    </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid gap-4 py-4">
                                        <br/>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                            Name
                                            </Label>
                                            <Input id="name" disabled value={row.accountName} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">
                                            Email
                                            </Label>
                                            <Input id="email" value={updateEmail} className="col-span-3" onChange={(e)=>setUpdateEmail(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="mobile" className="text-right">
                                            Mobile
                                            </Label>
                                            <Input id="mobile" value={updateMobile} className="col-span-3" onChange={(e)=>setUpdateMobile(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="mobile" className="text-right">
                                            Map To:
                                            </Label>
                                            {searchingSales ?
                                                <div className="flex flex-row m-12">    
                                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                                    <p className={`${inter.className} ${styles.text3}`}>Loading sales persons...</p> 
                                                </div>
                                                :
                                                // setSelectedMapToPerson(e.target.value)
                                                <Select defaultValue={row.mapTo} onValueChange={(e)=>setSelectedMapToPerson(e)} >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a fruit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                        {/* <SelectLabel>Fruits</SelectLabel> */}
                                                        {allSalesPeople.map((row) => (
                                                        <SelectItem key={row.id} value={row.id} >{row.name}</SelectItem>))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            }
                                        </div>
                                    </div>
                                    <SheetFooter>
                                    <SheetClose asChild>
                                        <Button type="submit" className="bg-blue-600 text-white" onClick={()=>updateDealer(row.id)}>Update</Button>
                                    </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        {row.isActive == 1 ?
                            <Button variant='outline' className="mx-2 px-2 text-red-600" onClick={()=>updateActiveStatus(row.id, 0)}><UserMinus size={24} className="text-red-600"/> &nbsp;Deactivate</Button>
                            : <Button variant='outline' className="mx-2 px-2 text-blue-600" onClick={()=>updateActiveStatus(row.id, 1)}><UserPlus size={24} className="text-blue-600"/> &nbsp;Activate</Button>
                        }
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</Card>
      {/* <DataTable data={allDealers} dataOffset={offset} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/> */}
      {/* <DataTable columns={columns} data={allDealers} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}
      
    </div>
:
<Skeleton className="h-4 w-[500px] h-[120px]" >
    <div className="flex flex-row m-12">    
        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
        <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
    </div>
</Skeleton> 
    


}

    {/* : null} */}



 {/* <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable data={allDealers} columns={columns} />
      </div> 

                 <div className={styles.carddatasection} key={12345} style={{height:'100%',overflow:'scroll'}}>
                       
                    <div className={styles.verticalsection} >
                        <p className={`${inter.className} ${styles.text3_heading}`}>Students</p>
                        <div className={styles.horizontalsection}>
                            <p className={`${inter.className} ${styles.text3_heading}`}>Total:</p>
                            <div className={`${inter.className}`} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px'}}>
                                
                                {searching ? <div className={styles.horizontalsection}>
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                                </div> : ''}
                                <h1>{studentsInCampus}</h1>
                            </div>
                            
                            <div className={`${inter.className}`} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px'}}>
                                
                                <p className={`${inter.className} ${styles.text3_heading}`}>Registered:</p>
                                {searching ? <div className={styles.horizontalsection}>
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                                </div> : ''}
                                <h1>{totalStudents}</h1>
                            </div>
                        </div>
                      </div>
                <div>
                    
                </div>
            </div>  */}
        {/* </div> */}
               
                
        </div>
    
    </div>
    
    
  );
}
