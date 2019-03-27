class HashMap {
    constructor () {
        // members
        this.keyArray = new Array(); // Keys
        this.valArray = new Array(); // Values
    }

    /**
     * HashMap 에 key, value 추가
     * @param key
     * @param val
     */
    put (key, val){
        var elementIndex = this.findIt( key );

        if( elementIndex == (-1) )
        {
            this.keyArray.push( key );
            this.valArray.push( val );
        }
        else
        {
            this.valArray[ elementIndex ] = val;
        }
    }

    /**
     * HashMap 에 key에 해당하는 value 반환
     * @param key
     * @returns
     */
    get ( key ){
        var result = null;
        var elementIndex = this.findIt( key );

        if( elementIndex != (-1) )
        {
            result = this.valArray[ elementIndex ];
        }

        return result;
    }

    /**
     * HashMap 에 key에 해당하는 key / value 삭제
     * @param key
     */
    remove ( key ) {

        var elementIndex = this.findIt( key );

        if( elementIndex != (-1) )
        {
            var part1 = this.keyArray.slice( 0, elementIndex);
            var part2 = this.keyArray.slice( elementIndex+1 );
            this.keyArray = part1.concat( part2 );

            var part3 = this.valArray.slice( 0, elementIndex);
            var part4 = this.valArray.slice( elementIndex+1 );
            this.valArray = part3.concat( part4 );
        }

        return ;
    }

    /**
     * HashMap 사이즈
     * @returns
     */
    size () {
        return (this.keyArray.length);
    }

    /**
     * HashMap 요소 모두 삭제
     */
    clear () {
        for( var i = 0; i < this.keyArray.length; i++ )
        {
            this.keyArray.pop(); this.valArray.pop();
        }
    }

    /**
     * HashMap key 배열로 반환
     * @returns {Array}
     */
    keySet () {
        return (this.keyArray);
    }

    /**
     * HashMap value 배열로 반환
     * @returns {Array}
     */
    valSet () {
        return (this.valArray);
    }

    /**
     * HashMap String으로 반환
     * @returns {String}
     */
    showMe () {
        var result = "";

        for( var i = 0; i < this.keyArray.length; i++ )
        {
            result += "Key: " + this.keyArray[ i ] + "\tValues: " + this.valArray[ i ] + "\n";
        }
        return result;
    }

    /**
     * HashMap key에 해당하는 인덱스 반환
     * @param key
     * @returns {Number}
     */
    findIt ( key ) {
        var result = (-1);

        for( var i = 0; i < this.keyArray.length; i++ )
        {
            if( this.keyArray[ i ] == key )
            {
                result = i;
                break;
            }
        }
        return result;
    }

    /**
     * HashMap Key 의 개수 반환
     * @param key
     * @returns {Number}
     */
    findCount ( key ) {
        var result = 0;

        for( var i = 0; i < this.keyArray.length; i++ )
        {
            if( this.keyArray[ i ] == key )
            {
                result = result++;
            }
        }
        return result;
    }
}

export default HashMap;