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
		// 履歴を取得
		const insertStrings = vscode.workspace.getConfiguration().get<string[]>('insert-stack-text.insertStrings', []);
		
		// 選択肢を作成
		const quickPickItems: vscode.QuickPickItem[] = insertStrings.map(str => ({ label: `$(history) ${str}` }));
		quickPickItems.push({ label: '$(add) New Entry', alwaysShow: true });
		quickPickItems.push({ label: '$(trash) Delete Entry', alwaysShow: true });

		// 選択を待つ
		const selected = await vscode.window.showQuickPick(quickPickItems, {
			placeHolder: 'Select Insert Text',
		});

		if (selected) {
			if (selected.label.startsWith('$(add)')) {
				// 新規追加を待つ
				const input = await vscode.window.showInputBox({
					placeHolder: "Enter the string to insert"
				});
				if (input !== undefined) {
					updateInsertStrings(input);
				}
			} else if (selected.label.startsWith('$(trash)')) {
				// 削除用の選択肢を作成
				const quickPickItems: vscode.QuickPickItem[] = insertStrings.map(str => ({ label: `$(close) ${str}` }));
				const selected = await vscode.window.showQuickPick(quickPickItems, {
					placeHolder: 'Select Delete Text',
				});
				if (selected) {
					// 選択されたテキストを削除する
					const selectText = selected.label.replace('$(close) ', '')
					const newStrings = insertStrings.filter((el => el !== selectText));
					vscode.workspace.getConfiguration().update('insert-stack-text.insertStrings', newStrings, true);
					vscode.window.showInformationMessage(`delete! "${selectText}"`);
				}
			} else {
				// 選択されたテキストを挿入できるようにする
				const selectText = selected.label.replace('$(history) ', '')
				updateInsertString(selectText)
			}
		} else {
			// 選択されなかったので何もしない
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
