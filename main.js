console.log('work test');

class HashMap{
    constructor(){
        // how many buckets CAN there be
        this.capacity = 16;
        this.loadFactor = 0.75;
        this.buckets = [];
        // how many things have been put in a bucket
        this.entryCount = 0;

        this.#populateBuckets();
    }



    // do any time a bucket is accessed through an index
    #checkIndex(index){
        if (index < 0 || index >= this.buckets.length) {
            throw new Error("Trying to access index out of bound");
        }
    }

    #generateHash(key) {
        let hashCode = 0;
            
        const primeNumber = 31;
        for (let i = 0; i < key.length; i++) {
            hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.capacity;
        }

        return hashCode;
    } 



    // this determines whether or not we need to populateBuckets?
    // should trigger every time entryCount is increased (which could be done smarter probs)
    #growBucketsCheck(){
        if(this.entryCount >= this.capacity*this.loadFactor){
            this.capacity = this.capacity*2;
            this.#populateBuckets();
        }
    }

    // this is seperated from growBucketsCheck so that it can also be triggered on construct
    #populateBuckets(){

        const holdingList = new LinkedList();
        this.buckets.forEach( (list) => {
            holdingList.mergeLists(list);
        });


        for(let i = (this.capacity-this.buckets.length); i > 0; i--){
            this.buckets.push(new LinkedList());
        }


        // then dump holdingList across the new buckets
        // which needs to use set, basically, except NOT increase the entryCount...
        // OR decrease it right before increasing it lol
        this.#redistribute(holdingList);

        console.log('NEW BUCKET ARRAY:');
        console.log(this.buckets);
    }



    // for when bucket capacity grows, and entries need to be re-sorted
    #redistribute(list){
        const theMap = this;

        // don't love that this looks a lot like a linkedList function but i'm running it in the hashMap...
        // also still don't like how we're accessing key names but
        function setNode(current){
            if(current){
                theMap.entryCount -= 1;
                const key = current.getKeyName();
                theMap.set(key, current[key]);
                setNode(current.next);
            }
        }
        setNode(list.head);

    }


    
    set(key, value){
        // i say bucket rather than just hash because it's been %-ed
        const bucketHash = this.#generateHash(key);
        // console.log(hash);

        // error thrower
        this.#checkIndex(bucketHash);
        // keep key and value seperate because if key already exists in bucket, overwrite rather than create
        // addNode returns true only if an overwrite did NOT happen
        if(this.buckets[bucketHash].addNode(key, value)){
            this.entryCount += 1;
            this.#growBucketsCheck();
        }

        // this.buckets[bucketHash].toString();
    }


    get(key){
        const bucketHash = this.#generateHash(key);

        // error thrower
        this.#checkIndex(bucketHash);
        const result = this.buckets[bucketHash].find(key);
        if(result){
            return result[key];
        }
        else{
            return null;
        }
    }


    has(key){
        const bucketHash = this.#generateHash(key);

        // error thrower
        this.#checkIndex(bucketHash);
        if(this.buckets[bucketHash].find(key)){
            return true;
        }
        else{
            return false;
        }
    }


    remove(key){
        const bucketHash = this.#generateHash(key);

        // error thrower
        this.#checkIndex(bucketHash);

        console.log('b4 removal: ');
        this.buckets[bucketHash].toString();

        let forPrinting = this.buckets[bucketHash].remove(key);

        console.log('after removal: ');
        this.buckets[bucketHash].toString();
        
        return forPrinting;
    }


    length(){
        let total = 0;

        this.buckets.forEach( (list) => {
            total += list.length();
        })

        return total;
    }


    clear(){
        this.buckets.forEach( (list) => {
            list.clear();
        })
    }


    keys(){
        let result = [];

        this.buckets.forEach( (list) => {
            result = result.concat(list.getKeys());
        })

        return result;
    }

    values(){
        let result = [];

        this.buckets.forEach( (list) => {
            result = result.concat(list.getValues());
        })

        return result;
    }

    entries(){
        let result = [];

        this.buckets.forEach( (list) => {
            result = result.concat(list.getEntries());
        })

        return result;
    }


}



class ListNode{
    constructor(key, value = null, next = null){
        this[key] = value;
        this.next = next;
    }

