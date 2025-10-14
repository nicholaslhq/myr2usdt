import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "MYR2USDT - Real-time MYR to USDT Converter",
	description:
		"Convert Malaysian Ringgit (MYR) to Tether (USDT) with real-time exchange rates. Track the latest MYR to USDT prices and make informed decisions for your crypto investments.",
	keywords:
		"MYR to USDT, Malaysian Ringgit to Tether, MYR USDT converter, real-time exchange rate, crypto converter, Tether price, Malaysian Ringgit price, crypto exchange, USDT MYR, crypto trading",
	openGraph: {
		title: "MYR2USDT - Real-time MYR to USDT Converter",
		description:
			"Convert Malaysian Ringgit (MYR) to Tether (USDT) with real-time exchange rates. Track the latest MYR to USDT prices and make informed decisions for your crypto investments.",
		url: "https://myr2usdt.vercel.app/",
		siteName: "MYR2USDT",
		locale: "en_US",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link
					rel="icon"
					type="image/png"
					href="/favicon/favicon-96x96.png"
					sizes="96x96"
				/>
				<link
					rel="icon"
					type="image/svg+xml"
					href="/favicon/favicon.svg"
				/>
				<link rel="shortcut icon" href="/favicon/favicon.ico" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/favicon/apple-touch-icon.png"
				/>
				<meta name="apple-mobile-web-app-title" content="MYR2USDT" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
