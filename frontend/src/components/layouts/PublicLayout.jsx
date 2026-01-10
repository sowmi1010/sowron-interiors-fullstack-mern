import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../ui/Navbar.jsx";
import Footer from "../ui/Footer.jsx";
import FloatingActions from "../ui/FloatingActions.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] text-white font-poppins">
      {/* Navbar always visible */}
      <Navbar />

      {/* Page Content */}
      <main role="main" className="">
        {/* SEO Main Heading for Google */}
        <h1 className="sr-only">Sowron Interiors – Best Interior Designers in India</h1>

        <Suspense
          fallback={
            <div className="text-center text-gray-400 p-10">Loading...</div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {/* Floating CTA Buttons */}
      <FloatingActions />

      {/* Footer */}
      <Footer />
    </div>
  );
}
