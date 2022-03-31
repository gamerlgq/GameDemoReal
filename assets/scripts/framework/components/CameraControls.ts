/*
 * @Author: liuguoqing
 * @Date: 2021-07-31 18:10:21
 * @LastEditors: liuguoqing
 * @LastEditTime: 2021-08-06 16:50:20
 * @Description: file content
 */

import { Animation, Camera, Canvas, Component, find, lerp, Node, Size, UITransform, Vec2, Vec3, view, _decorator } from "cc";

const {ccclass, property} = _decorator;

@ccclass("CameraControls")
export default class CameraControls extends Component {

    @property({type:Node,tooltip:"镜头跟随的target"})
    target: Node = null;

    @property(Camera)
    camera: Camera = null;

    @property(Animation)
    anim:Animation = null;

    @property({tooltip:"角色跳跃后缩放镜头视野"})
    jumpZoom:boolean = false;

    @property({tooltip:"初始化时，镜头定位到跟随主角"})
    centerAtStart:boolean = false;

    @property({tooltip:"镜头跟随主角移动"})
    smoothFollow:boolean = false;

    @property({tooltip:"x轴：镜头相距主角多少距离才是跟随",visible(){
        return this.smoothFollow;
    }})
    followX:number = 0;

    @property({tooltip:"y轴：镜头相距主角多少距离才是跟随",visible(){
        return this.smoothFollow;
    }})
    followY:number = 0;

    @property({tooltip:"最小跟随距离，比这个值小就不跟随了",visible(){
        return this.smoothFollow;
    }})
    minFollowDist:number = 0;

    @property({tooltip:"差值比率[0~1],跟随平滑度",visible(){
        return this.smoothFollow;
    }})
    followRatio:number = 0;

    @property({tooltip:"镜头定位到多个目标的中间位置，总是可以观察到指定的观察目标"})
    overview:boolean = false;

    @property({type:[Node],tooltip:"要overview的目标数组",visible(){
        return this.overview;
    }})
    overviewTargets:Node[] = [];

    @property({tooltip:"overview视野的边缘",visible(){
        return this.overview;
    }})
    overviewMargin:number = 0;

    @property({tooltip:"镜头随着目标速度变化发生缩放"})
    speedZoom:boolean = false;

    @property({tooltip:"镜头zoom in的速度",visible () {
        return this.speedZoom;
    }})
    zoomInSpeed:number = 0

    @property({tooltip:"镜头zoom out的速度",visible () {
        return this.speedZoom;
    }})
    zoomOutSpeed:number = 0
    
    @property({tooltip:"镜头抖动"})
    canShake:boolean= false

    @property({tooltip:"镜头抖动持续时间", visible () {
        return this.canShake;
    }})
    shakeDuration:number = 0

    @property({tooltip:"触摸移动镜头视野"})
    pointerPan:boolean = false

    @property({tooltip:"x轴的距离乘数",visible () {
        return this.pointerPan;
    }})
    pointerXMult:number = 0 

    @property({tooltip:"y轴的距离乘数",visible () {
        return this.pointerPan;
    }})
    pointerYMult:number = 0 

    @property({tooltip:"视野的范围，超过了这个方位镜头不动"})
    useBoundaries:boolean = false

    @property({tooltip:"top的范围",visible () {
        return this.useBoundaries;
    }})
    topBound:number=0

    @property({tooltip:"down的范围",visible () {
        return this.useBoundaries;
    }})
    bottomBound:number=0
 
    @property({tooltip:"left的范围",visible () {
        return this.useBoundaries;
    }})
    leftBound:number=0

    @property({tooltip:"right的范围",visible () {
        return this.useBoundaries;
    }})
    rightBound:number=0

    private startFollow:boolean = null
    private visibleSize:Size = null
    private initZoomRatio:number = null
    private previousPos:Vec3 = null
    private pointerPos:Vec2 = null

    // LIFE-CYCLE CALLBACKS:
    onLoad () {

        this.startFollow = false;
        let canvas = find('Canvas').getComponent(Canvas); 
        this.visibleSize = view.getVisibleSize();
        this.initZoomRatio = this.camera.orthoHeight;
        
        //place camera on target if centerAtStart
        this.locateTarget();

        if (this.pointerPan) {
            // this.jumpZoom = false;
            this.overview = false;
            this.speedZoom = false;
            canvas.node.on('mousemove', this.onMouseMove, this);
            canvas.node.on('touchmove', this.onTouchMove, this);
            this.pointerPos = null;
        }

        if (this.overview) {
            this.jumpZoom = false;
            this.speedZoom = false;
        }

        if (this.speedZoom) {
            this.jumpZoom = false;
        }
    }

