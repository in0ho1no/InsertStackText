// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "insert-stack-text" is now active!');

	// テキストを挿入する
	let insertTextCommand = vscode.commands.registerCommand('insert-stack-text.insertText', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.insert(position, '特定の文字列');
			});
		}
	});
	context.subscriptions.push(insertTextCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
