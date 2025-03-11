const fs = require('fs');
const path = require('path');

// Categories for protocols
const categories = [
  'Sample Preparation',
  'Assay',
  'Analysis',
  'Purification',
  'Extraction',
  'Synthesis',
  'Characterization',
  'Quality Control',
  'Method Development',
  'Validation'
];

// Equipment types
const equipmentTypes = [
  { name: 'HPLC', models: ['Agilent 1260', 'Waters Alliance', 'Shimadzu Nexera', 'Thermo Vanquish'] },
  { name: 'GC', models: ['Agilent 7890B', 'Shimadzu GC-2010', 'Thermo Trace 1300'] },
  { name: 'Mass Spectrometer', models: ['Thermo Q Exactive', 'Sciex Triple TOF', 'Agilent 6545'] },
  { name: 'Spectrophotometer', models: ['Thermo Evolution 300', 'Shimadzu UV-1800', 'Agilent Cary 60'] },
  { name: 'Centrifuge', models: ['Eppendorf 5424R', 'Beckman Coulter Avanti', 'Thermo Sorvall'] },
  { name: 'PCR Thermal Cycler', models: ['Bio-Rad CFX96', 'Applied Biosystems 7500', 'Thermo SimpliAmp'] },
  { name: 'Microplate Reader', models: ['BioTek Synergy', 'Molecular Devices SpectraMax', 'Tecan Infinite'] },
  { name: 'Microscope', models: ['Zeiss Axio', 'Leica DMi8', 'Olympus BX53'] },
  { name: 'Balance', models: ['Mettler Toledo XS', 'Sartorius Entris', 'Ohaus Pioneer'] },
  { name: 'pH Meter', models: ['Mettler Toledo SevenCompact', 'Thermo Orion Star', 'Hanna HI5221'] }
];

// Materials
const materials = [
  { name: 'Acetonitrile', notes: 'HPLC grade' },
  { name: 'Methanol', notes: 'HPLC grade' },
  { name: 'Water', notes: 'HPLC grade' },
  { name: 'Formic acid', notes: '98% purity' },
  { name: 'Ammonium acetate', notes: 'Analytical grade' },
  { name: 'Phosphate buffer', notes: 'pH 7.4' },
  { name: 'Trifluoroacetic acid', notes: 'HPLC grade' },
  { name: 'Sodium hydroxide', notes: '1M solution' },
  { name: 'Hydrochloric acid', notes: '1M solution' },
  { name: 'Ethanol', notes: 'Analytical grade' },
  { name: 'Dimethyl sulfoxide', notes: 'Analytical grade' },
  { name: 'Tris buffer', notes: 'pH 8.0' },
  { name: 'EDTA', notes: '0.5M solution' },
  { name: 'Sodium chloride', notes: 'Analytical grade' },
  { name: 'Potassium chloride', notes: 'Analytical grade' },
  { name: 'Magnesium chloride', notes: 'Analytical grade' },
  { name: 'Calcium chloride', notes: 'Analytical grade' },
  { name: 'Bovine serum albumin', notes: 'Lyophilized powder' },
  { name: 'Tween 20', notes: 'Molecular biology grade' },
  { name: 'Triton X-100', notes: 'Molecular biology grade' }
];

// Generate a random integer between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random date between start and end
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Generate a random protocol
const generateProtocol = (index, authorIds) => {
  const id = `protocol-${index}`;
  const category = categories[getRandomInt(0, categories.length - 1)];
  const authorId = authorIds[getRandomInt(0, authorIds.length - 1)];
  
  const dateCreated = getRandomDate(new Date(2022, 0, 1), new Date());
  const datePublished = getRandomDate(dateCreated, new Date());
  
  // Generate random steps
  const numSteps = getRandomInt(3, 8);
  const steps = [];
  for (let i = 1; i <= numSteps; i++) {
    steps.push({
      order: i,
      title: `Step ${i}`,
      description: `This is the description for step ${i} of the protocol.`,
      duration: getRandomInt(5, 60),
      warningText: getRandomInt(1, 10) > 8 ? 'Handle with care. Use appropriate PPE.' : ''
    });
  }
  
  // Generate random materials
  const numMaterials = getRandomInt(2, 5);
  const protocolMaterials = [];
  for (let i = 0; i < numMaterials; i++) {
    const material = materials[getRandomInt(0, materials.length - 1)];
    protocolMaterials.push({
      name: material.name,
      quantity: `${getRandomInt(1, 100)} ${getRandomInt(1, 2) === 1 ? 'mL' : 'g'}`,
      notes: material.notes
    });
  }
  
  // Generate random equipment
  const numEquipment = getRandomInt(1, 3);
  const protocolEquipment = [];
  for (let i = 0; i < numEquipment; i++) {
    const equipment = equipmentTypes[getRandomInt(0, equipmentTypes.length - 1)];
    protocolEquipment.push({
      name: equipment.name,
      model: equipment.models[getRandomInt(0, equipment.models.length - 1)],
      settings: `${getRandomInt(1, 100)} ${getRandomInt(1, 2) === 1 ? 'rpm' : '°C'}`
    });
  }
  
  return {
    id,
    name: `Protocol ${index}: ${category} Method`,
    description: `This is a ${category.toLowerCase()} protocol for laboratory use. Protocol number ${index}.`,
    category,
    author: authorId,
    dateCreated: formatDate(dateCreated),
    datePublished: formatDate(datePublished),
    publishTime: `${getRandomInt(1, 12)}:${getRandomInt(10, 59)} ${getRandomInt(0, 1) ? 'AM' : 'PM'}`,
    status: 'published',
    imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png',
    keyFeatures: [
      `Feature 1 for protocol ${index}`,
      `Feature 2 for protocol ${index}`,
      `Feature 3 for protocol ${index}`
    ],
    steps,
    materials: protocolMaterials,
    equipment: protocolEquipment,
    visibility: getRandomInt(1, 10) > 2 ? 'public' : 'private'
  };
};

// Generate hundreds of protocols and add them to the in-memory database
const generateProtocols = (count = 200, db) => {
  const authorIds = db.users.map(user => user.id);
  
  console.log(`Generating ${count} additional protocols...`);
  
  // Start index from the current number of protocols + 1
  const startIndex = db.protocols.length + 1;
  
  for (let i = startIndex; i < startIndex + count; i++) {
    const newProtocol = generateProtocol(i, authorIds);
    db.protocols.push(newProtocol);
  }
  
  // Save the protocols to a file for persistence
  const protocolsFilePath = path.join(__dirname, '../data/generated-protocols.json');
  
  // Create the data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save the protocols to a file
  fs.writeFileSync(protocolsFilePath, JSON.stringify(db.protocols, null, 2));
  
  console.log(`Added ${count} protocols to the in-memory database.`);
  console.log(`Total protocols: ${db.protocols.length}`);
  console.log(`Saved protocols to ${protocolsFilePath}`);
  
  return db.protocols.length;
};

// Load generated protocols from file
const loadGeneratedProtocols = () => {
  try {
    const protocolsFilePath = path.join(__dirname, '../data/generated-protocols.json');
    
    if (fs.existsSync(protocolsFilePath)) {
      const protocols = JSON.parse(fs.readFileSync(protocolsFilePath, 'utf8'));
      console.log(`Loaded ${protocols.length} protocols from file`);
      return protocols;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading generated protocols:', error);
    return null;
  }
};

module.exports = {
  generateProtocols,
  loadGeneratedProtocols,
  generateProtocol
}; 