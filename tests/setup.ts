/**
 * Test Setup
 * This file configures the test environment by setting up DOM APIs using happy-dom.
 * It runs before all tests to ensure browser APIs like DOMParser are available.
 */

import { Window } from 'happy-dom';

// Create a new happy-dom window instance
const window = new Window();

// Inject DOM APIs into the global scope for tests
globalThis.DOMParser = window.DOMParser;
globalThis.Document = window.Document;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.XMLSerializer = window.XMLSerializer;

// Optional: Add other browser APIs if needed
globalThis.window = window as any;
globalThis.document = window.document;
