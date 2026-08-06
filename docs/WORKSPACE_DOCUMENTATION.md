# Workspace Documentation Maintenance

The in-app Workspace guide is the user-facing reference for business workflows. Keep it aligned with the workspace as part of the same change that alters a user-visible workflow.

## Canonical Guide

Update `app/(features)/(campus)/documentation/page.js` when a change affects any of the following:

- A sidebar page, tab, filter, dialog, or primary action.
- A business outcome, status, approval path, allocation rule, waitlist rule, or lifecycle.
- An import, export, report, or downloadable file that users rely on.
- User access, hierarchy ownership, activation, or deactivation behavior.

The guide explains business behavior and decision points. Do not add API, database, or implementation details unless they change what a user must do.

## When Adding A Page

For a new sidebar page or a new major workflow:

1. Add a guide entry with its purpose, available actions, business rules, search tags, and direct page link.
2. Put it in the correct Overview, Sales, or Operations category.
3. Update a workflow map when the new capability changes order fulfillment or sales ownership.
4. Confirm the guide is reachable from the Documentation sidebar item and searchable by the terms users would use.

## Change Checklist

Before completing a user-facing change:

1. Update the relevant guide entry in the same change.
2. Remove or revise any guide statements made obsolete by the new behavior.
3. Run focused lint for the documentation page when it changes.
4. Mention the documentation update in the change summary.

An update that is strictly internal and does not change the user experience does not need a guide revision.
