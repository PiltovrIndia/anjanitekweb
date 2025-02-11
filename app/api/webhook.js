// pages/api/webhook.js
export async function POST(req, res) {
    try {
        const body = req.body;

        // Log the received data
        console.log("Received webhook data:", body);

        // Respond to the WhatsApp Cloud API
        // res.status(200).json({ message: "Webhook received successfully" });
        return Response.json({message: "Webhook received successfully"}, {status: 200})
    } catch (error) {
        console.error("Error processing webhook:", error);
        // res.status(500).json({ message: "Internal Server Error" });
        return Response.json({message: "Internal Server Error"}, {status: 500})
    }
}
export async function GET(req, res) {
    console.log('check');
        
    // Handle webhook verification challenge
    const VERIFY_TOKEN = "WA_ANJANI"; // Use your verification token
    const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully");

        res.status(200).send(challenge); // Echo the challenge back to verify the webhook
    } else {
        res.status(403).json({ message: "Forbidden" });
    }
}
// export default async function handler(req, res) {
//     if (req.method === "POST") {
//         try {
//             const body = req.body;

//             // Log the received data
//             console.log("Received webhook data:", body);

//             // Respond to the WhatsApp Cloud API
//             res.status(200).json({ message: "Webhook received successfully" });
//         } catch (error) {
//             console.error("Error processing webhook:", error);
//             res.status(500).json({ message: "Internal Server Error" });
//         }
//     } else if (req.method === "GET") {
//         console.log('check');
        
//         // Handle webhook verification challenge
//         const VERIFY_TOKEN = "WA_ANJANI"; // Use your verification token
//         const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;

//         if (mode === "subscribe" && token === VERIFY_TOKEN) {
//             console.log("Webhook verified successfully");
//             res.status(200).send(challenge); // Echo the challenge back to verify the webhook
//         } else {
//             res.status(403).json({ message: "Forbidden" });
//         }
//     } else {
//         res.setHeader("Allow", ["POST", "GET"]);
//         res.status(405).json({ message: `Method ${req.method} Not Allowed` });
//     }
// }
