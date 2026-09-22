# Personal DevOps Deployment Observatory

A personal dashboard for monitoring GitHub repositories, CI/CD pipelines, container images, and deployment health.

This project is being built incrementally as a practical DevOps and Cloud learning project.

## Current Status

The current version is a static frontend MVP using mock data.

It includes:

- Responsive dashboard layout
- Dark and light themes
- Theme preference persistence
- Project status cards
- Build statistics
- Deployment status indicators
- Mock refresh interaction

GitHub API, Firebase, Docker Hub, Kubernetes, and Argo CD integrations are planned for later phases.

## Tech Stack

### Current

- HTML
- CSS
- Vanilla JavaScript

### Planned

- Firebase Hosting
- Firebase Authentication
- Cloud Firestore, if required
- GitHub REST API
- Google Apps Script or another secure backend layer
- GitHub Actions
- Docker, Kubernetes, Helm, and Argo CD integrations

## Run Locally

No build tool or package installation is required for the current frontend.

The simplest option is to open `index.html` directly in a browser.

For a local HTTP server, use Python if it is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
.
├── index.html   # Dashboard structure and mock content
├── style.css    # Layout, themes, responsive styles, and visual design
├── script.js    # Theme toggle and demo interactions
└── README.md    # Project documentation
```

## Roadmap

1. Finalize the static dashboard design.
2. Add project documentation and architecture diagrams.
3. Configure Firebase Hosting.
4. Add single-user Firebase Authentication.
5. Design a secure backend boundary for GitHub API requests.
6. Display real GitHub repositories and Actions workflow status.
7. Add Docker image and deployment information.
8. Explore Kubernetes and Argo CD status integrations.
9. Add testing, error handling, and optional notifications.

## Security Notes

GitHub personal access tokens must never be placed in frontend JavaScript or committed to this repository.

Firebase Authentication and GitHub API authorization are separate concerns. Authentication identifies the dashboard user, while the backend must securely authorize requests to GitHub.

Before adding real integrations, the project will define:

- Where secrets are stored
- Which GitHub permissions are required
- How API rate limits and failures are handled
- Which data, if any, is stored in Firestore
- Firestore security rules for the single-user model

## Cost Goal

The target operating cost is INR 0 where practical. Free quotas and billing requirements will be checked against current official documentation before enabling cloud services.

## License

This is a personal learning and portfolio project.
