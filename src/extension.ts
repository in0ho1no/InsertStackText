// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "insert-stack-text" is now active!');

	// テキストを挿入する
	let insertTextCommand = vscode.commands.registerCommand('insert-stack-text.insertText', () => {
		const insertString = vscode.workspace.getConfiguration().get<string>('insert-stack-text.insertString', '');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.insert(position, insertString);
			}).then(() => {
				// テキスト挿入後にカーソルを移動
				const newPosition = new vscode.Position(position.line + 1, 0); // 次の行の先頭
				editor.selection = new vscode.Selection(newPosition, newPosition);
			});
		}
	});
	context.subscriptions.push(insertTextCommand);

	// 挿入する文字列を設定する
	let setInsertStringCommand = vscode.commands.registerCommand('insert-stack-text.setInsertString', async () => {
		const input = await vscode.window.showInputBox({
			placeHolder: "Enter the string to insert"
		});
		if (input !== undefined) {
			await vscode.workspace.getConfiguration().update('insert-stack-text.insertString', input, true);
			vscode.window.showInformationMessage(`The string to insert was set to "${input}"`);
		}
	});
	context.subscriptions.push(setInsertStringCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
