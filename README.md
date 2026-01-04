# CRM Quote Processing & PDF Generation Integration

## Overview

This project is a robust CRM integration solution for quote processing. It streamlines the workflow between Zoho CRM, Airtable, and a dynamic PDF generation engine.
automating business logic, quote handling, data collection, and PDF document creation. Designed for scalability and developer extensibility, 
Ideal for organizations seeking a seamless link between their CRM, document workflows, and external management platforms.

## Features

- **Zoho CRM Integration**: Reads, modifies, and syncs lead, contact, quote, and product information directly from Zoho CRM.
- **Airtable Sync**: Fetches and pushes data to Airtable for additional workflows or reporting.
- **Automated PDF Generation**: Dynamically generates professional, business-ready PDF documents (including quotes, contracts, and module lists) based on live CRM data.
- **Modular & Extensible**: Built with Nx (monorepo), the system supports easy addition of new PDF templates or logic modules.
- **Deployment Ready**: Dockerized for cloud or on-premise deployment, supports environment-based configuration.

## Architecture & Components

- **Zoho Application Service (Quote) Library**: Provides a robust REST API for processing quotes, managing seamless communication between Zoho CRM and internal services. Ensures reliable data orchestration, validation, and integration for all quote-related workflows.
- **Zoho Connector Service**: Secure NestJS-based microservice that manages OAuth2 authentication, CRUD operations, and record attachment within Zoho CRM. Handles rate limits, multi-org support, and OAuth token flows.
- **pdf-client-manager** (Nx Lib): Business logic for PDF creation, data mapping, and formatting.
- **Airtable Integration**: Uses a dedicated client library to fetch or store reference data, supplementing CRM entries.


## Data Flow

1. **Zoho Workflow Rule triggers Quote processing API**
2. **Service fetches the latest quote data** using Zoho Internal Connector.
3. **Data mapped and transformed** into the required business format.
4. **PDF Generator creates a document** with custom metadata, branding, and legal information as per templates.
5. **Final PDF is saved**, uploaded as an attachment to the relevant CRM record, or made available via API/download.

## Deployment
- Configuration via Docker, `docker-compose.yaml`, and environment variables
- Separate environment files for development, staging, production
- Swagger UI for rapid API testing and documentation (if enabled)

## CRM Workflow & Deluge Integration

To automate the quote processing workflow, Zoho Workflow Rules are used:
### 1. **Workflow Rules**

A Workflow Rule is created on the **Quotes** (or relevant) module to detect when a quote is created or updated, or when certain fields meet specific criteria. This rule then triggers a custom function or webhook to interact with our integration service.


## Technologies Used
- **Node.js/NestJS** (microservices & API)
- **TypeScript & Nx Monorepo**
- **Zoho CRM API** & **Airtable API**
- **Docker & Docker Compose**
- **Handlebars, PDFKit** (for template-driven PDF files)

> **Note:** This codebase is intended as a demonstration and is not fully functional. It represents only a subset of the services and features actually present in a production deployment, designed solely to illustrate the overall structure and workflow of the integration. For real-world use, significant additional development, configuration, and integration with external services would be required.

For more information, demo requests, or code walkthrough, feel free to reach out!

