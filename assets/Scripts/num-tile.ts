import HexTile from "./hex-tile";
import { NumTileData } from "./num-tile-generator";
import Player from "./player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NumTile extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    tileColor : cc.Color = cc.color(0,0,0);

    private value : number = 0;

    spriteSize: cc.Size = null;

    spawnTweenBool: boolean = false;
    selectTweenBool: boolean = false;

    set Value(val: number)
    {
        this.value = val;
        this.label.string = "" +val;
    }
    get Value(): number
    {
        return this.value;
    }

    protected start(): void 
    {
        this.spriteSize = this.node.getContentSize();
    }
    
    Init_Tile(numTileData: NumTileData, hexTile: HexTile)
    {
        this.Init_NumData(numTileData);
        this.OccupyHexTile(hexTile);
    }

    Enable(bool:boolean)
    {
        this.start();
        console.log("90 twee")
        this.node.active = bool;
        if(bool)
        {
            this.StartSpawnTween();
        }
    }


    private StartSpawnTween() 
    {
        let tweenHeight = this.spriteSize.height;

        cc.tween(this.node).to(0.1, { height: tweenHeight * 3/4 }, { easing: 'linear' }).
            to(.1, { height: tweenHeight }, { easing: 'linear' }).start();
    }
    StartSelectTween() 
    {
        if(this.selectTweenBool)
        return;

        this.selectTweenBool = true;
        let tweenScale = this.node.scale;
        let tweenTime = 0.15;
        cc.tween(this.node).to(tweenTime/2, { scale: tweenScale *5/4 }, { easing: 'linear' }).
            to(tweenTime/2, { scale: tweenScale }, { easing: 'linear' }).start();

        setTimeout(() => 
        {
            this.selectTweenBool = false
        }, tweenTime*1000);
    }

    OccupyHexTile(hexTile: HexTile) 
    {
        if (!hexTile)
        return;
    
        this.node.setParent(hexTile.node);
        this.node.scale = 1;
        this.node.setPosition(cc.Vec2.ZERO);
        this.Enable(true);

        hexTile.setOccupiedTile(this);
        
    }

    Init_NumData(numTileData: NumTileData,tileValueAboveLimit?:number)
    {
        if (!numTileData)
        return;

        this.Value = numTileData.value;
        this.node.color = numTileData.color;

        if (numTileData.value == 2048 && tileValueAboveLimit > 2048)
        {
            this.Value = tileValueAboveLimit;
        }
    }
}
