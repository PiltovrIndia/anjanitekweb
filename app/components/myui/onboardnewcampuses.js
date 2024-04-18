'use client'

import Registration from '../../(features)/(campus)/registration/form/page'
import Dashboard from '../../(features)/(campus)/dashboard/page'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { SpinnerGap } from 'phosphor-react'
import { useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import Biscuits from 'universal-cookie'
import styles from '../../page.module.css'
import { useRouter } from 'next/navigation'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import Toast from './toast';
import PrivacyPolicy from '@/app/(features)/privacy/page'
import Vertification from './verification'

// declare the apis of this page
  const verifyUser = async (pass, id, otp) => 
  
    fetch("/api/verify/"+pass+"/"+id+"/"+otp+"/"+generateDeviceID()+"/"+dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss'), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
   
    // Function to generate a random string
    function generateDeviceID() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

// verification using college Id
// In future, based on the type of the user verification can be succeded
// If the user is found in the database, OTP will be sent for the user mobile number based on the user type
// incase parent is logging in on behalf of student, the OTP is sent to parent's number
// After verification, data is saved in local storage
export default function OnboardNewCampuses() {
    
    // create a router for auto navigation
    const router = useRouter();
        
    // session variable to track login
    const [session, setSession] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [userFound, setuserFound] = useState(false);
    const [errorMsg, seterrorMsg] = useState('');

    const [otpSent, setotpSent] = useState(false);
    const [verifyOtpMsg, setverifyOtpMsg] = useState('');
    const [otp, setOTP] = useState()

    const [infoMsg, setinfoMsg] = useState(false);
    const [user, setUser] = useState();

    // this is to save the jsonResult for verification
    const [queryResult, setQueryResult] = useState(); 
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


    useEffect(()=>{
        // Retrieve the cookie
        let cookieValue = biscuits.get('sc_user_detail')
        // let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)sc_user_detail\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if(cookieValue){
            const obj = JSON.parse(decodeURIComponent(cookieValue))
            
            // for now, only admins can login in to this portal
            if(obj.role == 'SuperAdmin' || obj.role == 'Admin' || obj.role == 'OutingAdmin' || obj.role == 'OutingIssuer')
            {
                setSession(true)
                // router.push('/dashboard')
                router.push('/dashboard')
            }
            else if(obj.role == 'Student' || obj.role == 'student'){
                setSession(true)
                // router.push('/dashboard')
                router.push('/profileupdate')
            }
            else {

            }
        }
        else{
            setSession(false)
            // console.log('Not found')
        }
    },[session]);
 
     // Function to handle the "Enter" key press
     const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            loginHere();
        }
    };
    
    // Function to handle the "Enter" key press
     const handleOTPKeyPress = (event) => {
        if (event.key === 'Enter') {
            verifyOTP();
        }
    };

