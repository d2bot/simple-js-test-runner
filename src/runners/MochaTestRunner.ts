import { join } from "path";
import { debug, WorkspaceFolder } from "vscode";

import { ITestRunnerInterface } from "../interfaces/ITestRunnerInterface";
import { ITestRunnerOptions } from "../interfaces/ITestRunnerOptions";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { TerminalProvider } from "../providers/TerminalProvider";

export class MochaTestRunner implements ITestRunnerInterface {
  public name: string = "mocha";
  public terminalProvider: TerminalProvider = null;
  public configurationProvider: ConfigurationProvider = null;

  get binPath(): string {
    return join("node_modules", ".bin", "mocha");
  }

  constructor({ terminalProvider, configurationProvider }: ITestRunnerOptions) {
    this.terminalProvider = terminalProvider;
    this.configurationProvider = configurationProvider;
  }

  public runTest(
    rootPath: WorkspaceFolder,
    fileName: string,
    testName: string
  ) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider
      .environmentVariables;

    let command = `${this.binPath} ${fileName}`;
    if (testName) {
      command += ` --grep=$'^${testName
        .replace(/'/g, "\\'")
        .replace(/\\/g, "\\\\")}'`;
    }

    if (additionalArguments) {
      command += ` ${additionalArguments}`;
    }

    const terminal = this.terminalProvider.get(
      { env: environmentVariables },
      rootPath
    );

    terminal.sendText(command, true);
    terminal.show(true);
  }

  public debugTest(
    rootPath: WorkspaceFolder,
    fileName: string,
    testName: string
  ) {
    const additionalArguments = this.configurationProvider.additionalArguments;
    const environmentVariables = this.configurationProvider
      .environmentVariables;

    const args = [fileName, "--no-timeout"];
    if (testName) {
      args.push(...["--grep", `^${testName}`]);
    }

    if (additionalArguments) {
      args.push(...additionalArguments.split(" "));
    }

    debug.startDebugging(rootPath, {
      args,
      env: environmentVariables,
      internalConsoleOptions: "neverOpen",
      name: "Debug Test",
      program: "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      redirectOutput: true,
      request: "launch",
      type: "node",
      windows: {
        program: "${workspaceFolder}/node_modules/mocha/bin/_mocha"
      }
    });
  }
}
