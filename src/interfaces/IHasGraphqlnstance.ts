import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IHasContainerController from "@gluestack/framework/types/plugin/interface/IHasContainerController";

export interface IHasGraphqlInstance {
  getGraphqlInstance(): IInstance & IHasContainerController;
}
