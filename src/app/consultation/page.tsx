import PageTransition from "@/components/PageTransition";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation",
  description: "Discuss your technology requirements with Neubofy",
};

export default function ConsultationPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-32 md:px-6 lg:px-8 min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Book a Consultation</h1>
          <p className="text-xl text-muted-foreground">Discuss your technology requirements with Neubofy</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl w-full max-w-5xl mx-auto min-h-[600px]">
          <div id="inline-container"></div>
        </div>

        <Script src="https://bookings.nimbuspop.com/assets/embed.js" strategy="lazyOnload" />
        <Script id="zoho-bookings-inline" strategy="lazyOnload">
          {`
            (function initZoho() {
              if (window.Bookings && document.getElementById('inline-container')) {
                // Ensure we don't render multiple times
                if (document.getElementById('inline-container').innerHTML === '') {
                  window.Bookings.inlineEmbed({
                    url: "https://neubofy.zohobookings.in/portal-embed#/neubofy",
                    parent: "#inline-container",
                    height: "600px"
                  });
                }
              } else {
                setTimeout(initZoho, 100);
              }
            })();
          `}
        </Script>
      </div>
    </PageTransition>
  );
}