    lateUpdate(dt){
        if (!this.target){
            return;
        }

        let targetPos:Vec3;

        if (this.overview){
            targetPos = this.target.parent.getComponent(UITransform).convertToWorldSpaceAR(this.getOverviewTargetsMidpoint());
        } else {
            targetPos = this.target.parent.getComponent(UITransform).convertToWorldSpaceAR(this.target.position);
        }

        if (this.pointerPan && this.pointerPos) {
            let xDelta = this.pointerPos.x / (this.visibleSize.width/2) - 1;
            let yDelta = this.pointerPos.y / (this.visibleSize.height/2) - 1;
            xDelta *= this.pointerXMult;
            yDelta *= this.pointerYMult;
            targetPos = targetPos.add(new Vec3(xDelta, yDelta));
        }

        //smooth follow
        if (this.smoothFollow) {
            if (Math.abs(targetPos.x - this.node.position.x) >= this.followX ||
                Math.abs(targetPos.y - this.node.position.y) >= this.followY) {//when camera and target distance is larger than max distance
                this.startFollow = true;
            }
            if (this.startFollow) {
                let cameraPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos);
                // log("===>cameraPos",cameraPos,targetPos);
                this.node.position = this.node.position.lerp(cameraPos,this.followRatio);
                if (Vec2.distance(targetPos, this.node.position) <= this.minFollowDist) {
                    this.startFollow = false;
                }
            }
        } else {
            let cameraPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos);
            this.node.position = cameraPos;
        }

        //speed zoom
        if (this.speedZoom) {
            let curSpeed = Math.abs(this.previousPos.x - targetPos.x) / dt;
            let ratio = 0;
            if (curSpeed > this.zoomOutSpeed) {
                ratio = 1 - (curSpeed - this.zoomOutSpeed) / (this.zoomInSpeed  - this.zoomOutSpeed);
                this.camera.orthoHeight = lerp(this.camera.orthoHeight, ratio, 0.02);
            } else {
                this.camera.orthoHeight = lerp(this.camera.orthoHeight, this.initZoomRatio, 0.02);
            }
        }

        this.previousPos = targetPos;
        
        //jump zoom
        if (this.jumpZoom) {
            let ratio = targetPos.y / view.getVisibleSize().height;
            this.camera.orthoHeight = 1 + (0.6 - ratio) * 0.35;
        }

        //boundaries

        if (this.useBoundaries) {
            let width = (this.visibleSize.width/2) / this.camera.orthoHeight;
            let height = (this.visibleSize.height/2) / this.camera.orthoHeight;
            let minX = this.node.position.x - width;
            let maxX = this.node.position.x + width;  
            let minY = this.node.position.y - height;
            let maxY = this.node.position.y + height;
            if (minX < this.leftBound) {
                this.node.setPosition(this.leftBound + width,this.node.position.y);
            }
            if (minY < this.bottomBound) {
                this.node.setPosition(this.node.position.x,this.bottomBound + height);
            }
            if (maxX > this.rightBound) {
                this.node.setPosition(this.rightBound - width,this.node.position.y);
            }
            if (maxY > this.topBound) {
                this.node.setPosition(this.node.position.x,this.topBound - height);
            }
        }
    }

    getOverviewTargetsMidpoint () {
        let midPoint = Vec3.ZERO;
        let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
        for (let i = 0; i < this.overviewTargets.length; ++i) {
            let target = this.overviewTargets[i];
            maxX = target.position.x > maxX ? target.position.x : maxX;
            minX = target.position.x < minX ? target.position.x : minX;
            maxY = target.position.y > maxY ? target.position.y : maxY;
            minY = target.position.y < minY ? target.position.y : minY;
        }
        maxX += this.overviewMargin;
        minX -= this.overviewMargin;
        maxY += this.overviewMargin;
        minY -= this.overviewMargin;
        let distX = Math.abs(maxX - minX);
        let distY = Math.abs(maxY - minY);
        midPoint = new Vec3(minX + distX/2, minY + distY/2);
        let ratio = Math.max(distX / this.visibleSize.width, distY / this.visibleSize.height);
        this.camera.orthoHeight = 1/ratio;
        return midPoint;
    }

    shakeCamera () {
        if (!this.canShake) return;
        this.anim.play('shake');
        this.scheduleOnce(this.stopShake.bind(this), this.shakeDuration);
    }

    stopShake () {
        this.anim.stop();
        this.camera.node.position = Vec3.ZERO;
    }

    onMouseMove (event) {
        this.pointerPos = event.getLocation();
    }

    onTouchMove (event) {
        this.pointerPos = event.getLocation();
    }    

    public locateTarget(){
        if (!this.target) {
            return;
        }
        if (this.centerAtStart) {
            let targetPos = this.target.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            let cameraPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos);
            this.node.position = cameraPos;
        }
        this.previousPos = this.node.position;
    }
}
