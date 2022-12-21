const prompts = require("prompts");
import { PluginInstance } from "./PluginInstance";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";

export const setGraphqlConfig = async (
  hasuraConsoleInstance: PluginInstance,
  graphqlInstance: PluginInstance,
) => {
  hasuraConsoleInstance.gluePluginStore.set(
    "graphql_instance",
    graphqlInstance.getName(),
  );
  return hasuraConsoleInstance.gluePluginStore.get("graphql_instance");
};

async function selectGraphqlInstance(graphqlInstances: IInstance[]) {
  const choices = graphqlInstances.map((instance: PluginInstance) => {
    return {
      title: `${instance.getName()}`,
      description: `Will attach graphql "${instance.getName()}"`,
      value: instance,
    };
  });
  const { value } = await prompts({
    type: "select",
    name: "value",
    message: "Select an instance",
    choices: choices,
  });

  return value;
}

export async function attachGraphqlInstance(
  hasuraConsoleInstance: PluginInstance,
  graphqlInstances: IInstance[],
) {
  const instance = await selectGraphqlInstance(graphqlInstances);
  if (instance) {
    await setGraphqlConfig(hasuraConsoleInstance, instance);
  }
}
