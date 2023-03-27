import EventsHandler, { EventTypes } from "./events-handler";
import HexManager, { HexTileData } from "./hex-grid-generator";
import HexTile from "./hex-tile";
import NumTile from "./num-tile";
import PathFinding from "./pathfinding";
import UndoHandler from "./PowerUps/undo-handler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component 
{
    private hiScore:number = 0;
    set Hi_Score(value:number)
    {
        this.hiScore = value;
        this.bestScoreLabel.string = this.hiScore.toString();
    }

    private score: number = 0;
    set Score(value:number)
    {
        this.score += value;
        this.scoreLabel.string = this.score.toString();
    }

    private coins: number = 0;
    set Coins(value:number)
    {
        this.coins = value;
        this.coinsLabel.string = this.coins.toString();
    }


    @property(cc.Label) bestScoreLabel: cc.Label = null;
    @property(cc.Label) scoreLabel: cc.Label = null;
    @property(cc.Label) coinsLabel: cc.Label = null;

    @property(UndoHandler)
    undoHandler : UndoHandler = null;

    destNodes: HexTile[] = [];

    moves : number = 0;
    
    static Instance: Player = null;

    onLoad()
    {
        Player.Instance = this;
    }
    start()
    {
        EventsHandler.Instance.addSubscribers(EventTypes.NewGame,()=>this.newGame());
    }

    UpdateScore(value:number)
    {
        this.Score = value;
        this.Hi_Score = Math.max(this.hiScore,this.score);
    }
    CoinsIncreament() {
        this.Coins = this.coins + 1;
    }

    assignTargetNode(_hexTile:HexTile)
    {
        HexManager.Instance.hexTilesToCheck.push(_hexTile);

        this.AddTargetNode(_hexTile);
        
        //console.log(this.destNodes);
        
        this.StartPathfinding();

    }
    GetDestNodes():HexTile[]
    {
        return this.destNodes;
    }

    GetTargetNode():HexTile
    {
        if(this.destNodes)
            return this.destNodes[1];
        else
            return null;
    }

    private AddTargetNode(_hexTile:HexTile)
    {
        this.destNodes.push(_hexTile);
    }



    private StartPathfinding() 
    {
        if (this.destNodes.length >= 2) 
        {
            PathFinding.Instance.FindPath(this.destNodes[0], this.destNodes[1]);
            
            this.destNodes = [];
        }
    }

    NextMove() 
    {
        
        EventsHandler.Instance.eventEmit(EventTypes.NextMove);


        // Get new tiles which were displayed
        this.moves++;
        console.log("moves: " + this.moves);
    }

    newGame()
    {
        this.moves = 0;
        this.destNodes = [];
        this.score = 0;
        this.Score = 0;
    }

}
