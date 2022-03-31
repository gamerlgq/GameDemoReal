/**
 * 生产角色spine工厂方法
 */

import { instantiate, Node, Prefab } from "cc";
import { ResourcesLoader } from "../../../../framework/data/ResourcesLoader";
import { viewRegisterMgr } from "../../../define/ViewRegisterMgr";
import { HeroSpineNode, MonsterSpineNode, SpineNodeBase } from "./SpineNodeBase";

// 工厂方法
const factory = <T extends typeof SpineNodeBase>(cls: T, node:Node) =>
    new cls(node) as InstanceType<T>;

export class RoleSpineFactory {
    /**
     * 
     * @param cls 类型 HeroSpineNode or MonsterSpineNode 继承SpineNodeBase
     * @param id number
     * @returns 异步函数
     * @example 
     * onLoad(){
     *    this._loadAttackers();
     * }
     * 
     * private async _loadAttackers(){
     *     let node = await RoleSpineFactory.create(HeroSpineNode,heroId);  
     *     this.node.addChild(node); 
     * }
     */
    public static async create<T extends typeof SpineNodeBase>(cls:T,id:number){
        let node = await RoleSpineFactory._loadPromise(id);
        return factory(cls,node);        
    }

    private static async _loadPromise(id:number):Promise<Node>{
        let info = viewRegisterMgr.getViewInfo("hero","HeroSpinePrefab");
        let file = info.Path + id.toString();
        let prefab:Prefab = await ResourcesLoader.loadPromise(file,Prefab);
        let spineNode = instantiate(prefab);
        return spineNode;
    }
}