    getKeyName(){
        return Object.keys(this)[0];
    }
}


class LinkedList{

    constructor(){
        this.head = null;
        this.tail = null;
    }


    mergeLists(otherList){
        // otherList is EMPTIED into 'this', added onto the end
        // (don't love that this list is reaching INTO the other list to change things about it, might change later?)
        if(otherList.head){
            if(this.head){
                this.tail.next = otherList.head;
            }
            else{
                this.head = otherList.head;
            }
            this.tail = otherList.tail;

            otherList.head = null;
            otherList.tail = null;
        }
    }


    #firstNodeCheck(newNode){
        if(this.head == null){
            this.head = newNode;
            this.tail = newNode;
            return true;
        }
        return false;
    }


    addNode(key, value){
        // first overWrite check, if returns false/nothing, add...

        // if it DIDNT find something to overwrite, IE, key does not currently exist in list
        if(!this.#overwriteCheck(key,value)){
            let newNode = new ListNode(key,value);

            if(this.#firstNodeCheck(newNode) == false){
                this.tail.next = newNode;
                this.tail = newNode;
            }

            // to tell HashMap to increase entry count
            return true;
        }

        // HashMap should NOT increase entry count
        return false;
    }

    #overwriteCheck(key, value){
        let success = false;

        function checkValue(current){
            if(current){
                if(current.getKeyName() == key){
                    success = true;
                    // overwrite old value
                    current[key] = value;
                }
                else{
                    checkValue(current.next);
                }
            }
        }
        checkValue(this.head);
        // console.log(`success: ${success}`)
        return success;
    }



    toString(){
        let outText = '';

        function printAll(current){
            if(!current){
                outText += 'null';
            }
            else{
                const key = current.getKeyName();
                outText += `${key} : ${current[key]} -> `;
                printAll(current.next);
            }
        };

        printAll(this.head);


        console.log(outText);
    }



    find(key){
        let result = null;

        function checkForKey(current){
            if(current){
                if(current.getKeyName() == key){
                    result = current;
                }
                else{
                    checkForKey(current.next);
                }
            }
        }
        checkForKey(this.head);

        return result;
    }


    remove(key){
        const fullList = this;
        let success = false;

        function checkForKey(current, previous){
            if(current){
                if(current.getKeyName() == key){
                    if(previous == null){
                        // current is head
                        fullList.head = current.next;
                    }
                    else{
                        // middle of list somewhere
                        previous.next = current.next;
                        if(previous.next == null){
                            fullList.tail = previous;
                        }
                    }
                    success = true;
                }
                else{
                    checkForKey(current.next,current);
                }
            }
        }
        checkForKey(this.head,null);

        return success;
    }

    clear(){
        // i don't know if you need to do anything to like. disintigrate the objects that were once linked here. but.
        this.head = null;
        this.tail = null;
    }

    length(){
        let count = 0;

        function countAll(current){
            if(current){
                count += 1;
                countAll(current.next);
            }
        }

        countAll(this.head);

        return count;
    }


    // im sure these three (and their corresponding HashMap functions) could be combined more elegantly given how
    // similar the various moving pieces are BUT
    getKeys(){
        let result = [];

        function checkKey(current){
            if(current){
                result.push(current.getKeyName());
                checkKey(current.next);
            }
        }
        checkKey(this.head);

        return result;
    }

    getValues(){
        let result = [];

        function checkKey(current){
            if(current){
                const keyName = current.getKeyName();
                result.push(current[keyName]);
                checkKey(current.next);
            }
        }
        checkKey(this.head);

        return result;
    }

    getEntries(){
        let result = [];

        function checkKey(current){
            if(current){
                const keyName = current.getKeyName();
                result.push([keyName, current[keyName]]);
                checkKey(current.next);
            }
        }
        checkKey(this.head);

        return result;
    }

    // original linked-list functions
    /*append(value){
        let newNode = new ListNode(value);

        if(this.#firstNodeCheck(newNode) == false){
            this.tail.next = newNode;
            this.tail = newNode;
        }
        
    }



    size(){
        let count = 0;

        function countAll(current){
            if(current){
                count += 1;
                countAll(current.next);
            }
        }

        countAll(this.head);

        console.log('total count: ' + count);
        return count;
    }


    pop(){
        // if i don't seperate out 'fullList' we get a 'this' problem in secondToLast so...
        let fullList = this;
        let popped = null;
        

        function secondToLast(current){
            if(current){
                // if we're at second-to-last, OR only one remains
                if(current.next == fullList.tail || fullList.tail == fullList.head){
                    popped = fullList.tail;
                    current.next = null;

                    // if there was only one node left
                    if(popped == fullList.head){
                        fullList.head = null;
                        fullList.tail = null;
                    }
                    else{
                        fullList.tail = current;
                    }
                }
                else{
                    secondToLast(current.next);
                }
            }
        }

        secondToLast(this.head);

        return popped;
    }

    contains(value){
        let found = false;

        function searchValue(current){
            if(current){
                if(current.value == value){
                    found = true;
                }
                else{
                    searchValue(current.next);
                }
            }
        }
        searchValue(this.head);

        return found;
    }


    find(value){
        let index = 0;
        let success = false;

        function checkValue(current){
            if(current){
                if(current.value == value){
                    success = true;
                }
                else{
                    index += 1;
                    checkValue(current.next);
                }
            }
        }
        checkValue(this.head);

        if(success == true){
            return index;
        }
        else{
            return null;
        }
    }


    removeAt(index){
        const fullList = this;
        let removed = null;
        /*
        possible states:
        current = something, previous = null (current is head)
            if current.next exists, it becomes head, return current
        current = something, previous = something (middle of list)
            previous.next becomes current.next (if that's null, previous becomes tail)
        * /


        function checkIndex(current, previous){
            if(current){
                if(index == 0){
                    if(previous == null){
                        // current is head
                        fullList.head = current.next;
                    }
                    else{
                        // middle of list somewhere
                        previous.next = current.next;
                        if(previous.next == null){
                            fullList.tail = previous;
                        }
                    }
                    removed = current;
                }
                else{
                    index -= 1;
                    checkIndex(current.next,current);
                }
            }
        }
        checkIndex(this.head, null);

        return removed;
    }*/
}


