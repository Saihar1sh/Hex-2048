import EventsHandler, { EventTypes } from "./events-handler";
import HexManager, { HexTileData } from "./hex-grid-generator";
import HexTile from "./hex-tile";
import NumTile from "./num-tile";
import Player from "./player";
import UndoHandler from "./PowerUps/undo-handler";
import Utils from "./utils";

const {ccclass, property} = cc._decorator;

@ccclass("NumTile_Data")
export class NumTileData
{
    @property(cc.Integer)
    value : number = 0;
    @property(cc.color)
    color : cc.Color = cc.color(0);
}

@ccclass
export default class NumTileManager extends cc.Component 
{
    probFor1 : number = 0.45;
    probFor2 : number = 0.25;
    probFor4 : number = 0.2;
    probFor8 : number = 0.1;
    
    @property(UndoHandler)
    undoHandler: UndoHandler = null;
    @property(Player)
    player: Player = null;

    @property(cc.Prefab)
    numTile: cc.Prefab = null;

    @property(cc.Node)
    predictionTilesNode: cc.Node = null;

    moveT:number = 0;
    
   //predictionTiles: cc.Node[] = [];

    countForRandomHex= 0;           //for break condition in getRandomHexTile() recursion

    @property([NumTileData])
    numTilesData : NumTileData[] = [];          // for easy access from inspector window

    numTilesPool: NumTile[] = [];
    
    nextTiles: NumTile[] = [];
    
    numTilesDict : Map<number,NumTileData> = new Map();    //for easier access
    
    //static Instance : NumTileManager = null;

    onLoad()
    {
        //NumTileManager.Instance = this;

        this.numTilesData.forEach(item => this.numTilesDict.set(item.value,item));
    }
    
    start () 
    {
        this.CreateNumTilesPool(50);

        this.StartGame();

        EventsHandler.Instance.addSubscribers(EventTypes.NewGame,()=> this.StartGame());
        //EventsHandler.Instance.addSubscribers(EventTypes.NextMove,()=> this.SpawnNextTilesWithDelay());
    }

    private StartGame() 
    {
        for (let i = 1; i < 6; i++) 
        {
            let randTile = this.getRandomHexTile();
            if (randTile)
                this.InitNumTileFromPool(this.numTilesData[i].value, randTile);

            else
                console.log("no unoccupied hex tiles left"); //as it checks for 60 iterations and we have 30 tiles
        }
        HexManager.Instance.AddMovesToUndoStack();
        this.predictNextTiles();
    }
    SpawnNextTilesWithDelay() 
    {
        this.SpawnNextTiles();
        this.predictNextTiles();
        setTimeout(() => 
        {
            HexManager.Instance.CheckingMergeIfPossible();

        }, 250);
    }
    CreateNumTilesPool(length:number)
    {
        for (let index = 0; index < length; index++) 
        {
            let numObj  = cc.instantiate(this.numTile);
            let numTile = numObj.getComponent(NumTile);
            numObj.active = false;
            this.numTilesPool.push(numTile);
        }
    }

    /**
     * Creates a num tile node and returns numTile object
     * @param value - value of num tile required for set up
     * @param randTile - random hex tile which will be parent node of num tile
     */

    InitNumTileFromPool(value: number, randTile?: HexTile) : NumTile
    {
        let numTileData: NumTileData = this.numTilesDict.get(value); 
        let numTile = this.numTilesPool.find(item=>item.node.active == false);
        //numTile.node.setParent(randTile.node)
        
        if(!numTile)
        {
            console.log("All are in use");
            return;
        }

        numTile.Init_NumData(numTileData);

        if(randTile)
        {
            //randTile.SetConnection(null);
            numTile.OccupyHexTile(randTile);
        }

        numTile.node.active = true;
        return numTile;
    }
    NumTileReuseFromPool(occupiedTile: NumTile) 
    {
        occupiedTile.node.active = false;
    }



