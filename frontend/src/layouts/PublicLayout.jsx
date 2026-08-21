import { Outlet } from "react-router-dom";
import CTASection from "../shared/components/CTASection";
import FloatingWhatsApp from "../shared/navigation/FloatingWhatsApp";
import Footer from "../shared/navigation/Footer";
import Navbar from "../shared/navigation/Navbar";
import TopContactBar from "../shared/navigation/TopContactBar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-ivory">
      <TopContactBar />
      <Navbar />
      <main>
        <Outlet />
        <CTASection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
