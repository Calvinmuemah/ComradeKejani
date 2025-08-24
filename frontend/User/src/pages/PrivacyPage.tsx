import React from 'react';
import { useTheme } from '../contexts/useTheme';

const PrivacyPage: React.FC = () => {
	const { theme } = useTheme();
	const light = theme === 'light';
	return (
		<div className={`w-full min-h-screen px-6 md:px-12 py-16 ${light ? 'bg-white text-gray-900' : 'bg-oxford-900 text-foreground'}`}>
			<div className="max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
				<p className="text-sm md:text-base text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>
				<section className="space-y-6 text-sm md:text-base leading-relaxed">
					<p>This Policy explains how we collect, use and safeguard information when you use the Comrade Kejani platform.</p>
					<div>
						<h2 className="font-semibold text-lg mb-2">1. Data We Collect</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>Account data (name, university email, profile details)</li>
							<li>Usage data (pages visited, features used, search interactions)</li>
							<li>Content you provide (reviews, reports, listings, messages)</li>
						</ul>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">2. How We Use Data</h2>
						<p>To deliver core features, personalize recommendations, enhance safety signals, protect integrity, and comply with legal obligations.</p>
					</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">3. Cookies & Tracking</h2>
							<p>Essential cookies support authentication and session continuity. Optional analytics help improve usability. You can adjust browser settings to limit cookies.</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">4. Sharing</h2>
							<p>We do not sell personal data. We may share limited information with service providers under confidentiality—for hosting, analytics, and security.</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">5. Security</h2>
							<p>We apply encryption in transit, access controls, logging and periodic reviews. No system is completely secure; prompt reporting of issues helps protect everyone.</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">6. Your Choices</h2>
							<p>You can update profile data, request deletion, or opt out of non-essential analytics where provided. Contact us for data access requests.</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">7. Retention</h2>
							<p>We retain data only as long as necessary for service provision, legal compliance, or legitimate interests (fraud prevention, safety records).</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">8. Updates</h2>
							<p>Material changes will be notified in-app. Continued use after revisions signifies consent to updated terms.</p>
						</div>
						<div>
							<h2 className="font-semibold text-lg mb-2">9. Contact</h2>
							<p>Privacy queries: privacy@comradekejani.example.</p>
						</div>
				</section>
			</div>
		</div>
	);
};

export default PrivacyPage;
export { PrivacyPage };