// verify the collegeId by calling the API
async function loginHere(){

    try{
        // check for the input
        if(document.getElementById('collegeId').value.length > 0){

            var otp = Math.floor(1000 + Math.random() * 9000);
            setOTP(otp);
            console.log(otp);

            // show the loading.
            setuserFound(true);
            setotpSent(false);
            
            // call the api using secret key and collegeId provided
            const result  = await verifyUser(process.env.NEXT_PUBLIC_API_PASS, document.getElementById('collegeId').value, otp)
            const resultData = await result.json() // get data
            setQueryResult(resultData); // store data
            
            // check if query result status is 200
            // if 200, that means, user is found and OTP is sent
            if(resultData.status == 200) {
                
                // set the state variables with the user data
                setUser(resultData.data)
                setUsername(resultData.data.username)
                setEmail(resultData.data.email)
                setPhone(resultData.data.phoneNumber)

                // save the data to local cookie
                // let jsonString = JSON.stringify(queryResult.data)
                // biscuits.set('sc_user_detail', encodeURIComponent(jsonString), {path: '/', expires: new Date(Date.now() + 300000)})
                // document.cookie = "sc_user_detail="+encodeURIComponent(jsonString)+ "; expires=" + new Date(Date.now() + 300000).toUTCString() + "; path=/";

                // Retrieve the cookie
                // let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)sc_user_detail\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                // let cookieValue = biscuits.get('sc_user_detail')
                // const obj = JSON.parse(decodeURIComponent(cookieValue))
                
                // call the OTP api
                // const otpResult = sendOTP()

                // As OTP is already sent, show the OTP prompt text field

                // for now, only allow if user is admin
                if(resultData.data.role == 'SuperAdmin' || resultData.data.role == 'Admin' || resultData.data.role == 'OutingAdmin' || resultData.data.role == 'OutingIssuer'){
                    // otp sent
                    setotpSent(true)
                }
                else if(resultData.data.role == 'Student' || resultData.data.role == 'student'){
                    // otp sent
                    setotpSent(true)
                }
                else {
                    // block the user
                    setuserFound(false);
                    setotpSent(false);
                    seterrorMsg('You do not have enough permissions to login. Contact your campus administrator.')
                }
                // if(true){
                //     // otp sent
                //     setotpSent(true)
                // }
            }
            else if(resultData.status == 404) {

                seterrorMsg('No match found. Contact your campus administrator.')
                setuserFound(false)
                setinfoMsg(true) // show the big info message about reaching out
                // otp sent
                setotpSent(false)
            }
            
        }
        else {
            // show error incase of no input
            seterrorMsg('Enter your college registered number')
        }
    }
    catch(e){
        
        setuserFound(false);
        setotpSent(false);

        // show and hide message
        setResultType('error');
        setResultMessage('Error reaching server. Please try again later!');
        setTimeout(function(){
            setResultType('');
            setResultMessage('');
        }, 3000);
    }
}

