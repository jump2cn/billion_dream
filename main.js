const axios = require('axios')
const figlet = require('figlet')

const url = "https://api.random.org/json-rpc/2/invoke"
const API_KEY = "" || process.argv[2]
const modList = [35, 35, 35, 35, 35, 12, 12]
const rangeIndex = 5
const hexPrefix = '0x'
const requestParams = {
    jsonrpc: "2.0",
    method: "generateBlobs",
    params: {
        apiKey: API_KEY,
        n: modList.length,
        size: 512,
        format: "hex"
    },
    id: 0
}

if (!API_KEY) {
    console.log("please register and create an api key on the https://www.random.org")
    return
}

figlet('Give me Billions !!!', function(err, rendered){
    console.log(rendered);
})

let randomHandle = ({ random, bitsUsed, advisoryDelay : delay }) => {
    let result = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < modList.length; i++) {
        let mixValue = 0
        let addonNumber = parseInt((bitsUsed * i + delay) / i) || delay * i
        do {
            mixValue = dataHandle(random.data[i], modList[i], addonNumber++)
        } while(mixValue <= 0 || result.indexOf(mixValue) > -1)
        result[i] = mixValue
    }
    result.sort((left, right) => partSort(result, left, right))
    console.log("Your numbers", result.slice(0, rangeIndex), result.splice(rangeIndex))
}

let dataHandle = (hexStr, modNumber, addonNumber = 0) => {
    let mixValue = 0
    for (let i = 1; i < hexStr.length; i++) {
        mixValue += Number.parseInt(hexPrefix + hexStr[i]) + addonNumber
        if (mixValue > modNumber) {
            mixValue %= modNumber
        }
    }
    return mixValue
}

let partSort = (result, left, right) => {
    let flagLeft = result.indexOf(left) >= rangeIndex
    let flagRight = result.indexOf(right) >= rangeIndex
    if (flagLeft && flagRight) {
        return left - right
    } else if (flagLeft) {
        return left
    } else if (flagRight) {
        return right
    } else {
        return left - right
    }
}

axios.post(url, requestParams).then(response => {
    if (response.status == 200) {
        if (response.data.error) {
            console.error(response.data.error.message)
            return
        }
        randomHandle(response.data.result)
    }
}).catch(function (error) {
    console.error(error);
})

