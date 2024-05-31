import * as vscode from 'vscode';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "insert-stack-text" is now active!');

	// テキストを挿入する
	const insertTextCommand = vscode.commands.registerCommand('insert-stack-text.insertText', () => {
		const insertString = vscode.workspace.getConfiguration().get<string>('insert-stack-text.insertString', '');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.insert(position, insertString);
			}).then(() => {
				// テキスト挿入後にカーソルを移動
				const newPosition = new vscode.Position(position.line + 1, 0);
				editor.selection = new vscode.Selection(newPosition, newPosition);
			});
		}
	});
	context.subscriptions.push(insertTextCommand);

	// 挿入する文字列を設定する
	const setInsertStringCommand = vscode.commands.registerCommand('insert-stack-text.setInsertString', async () => {
		const insertStrings = vscode.workspace.getConfiguration().get<string[]>('insert-stack-text.insertStrings', []);
		const quickPickItems = createQuickPickItems(insertStrings);

		// ユーザの操作を受け付ける
		const selected = await vscode.window.showQuickPick(quickPickItems, {
			placeHolder: 'Select Insert Text',
		});

		if (selected) {
			if (selected.label.startsWith('$(add)')) {
				await handleAddNewEntry(insertStrings);
			} else if (selected.label.startsWith('$(trash)')) {
				await handleDeleteEntry(insertStrings);
			} else {
				setSelectedString(selected.label);
			}
		}
	});
	context.subscriptions.push(setInsertStringCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// 選択肢を作成する
function createQuickPickItems(insertStrings: string[]): vscode.QuickPickItem[] {
	const quickPickItems: vscode.QuickPickItem[] = insertStrings.map(str => ({ label: `$(history) ${str}` }));
	quickPickItems.push({ label: '$(add) New Entry', alwaysShow: true });
	quickPickItems.push({ label: '$(trash) Delete Entry', alwaysShow: true });
	return quickPickItems;
}

// 履歴の追加を受け付ける
async function handleAddNewEntry(insertStrings: string[]) {
	const input = await vscode.window.showInputBox({
		placeHolder: "Enter the string to insert"
	});
	if (input !== undefined) {
		updateInsertStrings(insertStrings, input);
	}
}

// 履歴の削除を受け付ける
async function handleDeleteEntry(insertStrings: string[]) {
	const deleteItems = insertStrings.map(str => ({ label: `$(close) ${str}` }));
	const selected = await vscode.window.showQuickPick(deleteItems, {
		placeHolder: 'Select Delete Text',
	});
	if (selected) {
		const selectText = selected.label.replace('$(close) ', '');
		const newStrings = insertStrings.filter(insertString => insertString !== selectText);
		vscode.workspace.getConfiguration().update('insert-stack-text.insertStrings', newStrings, true);
		vscode.window.showInformationMessage(`Deleted: "${selectText}"`);
	}
}

// 文字列リストを更新する
function updateInsertStrings(insertStrings: string[], newString: string) {
	if (!insertStrings.includes(newString)) {
		const newStrings = [newString, ...insertStrings.slice(0, (10 - 1))];
		vscode.workspace.getConfiguration().update('insert-stack-text.insertStrings', newStrings, true);
	}
	updateInsertString(newString);
}

// 選択されたテキストを挿入できるようにする
function setSelectedString(selectedString: string) {
	const selectText = selectedString.replace('$(history) ', '');
	updateInsertString(selectText);
}

// 挿入する文字列を更新する
function updateInsertString(newString: string) {
	vscode.workspace.getConfiguration().update('insert-stack-text.insertString', newString, true);
	vscode.window.showInformationMessage(`Set to: "${newString}"`);
}
