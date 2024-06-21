const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('Congratulations, your extension "sf-trivia" is now active!');

    let orgListDisposable = vscode.commands.registerCommand('sf-trivia.sf.orgList', () => {
        const terminal = vscode.window.createTerminal('sf-trivia');
        terminal.sendText('sf org list');
        terminal.show();
    });

    let orgLoginDisposable = vscode.commands.registerCommand('sf-trivia.sf.orgLogin', () => {
        const terminal = vscode.window.createTerminal('sf-trivia');
        terminal.sendText('sf org login web');
        terminal.show();
    });

    let assignPermissionSetsDisposable = vscode.commands.registerCommand('sf-trivia.sf.assignPermissionSets', async () => {
        const usersFilePath = path.join(__dirname, 'users.txt');
        const users = fs.readFileSync(usersFilePath, 'utf8').split('\n').filter(Boolean);

        const permSetsFilePath = path.join(__dirname, 'permissionSets.txt');
        const permSets = fs.readFileSync(permSetsFilePath, 'utf8').split('\n').filter(Boolean);

        if (users.length === 0 || permSets.length === 0) {
            vscode.window.showErrorMessage('User or permission set file is empty.');
            return;
        }

        const terminal = vscode.window.createTerminal('sf-trivia');

        for (const user of users) {
            for (const permSet of permSets) {
                const command = `sf org assign permset --name "${permSet.trim()}" --on-behalf-of "${user.trim()}"`;
                terminal.sendText(command);
            }
        }
        terminal.show();
    });

    let deployCommandDisposable = vscode.commands.registerCommand('sf-trivia.sf.deploy', async () => {
        const orgAlias = await vscode.window.showInputBox({
            placeHolder: 'Enter org alias',
            prompt: 'Enter the alias of the target org'
        });

        if (!orgAlias) {
            vscode.window.showErrorMessage('Org alias is required.');
            return;
        }
        const deploymentAction = await vscode.window.showQuickPick(
            [
                { label: 'start', description: 'Start deployment' },
                { label: 'validate', description: 'Validate deployment' }
            ],
            {
                placeHolder: 'Select deployment action'
            }
        );

        if (!deploymentAction) {
            vscode.window.showErrorMessage('Deployment action is required.');
            return;
        }

        const metadataDir = await vscode.window.showInputBox({
            placeHolder: 'Enter metadata directory name',
            prompt: 'Enter the name of the directory containing metadata to be deployed'
        });

        if (!metadataDir) {
            vscode.window.showErrorMessage('Metadata directory name is required.');
            return;
        }
        const terminal = vscode.window.createTerminal('sf-trivia');
        terminal.sendText(`sf project deploy ${deploymentAction.label} -o ${orgAlias} --metadata-dir ${metadataDir}`);
        terminal.show();
    });
    let createProjectCommand = vscode.commands.registerCommand('sf-trivia.sf.createProject', async () => {

        const projectDir = await vscode.window.showInputBox({
            placeHolder: 'Enter metadata directory name',
            prompt: 'Enter the name of the project directory where package folder will be created'
        });

        if (!projectDir) {
            vscode.window.showErrorMessage('Metadata directory name is required.');
            return;
        }
        const terminal = vscode.window.createTerminal('sf-trivia');
        terminal.sendText(`sf project generate --name m${projectDir} --default-package-dir force-app --manifest`);
        terminal.show();
    });

    context.subscriptions.push(orgListDisposable, orgLoginDisposable, assignPermissionSetsDisposable, deployCommandDisposable, createProjectCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
