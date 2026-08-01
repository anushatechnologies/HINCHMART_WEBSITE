export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Returns & Refund Policy</h1>
        
        <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-wider">Last Updated: October 2026</p>
        
        <h3 className="text-xl font-bold text-slate-800">1. Standard Returns</h3>
        <p className="text-slate-600">
          Due to the nature of industrial and bulk construction materials, returns are generally only accepted if the product is defective, damaged during transit by our logistics partners, or does not match the specifications provided at the time of ordering. Claims must be raised within 7 days of delivery.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">2. Professional Services & Rentals</h3>
        <p className="text-slate-600">
          - <strong>Services</strong>: Cancellations made at least 24 hours prior to the scheduled service time are fully refundable. Cancellations within 24 hours may incur a cancellation fee.<br/>
          - <strong>Rentals</strong>: Early returns of rental equipment do not qualify for a pro-rated refund. The security deposit will be refunded within 5-7 business days post inspection of returned equipment.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8">3. Refund Process</h3>
        <p className="text-slate-600">
          Approved refunds will be processed to the original source of payment within 5-10 business days. For Corporate Credit accounts, the refund amount will be credited back to the available limit immediately upon approval.
        </p>
      </div>
    </div>
  );
}
