import EventsHandler, { EventTypes } from "./events-handler";
import HexTile from "./hex-tile";
import NumTile from "./num-tile";
import NumTileManager from "./num-tile-generator";
import PathFinding from "./pathfinding";
import Player from "./player";
import UndoHandler from "./PowerUps/undo-handler";
import Utils from "./utils";

const {ccclass, property} = cc._decorator;

@ccclass('HexTile-Data')
export class HexTileData
{
    isOccupied:boolean = false;
    valueStored: number = -1;
}

@ccclass
export default class HexManager extends cc.Component 
{
    @property(NumTileManager)
    numTileManager: NumTileManager = null;
    @property(UndoHandler)
    undoHandler: UndoHandler = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Integer)
    width: number = 5;

    @property(cc.Integer)
    height: number = 6;

    @property(cc.SpriteFrame)
    hexTileImg: cc.SpriteFrame= null;

    @property(cc.Prefab)
    hexTilePrefab : cc.Prefab = null;

    @property(cc.color)
    tileColor: cc.Color = cc.color(0,0,0);

    inColorTransition : boolean = false;
    
    canHammerPower : boolean = false;
    canSameTilePower : boolean = false;
    canBombPower : boolean = false;
    
    private currentSelectedHexTile: HexTile = null;
    
    merged:number = 0;

    mergeTilesBool:boolean = false;

    hexTilesToCheck: HexTile[] =[];
    hexTilesProcessed: Array<HexTile> =[];

    tiles : HexTile[] =[];
    unoccupiedTiles : HexTile[] =[];

    destNodes : HexTile[] = [];

    static Instance : HexManager = null;

    onLoad()
    {
        HexManager.Instance = this;
        for (let r = 0; r < this.width ; r++) {
            let rOffset = r >> 1;
            for (let q = -rOffset; q < this.height - rOffset; q++) 
            {
                let tile = cc.instantiate(this.hexTilePrefab);
                let hexTile = tile.getComponent(HexTile);
                tile.color = this.tileColor;
                hexTile.Init(cc.v2(q,r));

                //assigning created tile node to this node as child
                tile.parent = this.node;

                this.tiles.push(hexTile);
            }
        }

    }
    resetSelectedTile()
    {
        this.setCurrentSelectedTile(null);
    }
    setCurrentSelectedTile(hexTile:HexTile)
    {
        this.currentSelectedHexTile = hexTile;
        if(!hexTile)
        return;

        if(hexTile.occupied)
        {
            hexTile.occupiedTile.StartSelectTween();
            if(this.canHammerPower)
            {
                this.DisableNumTileAndRemoveOccupied(this.currentSelectedHexTile);
                console.log("hammer");
                this.canHammerPower = false;
            }
            if(this.canSameTilePower)
            {
                let value = this.currentSelectedHexTile.occupiedTile.Value
                this.tiles.forEach(tile=> 
                {
                    if(!tile.occupied)
                        return;

                    if(tile.occupiedTile.Value == value)
                    {
                        this.DisableNumTileAndRemoveOccupied(tile);
                    }
                })
                this.canSameTilePower = false;
            }
            if(this.canBombPower)
            {
                this.currentSelectedHexTile.neighbours.forEach(tile=> 
                {
                    this.DisableNumTileAndRemoveOccupied(tile);
                    console.log("inde: "+tile.index)
                });
                this.DisableNumTileAndRemoveOccupied(this.currentSelectedHexTile);
                this.canBombPower = false;
            }
        }
    }
    private DisableNumTileAndRemoveOccupied(hexTile:HexTile) 
    {
        this.numTileManager.NumTileReuseFromPool(hexTile.occupiedTile);
        hexTile.removeOccupiedTile();
    }

    getCurrentSelectedTile():HexTile
    {
        return this.currentSelectedHexTile;
    }

    getTiles()
    {
        return this.tiles.slice();
    }

    start () 
    {   
        this.tiles.forEach(tile=> {
            tile.CacheNeighbours();
            if(!tile.occupied)
                this.unoccupiedTiles.push(tile);
        });
        EventsHandler.Instance.addSubscribers(EventTypes.NextMove,()=> this.checkMergingPossible());
    }

    checkMergingPossible() 
    {
        setTimeout(() =>        
        {
            this.CheckingMergeIfPossible();

            if(this.merged == 0)
            {
                this.numTileManager.SpawnNextTilesWithDelay();
            }
    

            this.AddMovesToUndoStack();
            
            //this.CheckGameoverCondition();
        }, 250);
    }

    private CheckGameoverCondition() 
    {
        if (this.unoccupiedTiles.length == 0) 
        {
            EventsHandler.Instance.GameOver();
        }
    }

    AddMovesToUndoStack() 
    {
        let newArr: HexTileData[] = [];

        this.getTiles().forEach(tile => {
            let hexData: HexTileData = new HexTileData();
            hexData.isOccupied = tile.occupied;
            if (tile.occupied)
                hexData.valueStored = tile.occupiedTile.Value;
            newArr.push(hexData);
        });

        this.undoHandler.AddHexTilesToUndoStack(newArr);
    }


    getRandomHex(): HexTile
    {
        let randNum = Utils.getRandomNum(0,this.unoccupiedTiles.length-1);
        console.log("Random no: "+randNum);
        let randomHex = this.unoccupiedTiles[randNum];  
        return randomHex;
    }

    CheckingMergeIfPossible()
    {
        this.hexTilesProcessed = [];

        this.merged = 0;
        console.log("started ")
        this.hexTilesToCheck.forEach((item)=>
        {
            if(item.occupied)
            {
                let mergable: HexTile[] = [];
                this.CheckNeighbours(item, mergable);
                
                if(mergable.length>=3)
                {
                    mergable.push(item);
                    this.MergeTiles(mergable);
                    this.merged++;
                }
                console.log("-~ "+item.name);

                mergable.forEach(mergableItem=>
                {

                });
            }
        });

        this.CheckGameoverCondition();
        this.hexTilesToCheck = [];
    }

    private CheckNeighbours(item: HexTile, outMergable: HexTile[]) 
    {
        let valueToCheck = item.occupiedTile.Value;

        this.hexTilesProcessed.push(item);
        item.neighbours.forEach((neighbour) => {
            if (neighbour.occupied && neighbour.occupiedTile.Value == valueToCheck 
                && !this.hexTilesProcessed.find((item)=>neighbour == item)) 
            {
                outMergable.push(neighbour);
                this.hexTilesProcessed.push(neighbour);
                this.CheckNeighbours(neighbour,outMergable);
                return;
            }
        });
    }

    /**
     * @param option - to add - 0, to remove - 1
     */
    UpdateUnoccupiedTiles(option: number,hexTile:HexTile)
    {
        switch (option) 
        {
            case 0:
                this.unoccupiedTiles.push(hexTile);
                break;
            case 1:
                let i = 0
                for (i = 0; i < this.unoccupiedTiles.length; i++) 
                {
                    if(this.unoccupiedTiles[i].index == hexTile.index)
                    break;
                }
                this.unoccupiedTiles.splice(i,1);
                break;
        
            default:
                break;
        }
    }

    MergeTiles(mergable:HexTile[])
    {
        let mergeToNode = mergable[mergable.length-1];  //tiles will be merged to this tile
        this.numTileManager.upgradeTileValue(mergeToNode);
        let mergeTransitonTime = 0.5;
        for (let index = 0; index < mergable.length-1; index++) 
        {
            this.numTileManager.NumTileReuseFromPool(mergable[index].occupiedTile);
            let startNode = mergable[index];
            let startNumTile = mergable[index].occupiedTile;
            setTimeout(() => 
            {
                this.DisableNumTileAndRemoveOccupied(startNode);
                
            }, mergeTransitonTime*1000);
            if(index == mergable.length-2)
                console.log("956 Last");
        }
        console.log("956 merged");
        setTimeout(() => 
        {
            console.log("956 timeout");
            
            this.hexTilesToCheck.push(mergeToNode);
            this.CheckingMergeIfPossible();
        }, mergeTransitonTime*1000);
    }

    NoPathColorTransition() 
    {
        let colorTransitionTime = 0.3;

        if(this.inColorTransition)
        return;

        this.inColorTransition = true;
        let col = this.bg.node.color;
        let targetCol: cc.Color = cc.color(210,95,75);
        
        cc.tween(this.bg.node).to(colorTransitionTime, { color: targetCol }).
        to(colorTransitionTime, { color: col }).start();
            
        setTimeout(() => this.inColorTransition = false, colorTransitionTime*2*1000);
    }
    MoveTileFromTo(startNode:HexTile,targetNode:HexTile,path: HexTile[])
    {
        if(path.length>0)
        {
            let q = path.length-1;
            let parentPos = startNode.node.position;
            let numTile: NumTile = startNode.occupiedTile;

            numTile.node.setParent(path[q].node.parent);
            numTile.node.setPosition(parentPos);
            numTile.node.scale = 0.6;
            let traversalTime = 0.1; //0.5/ path.length;    //According to documentation total traversal time should be 0.5. So, I was using this but it felt too sluggish. So, made it a bit fast. 
            let scheduleRoute = this.schedule(()=> 
            {
                let posA= path[q].node.position;
                let tween = cc.tween(numTile.node).to(traversalTime,{ position: posA},{easing: 'linear'}).start();
                console.log("q--"+q+" parent:"+path[q].node.position+" scale"+path[q].node.scale)
                if(q==0)
                {
                    startNode.removeOccupiedTile();
                    targetNode.setOccupiedTile(numTile);       //path[0] is final node.
                    console.log("completed traversal")
                    Player.Instance.NextMove();
                }
                q--;
            } ,traversalTime,path.length-1);
        }
        else
            this.NoPathColorTransition();

    }

    newGame()
    {
        console.log("new game");
        this.ClearTiles();
            EventsHandler.Instance.NewGame();
            console.log("cleared");

    }

    CreateHexTilesWithArray(hexTilesData:HexTileData[])
    {
        this.ClearTiles();
        setTimeout(() => 
        {
            for (let i = 0; i < hexTilesData.length; i++) 
            {
                if(!hexTilesData[i].isOccupied)
                continue;

                this.numTileManager.InitNumTileFromPool
                (hexTilesData[i].valueStored,this.tiles[i]);
                
            }
        }, 200);
    }

    private ClearTiles() 
    {
        this.tiles.forEach(tile => {
            if (tile.occupied) {
                this.DisableNumTileAndRemoveOccupied(tile);
            }
        });
    }

    protected onDestroy(): void 
    {
        EventsHandler.Instance.removeSubscribers(EventTypes.NextMove,()=> this.checkMergingPossible());
    }
}
