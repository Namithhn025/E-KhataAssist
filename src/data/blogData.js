import { 
    FileText, Shield, FileCheck, Home, 
    BookOpen, Scale, Users, Zap, 
    Landmark, FileCode 
} from 'lucide-react';

export const blogData = [
    {
        id: 'bda-vs-bbmp-explained',
        title: "BDA vs BBMP/GBA Explained Simply: Which One Do You Need?",
        category: "Knowledge",
        author: "E-KhataAssist Editorial",
        date: "April 1, 2026",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800",
        excerpt: "Confused between BDA and BBMP? Learn the core differences between Bengaluru's planning and administrative authorities and how they affect your property.",
        content: [
            {
                type: 'h2',
                text: "Quick Summary (TL;DR)"
            },
            {
                type: 'p',
                text: "In simple terms, BDA (Bangalore Development Authority) is the planning authority that creates layouts and allots sites, while BBMP (Bruhat Bengaluru Mahanagara Palike) is the administrative body that manages civic amenities, infrastructure, and property tax collection in those areas."
            },
            {
                type: 'h2',
                text: "What is BDA and What Does It Do?"
            },
            {
                type: 'p',
                text: "The BDA is responsible for the overall urban development of Bengaluru. Its primary roles include forming new residential layouts, allotting sites to citizens, and approving large-scale development projects. BDA essentially 'creates' the space for residential and commercial activities."
            },
            {
                type: 'h2',
                text: "What is BBMP/GBA and What Does It Do?"
            },
            {
                type: 'p',
                text: "BBMP is the urban local body responsible for the civic and infrastructural maintenance of the city. Once a BDA layout is fully developed, it is usually handed over to the BBMP for maintenance. BBMP handles streetlights, garbage collection, road repairs, and, most importantly, property tax records (Khata)."
            },
            {
                type: 'h2',
                text: "Core Differences Table"
            },
            {
                type: 'table',
                headers: ["Feature", "BDA (Bangalore Development Authority)", "BBMP (Bruhat Bengaluru Mahanagara Palike)"],
                rows: [
                    ["Primary Role", "Planning and Layout Formation", "Maintenance and Taxation"],
                    ["Khata Issuance", "Does not issue Khata (Issues Possession Certificate)", "Issues Khata for property identification"],
                    ["Approval Authority", "Approves Layout Plans", "Approves Building Plans (in developed areas)"],
                    ["Jurisdiction", "Newly developing urban fringes", "Established urban areas of Bengaluru"],
                    ["Property Allotment", "Allots sites to individuals", "Does not allot sites"]
                ]
            },
            {
                type: 'h2',
                text: "BDA Khata vs BBMP Khata: The Reality"
            },
            {
                type: 'p',
                text: "A common misconception is that BDA issues its own 'Khata'. In reality, when you get a site from BDA, you receive an Allotment Letter and a Possession Certificate. You must then apply to BBMP to get a Khata registered in your name to start paying property tax."
            }
        ],
        faqs: [
            {
                question: "Is a BDA-approved layout safer than a private layout?",
                answer: "Generally, yes. BDA layouts strictly follow government norms for roads, parks, and amenities, making them legally secure and easier to get bank loans for."
            },
            {
                question: "Can I get a BBMP Khata for my BDA site?",
                answer: "Yes, once the BDA layout is handed over to the BBMP, you can apply for a transfer and receive a BBMP Khata certificate."
            }
        ]
    },
    {
        id: 'khata-transfer-status-2026',
        title: "How to Check BBMP/GBA Khata Transfer Status 2026: Online Guide",
        category: "Guides",
        author: "E-KhataAssist Editorial",
        date: "March 28, 2026",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
        excerpt: "Wait no more! Learn the exact steps to check your Khata transfer status online on the BBMP/GBA portal in 2026.",
        content: [
            {
                type: 'h2',
                text: "The New Digital Portal"
            },
            {
                type: 'p',
                text: "In 2026, the BBMP/GBA has streamlined the process for property owners. You no longer need to visit the local ward office repeatedly to check your file's progress. Everything is now tracked through the electronic Property Identification number (ePID)."
            },
            {
                type: 'h3',
                text: "Step-by-Step Status Check"
            },
            {
                type: 'list',
                items: [
                    "Visit the official BBMP/GBA Seva Portal.",
                    "Enter your application acknowledgement number.",
                    "Verify with the OTP sent to your registered mobile number.",
                    "View the current status: Pending, Verification in Progress, Approved, or Rejected."
                ]
            },
            {
                type: 'h2',
                text: "Essential Documents for a Successful Transfer"
            },
            {
                type: 'p',
                text: "To ensure your status remains 'Approved', make sure you have submitted these correctly:"
            },
            {
                type: 'table',
                headers: ["Document", "Requirement"],
                rows: [
                    ["Registered Sale Deed", "Full copy with signatures"],
                    ["Previous Khata", "Original or attested copy"],
                    ["Tax Receipts", "Up to date for the current year"],
                    ["EC (Encumbrance Certificate)", "For the last 13 to 30 years"],
                    ["ID Proof", "Aadhar or Passport copy"]
                ]
            }
        ],
        faqs: [
            {
                question: "Why is my Khata transfer status showing 'Rejected'?",
                answer: "Common reasons include incomplete documentation, unpaid property tax, or deviations in the building plan that exceed permitted limits."
            },
            {
                question: "How long is the typical waiting period?",
                answer: "Post-submission, it usually takes 30 to 45 working days for the final certificate to be generated."
            }
        ]
    },
    {
        id: 'b-khata-home-loan-banks',
        title: "Home Loan for B Khata Property in Bangalore: Eligibility, Interest & Banks",
        category: "Legal",
        author: "E-KhataAssist Editorial",
        date: "March 25, 2026",
        image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800",
        excerpt: "Can you get a home loan for a B-Khata property? Yes, but with specific conditions. Explore the eligibility and top banks lending in 2026.",
        content: [
            {
                type: 'h2',
                text: "Understanding B-Khata Loan Eligibility"
            },
            {
                type: 'p',
                text: "A B-Khata property is one that pays property tax to the BBMP but does not have the necessary Occupation Certificate (OC) or Completion Certificate (CC). While nationalized banks like SBI rarely fund these, private banks and NBFCs have specific products for them."
            },
            {
                type: 'h2',
                text: "Comparison: A-Khata vs B-Khata Loans"
            },
            {
                type: 'table',
                headers: ["Feature", "A-Khata Home Loan", "B-Khata Home Loan"],
                rows: [
                    ["Loan-to-Value (LTV)", "Up to 80-90%", "Usually 50-60%"],
                    ["Interest Rates", "Starting from 8.5%", "Starts from 11% to 14%"],
                    ["Banks Available", "All Nationalized and Private Banks", "Specific Private Banks & NBFCs"],
                    ["Processing Time", "7-10 Days", "15-20 Days"]
                ]
            },
            {
                type: 'h3',
                text: "Top Banks/Lenders for B-Khata in 2026"
            },
            {
                type: 'list',
                items: [
                    "HDFC Housing Finance",
                    "ICICI Bank (specific schemes)",
                    "LIC Housing Finance",
                    "NBFCs like Indiabulls, L&T Finance",
                    "Local Cooperative Societies"
                ]
            }
        ]
    },
    {
        id: 'ekhata-guide-2026',
        title: "Everything You Need to Know About BBMP E-Khata in Bengaluru (2026 Guide)",
        category: "Guides",
        author: "E-KhataAssist Editorial",
        date: "March 20, 2026",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
        excerpt: "Learn the difference between A-Khata and B-Khata, and why having an E-Khata is essential for property ownership in modern Bengaluru.",
        content: [
            {
                type: 'h2',
                text: "What exactly is an E-Khata?"
            },
            {
                type: 'p',
                text: "In the digital transformation era of 2026, the BBMP (Bruhat Bengaluru Mahanagara Palike) has moved away from physical registers to a centralized electronic database. An E-Khata is simply a property record that has been digitised to make property management transparent and corruption-free."
            },
            {
                type: 'h2',
                text: "Why You Can't Ignore E-Khata Anymore"
            },
            {
                type: 'p',
                text: "Whether you want to sell your property, apply for a building plan sanction, or secure a home loan, an E-Khata is no longer optional. It is the primary document scanned by legal teams and bank appraisers to verify ownership and tax compliance."
            },
            {
                type: 'h2',
                text: "A-Khata vs B-Khata: The Definitive Comparison"
            },
            {
                type: 'table',
                headers: ["Criteria", "A-Khata", "B-Khata"],
                rows: [
                    ["Legal Status", "Fully Legal & Compliant", "Acknowledgement of Tax Paid"],
                    ["Building Plan", "Approved", "Often has Deviations"],
                    ["Loan Eligibility", "All Banks", "Private Banks/NBFCs Only"],
                    ["Resale Value", "Market Value", "Discounted Market Value"]
                ]
            },
            {
                type: 'h3',
                text: "Steps to Digitise Your Khata"
            },
            {
                type: 'list',
                items: [
                    "Verification of current physical Khata certificate.",
                    "Checking the property tax arrears for the last 10 years.",
                    "Scanning and uploading Sale Deed and Encumbrance Certificate.",
                    "Submission to the BBMP/GBA portal for digital issuance."
                ]
            }
        ],
        faqs: [
            {
                question: "Can I get an E-Khata for a B-Khata property?",
                answer: "Yes, BBMP now allows E-Khata processing for B-Khata properties to streamline tax collection."
            },
            {
                question: "How long does the digital processing take?",
                answer: "Typically, it takes between 15 to 25 working days depending on document verification."
            }
        ]
    }
];
