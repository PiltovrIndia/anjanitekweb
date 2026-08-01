'use client'

import { Inter } from 'next/font/google'
import { Check, Info, SpinnerGap, X, Plus, PaperPlaneRight, Checks, CheckCircle } from 'phosphor-react'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { CalendarDays, ImageIcon, Loader2, Megaphone } from 'lucide-react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../../../components/ui/card"
  import { Input } from "../../../components/ui/input"
  import { Label } from "../../../components/ui/label"
  import { Button } from "../../../components/ui/button"
  import { Skeleton } from "../../../components/ui/skeleton"
  import { ScrollArea } from "../../../components/ui/scroll-area"
  import { Separator } from "../../../components/ui/separator"
  import { Textarea } from "../../../components/ui/textarea"
  import { Popover, PopoverContent, PopoverTrigger, } from "../../../components/ui/popover"
  import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
  import { Badge } from "@/app/components/ui/badge"
  
  import { Toaster } from "../../../components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"


  import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../../components/ui/sheet"
import Image from 'next/image'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import firebase from '@/app/firebase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
const storage = getStorage(firebase, "gs://anjanitek-communications.firebasestorage.app");

const getInitials = (name) => {
  const words = String(name || 'Anjani Tek').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
};

const getFeedMediaUrl = (media) =>
  `https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/${media}.webp?alt=media`;

function FeedPostCard({ post, postRef }) {
  const authorName = post.name || post.sender || 'Anjani Tek';
  const hasMedia = Boolean(post.media && post.media !== '-');
  const mediaUrl = hasMedia ? getFeedMediaUrl(post.media) : null;

  return (
    <Card ref={postRef} tabIndex={-1} className="w-full overflow-hidden rounded-md shadow-sm">
      <div className={hasMedia ? 'grid min-w-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]' : ''}>
        {hasMedia ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="group relative order-first h-64 w-full rounded-none p-0 sm:h-80 lg:order-last lg:h-full lg:min-h-[300px]" aria-label={`View image for ${authorName}'s post`}>
                <Image src={mediaUrl} alt="" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <span className="absolute inset-0 flex items-end justify-end bg-black/30 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImageIcon className="h-5 w-5 text-white" />
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>{authorName}&apos;s post image</DialogTitle>
                <DialogDescription>Full-size feed post image.</DialogDescription>
              </DialogHeader>
              <Image src={mediaUrl} alt={`${authorName}'s post`} width={1600} height={1200} sizes="92vw" className="max-h-[92vh] w-full object-contain" />
            </DialogContent>
          </Dialog>
        ) : null}

        <CardContent className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 border">
                <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">{getInitials(authorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{authorName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{post.role || 'Company update'}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-primary">
              <Megaphone className="mr-1 h-3 w-3" />
              Update
            </Badge>
          </div>

          <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-foreground">{post.message}</p>

          <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {dayjs(post.sentAt).add(5, 'hour').add(30, 'minute').format('DD MMM YYYY, h:mm A')}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}


// Create a child reference
// const imagesRef = ref(storage, 'images');
// imagesRef now points to 'images'

// Child references can also take paths delimited by '/'
// const spaceRef = ref(storage, '/');

// const spaceRef = ref(storage, 'images/space.jpg');

