import HexManager from "./hex-grid-generator";
import HexTile from "./hex-tile";
import Player from "./player";
import Utils from "./utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PathFinding extends cc.Component {

        @property(cc.color) private PathColor = new cc.Color();
        @property(cc.color) private OpenColor = new cc.Color();
        @property(cc.color) private ClosedColor = new cc.Color();
        
        static Instance: PathFinding = null;

        onLoad()
        {
            PathFinding.Instance = this;
        }

        FindPath(startNode: HexTile, targetNode: HexTile)
        {

            //console.log(HexManager.Instance.unoccupiedTiles)
            console.log("finding path")
            let toSearch : Array<HexTile> = [];
            let processed : Array<HexTile> = [];

            toSearch.push(startNode);

            while (toSearch.length > 0) 
            {
                let current = toSearch[0];

                toSearch.forEach(t => {
                    if (t.Fcost < current.Fcost || t.Fcost == current.Fcost && t.Hcost < current.Hcost) 
                        current = t;
                });

                processed.push(current);
                let index = toSearch.indexOf(current,0)
                toSearch.splice(index,1);
            
                if (current == targetNode) 
                {
                    let currentPathTile = targetNode;
                    let path: Array<HexTile> = [];
                    let count = 50;
                    while (currentPathTile != startNode) {
                        path.push(currentPathTile);
                        currentPathTile = currentPathTile.ConnectionTile;
                        count--;
                        if (count < 0)
                        {
                            console.error("Too many iterations");
                            break;
                        }
                    }
                    HexManager.Instance.MoveTileFromTo(startNode,targetNode,path);
                }
                    current.neighbours.forEach(t=>
                    {
                        let neighbour : HexTile = !t.occupied && !processed.includes(t) ? t : null;
                        
                        if(neighbour)
                        {

                            let inSearch = toSearch.includes(neighbour);

                            let costToNeighbor = current.Gcost + current.AxialLength(neighbour.index);

                            if (!inSearch || costToNeighbor < neighbour.Gcost) 
                            {
                                neighbour.setG(costToNeighbor);
                                neighbour.SetConnection(current);

                                if (!inSearch) 
                                {
                                    neighbour.setH(neighbour.AxialLength(targetNode.index));
                                    toSearch.push(neighbour);
                                }
                            }
                        }
                        
                    });
    
    
            }
            if(!processed.find(item=>item == targetNode))
            {
                HexManager.Instance.NoPathColorTransition();
            }
            return;
        }



    }
