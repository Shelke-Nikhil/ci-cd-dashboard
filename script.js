const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const refreshButton = document.querySelector('#refresh-button');
const lastSync = document.querySelector('#last-sync');
const toast = document.querySelector('#toast');
const totalProjects = document.querySelector('#total-projects');
const successfulBuilds = document.querySelector('#successful-builds');
const failedBuilds = document.querySelector('#failed-builds');
const projectList = document.querySelector('#project-list');
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
const githubUsername = 'Shelke-Nikhil';
const githubApiBase = 'https://api.github.com';
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

async function fetchGitHubJson(path) {
	const response = await fetch(`${githubApiBase}${path}`, {
		headers: {
			Accept: 'application/vnd.github+json'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub request failed (${response.status})`);
	}

	return response.json();
}

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function formatRelativeTime(dateValue) {
	if (!dateValue) {
		return 'No workflow yet';
	}

	const elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(dateValue).getTime()) / 60000));
	if (elapsedMinutes < 60) {
		return `${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'} ago`;
	}

	const elapsedHours = Math.round(elapsedMinutes / 60);
	if (elapsedHours < 24) {
		return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;
	}

	const elapsedDays = Math.round(elapsedHours / 24);
	return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
}

function getWorkflowState(workflow) {
	if (!workflow) {
		return { label: 'No workflow', modifier: 'neutral', failed: false };
	}

	if (workflow.status !== 'completed') {
		return { label: 'Running', modifier: 'running', failed: false };
	}

	if (workflow.conclusion === 'success') {
		return { label: 'Passing', modifier: 'success', failed: false };
	}

	return { label: 'Failed', modifier: 'failed', failed: true };
}

function getProjectIconClass(index) {
	return ['orange', 'blue', 'purple'][index % 3];
}

function renderProjects(projects) {
	if (!projects.length) {
		projectList.innerHTML = '<p class="project-loading">No public repositories found.</p>';
		return;
	}

	projectList.innerHTML = projects.map(({ repository, workflow }, index) => {
		const state = getWorkflowState(workflow);
		const iconText = repository.name.slice(0, 2).toUpperCase();
		const cardClass = state.failed ? ' project-card--attention' : '';
		const statusClass = state.modifier === 'success' ? 'build-status--success' : state.modifier === 'failed' ? 'build-status--failed' : '';

		return `
			<article class="project-card${cardClass}">
				<div class="project-top">
					<div class="project-icon project-icon--${getProjectIconClass(index)}">${escapeHtml(iconText)}</div>
					<div class="project-title">
						<h3>${escapeHtml(repository.name)}</h3>
						<p>${escapeHtml(repository.html_url.replace('https://', ''))}</p>
					</div>
					<span class="build-status ${statusClass}"><span></span> ${state.label}</span>
				</div>
				<div class="project-meta">
					<div><span class="meta-label">Last build</span><strong>${formatRelativeTime(workflow?.updated_at)}</strong></div>
					<div><span class="meta-label">Docker image</span><strong class="mono">Not connected</strong></div>
					<div><span class="meta-label">Deployment</span><strong>Not connected</strong></div>
					<span class="project-arrow" aria-hidden="true">↗</span>
				</div>
			</article>`;
	}).join('');
}

async function loadGitHubData() {
	projectList.innerHTML = '<p class="project-loading">Loading public repositories...</p>';

	try {
		const repositories = await fetchGitHubJson(`/users/${githubUsername}/repos?sort=updated&per_page=6`);
		const projects = await Promise.all(repositories.map(async (repository) => {
			try {
				const workflowResponse = await fetchGitHubJson(`/repos/${githubUsername}/${encodeURIComponent(repository.name)}/actions/runs?per_page=1`);
				return { repository, workflow: workflowResponse.workflow_runs[0] || null };
			} catch {
				return { repository, workflow: null };
			}
		}));
		const successful = projects.filter(({ workflow }) => getWorkflowState(workflow).modifier === 'success').length;
		const failed = projects.filter(({ workflow }) => getWorkflowState(workflow).failed).length;

		totalProjects.textContent = String(repositories.length).padStart(2, '0');
		successfulBuilds.textContent = String(successful).padStart(2, '0');
		failedBuilds.textContent = String(failed).padStart(2, '0');
		lastSync.textContent = 'Just now';
		renderProjects(projects);
	} catch (error) {
		projectList.innerHTML = '<p class="project-loading">GitHub data is temporarily unavailable. Try refreshing.</p>';
		showToast(error.message);
	}
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('is-visible');
	window.setTimeout(() => {
		toast.classList.remove('is-visible');
		toast.textContent = 'Dashboard refreshed';
	}, 3000);
}

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
		loadGitHubData();
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
	loadGitHubData();
	showToast('Refreshing GitHub data');
});
