# pdf-generator-service

is a deployable app currently including:

- @company/pdf-generator-lib

## developer requirements

- local docker & docker compose

## start the service

```sh
npx nx run pdf-generator-service:serve:development
```

this will start a local Gotenbenrg instance and a NginX webserver for static files (css, images)

## Swagger

http://localhost:3001/api

you may test the Service and POST this JSON:

```sh
{
  "hbsTemplate": "<meta charset=\"utf-8\"><title>Testing</title><link href=\"https://fonts.googleapis.com\"rel=\"preconnect\"><link href=\"https://fonts.gstatic.com\"rel=\"preconnect\"crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap\"rel=\"stylesheet\"><link href=\"http://host.docker.internal:8080/styles.css\"rel=\"stylesheet\"><div class=\"page-fixed page-header\"><img height=\"auto\"src=\"http://host.docker.internal:8080/images/company_Logo.svg\"width=\"180px\"></div><div class=\"page-fixed page-footer\"><img height=\"100%\"src=\"http://host.docker.internal:8080/images/company_Welle_primaer.jpg\"width=\"100%\"> <span class=\"document-date\">Stand des Dokuments: 03.09.2024</span></div><table><thead><tr><td><div class=\"page-header-space\"> </div><tbody><tr><td class=\"page-content\"><div class=\"header-line\"></div><h1>{{headline}}</h1>{{!--<h1>WEITERBILDUNGSVERTRAG</h1>--}}<div class=\"contract-parties\"><p class=\"between\">zwischen</p><span class=\"organization-name\">company GmbH</span><p>Philipsbornstraße 2, 30165 Hannover<p>– nachstehend Bildungsträger genannt –<p class=\"and\">und</p><span class=\"participant-name\">Max Mustermann</span><p>Musterstraße 1, 11111 Musterstadt<p>- nachstehend Teilnehmer/Teilnehmerin genannt -</div><section><h2>§1 Leistungsumfang</h2><p>Vertraglicher Leistungsumfang, basierend auf dem Angebot 06-02-2025-20403:</section><table class=\"table\"><tr><td>BGS-/KD-Nr.<td>385D015903-01<tr><td>Dauer der Weiterbildung<td>3.3.2025 - 7.11.2025<tr><td>Unterrichtsform<td>Vollzeit (8 UE pro Tag)<tr><td>Abschlussbezeichnung<td>Qualifikationsprojekt im E-Commerce Strategisches Marketing Management E-Commerce Management<tr><td>Unterrichtseinheiten<td>1440 UE<tr><td>Weiterbildungskosten<td>11.300,80 €<tr><td>Durchschnittskosten je UE<td>7,85 €<tr><td>Durchführungsform<td>Online<tr><td>Durchführungsort<td>Home-Office<tr><td>Zertifikatseinträge:<td>2023M101535-10001-1595, 2023M101535-10001-1399, 2023M101535-10001-883, 2023M101535-10001-883<tr><td>Start der Maßnahme<td>3.3.2025</table><div class=\"legal-information\"><p>company GmbH<p>USt.-ID: DE 344613488<p>Amtsgericht Hannover, HRB 228435</div><div class=\"bank-information\"><p>Bank: Deutsche Bank<p>IBAN: DE40 8607 0000 0016 7049 00<p>BIC: DEUTDE8LXXX</div><section><h2>§2 Leistungserbringung</h2><p>Dieser Weiterbildungsvertrag regelt die Erbringung der Schulungsleistungen durch den Bildungsträger und die Rechte und P ichten des Teilnehmers oder der Teilnehmerin. Anderslautende, entgegenstehende oder abweichende Geschäftsbedingungen des Teilnehmers oder der Teilnehmerin werden nicht Vertragsinhalt, auch wenn der Bildungsträger nicht ausdrücklich widerspricht.</section><section><h2>§3 Begriffsbestimmungen</h2><p>„Kostenträger“ meint im Weiteren die Stelle, die die Kosten der vom Teilnehmer oder der Teilnehmerin gewählten Maßnahme trägt, z.B. die Bundesagentur für Arbeit, das Jobcenter, der Berufsförderungsdienst, die Deutsche Rentenversicherung, die Bezirksregierung. „Textform“ ist eine lesbare Erklärung, in der die Person des Erklärenden genannt ist, auf einem dauerhaften Datenträger abgegeben werden. Ein dauerhafter Datenträger ist jedes Medium, das es dem Empfänger ermöglicht, eine auf dem Datenträger bendliche, an ihn persönlich gerichtete Erklärung so aufzubewahren oder zu speichern, dass sie ihm oder ihr während eines für ihren Zweck angemessenen Zeitraums zugänglich ist, und geeignet ist, die Erklärung unverändert wiederzugeben, z.B. ein Papierausdruck oder ein PDF-Anhang zu einer E-Mail. „Unterrichtseinheit“ (UE) deniert die Lernzeit und wird in Minuten gemessen. Eine UE beträgt 45 Minuten.</section><tfoot><tr><td><div class=\"page-footer-space\"> </div></table>",

"data": { "headline": "test" } }

```
