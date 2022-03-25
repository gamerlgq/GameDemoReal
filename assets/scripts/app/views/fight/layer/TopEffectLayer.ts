import { error, Node, tween } from "cc";
import { warn } from "console";
import { FightLayerBase } from "./FightLayerBase";

export class TopEffectLayer extends FightLayerBase {

    private _actionNode:Node = null;

    private _isPlayerTween:boolean = false;

    public init(){
        this._actionNode = new Node();
        this.node.addChild(this._actionNode);
    }

    public popActionNode():Node{
        if (this._isPlayerTween){
            error("this._actionNode:isPlayerTween return null!")
            return null
        }
        this._isPlayerTween = true;
        return this._actionNode;
    }

    public pushActionNode(){
        this._isPlayerTween = false
    }
}