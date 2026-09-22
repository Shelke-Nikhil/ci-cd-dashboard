const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const refreshButton = document.querySelector('#refresh-button');
const lastSync = document.querySelector('#last-sync');
const toast = document.querySelector('#toast');
const authScreen = document.querySelector('#auth-screen');
const authForm = document.querySelector('#auth-form');
const authEmail = document.querySelector('#auth-email');
const authPassword = document.querySelector('#auth-password');
const authConfirmPassword = document.querySelector('#auth-confirm-password');
const confirmPasswordField = document.querySelector('#confirm-password-field');
const authSubmit = document.querySelector('#auth-submit');
const authMessage = document.querySelector('#auth-message');
const authSubtitle = document.querySelector('#auth-subtitle');
const authModeToggle = document.querySelector('#auth-mode-toggle');
const signOutButton = document.querySelector('#sign-out');
const passwordToggles = document.querySelectorAll('.password-toggle');
let isSignUpMode = false;

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
		'auth/user-not-found': 'No account exists for this email. Create the user in Firebase Console first.',
		'auth/wrong-password': 'The password is incorrect.',
		'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
		'auth/weak-password': 'Use a password with at least 6 characters.',
		'auth/operation-not-allowed': 'Email/password sign-up is disabled. Enable it in Firebase Console.',
		'auth/configuration-not-found': 'Firebase Authentication is not configured for this project.',
		'auth/app-not-authorized': 'This website is not authorized in Firebase Authentication settings.',
		'auth/invalid-api-key': 'The Firebase web app configuration is invalid.',
		'auth/network-request-failed': 'Network error. Check your connection and try again.',
		'auth/too-many-requests': 'Too many attempts. Try again later.'
	};
	authMessage.textContent = messages[error.code]
		|| `${isSignUpMode ? 'Unable to create the account' : 'Unable to sign in'} (${error.code || 'unknown error'}).`;
}

function setAuthMode(signUpMode) {
	isSignUpMode = signUpMode;
	confirmPasswordField.hidden = !isSignUpMode;
	authConfirmPassword.required = isSignUpMode;
	authSubmit.textContent = isSignUpMode ? 'Create account' : 'Sign in';
	authSubtitle.textContent = isSignUpMode
		? 'Create an account to access your deployment observatory.'
		: 'Sign in to view your deployment observatory.';
	authModeToggle.textContent = isSignUpMode
		? 'Already have an account? Sign in'
		: 'Need an account? Sign up';
	authMessage.textContent = '';
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
	authSubmit.textContent = isSignUpMode ? 'Creating account...' : 'Signing in...';

	try {
		if (isSignUpMode) {
			if (authPassword.value !== authConfirmPassword.value) {
				authMessage.textContent = 'Passwords do not match.';
				return;
			}

			await auth.createUserWithEmailAndPassword(authEmail.value, authPassword.value);
		} else {
			await auth.signInWithEmailAndPassword(authEmail.value, authPassword.value);
		}

		authForm.reset();
	} catch (error) {
		showAuthenticationError(error);
	} finally {
		authSubmit.disabled = false;
		authSubmit.textContent = isSignUpMode ? 'Create account' : 'Sign in';
	}
});

authModeToggle.addEventListener('click', () => setAuthMode(!isSignUpMode));

passwordToggles.forEach((toggle) => {
	toggle.addEventListener('click', () => {
		const passwordInput = document.querySelector(`#${toggle.dataset.passwordTarget}`);
		const isPasswordVisible = passwordInput.type === 'text';
		passwordInput.type = isPasswordVisible ? 'password' : 'text';
		toggle.textContent = isPasswordVisible ? 'Show' : 'Hide';
	});
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
