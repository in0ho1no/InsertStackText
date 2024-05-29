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
		// 履歴の情報を取得
		const insertStrings = vscode.workspace.getConfiguration().get<string[]>('insert-stack-text.insertStrings', []);
		
		// 新規追加用の選択肢を追加
		const quickPickItems: vscode.QuickPickItem[] = insertStrings.map(str => ({ label: str }));
		quickPickItems.push({ label: 'New Entry', alwaysShow: true });

		const selected = await vscode.window.showQuickPick(quickPickItems, {
			placeHolder: 'Select Insert Text',
		});

		if (selected && selected.label === 'New Entry') {

			const input = await vscode.window.showInputBox({
				placeHolder: "Enter the string to insert"
			});
			if (input !== undefined) {
				updateInsertStrings(input);
			}
		} else if (selected) {
			updateInsertString(selected.label)
		} else {
			// 何もしない
		}
	});
	context.subscriptions.push(setInsertStringCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// 文字列リストを更新する
function updateInsertStrings(newString: string) {
	const config = vscode.workspace.getConfiguration();

	let insertStrings = config.get<string[]>('insert-stack-text.insertStrings', []);
	if (!insertStrings.includes(newString)) {
		if (insertStrings.length >= 10) {
			insertStrings.shift(); // 最古の履歴を削除
		}
		insertStrings.unshift(newString);
		config.update('insert-stack-text.insertStrings', insertStrings, true);
	}
	updateInsertString(newString)
}

// 挿入する文字列を更新する
function updateInsertString(newString: string) {
	vscode.workspace.getConfiguration().update('insert-stack-text.insertString', newString, true);
	vscode.window.showInformationMessage(`The string to insert was set to "${newString}"`);
}
