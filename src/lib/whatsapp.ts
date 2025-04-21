// // This file should only be imported on the server side
// import { Client, LocalAuth } from "whatsapp-web.js";
// import qrcode from "qrcode-terminal";

// let client: Client | null = null;

// // Initialize client once
// export async function initWhatsAppClient(): Promise<Client> {
//   if (client) return client;

//   client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     },
//   });

//   client.on("qr", (qr: string) => {
//     console.log("QR RECEIVED:");
//     qrcode.generate(qr, { small: true });
//   });

//   client.on("ready", () => {
//     console.log("Client is ready!");
//   });

//   await client.initialize();
//   return client;
// }

// export async function sendMessage(to: string, message: string) {
//   const whatsapp = await initWhatsAppClient();
//   return whatsapp.sendMessage(to, message);
// }
