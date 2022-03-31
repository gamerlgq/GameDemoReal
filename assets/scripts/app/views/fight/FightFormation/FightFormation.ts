
import { _decorator, Component, Node, Prefab, instantiate, find, EventTouch, Tween, tween, UITransform, Vec3, v3, director, AnimationManager } from 'cc';
import { sceneMgr } from '../../../../framework/core/SceneMgr';
import { LayerBase } from '../../../../framework/ui/LayerBase';
import { ViewProtocol } from '../../../define/ViewProtocol';
import { GeneralIconShowComp } from './GeneralIconShowComp';
const { ccclass, property } = _decorator;

class PosInfo
{
    node:Node;
    orgGeneralIcon:Node;
}
 
@ccclass('FightFormation')
export class FightFormation extends LayerBase {
    @property(Node)
    listContainer:Node;

    @property(Prefab)
    rewardItemIconPrefab:Prefab;

    private _posList:PosInfo[] = [];
    private _upPosMap:Map<Node, PosInfo> = new Map;

    start () {
        // [3]
        this._init();
    }

    private async _init() {
        // let path = viewRegisterMgr.getViewInfo("commonUI","RewardItemIcon").Path
        // this._rewardItemIconPrefab = await ResourcesLoader.loadPromise(path)

        this._showGerneralIconListByType()
        this._initPosInfo()
    }
    
    private _initPosInfo() {
        for (let index = 0; index < 5; index++) {
            let posNode = find("bottom/pos_"+(index+1), this.node)
            let posInfo = new PosInfo
            posInfo.node = posNode
            this._posList.push(posInfo)
            this._upPosMap.set(posNode, posInfo)

            posNode.on(Node.EventType.TOUCH_END, this.onClickDown.bind(this))
        }
    }

    private onClickDown(event:EventTouch) {
        let target = event.target
        if (target.children.length > 0) {
            let posInfo = this._upPosMap.get(target)
            if (posInfo.orgGeneralIcon) {
                target.removeAllChildren()
                posInfo.orgGeneralIcon.getComponent(GeneralIconShowComp).isSel = false
                posInfo.orgGeneralIcon.getComponent(GeneralIconShowComp).isShowSelIcon = false
                posInfo.orgGeneralIcon = null
            }
        }
    }
    
    private _showGerneralIconListByType(){
        for (let index = 0; index < 20; index++) {
            let icon = instantiate(this.rewardItemIconPrefab)
            icon.addComponent(GeneralIconShowComp)
            this.listContainer.addChild(icon)
            icon.on(Node.EventType.TOUCH_END, this._onUp.bind(this) )
        }
    }

    //上阵
    private _onUp(event:EventTouch) {
        let node:Node = event.target
        let generalIconShowComp = node.getComponent(GeneralIconShowComp)

        if (!generalIconShowComp.isSel) {
            //寻找上阵位置

            let upPos:PosInfo
        for (const iterator of this._posList) {
                if (!iterator.orgGeneralIcon) {
                    upPos = iterator
                    break;
                }
            }
            if (upPos) {
                //可以上阵    
                generalIconShowComp.isSel = true
                upPos.orgGeneralIcon = node
                this._playMove(node, upPos.node,()=>{
                })
            }
        }
    }

    private _playMove(node:Node, targetNode:Node, endFunc:Function) {
        //复制一个目标
        let nodeTween = instantiate(node)
        let startPos = node.getComponent(UITransform).convertToWorldSpaceAR(v3(0,0,0))
        startPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(startPos)

        let endPos = targetNode.getComponent(UITransform).convertToWorldSpaceAR(v3(0,0,0))
        endPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(endPos)

        this.node.addChild(nodeTween)
        nodeTween.position = startPos
        tween(nodeTween).to(0.5,{position:endPos}).call(()=>{
            node.getComponent(GeneralIconShowComp).isShowSelIcon = true
            nodeTween.position=v3(0,0,0)
            targetNode.addChild(nodeTween)
            endFunc()
        }).start()
    }
    

    onClickStart() {
        sceneMgr.sendCreateView(ViewProtocol.TransLoadingLayer,[()=>{
            sceneMgr.popTableLayer();
            sceneMgr.sendCreateView(ViewProtocol.FightMainLayer);
        },()=>{}]);
    }
}