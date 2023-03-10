import { Diagnostic, DiagnosticCollection, ExtensionContext, Uri, Range, languages } from 'vscode';

let diagnosticCollection: DiagnosticCollection;
let diagnosticMap: Map<string, Diagnostic[]> = new Map();

export function initDiagnostics(context:ExtensionContext) {
  diagnosticCollection = languages.createDiagnosticCollection('php-extra-checks');
}

export function noReturnType(uri:Uri, range:Range) {
  addToDiagnostics(uri,
    new Diagnostic(range,
    `Missing function's return type declaration`,
    2));
}

export function clearDiagnostics(uri:Uri) {
  let canonicalFile = uri.path;
  diagnosticMap.set(canonicalFile, []);
}

export function addToDiagnostics(uri:Uri, diagnostic:Diagnostic) {
  let canonicalFile = uri.path;
  let diagnostics = diagnosticMap.get(canonicalFile);
  if (!diagnostics) { diagnostics = []; }
  diagnostics.push(diagnostic);
  diagnosticMap.set(canonicalFile, diagnostics);
}

export function finishDiagnostics(uri:Uri) {
  let canonicalFile = uri.path;
  let diagnostics = diagnosticMap.get(canonicalFile);
  diagnosticCollection.set(uri, diagnostics);
}
