const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const refreshButton = document.querySelector('#refresh-button');
const lastSync = document.querySelector('#last-sync');
const toast = document.querySelector('#toast');

function setTheme(theme) {
	root.dataset.theme = theme;
	localStorage.setItem('observatory-theme', theme);
	themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
	themeToggle.querySelector('.sun-icon').textContent = theme === 'dark' ? '☼' : '☾';
}

setTheme(localStorage.getItem('observatory-theme') || 'dark');

themeToggle.addEventListener('click', () => {
	setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

refreshButton.addEventListener('click', () => {
	lastSync.textContent = 'Just now';
	toast.classList.add('is-visible');
	window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
});
