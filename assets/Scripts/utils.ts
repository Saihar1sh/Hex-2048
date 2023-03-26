const {ccclass, property} = cc._decorator;

@ccclass
export default class Utils
{

    /** min -inclusive, max- inclusive                                                  
     * Gets the random number with equal probability
    */
    static getRandomNum(min:number, max: number): number
    {
        return Math.floor(Math.random() * (max-min+1))+ min;
    }
    /** min -inclusive, max- inclusive, probability- b/w 0 and 1                               
     * Gets the random number with specified probability 
    */
    static getRandomNumWithProbability(min:number, max: number, probability: number): number
    {
        return Math.floor(probability * (max-min+1))+ min;
    }

    static getPosRelativeTo(posOf:cc.Node, posRelativeTo:cc.Node): cc.Vec3
    {
        let parentNode = posOf.parent;
        let relativePos = cc.Vec3.ZERO;
        while(posOf.parent != posRelativeTo)
        {
            parentNode = posOf.parent;
            relativePos.add(parentNode.parent.position);
            posOf = parentNode;
        }
        return relativePos;
    }

}
