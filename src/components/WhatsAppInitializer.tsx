// "use client";

// import { useState, FormEvent } from "react";
// import {
//   initializeWhatsApp,
//   sendWhatsAppMessage,
// } from "@/app/actions/whatsapp-actions";

// export default function WhatsAppInitializer() {
//   const [status, setStatus] = useState<string>("Not initialized");
//   const [number, setNumber] = useState<string>("");
//   const [message, setMessage] = useState<string>("");

//   const handleInit = async () => {
//     setStatus("Initializing...");
//     const result = await initializeWhatsApp();
//     setStatus(
//       result.success
//         ? "Ready (check console for QR code)"
//         : `Error: ${result.error}`,
//     );
//   };

//   const handleSend = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!number || !message) return;

//     const formattedNumber = `${number}@c.us`;
//     const result = await sendWhatsAppMessage(formattedNumber, message);

//     if (result.success) {
//       setMessage("");
//       alert("Message sent successfully!");
//     } else {
//       alert(`Error: ${result.error}`);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="mb-4 text-xl font-bold">WhatsApp Web Integration</h2>
//       <div className="mb-4">
//         <button
//           onClick={handleInit}
//           className="rounded bg-blue-500 px-4 py-2 text-white"
//         >
//           Initialize WhatsApp
//         </button>
//         <p className="mt-2">Status: {status}</p>
//       </div>

//       <form onSubmit={handleSend} className="space-y-4">
//         <div>
//           <label className="mb-1 block">Phone Number (without +):</label>
//           <input
//             type="text"
//             value={number}
//             onChange={(e) => setNumber(e.target.value)}
//             className="w-full rounded border p-2"
//             placeholder="e.g. 14155552671"
//           />
//         </div>
//         <div>
//           <label className="mb-1 block">Message:</label>
//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             className="w-full rounded border p-2"
//             rows={3}
//           ></textarea>
//         </div>
//         <button
//           type="submit"
//           className="rounded bg-green-500 px-4 py-2 text-white"
//         >
//           Send Message
//         </button>
//       </form>
//     </div>
//   );
// }