// clear cookies
function clearCookies(){

     // clear cookies
    //  document.cookie = "";
     biscuits.remove('sc_user_detail')

     // clearing the state variable
     setUsername(''),setPhone(''),setuserFound(false),seterrorMsg(''),setotpSent(false),setverifyOtpMsg(''),setOTP(),setinfoMsg(false),setUser()
     
}


    // set ShowLogin
    async function setShowLoginNow(){
        router.push('/onboard')
        // setShowLogin(!showLogin)
    }
    // Privacy Policy
    async function showPrivacy(){
        router.push('/privacy')
    }
    // Show Cookies
    async function showCookies(){
        router.push('/aboutcookies')
    }
    // Show Piltovr
    async function showPiltovr(){
        window.location.href = 'https://piltovr.com'
    }
    // Show Facebook
    async function showFacebook(){
        window.location.href = 'https://www.facebook.com/profile.php?id=61553276720288'
    }
    // Show LinkedIn
    async function showLinkedIn(){
        window.location.href = 'https://www.linkedin.com/company/piltovr/'
    }
    // Show LinkedIn
    async function checkDownload(){
        
        // var fallbackLink = 'https://smartcampus.tools/' + window.location.search + window.location.hash;

// console.log(window.navigator.platform.toLocaleLowerCase() );
        // Helper functions for device detection
        // const isMobile = () => navigator.userAgent.match(/iPad|iPhone|iPod|Android/i);
        // const isAndroid = () => navigator.userAgent.match(/Android/i);



        // Redirect to custom app or fallback
        // const redirectToAppOrFallback = () => {
            // const loader = document.getElementById('loader');

            // Attempt to load custom protocol in iframe for mobile devices
            
if(window.navigator.platform.toLocaleLowerCase().includes('iphone')){
    window.location.href =  'https://apps.apple.com/app/id1616440644';
}
else {
    window.location.href =  'https://play.google.com/store/apps/details?id=tools.smartcampus.platform&hl=en-IN';
}
                
                
            // loader.src = 'custom-protocol://my-app' + window.location.search + window.location.hash;
            // fallbackLink = isAndroid() ? 'https://play.google.com/store/apps/details?id=tools.smartcampus.platform&hl=en-IN' : 'https://apps.apple.com/app/id1616440644';
            

            // Redirect to fallback link if app didn't handle the request
            // window.setTimeout(() => window.location.replace(fallbackLink), 1);
        // };

        // Initialize redirection
        // redirectToAppOrFallback();

        // Return JSX element for compatibility with frameworks
        // return <iframe id="loader" style={{ display: 'none', height: 0, width: 0 }} />;
    }


  
  
  return (
    // based on the available list, show the Load more CTA 

    
    <div>
        
        {(session) ? 
        //   <Registration />
          <Dashboard />
          : 
        //   (showLogin) ? <Vertification/> :
          
        <div className='flex flex-col items-center gap-4' style={{backgroundColor:'#000000'}}>
            
            <button id="submit" onClick={setShowLoginNow} className={`${inter.className} ${styles.text2} ${styles.secondarybtn}`} style={{position:'absolute', margin:'8px',right:'0px'}}>Web Login</button>
            
            <div className={styles.section_one} style={{backgroundImage: 'url("/circles_bg.png")', backgroundSize: 'cover', width: '100vw',backgroundPosition: '82%', backgroundPositionX:'center', backgroundRepeat: 'no-repeat'}}>
            <br/><br/>
            <div className='flex' style={{marginTop:'-340px'}}>
                <div style={{marginTop:'-140px', width: '362px',height: '362px',borderRadius:' var(--None, 362px)', background: '#FFCB7C',filter: 'blur(150px)'}}></div>
                <div style={{marginTop:'-140px', width: '362px',height: '362px',borderRadius:' var(--None, 362px)', background: '#FF93F4',filter: 'blur(150px)'}}></div>
            </div> 
            <div className="flex flex-col items-center"style={{marginTop:'180px'}}>
              <Image src="/sc_website_logo.svg" alt="Smart Campus" width={123} height={77} priority style={{height:'auto'}} />
              <h1 className='text-5xl font-semibold pb-4 text-white text-center'>Smart Campus</h1>
              <div className='text-3xl font-light text-white text-center'>Entire Campus in Your Pocket.</div>
              <br/>
              <div className='text-l font-light text-neutral-400 text-center'>*1.5 lakh mins of collective academic time saved/year</div>
              <br/><br/>
              
            <div>
                {isMobile ? (
                    // <p>You are on a mobile device.</p>
                    <button id="submit" onClick={checkDownload} className={`${inter.className} ${styles.text2} ${styles.primarybtn}`}>Download App Now</button>
                ) : (
                    <div className='text-xl font-light text-white text-center'>Install app from PlayStore and AppStore.</div>
                )}
            </div> 

              
                <br/>
                <div className='text-l font-light text-neutral-400 text-center p-4'>Get onboard and adapt to more modern ways to manage your campus with our digital & smart platform.</div>
                <br/>
                <br/>
                
                
            </div>
            
            <br/>
            
            
            </div>


            {/* <div className='flex' style={{marginTop:'-140px', marginLeft:'400px'}}>
                <div style={{marginTop:'-140px', width: '362px',height: '162px',borderRadius:' var(--None, 362px)', background: '#FFCB7C',filter: 'blur(150px)'}}></div>
                <div style={{marginTop:'-140px', width: '362px',height: '162px',borderRadius:' var(--None, 362px)', background: '#FF93F4',filter: 'blur(150px)'}}></div>
            </div>  */}
           

        <div className='flex flex-wrap' style={{border: '1px solid #ffffff', borderRadius:'40px', marginTop:'80px', padding: '40px',background: '#ffffff',width: '90vw'}}>
            <div className='flex flex-col grow w-64 gap-5'>
                <div className='text-3xl font-semibold pb-4 text-black text-left'>Revolutionising identity management with Campus QR</div>
                <div className='text-sm text-gray-500 text-left'>Experience the convenience of a single QR code for campus access, replacing traditional ID cards and streamlining authentication across campus facilities and services.</div>
            </div>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/campusqr.png" alt="Smart Campus" width={430} height={77} priority style={{height:'auto'}}/>
            </div>
        </div>
        <br/>
        <div className='flex flex-wrap' style={{border: '1px solid #ffffff', borderRadius:'40px', padding: '40px',background: '#ffffff',width: '90vw'}}>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/outing.png" alt="Smart Campus" width={430} height={77} priority style={{height:'auto'}}/>
            </div>
            <div className='flex flex-col grow w-64 gap-5'>
                <div className='text-3xl font-semibold pb-4 text-black text-left'>Seamlessly Manage Trips for Student Safety</div>
                <div className='text-sm text-gray-500 text-left'>Enhance student safety and administrative efficiency by effortlessly organizing and overseeing hostel outings, ensuring smooth coordination and adherence to campus protocols.</div>
            </div>
        </div>
        <br/>
        <div className='flex flex-wrap' style={{border: '1px solid #ffffff', borderRadius:'40px', padding: '40px',background: '#ffffff',width: '90vw'}}>
            <div className='flex flex-col grow w-64 gap-5'>
                <div className='text-3xl font-semibold pb-4 text-black text-left'>Efficient Circulars & Notifications for Campus Admins</div>
                <div className='text-sm text-gray-500 text-left'>Keep campus stakeholders updated instantly and effectively, fostering clear communication and timely dissemination of information</div>
            </div>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/circulars.png" alt="Smart Campus" width={430} height={77} priority style={{height:'auto'}}/>
            </div>
        </div>
        <br/>
        <div className='flex flex-wrap' style={{border: '1px solid #ffffff', borderRadius:'40px', padding: '40px',background: '#ffffff',width: '90vw'}}>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/attendance.png" alt="Smart Campus" width={430} height={77} priority style={{height:'auto'}}/>
            </div>
            <div className='flex flex-col grow w-64 gap-5'>
                <div className='text-3xl font-semibold pb-4 text-black text-left'>Track Attendance with Ease</div>
                <div className='text-sm text-gray-500 text-left'>Effortlessly oversee student attendance, foster accountability, and enhance class organization through our intuitive attendance monitoring solution.</div>
            </div>
        </div>
        <br/>
        <div className='flex flex-wrap' style={{border: '1px solid #ffffff', borderRadius:'40px', padding: '40px',background: '#ffffff',width: '90vw'}}>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/sclogo_new.png" alt="Smart Campus" width={80} height={77} priority style={{height:'auto'}}/>
            </div>
            <div className='flex flex-col grow w-64 gap-5'>
                <div className='text-3xl font-semibold pb-4 text-black text-center'>Bundled with many more features that can be customized to your campus needs</div>
            </div>
            <div className='flex flex-col grow w-36 items-center'>
                <Image src="/sclogo_new.png" alt="Smart Campus" width={80} height={77} priority style={{height:'auto'}}/>
            </div>
        </div>
        <br/>

            <div className='text text-sm text-slate-200 text-muted-foreground' onClick={showPiltovr} style={{cursor:'pointer'}}>A Piltovr Product</div>

            <div className='flex flex-row gap-4'>
                <div className='text text-sm text-slate-400 text-muted-foreground' onClick={showLinkedIn} style={{cursor:'pointer'}}>LinkedIn</div>
                <div className='text text-sm text-slate-400 text-muted-foreground' onClick={showFacebook} style={{cursor:'pointer'}}>Facebook</div>
                <div className='text text-sm text-slate-400 text-muted-foreground' onClick={showPrivacy} style={{cursor:'pointer'}}>Privacy Policy</div>
                <div className='text text-sm text-slate-400 text-muted-foreground' onClick={showCookies} style={{cursor:'pointer'}}>Cookies</div>
            </div>
            <br/>
        </div>



            
     } 
    </div>
    
    
  );
}
