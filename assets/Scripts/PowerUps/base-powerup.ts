const {ccclass, property} = cc._decorator;

@ccclass
export default class PowerUp extends cc.Component 
{
    @property(cc.Button)
    powerUpBtn: cc.Button = new cc.Button();

    @property(cc.Label)
    usesLabel: cc.Label = null;

    normalColor: cc.Color = cc.color();
    pressedColor: cc.Color = cc.color();

    protected selected:boolean = false;

    set Uses(value: number)
    {
        this.uses = value;
        this.usesLabel.string = this.uses.toString();
    }

    private uses: number = 0;

    protected onLoad()
    {
        this.normalColor = this.powerUpBtn.normalColor;
        this.pressedColor = this.powerUpBtn.pressedColor;

        this.powerUpBtn = this.getComponent(cc.Button);

        this.powerUpBtn.node.on('click',()=>this.SelectThisPowerUp());
        console.log("540 base")
        // this.UseThisPowerup();
    }

    SelectThisPowerUp() //to be assigned to button on click event
    {
        this.selected = !this.selected;
        this.powerUpBtn.normalColor = this.selected? this.pressedColor: this.normalColor;
        this.Uses--;
    }

    protected UseThisPowerup?()
    {
        console.log("540 Sike");

        if(this.selected)
        {
            this.Uses--;
            this.selected = false;
        }
    }

    getCurrentStatus():boolean
    {
        return this.selected;
    }

    setNumOfUses(_uses:number)
    {
        this.Uses = _uses;
    }

}
