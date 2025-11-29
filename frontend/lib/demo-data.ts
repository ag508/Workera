export const MOCK_JOBS = [
  { id: '1', title: 'Senior Product Designer', department: 'Design', location: 'Remote', type: 'Full-time', applicants: 12, status: 'Active', postedAt: '2023-10-01' },
  { id: '2', title: 'Frontend Engineer', department: 'Engineering', location: 'New York, NY', type: 'Full-time', applicants: 45, status: 'Active', postedAt: '2023-10-05' },
  { id: '3', title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', type: 'Full-time', applicants: 28, status: 'Active', postedAt: '2023-10-10' },
  { id: '4', title: 'Marketing Specialist', department: 'Marketing', location: 'London, UK', type: 'Contract', applicants: 8, status: 'Draft', postedAt: '2023-10-12' },
  { id: '5', title: 'Backend Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', applicants: 19, status: 'Active', postedAt: '2023-10-15' },
  { id: '6', title: 'Customer Success Manager', department: 'Sales', location: 'Austin, TX', type: 'Full-time', applicants: 32, status: 'Closed', postedAt: '2023-09-20' },
];

export const MOCK_CANDIDATES = [
  { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@example.com', role: 'Product Designer', matchScore: 92, status: 'Screening', location: 'New York, NY', experience: '5 years' },
  { id: '2', firstName: 'Bob', lastName: 'Johnson', email: 'bob.j@example.com', role: 'Frontend Engineer', matchScore: 88, status: 'Interview', location: 'Remote', experience: '3 years' },
  { id: '3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', role: 'Product Manager', matchScore: 75, status: 'New', location: 'San Francisco, CA', experience: '7 years' },
  { id: '4', firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', role: 'Marketing Specialist', matchScore: 95, status: 'Offer', location: 'London, UK', experience: '4 years' },
  { id: '5', firstName: 'Evan', lastName: 'Wright', email: 'evan.w@example.com', role: 'Backend Developer', matchScore: 60, status: 'Rejected', location: 'Remote', experience: '2 years' },
];

export const MOCK_ACTIVITIES = [
  { id: '1', user: 'Sarah Jenkins', action: 'moved candidate', target: 'Alice Smith', to: 'Interview', time: '2 mins ago', type: 'move' },
  { id: '2', user: 'System', action: 'parsed resume for', target: 'John Doe', time: '15 mins ago', type: 'ai' },
  { id: '3', user: 'Mike Ross', action: 'posted job', target: 'Senior React Developer', time: '1 hour ago', type: 'post' },
  { id: '4', user: 'System', action: 'matched candidate', target: 'Diana Prince', to: 'Marketing Specialist', score: 95, time: '2 hours ago', type: 'match' },
  { id: '5', user: 'Sarah Jenkins', action: 'scheduled interview with', target: 'Bob Johnson', time: '4 hours ago', type: 'schedule' },
];

export const MOCK_APPLICATIONS = [
  { id: '1', job: { title: 'Senior Product Designer', location: 'Remote' }, status: 'SCREENING', appliedAt: '2023-10-20' },
  { id: '2', job: { title: 'Frontend Engineer', location: 'New York, NY' }, status: 'INTERVIEW', appliedAt: '2023-10-18' },
  { id: '3', job: { title: 'UX Researcher', location: 'San Francisco' }, status: 'REJECTED', appliedAt: '2023-09-15' },
];

export const MOCK_RESUME_TEXT = `
ALICE SMITH
Product Designer
New York, NY | alice.smith@example.com

SUMMARY
Creative and user-focused Product Designer with 5+ years of experience in designing intuitive mobile and web applications. Proven track record of improving user engagement and retention through data-driven design decisions.

EXPERIENCE
Senior Product Designer | Tech Solutions Inc. | 2021 - Present
- Led the redesign of the core mobile app, resulting in a 20% increase in daily active users.
- Collaborated with cross-functional teams to launch 3 major features.
- Conducted user research and usability testing to inform design iterations.

Product Designer | Creative Agency | 2018 - 2021
- Designed responsive websites for 10+ clients in fintech and healthcare.
- Created high-fidelity prototypes and design systems.

SKILLS
- UI/UX Design, Figma, Sketch, Adobe XD
- Prototyping, Wireframing
- User Research, Usability Testing
- HTML/CSS Basic Knowledge

EDUCATION
BFA in Interaction Design | School of Visual Arts | 2014 - 2018
`;
