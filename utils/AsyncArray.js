class AsyncArray {
    constructor(array) {
        this._array = array;
    }

    filter(predicate) {
        const data = Array.from(this._array);
        return Promise.all(data.map((element, index) => predicate(element, index, data)))
            .then(result => {
                return data.filter((element, index) => {
                    return result[index];
                });
            });
    }
}

/* example
let arr = new AsyncArray([1,2,3,4,5]);
arr.filterAsync(async (element) => {
    return new Promise(res => {
        setTimeout(() => {
            res(element > 3);
        }, 1);
    });
}).then(result => {
    console.log(result)
});
*/

module.exports = AsyncArray;