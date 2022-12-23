const { SpawnHelper, DockerodeHelper } = require("@gluestack/helpers");
import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";
import { PluginInstance } from "./PluginInstance";

export class PluginInstanceContainerController implements IContainerController {
  app: IApp;
  status: "up" | "down" = "down";
  portNumber: number;
  containerId: string;
  dockerfile: string;
  callerInstance: PluginInstance;
  apiPortNumber: number;

  constructor(app: IApp, callerInstance: PluginInstance) {
    this.app = app;
    this.callerInstance = callerInstance;
    this.setStatus(this.callerInstance.gluePluginStore.get("status"));
    this.setPortNumber(this.callerInstance.gluePluginStore.get("port_number"));
    this.setApiPortNumber(
      this.callerInstance.gluePluginStore.get("api_port_number"),
    );
    this.setContainerId(
      this.callerInstance.gluePluginStore.get("container_id"),
    );
  }

  getCallerInstance(): IInstance {
    return this.callerInstance;
  }

  getEnv() {}

  async hasuraConsole() {
    const containerController = this.callerInstance
      .getGraphqlInstance()
      .getContainerController();
    const env = await containerController.getEnv();

    return [
      "hasura",
      "console",
      "--endpoint",
      `http://localhost:${await containerController.getPortNumber()}`,
      "--admin-secret",
      env.HASURA_GRAPHQL_ADMIN_SECRET,
      "--console-port",
      (await this.getPortNumber()).toString(),
      "--api-port",
      (await this.getApiPortNumber()).toString(),
    ];
  }

  getDockerJson() {
    return {};
  }

  getStatus(): "up" | "down" {
    return this.status;
  }

  //@ts-ignore
  async getPortNumber(returnDefault?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.portNumber) {
        return resolve(this.portNumber);
      }
      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
      DockerodeHelper.getPort(11690, ports)
        .then((port: number) => {
          this.setPortNumber(port);
          ports.push(port);
          this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);
          return resolve(this.portNumber);
        })
        .catch((e: any) => {
          reject(e);
        });
    });
  }

  async getApiPortNumber(returnDefault?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.apiPortNumber) {
        return resolve(this.apiPortNumber);
      }
      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("api_ports") || [];
      DockerodeHelper.getPort(10890, ports)
        .then((port: number) => {
          this.setApiPortNumber(port);
          ports.push(port);
          this.callerInstance.callerPlugin.gluePluginStore.set(
            "api_ports",
            ports,
          );
          return resolve(this.apiPortNumber);
        })
        .catch((e: any) => {
          reject(e);
        });
    });
  }
  getContainerId(): string {
    return this.containerId;
  }

  setStatus(status: "up" | "down") {
    this.callerInstance.gluePluginStore.set("status", status || "down");
    return (this.status = status || "down");
  }

  setPortNumber(portNumber: number) {
    this.callerInstance.gluePluginStore.set("port_number", portNumber || null);
    return (this.portNumber = portNumber || null);
  }

  setApiPortNumber(apiPortNumber: number) {
    this.callerInstance.gluePluginStore.set(
      "api_port_number",
      apiPortNumber || null,
    );
    return (this.apiPortNumber = apiPortNumber || null);
  }

  setContainerId(containerId: string) {
    this.callerInstance.gluePluginStore.set(
      "container_id",
      containerId || null,
    );
    return (this.containerId = containerId || null);
  }

  setDockerfile(dockerfile: string) {
    this.callerInstance.gluePluginStore.set("dockerfile", dockerfile || null);
    return (this.dockerfile = dockerfile || null);
  }

  getConfig(): any {}

  async up() {
    if (this.getStatus() !== "up") {
      if (!this.callerInstance.getGraphqlInstance()) {
        throw new Error(
          `No graphql instance attached with ${this.callerInstance.getName()}`,
        );
      }
      if (!this.callerInstance.getGraphqlInstance()?.getContainerController()) {
        throw new Error(
          `Not a valid graphql instance configured with ${this.callerInstance.getName()}`,
        );
      }
      if (
        this.callerInstance
          .getGraphqlInstance()
          ?.getContainerController()
          ?.getStatus() !== "up"
      ) {
        throw new Error(
          `Graphql is not up for instance ${this.callerInstance
            .getGraphqlInstance()
            .getName()}`,
        );
      }

      await new Promise(async (resolve, reject) => {
        console.log("\x1b[33m");
        console.log(
          `${this.callerInstance.getName()}: Running "${(
            await this.hasuraConsole()
          ).join(" ")}"`,
          "\x1b[0m",
        );
        SpawnHelper.start(
          this.callerInstance.getGraphqlInstance().getInstallationPath(),
          await this.hasuraConsole(),
        )
          .then(async ({ processId }: { processId: string }) => {
            this.setStatus("up");
            this.setContainerId(processId);
            await this.print();
            return resolve(true);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    } else await this.print();
  }

  async print() {
    console.log("\x1b[32m");
    console.log(
      `Open http://localhost:${await this.getPortNumber()}/ in browser`,
    );

    console.log("\x1b[0m");
    console.log("\x1b[36m");
    console.log(`Connect Database`);
    console.log();
    console.log(`Database URL:`);

    console.log(
      `${await this.callerInstance
        .getGraphqlInstance()
        .getPostgresInstance()
        .getConnectionString()}`,
    );

    console.log("\x1b[0m");
  }

  async down() {
    if (this.getStatus() !== "down") {
      await new Promise(async (resolve, reject) => {
        DockerodeHelper.down(
          this.getContainerId(),
          this.callerInstance.getName(),
        )
          .then(() => {
            this.setStatus("down");
            this.setContainerId(null);
            return resolve(true);
          })
          .catch((e: any) => {
            return reject(e);
          });
      });
    }
  }

  async build() {}
}
