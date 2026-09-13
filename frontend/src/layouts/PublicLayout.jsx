import { Outlet } from "react-router-dom";
import CTASection from "../shared/components/CTASection";
import FloatingWhatsApp from "../shared/navigation/FloatingWhatsApp";
import Footer from "../shared/navigation/Footer";
import Navbar from "../shared/navigation/Navbar";
import TopContactBar from "../shared/navigation/TopContactBar";
import { CustomerAuthProvider } from "../modules/public/account/context/CustomerAuthContext";

/**
 * The customer session is provided here rather than at the app root: it
 * belongs to the website, and the staff portal has its own, entirely
 * separate AuthContext. Wrapping only this subtree keeps the two from
 * ever being confused for one another.
 */
export default function PublicLayout() {
  return (
    <CustomerAuthProvider>
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
    </CustomerAuthProvider>
  );
}
