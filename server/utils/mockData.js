const bcrypt = require('bcryptjs');

// Mock user data
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    displayName: 'Alex Morgan',
    email: 'admin@efevre-tech.com',
    password: 'admin123', // Will be hashed before storage
    jobPosition: 'Lab Director',
    role: 'admin',
    department: 'Research & Development',
    profileImage: '/images/avatars/admin-avatar.png'
  },
  {
    id: '2',
    username: 'scientist',
    displayName: 'Jordan Smith',
    email: 'scientist@efevre-tech.com',
    password: 'scientist123', // Will be hashed before storage
    jobPosition: 'Senior Scientist',
    role: 'user',
    department: 'Analytical Chemistry',
    profileImage: '/images/avatars/scientist-avatar.png'
  },
  {
    id: '3',
    username: 'technician',
    displayName: 'Casey Wilson',
    email: 'technician@efevre-tech.com',
    password: 'technician123', // Will be hashed before storage
    jobPosition: 'Lab Technician',
    role: 'user',
    department: 'Quality Control',
    profileImage: '/images/avatars/technician-avatar.png'
  }
];

// Mock protocol data
const mockProtocols = [
  {
    id: 'aczo-tag',
    name: 'AcZo-tag™ Amino Acid Sample Prep',
    description: 'Preparation protocol for amino acid samples using AcZo-tag technology.',
    category: 'Sample Preparation',
    author: '1', // admin user ID
    dateCreated: '2023-06-15',
    datePublished: '2023-07-23',
    publishTime: '11:15 AM',
    status: 'published',
    imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png',
    keyFeatures: [
      'Amino acid tagging',
      'Sample preparation',
      'High sensitivity'
    ],
    steps: [
      {
        order: 1,
        title: 'Prepare reagents',
        description: 'Prepare all reagents according to manufacturer instructions.',
        duration: 15
      },
      {
        order: 2,
        title: 'Sample preparation',
        description: 'Add 100µL of sample to a clean microcentrifuge tube.',
        duration: 5
      },
      {
        order: 3,
        title: 'Add tagging reagent',
        description: 'Add 50µL of AcZo-tag reagent to the sample.',
        duration: 2,
        warningText: 'Handle reagent with care. Avoid skin contact.'
      }
    ],
    materials: [
      { name: 'AcZo-tag reagent', quantity: '50µL per sample', notes: 'Store at -20°C' },
      { name: 'Microcentrifuge tubes', quantity: '1 per sample', notes: 'Use clean tubes' }
    ],
    equipment: [
      { name: 'Micropipette', model: 'Any', settings: '10-100µL' },
      { name: 'Vortex mixer', model: 'Any', settings: 'Medium speed' }
    ],
    visibility: 'public'
  },
  {
    id: 'ace-inhibition',
    name: 'ACE Inhibition Assay',
    description: 'Assay for measuring angiotensin-converting enzyme (ACE) inhibition.',
    category: 'Assay',
    author: '2', // scientist user ID
    dateCreated: '2023-09-15',
    datePublished: '2023-10-02',
    publishTime: '11:16 AM',
    status: 'published',
    imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png',
    keyFeatures: [
      'ACE inhibition measurement',
      'Enzyme kinetics',
      'Drug screening'
    ],
    steps: [
      {
        order: 1,
        title: 'Prepare enzyme solution',
        description: 'Dilute ACE enzyme to 0.1 U/mL in assay buffer.',
        duration: 10
      },
      {
        order: 2,
        title: 'Prepare substrate',
        description: 'Prepare substrate solution at 2 mM concentration.',
        duration: 10
      },
      {
        order: 3,
        title: 'Set up reaction',
        description: 'Mix 50µL enzyme solution with 50µL sample in a microplate well.',
        duration: 5
      },
      {
        order: 4,
        title: 'Add substrate',
        description: 'Add 50µL substrate solution to start the reaction.',
        duration: 2
      },
      {
        order: 5,
        title: 'Incubate',
        description: 'Incubate the plate at 37°C for 30 minutes.',
        duration: 30
      },
      {
        order: 6,
        title: 'Measure absorbance',
        description: 'Measure absorbance at 450 nm using a plate reader.',
        duration: 5
      }
    ],
    materials: [
      { name: 'ACE enzyme', quantity: '0.1 U/mL', notes: 'Keep on ice' },
      { name: 'Substrate', quantity: '2 mM', notes: 'Protect from light' },
      { name: 'Assay buffer', quantity: 'As needed', notes: 'pH 7.4' }
    ],
    equipment: [
      { name: 'Microplate reader', model: 'Any', settings: '450 nm' },
      { name: 'Incubator', model: 'Any', settings: '37°C' }
    ],
    visibility: 'public'
  },
  {
    id: 'hplc-method-development',
    name: 'HPLC Method Development',
    description: 'A comprehensive guide for developing HPLC methods for various analytes.',
    category: 'Analysis',
    author: '2', // scientist user ID
    dateCreated: '2023-08-10',
    datePublished: '2023-08-25',
    publishTime: '14:30 PM',
    status: 'published',
    imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png',
    keyFeatures: [
      'HPLC optimization',
      'Method development',
      'Chromatography'
    ],
    steps: [
      {
        order: 1,
        title: 'Define separation goals',
        description: 'Clearly define the analytes to be separated and the required resolution.',
        duration: 60
      },
      {
        order: 2,
        title: 'Select initial conditions',
        description: 'Choose column, mobile phase, and detection method based on analyte properties.',
        duration: 120
      },
      {
        order: 3,
        title: 'Perform initial runs',
        description: 'Run samples under initial conditions and evaluate chromatography.',
        duration: 180
      },
      {
        order: 4,
        title: 'Optimize conditions',
        description: 'Adjust mobile phase composition, flow rate, and temperature to improve separation.',
        duration: 240
      },
      {
        order: 5,
        title: 'Validate method',
        description: 'Validate the optimized method for linearity, precision, accuracy, and robustness.',
        duration: 480
      }
    ],
    materials: [
      { name: 'HPLC-grade solvents', quantity: 'As needed', notes: 'Filter before use' },
      { name: 'Standard solutions', quantity: 'As needed', notes: 'Prepare fresh' }
    ],
    equipment: [
      { name: 'HPLC system', model: 'Any', settings: 'Varies' },
      { name: 'Analytical columns', model: 'Various', settings: 'N/A' }
    ],
    visibility: 'public'
  }
];

