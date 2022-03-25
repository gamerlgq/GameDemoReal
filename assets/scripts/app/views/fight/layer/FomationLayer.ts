import { Asset, instantiate, Prefab, Vec3 } from "cc";
import { ResourcesLoader } from "../../../../framework/data/ResourcesLoader";
import { viewRegisterMgr } from "../../../define/ViewRegisterMgr";
import { FormationView } from "../../formation/FormationView";
import { FightLayerBase } from "./FightLayerBase";

export class FomationLayer extends FightLayerBase {

    private _fomationCom:FormationView = null;

    public async init(){
        let prefab = await this._loadPrefab();
        let node = instantiate(prefab);
        this.node.addChild(node);
        this._fomationCom = this.node.getComponentInChildren(FormationView);
    }

    private async _loadPrefab():Promise<Prefab> {
        let viewInfo = viewRegisterMgr.getViewInfo("formation","FormationView");
        return ResourcesLoader.loadPromise(viewInfo.Path,Prefab);
    }

    /**
     * 
     * @description 获取攻方部队索引值 (左)
     * @param index 部队所引致
     */
    public getAttackPosByIndex(index:number):Vec3{
        return this._fomationCom.getAttackPosByIndex(index);
    }
    
    /**
     * 
     * @description 获取守方部队索引值 (右)
     * @param index 部队所引致
     */
    public getDefendPosByIndex(index:number):Vec3{
        return this._fomationCom.getDefendPosByIndex(index);
    }
}