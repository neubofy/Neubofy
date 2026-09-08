import PageTransition from "@/components/PageTransition";

export default function TermsOfService() {
  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground">
          <p className="mb-4">
            Last updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Description of Service</h2>
          <p className="mb-4">
            Neubofy™ acts as your technology department. We provide services including but not limited to translating business ideas into technical requirements, architecting solutions, selecting appropriate builders, managing the development process, and verifying the completed software before delivery.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. User Conduct</h2>
          <p className="mb-4">
            You agree to use the service only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others or otherwise cause damage to the site or the content.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Intellectual Property</h2>
          <p className="mb-4">
            The service and its original content, features, and functionality are and will remain the exclusive property of Neubofy™ and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
