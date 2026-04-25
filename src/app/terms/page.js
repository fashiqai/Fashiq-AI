import React from 'react';

export const metadata = {
  title: 'Terms of Service | Fashiq AI',
};

const TermsOfService = () => {
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
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '600' }}>Terms of Service</h1>
        <p style={{ color: '#a1a1a1', marginBottom: '60px', fontSize: '0.9rem' }}>Last Updated: April 25, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>1. Acceptance of Terms</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              By accessing or using the Fashiq AI platform (the "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These Terms constitute a legally binding agreement between you and Fashiq AI.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>2. Description of Service</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              Fashiq AI is a software-as-a-service (SaaS) platform that provides AI-driven fashion photography and garment processing tools. Our services include, but are not limited to, generating high-fidelity on-model imagery from user-uploaded product photos. We provide the Service on an "as-is" and "as-available" basis.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>3. User Accounts and Security</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed', marginBottom: '15px' }}>To access certain features of the Service, you must register for an account.</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2' }}>
              <li><strong>Account Integrity:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
              <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration process.</li>
              <li><strong>Unauthorized Use:</strong> You must immediately notify us of any unauthorized use of your account or any other breach of security.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>4. Billing, Subscriptions, and Credits</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed', marginBottom: '15px' }}>Fashiq AI operates on a subscription and credit-based model:</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2' }}>
              <li><strong>Pricing:</strong> All prices are as stated on our pricing page and are subject to change with reasonable notice.</li>
              <li><strong>Automatic Renewal:</strong> Subscription plans will automatically renew at the end of each billing cycle unless cancelled through your dashboard.</li>
              <li><strong>Credit Consumption:</strong> One "Credit" corresponds to one generation attempt. Credits are deducted upon the initiation of the AI processing task, regardless of the user's satisfaction with the algorithmic output.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>5. Refund and Cancellation Policy</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed', marginBottom: '15px' }}>
              Due to the immediate allocation of high-cost computational resources (GPUs) required for AI generation:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2' }}>
              <li><strong>No-Refund Policy:</strong> Fashiq AI operates a strict <strong>no-refund policy</strong> once credits have been utilized or a generation process has been initiated.</li>
              <li><strong>Technical Errors:</strong> In the event of a verified technical failure where the system fails to deliver an output despite a credit deduction, we will restock the affected credits to your account.</li>
              <li><strong>Cancellations:</strong> You may cancel your subscription at any time. Upon cancellation, you will retain access to the Service and remaining credits until the end of your current billing period. No partial refunds will be issued for unused time or credits.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>6. Intellectual Property Rights</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed', marginBottom: '15px' }}>Ownership of assets and identifiers is as follows:</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2' }}>
              <li><strong>Our Property:</strong> The Service, its original content, features, and functionality (including but not limited to software, code, UI/UX, and AI models) are the exclusive property of Fashiq AI.</li>
              <li><strong>The Output:</strong> Upon successful payment and generation, Fashiq AI grants you a perpetual, worldwide, exclusive license to utilize the generated images for commercial, editorial, and personal purposes.</li>
              <li><strong>Platform License:</strong> By uploading assets, you grant us a limited, non-exclusive, royalty-free license to process and utilize those assets solely for the purpose of fulfilling your generation requests.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>7. Prohibited Uses</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed', marginBottom: '15px' }}>You agree not to use the Service:</p>
            <ul style={{ paddingLeft: '20px', color: '#ededed', lineHeight: '2' }}>
              <li>To generate content that is illegal, defamatory, or violates the privacy rights of others.</li>
              <li>To attempt to reverse-engineer, decompile, or extract the source code of our platform.</li>
              <li>To engage in any automated data scraping or "botting" of our Service.</li>
              <li>To impersonate any person or entity or misrepresent your affiliation with a brand.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>8. Limitation of Liability</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              In no event shall Fashiq AI, its directors, or employees be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service. This includes, but is not limited to, losses arising from creative inaccuracies or "hallucinations" in AI-generated imagery.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>9. Disclaimer of Warranty</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              We provide the Service with reasonable care, but we do not guarantee that the AI outputs will be 100% anatomically accurate or perfectly representative of your physical garment. You acknowledge produced imagery is the result of probabilistic generative algorithms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>10. Governing Law</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              These Terms shall be governed and construed in accordance with the laws of [Insert Your Country/State], without regard to its conflict of law provisions.
            </p>
          </section>

          <section style={{ borderTop: '1px solid #1e1e20', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: '600' }}>11. Contact Information</h2>
            <p style={{ lineHeight: '1.7', color: '#ededed' }}>
              For any questions regarding these Terms, please contact us at: <strong>support@fashiq.ai</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
