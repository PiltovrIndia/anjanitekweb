// import jwt from 'jsonwebtoken';
// import path from 'path';
// import fs from 'fs';
import { Keyverify } from '../../../secretverify';

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// const PRIVATE_KEY_PATH = path.join(process.cwd(), 'keys/AuthKey_792XM95A87.p8');
const PRIVATE_KEY_PATH = path.join(process.cwd(), '');
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
console.log(privateKey);

        // Generate JWT token
        const generateToken = () => {
            
            // const payload = {
            //     "iss": "c138d4e2-b59d-4fb3-9a49-b55f3293254b",
            //     "exp": 1732959137,
            //     "aud": "appstoreconnect-v1",
            //     "iat": 1732957337
            //   };
            // const payload = {
            //     iss: ISSUER_ID,
            //     exp: now + 1800, // Token valid for 30 minutes
            //     aud: 'appstoreconnect-v1',
            // };
            // const headers = {
            //     "alg": "ES256",
            //     "typ": "JWT",
            //     "kid": "GHV3YWZ534"
            //   };
            // const headers = {
            //     alg: 'ES256',
            //     kid: 'KEY_ID',
            //     typ: 'JWT',
            // };
            const token = jwt.sign(
                {
                "iss": "c138d4e2-b59d-4fb3-9a49-b55f3293254b",
                "exp": 1732925640,
                "aud": "appstoreconnect-v1",
                "scope": [
                    "GET /v1/apps?filter[platform]=IOS"
                ]
            }, 
            privateKey, 
            { algorithm: 'ES256', 
                header: {
                    "alg": "ES256",
                    "kid": "792XM95A87",
                    "typ": "JWT"
                } 
            });

            return token;
        };

export async function GET(request,{params}) {
// export default async function handler(req, res) {

    if(await Keyverify(params.ids[0])){

        // Replace with your key details
        const KEY_ID = process.env.KEY_ID;
        const ISSUER_ID = process.env.ISSUER_ID;

        // Read the private key from the server file system
        // const PRIVATE_KEY_PATH = path.join(process.cwd(), 'app/lib/AuthKey_63UUW59CJV.p8');
    

        try {
            const token = generateToken();
console.log(token);

            // Replace with your app's identifier
            const appId = '6498621857';
            // const url = `https://api.appstoreconnect.apple.com/v1/apps/${appId}/appMetrics`;
            const url = 'https://api.appstoreconnect.apple.com/v1/apps';


            const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
            //   return res.status(response.status).json({ error: `Failed to fetch data: ${response.statusText}` });
                return Response.json({status: 200, error:`Failed to fetch data! ${response.statusText} `})
            }

            // const data = await response.json();
            // console.log(data);
            
            // const installations = data.data.attributes.installations;
            
            

            // return res.status(200).json({ installations });
            return Response.json({status: 200, installations: installations}, {status: 200})
        } catch (error) {
            console.error('Error fetching installations:', error.message);
            // return res.status(500).json({ error: 'Internal server error' });
            return Response.json({status: 500, error: 'Internal server error'}, {status: 500})
        }

    }
    else {
        return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
    }
}