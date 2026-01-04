# Zoho Application Service

## Description

The Zoho Application Service is a NestJS microservice that provides business logic and API endpoints for managing various Zoho CRM-related operations. This service acts as an orchestration layer that integrates multiple business modules to handle complex workflows related to customer management, training programs, and business processes.

## Core Functionality

The service provides the following modules:

- **Hardware Rentals**: Manages hardware rental operations, shipping labels, and rental date updates
- **Welcome Events**: Handles welcome event management and scheduling
- **Qualification Plans**: Creates and manages qualification plans for training programs, including validation and reordering
- **Quotes**: Generates and manages quotes (both standard and self-paid), including PDF generation
- **Measure Module Lists**: Manages measure module lists and related operations
- **Debtors**: Handles debtor management and related financial operations
- **Contracts**: Manages contract generation, processing, and PDF document creation
- **Enrollments**: Handles course enrollment management and tracking
- **Certificates**: Generates and manages various types of certificates (course, education, measure, attendance)

The service integrates with:

- Zoho CRM via the Zoho Service
- Airtable for product and course data
- PDF Generator Service for document generation
- OpenAI for content generation (where applicable)

**Critical Dependency**: This service depends on the **Zoho Service**. The environment (development or production) of this service **must match** the environment of the Zoho Service it connects to. The Zoho Service's `ZOHO_CRM_SOID` variable determines which Zoho CRM organization is used, and this service must connect to the Zoho Service instance running in the same environment.

## Environment Variables

| Variable                                | Description                                                                    | Default       | Required |
| --------------------------------------- | ------------------------------------------------------------------------------ | ------------- | -------- |
| `NODE_ENV`                              | Node.js environment mode (development/production)                              | `development` | No       |
| `SERVICE_PORT`                          | Port number for the service to listen on                                       | `3000`        | No       |
| `SERVICE_NAME`                          | Name of the service (used in Swagger documentation)                            | -             | No       |
| `GLOBAL_PREFIX`                         | Global API prefix for all endpoints                                            | -             | No       |
| `API_PREFIX`                            | API version prefix                                                             | -             | No       |
| `API_VERSION`                           | API version number                                                             | -             | No       |
| `ENABLE_SWAGGER`                        | Enable Swagger API documentation UI                                            | -             | No       |
| `MS_ZOHO_URL`                           | Base URL for the Zoho Service (must match the environment)                     | -             | Yes      |
| `MS_PDF_GENERATOR_URL`                  | Base URL for the PDF Generator Service                                         | -             | Yes      |
| `PDF_ASSETS_URL`                        | URL for static assets used in PDF generation                                   | -             | Yes      |
| `ZOHO_AIRTABLE_BASE_ID`                 | Airtable base ID for Zoho CRM data                                             | -             | Yes      |
| `ZOHO_COURSE_VERSION_AIRTABLE_TABLE_ID` | Airtable table ID for course versions                                          | -             | Yes      |
| `ZOHO_ZOHO_PRODUCTS_AIRTABLE_TABLE_ID`  | Airtable table ID for products                                                 | -             | Yes      |
| `MC_COURSE_ID`                          | Master course ID                                                               | `K7.0036`     | No       |
| `ENV`                                   | Environment identifier (used for document prefix, e.g., 'DEV' for development) | -             | No       |
| `MS_PDF_UPLOAD_ENDPOINT`                | Endpoint for PDF upload operations (optional)                                  | -             | No       |
| `MS_HTML_FRONTEND`                      | Base URL for HTML frontend (optional, used for legacy PDF generation)          | -             | No       |
| `MS_HTML_TO_PDF_ENDPOINT`               | Endpoint for HTML to PDF conversion (optional, used for legacy PDF generation) | -             | No       |

**Critical Dependency Note**: The `MS_ZOHO_URL` must point to a Zoho Service instance running in the same environment (development or production). The Zoho Service's `ZOHO_CRM_SOID` variable determines which Zoho CRM organization is used. If you run this service in development, the Zoho Service must also be running in development with the development `ZOHO_CRM_SOID`. Similarly, if you run this service in production, the Zoho Service must be running in production with the production `ZOHO_CRM_SOID`.

## API Documentation

When Swagger is enabled (via `ENABLE_SWAGGER=true`), you can access the interactive API documentation at:

```
http://localhost:{SERVICE_PORT}/api
```

The Swagger UI provides:

- Complete list of available endpoints
- Request/response schemas
- Interactive API testing capabilities
- Authentication requirements

## Project Dependencies

To visualize the project dependencies and understand how this service relates to other projects in the workspace, use the Nx graph:

```bash
nx graph
```

Or use the Nx VS Code extension to view the dependency graph interactively. This will show:

- Dependencies on other libraries (certificates, quotes, qualification-plan, etc.)
- Dependency on the Zoho Service
- Projects that depend on this service
- The overall project architecture

## Running the Service

### Development Environment

To run the service in development mode using the Nx VS Code extension:

1. **Prerequisites**: Ensure the **Zoho Service** is running in development mode with the development `ZOHO_CRM_SOID` configured. The Zoho Service must be accessible at the URL specified in `MS_ZOHO_URL`.

2. **Set Environment Variables**: Ensure you have a `.env.development` file in `projects/zoho-application/service/` with the following:

