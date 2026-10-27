// Fictional documents with known facts. Every fact the questions ask about is written here.

const filler = (topic, n) =>
  Array.from({ length: n }, (_, i) => `${topic} note ${i + 1}: general background text that does not change the terms above.`);

export const DOCUMENTS = {
  serviceAgreement: {
    title: "Service Agreement",
    pages: [
      [
        "SERVICE AGREEMENT",
        "This agreement is made between Acme GmbH (the provider) and Northwind Ltd (the client).",
        "It takes effect on 1 March 2026 and covers consulting services for a data platform migration.",
        ...filler("Scope", 3),
      ],
      [
        "TERMINATION",
        "Either party may terminate this agreement with thirty (30) days written notice.",
        "A termination notice must be sent by registered mail to the address of the other party.",
        "For cause, the agreement ends immediately if a material breach is not cured within 14 days.",
        ...filler("Termination", 9),
      ],
      [
        "PAYMENT AND GOVERNING LAW",
        "The fixed fee is EUR 48,000, paid in four equal installments.",
        "Invoices are due within fourteen (14) days of receipt.",
        "Late payments incur interest of 2 percent per month.",
        "This agreement is governed by the laws of Germany and the courts of Munich have jurisdiction.",
        ...filler("Payment", 3),
      ],
    ],
  },

  vendorContract: {
    title: "Vendor Contract",
    pages: [
      [
        "VENDOR CONTRACT",
        "This contract is made between Globex Corp (the vendor) and Acme GmbH (the buyer).",
        "The contract runs for a term of 24 months from signature.",
        ...filler("Term", 3),
      ],
      [
        "TERMS",
        "Either party may terminate this contract with sixty (60) days written notice.",
        "Invoices are due within thirty (30) days of receipt.",
        "Late payments incur interest of 1.5 percent per month.",
        "The liability of the vendor is capped at EUR 100,000.",
        "This contract is governed by the laws of England.",
        ...filler("Terms", 3),
      ],
    ],
  },

  employeeHandbook: {
    title: "Mitarbeiterhandbuch",
    pages: [
      [
        "MITARBEITERHANDBUCH",
        "Jeder Mitarbeiter hat Anspruch auf 28 Urlaubstage pro Kalenderjahr.",
        "Die Probezeit dauert sechs Monate.",
        "Die regelmäßige Arbeitszeit beträgt 40 Stunden pro Woche, mit Gleitzeit zwischen 7 und 10 Uhr.",
        ...filler("Allgemeines", 3),
      ],
      [
        "REGELN UND PFLICHTEN",
        "Im Homeoffice dürfen Mitarbeiter bis zu zwei Tage pro Woche arbeiten.",
        "Reisekosten werden für die Bahn in der zweiten Klasse erstattet.",
        "Nach der Probezeit beträgt die Kündigungsfrist vier Wochen zum Monatsende.",
        "Passwörter für Firmensysteme müssen alle 90 Tage geändert werden.",
        ...filler("Regeln", 3),
      ],
    ],
  },

  resume: {
    title: "Candidate Resume",
    pages: [
      [
        "JANE EXAMPLE - SENIOR DATA ENGINEER",
        "Experience: Senior Data Engineer at Initech from 2022 to 2025.",
        "Experience: Data Engineering Intern at Hooli in 2019.",
        "Education: B.Sc. in Computer Science, Example University, 2018.",
        "Skills: Python, SQL and Apache Airflow.",
        "Certifications: AWS Certified Data Analytics.",
        "Languages: English (fluent) and German (B2).",
        ...filler("Profile", 3),
      ],
    ],
  },
};
