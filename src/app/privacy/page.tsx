export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Privacy Policy</h1>
        
        <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-wider">Last Updated: October 2026</p>
        
        <h3 className="text-xl font-bold text-slate-800">1. Information We Collect</h3>
        <p className="text-slate-600">
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, business details (GSTIN), and other information you choose to provide.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">2. Use of Information</h3>
        <p className="text-slate-600">
          We may use the information we collect about you to:
        </p>
        <ul className="text-slate-600">
          <li>Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, and develop new features.</li>
          <li>Perform internal operations necessary to provide our Services, including troubleshooting software bugs and operational problems.</li>
          <li>Send you communications we think will be of interest to you, including information about products, services, promotions, and news.</li>
        </ul>

        <h3 className="text-xl font-bold text-slate-800 mt-8">3. Sharing of Information</h3>
        <p className="text-slate-600">
          We may share the information we collect about you with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf. For B2B orders, we share your delivery details with our verified logistics partners.
        </p>
      </div>
    </div>
  );
}
