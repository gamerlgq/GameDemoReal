
import { _decorator, Component, Node, ProgressBar, Label, js, log } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('FightBloodUI')
export class FightBloodUI extends Component {

    @property(ProgressBar)
    progressBar:ProgressBar = null;

    @property(Label)
    lblBlood:Label = null;

    updateBlood(cur:number,top:number){
        let percent = cur / top;
        this.progressBar.progress = percent;
        this.lblBlood.setString(js.formatStr("%d/%d",cur,top));
    }
}
