import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Fashiq AI',
};

const PrivacyPolicy = () => {
  return (
    <div style={{ 
      backgroundColor: '#0a0a0c', 
      color: '#ffffff', 
      minHeight: '100vh', 
      paddingTop: '100px', 
      paddingBottom: '100px', 
      paddingLeft: '20px', 
      paddingRight: '20px',
      fontFamily: 'Inter, sans-serif' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '600' }}>Privacy Policy</h1>
        <p style={{ color: '#a1a1a1', marginBottom: '60px', fontSize: '0.9rem' }}>Last Updated: April 25, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>1. Introduction and Scope</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              Fashiq AI ("Company," "we," or "our") operates the Fashiq AI platform. We are committed to maintaining the highest standards of data integrity and transparency. This Privacy Policy provides a comprehensive overview of how we process personal identifiers and creative assets when you interact with our services, website, and AI-driven applications. By using our service, you acknowledge the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>2. Detailed Data Collection</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '20px' }}>To provide a seamless AI-driven photography experience, we collect several categories of information:</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Personal Identification Information:</strong> This includes your full name, email address, and mobile contact details provided during registration or profile updates.</li>
              <li><strong>Service-Specific Assets:</strong> We process high-resolution images of garments and products you upload. These assets are processed in secure, isolated environments.</li>
              <li><strong>Google OAuth Data:</strong> When authenticating via Google, we access your unique Google identifier, email address, and profile name to verify your identity and prevent unauthorized access.</li>
              <li><strong>Technical Log Data:</strong> Our servers automatically record information sent by your browser ("Log Data"). This may include your device's IP address, browser type, browser version, the specific pages of our service that you visit, the time and date of your visit, and the time spent on those pages.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>3. Use of Google API Services</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '15px' }}>
              Fashiq AI strictly adheres to the <strong>Google API Services User Data Policy</strong>, including the "Limited Use" requirements.
            </p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Authentication Only:</strong> We use Google data exclusively to authenticate users and manage account sessions.</li>
              <li><strong>Zero Monetization:</strong> We do not sell your Google user data to third parties, nor do we use it for advertising purposes or personalized tracking outside of our platform.</li>
              <li><strong>Security:</strong> Your Google access tokens are handled using industry-standard encryption protocols.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>4. Cookies and Advanced Tracking</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '15px' }}>
              We utilize cookies and similar tracking technologies to enhance your user experience and secure our infrastructure.
            </p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function, such as managing your login session.</li>
              <li><strong>Analytics Cookies:</strong> We may use these to understand how users interact with our platform to improve our AI generation speed and UI layouts.</li>
              <li><strong>Control:</strong> You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>5. Third-Party Disclosures and AI Processing</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '15px' }}>
              To deliver high-fidelity generated imagery, we share specific data with vetted third-party service providers:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Computational Infrastructure:</strong> We utilize cloud-based GPU clusters to process AI generations. These partners are legally restricted from using your images for any purpose other than providing the service.</li>
              <li><strong>Data Stewardship:</strong> We do not sell your personal data or creative assets to data brokers or for use in third-party model training without your explicit authorization.</li>
              <li><strong>Vetted Partners:</strong> Our partners are prohibited from using your data or images for any purpose other than providing the specific cloud processing services requested by Fashiq AI.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>6. Payments and Financial Data Handling</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '15px' }}>
              Fashiq AI utilizes specialized third-party payment processors and a Merchant of Record to handle all financial transactions.
            </p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Security Standards:</strong> All payment processing is conducted in compliance with Payment Card Industry Data Security Standards (PCI-DSS).</li>
              <li><strong>Zero Storage:</strong> Fashiq AI does not store, process, or see your full credit card numbers, CVVs, or sensitive financial credentials on its own servers.</li>
              <li><strong>Metadata:</strong> We only receive confirmation of successful transactions and limited metadata (such as the last four digits of the payment method) to manage your account subscription and credit balance.</li>
              <li><strong>Direct Processing:</strong> By making a purchase, you acknowledge that your financial data will be handled by our authorized payment partners in accordance with their respective privacy policies.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>7. International Data Transfers</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              Your information, including Personal Data, may be transferred to—and maintained on—computers located outside of your state, province, or country where the data protection laws may differ from those in your jurisdiction. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>8. Comprehensive User Rights</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed', marginBottom: '15px' }}> Regardless of your location, we aim to provide you with control over your data:</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2.2' }}>
              <li><strong>Right to Access:</strong> You may request copies of your personal data at any time.</li>
              <li><strong>Right to Rectification:</strong> You can request that we correct any information you believe is inaccurate or incomplete.</li>
              <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, subject to certain legal obligations.</li>
              <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal data under certain conditions.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>9. Data Security and Integrity</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              The security of your data is of paramount importance to us. We implement a variety of security measures, including 256-bit encryption for data at rest and in transit. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>10. Children's Privacy Compliance</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              Fashiq AI does not target or knowingly collect information from individuals under the age of 13. If we become aware that a child under 13 has provided us with personal data, we will take immediate steps to remove such information from our servers and terminate the associated account.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>11. Changes to This Policy</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              We reserve the right to update our Privacy Policy periodically to reflect changes in our practices or specialized legal requirements. We will notify you of any significant changes by posting the updated policy on this page with a new "Last Updated" date.
            </p>
          </section>

          <section style={{ borderTop: '1px solid #1e1e20', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', fontWeight: '600' }}>12. Contact Information</h2>
            <p style={{ lineHeight: '1.8', color: '#ededed' }}>
              If you have any questions about this Privacy Policy, please contact our administrative desk at: <strong>support@fashiq.ai</strong>
            </p>
            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#a1a1a1' }}>
              Registered office address provided upon legal verification.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
