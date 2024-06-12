'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Lock } from 'phosphor-react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../app/page.module.css'

import { Card } from "@/app/components/ui/card"
import { Accordion } from "@/app/components/ui/accordion"
import { Button } from "@/app/components/ui/button"

// pass state variable and the method to update state variable
export default function PrivacyPolicy() {
    
  return (
    

    
    <main className={styles.main}>
      <div className={styles.description}>
        
        
    <div  style={{ padding: '20px' }}>
      <p className="text-xl font-bold" style={{ marginBottom: '20px' }}>Welcome to Anjani Tek Support</p>

      {/* Getting Started Section */}
     
        <p className="font-bold text-l text-zinc-900">1. Getting Started</p>
        <br/>
        <p className="font-semibold text-l text-zinc-900">Download and Installation</p>
          <ul class="list-disc">
            <li>Visit the App Store or Google Play Store.</li>
            <li>Search for Anjani Tek and click on the app icon.</li>
            <li>Tap Install and wait for the app to download and install on your device.</li>
          </ul>
          <br/>
        <p className="font-semibold text-l text-zinc-900">Creating an Account</p>
          <ul class="list-disc">
            <li>Open the app and select Get started.</li>
            <li>Fill in the required fields with your information using OTP based authentication.</li>
            <li>Verify your Phone number to activate your account.</li>
          </ul>
          <br/>
        <p className="font-semibold text-l text-zinc-900">First Steps</p>
          <ul class="list-disc">
            <li>Upon logging in, follow the experience to familiarize yourself with the app layout.</li>
            <li>Explore the dashboard and access initial features like viewing the outstanding payment, etc.</li>
          </ul>

          <br/>
        <p className="font-bold text-l text-zinc-900">2. Frequently Asked Questions (FAQs)</p>
        <br/>
        <p className="font-semibold text-l text-zinc-900">How to use the app effectively for business growth?</p>
        <p>Regularly check your outstanding and reach out to the sales team to stay updated with managing your business with Anjani Tek.</p>
          
          

          <br/>
        <p className="font-bold text-l text-zinc-900">3. Tips for Using Anjani Tek</p>
        <br/>
          <ul class="list-disc">
            <li>Utilize Notifications section to view updates from Anjani Tek.</li>
            <li>Explore various sections of the app regularly to find new features and resources.</li>
          </ul>
          <br/>

      {/* Privacy and Security */}
      
        <p className="font-bold text-l text-zinc-900">4. Privacy and Security</p>
        <br/>
        <p>All personal data is encrypted and stored securely. Our comprehensive privacy policy details how we handle your information.</p>
        <br/>
      
        <p className="font-bold text-l text-zinc-900">5. Account and Data Deletion</p>
        <br/>
        <p>Please write to piltovrindia@gmail.com to request for deleting your account+data associated with it or just some or all data associated with yor account. We would revert in 24 hours to resolve the same.</p>
        <br/>
      
        <p className="font-bold text-l text-zinc-900">6. Contact Us</p>
        <br/>
        <p>Email: <a href="mailto:piltovrindia@gmail.com">piltovrindia@gmail.com</a></p>
        <p>Follow us on instagram for updates and community engagement.</p>
        <br/>
      
        <p className="font-bold text-l text-zinc-900">Conclusion</p>
        <br/>
        <p>We are here to assist you on your journey with Anjani Tek app. We value your commitment to grow your business with Anjani Tek and are excited to be a part of your journey.</p>
        <br/>

      
    </div>
    </div>
    </main>
    
  );
}
