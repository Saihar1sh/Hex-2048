import HexManager from "./hex-grid-generator";
import NumTile from "./num-tile";
import Player from "./player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HexTile extends cc.Component {

    index: cc.Vec2 = cc.Vec2.ZERO;

    sqrt3 :number =0;
    
    multiplier:  number = 90;


    occupiedTile : NumTile = null;

    occupied : boolean = false;

    private G : number = 0;
    private H : number = 0;

    get Hcost(): number { return this.H;}
    get Gcost(): number { return this.G;}
    

    get Fcost(): number { return this.G + this.H; }

    neighbours: HexTile[] = [];


    private connection: HexTile = null;

    pathTile: HexTile = null;

    get ConnectionTile(): HexTile { return this.connection;}


    Init(_index: cc.Vec2)
    {

        this.sqrt3 = Math.sqrt(3);
        this.index.x = _index.x;
        this.index.y = _index.y;
        
        this.name = + this.index.x+" "+this.index.y;
        let pos = cc.Vec2.ZERO;

        pos.x = (this.index.y *1.5)*this.multiplier;
        pos.y = (this.index.x *this.sqrt3 + this.index.y * this.sqrt3/2)*this.multiplier;
        this.node.setPosition(pos);

        this.node.on(cc.Node.EventType.MOUSE_DOWN,(e)=>this.onMouseDown(e));

    }
    setOccupiedTile(numTile:NumTile)
    {
        if(this.occupied)
        {
            console.log("there is a node occupying this space");
            return null;
        }
        this.occupiedTile = numTile;
        this.occupied = true;
        HexManager.Instance.UpdateUnoccupiedTiles(1,this);
    }
    removeOccupiedTile()
    {
        this.occupiedTile = null;
        this.occupied = false;
        HexManager.Instance.UpdateUnoccupiedTiles(0,this);
    }

    setG(val: number)
    {
        this.G = val;
    }
    setH(val: number)
    {
        this.H = val;
    }

    SetConnection(hexTile: HexTile)
    {
        this.connection = hexTile;
    }

    CacheNeighbours() 
    {
        this.neighbours = this.getNeighbours(this.index);
    }

    onMouseDown(e: any)
    {
        //for testing
        if(e.getButton()== cc.Event.EventMouse.BUTTON_RIGHT)
        {
            console.log("Index: "+this.index+" "+this.occupied);
            return;
        }
        else if(e.getButton()== cc.Event.EventMouse.BUTTON_LEFT)
        {
            HexManager.Instance.setCurrentSelectedTile(this);
        }
        console.log("Pressed")

        //setting start node and target node (need to change)
        if(Player.Instance.GetDestNodes().length == 0 && this.occupied)
            Player.Instance.GetDestNodes().push(this);
        else if(Player.Instance.GetDestNodes().length > 0 )
            Player.Instance.assignTargetNode(this);

    }
    
    getNeighbours(index: cc.Vec2): HexTile[]
    {
        let hexTiles : HexTile[] = [];
        HexManager.Instance.tiles.forEach((tile)=>
        { 
            tile.AxialLength(index) == 1 ? hexTiles.push(tile): null;
        });
        return hexTiles;
    }

    AxialLength(otherIndex: cc.Vec2) : number
    {
        let _q = this.index.x - otherIndex.x;
        let _r = this.index.y - otherIndex.y;

        if (_q == 0 && _r == 0) return 0;
        if (_q > 0 && _r >= 0) return _q + _r;
        let b = -_q < _r;
        if (_q <= 0 && _r > 0) return b ? _r : -_q;
        if (_q < 0) return -_q - _r;
        let bool = -_r > _q;
        return  bool? -_r : _q;
    }

}
