const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Create a mock window object
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  runScripts: "dangerously",
  resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;

// Load the notes.js file
const notesPath = path.join(__dirname, 'public', 'app', 'notes', 'notes.js');
const notesCode = fs.readFileSync(notesPath, 'utf8');
eval(notesCode);

// Load the settings.js file
const settingsPath = path.join(__dirname, 'public', 'app', 'settings', 'settings.js');
const settingsCode = fs.readFileSync(settingsPath, 'utf8');
eval(settingsCode);

// Test if the classes are available
console.log('Testing NotesApp:');
if (typeof dom.window.NotesApp !== 'undefined') {
  console.log('✓ NotesApp class is available');
  try {
    const notesApp = new dom.window.NotesApp({});
    console.log('✓ NotesApp can be instantiated');
  } catch (e) {
    console.log('✗ NotesApp instantiation failed:', e.message);
  }
} else {
  console.log('✗ NotesApp class is NOT available');
}

console.log('\nTesting SettingsApp:');
if (typeof dom.window.SettingsApp !== 'undefined') {
  console.log('✓ SettingsApp class is available');
  try {
    const settingsApp = new dom.window.SettingsApp({});
    console.log('✓ SettingsApp can be instantiated');
  } catch (e) {
    console.log('✗ SettingsApp instantiation failed:', e.message);
  }
} else {
  console.log('✗ SettingsApp class is NOT available');
}