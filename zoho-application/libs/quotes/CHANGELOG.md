## 0.12.0 (2025-12-16)

### 🚀 Features

- add validation for measure sheet creation

### 🩹 Fixes

- add all endpoints to handle measure sheets bussines logic expect attachement two creation
- replace airtableids with env vars

### 🧱 Updated Dependencies

- Updated openai-lib to 0.7.1
- Updated user-lib to 0.7.1
- Updated zoho-connector to 0.8.2
- Updated airtable-lib to 0.7.1
- Updated zoho-types to 0.12.0
- Updated qualification-plan-lib to 0.12.0
- Updated zoho-utility-lib to 0.10.0
- Updated pdf-document-types to 0.3.2

### ❤️ Thank You

- leon phung

## 0.11.3 (2025-12-04)

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.8.1
- Updated zoho-types to 0.11.0
- Updated qualification-plan-lib to 0.11.3
- Updated zoho-utility-lib to 0.9.3

## 0.11.2 (2025-12-04)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.11.2
- Updated zoho-utility-lib to 0.9.2

## 0.11.1 (2025-11-26)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.11.1
- Updated zoho-utility-lib to 0.9.1
- Updated pdf-document-types to 0.3.1

## 0.11.0 (2025-11-19)

### 🧱 Updated Dependencies

- Updated openai-lib to 0.7.0
- Updated user-lib to 0.7.0
- Updated zoho-connector to 0.8.0
- Updated airtable-lib to 0.7.0
- Updated zoho-types to 0.10.0
- Updated qualification-plan-lib to 0.11.0
- Updated zoho-utility-lib to 0.9.0
- Updated pdf-document-types to 0.3.0

## 0.10.6 (2025-11-07)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.10.2

## 0.10.5 (2025-11-06)

### 🩹 Fixes

- finished tnb creation

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.7.1
- Updated zoho-types to 0.9.1
- Updated qualification-plan-lib to 0.10.1
- Updated zoho-utility-lib to 0.8.3
- Updated pdf-document-types to 0.2.3

### ❤️ Thank You

- leon phung

## 0.10.4 (2025-10-22)

### 🩹 Fixes

- update quote measure sheet validation to set title
- grammar

### ❤️ Thank You

- leon phung
- Omar Maaref

## 0.10.3 (2025-10-20)

### 🩹 Fixes

- change criteria from funding instrument to template_Id

### ❤️ Thank You

- Omar Maaref

## 0.10.2 (2025-10-16)

### 🩹 Fixes

- refactor quotes + add startDateBefore14days check + change template html
- refactor quotes service for both selfpaid and normal

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.9.4
- Updated zoho-utility-lib to 0.8.1
- Updated pdf-document-types to 0.2.2

### ❤️ Thank You

- Omar Maaref

## 0.10.1 (2025-10-14)

### 🩹 Fixes

- add selfpaid contract pdf generation
- rename vars
- remove nachlass when its 0
- relax validation on degree for self payed

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.9.3

### ❤️ Thank You

- leon phung
- Omar Maaref

## 0.9.2 (2025-10-10)

### 🩹 Fixes

- rename vars
- remove nachlass when its 0
- relax validation on degree for self payed

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.6.1
- Updated zoho-types to 0.8.1
- Updated qualification-plan-lib to 0.9.2
- Updated zoho-utility-lib to 0.7.1
- Updated pdf-document-types to 0.2.1

### ❤️ Thank You

- leon phung
- Omar Maaref

## 0.10.0 (2025-10-08)

### 🚀 Features

- add first working version for contract generation

### 🩹 Fixes

- remove topic plan fetching from quote service

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.6.1
- Updated zoho-types to 0.8.1
- Updated qualification-plan-lib to 0.9.1
- Updated zoho-utility-lib to 0.8.0

### ❤️ Thank You

- leon phung

## 0.9.0 (2025-10-07)

### 🚀 Features

- add self payed quote generation pdf

### 🩹 Fixes

- fix error handling
- clean pdf generation, change naming
- quote self service template, criteria
- template, add validation and tests
- add payment frequency count logic
- remove old ids and add ZOHO_AIRTABLE_BASE_ID as env var
- rename properties
- remove all airtable relation to prod and certificate base
- possibel pa replacement fetching after chaging source
- remove unused ptb endpoint

### 🧱 Updated Dependencies

- Updated openai-lib to 0.6.0
- Updated user-lib to 0.6.0
- Updated zoho-connector to 0.6.0
- Updated airtable-lib to 0.6.0
- Updated zoho-types to 0.8.0
- Updated qualification-plan-lib to 0.9.0
- Updated zoho-utility-lib to 0.7.0
- Updated pdf-document-types to 0.1.0

### ❤️ Thank You

- leon phung
- Omar Maaref

## 0.8.0 (2025-09-17)

### 🚀 Features

- update quote layout to version 3 add topic plan back without teaching units
- lms chatbot ui
- support bot first functional version

### 🩹 Fixes

- fix pagination
- change Webhook Request payload, simplify logic, use prompts with filters, add readme
- formatting

### 🧱 Updated Dependencies

- Updated openai-lib to 0.5.0
- Updated user-lib to 0.5.0
- Updated zoho-connector to 0.5.0
- Updated airtable-lib to 0.5.0

### ❤️ Thank You

- Artem Kurtiak
- leon phung
- Omar Maaref

## 0.7.1 (2025-09-09)

### 🧱 Updated Dependencies

- Updated zoho-types to 0.6.1
- Updated zoho-utility-lib to 0.5.1

## 0.7.0 (2025-09-09)

### 🚀 Features

- add mein now keyword crawling

### 🩹 Fixes