```env
NODE_ENV=development
ENV=development
SERVICE_PORT=3004
SERVICE_NAME=zoho-application-service
GLOBAL_PREFIX=api
API_PREFIX=v
API_VERSION=1
ENABLE_SWAGGER=true

# Zoho Service URL (Development) - Must point to Zoho Service running in development
MS_ZOHO_URL=http://localhost:3002/api/v1/zoho

# PDF Generator Service
MS_PDF_GENERATOR_URL=http://localhost:3003
PDF_ASSETS_URL=https://assets.company.de/generator

# Airtable Configuration
ZOHO_AIRTABLE_BASE_ID=your_base_id
ZOHO_COURSE_VERSION_AIRTABLE_TABLE_ID=your_table_id
ZOHO_ZOHO_PRODUCTS_AIRTABLE_TABLE_ID=your_table_id

# Other Configuration
MC_COURSE_ID=K7.0036
```

**Important**:

- The `MS_ZOHO_URL` must point to the Zoho Service running in development mode.
- The Zoho Service must have its `.env.development` file configured with the development `ZOHO_CRM_SOID`.
- The environment of this service must match the environment of the Zoho Service it connects to.
- **Never run this service in development while connecting to a Zoho Service running in production, or vice versa.**

3. **Run via Nx VS Code Extension**:
   - Open the Nx sidebar in VS Code
   - Find `zoho-application-service` in the project list
   - Right-click and select "Run Target" → `serve` → `development`
   - The service will start and be available at `http://localhost:3004/api/v1`

### Production Environment

To run the service in production mode using the Nx VS Code extension:

1. **Prerequisites**: Ensure the **Zoho Service** is running in production mode with the production `ZOHO_CRM_SOID` configured. The Zoho Service must be accessible at the URL specified in `MS_ZOHO_URL`.

2. **Set Environment Variables**: Ensure you have a `.env.production` file in `projects/zoho-application/service/` with the following:

```env
NODE_ENV=production
ENV=production
SERVICE_PORT=3000
SERVICE_NAME=zoho-application-service
GLOBAL_PREFIX=api
API_PREFIX=v
API_VERSION=1
ENABLE_SWAGGER=false

# Zoho Service URL (Production) - Must point to Zoho Service running in production
MS_ZOHO_URL=http://zoho-service-service.microservices.svc.cluster.local:3000/api/v1/zoho

# PDF Generator Service
MS_PDF_GENERATOR_URL=https://pdf-generator.example.com
PDF_ASSETS_URL=https://assets.company.de/generator

# Airtable Configuration
ZOHO_AIRTABLE_BASE_ID=your_base_id
ZOHO_COURSE_VERSION_AIRTABLE_TABLE_ID=your_table_id
ZOHO_ZOHO_PRODUCTS_AIRTABLE_TABLE_ID=your_table_id

# Other Configuration
MC_COURSE_ID=K7.0036
```

**Important**:

- The `MS_ZOHO_URL` must point to the Zoho Service running in production mode.
- The Zoho Service must have its `.env.production` file configured with the production `ZOHO_CRM_SOID`.
- The environment of this service must match the environment of the Zoho Service it connects to.
- **Never run this service in production while connecting to a Zoho Service running in development, or vice versa.**
- Mismatched environments can lead to data corruption or connecting to the wrong Zoho CRM organization.

3. **Run via Nx VS Code Extension**:
   - Open the Nx sidebar in VS Code
   - Find `zoho-application-service` in the project list
   - Right-click and select "Run Target" → `serve` → `production`
   - The service will start and be available at `http://localhost:3000/api/v1`

### Environment File Structure

The service supports multiple environment files that are loaded in the following order:

| File               | When Loaded                                   | Purpose                                                   |
| ------------------ | --------------------------------------------- | --------------------------------------------------------- |
| `.env`             | Always                                        | Base environment variables shared across all environments |
| `.env.development` | When running with `development` configuration | Development-specific variables                            |
| `.env.production`  | When running with `production` configuration  | Production-specific variables                             |
| `.env.local`       | Always (if exists)                            | Personal secrets and overrides (excluded from git)        |

**Note**: The `.env.local` file is excluded from git and should be used for personal secrets and local overrides.

### Environment Matching Requirements

**Critical**: The environment configuration of this service must always match the environment configuration of the Zoho Service:

- **Development**: If running this service in development, the Zoho Service must also be running in development with the development `ZOHO_CRM_SOID`. The `MS_ZOHO_URL` should point to `http://localhost:3002/api/v1/zoho` (or the development Zoho Service URL).
- **Production**: If running this service in production, the Zoho Service must also be running in production with the production `ZOHO_CRM_SOID`. The `MS_ZOHO_URL` should point to the production Zoho Service URL (e.g., `http://zoho-service-service.microservices.svc.cluster.local:3000/api/v1/zoho`).

The `MS_ZOHO_URL` environment variable should point to the Zoho Service instance running in the same environment. Mismatched environments can lead to:

- Data corruption
- Connecting to the wrong Zoho CRM organization
- Unpredictable behavior
- Security issues

### Using Nx CLI (Alternative)

You can also run the service using the Nx CLI:

```bash
# Development
nx serve zoho-application-service --configuration=development

# Production
nx serve zoho-application-service --configuration=production
```

**Note**: Ensure the Zoho Service is running in the matching environment before starting this service.

## Additional Notes

- The service automatically handles communication with the Zoho Service
- All requests to Zoho CRM are routed through the Zoho Service
- The service supports pagination for large result sets automatically
- Error handling is built-in for service-to-service communication
- The service logs all operations for debugging purposes
