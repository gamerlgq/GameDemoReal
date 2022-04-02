
import { _decorator, Component, Node, RichText, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightDialogUI')
export class FightDialogUI extends Component {

    
    @property(RichText)
    lblDesc:RichText = null

    private _desc:string = null;

    public setDesc(desc:string){
        this._desc = desc;
    };

    start () {
        this.lblDesc.string = this._desc!;
    }

    show(){
        let ani = this.getComponent(Animation);
        ani.play();
    }

    onShowEffectEnd(){
        this.node.removeFromParent();
    }
}