// Mock review data
const mockReviews = [
  {
    protocol: 'aczo-tag',
    user: '2', // scientist user ID
    rating: 4,
    title: 'Excellent protocol',
    comment: 'This protocol is well-documented and easy to follow. The results are consistent and reproducible.',
    metrics: {
      efficiency: 4,
      consistency: 5,
      accuracy: 4,
      safety: 3,
      easeOfExecution: 4,
      scalability: 3
    },
    dateCreated: '2023-08-15',
    verified: true
  },
  {
    protocol: 'aczo-tag',
    user: '3', // technician user ID
    rating: 3,
    title: 'Good but could be improved',
    comment: 'The protocol works well but could use more detailed safety instructions.',
    metrics: {
      efficiency: 3,
      consistency: 4,
      accuracy: 3,
      safety: 2,
      easeOfExecution: 3,
      scalability: 3
    },
    dateCreated: '2023-09-05',
    verified: true
  },
  {
    protocol: 'ace-inhibition',
    user: '1', // admin user ID
    rating: 4,
    title: 'Robust assay',
    comment: 'This assay is reliable and produces consistent results. The protocol is well-written.',
    metrics: {
      efficiency: 4,
      consistency: 5,
      accuracy: 4,
      safety: 4,
      easeOfExecution: 3,
      scalability: 4
    },
    dateCreated: '2023-10-15',
    verified: true
  }
];

// Function to hash passwords for mock users
const hashPasswords = async (users) => {
  // Create a deep copy of the users array to avoid modifying the original
  const hashedUsers = JSON.parse(JSON.stringify(users));
  
  // Hash passwords for each user
  for (const user of hashedUsers) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  return hashedUsers;
};

// Export a function to get pre-hashed users for testing
const getPreHashedUsers = async () => {
  return await hashPasswords(mockUsers);
};

module.exports = {
  mockUsers,
  mockProtocols,
  mockReviews,
  hashPasswords,
  getPreHashedUsers
};
