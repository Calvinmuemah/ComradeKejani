import React from 'react';
import { useTheme } from '../contexts/useTheme';

const LicensingPage: React.FC = () => {
	const { theme } = useTheme();
	const light = theme === 'light';
	return (
		<div className={`w-full min-h-screen px-6 md:px-12 py-16 ${light ? 'bg-white text-gray-900' : 'bg-oxford-900 text-foreground'}`}>
			<div className="max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-bold mb-6">Licensing & Attribution</h1>
				<p className="text-sm md:text-base text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>
				<section className="space-y-6 text-sm md:text-base leading-relaxed">
					<p>This page outlines licenses and attribution for assets and open‑source dependencies used within the Comrade Kejani platform.</p>
					<div>
						<h2 className="font-semibold text-lg mb-2">1. Platform Code</h2>
						<p>All proprietary application source code (backend & frontend) is © {new Date().getFullYear()} Comrade Kejani. All rights reserved unless otherwise indicated.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">2. Open Source Packages</h2>
						<p>The platform integrates community OSS (frameworks, UI libraries, utility packages) each under their respective licenses (e.g. MIT, Apache-2.0). Full dependency license texts are available via project package manifests.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">3. Icons & Imagery</h2>
						<p>UI icons (including Lucide) are used under permissive open-source licensing. Stock or illustrative images are either original, licensed or placeholders and not for third‑party redistribution without consent.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">4. User Content</h2>
						<p>Listings, reviews and feedback remain the intellectual property of their respective authors. By submitting, you grant us a non‑exclusive license to display and process content for platform functionality and safety features.</p>
					</div>
					<div>
						<h2 className="font-semibold text-lg mb-2">5. Requests & Attribution Issues</h2>
						<p>If you believe attribution is missing or a licensed asset is misused, contact licensing@comradekejani.example for prompt review.</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default LicensingPage;
export { LicensingPage };
