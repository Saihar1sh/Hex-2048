const {ccclass, property} = cc._decorator;

export const enum EventTypes
{
    none = "",
    NextMove ="next_move",
    NewGame = "new_game",
}
@ccclass
export default class EventsHandler extends cc.Component 
{
    static Instance:EventsHandler = null;

    @property(cc.Node)
    gameoverNode: cc.Node = null;

    onLoad()
    {
        EventsHandler.Instance = this;
        this.NewGame();
    }

    GameOver()
    {
        this.gameoverNode.active = true;
    }
    NewGame()
    {
        this.gameoverNode.active = false;
        this.eventEmit(EventTypes.NewGame);
    }

    addSubscribers(eventType:EventTypes, callBack:Function)
    {
        if(!callBack)
        {
            console.log("Please add a callback to subscribe");
            return;
        }
        this.node.on(eventType, callBack)
    }
    removeSubscribers(eventType:EventTypes, callBack?:Function)
    {
        this.node.off(eventType, callBack)
    }

    eventEmit(eventType: EventTypes,arg1?,arg2?,arg3?,arg4?,arg5?)
    {
        this.node.emit(eventType,arg1,arg2,arg3,arg4,arg5);
        console.log("Event called:- type: "+eventType);
    }

}
