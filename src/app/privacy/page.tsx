import PageTransition from "@/components/PageTransition";

export default function PrivacyPolicy() {
  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground font-display">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground font-light leading-relaxed">
          <p className="mb-4 text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Neubofy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, interact with our platform as a Business Client, or operate as an Independent Partner within our technology orchestration network.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">2. Information We Collect</h2>
          <p className="mb-4">
            The data we collect depends on your interaction with Neubofy:
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-foreground/90">For Business Clients</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Contact Information:</strong> Names, business emails, phone numbers, and company details.</li>
            <li><strong>Business & Project Information:</strong> Descriptions of business problems, desired outcomes, technical requirements, timelines, and budgets submitted through our intake forms.</li>
            <li><strong>Uploaded Files:</strong> Attachments, documentation, or specifications provided during the project orchestration phase.</li>
            <li><strong>Communication Data:</strong> Records of communications between you and Neubofy regarding project coordination and delivery.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3 text-foreground/90">For Independent Partners</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity & Contact Information:</strong> Names, emails, and professional identities.</li>
            <li><strong>Professional Information:</strong> Skills, specializations (e.g., AI, Security, QA), experience levels, programming proficiencies, and tools utilized.</li>
            <li><strong>Portfolio & Links:</strong> URLs to portfolios, GitHub repositories, or previous work examples.</li>
            <li><strong>Project-Related Information:</strong> Availability, preferred project types, expected rates, and performance data related to coordinated projects and verification outcomes.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3 text-foreground/90">For Website Visitors</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Technical Information:</strong> Basic analytics such as browser type, operating system, and general interaction data to ensure the website functions correctly. <em>(Note: We do not aggressively track visitors unless legally required or necessary for site functionality).</em></li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">3. How We Use Your Data</h2>
          <p className="mb-4">
            We use the collected data exclusively for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Project Orchestration:</strong> To evaluate business problems, translate requirements, and determine the appropriate technology architecture.</li>
            <li><strong>Partner Coordination:</strong> To evaluate partner suitability and assemble the right independent specialists for specific project requirements.</li>
            <li><strong>Delivery Management:</strong> To coordinate services, manage the execution process, and facilitate verification and handover.</li>
            <li><strong>Communication:</strong> To respond to inquiries, provide project updates, and manage the ongoing relationship.</li>
            <li><strong>Improvement & Security:</strong> To improve our website and orchestration models, prevent fraud, and ensure the security of our platform.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">4. Data Sharing and Independence</h2>
          <p className="mb-4">
            Neubofy operates as a central orchestration layer. We do not operate a public directory of our Independent Partners. Information regarding business requirements is shared with relevant Independent Partners only to the extent necessary to evaluate, execute, and verify the requested technology work.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">5. Your Rights</h2>
          <p className="mb-4">
            Depending on your jurisdiction, you may have rights to access, correct, update, or request deletion of your personal data. Independent Partners may manage their profile data through their account settings. Business Clients may request updates to their project information through their assigned Neubofy coordinator.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy, our data collection practices, or how we operate our technology orchestration network, please contact us.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
