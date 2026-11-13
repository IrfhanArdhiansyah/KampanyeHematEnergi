const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = navMenu ? Array.from(navMenu.querySelectorAll('a')) : [];
const siteHeader = document.querySelector('.site-header');

function updateHeaderState() {
	siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

function setActiveNavLink(activeLink) {
	navLinks.forEach((link) => link.removeAttribute('aria-current'));
	activeLink.setAttribute('aria-current', 'location');
}

menuToggle?.addEventListener('click', () => {
	const isOpen = navMenu.classList.toggle('is-open');
	menuToggle.setAttribute('aria-expanded', String(isOpen));
});

const initialActiveLink = navLinks.find((link) => link.hash === window.location.hash) || navLinks[0];
if (initialActiveLink) setActiveNavLink(initialActiveLink);

navLinks.forEach((link) => {
	link.addEventListener('click', () => {
		setActiveNavLink(link);
		navMenu.classList.remove('is-open');
		menuToggle?.setAttribute('aria-expanded', 'false');
	});
});

const sections = navLinks
	.map((link) => document.getElementById(link.hash.slice(1)))
	.filter(Boolean);

if ('IntersectionObserver' in window) {
	const sectionObserver = new IntersectionObserver((entries) => {
		const currentSection = entries
			.filter((entry) => entry.isIntersecting)
			.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
		const activeLink = currentSection && navLinks.find((link) => link.hash === '#' + currentSection.target.id);

		if (activeLink) setActiveNavLink(activeLink);
	}, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

	sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('.brand[href="#beranda"], .back-top[href="#beranda"]').forEach((link) => {
	link.addEventListener('click', () => {
		const homeLink = navLinks.find((navLink) => navLink.hash === '#beranda');
		if (homeLink) setActiveNavLink(homeLink);
	});
});

const revealTargets = document.querySelectorAll(
	'.hero-copy, .hero-visual, .about-copy, .about-visual, .about-point, .action-heading, .action-item, .chart-section .container > *, .footer-main, .footer-bottom'
);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !prefersReducedMotion) {
	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			entry.target.classList.toggle('is-visible', entry.isIntersecting);
		});
	}, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

	revealTargets.forEach((target) => {
		target.classList.add('scroll-reveal');
		revealObserver.observe(target);
	});
}