////////// APIS /////////
// get the list of users who the admin sent messages
const getFeed = async (pass, offset) => 
fetch("/api/v2/feed/"+pass+"/1/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
// get the list of messages sent and received by a person to the admin
const getSenderMessages = async (pass, sender, receiver) => 
fetch("/api/v2/messaging/"+pass+"/4/"+sender+"/"+receiver, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// send message to a dealer
const sendDealerMessage = async (pass, sender, receiver, sentAt, message, seen, state) =>   
fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
// search dealer by name
const searchDealerByName = async (pass, dealer, offset) =>   
fetch("/api/v2/user/"+pass+"/U2/"+dealer+"/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// send a post to the feed
const sendFeedPost = async (pass, sender, message, media, category) => 
  
    fetch("/api/v2/feed/"+pass+"/0/"+sender+"/"+message+"/"+media+"/"+category, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });



const getPending = async (pass, role, branch) => 
  
fetch("/api/v2/amount/"+pass+"/U5", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get dealer count by location
const getStats = async (pass, role, branch) => 
  
fetch("/api/v2/dealerstats/"+pass+"/0", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// const spaceRef = ref(storage, 'images/space.jpg');
// check for the user
const updateUploadData = async (pass, items1, adminId) => 
// id, paymentAmount, type, transactionId, paymentDate,
// id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
fetch("/api/v2/payments/"+pass+"/web/"+encodeURIComponent(JSON.stringify(items1))+"/"+adminId+"/-", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



// pass state variable and the method to update state variable
export default function Messages() {

    // create a router for auto navigation
    const { toast } = useToast();
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [offset, setOffset] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [imageProgress, setImageProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [items, setItems] = useState([]);
    const [file, setFile] = useState(null); 
    const [mediaName, setMediaName] = useState(null); 
    
    
    const [feedList, setfeedList] = useState([]);
    const [searchedList, setSearchedList] = useState([]);
    const [openSearch, setOpenSearch] = useState(false);
    const lastItemRef = useRef(null);
    
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    
    const [dataFound, setDataFound] = useState(true); // use to declare 0 rows
    const [inputError, setInputError] = useState(false);
    const [dealerSearching, setDealerSearching] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messaging, setMessaging] = useState(false);

    const [outingData, setOutingData] = useState();
    // const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    //create new date object
    const today = new dayjs();
    // const { toast } = useToast()
    
    
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
                setUser(obj)

                // get if receivers data is present
                if(feedList.length == 0){
                    getData();
                }
                
                
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);

    // get the senders data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getData(){
        
        setSearching(true);
        // setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getFeed(process.env.NEXT_PUBLIC_API_PASS, offset)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    // console.log(queryResult.data);
                    // set the state
                    // total students
                        
                    setfeedList(queryResult.data);
                    
                    setDataFound(true);
                    setSearching(false);
                }
                else {
                    
                    setDataFound(false);
                }

                setSearching(false);
                setCompleted(false);
            }
            else {
                
                setSearching(false);
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

    // get messages of a specific receiver
    async function getSenderMessagesData(receiver){
        
        setSearchingMessages(true);
        setfeedList([]);
        // setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, receiver)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    // get the messages list of the receiver
                    setfeedList(queryResult.data);
                    
                    setDataFound(true);
                    setSearchingMessages(false);
                }
                else {
                    
                    setDataFound(false);
                }
                setCompleted(false);
            }
            else {
                
                setSearchingMessages(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            // show and hide message
            setResultType('error');
            setResultMessage('Issue loading. Please refresh or try again later!');
            setTimeout(function(){
                setResultType('');
                setResultMessage('');
            }, 3000);
        }
}
    
    // send message to a specific receiver
    async function sendMessageData(){
        
        setSendingMessage(true);
        // setOffset(offset+10); // update the offset for every call
        var message = document.getElementById('message').value;

        try {    
            console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+selectedReceiver.receiver+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+message+"/0/-");
            // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+row.getValue('appointmentId')+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).collegeId+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).username+"/"+updatedOn+"/"+row.getValue('collegeId'));
            const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,selectedReceiver.receiver,dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),message,"0","-");
        
            // const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, receiver)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            var sentObj = {
                notificationId: 100000,
                sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                receiver: selectedReceiver.receiver,
                sentAt: dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),
                message: document.getElementById('message').value,
                seen: 0,
                state: '-'
            };
            
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                
                    
                    // get the messages list of the receiver
                    setfeedList([...feedList, sentObj]);
                    document.getElementById('message').value = ''; // clear the value
                    
                    toast({description: "Message Sent!",});
                    
                    // set the focus to the created message
                    if (lastItemRef.current) {
                        lastItemRef.current.focus();
                    }
                    
                    setDataFound(true);
                    setSendingMessage(false);
               
                setCompleted(false);
            }
            else {
                
                setSendingMessage(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            // show and hide message
            setResultType('error');
            setResultMessage('Issue loading. Please refresh or try again later!');
            setTimeout(function(){
                setResultType('');
                setResultMessage('');
            }, 3000);
        }
}

