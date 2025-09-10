export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">
          Your privacy is important to us. This policy explains how NagarSetu collects, uses, and protects your information.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Account information (name, email, phone)</li>
          <li>Issue reports and associated images</li>
          <li>Location data for issue reporting</li>
          <li>Usage analytics and performance data</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>To facilitate civic issue reporting and resolution</li>
          <li>To communicate with you about your reports</li>
          <li>To improve our services</li>
          <li>To ensure platform security and prevent abuse</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Data Security</h2>
        <p className="text-gray-600 mb-4">
          We implement industry-standard security measures to protect your data, including encryption and secure database storage.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Contact Us</h2>
        <p className="text-gray-600 mb-4">
          If you have questions about this privacy policy, contact us at privacy@nagarsetu.gov.in
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
}