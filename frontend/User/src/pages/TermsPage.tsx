import React from 'react';
import { useTheme } from '../contexts/useTheme';

const TermsPage: React.FC = () => {
	const { theme } = useTheme();
	const light = theme === 'light';
	return (
		<div className={`w-full min-h-screen px-6 md:px-12 py-16 ${light ? 'bg-white text-gray-900' : 'bg-oxford-900 text-foreground'}`}>
			<div className="max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
				<p className="text-sm md:text-base text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

				<section className="space-y-6 text-sm md:text-base leading-relaxed">
					<p>These Terms govern your access to and use of the Comrade Kejani platform (the "Service"). By using the Service you agree to these Terms.</p>
					<div>
						<h2 className="font-semibold text-lg mb-2">1. Eligibility</h2>
						<p>You must be at least 18 or have consent from a guardian and comply with all applicable local laws regarding rental or housing-related transactions.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">2. Acceptable Use</h2>
						<ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
							<li>No posting of fraudulent, misleading or duplicate listings.</li>
							<li>No harassment, hate, or abusive behavior in reviews or community areas.</li>
							<li>No attempts to bypass security, scrape large volumes of data, or misuse reports.</li>
						</ul>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">3. Listings & Reviews</h2>
						<p>Listings and reviews are user-generated. We do not guarantee accuracy, though we apply verification and moderation measures.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">4. Disclaimers</h2>
						<p>The Service is provided on an "as is" basis without warranties of any kind. We are not a party to tenancy contracts formed off-platform.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">5. Limitation of Liability</h2>
						<p>To the fullest extent permitted by law we are not liable for indirect, incidental, or consequential damages arising from use of the Service.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">6. Termination</h2>
						<p>We may suspend or terminate access if policies are violated. You may stop using the Service at any time.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">7. Changes</h2>
						<p>We may update these Terms. Continued use after updates constitutes acceptance. Material changes will be signaled via in-app notice.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">8. Contact</h2>
						<p>Questions about these Terms: support@comradekejani.example.</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default TermsPage;
