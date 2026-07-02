# Security

## Reporting vulnerabilities

Please do not open public issues for security vulnerabilities. Contact the maintainers listed in `CITATION.cff` or use the Netherlands eScience Center contact channels.

## Scope

Collens is a browser-based research software application for manuscript collation and visualization. It is intended for local/project use with scholarly text and image data.

Security assumptions:

- Users should not upload confidential manuscript material to deployments they do not control.
- Local browser storage is used for project data; users remain responsible for managing sensitive data on their own machines.
- The application may call external collation services when CollateX integration is used. Do not send restricted data to external services unless you have permission.
- Secrets must not be committed to the repository. Use environment variables or deployment secrets where needed.
- Dependencies should be reviewed and updated as part of normal maintenance.
