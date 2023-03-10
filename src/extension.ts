import * as vscode from 'vscode';
import * as PHPParser from './phpparser';
import path = require('path');
import * as MyDiagnostics from './diagnostic';

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {

  MyDiagnostics.initDiagnostics(context);

  vscode.workspace.onDidOpenTextDocument((e:vscode.TextDocument) => {
    highlightProblems(e);
  });

  vscode.window.onDidChangeActiveTextEditor((e) => {
    e && e.document && highlightProblems(e.document);
  }, null, context.subscriptions);

  vscode.workspace.onDidSaveTextDocument((e) => {
    e && e.uri && highlightProblemsAll(e.uri);
  });

  vscode.workspace.onDidChangeTextDocument(e => {
    // TODO do not evaluate on each change for now.
    // e && e.contentChanges && e.contentChanges.length && e.document &&
    //   higlightProblemsAll(e.document.uri);
  });

  highlightProblemsAll();
}

// This method is called when your extension is deactivated
export function deactivate() {}

function highlightProblemsAll(uri:vscode.Uri|null = null) {
  vscode.workspace.textDocuments.map(document => {
    (!uri || uri.path === document.uri.path) && highlightProblems(document);
  });
}

function highlightProblems(document:vscode.TextDocument) {
  if (path.extname(document.uri.path) !== '.php') { return; }
  const code = PHPParser.parseCode(document.getText());
  const functions = PHPParser.findAllFunctions(code);

  MyDiagnostics.clearDiagnostics(document.uri);
  functions.forEach((func) => {
    func.type || MyDiagnostics.noReturnType(document.uri, getLastBracket(func));
  });
  MyDiagnostics.finishDiagnostics(document.uri);
}

function getLastBracket(func:PHPParser.NodeLayout): vscode.Range {
  // TODO - better to do text search for the last bracket between "p" and the start of the body
  let p, inc = 0;
  if (func.arguments && func.arguments.length) {
    p = func.arguments[func.arguments.length - 1].loc.end;
  } else {
    p = func.name.loc.end;
    inc = 1;
  }
  return new vscode.Range(p.line - 1, p.column +  inc, p.line - 1, p.column + inc + 1);
}