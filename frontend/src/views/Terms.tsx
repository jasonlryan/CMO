import React from "react";

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="mb-2">
            By accessing or using the CMO Assessment Tool, you agree to be bound
            by these Terms of Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. ChatGPT Integration</h2>
          <p className="mb-2">
            The CMO Assessment Tool offers integration with OpenAI's ChatGPT for
            analyzing interview transcripts. By using this feature, you agree
            to:
          </p>
          <ul className="list-disc ml-6 mb-2">
            <li>Only submit content that you have the right to share</li>
            <li>
              Accept that transcripts will be processed by our assessment system
            </li>
            <li>
              Understand that the assessment results are for informational
              purposes only
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Data Usage</h2>
          <p className="mb-2">
            Information provided through the ChatGPT integration will be used
            solely for the purpose of generating assessment reports and
            improving our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
          <p className="mb-2">
            The assessment tool provides analysis based on the information
            submitted. Results should be considered as supplementary information
            and not as the sole basis for hiring decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Contact</h2>
          <p>
            If you have questions regarding these terms, please contact us at
            support@cmoassessment.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
