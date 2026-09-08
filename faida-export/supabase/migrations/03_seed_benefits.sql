-- Faida Supabase Migration — 03_seed_benefits.sql / Run order: 4 of 5 / Inserts the 30 benefits catalog into the benefits table. Safe to re-run because it uses upsert (ON CONFLICT DO UPDATE).

INSERT INTO benefits (
  id, name, provider, category, emoji, description, amount,
  how_to_apply, documents, deadline, deadline_date, deadline_annual,
  link, eligibility, is_published, priority_weight
) VALUES
  (
    'hustler-fund-personal',
    'Hustler Fund — Personal Loan',
    'Government of Kenya',
    'financial',
    '💰',
    'Instant mobile loan from the government via Safaricom. Borrow up to Ksh 50,000 at just 8% per year (0.002% per day). Repay in 14 days. 5% of every loan goes into a savings account in your name.',
    'Ksh 500 – Ksh 50,000',
    '1. Dial *254# on Safaricom
2. Select ''Hustler Fund''
3. Choose ''Personal Finance''
4. Enter amount and confirm with M-Pesa PIN',
    'Safaricom SIM registered in your name (Huduma Namba or National ID used during SIM registration)',
    'Rolling — available 24/7',
    NULL,
    FALSE,
    'https://hustlerfund.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false,"safaricomRequired":true}'::jsonb,
    TRUE,
    0
  ),
  (
    'yedf-loan',
    'Youth Enterprise Development Fund (YEDF)',
    'Government of Kenya — State Department for Youth',
    'financial',
    '💰',
    'Low-interest loans for young Kenyans to start or grow businesses. Interest rates from 0–8% per year. Can apply as an individual or as a group. Specifically supports youth in technology, agriculture, manufacturing, and services.',
    'Up to Ksh 5,000,000',
    '1. Register on yedf.go.ke
2. Fill in the online application form
3. Attach required documents
4. Visit your Sub-County Youth Development Office for verification
5. Wait for approval (typically 2–4 weeks)',
    'National ID, KRA PIN, Business registration certificate (if existing business), Business plan, Recent passport photo, Bank statement (3 months)',
    'Rolling — apply any time',
    NULL,
    FALSE,
    'https://yedf.go.ke',
    '{"minAge":18,"maxAge":34,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'uwezo-fund',
    'Uwezo Fund',
    'Government of Kenya — NG-CDF',
    'financial',
    '💰',
    'Interest-free loans for registered groups of youth, women, and persons with disabilities. The government gives money at constituency level — your group applies through the local NG-CDF office.',
    'Ksh 50,000 – Ksh 500,000 (interest-free)',
    '1. Form or join a registered group (min 10 members)
2. Register the group with Department of Social Services
3. Visit your constituency NG-CDF office
4. Fill application form with group records
5. Group repays over 12–24 months',
    'Group registration certificate, Group minutes and constitution, Members'' National IDs, Group bank account details, Group business plan',
    'Rolling — check with your constituency NG-CDF office',
    NULL,
    FALSE,
    'https://uwezo.go.ke',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":true}'::jsonb,
    TRUE,
    0
  ),
  (
    'women-enterprise-fund',
    'Women Enterprise Fund (WEF)',
    'Government of Kenya',
    'financial',
    '💰',
    'Loans and capacity-building support specifically for women entrepreneurs. Apply individually or as a women''s group. Funds disbursed through Equity Bank, KCB, and Co-op Bank. Also accessible via *254# on Safaricom.',
    'Up to Ksh 5,000,000 (group). Individual amounts vary.',
    '1. Dial *254# on Safaricom OR visit wef.go.ke
2. Select Women Enterprise Fund
3. Apply individually or as a registered women''s group
4. Funds disbursed through partner banks',
    'National ID, KRA PIN, Business registration (if applicable), Group registration certificate (for group applications), Passport photo',
    'Rolling',
    NULL,
    FALSE,
    'https://wef.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"female","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'agpo',
    'AGPO — Government Tenders (30% Reserved)',
    'National Treasury of Kenya',
    'financial',
    '🏛️',
    '30% of ALL government tenders are reserved for youth, women, and persons with disabilities by law. Once AGPO-certified, you can bid on government contracts worth millions — websites, printing, supplies, construction, services. Massively underused.',
    'Varies — tenders range from Ksh 50,000 to millions',
    '1. Register your business (sole proprietor or company)
2. Get KRA PIN and tax compliance certificate
3. Apply for AGPO certificate at agpo.go.ke
4. Once certified, browse and bid on tenders at tenders.go.ke',
    'Business registration certificate, KRA PIN, National ID, Tax compliance certificate, Bank account in business name',
    'Apply for AGPO certificate any time. Tenders are listed continuously.',
    NULL,
    FALSE,
    'https://agpo.go.ke',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'kiep-250',
    'KIEP 250+ Grant (World Bank)',
    'Kenya Industry & Entrepreneurship Project / World Bank',
    'financial',
    '🌍',
    'Ksh 7.5 billion World Bank programme providing performance-based grants, mentorship, and technical assistance to Kenyan SMEs. Cohort II is currently open. If you have a business that has been operating for at least 2 years, this is one of the largest grant opportunities available.',
    'Grant amount varies based on business needs and growth plan',
    '1. Visit kiep.go.ke
2. Check eligibility (2+ years in operation)
3. Fill online application
4. Shortlisted businesses receive site visits and tailored support packages',
    'Business registration, KRA PIN, Audited accounts or financial statements (2 years), Business plan, National ID of directors',
    'Cohort II — check kiep.go.ke for current deadline',
    NULL,
    FALSE,
    'https://kiep.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":false,"businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false,"businessAgeMin":2}'::jsonb,
    TRUE,
    0
  ),
  (
    'widu-africa',
    'WIDU Africa Grant',
    'WIDU Africa (German Government-backed)',
    'financial',
    '🌍',
    'Grants of up to EUR 3,000 (first application) and EUR 5,000 (subsequent rounds) for Kenyan entrepreneurs. Especially relevant if you have relatives in EU countries, Switzerland, or Norway. Also runs #GreenKenya grants for eco-friendly businesses.',
    'EUR 3,000 – EUR 5,000 (~Ksh 480,000 – Ksh 800,000)',
    '1. Visit widu.africa
2. Create an account
3. Submit business profile and growth plan
4. If you have a sponsor (EU-based relative), link their profile',
    'National ID, Business registration, Business plan, Bank account details, Sponsor details (if applicable)',
    'Rolling — check widu.africa for active calls',
    NULL,
    FALSE,
    'https://widu.africa',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'ward-sme-grant',
    'Ward SME Grant (Ksh 50,000)',
    'Government of Kenya / World Bank — Ward Level',
    'financial',
    '🏘️',
    'The government committed Ksh 5 billion for 100,000 small businesses — Ksh 50,000 per business across all 1,450 wards. This money is distributed at ward level. Most people don''t know it exists. Visit your ward office and ask specifically about this fund.',
    'Ksh 50,000 (grant — does not need to be repaid)',
    '1. Visit your Ward Administrator''s office
2. Ask about the ''SME Ward Grant'' or ''World Bank SME fund''
3. Fill application at the ward office
4. Provide required business documents',
    'National ID, Business registration OR evidence of business activity, KRA PIN, Passport photo',
    'Ongoing — visit your ward office this week',
    NULL,
    FALSE,
    'https://devolution.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":false,"businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'sha-registration',
    'SHA — Social Health Authority Cover',
    'Government of Kenya',
    'health',
    '🏥',
    'Kenya''s new national health insurance replacing NHIF. Covers outpatient and inpatient services at government and accredited private hospitals. Every Kenyan should register. As of 2025, 4.5 million Kenyans have already received medical services worth Ksh 41 billion.',
    'Healthcare coverage (not a cash benefit)',
    '1. Dial *147# on any network OR visit sha.go.ke
2. Register yourself and dependants
3. Pay monthly contributions based on your income
4. Use SHA card at any accredited facility',
    'National ID or birth certificate, Huduma Namba (if available)',
    'Rolling — register now',
    NULL,
    FALSE,
    'https://sha.go.ke',
    '{"minAge":0,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'disability-fund',
    'National Fund for the Disabled of Kenya (NFDK)',
    'Government of Kenya',
    'health',
    '♿',
    'Financial grants, assistive devices, and support for persons with disabilities. Covers mobility aids, hearing aids, visual aids, and rehabilitation. Also funds disability-led businesses and organisations.',
    'Varies — assistive devices, rehabilitation funding, and business grants',
    '1. Get a disability certificate from the National Council for Persons with Disabilities
2. Apply at nfdk.go.ke
3. Specify the type of support needed',
    'National ID, Disability assessment certificate (from NCPWD), Medical report from a registered doctor',
    'Rolling',
    NULL,
    FALSE,
    'https://nfdk.go.ke',
    '{"minAge":0,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":true,"counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'google-hustle-academy',
    'Google Hustle Academy',
    'Google Africa',
    'employment',
    '🎓',
    'Free AI-powered business training, mentorship, and access to Google''s entrepreneurial network for Kenyan SMEs. No cost to apply. Gives you credibility, skills, and investor connections. Applications open for 2026 cohort.',
    'Free training + mentorship (no cash)',
    '1. Search ''Google Hustle Academy Kenya 2026'' for current application link
2. Fill in the online application (takes ~20 minutes)
3. Describe your business and growth plans',
    'None required for initial application',
    'Check google.com/hustleacademy for current deadline',
    NULL,
    FALSE,
    'https://grow.google/hustleacademy/',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'nys-recruitment',
    'National Youth Service (NYS) Recruitment',
    'Government of Kenya',
    'employment',
    '💼',
    'Government programme that provides skills training, employment, and stipends for young Kenyans. Covers construction, agriculture, ICT, healthcare, and more. Offers a pathway to government employment and entrepreneurship.',
    'Monthly stipend during training + skills certification',
    '1. Check nys.go.ke for open recruitment periods
2. Apply online during recruitment windows
3. Attend physical selection at your county NYS office',
    'National ID, KCSE certificate, Birth certificate, Passport photos',
    'Recruitment opens periodically — check nys.go.ke',
    NULL,
    FALSE,
    'https://nys.go.ke',
    '{"minAge":18,"maxAge":26,"gender":"any","employed":false,"businessOwner":false,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'lsk-legal-aid',
    'LSK Legal Aid — Free Legal Representation',
    'Law Society of Kenya',
    'legal',
    '⚖️',
    'Free legal advice and representation for Kenyans who cannot afford a lawyer. Covers civil matters, family law, employment disputes, land cases, and more. Available through LSK offices in major towns.',
    'Free legal services (no charge)',
    '1. Visit the LSK office in your county town
2. Explain your legal issue to the receptionist
3. You will be assessed for eligibility (based on income)
4. Assigned a pro bono lawyer if you qualify',
    'National ID, Any documents related to your legal issue',
    'Rolling — walk-in or call ahead',
    NULL,
    FALSE,
    'https://lsk.or.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'judiciary-legal-aid',
    'Judiciary Legal Aid Service',
    'Judiciary of Kenya',
    'legal',
    '⚖️',
    'The Judiciary provides free legal aid at court stations for those who cannot afford representation. Available in high courts and magistrate courts across Kenya. Especially useful for criminal matters and family disputes.',
    'Free legal representation in court',
    '1. Visit the nearest court station
2. Go to the Legal Aid desk
3. Explain your case and financial situation
4. Receive free representation if eligible',
    'National ID, Any court documents or charge sheets related to your case',
    'Available any court day',
    NULL,
    FALSE,
    'https://judiciary.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'boma-yangu',
    'Boma Yangu — Affordable Housing',
    'Government of Kenya',
    'housing',
    '🏠',
    'Government affordable housing programme. Register to be allocated low-cost housing units across Kenya. Monthly contributions from Ksh 1,000. Units priced far below market rate for registered members.',
    'Subsidised housing units (from Ksh 1,000/month contribution)',
    '1. Visit bomayangu.go.ke
2. Register with National ID and phone number
3. Choose preferred county and unit type
4. Make monthly contributions via M-Pesa
5. Wait for allocation balloting',
    'National ID, Active phone number, M-Pesa account',
    'Rolling — register now',
    NULL,
    FALSE,
    'https://bomayangu.go.ke',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'inua-jamii',
    'Inua Jamii Cash Transfer Programme',
    'Government of Kenya — Ministry of Labour & Social Protection',
    'financial',
    '🤝',
    'Monthly cash transfers for Kenya''s most vulnerable: older persons aged 70+, orphans and vulnerable children (OVC), and persons with severe disabilities. Payments are made via M-Pesa every two months. Over 1.3 million households are enrolled nationwide.',
    'Ksh 2,000 – Ksh 4,000 per month (varies by category)',
    '1. Visit your Sub-County Social Development Office
2. Ask for Inua Jamii registration
3. Fill the application form for your category (elderly, OVC, or disability)
4. Provide required documents for verification
5. If approved, payments start within 2–3 months via M-Pesa',
    'National ID or birth certificate, Huduma Namba, Disability assessment certificate (for PWD category), Death certificate of parent/guardian (for OVC), Proof of age (for elderly 70+)',
    'Rolling — register at your Sub-County office',
    NULL,
    FALSE,
    'https://labour.go.ke/inua-jamii',
    '{"minAge":0,"maxAge":99,"gender":"any","employed":false,"businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'hsnp',
    'Hunger Safety Net Programme (HSNP)',
    'Government of Kenya / World Bank — NDMA',
    'financial',
    '🌾',
    'Cash transfer programme for the poorest households in Kenya''s arid and semi-arid lands (ASAL). Covers Turkana, Marsabit, Mandera, Wajir, Garissa, Tana River, Isiolo, and Samburu counties. Payments every two months via M-Pesa to help families buy food and essentials.',
    'Ksh 5,400 every two months (~Ksh 2,700/month)',
    '1. HSNP uses a community targeting process — no walk-in applications
2. Community committees identify eligible households in your village
3. If selected, you receive an SMS and M-Pesa registration visit
4. Contact your county NDMA office to confirm if your household is enrolled
5. Visit ndma.go.ke for county office contacts',
    'National ID, Active Safaricom line for M-Pesa, Proof of residence in an HSNP county',
    'Rolling — community targeting ongoing in ASAL counties',
    NULL,
    FALSE,
    'https://ndma.go.ke',
    '{"minAge":0,"maxAge":99,"gender":"any","employed":false,"businessOwner":false,"disability":"any","counties":["Turkana","Marsabit","Mandera","Wajir","Garissa","Tana River","Isiolo","Samburu"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'ngcdf-bursary',
    'NG-CDF Bursary Scheme',
    'National Government Constituencies Development Fund',
    'financial',
    '🎓',
    'Education bursaries funded through your MP''s constituency office for secondary school, college, and university students from needy backgrounds. Each constituency allocates funds annually — amounts and deadlines vary by area. One of the most accessible education funds for ordinary Kenyans.',
    'Ksh 10,000 – Ksh 50,000 per year (varies by constituency)',
    '1. Visit your constituency NG-CDF office (find it via ngcdf.go.ke)
2. Ask for the current bursary application form
3. Fill in student and guardian details
4. Attach required documents
5. Submit before the constituency deadline (usually Jan–Mar each year)',
    'National ID (student and parent/guardian), Admission letter or school fees structure, KCSE/KCPE results slip, Birth certificate, Recommendation letter from school principal',
    'Annual — typically January to March (check your constituency office)',
    '03-31',
    TRUE,
    'https://ngcdf.go.ke',
    '{"minAge":14,"maxAge":30,"gender":"any","employed":false,"businessOwner":false,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'kyep',
    'Kenya Youth Empowerment Project (KYEP)',
    'Government of Kenya / World Bank',
    'employment',
    '💼',
    'Government programme providing skills training, internships, and stipends for unemployed youth. Covers sectors including construction, hospitality, ICT, and manufacturing. Combines classroom training with paid work placements at partner companies.',
    'Monthly stipend during training + job placement support',
    '1. Check kyep.go.ke or Ministry of Youth website for open cohorts
2. Register online during recruitment windows
3. Select your preferred training sector
4. Attend orientation at your county youth office
5. Complete training and internship placement',
    'National ID, KCSE certificate, Birth certificate, Passport photos, Unemployment affidavit (if required)',
    'Recruitment opens periodically — check kyep.go.ke',
    NULL,
    FALSE,
    'https://youth.go.ke',
    '{"minAge":18,"maxAge":29,"gender":"any","employed":false,"businessOwner":false,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'ajira-digital',
    'Ajira Digital Programme',
    'Ministry of ICT — Kenya',
    'employment',
    '💻',
    'Free government programme training Kenyan youth for online digital jobs — data entry, transcription, virtual assistance, content writing, and software development. Access to Ajira Digital centres nationwide with free internet, mentorship, and links to global freelancing platforms.',
    'Free training + access to online job platforms (earn Ksh 15,000–Ksh 80,000/month)',
    '1. Visit ajiradigital.go.ke
2. Register for an account
3. Enrol in a training track (data, transcription, dev, etc.)
4. Visit your nearest Ajira Digital centre for in-person support
5. Complete certification and start bidding on online jobs',
    'National ID, Active email address, KCSE certificate (for some tracks)',
    'Rolling — enrol any time',
    NULL,
    FALSE,
    'https://ajiradigital.go.ke',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["tech","services"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'kenya-women-youth-fund',
    'Kenya Women and Youth Enterprise Fund',
    'Government of Kenya — Ministry of Co-operatives & MSMEs',
    'financial',
    '💰',
    'Merged fund combining the Women Enterprise Fund and Youth Enterprise Development Fund. Provides affordable loans and business support for women and youth entrepreneurs. Disbursed through partner banks including Equity, KCB, and Co-operative Bank.',
    'Up to Ksh 5,000,000 (terms vary by applicant profile)',
    '1. Visit kwyef.go.ke or your nearest partner bank branch
2. Register and complete the online application
3. Attach business plan and required documents
4. Visit Sub-County office for verification
5. Loan disbursed through partner bank upon approval',
    'National ID, KRA PIN, Business registration certificate, Business plan, Bank statements (3 months), Passport photo',
    'Rolling — apply any time',
    NULL,
    FALSE,
    'https://wef.go.ke',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'kcb-2jiajiri',
    'KCB 2Jiajiri Programme',
    'Kenya Commercial Bank (KCB) Foundation',
    'employment',
    '🏦',
    'KCB Foundation''s flagship youth programme providing skills training, business incubation, and market linkages for young Kenyans. Covers agribusiness, automotive, beauty, construction, and ICT. Graduates receive certification and access to KCB micro-loans to start businesses.',
    'Free training + access to KCB Foundation loans (from Ksh 50,000)',
    '1. Visit kcbgroup.com/2jiajiri or your nearest KCB branch
2. Check open training cohorts in your county
3. Apply online with personal and education details
4. Attend selection interview
5. Complete training and access loan facilities',
    'National ID, KCSE certificate, Birth certificate, Passport photos, Business proposal (for loan track)',
    'Rolling — cohorts open throughout the year',
    NULL,
    FALSE,
    'https://kcbgroup.com/2jiajiri',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":false,"businessOwner":"any","disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'county-youth-funds',
    'County Youth & Women Enterprise Funds',
    'County Governments — Nairobi, Mombasa, Kisumu, Nakuru',
    'financial',
    '🏘️',
    'County-level funds providing loans and grants for youth and women entrepreneurs. Nairobi Hasira Fund, Mombasa Biashara Fund, Kisumu Oyugis Youth Fund, and Nakuru County Empowerment Fund offer locally administered financing with easier access than national programmes. Visit your county trade or youth office.',
    'Ksh 50,000 – Ksh 500,000 (varies by county)',
    'Nairobi: Visit City Hall Trade department or nairobi.go.ke
Mombasa: Visit Mombasa County Trade office
Kisumu: Visit Kisumu County Youth and Sports office
Nakuru: Visit Nakuru County Trade and Industrialisation office
All: Fill county application form, attach business plan, await ward-level vetting',
    'National ID, KRA PIN, Business registration or business plan, Proof of county residence, Passport photo',
    'Rolling — check with your county office',
    NULL,
    FALSE,
    'https://devolution.go.ke',
    '{"minAge":18,"maxAge":35,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["Nairobi","Mombasa","Kisumu","Nakuru"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'equity-fanikisha',
    'Equity Bank Fanikisha Loan',
    'Equity Bank Kenya',
    'financial',
    '🏦',
    'Micro-loans for small business owners and traders through Equity Bank. Available via Equitel, Equity mobile app, or branch. No collateral required for amounts under Ksh 100,000. One of the fastest ways to get business capital if you have an Equity Bank account.',
    'Ksh 5,000 – Ksh 3,000,000',
    '1. Open an Equity Bank account (if you don''t have one)
2. Dial *247# on Equitel OR use the Equity mobile app
3. Select ''Loans'' then ''Fanikisha''
4. Enter amount and confirm
5. Funds disbursed instantly to your account',
    'National ID, Equity Bank account (6+ months active), KRA PIN (for larger amounts)',
    'Rolling — available 24/7 via mobile',
    NULL,
    FALSE,
    'https://equitybank.co.ke/personal-banking/borrow/fanikisha/',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'safaricom-spark',
    'Safaricom Spark Venture Fund',
    'Safaricom / Spark Fund',
    'financial',
    '📱',
    'Investment fund for early-stage Kenyan tech startups building on mobile, fintech, agritech, and healthtech. Provides funding plus access to Safaricom''s 40+ million customer base, technical mentorship, and market distribution. Highly competitive but transformative for qualifying startups.',
    'USD 50,000 – USD 500,000 investment',
    '1. Visit spark.co.ke or safaricom.co.ke/spark
2. Review current investment themes and criteria
3. Submit pitch deck and business plan online
4. Shortlisted startups present to investment committee
5. Due diligence and term sheet negotiation',
    'Business registration, Pitch deck, Financial projections, Product demo or MVP, Founders'' National IDs',
    'Rolling — applications reviewed quarterly',
    NULL,
    FALSE,
    'https://spark.co.ke',
    '{"minAge":18,"maxAge":45,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["tech"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'google-startups-africa',
    'Google for Startups Africa',
    'Google',
    'financial',
    '🌍',
    'Google''s accelerator and funding programme for African startups. Provides equity-free support, Google Cloud credits (up to $100,000), mentorship from Google engineers, and access to investor networks. Kenya is a priority market with multiple Kenyan startups accepted each cohort.',
    'Up to $100,000 in Google Cloud credits + mentorship (equity-free)',
    '1. Visit startup.google.com/programs/accelerator/africa
2. Check open application windows
3. Submit startup profile, traction metrics, and team details
4. Complete interview rounds if shortlisted
5. Join 3-month accelerator programme if selected',
    'Business registration, Pitch deck, Product URL or demo, Founders'' LinkedIn profiles, Traction metrics',
    'Cohort applications — check startup.google.com for dates',
    NULL,
    FALSE,
    'https://startup.google.com/programs/accelerator/africa/',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["tech"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'developpp-ventures',
    'Developpp Ventures Grant',
    'Developpp Ventures (Germany/Kenya)',
    'financial',
    '🌍',
    'Impact investment fund backing Kenyan startups solving social and environmental challenges. Focus areas include agriculture, clean energy, financial inclusion, and healthcare. Provides grant funding and hands-on venture building support for early-stage founders.',
    'EUR 25,000 – EUR 150,000 grant funding',
    '1. Visit developpp.vc
2. Review current focus areas and portfolio
3. Submit application with impact thesis and business model
4. Pitch to investment team
5. Due diligence and grant disbursement',
    'Business registration, Impact measurement plan, Financial model, Founders'' CVs, National IDs',
    'Rolling — check developpp.vc for active calls',
    NULL,
    FALSE,
    'https://developpp.vc',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["agriculture","tech","services"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'tef-grant',
    'Tony Elumelu Foundation Entrepreneurship Programme',
    'Tony Elumelu Foundation',
    'financial',
    '🌍',
    'Africa''s largest philanthropy-funded entrepreneurship programme. Provides USD 5,000 non-refundable seed capital plus 12 weeks of business training and mentorship to 1,000 African entrepreneurs annually. Kenyan founders are consistently among the top recipients.',
    'USD 5,000 seed grant (~Ksh 650,000) + training',
    '1. Visit tonyelumelufoundation.org during the annual application window (usually Jan–Mar)
2. Create an account and complete the business profile
3. Submit business idea and growth plan
4. Complete online training modules if shortlisted
5. Receive seed capital upon programme completion',
    'National ID, Business registration (or business plan for new ventures), Bank account details, Passport photo',
    'Annual — typically January to March (check tonyelumelufoundation.org)',
    '03-31',
    TRUE,
    'https://www.tonyelumelufoundation.org',
    '{"minAge":18,"maxAge":55,"gender":"any","employed":"any","businessOwner":true,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'mastercard-scholars',
    'Mastercard Foundation Scholars Programme',
    'Mastercard Foundation',
    'employment',
    '🎓',
    'Full scholarships for academically talented Kenyan students from economically disadvantaged backgrounds. Covers tuition, accommodation, books, and stipends at partner universities including University of Nairobi, Strathmore, and USIU. Also supports secondary school bursaries through partner NGOs.',
    'Full tuition + accommodation + monthly stipend',
    '1. Visit mastercardfdn.org/scholars for partner institutions
2. Apply directly through the partner university during their intake period
3. Complete financial need assessment
4. Attend interview if shortlisted
5. Scholarship awarded before academic year starts',
    'KCSE results, National ID or birth certificate, Recommendation letters, Financial need statement, Admission letter (if available)',
    'Varies by partner university — typically August to October',
    '10-31',
    TRUE,
    'https://mastercardfdn.org/scholars',
    '{"minAge":17,"maxAge":25,"gender":"any","employed":false,"businessOwner":false,"disability":"any","counties":["any"],"sectors":["any"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  ),
  (
    'usaid-kenya-grants',
    'USAID Kenya Grants & Partnerships',
    'USAID Kenya',
    'financial',
    '🌍',
    'US Government funding for Kenyan organisations working in health, agriculture, education, governance, and economic growth. Open to registered NGOs, social enterprises, and community-based organisations. Grants range from small community projects to multi-million dollar partnerships.',
    'USD 10,000 – USD 5,000,000 (varies by opportunity)',
    '1. Register on grants.gov (for US entities) or usaid.gov/kenya for local opportunities
2. Monitor opportunity notices on usaid.gov/work-usaid/get-grant-or-contract
3. Submit concept note or full proposal as specified
4. Undergo technical and financial review
5. Sign grant agreement upon award',
    'Organisation registration certificate, KRA PIN, Audited financial statements, Project proposal and budget, Board resolution authorising application',
    'Rolling — new opportunities posted throughout the year',
    NULL,
    FALSE,
    'https://www.usaid.gov/kenya',
    '{"minAge":18,"maxAge":99,"gender":"any","employed":"any","businessOwner":"any","disability":"any","counties":["any"],"sectors":["agriculture","tech","services"],"groupRequired":false}'::jsonb,
    TRUE,
    0
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  category = EXCLUDED.category,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  amount = EXCLUDED.amount,
  how_to_apply = EXCLUDED.how_to_apply,
  documents = EXCLUDED.documents,
  deadline = EXCLUDED.deadline,
  deadline_date = EXCLUDED.deadline_date,
  deadline_annual = EXCLUDED.deadline_annual,
  link = EXCLUDED.link,
  eligibility = EXCLUDED.eligibility,
  updated_at = NOW();

DO $$
BEGIN
  RAISE NOTICE 'Seed complete. Benefit count: %', (SELECT COUNT(*) FROM benefits);
END $$;
