export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Guidelines</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          These guidelines help ensure NagarSetu remains a productive platform for civic engagement.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Reporting Issues</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Provide clear, accurate descriptions of issues</li>
          <li>Include relevant photos when possible</li>
          <li>Use appropriate priority levels</li>
          <li>Provide precise location information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Community Interaction</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Be respectful in comments and interactions</li>
          <li>Vote responsibly on issues</li>
          <li>Avoid duplicate reports</li>
          <li>Use constructive language</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Prohibited Content</h2>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>False or misleading information</li>
          <li>Personal attacks or harassment</li>
          <li>Spam or irrelevant content</li>
          <li>Content violating privacy or safety</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Enforcement</h2>
        <p className="text-gray-600 mb-4">
          Violations may result in content removal, account suspension, or permanent ban.
        </p>

        <p className="text-sm text-gray-500 mt-8">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
}