// const testList = new LinkedList();

// testList.append('test','thing');
// testList.append('test2','thing');
// testList.append('test3','thing');

// testList.toString();


const favFoods = new HashMap();
// console.log(favFoods);

favFoods.set('Bobert','Unadulterated cheesecake');
favFoods.set('Marth', 'Spaghetti with one singular meatball');
favFoods.set('Joshley', 'Deep fried acorns');
favFoods.set('Elephantaine', 'Grass');
console.log('4/'+favFoods.length());
favFoods.set('Gatsby', 'Shirts');
    favFoods.set('Bobert', 'Leather');
favFoods.set('York', 'Bagels');
favFoods.set('My Cat', 'Stolen fish');
favFoods.set('James','Popcorn');
favFoods.set('Antholoby','Raw chicken');
console.log('9/'+favFoods.length());
favFoods.set('Dracula','Necks');
favFoods.set('Jacob','Undercooked rice');
favFoods.set('Betheny','Apples');
console.log('12/'+favFoods.length());
favFoods.set('Jorgus','Cheddar cheese');
favFoods.set('Lobert','Goats');
favFoods.set('Mobert','Children named Robert');
favFoods.set('Percy','Snot');


console.log('should work');
console.log(favFoods.get('York'));
console.log(favFoods.get('Lobert'));
console.log(favFoods.get('Joshley'));
console.log('should not');
console.log(favFoods.get('Eggsy'));
console.log(favFoods.get('Thelemsby'));


console.log('should work');
console.log(favFoods.has('Percy'));
console.log(favFoods.has('Jorgus'));
console.log(favFoods.has('Betheny'));
console.log('should not');
console.log(favFoods.has('Eggszszzy'));
console.log(favFoods.has('Willburt'));


console.log('should work');
console.log(favFoods.remove('Mobert'));
console.log(favFoods.remove('James'));
console.log(favFoods.remove('Gatsby'));
console.log('should not');
console.log(favFoods.remove('Christopholes'));
console.log(favFoods.remove('Eccelston'));


console.log('keys');
console.log(favFoods.keys());
console.log('values');
console.log(favFoods.values());
console.log('entries');
console.log(favFoods.entries());


console.log('clearing list');
favFoods.clear();
console.log(favFoods);
