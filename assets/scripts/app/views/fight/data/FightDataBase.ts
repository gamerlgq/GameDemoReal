import { JsonAsset } from "cc"

export class FightPlayerDataBase {

    // 玩家信息[玩家ID，玩家名字，玩家等级，是否为玩家，战力,...]
    private _info:any = null;

    constructor(params:any) {
        this._info = params;
    }

    getPlayerId():number{
        return this._info[0]??-1;
    }

    getPlayerName():string{
        return this._info[1]??"";
    }

    getPlayerLvl():number{
        return this._info[2]??-1;
    }

    getIsPlayer():boolean{
        return this._info[3]??false;
    }

    getPlayerBattleValue():number{
        return this._info[4]??-1
    }
}

export class FightFormationDataBase {
    // 玩家信息[阵位置索引,武将id,当前hp,总hp,武将战力,...]
    private _info:any = null;

    constructor(params:any) {
        this._info = params;
    }

    getFormationIndex():number{
        return this._info[0]??-1;
    }

    getHeroId():number{
        return this._info[1]??-1;
    }

    getHeroCurHp():number{
        return this._info[2]??-1;
    }

    getHeroTopHp():number{
        return this._info[3]??-1;
    }

    getHeroBattleValue():number{
        return this._info[4]??-1
    }
}

export class FightDataBase {
    
    private _fightData:any = null;

    // 对战双方信息
    private _attackData:FightPlayerDataBase = null;
    private _defendData:FightPlayerDataBase = null;

    // 对战布阵信息
    private _attackFormationData:Array<FightFormationDataBase> = new Array<FightFormationDataBase>();
    private _defendFormationData:Array<FightFormationDataBase> = new Array<FightFormationDataBase>();

    //p: 对战双方信息:p[0]攻方信息,p[1]守方信息
    // m:Array<number>对战布阵信息:m[0]攻方信息,m[1]守方信息
    //r:Array<number>//每回合描述[[大回合1的描述],...],每个大回合的行动描述[[行动1],...]
    //rl:number //战斗结果 0功方胜利 1守方胜利
    //t:number //战报类型
    constructor(data:JsonAsset) {
        let json = data.json;
        this._fightData = json;

        this._attackData = new FightPlayerDataBase(this._fightData!.p[0]);
        this._defendData = new FightPlayerDataBase(this._fightData!.p[1]);

        this._fightData!.m[0].forEach(element => {
            let data = new FightFormationDataBase(element);
            this._attackFormationData.push(data);
        });

        this._fightData!.m[1].forEach(element => {
            let data = new FightFormationDataBase(element);
            this._defendFormationData.push(data);
        });
        
    }

    /**
     * 
     * @returns 返回攻方玩家信息
     */
    public getAttackPlayerData():FightPlayerDataBase{
        return this._attackData;
    }

    /**
     * 
     * @returns 返回守方玩家信息
     */
    public getDefendPlayerData():FightPlayerDataBase{
        return this._defendData;
    }

    /**
     * 
     * @returns 返回攻方布阵信息
     */
    public getAttackFormationDatas():Array<FightFormationDataBase>{
        return this._attackFormationData;
    }

    /**
     * 
     * @returns 返回守方布阵信息
     */
    public getDefendFormationDatas():Array<FightFormationDataBase>{
        return this._defendFormationData;
    }

    /**
     * 
     * @returns 返回战斗结果
     */
    public getFightResult(){
        return this._fightData!.rl;  
    }

    /**
     * 
     * @returns 返回战报类型
     */
    public getFightReprotType(){
        return this._fightData!.t;        
    }

    /**
     * 
     * @returns 返回回合集合
     */
    public getRoundData():Array<Array<any>>{
        return this._fightData!.r;
    }
}