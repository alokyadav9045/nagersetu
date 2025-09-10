export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">
          Welcome to NagarSetu. By using our civic issue reporting platform, you agree to these terms.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Service Description</h2>
        <p className="text-gray-600 mb-4">
          NagarSetu is a platform that enables citizens to report civic issues and track their resolution.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. User Responsibilities</h2>
        <p className="text-gray-600 mb-4">
          Users must provide accurate information and use the platform responsibly.
        </p>
        <p className="text-sm text-gray-500 mt-8">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
}