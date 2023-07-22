
import fs from 'fs';
import path from 'path';

interface LogEntry {
  date: Date;
  endpoint: string;
  statusCode: number;
}

const logsDirectory = path.join(__dirname, 'data');

function readLogsFromFile(filePath: string): LogEntry[] {
  const logData = fs.readFileSync(filePath, 'utf-8');
  const logLines = logData.split('\n');

  const logEntries: LogEntry[] = logLines.map((line) => {
    const [timestamp, endpoint, statusCode] = line.split(' ');
    return {
      date: new Date(timestamp),
      endpoint,
      statusCode: parseInt(statusCode),
    };
  });

  return logEntries;
}

function processLogFiles(logFiles: string[]): LogEntry[] {
  let allLogEntries: LogEntry[] = [];

  logFiles.forEach((logFile) => {
    const logFilePath = path.join(logsDirectory, logFile);
    const logEntries = readLogsFromFile(logFilePath);
    allLogEntries = [...allLogEntries, ...logEntries];
  });

  return allLogEntries;
}

function countEndpointCalls(logEntries: LogEntry[]): Map<string, number> {
  const endpointCounts = new Map<string, number>();
  logEntries.forEach((entry) => {
    const { endpoint } = entry;
    endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1);
  });
  return endpointCounts;
}

function countAPICallsPerMinute(logEntries: LogEntry[]): Map<string, number> {
  const apiCallsPerMinute = new Map<string, number>();
  logEntries.forEach((entry) => {
    const timestamp = entry.date.toISOString().slice(0, 16); // Extract the date and time without seconds
    apiCallsPerMinute.set(timestamp, (apiCallsPerMinute.get(timestamp) || 0) + 1);
  });
  return apiCallsPerMinute;
}

function countAPICallsByStatusCode(logEntries: LogEntry[]): Map<number, number> {
  const statusCodeCounts = new Map<number, number>();
  logEntries.forEach((entry) => {
    const { statusCode } = entry;
    statusCodeCounts.set(statusCode, (statusCodeCounts.get(statusCode) || 0) + 1);
  });
  return statusCodeCounts;
}

const logFiles = ['../data/api_calls_data1.log', '../data/api_calls_data2.log', '../data/api_calls_data3.log']; // Add more files if needed
const logEntries = processLogFiles(logFiles);

const endpointCounts = countEndpointCalls(logEntries);
const apiCallsPerMinute = countAPICallsPerMinute(logEntries);
const statusCodeCounts = countAPICallsByStatusCode(logEntries);

// Display the results in a formatted table
console.log('Endpoint Counts:');
console.table(Array.from(endpointCounts.entries()));

console.log('\nAPI Calls Per Minute:');
console.table(Array.from(apiCallsPerMinute.entries()));

console.log('\nStatus Code Counts:');
console.table(Array.from(statusCodeCounts.entries()));
