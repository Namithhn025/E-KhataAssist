import {
    FileText, Home, Users, Zap, PenTool, CheckCircle,
    Gavel, BookOpen, FileSignature, GitMerge, X,
    ShieldCheck, Lock, ArrowRight
} from 'lucide-react';

export const servicesData = [
    {
        id: 'e-khata',
        icon: FileText,
        title: 'E-Khata',
        category: 'Core',
        desc: 'Official property identification (Form 9 & 11A) issued by authorities. Fast and verified documentation for your property.',
        overview: 'E-Khata is the digital form of a Khata certificate in Karnataka. It proves property ownership, enables easy tax payments, and simplifies approvals for property transactions. Our experts ensure your E-Khata process is smooth, accurate, and stress-free.',
        useCases: ['Buy Property', 'Sell Property', 'Loan/Mortgage', 'Property Tax'],
        documents: ['Aadhaar card of the owners', 'Sale deed', 'Bescom Bill', 'Property Tax Receipt', 'Khata Certificate', 'Mutation Fee Receipt (Optional)'],
        sampleDocs: true,
        price: '2,799',
        originalPrice: '4,999'
    },
    {
        id: 'modt-closure',
        icon: CheckCircle,
        title: 'MODT Closure / Loan Closure',
        category: 'Core',
        desc: 'Official closure of mortgage and bank loan records at sub-registrar office after loan tenure. Hassle-free title clearance.',
        overview: 'MODT (Memorandum of Deposit of Title Deeds) Closure is the process of officially removing a financial institution\'s claim on a property\'s title once a home loan is fully repaid. This ensures your property title is clear and marketable.',
        useCases: ['Home Loan Closure', 'Property Sale', 'Mortgage Release', 'Title Clearance'],
        documents: [
            'Sale Deed',
            'Discharge Deed from Bank (within 3 months)',
            'Exemption Letter',
            'Aadhaar Cards of the owners having bank\'s seal and signature',
            'PAN of the owners having bank\'s seal and signature',
            'Ekhata',
            'Property Tax Receipt of current financial year'
        ],
        price: '7,999',
        originalPrice: '15,000'
    },
    {
        id: 'khata-transfer',
        icon: Users,
        title: 'Khata Transfer',
        category: 'Core',
        desc: 'Seamless transfer of property ownership records in municipal books. We handle the entire documentation and follow-up.',
        overview: 'Khata Transfer is the process of updating the owner\'s name on the Khata after a sale, inheritance, or gift. It is crucial for tax assessment and legal proof of ownership in municipal records.',
        useCases: ['Post-purchase updates', 'Tax assessment', 'Property sales', 'Loans/mortgages'],
        documents: ['Sale Deed', 'Aadhaar Card', 'Tax Paid Receipt', 'BESCOM Bill'],
        whatAllIncluded: ['Khata Transfer', 'Ekhata', 'Encumbrance Certificate', 'GBA Property Tax Portal Name Change'],
        price: '8,499',
        originalPrice: '15,000'
    },
    {
        id: 'bescom-services',
        icon: Zap,
        title: 'BESCOM Name Change',
        category: 'Utility',
        desc: 'Name change, load enhancement, and new meter installations. Hassle-free electrical utility management for your property.',
        overview: 'Updating electricity connection records to reflect the new owner\'s name after a property sale, inheritance, or transfer. This ensures legal proof of occupancy and accurate billing.',
        useCases: ['Legal proof of occupancy', 'Accurate billing', 'Preventing disputes', 'Claiming subsidies (e.g., Gruha Jyothi)'],
        documents: [
            'Passport size photo of the owners',
            'Aadhaar card of the Owners',
            'BESCOM Bill',
            'BESCOM Meter Photo',
            'Sale Deed',
            'Ekhata / Khata Certificate',
            'Property Tax Receipt',
            'No Objection Certificate (NOC)'
        ],
        price: '4,999',
        originalPrice: '7,500'
    },
    {
        id: 'rental-lease',
        icon: PenTool,
        title: 'Rental and Lease Agreement',
        category: 'Legal',
        desc: 'Legally binding drafting and registration of residential and commercial lease deeds to protect your interests.',
        overview: 'A legally binding contract between a property owner and a tenant defining terms and conditions for property usage. Our experts help in drafting and registering these agreements to protect your interests.',
        useCases: ['Renting property', 'Proof of residence', 'Regulatory compliance', 'Legal protection'],
        documents: ['Aadhaar Card', 'BESCOM Bill', 'BWSSB Bill', 'Security Deposit details'],
        price: '1,500',
        originalPrice: '3,000'
    },
    {
        id: 'property-tax',
        icon: Home,
        title: 'Property Tax Payment',
        category: 'Utility',
        desc: 'Assistance in SAS (Self Assessment Scheme) tax calculation and payment. Clear your property dues with official receipts.',
        overview: 'Updating municipal property tax records to reflect a new owner\'s name for compliance and proof of ownership. This is essential for tax payment proof and legal verification.',
        useCases: ['Tax payment proof', 'Home loans', 'Property sales', 'Legal verification'],
        documents: ['Previous Property Tax Paid Receipt'],
        price: '299',
        originalPrice: '1,000'
    },
    {
        id: 'property-registration',
        icon: Gavel,
        title: 'Registry of Property',
        category: 'Legal',
        desc: 'Full assistance in property registration, gift deeds, and sale deeds at the sub-registrar office.',
        overview: 'The official process of documenting and storing property ownership and transactions at a government office. We provide full assistance in registration, gift deeds, and sale deeds.',
        useCases: ['Ownership verification', 'Legal compliance', 'Mortgage/loan processing'],
        documents: ['Sale Deed', 'Khata Certificate', 'Encumbrance Certificate (EC)', 'Property Tax Paid Receipts', 'Aadhaar Card'],
        startsFrom: true,
        price: '20,000',
        originalPrice: null
    },
    {
        id: 'mou-services',
        icon: FileSignature,
        title: 'MOU Services',
        category: 'Legal',
        desc: 'Drafting of Memorandum of Understanding and Agreements to Sell with strict legal compliance.',
        overview: 'A formal, non-binding agreement outlining a shared plan of action or intention to collaborate or proceed with a sale. We help in drafting these with strict legal compliance.',
        useCases: ['Business collaboration', 'Partnership agreements', 'Joint ventures', 'Pre-sale agreements'],
        documents: ['Aadhaar Card', 'PAN Card', 'Witness Signatures'],
        startsFrom: true,
        price: '4,999',
        originalPrice: null
    },
    {
        id: 'family-tree',
        icon: GitMerge,
        title: 'Family Tree',
        category: 'Legal',
        desc: 'Verification and procurement of Geneological Tree certificates for inheritance and legacy property matters.',
        overview: 'A document used to settle inheritance claims, resolve legal disputes, and facilitate property transfer to legal heirs. We assist in verification and procurement of these certificates.',
        useCases: ['Inheritance claims', 'Legal heirship', 'Property transfer', 'Ownership disputes'],
        documents: ['Affidavit', 'Aadhaar Card', 'PAN Card', 'Death Certificate of the deceased'],
        startsFrom: true,
        price: '8,999',
        originalPrice: null
    },
    {
        id: 'legal-consultation',
        icon: Gavel,
        title: 'Legal Consultation',
        category: 'Legal',
        desc: 'Professional legal advice on property disputes, verification of documents, and compliance check for new purchases.',
        overview: 'Expert guidance on property-related matters including ownership, transfers, disputes, and compliance. Professional advice to ensure your property transactions are secure.',
        useCases: ['Ownership guidance', 'Navigating disputes', 'Compliance checks', 'Document verification'],
        documents: ['Variable (Usually relevant property documents needed for review)'],
        startsFrom: true,
        price: '999',
        originalPrice: null
    }
];
