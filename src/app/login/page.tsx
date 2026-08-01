import LoginFlow from "@/components/auth/LoginFlow";

export const metadata = {
  title: "Login / Register | HinchMart",
  description: "Create an account or sign in to HinchMart. India's largest B2B e-commerce platform.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <h1 className="text-3xl font-black text-[#1a1a2e]">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to access your orders, wishlist, and exclusive B2B prices.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <LoginFlow />
      </div>
    </div>
  );
}
