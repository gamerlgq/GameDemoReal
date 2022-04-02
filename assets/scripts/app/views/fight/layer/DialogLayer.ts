import { log, Node, Vec3 } from "cc";
import { fightActionMgr } from "../action/FightActionMgr";
import { FightEvent } from "../event/FightEvent";
import { FightEventDataType } from "../event/FightEventDataType";
import { fightEventMgr } from "../event/FightEventMgr";
import { FightConstant } from "../FightConstant";
import { FightDialogUI } from "../ui/FightDialogUI";
import { FightLayerBase } from "./FightLayerBase";

export class DialogLayer extends FightLayerBase {
   
    public init(){
        this._initListeners();
    }

    private _initListeners() {
        fightEventMgr.addEventListener(FightConstant.FightEvent.Show_Dialog,this._showDialog.bind(this));
    }

    private _showDialog(event:FightEvent) {
        let data:FightEventDataType.Show_Dialog = event.getEventData();
        this.show(data.PrefabNode,data.Desc);
    }
    /**
     * 
     * @param dialog 预制体节点
     * @param desc 富文本描述
     */
    public show(dialog:Node,desc:string) {
        let com = dialog.getComponent(FightDialogUI);
        com.setDesc(desc);
        this.node.addChild(dialog);
        com.show();
    }
}