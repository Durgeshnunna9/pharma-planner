const customers = [
    {
        "customer_code": "C001",
        "customer_name": "AASTRIVAS PHARMACEUTICALS",
        "gstin_number": "37AGDPP6227B2ZK",
        "company_name": "AASTRIVAS PHARMACEUTICALS",
        "dl20b_number": "AP/06/04/2016-134451",
        "dl21b_number": "AP/06/04/2016-134452"
      },
      {
        "customer_code": "C002",
        "customer_name": "ABHIVRUDHI VET INDIA PVT LTD",
        "gstin_number": "36AAMCA1551D1ZZ",
        "company_name": "ABHIVRUDHI VET INDIA PVT LTD",
        "dl20b_number": "TG/25/01/2014-2312",
        "dl21b_number": "TG/25/01/2014-2312"
      },
      {
        "customer_code": "C003",
        "customer_name": "ACCORD PHARMA",
        "gstin_number": "36AENPB5055K1ZC",
        "company_name": "ACCORD PHARMA",
        "dl20b_number": "197/HD/AP/2005/W",
        "dl21b_number": "197/HD/AP/2005/W"
      },
      {
        "customer_code": "C004",
        "customer_name": "Ameer Veterinary Medical Store",
        "gstin_number": NaN,
        "company_name": NaN,
        "dl20b_number": "AP/26/12/2022-36766",
        "dl21b_number": "AP/26/12/2022-36765"
      },
      {
        "customer_code": "C005",
        "customer_name": "ANIMED VET MEDICAL AGENCIES",
        "gstin_number": "37AQRPD2913L1ZK",
        "company_name": "ANIMED VET MEDICAL AGENCIES",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C006",
        "customer_name": "Auscult",
        "gstin_number": "36ABUFA8732A1ZC",
        "company_name": "M/S.AUSCULT LIFE SCIENCES",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C007",
        "customer_name": "AVANY PHARMA",
        "gstin_number": "36ABRFA2187Q1ZL",
        "company_name": "AVANY PHARMA",
        "dl20b_number": "TS/MDL/2020-57903",
        "dl21b_number": "TS/MDL/2020-57903"
      },
      {
        "customer_code": "C008",
        "customer_name": "AVON REMEDIES PVT LTD",
        "gstin_number": "36AAWCA5278K1ZU",
        "company_name": "AVON REMEDIES PRIVATE LIMITED",
        "dl20b_number": "TS/MDL/2022-92668",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C009",
        "customer_name": "BIO LIFE HEALTHCARE",
        "gstin_number": "36AAGCB6758B2ZO",
        "company_name": NaN,
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C010",
        "customer_name": "CHARLILE VET PHARMACIA PVT LTD",
        "gstin_number": "29AAKCC9989K1ZH",
        "company_name": "CHARLIE VET PHARMACIA PRIVATE LIMITED",
        "dl20b_number": "KA-HB2-254845",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C011",
        "customer_name": "CHATRAPATHI AGENCY",
        "gstin_number": "36APWPV0295F1Z7",
        "company_name": "CHATRAPATHI AGENCY",
        "dl20b_number": "TS/SGY/2022-95996",
        "dl21b_number": "TS/SGY/2022-95996"
      },
      {
        "customer_code": "C012",
        "customer_name": "CUREVET FORMULATIONS",
        "gstin_number": "36ALJPK3643H1Z1",
        "company_name": "CUREVET FORMULATIONS",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C013",
        "customer_name": "CUREVET FORMULATIONS PRIVATE LIMITED",
        "gstin_number": "36AAKCC3773D1ZN",
        "company_name": "CUREVET FORMULATIONS PRIVATE LIMITED",
        "dl20b_number": "100/RR-11/AP2012",
        "dl21b_number": "100/RR-11/AP2012"
      },
      {
        "customer_code": "C014",
        "customer_name": "DAMA RAVINDAR YADAV",
        "gstin_number": NaN,
        "company_name": "RAVI YADAV VETERINARY MEDICAL & GENERAL STORES",
        "dl20b_number": "TS/NKL/2022-87442",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C015",
        "customer_name": "ELICID PHARMA",
        "gstin_number": "36BIBPB0717R1Z9",
        "company_name": "ELICID PHARMA",
        "dl20b_number": "TG/16/02/2017-24896",
        "dl21b_number": "TG/16/02/2017-24896"
      },
      {
        "customer_code": "C016",
        "customer_name": "EMAR HEALTH CARE",
        "gstin_number": "36AHVPM4500F1ZA",
        "company_name": "EMAR HEALTH CARE",
        "dl20b_number": "TS/MDL/2020-65083",
        "dl21b_number": "TS/MDL/2020-65083"
      },
      {
        "customer_code": "C017",
        "customer_name": "GEONIC PHARMA",
        "gstin_number": "36AAVFG3524A1ZJ",
        "company_name": "GEONIC PHARMA",
        "dl20b_number": "TS/MDL/2020-64605",
        "dl21b_number": "TS/MDL/2020-64605"
      },
      {
        "customer_code": "C018",
        "customer_name": "Global Formulations",
        "gstin_number": "36ADHPT1179P1ZR",
        "company_name": "M/S GLOBAL FORMULATIONS ",
        "dl20b_number": "TG/81/RR-1/AP2012",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C019",
        "customer_name": "Krishna Nayaka",
        "gstin_number": "29FGYPR0744B1ZW",
        "company_name": "KARNATAKA MARKETING",
        "dl20b_number": "KA-KP1-222985",
        "dl21b_number": "KA-KP1-222986"
      },
      {
        "customer_code": "C020",
        "customer_name": "KSA PHARMA",
        "gstin_number": "36BNQPS6994H1ZX",
        "company_name": "M/S K S A  PHARMA",
        "dl20b_number": "70/HD1/AP/2010",
        "dl21b_number": "70/HD1/AP/2010"
      },
      {
        "customer_code": "C021",
        "customer_name": "LIFEVET FORMULATIONS",
        "gstin_number": "36AAKFL1190L1Z0",
        "company_name": "LIFEVET FORMULATIONS",
        "dl20b_number": "TS/HYD/2018-39552",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C022",
        "customer_name": "Lokesh Vet Formulations",
        "gstin_number": "36BFKPC7052N1Z4",
        "company_name": "LOKESH VET FORMULATIONS",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C023",
        "customer_name": "MAK ENTERPRISES",
        "gstin_number": "36AEJPC3783R1ZU",
        "company_name": "MAK ENTERPRISES",
        "dl20b_number": "TS/HYD/2020-57904",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C024",
        "customer_name": "MITTAL REMEDIES",
        "gstin_number": "36ACDPA8235G1ZW",
        "company_name": "M/S MITTAL REMEDIES",
        "dl20b_number": "24/06/2016-19437",
        "dl21b_number": "24/06/2016-19438"
      },
      {
        "customer_code": "C025",
        "customer_name": "MUKESH MEDICAL & GENERAL STORES",
        "gstin_number": NaN,
        "company_name": NaN,
        "dl20b_number": "AP/26/12/2023-39627",
        "dl21b_number": "AP/26/12/2023-39628"
      },
      {
        "customer_code": "C026",
        "customer_name": "NARMEDI IMPEX",
        "gstin_number": "36AERPA8570L2ZW",
        "company_name": "NAR MEDI IMPEX",
        "dl20b_number": "TS/MDL/2018-37372",
        "dl21b_number": "TS/MDL/2018-37372"
      },
      {
        "customer_code": "C027",
        "customer_name": "NEOMEDS",
        "gstin_number": "36AAOFN7807N1ZI",
        "company_name": "NEOMEDS",
        "dl20b_number": "TG/20/04/2014-115548",
        "dl21b_number": "TG/20/04/2014-115549"
      },
      {
        "customer_code": "C028",
        "customer_name": "NETCO DRUGS",
        "gstin_number": "36ETOPK8571B1ZB",
        "company_name": "NETCO DRUGS",
        "dl20b_number": "20826",
        "dl21b_number": "20827"
      },
      {
        "customer_code": "C029",
        "customer_name": "NEW MYSORE MEDICAL PHARMACY",
        "gstin_number": "29AAJPQ8520C1ZL",
        "company_name": "NEW MYSORE MEDICAL AND PHARMACEUTICAL DISTRIBUTORS",
        "dl20b_number": "KA-YD1/20-181896",
        "dl21b_number": "KA-YD1/20-181897"
      },
      {
        "customer_code": "C030",
        "customer_name": "NIHARIKA PHARMA CHEM",
        "gstin_number": "36ANCPK8055E4ZZ",
        "company_name": "NIHARIKA PHARMACHEM",
        "dl20b_number": "TG/15/05/2015-10561",
        "dl21b_number": "TG/15/05/2015-10562"
      },
      {
        "customer_code": "C031",
        "customer_name": "NOVOSTART LIFE SCIENCES",
        "gstin_number": "36ABLPA4356K1ZJ",
        "company_name": "M/S NOVOSTART LIFE SCIENCES",
        "dl20b_number": "TG/25/01/2016-15102",
        "dl21b_number": "TG/25/01/2016-15103"
      },
      {
        "customer_code": "C032",
        "customer_name": "PANEX VET PHARMA",
        "gstin_number": "36AJYPH1154K2ZR",
        "company_name": "PANEX VET PHARMA",
        "dl20b_number": "TG/25/04/2015-4334,4335",
        "dl21b_number": "TG/25/04/2015-4334,4335"
      },
      {
        "customer_code": "C033",
        "customer_name": "PINAKIN PHARMA",
        "gstin_number": "36AAUFP0373R1ZB",
        "company_name": "PINAKIN PHARMA",
        "dl20b_number": "TG/16/02/2017-24894",
        "dl21b_number": "TG/16/02/2017-24895"
      },
      {
        "customer_code": "C034",
        "customer_name": "PUREVET PHARMA",
        "gstin_number": "23AEKPR3546L1Z4",
        "company_name": "PUREVET PHARMA",
        "dl20b_number": "DB-434/760/95",
        "dl21b_number": "DB-434/760/95"
      },
      {
        "customer_code": "C035",
        "customer_name": "RADCO PHARMACEUTICALS",
        "gstin_number": "36AQFPK5352C5ZZ",
        "company_name": "Radco Phrmaceuticals",
        "dl20b_number": "TG/15/04/2016-14772",
        "dl21b_number": "TG/15/04/2016-14773"
      },
      {
        "customer_code": "C036",
        "customer_name": "RADHA MEDICALS",
        "gstin_number": "29AAGFR4010B1ZP",
        "company_name": "RADHA MEDICALS DENTAL & SURGICAL DIVISION",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C037",
        "customer_name": "RAJARAJESWARA ENTERPRISES",
        "gstin_number": "36ABAFR5448N1ZP",
        "company_name": "RAJA RAJESHWARA ENTERPRISES",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C038",
        "customer_name": "Redwin Health Care",
        "gstin_number": "36EAMPK0964H1ZF",
        "company_name": "REDWIN HEALTHCARE",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C039",
        "customer_name": "REZOS HEALTH CARE",
        "gstin_number": "36CMTPK8141D1ZS",
        "company_name": "REZOS HEALTH CARE",
        "dl20b_number": "TG/15/05/2017-23906",
        "dl21b_number": "TG/15/05/2017-23907"
      },
      {
        "customer_code": "C040",
        "customer_name": "RR VETERINARY HEALTH CARE",
        "gstin_number": "36AAHCR7600R1ZS",
        "company_name": "RR VETERINARY HEALTH CARE PVT LTD",
        "dl20b_number": NaN,
        "dl21b_number": NaN
      },
      {
        "customer_code": "C041",
        "customer_name": "SALMAN MEDICAL & GENERAL STORES",
        "gstin_number": NaN,
        "company_name": "SALMAN MEDICAL & GENERAL STORES",
        "dl20b_number": "AP/12/02/2021-21862",
        "dl21b_number": "AP/12/02/2021-21863"
      },
      {
        "customer_code": "C042",
        "customer_name": "SISTA BIOTICS",
        "gstin_number": "37ADLFS8854J2Z6",
        "company_name": "SISTA BIOTICS",
        "dl20b_number": "AP/05/02/2018-145874",
        "dl21b_number": "AP/05/02/2018-145875"
      },
      {
        "customer_code": "C043",
        "customer_name": "SK PHARMA",
        "gstin_number": "37DLMPS8829F1ZB",
        "company_name": "SK PHARMA",
        "dl20b_number": "AP/12/04/2021-20237",
        "dl21b_number": "AP/12/04/2021-20238"
      },
      {
        "customer_code": "C044",
        "customer_name": "SOUDAGAR MEDICALS & PHARMA",
        "gstin_number": "29AJHPI1808C1ZJ",
        "company_name": "M/S SOUDAGAR MEDICALS PHARMACEUTICALS DISTRIBUTORS,AGENCIES & ENTERPRISES",
        "dl20b_number": "KA-YD1/20B-116160",
        "dl21b_number": "KA-YD1/20B-116161"
      },
      {
        "customer_code": "C045",
        "customer_name": "SRI LAXMI VENKATESHWARA MEDICALS",
        "gstin_number": "36IJRPK6005B1Z7",
        "company_name": "SRI LAXMI VENKATESWARA MEDICAL AGENCY",
        "dl20b_number": "TS/MDL/2020-67364",
        "dl21b_number": "TS/MDL/2020-67364"
      },
      {
        "customer_code": "C046",
        "customer_name": "SYNRITZ LIFE SCIENCES",
        "gstin_number": "36ABHCS8159H1ZU",
        "company_name": "SYNRITZ LIFE SCIENCES PRIVATE LIMITED",
        "dl20b_number": "TG/MDL/2024-123367",
        "dl21b_number": "TG/MDL/2024-123367"
      },
      {
        "customer_code": "C047",
        "customer_name": "SYNTHADEX PHARMA",
        "gstin_number": "36CZWPS8770G1ZA",
        "company_name": "SYNTHADEX PHARMA",
        "dl20b_number": "TG/20/24/2014-115548",
        "dl21b_number": "TG/20/24/2014-115549"
      },
      {
        "customer_code": "C048",
        "customer_name": "SYSTEMIC HEALTH CARE",
        "gstin_number": "36ABSFS1621E1Z6",
        "company_name": "M/S SYSTEMIC HEALTH CARE",
        "dl20b_number": "491/HD/AP/2008/W",
        "dl21b_number": "491/HD/AP/2008/W"
      },
      {
        "customer_code": "C049",
        "customer_name": "Thanvi Pharma",
        "gstin_number": "36ATPPM3732R1ZU",
        "company_name": "THANVI PHARMA",
        "dl20b_number": "TS/MDL/2020-63328",
        "dl21b_number": NaN
      },
      {
        "customer_code": "C050",
        "customer_name": "THE UNIVERSAL PHARMACEUTICALS",
        "gstin_number": "37AGVPB5772B1Z9",
        "company_name": "UNIVERSAL PHARMACEUTICALS MADANAPALLE",
        "dl20b_number": "532/AP/TPT/W/2009",
        "dl21b_number": "532/AP/TPT/W/2009"
      },
      {
        "customer_code": "C051",
        "customer_name": "VARALAKSHMI PHARMA",
        "gstin_number": "36ATRPK0112B1Z7",
        "company_name": "VARALAXMI PHARMA",
        "dl20b_number": "TG/23/01/2017-26190",
        "dl21b_number": "TG/23/01/2017-26190"
      }
]

export default customers;