const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const refreshButton = document.querySelector('#refresh-button');
const lastSync = document.querySelector('#last-sync');
const toast = document.querySelector('#toast');
const authScreen = document.querySelector('#auth-screen');
const authForm = document.querySelector('#auth-form');
const authEmail = document.querySelector('#auth-email');
const authPassword = document.querySelector('#auth-password');
const authSubmit = document.querySelector('#auth-submit');
const authMessage = document.querySelector('#auth-message');
const signOutButton = document.querySelector('#sign-out');

const firebaseConfig = {
	apiKey: 'AIzaSyASDOYoYmR_aYpdYutRvjeR_qMfXSVsqgQ',
	authDomain: 'deployment-observatory.firebaseapp.com',
	projectId: 'deployment-observatory',
	storageBucket: 'deployment-observatory.firebasestorage.app',
	messagingSenderId: '1082210610458',
	appId: '1:1082210610458:web:440700505e724232afd0a3'
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function showAuthenticatedDashboard(user) {
	authScreen.hidden = true;
	document.querySelector('.app-shell').hidden = false;
	signOutButton.setAttribute('aria-label', `Sign out ${user.email}`);
}

function showAuthenticationError(error) {
	const messages = {
		'auth/invalid-credential': 'The email or password is incorrect.',
		'auth/invalid-email': 'Enter a valid email address.',
		'auth/too-many-requests': 'Too many attempts. Try again later.'
	};
	authMessage.textContent = messages[error.code] || 'Unable to sign in. Please try again.';
}

auth.onAuthStateChanged((user) => {
	if (user) {
		showAuthenticatedDashboard(user);
		return;
	}

	authScreen.hidden = false;
	document.querySelector('.app-shell').hidden = true;
});

authForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	authMessage.textContent = '';
	authSubmit.disabled = true;
	authSubmit.textContent = 'Signing in...';

	try {
		await auth.signInWithEmailAndPassword(authEmail.value, authPassword.value);
		authForm.reset();
	} catch (error) {
		showAuthenticationError(error);
	} finally {
		authSubmit.disabled = false;
		authSubmit.textContent = 'Sign in';
	}
});

signOutButton.addEventListener('click', () => auth.signOut());

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
