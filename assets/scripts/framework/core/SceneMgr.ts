
import { Asset, find, instantiate, log, Node, Prefab, resources, UIOpacity, UITransform, Widget, widgetManager } from "cc";
import { ShowBackgroundMgr } from "../../app/define/ShowBackgroundMgr";
import { viewRegisterMgr } from "../../app/define/ViewRegisterMgr";
import { MainEventTrigger } from "../../app/views/common/MainEventTrigger";
import { TouchEffect } from "../../app/views/common/TouchEffect";
import { TouchMain } from "../../app/views/common/TouchMain";
import { Singleton } from "../components/Singleton";
import { ResourcesLoader } from "../data/ResourcesLoader";
import { viewEventMgr } from "../listener/EventMgr";
import { Message } from "../listener/Message";
import { TableLayer } from "../ui/TableLayer";
import { setNodeVisible } from "../utils/functions";
import { sceneTriggerMgr } from "../utils/SceneTriggerMgr";
// import { functions, ShowBackgroundMgr, Message, TableLayer, viewEventMgr } from "../yy";

class SceneMgr extends Singleton {
    _layerMap: Map<string, Node>;
    _tableLayerStack: Array<TableLayer>;
    _viewIndex: number = 0;


    // 构造函数
    private constructor() {
        super();
    }

    init() {
        this._layerMap = new Map();
        this._tableLayerStack = [];
        this.initAllScence();
        this._initTouchGroup()
    }

    clear() {
        this.clearAllScence();
        sceneMgr = null;
    }

    private createNode(flag: string, parent?: Node): Node {
        let node = new Node
        node.name = flag

        let widget = node.addComponent(Widget)
        // let rootNode = find("Canvas");
        widget!.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        widget!.alignFlags = widgetManager.AlignFlags.HORIZONTAL | widgetManager.AlignFlags.VERTICAL;
        // widget!.target = rootNode;
        widget!.left = 0;
        widget!.right = 0;
        widget!.bottom = 0;
        widget!.top = 0;
        // widget.target = rootNode


        let viewRoot = find("Canvas/views")
        viewRoot.addChild(node)

        return node
    }

    private initAllScence() {
        this._layerMap.set("MainGroup", this.createNode("__MainGroup")); // 主界面层
        this._layerMap.set("TableGroup", this.createNode("__TableGroup")); // 页卡层
        this._layerMap.set("MainEventTrigger", this.createNode("__MainEventTrigger")); // 全局事件触发层
        this._layerMap.set("TransitionGroup", this.createNode("__TransitionGroup")); // 过渡层
        this._layerMap.set("NewGuideGroup", this.createNode("__NewGuideGroup")); // 新手引导层
        this._layerMap.set("DialogGroup", this.createNode("__DialogGroup")); // 对话框层
        this._layerMap.set("SystemOpenGroup", this.createNode("__SystemOpenGroup")); // 功能开启层
        this._layerMap.set("PreLoadingGroup", this.createNode("__PreLoadingGroup")); // 加载层
        this._layerMap.set("TipsGroup", this.createNode("__TipsGroup")); // 弹出提示
        this._layerMap.set("NetLoading", this.createNode("__NetLoading")); // 网络转圈层
        this._layerMap.set("TouchGroup", this.createNode("__TouchGroup")); // 触摸反馈
    }

    private _initTouchGroup() {
        this._layerMap.get("TouchGroup").addComponent(TouchMain)
    }

    private clearAllScence() {
        let layers = [
            "MainGroup",
            "TableGroup",
            "MainEventTrigger",
            "TransitionGroup",
            "NewGuideGroup",
            "DialogGroup",
            "SystemOpenGroup",
            "PreLoadingGroup",
            "TipsGroup",
            "NetLoading",
            "TouchGroup",
        ];
        for (let index = 0; index < layers.length; index++) {
            const element = layers[index];
            let layer = this._layerMap.get(element);
            layer.removeFromParent();
            layer.destroy();
        }
    }

    /**
     * @description: 检查当前场景列表是否存在某个界面
     * @param {string}
     * @return {[boolean, Node]}
     */
    public checkLayerWithName(pClassName: string): any {
        let layerList = this.getCurLayerList();
        for (let index = 0; index < layerList.length; index++) {
            const data = layerList[index];
            if (data.name == pClassName) {
                return [true, data];
            }
        }
        return [false];
    }

