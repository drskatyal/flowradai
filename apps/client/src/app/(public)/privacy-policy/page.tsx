import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">FlowRad.AI Privacy Policy</h1>

      <p className="text-sm mb-6">Effective Date: February 26, 2025</p>

      <div className="prose prose-sm max-w-none">
        <p className="mb-6">
          At FlowRad.AI ("we," "us," or "our"), we are committed to protecting
          your privacy and ensuring the security of the information you provide
          while using our AI-assisted radiology reporting tool (the "Service").
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you access or use FlowRad.AI,
          including our website, APIs, and related services. By using the
          Service, you agree to the practices described in this Privacy Policy
          and our Terms & Conditions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p className="mb-6">
          FlowRad.AI is a Software-as-a-Service (SaaS) platform designed to
          assist with radiology reporting using AI technology. The Service is
          not intended to store, process, or manage any Protected Health
          Information (PHI) or personally identifiable information (e.g.,
          patient names, study details, institution or hospital names). You are
          prohibited from entering such data into the Service, and any
          responsibility for maintaining privacy and compliance with applicable
          laws (e.g., HIPAA, GDPR) lies entirely with you, the User.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          2. Information We Collect
        </h2>
        <p className="mb-4">
          We collect the following types of information to provide and improve
          the Service:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          a. Account Information
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            When you create an account, we may collect your name, email address,
            and payment information (processed via RazorPay or other authorized
            payment processors). We do not store sensitive payment details;
            these are handled securely by our payment processors.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">b. Usage Data</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We may collect information about how you interact with the Service,
            such as IP address, browser type, device information, pages visited,
            and usage patterns. This data is anonymized and aggregated to
            analyze trends and improve functionality.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          c. Non-Identifiable Data
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            You may input non-identifiable imaging study findings (e.g.,
            anonymized scan data) to generate reports. We do not collect or
            store any PHI or personally identifiable information. Any data you
            input is used solely for generating reports and is not retained
            unless required for technical support or legal purposes.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          d. Cookies and Tracking Technologies
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We use cookies and similar technologies to enhance your experience,
            analyze usage, and personalize content. You can manage cookie
            preferences through your browser settings.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          3. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use the information we collect for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            To provide, maintain, and improve the Service, including generating
            AI-assisted radiology reports.
          </li>
          <li>
            To process payments and subscriptions via RazorPay or other payment
            processors.
          </li>
          <li>
            To communicate with you about your account, updates, or customer
            support.
          </li>
          <li>
            To analyze usage patterns and optimize our platform (using
            anonymized and aggregated data).
          </li>
          <li>
            To comply with legal obligations or protect our rights, privacy,
            safety, or property.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          4. Information Sharing and Disclosure
        </h2>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information
          to third parties without your consent, except as described below:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          a. Service Providers
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We may share information with third-party service providers (e.g.,
            RazorPay for payments, cloud hosting providers) who assist us in
            operating the Service. These providers are contractually obligated
            to protect your information and use it only for the purposes we
            specify.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          b. Legal Requirements
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We may disclose your information if required by law, regulation, or
            legal process (e.g., subpoenas, court orders) or to protect the
            rights, property, or safety of FlowRad.AI, our users, or the public.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">
          c. Business Transfers
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            In the event of a merger, acquisition, or sale of all or part of our
            assets, your information may be transferred to the new owner,
            subject to this Privacy Policy.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p className="mb-4">
          We implement reasonable security measures to protect your information
          from unauthorized access, disclosure, alteration, or destruction.
          These include:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>SSL encryption for data transmission.</li>
          <li>Secure storage of account information.</li>
          <li>Regular security audits and updates.</li>
        </ul>
        <p className="mb-4">
          However, no method of transmission or storage is 100% secure, and we
          cannot guarantee absolute security. You are responsible for
          maintaining the confidentiality of your account credentials and
          ensuring no PHI or identifiable data is entered into the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We retain your account information and usage data only as long as
            necessary to fulfill the purposes outlined in this Privacy Policy or
            to comply with legal obligations.
          </li>
          <li>
            Non-identifiable data used for report generation is not stored
            unless required for technical support or legal purposes, in which
            case it is anonymized and securely managed.
          </li>
          <li>
            You may request deletion of your account and associated data by
            contacting us, subject to legal retention requirements.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          7. Your Rights and Choices
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <span className="font-semibold">Access and Update:</span> You can
            access and update your account information through your account
            settings or by contacting us.
          </li>
          <li>
            <span className="font-semibold">Deletion:</span> You may request the
            deletion of your account and data, subject to legal obligations.
          </li>
          <li>
            <span className="font-semibold">Opt-Out:</span> You can opt out of
            non-essential communications (e.g., marketing emails) by following
            the unsubscribe instructions in those messages.
          </li>
          <li>
            <span className="font-semibold">Cookies:</span> You can manage
            cookie preferences through your browser settings.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          8. International Data Transfers
        </h2>
        <p className="mb-6">
          If you are located outside [Specify Jurisdiction, e.g., India], your
          information may be transferred to and processed in [Specify
          Jurisdiction] or other locations where we or our service providers
          operate. We ensure that such transfers comply with applicable data
          protection laws.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          9. Children's Privacy
        </h2>
        <p className="mb-6">
          FlowRad.AI is not intended for users under the age of 18. We do not
          knowingly collect information from children. If we become aware that
          we have collected information from a child under 18, we will take
          steps to delete it.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          10. Third-Party Links and Services
        </h2>
        <p className="mb-6">
          The Service may contain links to third-party websites or services
          (e.g., RazorPay). We are not responsible for the privacy practices or
          content of those third parties. We encourage you to review their
          privacy policies before providing any information.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          11. Changes to This Privacy Policy
        </h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time to reflect changes
          in our practices or legal requirements. Any updates will be posted on
          our website with an updated effective date. Your continued use of the
          Service after such changes constitutes your acceptance of the new
          Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">12. Contact Us</h2>
        <p className="mb-4">
          If you have questions, concerns, or requests regarding this Privacy
          Policy or your information, please contact us at:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Email:{" "}
            <a
              href="mailto:support@flowrad.ai"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support@flowrad.ai
            </a>
          </li>
          <li>
            Phone:{" "}
            <a
              href="tel:+917290985652"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              +91-7290985652
            </a>
          </li>
          <li>Address: VVIP Assets, Raj Nagar Extension, Ghaziabad</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