    private SpawnNextTiles()
    {   
        let unOccupiedTilesLength = HexManager.Instance.unoccupiedTiles.length;
        let spawnTilesNum : number = cc.misc.clampf(unOccupiedTilesLength, 1,3)
        if(this.nextTiles)
        {
            for (let index = 0; index < spawnTilesNum; index++) 
            {
                let randTile = this.getRandomHexTile();
                if(randTile)
                {   
                    this.nextTiles[index].OccupyHexTile(randTile);        //making num tiles occupy hex tiles
                    HexManager.Instance.hexTilesToCheck.push(randTile);
                }
                else
                {
                    console.log("no unoccupied hex tiles left");         //as it checks for 100 iterations and we have 30 tiles
                }
                
            }

        }
    }

    upgradeTileValue(hexTile:HexTile)
    {
        let numTile = hexTile.occupiedTile;
        let numData = this.numTilesDict.get(numTile.Value*4)
        console.log(numData);
        numTile.Init_NumData(numData);
        numTile.StartSelectTween();
        this.updatePlayerInfo(numData);
    }

    private updatePlayerInfo(numData: NumTileData)
    {
        this.player.UpdateScore(numData.value);
        if (Utils.getRandomNum(0, 1) < 0.3) {
            this.player.CoinsIncreament();
        }
    }

    predictNextTiles()
    {
        this.countForRandomHex = 0;

        let cumulativeProb1 = this.probFor1;
        let cumulativeProb2 = cumulativeProb1+ this.probFor2;
        let cumulativeProb4 = cumulativeProb2+ this.probFor4;
        let cumulativeProb8 = cumulativeProb4+ this.probFor8;
        
        let nextTilesObjs: NumTile[] =[]; 
        
        
        
        for (let i = 0; i < 3; i++) 
        {
            let randNumTileData : NumTileData;
            let predictionTileHex = this.predictionTilesNode.children[i];
            console.log("child--"+predictionTileHex.name)
            let rand = Math.random();

            if(rand <= cumulativeProb1 )
            {
                randNumTileData = this.numTilesData[0];
            }
            else if(rand <= cumulativeProb2)
            {
                randNumTileData = this.numTilesData[1];
            }
            else if(rand <= cumulativeProb4)
            {
                randNumTileData = this.numTilesData[2];
            }
            else if(rand <= cumulativeProb8)
            {
                randNumTileData = this.numTilesData[3];
            }
            
            console.log("989 rand tile: "+randNumTileData.value+" rand:"+rand);
            
            let predictionTile = this.InitNumTileFromPool(randNumTileData.value);
            predictionTile.node.scale = 1;
            predictionTile.node.position = cc.Vec3.ZERO;
            predictionTile.node.setParent(predictionTileHex);
            nextTilesObjs.push(predictionTile);
        }
        console.log("989 ")
        this.nextTiles = [];
        this.nextTiles = nextTilesObjs;
        this.StoringPredictionTileValues(nextTilesObjs);
    }

    StoringPredictionTileValues(nextTiles:NumTile[])
    {
        let valueStored : number[] =[];
        nextTiles.forEach(tile=> valueStored.push(tile.Value))
        this.undoHandler.AddPredictionTilesStack(valueStored);
    }


    getRandomHexTile(): HexTile
    {
        let tile = HexManager.Instance.getRandomHex();
        console.log("w-searching... tile: "+HexManager.Instance.getRandomHex().index);
        let targetNode = Player.Instance.destNodes[1];
        
        this.countForRandomHex++;

        if(this.countForRandomHex>= 40)         //limitting recursion to 40 times
        {
            console.log("Cannot get a random hex tile at the moment")
            return null;
        }
        if(targetNode != null && tile.index== targetNode.index)
            return this.getRandomHexTile();
        
        console.log("w-Got - tile: "+tile.index);
            return tile;
    }

}