    /**
     * @description: 获取当前场景列表
     * @param {null}
     * @return {Array<Node>}
     */
    public getCurLayerList() {
        let curLayerList = this.updataCurLayerList();
        return curLayerList;
    }

    /**
     * @description:获取当前最高层
     * @param {null}
     * @return {Node}
     */
    public getCurFrontLayer() {
        let SceneList = this.getCurLayerList();
        return SceneList[SceneList.length - 1];
    }

    /**
     * @description: 新建一个Table层 (三层)
     * @param {type}
     * @return {type}
     */
    pushNewTableLayer(): TableLayer {
        this._viewIndex += 1;
        let tableLayer = new TableLayer();
        tableLayer.name = "TableLayer" + this._viewIndex;
        this._layerMap.get("TableGroup").addChild(tableLayer);
        this._tableLayerStack.push(tableLayer);
        return tableLayer;
    }

    /**
     * @description:叠加子页卡内容层
     * @param {type}
     * @return {type}
     *  @deprecated
     */
    appendTabSubContent(layer: Node) {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        if (tableLayer == null) {
            tableLayer = this.pushNewTableLayer();
        }
        tableLayer.appendSubContent(layer);

        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    /**
     * @description: 弹出子页卡内容层中的最上层
     * @param {type}
     * @return {type}
     *  @deprecated
     */
    popTabSubContent() {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        if (tableLayer != null) {
            let isRemove = tableLayer.popSubContent();
            if (tableLayer.isEmpty()) {
                this.removeTableLayer();
            }
            return isRemove;
        }

        return false;
    }

    /**
     * @description: 弹出子页卡内容层中的最上层,如果没有则不处理，不会弹出住页卡
     * @param {type}
     * @return {type}
     *  @deprecated
     */
    popTabSubContentWithoutEmpty() {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        if (tableLayer != null) {
            let isRemove = tableLayer.popSubContent();
            return isRemove;
        }
        return false;
    }

    /**
     * @description: 获取最上层的 TableLayer
     * @param {type}
     * @return {type}
     */
    getTopTableLayer() {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        return tableLayer;
    }

    /**
     * @description: 弹出一个Table层
     * @param {type}
     * @return {type}
     */
    popTableLayer() {
        this.removeTableLayer();
    }

    /**
     * @description: 清空顶层页卡层
     * @param {type}
     * @return {type}
     */
    removeTableLayer() {
        let tableLayer = this._tableLayerStack.pop();
        if (tableLayer) {

            //移除引用
            let contentLayer = tableLayer.getContentLayer()
            this._decResRef(contentLayer.name)

            tableLayer.removeFromParent();
            tableLayer.destroy();

            this._hideTableLayer();

            //场景触发
            sceneTriggerMgr.check()

            //检查内存释放
            if (ResourcesLoader.checkNeedToRelease()) {
                ResourcesLoader.releaseUnusedAssets()
            }
            return true;
        }
        return false;
    }

    removeTableLayerWithName(pViewName, isContain) {
        let xdata = this.checkLayerWithName(pViewName);
        if (xdata[0] == false) {
            return;
        }

        let layerList = this.getCurLayerList();

        for (let index = layerList.length - 1; index >= 0; index--) {
            const data = layerList[index];
            if (data.name == pViewName) {
                if (isContain) {
                    this.popTableLayer();
                    return;
                }
            } else {
                this.popTableLayer();
            }
        }
    }

    /**
     * @description: 清空全部页卡层
     * @param {type}
     * @return {type}
     */
    removeAllTableLayer() {
        let length = this._tableLayerStack.length;
        for (let index = 0; index < length; index++) {
            // if (this._tableLayerStack.length >= 2) {
            //     let tableLayer = this._tableLayerStack.pop();
            //     tableLayer.removeFromParent();
            //     tableLayer.destroy();
            // } else {
                this.removeTableLayer();
            // }
        }
    }

    /**
     * @description: 替换页卡UI层
     * @param {type}
     * @return {type}
     */
    replaceTableUIContent(layer, layerName: string) {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        if (tableLayer == null) {
            tableLayer = this.pushNewTableLayer();
        }
        let uiLayer = tableLayer.getUILayer();
        if (this.checkLayerWithName(layerName)[0] == true) {
            if (uiLayer.children.length == 0) {
                this.popTableLayer();
            }
            return;
        }
        uiLayer.removeAllChildren();
        uiLayer.name = layerName || "";
        uiLayer.addChild(layer);
        this._hideTableLayer();

        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    /**
     * @description: 替换页卡背景层
     * @param {type}
     * @return {type}
     *  @deprecated
     */

    replaceTableBg(layer: Node, layerName: string) {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        if (tableLayer == null) {
            tableLayer = this.pushNewTableLayer();
        }

        let bgLayer = tableLayer.getBgLayer();
        if (this.checkLayerWithName(layerName)[0] == true) {
            if (bgLayer.children.length == 0) {
                this.popTableLayer();
            }
            return;
        }
        bgLayer.name = layerName || "";
        bgLayer.removeAllChildren();
        bgLayer.addChild(layer);
        this._hideTableLayer();

        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    addMainEventTrigger() {
        this._layerMap.get("MainEventTrigger").addComponent(MainEventTrigger)
    }
    /**
     * @description: 替换页卡内容层
     * @param {type}
     * @return {type}
     */
    replaceTableContent(layer: Node, layerName: string) {
        let tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];

        if (tableLayer == null) {
            tableLayer = this.pushNewTableLayer();
        }

        let contentLayer = tableLayer.getContentLayer();

        // 判断是否重复打开
        if (this.checkLayerWithName(layerName)[0] == true) {
            if (contentLayer.isEmpty()) {
                this.popTableLayer();
            }
            return;
        }

        //移除引用
        this._decResRef(contentLayer.name)
        this._addResRef(layerName)
        contentLayer.name = layerName || "";
        contentLayer.clearAll();
        contentLayer.add(layer);
        contentLayer.show();

        this._hideTableLayer();

        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
        return tableLayer;
    }

    /**
     * @description: 追加页卡内容层
     * @param {type}
     * @return {type}
     */
    appendTableContent(layer, tableLayer?) {
        if (tableLayer == null) {
            tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        }

        let contentLayer = tableLayer.getContentLayer();
        contentLayer.add(layer);
        this._hideTableLayer();
        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    /**
     * @description: 切换页卡内容层
     * @param {type}
     * @return {type}
     */
    switchTableContent(index, tableLayer) {
        if (tableLayer == null) {
            tableLayer = this._tableLayerStack[this._tableLayerStack.length - 1];
        }

        let contentLayer = tableLayer.getContentLayer();
        contentLayer.switch(index);
        contentLayer.show();

        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    // public setSkipHiddenBackgroundList(list) {
    //     this._skipHiddenBackground = list;
    // }

    public replaceMainLayer(layer: Node, layerName: string) {
        this.removeAllTableLayer();
        let mainLayer = this._layerMap.get("MainGroup");
        for (let i = 0; i < mainLayer.children.length; i++) {
            const c = mainLayer.children[i];
            c.removeFromParent();
            c.destroy();
        }

        layer.name = layerName || "";
        mainLayer.addChild(layer);

        this._clearAllResCount()
        
        //主界面引用+1
        this._addResRef(layerName)

        sceneTriggerMgr.check()
        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }
    }

    //一个资源添加引用计数
    private _addResRef(name: string) {
        ResourcesLoader.addResRef(name);
    }

    //删除一个资源引用计数
    private _decResRef(name: string) {
        ResourcesLoader.decResRef(name);
    }


    //清除动态加载的引用
    private _clearAllResCount() {
        ResourcesLoader.clearAllRef()
    }

    getNowMainLayer() {
        let mainLayer = this._layerMap.get("MainGroup");
        let layer = mainLayer.children[0];
        return layer;
    }

    /**
     * @description 添加过渡界面
     * @param transloadinglayer 
     */
    addTransitionLayer(transloadinglayer:Node) {
        this._layerMap.get("TransitionGroup").addChild(transloadinglayer);
    }

    /**
     * @description 移除过渡界面
     */
    removeTransitionLayer(){
        let children = this._layerMap.get("TransitionGroup").children;
        if (children.length > 0){
            children.forEach((node:Node)=>{
                node.removeFromParent();
                node.destroy();
            })
        }
    }
    /**
     * @description: tips层
     * @param {*} tips_layer
     * @return {*}
     */
    appendTips(tipsLayer) {
        this._layerMap.get("TipsGroup").addChild(tipsLayer);
    }

    getTipsLayer() {
        return this._layerMap.get("TipsGroup");
    }

    replaceDialog(layer) {
        this._layerMap.get("DialogGroup").addChild(layer);
        // let newGuideModel = GameMgr.getInstance().getModel("ModelNewGuide");
        // if (newGuideModel) {
        //     newGuideModel.checkClearGuide();
        // }

        this._hideTableLayer();
    }

    removeDialog(isAll: boolean = false) {
        let childrens = this._layerMap.get("DialogGroup").children;
        for (let index = 0; index < childrens.length; index++) {
            const c = childrens[index];
            c.removeFromParent();
            c.destroy();

            if (!isAll) {
                break;
            }
        }

        this._hideTableLayer();
    }


    //功能开启监听层
    setSystemOpenLayer(layer) {
        let systemOpenGroup = this._layerMap.get("SystemOpenGroup");
        for (let index = 0; index < systemOpenGroup.children.length; index++) {
            const element = systemOpenGroup.children[index];
            element.removeFromParent();
            element.destroy();
        }
        if (layer) {
            systemOpenGroup.addChild(layer);
        }
    }

    getSystemOpenLayer() {
        return this._layerMap.get("SystemOpenGroup").children[0];
    }

    //新手引导层
    setNewGuideLayer(layer) {
        let group = this._layerMap.get("NewGuideGroup");
        for (let index = 0; index < group.children.length; index++) {
            const element = group.children[index];
            element.removeFromParent();
            element.destroy();
        }
        if (layer) {
            group.addChild(layer);
        }
    }

    getNewGuideLayer() {
        return this._layerMap.get("NewGuideGroup").children[0];
    }

    //加载层
    setPreLoadingLayer(layer) {
        let group = this._layerMap.get("PreLoadingGroup");
        for (let index = 0; index < group.children.length; index++) {
            const element = group.children[index];
            element.removeFromParent();
            element.destroy();
        }
        if (layer) {
            group.addChild(layer);
        }
    }

    getPreLoadingLayer() {
        return this._layerMap.get("PreLoadingGroup").children[0];
    }


    // 添加触摸反馈层
    addTouchGroupLayer(layer) {
        let group = this._layerMap.get("TouchGroup");
        if (layer) {
            group.addChild(layer);
        }
    }

    // 获取所有触摸返回层
    getTouchGroupLayer() {
        let group = this._layerMap.get("TouchGroup");
        return group;
    }

    /**
     * @description: Table游戏层操作: 隐藏低层次的层
     * @param {type}
     * @return {type}
     */
    private _hideTableLayer() {

        // 遍历所有子节点
        let nextCanVisible = 0;
        let isBreakOut = false;

        let LayerData = [];
        let showLayerName = "";
        let topLayerName = "";

        let dialogLayer = this._layerMap.get("DialogGroup");
        if (dialogLayer.children.length > 0) {
            if (topLayerName == "") {
                topLayerName = "DialogLayer";
            }

            showLayerName = "DialogLayer";
            LayerData.push({
                name: "DialogLayer",
                visiable: true,
            });
        }

        let list = this._layerMap.get("TableGroup").children;
        for (let index = list.length - 1; index >= 0; index--) {
            let cellTable = <TableLayer>list[index];
            let cellLayerName = cellTable.getLayerName();
            if (topLayerName == "") {
                topLayerName = cellLayerName;
            }

            // 有背景挡住，后面的都可以不显示
            if (isBreakOut) {
                // cellTable.opacity = 0;
                setNodeVisible(cellTable, false)
                cellTable.setContentLayerVisible(false);
                LayerData.push({
                    name: cellLayerName,
                    visiable: false,
                });
                continue;
            }

            // cellTable.opacity = 255;
            setNodeVisible(cellTable, true)
            cellTable.setContentLayerVisible(true);
            nextCanVisible = 0;

            showLayerName = cellLayerName;
            LayerData.push({
                name: cellLayerName,
                visiable: true,
            });

            let tableElementList = cellTable.children; //一个table层里面有4个子节点
            for (let k = 0; k < tableElementList.length; k++) {
                const tableElement = tableElementList[k];
                // 检查是否有屏蔽下一层标志
                // if (this._skipHiddenBackground[tableElement.name]) {
                if (ShowBackgroundMgr.checkIsShowBlackground(tableElement.name)) {
                    nextCanVisible = 1;
                }
            }

            // 如果背后已经挡住不显示
            if (nextCanVisible > 0) {
                isBreakOut = false;
            } else {
                isBreakOut = true;
            }

            continue;
        }

        let mainLayer = this._layerMap.get("MainGroup");

        if (mainLayer.children.length > 0) {
            let mainLayerName = mainLayer.children[0].name;
            if (topLayerName == "") {
                topLayerName = mainLayerName;
            }

            if (nextCanVisible > 0 || list.length == 0) {
                // mainLayer.opacity = 255;
                setNodeVisible(mainLayer, true)
                showLayerName = mainLayerName;
                LayerData.push({
                    name: mainLayerName,
                    visiable: true,
                });
            } else {
                // mainLayer.opacity = 0;
                setNodeVisible(mainLayer, false)
                LayerData.push({
                    name: mainLayerName,
                    visiable: false,
                });
            }
        }

        // let msg = new SFMessage(-9999999, {
        //     topShow: topLayerName,
        //     lastShow: showLayerName,
        //     layerList: LayerData,
        // });
        // MsgEventMgr.getInstance().dispatchEvent(msg);
    }

    private getCellLayer(tableLayer: Node, tableList, zOrderIndex: number) {
        // 分3层
        let cellElementList = tableLayer.children;
        for (let index = 0; index < cellElementList.length; index++) {
            const cellElement = cellElementList[index];
            let cell = {};
            cell["obj"] = cellElement;
            cell["name"] = tableLayer.name;
            cell["zOrder"] = cellElement.getSiblingIndex() + zOrderIndex + index;
            tableList.push(cell);
        }
    }
    /**
     * @description: 更新当前场景列表
     * @param {type}
     * @return {type}
     */
    private updataCurLayerList() {
        // tabel层检查
        let curLayerList = [];

        this._tableLayerStack.forEach((tableLayer, i) => {
            this.getCellLayer(tableLayer.getBgLayer(), curLayerList, i * 100 + 1 * 10);
            this.getCellLayer(tableLayer.getContentLayer(), curLayerList, i * 100 + 2 * 10);
            this.getCellLayer(tableLayer.getUILayer(), curLayerList, i * 100 + 3 * 10);
            this.getCellLayer(tableLayer.getSubContent(), curLayerList, i * 100 + 4 * 10);
        });

        // 主界面检查
        this.getCellLayer(this._layerMap.get("MainGroup"), curLayerList, 10);

        // 跟新z轴排序
        curLayerList.sort((a: Node, b: Node) => {
            return a["zOrder"] - b["zOrder"];
        });
        return curLayerList;
    }

    public sendCreateView(UiFlag: number, data?: any) {
        log("send create view:" + UiFlag)
        let msg = new Message(UiFlag, data);
        viewEventMgr.dispatchEvent(msg);
    }

    /**
     * showNetLoading
     */
    public showNetLoading(isShow:boolean) {
        let netloading = this._layerMap.get("NetLoading").children[0]
        if (netloading) {
            netloading.active = isShow
            return
        }

        let viewInfo = viewRegisterMgr.getViewInfo("commonUI", "netloading");
        ResourcesLoader.loadWithViewInfo(viewInfo,(data:Prefab)=>{
            let node = instantiate(data)
            node.active = isShow
            this._layerMap.get("NetLoading").addChild(node)
        }, false)
    }
}


export let sceneMgr = (() => {
    return SceneMgr.getInstance<SceneMgr>();
})();