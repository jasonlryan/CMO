import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Introduction</h2>
          <p className="mb-2">
            This Privacy Policy outlines how the CMO Assessment Tool collects,
            uses, and protects information when you use our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Information Collection</h2>
          <p className="mb-2">
            When using the ChatGPT integration, we collect assessment data and
            transcripts that you explicitly provide through the interface. This
            information is used solely for the purpose of generating assessment
            reports.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Data Usage</h2>
          <p className="mb-2">The information collected is used to:</p>
          <ul className="list-disc ml-6 mb-2">
            <li>Process and analyze CMO interview transcripts</li>
            <li>Generate assessment reports and profiles</li>
            <li>Improve our assessment algorithms and service quality</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Data Protection</h2>
          <p className="mb-2">
            We implement appropriate data collection, storage, and processing
            practices to protect against unauthorized access, alteration,
            disclosure, or destruction of your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have questions regarding this privacy policy, please contact
            us at support@cmoassessment.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
