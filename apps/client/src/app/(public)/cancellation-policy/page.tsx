const CancellationPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        FlowRad.AI Refund & Cancellation Policy
      </h1>

      <p className="text-sm mb-6">Effective Date: February 26, 2025</p>

      <div className="prose prose-sm max-w-none">
        <p className="mb-6">
          This Refund & Cancellation Policy ("Policy") governs the cancellation
          of credit purchases and refund requests for FlowRad.AI ("Service,"
          "we," "us," or "our"), our AI-assisted radiology reporting tool. By
          purchasing credits or using the Service, you agree to the terms
          outlined in this Policy, as well as our Terms & Conditions and Privacy
          Policy.
        </p>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            1. Cancellation of Credit Purchases
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              <span className="font-semibold">Right to Cancel:</span> You may
              cancel unused credits at any time. Cancellation will prevent
              further use of the credits, but you will not receive access to
              additional reports after cancellation.
            </li>
            <li className="mb-2">
              <span className="font-semibold">How to Cancel:</span> You can
              cancel your credits by:
              <ul className="list-circle pl-6 mt-2">
                <li className="mb-1">
                  Logging into your account on our website and managing your
                  credit balance.
                </li>
                <li className="mb-1">
                  Contacting our support team at{" "}
                  <a
                    href="mailto:support@flowrad.ai"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    support@flowrad.ai
                  </a>
                </li>
              </ul>
            </li>
            <li className="mb-2">
              <span className="font-semibold">
                No Partial Refunds for Used Credits:
              </span>{" "}
              If you cancel credits after some have been used to generate
              reports, you will not receive a refund for the used portion. There
              will be no refunds on unused credits.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. Refund Requests
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              <span className="font-semibold">No Refunds on Credits:</span> We
              do not offer refunds for any credits, whether used or unused,
              under any circumstances. Credits purchased for FlowRad.AI are
              non-refundable.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Non-Refundable Credits:</span>{" "}
              Credits used to generate reports or applied for additional
              services or features are non-refundable. This policy also applies
              to unused credits.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Prohibited Data Input:</span> We
              are not liable for any issues, damages, or costs arising from your
              input of prohibited data (e.g., Protected Health Information or
              personally identifiable information) into the Service. Refunds
              will not be issued in such cases.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Refund Process</h2>
          <p className="mb-6">
            This section is not applicable, as refunds are not offered for
            credits (used or unused). Please refer to Section 2 for our
            no-refund policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            4. Termination by FlowRad.AI
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              We reserve the right to terminate or suspend your access to the
              Service, with or without notice, if you violate our Terms &
              Conditions (e.g., by inputting prohibited data or engaging in
              unauthorized use). In such cases, no refunds will be issued for
              any credits, whether used or unused.
            </li>
            <li className="mb-2">
              If we terminate your account for reasons other than your violation
              of the Terms, no refunds will be issued for any credits, whether
              used or unused.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            5. Changes to This Policy
          </h2>
          <p className="mb-6">
            We may update this Refund & Cancellation Policy from time to time to
            reflect changes in our practices or legal requirements. Any updates
            will be posted on our website with an updated effective date. Your
            continued use of the Service after such changes constitutes your
            acceptance of the new Policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions, concerns, or need assistance with
            cancellation, please contact us at:
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicyPage;
