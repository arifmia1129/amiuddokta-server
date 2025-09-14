"use client";
// Production optimizations - disable console logs in production
import "@/lib/productionOptimizations";

// import "jsvectormap/dist/css/jsvectormap.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-quill/dist/quill.snow.css";
import "react-responsive-modal/styles.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="en">
      <body>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {isMounted && <Provider store={store}>{children}</Provider>}
          <ToastContainer position="top-center" />
        </div>
      </body>
    </html>
  );
}
