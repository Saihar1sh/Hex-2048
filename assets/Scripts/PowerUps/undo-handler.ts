import EventsHandler, { EventTypes } from "../events-handler";
import HexManager, { HexTileData } from "../hex-grid-generator";
import HexTile from "../hex-tile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UndoHandler extends cc.Component 
{
    undoHexTilesStack: HexTileData[][] = [];

    undoPredictionStack: number[][] = [];
    
    moves:number = 0;
    undoMoves:number = 0;

    onLoad()
    {
        EventsHandler.Instance.addSubscribers(EventTypes.NewGame,()=>this.newGame());
    }

    newGame()
    {
        this.undoHexTilesStack = [];
        this.undoPredictionStack = [];
    }
    
    /**
     * @param hexTilesData - data of hex Tiles required for Initiating tiles
     */
    AddHexTilesToUndoStack(hexTilesData: HexTileData[])
    {
        this.undoHexTilesStack[this.moves] = [];
        this.undoHexTilesStack[this.moves] = hexTilesData;

        this.undoMoves = this.moves;
        this.moves++;
    }

    AddPredictionTilesStack(hexTileValues:number[])
    {
        this.undoPredictionStack[this.moves] = [];
        this.undoPredictionStack[this.moves] = hexTileValues;
    }

    UndoMove()
    {
        this.undoMoves--;
        let lastMove = this.undoHexTilesStack[this.undoMoves];
        if(lastMove)
            HexManager.Instance.CreateHexTilesWithArray(lastMove);

        let lastPredictionTiles = this.undoPredictionStack[this.moves];
        // if(lastPredictionTiles)
        // {
            
        // }   

    }
    //testing
    RedoMove()
    {
        let move = this.undoMoves+1;
        let lastMoveTiles = this.undoHexTilesStack[move];
        if(lastMoveTiles)
            HexManager.Instance.CreateHexTilesWithArray(lastMoveTiles);

    }
}
