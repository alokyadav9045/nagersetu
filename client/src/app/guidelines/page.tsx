export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Community Guidelines</h1>
        <div className="prose max-w-none">
          <p className="text-muted-foreground mb-6">
          These guidelines help ensure NagarSetu remains a productive platform for civic engagement.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">Reporting Issues</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
          <li>Provide clear, accurate descriptions of issues</li>
          <li>Include relevant photos when possible</li>
          <li>Use appropriate priority levels</li>
          <li>Provide precise location information</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">Community Interaction</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
          <li>Be respectful in comments and interactions</li>
          <li>Vote responsibly on issues</li>
          <li>Avoid duplicate reports</li>
          <li>Use constructive language</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">Prohibited Content</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
          <li>False or misleading information</li>
          <li>Personal attacks or harassment</li>
          <li>Spam or irrelevant content</li>
          <li>Content violating privacy or safety</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">Enforcement</h2>
          <p className="text-muted-foreground mb-4">
          Violations may result in content removal, account suspension, or permanent ban.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: January 2025
          </p>
        </div>
        {/* Hindi translation */}
        <div className="border-t border-border mt-10 pt-8" />
        <h1 className="text-3xl font-bold mb-6 text-foreground">समुदाय दिशानिर्देश (हिंदी)</h1>
        <section lang="hi" className="prose max-w-none">
          <p className="text-muted-foreground mb-6">
            ये दिशानिर्देश सुनिश्चित करते हैं कि नगरसेतु नागरिक सहभागिता के लिए एक उपयोगी और उत्पादक मंच बना रहे।
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">समस्याएं रिपोर्ट करना</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>समस्याओं का स्पष्ट और सटीक विवरण प्रदान करें</li>
            <li>संभव हो तो संबंधित फ़ोटो संलग्न करें</li>
            <li>उचित प्राथमिकता स्तर का चयन करें</li>
            <li>सटीक स्थान की जानकारी दें</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">सामुदायिक सहभागिता</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>टिप्पणियों और संवाद में सम्मानजनक रहें</li>
            <li>मुद्दों पर जिम्मेदारी से वोट करें</li>
            <li>डुप्लीकेट रिपोर्ट से बचें</li>
            <li>सकारात्मक और रचनात्मक भाषा का प्रयोग करें</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">निषिद्ध सामग्री</h2>
          <ul className="list-disc pl-6 text-muted-foreground mb-4">
            <li>झूठी या भ्रामक जानकारी</li>
            <li>व्यक्तिगत हमले या उत्पीड़न</li>
            <li>स्पैम या अप्रासंगिक सामग्री</li>
            <li>गोपनीयता या सुरक्षा का उल्लंघन करने वाली सामग्री</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">प्रवर्तन</h2>
          <p className="text-muted-foreground mb-4">
            उल्लंघन की स्थिति में सामग्री हटाई जा सकती है, खाता निलंबित किया जा सकता है या स्थायी प्रतिबंध लगाया जा सकता है।
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            अंतिम अद्यतन: जनवरी 2025
          </p>
        </section>
      </div>
    </div>
  );
}