const sendPostNow = async (e) => {
    
    setMessaging(true);
    
    try {    
        
        console.log(process.env.NEXT_PUBLIC_API_PASS+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+document.getElementById('message').value+"/"+mediaName+"/update");

        const result  = await sendFeedPost(process.env.NEXT_PUBLIC_API_PASS, 
            JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, document.getElementById('message').value, mediaName, 'update') 
        const queryResult = await result.json() // get data

        var obj = {
            id: queryResult.id,
            sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
            sentAt: dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),
            message: document.getElementById('message').value,
            media: mediaName,
        };
        
        setfeedList([...feedList, obj]);

        // check for the status
        if(queryResult.status == 200){

            setMessaging(false);
            toast("Posted to feed!", {
                description: "To be seen by all dealers",
                action: {
                  label: "Okay",
                  onClick: () => console.log("Okay"),
                },
              });

            setFile(null); // Clear the file input after upload
            toast({ description: `Feed update posted!` });

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
  


    // get the requests data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getDataDetails(items1){
        
        setUploadProgress(true);
        
        try {    
            const result  = await updateUploadData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await result.json() // get data
            console.log("Call2 for Upload...");
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);

                toast("Data is uploaded", {
                    description: "Refresh to view updated data",
                    action: {
                      label: "Okay",
                      onClick: () => console.log("Okay"),
                    },
                  })

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
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

const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);  // Update state
        setImageProgress(true);
        // let upload to firebase storage and get the url
        // lets upload the selected file to the firebase storage and the get the url and then send the url to the api for posting to the feed

        // use this FirebaseStorage.instanceFor(bucket: "gs://anjanitek-communications.firebasestorage.app").ref() to upload
        try {
            // Create a unique folder path/filename (e.g., uploads/1715632900_photo.jpg)
            const uniqueFileName = `${Date.now().toString()}`;
            const storageRef = ref(storage, `${uniqueFileName}.webp`);

            // Upload the raw file bytes to Firebase Storage
            const snapshot = await uploadBytes(storageRef, selectedFile);
            
            // Fetch the secure, shareable public URL of the uploaded asset
            const downloadURL = await getDownloadURL(snapshot.ref);
            setMediaName(uniqueFileName);
            setImageProgress(false);

            // Success! Use the URL as needed
            console.log("File available at:", downloadURL);
            // statusText.innerHTML = `Upload Success! <a href="${downloadURL}" target="_blank">View File</a>`;
            
        } catch (error) {
            setImageProgress(false);
            console.error("Upload failed:", error);
            // statusText.innerText = `Upload failed: ${error.message}`;
        }

        
    } else {
        console.log("No file selected.");
    }
};


    
  return (
    
        <div className={`${inter.className} flex w-full min-w-0 flex-col gap-4 pb-6`}>
            
          <div className='flex w-full flex-row items-center gap-2 py-4' >
              <h1 className='text-xl font-bold'>Feed</h1>
              
              {(!messaging) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Post Update</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Post to the feed</SheetTitle>
                    <SheetDescription>
                        Enter your message for posting it to the feed.
                    </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <br/>
                        {/* <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                            Name
                            </Label>
                            <Input id="name" value="Pedro Duarte" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                            Username
                            </Label>
                            <Input id="username" value="@peduarte" className="col-span-3" />
                        </div> */}

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="image">Image</Label>
                            <Input type="file" id="image" accept="image/*" onChange={handleFileSelect} />
                        </div>

                        {imageProgress ? <div className='flex flex-row text-sm text-gray-400'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;Uploading...</div> : null}

                        {file ? <div className='flex flex-col gap-2'>
                            <p className='text-sm text-gray-600'>Selected file: {file.name}</p>
                            <Image src={URL.createObjectURL(file)} alt="Selected Image" width={200} height={200} className="object-cover rounded-md" />
                         </div> : null}

                         <br/>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Message</Label>
                            <Textarea id="message" placeholder="Type your message here." />
                            
                        </div>
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={sendPostNow} disabled={imageProgress}>Post</Button>
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Posting...</Label>
                </div>
                }
          </div>      

            {/* <div style={{width:'100%',display:'flex', flexDirection:'row',justifyContent:'space-between'}}>
                <div className={styles.horizontalsection}>
                    <div className={`${styles.primarybtn} `} style={{display:'flex', flexDirection:'row', width:'fit-content', cursor:'pointer', gap:'4px'}}> 
                        <Plus />
                        <p className={`${montserrat.className}`}>New circular</p>
                    </div>
                    <div className={`${styles.overlayBackground} ${showAddStudent ? styles.hideshowdivshow : styles.hideshowdiv}`}>
                        <AddStudent toggleAddStudentOverlay={toggleAddStudentOverlay}/> 
                    </div>
                </div>
               
            </div> */}
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
                {/* <CardFooter className="flex justify-between">
                    <Button>Send messages</Button>
                </CardFooter> */}
            </Card> : null}
            <Toaster />
        <main className="w-full min-w-0">

        <div className="w-full">

                <div className="w-full" key={1234}>
                       
                    {/* <div className='flex flex-row gap-2' style={{width:'100%',overflow:'scroll'}}> */}
                        
                    {/* {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> :  */}
                    {/* <ScrollArea className="w-fit rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-medium leading-none">SENT</h4>
                            <div className='flex flex-row items-center gap-2'>
                                <Input type="text" id="search" placeholder="Type dealer name to search" className="my-2 "/>
                                
                                    <Popover open={openSearch} onOpenChange={setOpenSearch}>
                                        <PopoverTrigger asChild><Button variant="outline" >Search</Button></PopoverTrigger>
                                        <PopoverContent>
                                        {
                                            dealerSearching ? 
                                            <div className='flex flex-row text-sm text-gray-400'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;Searching...</div>
                                            : 
                                            <div>
                                                {searchedList.map((searchItem, index) => (
                                                <>
                                                    <li className="flex py-4 first:pt-0 last:pb-0 cursor-pointer" key={index} >
                                                    <Avatar>
                                                        <AvatarImage src="" alt="dealer_image" />
                                                        <AvatarFallback>{searchItem.name.split(' ').map(word => word.slice(0, 1)).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="ml-3 overflow-hidden w-max">
                                                        <p className="text-sm font-medium text-slate-900">{searchItem.name}</p>
                                                        <p className="text-sm text-slate-500 truncate">{searchItem.id}</p>
                                                    </div>
                                                    </li>
                                                </>
                                                
                                                ))}
                                                
                                            </div>
                                        }
                                        <br/>
                                        <Button variant="outline" onClick={() => setOpenSearch(false)}>Close</Button>
                                        </PopoverContent>
                                    </Popover>
                                  
                            </div>
                            {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : 
                            <ul role="list" className="py-2 divide-y divide-slate-200">
                            {feedList.map((receiver, index) => (
                            <>  
                                <li className="flex px-2 py-4 first:pt-0 last:pb-0 cursor-pointer border-l-2 border-blue-600" key={index} >
                                <div className="ml-3 overflow-hidden w-max">
                                    
                                        <p className="text-sm font-medium text-blue-600">{receiver.sender}</p>
                                       
                                    <p className="text-sm text-slate-500 truncate">{receiver.sender}</p>
                                </div>
                                </li>
                            </>
                            
                            ))}
                            </ul>}
                            
                        </div>
                    </ScrollArea> */}
                    

                        <div className="w-full">
                            {/* <div className="flex flex-1 flex-col gap-2">
                                {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> 
                                : <CardTitle className="text-blue-600">Feed</CardTitle>}
                                <CardDescription>Messages</CardDescription>
                            </div> */}
                            
                                
                                {/* <div className="grid w-full items-center gap-4"> */}
                                    {searching ? (
                                      <div className="space-y-4">
                                        <Skeleton className="h-[260px] w-full rounded-md" />
                                        <Skeleton className="h-[260px] w-full rounded-md" />
                                      </div>
                                    ) : (
                                      <div className="flex w-full flex-col gap-4">
                                        {feedList.length > 0 ? feedList.map((message, index) => (
                                          <FeedPostCard key={message.id || `${message.sender}-${message.sentAt}-${index}`} post={message} postRef={index === feedList.length - 1 ? lastItemRef : undefined} />
                                        )) : (
                                          <Card className="w-full rounded-md shadow-none">
                                            <CardContent className="flex min-h-[240px] items-center justify-center pt-6 text-sm text-muted-foreground">
                                              No posts yet.
                                            </CardContent>
                                          </Card>
                                        )}
                                      </div>
                                    )}
                                    
                                {/* </div> */}
                            
                            {/* <div className="flex flex-1 flex-row justify-between gap-2">
                                <Textarea id="message" placeholder="Type your message here." />
                                {sendingMessage ? 
                                    <div className='flex flex-row'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Sending...</div>
                                    : <Button variant='outline' onClick={()=>sendMessageData()} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send Message</Button>
                                }
                            </div> */}
                        </div>
                        {/* </div> */}
                        
                        
                        {/* {(resultMessage.length > 0) ? <Toast type={resultType} message={resultMessage} /> : ''} */}
                    
                <div>
                    
                </div>
            </div>

                
        </div>
               
                
        </main>
    
    </div>
    
    
  );
}
