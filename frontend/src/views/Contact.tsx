import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Get in Touch</h2>
          <p className="mb-4">
            If you have any questions about the CMO Assessment Tool or its API
            integration with ChatGPT, please feel free to contact us using the
            information below.
          </p>

          <div className="mb-4">
            <h3 className="font-medium">Email</h3>
            <p>support@cmoassessment.com</p>
          </div>

          <div>
            <h3 className="font-medium">General Inquiries</h3>
            <p>info@cmoassessment.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">API Support</h2>
          <p className="mb-2">
            For technical support related to the API integration or ChatGPT
            usage:
          </p>
          <p>api-support@cmoassessment.com</p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
