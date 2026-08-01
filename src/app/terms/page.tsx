export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Terms and Conditions</h1>
        
        <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-wider">Last Updated: October 2026</p>
        
        <h3 className="text-xl font-bold text-slate-800">1. Acceptance of Terms</h3>
        <p className="text-slate-600">
          By accessing and using HINCHMART ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">2. B2B Trading & KYC</h3>
        <p className="text-slate-600">
          HINCHMART primarily serves Business-to-Business (B2B) clients. Certain features, such as Corporate Credit and Bulk RFQs, require verified GST and KYC documentation. We reserve the right to suspend accounts that provide false information.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">3. Pricing and Availability</h3>
        <p className="text-slate-600">
          Prices and availability of products and services are subject to change without notice. In the event of a pricing error, HINCHMART reserves the right to cancel any orders placed for the item at the incorrect price.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">4. Professional Services</h3>
        <p className="text-slate-600">
          Professional services booked through the platform are fulfilled by verified independent contractors. While HINCHMART conducts background checks, we are not liable for direct damages arising from the service execution beyond the booking value.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">5. Rental Equipment</h3>
        <p className="text-slate-600">
          Rented equipment remains the property of the vendor. The lessee is responsible for any damage occurring during the rental period beyond normal wear and tear. Security deposits will be adjusted accordingly.
        </p>
      </div>
    </div>
  );
}
