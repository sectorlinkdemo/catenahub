export interface Company {
  id: string;
  name: string;
  logo?: string;
  size: string;
  sector: string;
  offers: string;
  needs: string;
  description?: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId: string;
  sector: string;
  offers: string;
  needs: string;
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  timestamp: string;
  content: string;
}

export const mockCompanies: Company[] = [
  {
    id: 'teachify',
    name: 'Teachify',
    logo: '/assets/teachify_logo.png',
    size: '11–50',
    sector: 'Education',
    offers: 'Corporate English training, language courses',
    needs: 'Partnerships with tech providers',
    description:
      'We provide English language training for businesses across Europe with custom programmes for employees.'
  },
  {
    id: 'linguapro',
    name: 'LinguaPro',
    size: '1–10',
    sector: 'Education',
    offers: 'Corporate language courses',
    needs: 'Cloud hosting solutions'
  },
  {
    id: 'cloudnet',
    name: 'CloudNet',
    size: '51–200',
    sector: 'Tech',
    offers: 'Cloud infrastructure',
    needs: 'Language training for staff'
  },
  {
    id: 'alphatech',
    name: 'AlphaTech',
    size: '11–50',
    sector: 'Tech',
    offers: 'AI language tools',
    needs: 'Partnerships with HR providers'
  }
];

export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@linguapro.com',
    company: 'LinguaPro',
    companyId: 'linguapro',
    sector: 'Education',
    offers: 'Corporate language courses',
    needs: 'Cloud hosting solutions'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@cloudnet.com',
    company: 'CloudNet',
    companyId: 'cloudnet',
    sector: 'Tech',
    offers: 'Cloud infrastructure',
    needs: 'Language training for staff'
  },
  {
    id: '3',
    name: 'Carol Martinez',
    email: 'carol.martinez@alphatech.com',
    company: 'AlphaTech',
    companyId: 'alphatech',
    sector: 'Tech',
    offers: 'AI language tools',
    needs: 'Partnerships with HR providers'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'CloudNet Provider',
    senderId: 'cloudnet',
    timestamp: '10:15 AM',
    content:
      "Hello Teachify! We're excited to explore how our cloud solutions can support your online classes."
  },
  {
    id: '2',
    sender: 'Teachify',
    senderId: 'teachify',
    timestamp: '10:17 AM',
    content:
      "Hi! We're looking for a reliable partner to host our learning platform. Can you share more about your services?"
  },
  {
    id: '3',
    sender: 'CloudNet Provider',
    senderId: 'cloudnet',
    timestamp: '10:20 AM',
    content:
      'Absolutely! We offer scalable, secure hosting with 24/7 support. We can also arrange a demo meeting to discuss details.'
  }
];
