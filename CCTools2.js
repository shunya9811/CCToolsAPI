
const config = {
    symbolsUrl: "https://api.apilayer.com/exchangerates_data/symbols",
    convertUrl: "https://api.apilayer.com/exchangerates_data/convert?",
    CLIOutputDivID: "shell",
    CLITextInputID: "shellInput"
}

const myHeaders = new Headers();
myHeaders.append("apikey", "lNOIdats10Xgzg8lZHgqANMSyxRmvU52");

const requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

let deno = {};

window.onload = async function(){
    // ページ読み込み時に実行したい処理
    let symbols = {};
    await fetch(config.symbolsUrl, requestOptions)
        .then(response => response.json())
        .then(result => symbols = result.symbols )
        .catch(error => console.log('error', error));

    deno = Object.keys(symbols);
}


let CLITextInput = document.getElementById(config.CLITextInputID);
let CLIOutputDiv = document.getElementById(config.CLIOutputDivID);

CLITextInput.addEventListener("keyup", (event) => {outputCommand(event)});

async function outputCommand(event){
    if (event.key == "Enter"){
        // 入力されたテキストを解析して、"packageName commandName arguments "
        //を表す3つの文字列要素の配列にします。
        let parsedCLIArray = CCTools.commandLineParser(CLITextInput.value);

        // 入力されたテキストがCLIにechoされます。 
        CCTools.appendEchoParagraph(CLIOutputDiv);

        // 提出後、テキストフィールドをクリアにします。
        CLITextInput.value = '';

        // 入力の検証を行い、 {'isValid': <Boolean>, 'errorMessage': <String>} の形をした連想配列を作成します。
        let validatorResponse = CCTools.parsedArrayValidator(parsedCLIArray);

        let result = "your result is: ";

        if(validatorResponse['isValid'] == false){
            CCTools.appendResultParagraph(CLIOutputDiv, false, validatorResponse['errorMessage']);
        }
        //else 
        else if (parsedCLIArray[1] === "showAvailableDenominations"){
            result += `<br>`;
            deno.forEach(locale => result += locale +  `<br>`);
            CCTools.appendResultParagraph(CLIOutputDiv, true, result);
        }
        else {
            let queryResponseObject = await CCTools.queryResponseObjectFromQueryString(parsedCLIArray[2], parsedCLIArray[3], parsedCLIArray[4]);
            result += queryResponseObject.result + " " + parsedCLIArray[4];
            CCTools.appendResultParagraph(CLIOutputDiv, true, result);
        }


        // 出力divを常に下にスクロールします。 
        CLIOutputDiv.scrollTop = CLIOutputDiv.scrollHeight;
    }
}

class CCTools{

    //MToolsとここは同じ
    static commandLineParser(CLIInputString)
    {
        let parsedStringInputArray = CLIInputString.trim().split(" ");
        return parsedStringInputArray;
    }

    static parsedArrayValidator(parsedStringInputArray)
    {
        // すべてのコマンドに適用されるルールに照らし合わせて入力をチェックします。
        let validatorResponse = CCTools.universalValidator(parsedStringInputArray);
        if (!validatorResponse['isValid']) return validatorResponse;
      
        // 入力が最初のvalidatorを通過した場合、どのコマンドが与えられたかに基づいて、
        // より具体的な入力の検証を行います。
        validatorResponse = CCTools.commandArgumentsValidator(parsedStringInputArray.slice(1, 5));
        if (!validatorResponse['isValid']) return validatorResponse;

        return {'isValid': true, 'errorMessage':''}
    }

    static universalValidator(parsedStringInputArray)
    {
        let validCommandList = ["convert", "showAvailableDenominations"];
        if (parsedStringInputArray[0] != 'CCTools'){
            return {'isValid': false, 'errorMessage': `only CCTools package supported by this app. input must start with 'CCTools'`}
        }
        // 変更点 コマンドは5個以上にならない
        if (parsedStringInputArray.length > 5){
            return {'isValid': false, 'errorMessage': `command line input maximum contain exactly 5 elements: 'packageName commandName arguments'`};
        }
        if (validCommandList.indexOf(parsedStringInputArray[1]) == -1){
            return {'isValid': false, 'errorMessage': `CCTools only supports the following commands: ${validCommandList.join(",")}`};
        }
        
        return {'isValid': true, 'errorMessage': ''}
    }

    // コマンド別の挙動を記述
    static commandArgumentsValidator(commandArgsArray)
    {
        if (commandArgsArray[0] === "showAvailableDenominations"){
            return CCTools.showAvailableDenominationsValidator(commandArgsArray);
        }
        if (commandArgsArray[0] === "convert"){
            return CCTools.convertValidator(commandArgsArray);
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static showAvailableDenominationsValidator(argsArray)
    {
        if (argsArray.length != 1){
            return {'isValid': false, 'errorMessage': `command showAvailableDenominations requires exactly 0 argument`};
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static convertValidator(argsArray)
    {   
        if (argsArray.length != 4){
            return {'isValid': false, 'errorMessage': `command showAvailableDenominations requires exactly 3 argument`};
        }
        if (!deno.includes(argsArray[1])){
            return {'isValid': false, 'errorMessage': `That sourceDenomination ${argsArray[1]} is not an available Denomination`}; 
        }
        if (typeof Number(argsArray[2]) != "number"){
            return {'isValid': false, 'errorMessage': `The second argument must be numeric`};
        }
        if (!deno.includes(argsArray[3])){
            return {'isValid': false, 'errorMessage': `That destinationDenomination ${argsArray[3]} is not an available Denomination`}; 
        }
        if (isNaN(Number(argsArray[2]))){
            return {'isValid': false, 'errorMessage': `The second argument is NaN. The second argument must be numeric`};
        }
        if (Number(argsArray[2]) <= 0){
            return {'isValid': false, 'errorMessage': `The second argument must be a number greater than or equal to 1.`};
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static appendEchoParagraph(parentDiv)
    {
        parentDiv.innerHTML+=
            `<p class="m-0">
                <span style='color:green'>student</span>
                <span style='color:magenta'>@</span>
                <span style='color:blue'>recursionist</span>
                : ${CLITextInput.value}
            </p>`;

        return;
    }

    static appendResultParagraph(parentDiv, isValid, message)
    {
        let promptName = "";
        let promptColor = "";
        if (isValid){
            promptName = "CCTools";
            promptColor = "turquoise";
        }
        else{
            promptName = "CCToolsError";
            promptColor = "red";
        }
        parentDiv.innerHTML+=
                `<p class="m-0">
                    <span style='color: ${promptColor}'>${promptName}</span>: ${message}
                </p>`;
        return;
    }

    // クエリを実行して js オブジェクトを取得します。
    static async queryResponseObjectFromQueryString(from, amount, to)
    {
        let queryResponseObject = {};
        let queryURL = config.convertUrl+`to=${to}&from=${from}&amount=${amount}`;
        await fetch(queryURL, requestOptions).then(response=>response.json()).then(data=>queryResponseObject = data);
        console.log(queryResponseObject.result);
        return queryResponseObject;
    }

}