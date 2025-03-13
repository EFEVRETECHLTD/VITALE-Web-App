/**
 * Simple load testing script for the API
 * Requires: npm install -g autocannon
 * Run with: node scripts/load-test.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const DURATION = process.env.DURATION || 30; // seconds
const CONNECTIONS = process.env.CONNECTIONS || 100;
const REPORT_DIR = path.join(__dirname, '../reports/load-tests');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Generate timestamp for report files
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

// Endpoints to test
const endpoints = [
  { name: 'health', path: '/api/health', method: 'GET' },
  { name: 'protocols-list', path: '/api/protocols', method: 'GET' },
  { name: 'protocol-detail', path: '/api/protocols/1', method: 'GET' },
  { name: 'protocol-reviews', path: '/api/protocols/1/reviews', method: 'GET' }
];

console.log(`Starting load tests against ${API_URL}`);
console.log(`Duration: ${DURATION}s, Connections: ${CONNECTIONS}`);

// Run tests sequentially
async function runTests() {
  for (const endpoint of endpoints) {
    console.log(`\nTesting ${endpoint.method} ${endpoint.path}...`);
    
    const reportFile = path.join(REPORT_DIR, `${timestamp}-${endpoint.name}.json`);
    
    // Build autocannon command
    const url = `${API_URL}${endpoint.path}`;
    const args = [
      '-c', CONNECTIONS,
      '-d', DURATION,
      '-m', endpoint.method,
      '-j', // JSON output
      url
    ];
    
    // Run autocannon
    const autocannon = spawn('autocannon', args);
    
    // Collect output
    let output = '';
    autocannon.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write('.');
    });
    
    // Handle completion
    await new Promise((resolve, reject) => {
      autocannon.on('close', (code) => {
        console.log(`\nCompleted with code ${code}`);
        
        if (code === 0 && output) {
          try {
            // Save report
            fs.writeFileSync(reportFile, output);
            console.log(`Report saved to ${reportFile}`);
            
            // Parse and display summary
            const result = JSON.parse(output);
            console.log('\nSummary:');
            console.log(`  Requests: ${result.requests.total}`);
            console.log(`  Throughput: ${Math.round(result.requests.average)} req/sec`);
            console.log(`  Latency (avg): ${result.latency.average.toFixed(2)}ms`);
            console.log(`  Latency (p99): ${result.latency.p99.toFixed(2)}ms`);
            
            resolve();
          } catch (err) {
            console.error('Error processing results:', err);
            reject(err);
          }
        } else {
          console.error('Error running autocannon');
          reject(new Error('Autocannon failed'));
        }
      });
    });
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
}); 