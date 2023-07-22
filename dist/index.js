"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDirectory = path_1.default.join(__dirname, 'data');
function readLogsFromFile(filePath) {
    const logData = fs_1.default.readFileSync(filePath, 'utf-8');
    const logLines = logData.split('\n');
    const logEntries = logLines.map((line) => {
        const [timestamp, endpoint, statusCode] = line.split(' ');
        return {
            date: new Date(timestamp),
            endpoint,
            statusCode: parseInt(statusCode),
        };
    });
    return logEntries;
}
function processLogFiles(logFiles) {
    let allLogEntries = [];
    logFiles.forEach((logFile) => {
        const logFilePath = path_1.default.join(logsDirectory, logFile);
        const logEntries = readLogsFromFile(logFilePath);
        allLogEntries = [...allLogEntries, ...logEntries];
    });
    return allLogEntries;
}
function countEndpointCalls(logEntries) {
    const endpointCounts = new Map();
    logEntries.forEach((entry) => {
        const { endpoint } = entry;
        endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1);
    });
    return endpointCounts;
}
function countAPICallsPerMinute(logEntries) {
    const apiCallsPerMinute = new Map();
    logEntries.forEach((entry) => {
        // Validate the date before proceeding
        if (isNaN(entry.date)) {
            //console.warn(`Invalid date format: ${entry.date}`);
            return; // Skip this entry and continue to the next one
        }

        const timestamp = entry.date.toISOString().slice(0, 16); // Extract the date and time without seconds
        apiCallsPerMinute.set(timestamp, (apiCallsPerMinute.get(timestamp) || 0) + 1);
    });

    
    return apiCallsPerMinute;
}

function countAPICallsByStatusCode(logEntries) {
    const statusCodeCounts = new Map();
    logEntries.forEach((entry) => {
        const { statusCode } = entry;
        statusCodeCounts.set(statusCode, (statusCodeCounts.get(statusCode) || 0) + 1);
    });
    return statusCodeCounts;
}
const logFiles = ['../data/api_calls_data1.log', '../data/api_calls_data2.log', '../data/api_calls_data3.log'];
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
