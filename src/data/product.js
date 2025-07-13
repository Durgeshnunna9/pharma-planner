const products = [
    {
      "external_id": "V001",
      "product_name": "ALBENDAZOLE 2.5% W/V SUSPENSION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-001",
      "sales_description": "Albendazole IP 2.5% w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P008",
      "product_name": "ALBENDAZOLE SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-002",
      "sales_description": "Each 5ml Contains, Albendazole IP 200mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "10ml"
      ]
    },
    {
      "external_id": "P009",
      "product_name": "ALUMINA,MAGNESIA&METHYL POLYSILOXANE SUSPENSION.",
      "category": "Human",
      "internal_reference": "REF: DL-003",
      "sales_description": "Each 5ml contains, Dried Aluminium Hydroxide IP 200mg, Light Magnesium Oxide IP 100mg, Dicyclomine Hydrochloride IP Eq to Dicyclomine 2.5mg, Simethicone IP 20mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P001",
      "product_name": "AMBROXOL HCL & LEVO SALBUTAMOL & GUAIPHENESIN COUGH SYRUP.",
      "category": "Human",
      "internal_reference": "REF: DL-004",
      "sales_description": "Each 5ml Contains, Ambroxol Hydrochloride IP 30mg, LevoSalbutamol IP Eq to LevoSalbutamol 1mg, Guaiphenesin IP 50mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P010",
      "product_name": "ANTICOLD SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-006",
      "sales_description": "Each 5ml Contains, Phenylephrine Hydrochloride IP 5mg, Chlorpheniramine Maleate IP 0.5mg, Paracetamol IP 125mg, Sodium Citrate IP 60mg, Menthol IP 1mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P066",
      "product_name": "AZITHROMYCIN ORAL SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-007",
      "sales_description": "Each 5ml Contains, Azithromycin (As Dihydrate) IP eq to Azithromycin Anhydrous 40mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "15ml",
        "30ml",
        "60ml."
      ]
    },
    {
      "external_id": "P058",
      "product_name": "B COMPLEX SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-008",
      "sales_description": "Each 5ml Contains, Thiamine Hydrochloride IP 1mg, Riboflavin IP 0.5mg, Pyridoxine Hydrochloride IP 0.5mg, Cyanocobalamin IP 0.5mcg, Niacinamide IP 7.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "150ml",
        "200ml"
      ]
    },
    {
      "external_id": "P034",
      "product_name": "B COMPLEX SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-009",
      "sales_description": "Each 5ml Contains, Vitamin B1 Hcl IP 0.5mg, Vitamin B2 IP 0.5mg, Vitamin B6 IIP    0.25mg, Vitamin B12 IP 0.25mcg, Niacinamide IP 7.5mg",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P035",
      "product_name": "B COMPLEX SYRUP WITH B12",
      "category": "Human",
      "internal_reference": "REF: DL-010",
      "sales_description": "Each 5ml Contains, Vitamin B1 IP 2.25mg, Vitamin B2 IP 2.5mg, Vitamin      B6 IP 0.75mg, Vitamin B12 IP 2.5mcg, Niacinamide IP 22.5mg",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P055",
      "product_name": "B COMPLEX SYRUP WITH B12",
      "category": "Human",
      "internal_reference": "REF: DL-011",
      "sales_description": "Each 5ml Contains, Vitamin B1 IP 1.0mg, Vitamin B2 IP 0.5mg, Vitamin B6 IP 0.5mg, Vitamin B12 IP 0.5mcg, Niacinamide IP 7.5mg",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P036",
      "product_name": "B COMPLEX TONIC",
      "category": "Human",
      "internal_reference": "REF: DL-012",
      "sales_description": "Each 5ml Contains, Folic Acid IP 500mcg, Vitamin B12 IP 2.5mcg, Vitamin D IP 200IU, Vitamin A IP 2500 IU",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P012",
      "product_name": "BRONCHODILATOR MYCOLYTIC COUGH SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-013",
      "sales_description": "Each 5ml Contains, Ambroxol Hydrochloride IP 15.0mg, Salbutamol IP 1mg, Guaiphenesin IP 50mg, Menthol IP 1.0mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P013",
      "product_name": "CETIRIZINE SOLUTION IP",
      "category": "Human",
      "internal_reference": "REF: DL-014",
      "sales_description": "Each 5ml Contains, Cetirizine Hydrochloride IP 5mg Solution",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "V002",
      "product_name": "CIPROFLOXACIN+TINIDAZOLE\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-015",
      "sales_description": "Each 5ml Contains, Cipro\ufb02oxacin Hydrochloride IP 125mg, Tinidazole IP 150mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V003",
      "product_name": "CLOSANTEL 15% W/V SOLUTION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-016",
      "sales_description": "Each ml Contains, Closantel 150mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V004",
      "product_name": "CLOSANTEL 5% W/V ORAL SOLUTION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-017",
      "sales_description": "Each ml Contains, Closantel 50mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P014",
      "product_name": "COUGH SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-018",
      "sales_description": "Each 5ml Contains, Dextromethorphan Hydrobromide IP 10mg, Chlorpheniramine Maleate IP 2mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P007",
      "product_name": "CYPROHEPTADINE HYDROCHLORIDE SYRUP IP",
      "category": "Human",
      "internal_reference": "REF: DL-019",
      "sales_description": "Each 5ml Contains, Cyproheptadine Hydrochloride IP 2mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P015",
      "product_name": "DISODIUM HYDROGEN CITRATE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-020",
      "sales_description": "Each 5ml Contains, Disodium Hydrogen Citrate 1.37gm Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "100ml"
      ]
    },
    {
      "external_id": "P016",
      "product_name": "DOXYPHYLLINE & TERBUTALINE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-021",
      "sales_description": "Each 5ml Contains, Doxofylline IP 2mg, Terbutaline Sulphate IP Eq to Terbutaline 120mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "V005",
      "product_name": "ENROFLOXACIN & BROMOHEXINE ORAL\nSOLUTION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-022",
      "sales_description": "Each ml Contains, Enro\ufb02oxacin BP 200mg, Bromhexine Hydrochloride IP 15mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V006",
      "product_name": "ENROFLOXACIN 10% ORAL SOLUTION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-023",
      "sales_description": "Each ml Contains, Enro\ufb02oxacin IP 100mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V007",
      "product_name": "ENROFLOXACIN ORAL SOLUTION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-024",
      "sales_description": "Each ml Contains, Enro\ufb02oxacin IP 200mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P002",
      "product_name": "EXEPECTORANT",
      "category": "Human",
      "internal_reference": "REF: DL-025",
      "sales_description": "Each 5ml Contains, Terbutaline Sulphate IP 1.25mg, Guaiphenesin IP 50mg, Ambroxol Hydrochloride IP 15mg, Menthol IP 2.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "V008",
      "product_name": "FENBENDAZOLE & OXYCLOZANIDE\nSUSPENSION(For Veterinary Use).",
      "category": "Veterinary",
      "internal_reference": "REF: DL-026",
      "sales_description": "Fenbendazole IP 2.5% w/v, Oxyclozanide IP 1.5% w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "-"
      ]
    },
    {
      "external_id": "V009",
      "product_name": "FENBENDAZOLE & OXYCLOZANIDE\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-027",
      "sales_description": "Fenbendazole IP 7.5% w/v, Oxyclozanide IP 4.5% w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V010",
      "product_name": "FENBENDAZOLE & PRAZIQUANTEL\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-028",
      "sales_description": "Each ml Contains, Fenbendazole IP 15mg, Praziquantel IP 5mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V011",
      "product_name": "FENBENDAZOLE 2.5% W/V SUSPENSION(For\nveterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-029",
      "sales_description": "Each ml Contains, Fenbendazole IP 25mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P019",
      "product_name": "GUAIPHENESIN & TERBUTALINE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-030",
      "sales_description": "Each 5ml Contains, Terbutaline Sulphate IP 1.5mg, Guaiphenesin IP  66.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P020",
      "product_name": "HAEMOTONIC SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-031",
      "sales_description": "Each 5ml Contains, Ferrous Ascorbate Eq to elemental Iron 30mg, Folic Acid IP 550mcg Suspension.",
      "uqc": "nan",
      "packing_sizes": [
        "150ml",
        "200ml"
      ]
    },
    {
      "external_id": "P021",
      "product_name": "IRON(III) HYDROXIDE POLYMALTOSE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-032",
      "sales_description": "Each 5ml Contains, Iron (III) Hydroxide Polymaltose complex Eq to Elemental Iron IP 50mg, Vitamin B6 IP 2 mg, Vitamin B12 IP 5mcg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "150ml",
        "200ml"
      ]
    },
    {
      "external_id": "V012",
      "product_name": "IVERMECTIN ORAL SOLUTION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-033",
      "sales_description": "Ivermectin IP 0.08% w/v Oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P022",
      "product_name": "LEVOCETIRIZINE DIHYDROCHLORIDE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-034",
      "sales_description": "Each 5ml Contains, Levocetirizine Di hydrochloride IP 2.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P023",
      "product_name": "LEVOCETIRIZINE HCL,MONTELUKAST SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-035",
      "sales_description": "Each 5ml Contains, Levocetirizine Hydrochloride IP eq to Levocetirizine 2.5mg, Montelukast Sodium IP eq to Montelukast 4.0mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "V013",
      "product_name": "LEVOFLOXACIN 10%W/V ORAL\nSOLUTION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-036",
      "sales_description": "Each ml Contains, Levo\ufb02oxacin Hemihydrate IP Eq to Levo\ufb02oxacin 100mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P024",
      "product_name": "LIQUID PARAFFIN SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-037",
      "sales_description": "Each 5ml Contains, Liquid Paraffin IP 1.25ml, Milk of Magnesia IP 3.75ml, Sodium picosulphate 3.33ml Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P006",
      "product_name": "MEGALDRATE & SIMETHICONE SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-038",
      "sales_description": "Each 5ml Contains, Magaldrate IP 400mg, Simethicone IP 60mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P025",
      "product_name": "MULTIVITAMIN SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-039",
      "sales_description": "Each 5ml Contains, Vitamin A (As palmitate) IP 1250IU, Vitamin D3 IP 100IU, Vitamin E (As D-Alfa -tocopheryl acetate) IP 2.5 IU, Thiamine HCl IP 0.75mg, Ribo\ufb02avine Phosphate Sodium IP 0.75mg, Pyridoxine HCl IP 0.5mg, Cyanocobalamin IP 0.5mcg, D- Panthenol IP 1.25mg, Niacinamide IP 7.5mg. Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml",
        "150ml",
        "200ml."
      ]
    },
    {
      "external_id": "V014",
      "product_name": "NICLOSAMIDE & ALBENDAZOLE ORAL\nSUSPENSION.(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-040",
      "sales_description": "Each 5ml Contains, Niclosamide IP 500mg, Albendazole IP 150mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V015",
      "product_name": "NICLOSAMIDE & LEVAMISOLE ORAL\nSUSPENSION(For Veterinary Use).",
      "category": "Veterinary",
      "internal_reference": "REF: DL-041",
      "sales_description": "Each 5ml contains, Niclosamide IP 500mg, Levamisole Hcl IP 75mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P026",
      "product_name": "OFLOXACIN ORAL SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-042",
      "sales_description": "Each 5ml contains, O\ufb02oxacin IP 50mg Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml"
      ]
    },
    {
      "external_id": "P027",
      "product_name": "OFLOXACIN SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-043",
      "sales_description": "Each 5ml Contains, O\ufb02oxacin IP 100mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml"
      ]
    },
    {
      "external_id": "P004",
      "product_name": "ONDANSETRON HYDROCHLORIDE ORAL SOLUTION IP",
      "category": "Human",
      "internal_reference": "REF: DL-044",
      "sales_description": "Each 5ml Contains, Ondansetron Hydrochloride Eq to Ondansetron 2mg Oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "15ml",
        "30ml",
        "60ml"
      ]
    },
    {
      "external_id": "P028",
      "product_name": "ORAL REHYDRATION SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-045",
      "sales_description": "Each 200ml Contains, Sodium Chloride IP 0.52g, Potassium Chloride IP 0.3g, Sodium Citrate IP 0.58g, Dextrose anhydrous IP 2.7g Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml",
        "500ml"
      ]
    },
    {
      "external_id": "V016",
      "product_name": "OXYCLOZANIDE & LEVAMISOLE\nSUSPENSION(For veterinary Use).",
      "category": "Veterinary",
      "internal_reference": "REF: DL-046",
      "sales_description": "Oxyclozanide IP 3.0% w/v, Levamisole Hydrochloride IP 1.5%w/v Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V017",
      "product_name": "OXYCLOZANIDE & LEVAMISOLE\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-047",
      "sales_description": "Oxyclozanide IP 6.0%w/v, Levamisole HCl IP 3.0% w/v Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V018",
      "product_name": "OXYCLOZANIDE SUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-048",
      "sales_description": "Oxyclozanide IP 3.4%w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P003",
      "product_name": "PARACETAMOL PAEDIATRIC ORAL SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-049",
      "sales_description": "Each 5ml Contains, Paracetamol IP 250mg Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "60ml"
      ]
    },
    {
      "external_id": "P029",
      "product_name": "PARACETAMOL SUSPENSION IP",
      "category": "Human",
      "internal_reference": "REF: DL-050",
      "sales_description": "Each 5ml Contains, Paracetamol IP 125mg Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "60ml"
      ]
    },
    {
      "external_id": "V019",
      "product_name": "PRAZIQUANTEL SUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-051",
      "sales_description": "Praziquantel IP 25mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P030",
      "product_name": "PRODUCTIVE ALLERGITIC COUGH SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-052",
      "sales_description": "Each 5ml Contains, Levocetirizine Hydrochloride IP 2.5mg, Ambroxol HCl IP 30mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P031",
      "product_name": "PRODUCTIVE COUGH SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-053",
      "sales_description": "Each 5ml Contains, Ambroxol Hydrochloride IP 30mg, Loratadine 5mg, Guaiphenesin IP 50mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml",
        "200ml"
      ]
    },
    {
      "external_id": "P032",
      "product_name": "PRODUCTIVE COUGH SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-054",
      "sales_description": "Each 5ml Contains, Cetirizine Hydrochloride IP 5mg, Ambroxol Hydrochloride IP 30mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "V020",
      "product_name": "RAFOXANIDE & IVERMECTIN ORAL\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-055",
      "sales_description": "Rafoxanide IP 3.0%w/v, Ivermectin IP 0.1% w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V021",
      "product_name": "RAFOXANIDE & LEVAMISOLE ORAL\nSOLUTION(For Veterinary Use).",
      "category": "Veterinary",
      "internal_reference": "REF: DL-056",
      "sales_description": "Rafoxanide IP 3.0%w/v, Levamisole HCl IP 3.0% w/v Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V022",
      "product_name": "RAFOXANIDE & LEVAMISOLE ORAL\nSUPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-057",
      "sales_description": "Rafoxanide IP 1.5% w/v, Levamisole HCl IP 1.5%w/v Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P033",
      "product_name": "SUCRALFATE SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-058",
      "sales_description": "Each 10ml Contains, Sucralfate USP 1gm Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "V023",
      "product_name": "SULPHADOXINE & TROMETHOPRIM\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-059",
      "sales_description": "Sulphadoxine IP 200mg, Trimethoprim IP 40mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml."
      ]
    },
    {
      "external_id": "V024",
      "product_name": "TRICLABEDAZOLE & IVERMECTIN\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-060",
      "sales_description": "Triclabendazole 5.0% w/v, Ivermectin IP 0.1%w/v Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V025",
      "product_name": "TRICLABENDAZOLE & LEVAMISOLE\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-061",
      "sales_description": "Each ml Contains, Triclabendazole 50mg, Levamisole HCl IP 37.5mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V026",
      "product_name": "TRICLABENDAZOLE SUSPENSION(For\nVeterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-062",
      "sales_description": "Each ml Contains, Triclabendazole 50mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V027",
      "product_name": "TRICLOBENDAZOLE & LEVAMISOLE\nSUSPENSION(For Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-063",
      "sales_description": "Each ml Contains, Triclabendazole 12% w/v, Levamisole Hydrochloride IP 7.5% w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P005",
      "product_name": "Paracetamol,Phenylephrine Hcl\n,CPM,Sodium citrate ,Menthol Suspension",
      "category": "Human",
      "internal_reference": "REF: DL-067",
      "sales_description": "Each 5ml contains, Paracetamol IP 250mg Phenylephrine Hydrochloride IP 5mg, Chlorpheniramine maleate IP 0.5mg, Sodium Citrate IP 60.0 mg Menthol IP 1 mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P037",
      "product_name": "Terbutaline sulphate,Bromohexine HCl,Guiphenesine,Menthol Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-068",
      "sales_description": "Each 5ml Contains, Terbutaline Sulphate IP 1.25mg Bromhexine Hydrochloride IP 4.0 mg. Guaiphenesin IP50 mg, Menthol IP.2.5 mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P038",
      "product_name": "Chloropheniramine Maleate Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-069",
      "sales_description": "Each 5ml Contains, Chlorpheniramine Maleate I.P. 2 mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "60ml",
        "100ml"
      ]
    },
    {
      "external_id": "P039",
      "product_name": "Chloropheniramine Maleate & Phenylephrine Hcl Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-070",
      "sales_description": "Each 5ml contains, Chlorpheniramine Maleate IP. 2 mg. Phenylephrine Hydrochloride IP 5.0mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "200ml"
      ]
    },
    {
      "external_id": "P040",
      "product_name": "Chloropheniramine Maleate & Phenylephrine Hcl Drops",
      "category": "Human",
      "internal_reference": "REF: DL-071",
      "sales_description": "Each 1ml contains, Chlorpheniramine Maleate I.P. 2 mg. Phenylephrine Hydrochloride IP 5.0mg Drops",
      "uqc": "nan",
      "packing_sizes": [
        "15ml",
        "30ml",
        "60ml"
      ]
    },
    {
      "external_id": "P041",
      "product_name": "Sucralfate & Oxetacaine Suspension",
      "category": "Human",
      "internal_reference": "REF: DL-072",
      "sales_description": "Each 10 ml contains, Sucralfate USP1.0 gm, Oxetacaine 20mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P042",
      "product_name": "Paracetamol & Promethazine Hcl Suspension",
      "category": "Human",
      "internal_reference": "REF: DL-073",
      "sales_description": "Each 5 ml contains Paracetamol IP 125 mg, Promethazine Hydrochloride IP 6.25 mg Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P043",
      "product_name": "Lactulose Solution",
      "category": "Human",
      "internal_reference": "REF: DL-074",
      "sales_description": "Each 15 ml contains Lactulose Solution USP 10 mg solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "V028",
      "product_name": "Levofloxacin & Bromohexine Solution (Veterinary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-075",
      "sales_description": "Each ml. contains Levo\ufb02oxacin hemihydrate IP Eq.to Levo\ufb02oxacin 100mg, Bromhexine HCl 7.5mg Solution",
      "uqc": "nan",
      "packing_sizes": [
        "50ml",
        "100ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V029",
      "product_name": "Closantel & Ivermectin Oral Solution For Veterninary Use",
      "category": "Veterinary",
      "internal_reference": "REF: DL-076",
      "sales_description": "Closantel IP 5.0% w/v Ivermectin IP 0.2% w/v oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V030",
      "product_name": "Closantel 15% & Ivermectin 0.1% Oral Solution For Veterninary Use",
      "category": "Veterinary",
      "internal_reference": "REF: DL-077",
      "sales_description": "Closantel IP 15.0% w/v Ivermectin IP 0.1% w/v oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P044",
      "product_name": "Dextromethorphane Hbr, Chlorpheniramine Maleate, Guiphensin, Ammonium Chloride Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-078",
      "sales_description": "Each 5ml Contains, Dextromethorphan Hydrobromide IP 10mg, Chlorpheniramine Maleate IP 2.5mg, Guaiphenesin IP 50mg, Ammonium Chloride IP 60mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P045",
      "product_name": "Fungal Diastage & Pepsin Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-079",
      "sales_description": "Each 10ml Contains, Fungal Diastase IP 50mg Pepsin IP 10mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P046",
      "product_name": "Fungal Diastage & Papain Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-080",
      "sales_description": "Each 15ml Contains, Fungal Diastase IP 50mg Papain IP 100mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P047",
      "product_name": "Aluminium Hydroxide, Magnesium Hydroxide & Simethicone Suspension",
      "category": "Human",
      "internal_reference": "REF: DL-081",
      "sales_description": "Each 5ml Contains, Aluminium Hydroxide IP 250mg Magnesium Hydroxide IP 250mg Simethicone IP 50mg Oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P048",
      "product_name": "Fungal Diastage, Papain, Vitamin B1 & Sorbitol Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-082",
      "sales_description": "Each 10ml Contains: Fungal Diastase (1:50) IP 200mg, Papain IP 10mg Vitamin B1 IP 5mg, Sorbitol IP 2%w/v Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "V031",
      "product_name": "Ivermectin 0.1%w/v Oral Solution (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-083",
      "sales_description": "Each ml Contains: Ivermectin IP 1mg oral Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V032",
      "product_name": "Albendazole & Levamisole Hcl Suspension (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-084",
      "sales_description": "Albendazole IP 2% w/v Levamisole HCl IP 3%w/v oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "V033",
      "product_name": "Fenbendazole IP Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-085",
      "sales_description": "Each gram powder Contains: Fenbendazole IP 250mg",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V034",
      "product_name": "Ciprofloxacin 10% Water Soluble Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-086",
      "sales_description": "Each gram of powder Contains: Cipro\ufb02oxacin HCl IP (Eq. to Cipro\ufb02oxacin) 100mg",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V035",
      "product_name": "Ofloxacin 10% W/W (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-087",
      "sales_description": "Each gram of powder Contains: O\ufb02oxacin IP 100mg",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V036",
      "product_name": "Albendazole 5% W/W POWDER (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-088",
      "sales_description": "Albendazole IP 5% w/w powder",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V037",
      "product_name": "Niclosamide Dispersible Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-089",
      "sales_description": "Niclosamide IP 75% w/w dispersible powder",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V038",
      "product_name": "Trimethoprime & Sulphadizine Dispersible Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-090",
      "sales_description": "Trimethoprim IP 2% w/w, Sulphadizine IP 10% w/w dispersible powder",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V039",
      "product_name": "Levamisole Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-091",
      "sales_description": "Levamisole Hydrochloride IP 30% w/w powder",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V040",
      "product_name": "Levofloxacin Hemihydrate Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-092",
      "sales_description": "Each gm of powder contains, Levo\ufb02oxacin Hemihydrate IP 30% w/w",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V041",
      "product_name": "Ciprofloxacin & Tinidazole Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-093",
      "sales_description": "Each gm of powder contains: Cipro\ufb02oxacin Hydrochloride IP 10% w/w (Eq. to Cipro\ufb02oxacin) Tinidazole IP 12% w/w",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V042",
      "product_name": "Tetracycline Hydrochloride Powder (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-094",
      "sales_description": "Each gm of powder contains: Tetracycline Hydrochloride IP 50mg",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V048",
      "product_name": "PEFLOXACIN,ENROFLOXACIN&ZINC SOLUTION(VET)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-095",
      "sales_description": "Each 100ml contains, zinc sulphate IP eq to zinc 0.25gm, enrofloxacin 2.5gms, pefloxacin mesylate dihydrate 7.5gm Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "250ml",
        "500ml",
        "1000ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P049",
      "product_name": "Ferric Ammonium Citrate, Vitamin B12, Folic Acid Syrup",
      "category": "Human",
      "internal_reference": "REF: DL-096",
      "sales_description": "Each 5ml Contains, Ferric Ammonium Citrate IP (Eq.to Elemental Iron) 32mg, Vitamin B12 IP 7.5mcg, Folic Acid IP 0.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P050",
      "product_name": "Potassium Citrate, Magnesium Citrate & Vitamin B6 Hcl IP Solution",
      "category": "Human",
      "internal_reference": "REF: DL-097",
      "sales_description": "Each 200ml Contains, Potassium Citrate IP 1100mg, Magnesium Citrate IP 375mg, Vitamin B6 Hcl IP 20mg Solution",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "200ml",
        "250ml"
      ]
    },
    {
      "external_id": "V043",
      "product_name": "NEOMYCIN SULPHATE&OXYTETRACYCLINE HYDROCHLORIDE POWDER(vet)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-098",
      "sales_description": "Each gm of powder contains: Neomycin Sulphate IP 50mg Oxytetracycline HCl IP 50mg",
      "uqc": "nan",
      "packing_sizes": [
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm."
      ]
    },
    {
      "external_id": "V044",
      "product_name": "OFLOXACIN IP, ORNIDAZOLE IP(VET)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-100",
      "sales_description": "Each 5ml Contains: O\ufb02oxacin I.P 50mg, Ornidazole I.P 125mg",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "500ml",
        "1000ml",
        "5000ml."
      ]
    },
    {
      "external_id": "V045",
      "product_name": "AZITHROMYCIN ORAL SUSPENSION(VETERINARY USE ONLY)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-113",
      "sales_description": "Each 1ml Contains, Azithromycin (As Dihydrate) IP Equivalent to Azithromycin 40mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "15ml",
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "200ml",
        "250ml",
        "500ml",
        "1000ml."
      ]
    },
    {
      "external_id": "P052",
      "product_name": "ALPHA AMYLASE AND PEPSIN SYRUP.",
      "category": "Human",
      "internal_reference": "REF: DL-114",
      "sales_description": "Each 5ml Contains, Diastase (1:1200) IP 50mg (Fungal diastase derived from Aspergillus Oryzae Digeste not less than 60gms of cooked starch), Pepsin (1:3000) IP 10mg (Digests not less than 30gms of coagulated egg albumin) Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P053",
      "product_name": "LACTULOSE SOLUTION USP",
      "category": "Human",
      "internal_reference": "REF: DL-115",
      "sales_description": "Each 15ml Contains, Lactulose Concentrate USP Eq to Lactulose (66%w/v) 10gm Solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P054",
      "product_name": "OFLOXACIN&METRONIDAZOLE SUSPENSION.",
      "category": "Human",
      "internal_reference": "REF: DL-116",
      "sales_description": "Each 5ml Contains, O\ufb02oxacin IP 50mg, Metronidazole Benzoate IP eq to Metronidazole 100mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml."
      ]
    },
    {
      "external_id": "V046",
      "product_name": "SULPHAMETHAXAZOLE,TRIMETHOPRIM\nPOWDER.(Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-117",
      "sales_description": "Sulphamethoxazole IP 10%w/w, Trimethoprim IP 2.0%w/w powder",
      "uqc": "nan",
      "packing_sizes": [
        "50grm",
        "100grm",
        "250grm",
        "500grm",
        "1000grm",
        "5000grm"
      ]
    },
    {
      "external_id": "V047",
      "product_name": "SULPHAMETHOXAZOLE ,TRIMETHOPRIM\nSUSPENSION (Veterninary Use)",
      "category": "Veterinary",
      "internal_reference": "REF: DL-120",
      "sales_description": "Each 5ml Contains: Sulphamethoxazole IP - 200mg, Trimethoprim IP - 40mg. oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "200ml",
        "500ml",
        "1000ml",
        "4.500ml",
        "5000ml"
      ]
    },
    {
      "external_id": "P056",
      "product_name": "POTASSIUM CITRATE ,MAGNESIUM CITRATE,VITAMIN B6 SOLUTION.",
      "category": "Human",
      "internal_reference": "REF: DL-121",
      "sales_description": "Each 5ml Contains, Potassium Citrate IP 1100mg, Magnesium Citrate USP 375mg, Vitamin B6 HCl IP 20mg solution",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "200ml",
        "500ml",
        "1000ml."
      ]
    },
    {
      "external_id": "P011",
      "product_name": "AZITHROMYCIN ORAL SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-122",
      "sales_description": "Each 5ml Contains, Azithromycin (As Dihydrate) IP eq to Azithromycin 200mg oral Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "15ml",
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "200ml."
      ]
    },
    {
      "external_id": "P017",
      "product_name": "MEFENAMIC ACID SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-123",
      "sales_description": "Each 5 ml Contains, Mefenamic Acid IP 100mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P059",
      "product_name": "DEFLAZACORT ORAL SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-124",
      "sales_description": "Each 5 ml Contains, De\ufb02azacort 6mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml."
      ]
    },
    {
      "external_id": "P060",
      "product_name": "TERBUTALINE SULPHATE,BROMHEXINE HYDROCHLORIDE,GUAIPHENESIN,MENTHOL SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-125",
      "sales_description": "Each 5ml Contains, Terbutaline Sulphate IP 1.25mg, Bromhexine Hydrochloride IP 2.0mg, Guaiphenesin IP 50mg, Menthol IP - 0.5mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "120ml."
      ]
    },
    {
      "external_id": "P061",
      "product_name": "METRONIDAZOLE BENZOATE SUSPENSION.",
      "category": "Human",
      "internal_reference": "REF: DL-126",
      "sales_description": "Each 5ml Contains, Metronidazole Benzoate Eq to Metronidazole - 200mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P062",
      "product_name": "MILK OF MAGNESIA,LIQUID PARAFFIN,SODIUM PICOSULPHATE SUSPENSION.",
      "category": "Human",
      "internal_reference": "REF: DL-127",
      "sales_description": "Each 5ml Contains, Milk of Magnesia IP-3.75ml, Liquid Paraffin IP- 1.25ml, Sodium Picosulphate B.P - 3.33mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P063",
      "product_name": "POTASSIUM CITRATE ,MAGNESIUM CITRATE SUPENSION..",
      "category": "Human",
      "internal_reference": "REF: DL-128",
      "sales_description": "Each 5ml Contains, Potassium Citrate IP -1100mg, Magnesium Citrate USP-375 mg (Each ml. contains approx. 1 m Eq. Magnesium Ion, 2 m eq. Potassium Ion and 3 m Eq. of Citrate Ion) Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P064",
      "product_name": "DRIED ALUMINIUM HYDROXIDE GEL,MAGNESIUM HYDROXIDE,OXETACAINE SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-130",
      "sales_description": "Each 5ml Contains, Dried Aluminium Hydroxide Gel IP 291mg, Magnesium Hydroxide IP 98mg, Oxetacaine BP 10 mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "100ml",
        "150ml",
        "170ml",
        "200ml."
      ]
    },
    {
      "external_id": "P065",
      "product_name": "CETIRIZINE HYDROCHLORIDE,DEXTROMETHORPHAN HYDROBROMIDE AND PHENYLEPHRINE HYDROCHLORIDE SYRUP",
      "category": "Human",
      "internal_reference": "REF: DL-131",
      "sales_description": "Each 5ml Contains, Cetirizine Hydrochloride IP - 2.5mg, Dextromethorphan Hydrobromide IP - 5.0mg, Phenylephrine Hydrochloride IP - 2.5 mg Syrup",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P018",
      "product_name": "MEFENAMIC ACID SUSPENSION",
      "category": "Human",
      "internal_reference": "REF: DL-132",
      "sales_description": "Each 5 ml Contains, Mefenamic Acid IP 250mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    },
    {
      "external_id": "P051",
      "product_name": "LEVO CETIRIZINE DIHYDROCHLORIDE IP ,MONTELUKAST SODIUM IP SUPENSION.",
      "category": "Human",
      "internal_reference": "REF: DL-133",
      "sales_description": "Each 5ml Contains, Levocetirizine Dihydrochloride IP  2.5mg, Montelukast Sodium IP  4.0mg Suspension",
      "uqc": "nan",
      "packing_sizes": [
        "30ml",
        "50ml",
        "60ml",
        "100ml",
        "150ml",
        "170ml",
        "200ml"
      ]
    }
  ];
  export default products;