import { PluginInstance as GraphqlPluginInstance } from "@gluestack/glue-plugin-graphql/src/PluginInstance";

export interface IHasGraphqlInstance {
  getGraphqlInstance(): GraphqlPluginInstance;
}
