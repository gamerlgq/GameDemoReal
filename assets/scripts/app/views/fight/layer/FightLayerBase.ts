import { UITransform } from "cc";
import { ComponentBase } from "../../../../framework/ui/ComponentBase";
import { UIWidget } from "../../../../framework/ui/UIWidget";
import { FightMainWorld } from "../FightMainWorld";


export class FightLayerBase extends ComponentBase {

    _mainWorld:FightMainWorld = null

    onLoad(){
        this._mainWorld = this.node.parent as FightMainWorld;;
    }

    public startGame(){
        
    }

    public updateView(data:any) {
        
    }
}