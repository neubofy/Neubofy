import PageTransition from "@/components/PageTransition";

export default function TermsOfService() {
  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground font-display">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground font-light leading-relaxed">
          <p className="mb-4 text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">1. Acceptance of Terms and Definitions</h2>
          <p className="mb-4">
            By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. For the purposes of these terms:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Client</strong> refers to the business, founder, or entity requesting technology services.</li>
            <li><strong>Neubofy</strong> acts as the technology orchestration and delivery management layer.</li>
            <li><strong>Independent Partner</strong> refers to a third-party specialist independently engaged to perform assigned work within a project.</li>
            <li><strong>Verification / Review</strong> refers to project-specific testing, technical review, security review, or other quality processes where applicable.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">2. Description of Orchestration Service</h2>
          <p className="mb-4">
            Neubofy acts as your technology department. We provide services including but not limited to translating business ideas into technical requirements, architecting solutions, orchestrating appropriate Independent Partners, managing the delivery process, and verifying the completed software before handover.
          </p>
          <p className="mb-4">
            Neubofy coordinates Independent Partners to perform assigned execution responsibilities. These Independent Partners are not employees of Neubofy. Different specialists may participate in different projects depending on the specific capabilities required.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">3. Responsibilities and Scope</h2>
          <p className="mb-4">
            Project scope, technology choices, pricing, timelines, and specific responsibilities are defined through project-specific agreements or order documents separate from these general website terms.
          </p>
          <p className="mb-4">
            Clients remain responsible for providing accurate business requirements, necessary information, and timely feedback during the orchestration and delivery process.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">4. Verification and Limitations</h2>
          <p className="mb-4">
            While Neubofy orchestrates Verification and Review processes tailored to the requirements and risk of each project, software development is an inherently complex endeavor. Verification does not mean the absolute elimination of all defects, bugs, or security risks.
          </p>
          <p className="mb-4">
            Neubofy does not claim or guarantee that delivered software will be 100% secure, completely defect-free, or function perfectly in all unforeseen environments. Third-party services, APIs, and tools may be involved in delivery, and Neubofy is not liable for failures originating from external third-party systems.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">5. Intellectual Property</h2>
          <p className="mb-4">
            The service and its original content, features, and functionality (including the Neubofy website and orchestration platforms) are and will remain the exclusive property of Neubofy and its licensors.
          </p>
          <p className="mb-4">
            Intellectual property ownership and licensing regarding the specific software built for a Client will be determined and governed by the applicable project-specific agreement.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">6. User Conduct</h2>
          <p className="mb-4">
            You agree to use the service only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or the content.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground font-display">7. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Payment, cancellation, changes, and acceptance criteria for active projects will be governed by the applicable project terms.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}