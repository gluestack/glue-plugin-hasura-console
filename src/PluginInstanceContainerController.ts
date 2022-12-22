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
      `http://localhost:${containerController.getPortNumber()}`,
      "--admin-secret",
      env.HASURA_GRAPHQL_ADMIN_SECRET,
      "--console-port",
      this.getPortNumber().toString(),
      "--api-port",
      this.getApiPortNumber().toString(),
    ];
  }

  getDockerJson() {
    return {};
  }

  getStatus(): "up" | "down" {
    return this.status;
  }

  getPortNumber(returnDefault?: boolean): number {
    if (this.portNumber) {
      return this.portNumber;
    }
    if (returnDefault) {
      return 8090;
    }
  }

  getApiPortNumber(returnDefault?: boolean): number {
    if (this.apiPortNumber) {
      return this.apiPortNumber;
    }
    if (returnDefault) {
      return 9690;
    }
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

      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("port_number") ||
        [];
      let apiPorts =
        this.callerInstance.callerPlugin.gluePluginStore.get(
          "api_port_number",
        ) || [];

      await new Promise(async (resolve, reject) => {
        DockerodeHelper.getPort(this.getPortNumber(true), ports).then(
          (port: number) => {
            this.setPortNumber(port);
            DockerodeHelper.getPort(this.getApiPortNumber(true), apiPorts)
              .then(async (apiPort: number) => {
                this.setApiPortNumber(apiPort);
                console.log("\x1b[33m");
                console.log(
                  `${this.callerInstance.getName()}: Running "${(
                    await this.hasuraConsole()
                  ).join(" ")}"`,
                  "\x1b[0m",
                );
                SpawnHelper.start(
                  this.callerInstance
                    .getGraphqlInstance()
                    .getInstallationPath(),
                  await this.hasuraConsole(),
                )
                  .then(({ processId }: { processId: string }) => {
                    this.setStatus("up");
                    this.setContainerId(processId);
                    ports.push(port);
                    apiPorts.push(apiPort);
                    this.callerInstance.callerPlugin.gluePluginStore.set(
                      "ports",
                      ports,
                    );
                    this.callerInstance.callerPlugin.gluePluginStore.set(
                      "api_port_number",
                      apiPorts,
                    );

                    console.log("\x1b[32m");
                    console.log(
                      `Open http://localhost:${this.getPortNumber()}/ in browser`,
                    );

                    console.log("\x1b[0m");
                    console.log("\x1b[36m");
                    console.log(`Connect Database`);
                    console.log();
                    console.log(`Database URL:`);

                    console.log(
                      `${this.callerInstance
                        .getGraphqlInstance()
                        .getPostgresInstance()
                        .getConnectionString()}`,
                    );

                    console.log("\x1b[0m");
                    return resolve(true);
                  })
                  .catch((err: any) => {
                    reject(err);
                  });
              })
              .catch((err: any) => {
                reject(err);
              });
          },
        );
      });
    }
  }

  async down() {
    if (this.getStatus() !== "down") {
      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
      let apiPorts =
        this.callerInstance.callerPlugin.gluePluginStore.get(
          "api_port_number",
        ) || [];

      await new Promise(async (resolve, reject) => {
        DockerodeHelper.down(
          this.getContainerId(),
          this.callerInstance.getName(),
        )
          .then(() => {
            this.setStatus("down");
            var index = ports.indexOf(this.getPortNumber());
            if (index !== -1) {
              ports.splice(index, 1);
            }
            this.callerInstance.callerPlugin.gluePluginStore.set(
              "ports",
              ports,
            );

            var apiIndex = apiPorts.indexOf(this.getApiPortNumber());
            if (apiIndex !== -1) {
              apiPorts.splice(apiIndex, 1);
            }
            this.callerInstance.callerPlugin.gluePluginStore.set(
              "api_port_number",
              apiPorts,
            );

            this.setPortNumber(null);
            this.setApiPortNumber(null);
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
