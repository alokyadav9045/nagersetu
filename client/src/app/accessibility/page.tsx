export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          NagarSetu is committed to ensuring digital accessibility for people with disabilities. 
          We continually improve the user experience for everyone.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Accessibility Features</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Keyboard navigation support</li>
          <li>Screen reader compatibility</li>
          <li>High contrast mode support</li>
          <li>Scalable text and UI elements</li>
          <li>Alternative text for images</li>
          <li>Clear navigation structure</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Standards Compliance</h2>
        <p className="text-gray-600 mb-4">
          Our platform aims to comply with WCAG 2.1 Level AA guidelines and follows modern web accessibility standards.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Feedback and Support</h2>
        <p className="text-gray-600 mb-4">
          If you encounter accessibility barriers or have suggestions for improvement, please contact us:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Email: accessibility@nagarsetu.gov.in</li>
          <li>Phone: +91-11-1234-5678</li>
          <li>Address: Digital India Office, New Delhi</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Ongoing Improvements</h2>
        <p className="text-gray-600 mb-4">
          We regularly audit our platform and implement improvements based on user feedback and accessibility best practices.
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
}