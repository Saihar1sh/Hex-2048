import HexManager from "../hex-grid-generator";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PowerUps extends cc.Component 
{
    undoBool:boolean = false;
    hammerBool:boolean = false;
    sameTileBool:boolean = false;
    BombBool:boolean = false;

    HammerPowerUp()
    {
        this.hammerBool = !this.hammerBool;
        HexManager.Instance.resetSelectedTile();
        HexManager.Instance.canHammerPower = this.hammerBool;
    }
    SameTilePowerUp()
    {
        this.sameTileBool = !this.sameTileBool;

        HexManager.Instance.resetSelectedTile();
        HexManager.Instance.canSameTilePower = this.sameTileBool;
    }
    BombPowerUp()
    {
        this.BombBool = !this.BombBool;

        HexManager.Instance.resetSelectedTile();
        HexManager.Instance.canBombPower = this.BombBool;
    }
}