- add validation for diffrent certificate ids between quote and qualiplan

### 🧱 Updated Dependencies

- Updated openai-lib to 0.4.0
- Updated user-lib to 0.4.0
- Updated zoho-connector to 0.4.0
- Updated airtable-lib to 0.4.0

### ❤️ Thank You

- leon phung

## 0.6.3 (2025-09-08)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.6.2

## 0.6.2 (2025-09-05)

### 🩹 Fixes

- add new reorder qp endpoint

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.6.1
- Updated zoho-utility-lib to 0.4.0

### ❤️ Thank You

- leon phung

## 0.6.1 (2025-09-02)

### 🩹 Fixes

- duplicated requriements on new quote layout

### ❤️ Thank You

- leon phung

## 0.6.0 (2025-09-02)

### 🚀 Features

- add quote learningplan logic

### ❤️ Thank You

- leon phung

## 0.5.0 (2025-08-28)

### 🚀 Features

- add docker-compose base setup

### 🧱 Updated Dependencies

- Updated openai-lib to 0.3.0
- Updated zoho-connector to 0.3.0
- Updated airtable-lib to 0.3.0

### ❤️ Thank You

- leon phung

## 0.4.0 (2025-08-28)

### 🚀 Features

- add quote measure certificate number validation

### 🩹 Fixes

- update validation for quote without shell
- add deal consultation protocol not empty

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.5.0

### ❤️ Thank You

- leon phung

## 0.3.0 (2025-08-19)

### 🚀 Features

- add active certificate validation

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.4.0

### ❤️ Thank You

- leon phung

## 0.2.5 (2025-08-12)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.3.0

## 0.2.4 (2025-08-08)

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.8
- Updated zoho-types to 0.3.1
- Updated qualification-plan-lib to 0.2.4

## 0.2.3 (2025-08-04)

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.7
- Updated qualification-plan-lib to 0.2.3

## 0.2.2 (2025-08-01)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.2.2

## 0.2.1 (2025-08-01)

### 🩹 Fixes

- degee salutation

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.2.1

### ❤️ Thank You

- leon phung

## 0.2.0 (2025-07-31)

### 🚀 Features

- add quote shell validation exclusion degree base

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.6
- Updated zoho-types to 0.3.0
- Updated qualification-plan-lib to 0.2.0

### ❤️ Thank You

- leon phung

## 0.1.16 (2025-07-30)

### 🩹 Fixes

- gender on personal justification

### ❤️ Thank You

- leon phung

## 0.1.15 (2025-07-30)

### 🩹 Fixes

- revert geneder personal relevance

### ❤️ Thank You

- leon phung

## 0.1.14 (2025-07-29)

### 🩹 Fixes

- bug on qp creation

### ❤️ Thank You

- leon phung

## 0.1.13 (2025-07-24)

### 🩹 Fixes

- qp learning plan creation for replace qps

### ❤️ Thank You

- leon phung

## 0.1.12 (2025-07-23)

### 🩹 Fixes

- empty product on quotes under 520 UE

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.5
- Updated zoho-types to 0.2.3
- Updated qualification-plan-lib to 0.1.4

### ❤️ Thank You

- leon phung

## 0.1.11 (2025-07-17)

### 🩹 Fixes

- debug quote on ang document creation
- debug quote on ang document creation

### ❤️ Thank You

- leon phung

## 0.1.10 (2025-07-17)

### 🩹 Fixes

- add more logging to quote data fetching

### ❤️ Thank You

- leon phung

## 0.1.9 (2025-07-16)

### 🩹 Fixes

- updated justification and laobourmarketrelevance prompts for quote ang generation
- add course order validation

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.4
- Updated zoho-types to 0.2.2
- Updated qualification-plan-lib to 0.1.3

### ❤️ Thank You

- leon phung

## 0.1.8 (2025-07-01)

### 🩹 Fixes

- implement alternative degree is used on personal relevance

### ❤️ Thank You

- leon phung

## 0.1.7 (2025-07-01)

### 🩹 Fixes

- missing agency name

### ❤️ Thank You

- leon phung

## 0.1.6 (2025-06-30)

### 🩹 Fixes

- add gender seperation on document creation
- minor changes on quote pdfs

### 🧱 Updated Dependencies

- Updated zoho-connector to 0.2.3
- Updated zoho-types to 0.2.1
- Updated qualification-plan-lib to 0.1.2

### ❤️ Thank You

- leon phung

## 0.1.5 (2025-06-30)

### 🩹 Fixes

- bugs on quote document creation
- error message on ptb template missing

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.1.1

### ❤️ Thank You

- leon phung

## 0.1.4 (2025-06-30)

### 🧱 Updated Dependencies

- Updated qualification-plan-lib to 0.1.0

## 0.1.3 (2025-06-30)

### 🩹 Fixes

- update quote and ptb layout and add additonal agreements on quote

### ❤️ Thank You

- leon phung

## 0.1.2 (2025-06-24)

### 🩹 Fixes

- missing properties for qp validation
- missing properties for qp validation

### ❤️ Thank You

- leon phung

## 0.1.1 (2025-06-24)

### 🩹 Fixes

- add missing qp validation on ptb creation

### ❤️ Thank You

- leon phung

## 0.1.0 (2025-06-23)

### 🚀 Features

- add missing prompt for product description prompt
- add endpoint to validate measure sheet on quote and working on quote pdf
- add quote measure sheet assingment logic

### 🩹 Fixes

- rebuild of update quote endpoint
- rebuild
- rename controller endpoints
- add missing create qp validation on create
- quote file naming
- add guards to zoho application endpoints

### ❤️ Thank You

- leon phung
