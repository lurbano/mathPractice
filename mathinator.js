var doc = document;
//
//
//
// SECTION: WORKSHEETS
//
//
//
class Worksheet {

    constructor ({
        questionsList = [],
        questionsDiv_id = "Questions",
        scoreDiv_id = "Score",
        liveScore = false
    }){
        this.questionsList = questionsList;
        this.questionsDiv_id = questionsDiv_id;
        this.questionsDiv = doc.getElementById(questionsDiv_id);
        this.scoreDiv_id = scoreDiv_id;
        this.scoreDiv = doc.getElementById(scoreDiv_id);

        // set up score display
        this.scoreDiv = doc.getElementById(scoreDiv_id);
        // add score button
        this.scoreButton = doc.createElement('input');
        this.scoreButton.type = "button";
        this.scoreButton.value = "Show Score";
        this.scoreButton.classList.add('scoreButton');
        this.scoreButton.addEventListener("click", () => {this.showScores()});
        this.scoreDiv.appendChild(this.scoreButton);
        // add table for results
        this.scoreTable = doc.createElement("div");
        this.scoreDiv.appendChild(this.scoreTable);

        this.insertQuestions({});

    }

    insertQuestions(){

        for (const [i, question] of this.questionsList.entries()){
            const n = i+1;
            let div = doc.createElement('div');
            div.id = `Q_${n}`;
            div.classList.add("outerQuestionBox");
            
            // number
            let qnumSpan = doc.createElement("span");
            qnumSpan.innerHTML = `${n}) `;
            div.appendChild(qnumSpan);
    
            // questionArea
            let qArea = doc.createElement("span");
            qArea.id = `qArea_${n}`;
            div.appendChild(qArea);
    
            this.questionsDiv.appendChild(div);
    
            // question
            if (question instanceof FractionQuestion){
                question.insertIntoDiv(qArea.id);
            }

            if (question instanceof AlgebraQuestion) {
                question.insertIntoDiv({div:qArea.id});
            }
            
            
        }

    }

    showScores(){
        
        let ncols = 4
        this.scoreTable.innerHTML = "";
        this.scoreTable.style.display = 'grid';
        this.scoreTable.style.gridTemplateColumns = `repeat(${ncols}, auto)`;

        let nCorrect = 0;
        let nWrong = 0;
        let nNoAnswer = 0;
        let nQuestions = this.questionsList.length;
        let totalScore = 0;

        //score table

        // columns
        let qCol = 1; //question column
        let uaCol = 2; //user answer column
        let iscCol = 3; // is correct column
        let nTriesCol = 4; // number of tries
        let scoreCol = 5; // score column

        // headers
        this.putInScoreTable({ data: "#", 
            row: 1, 
            col: qCol,
            isHeader: true
        }); // question #
        this.putInScoreTable({ data: "Your Answer", 
            row: 1,
            col: uaCol,
            isHeader: true
        });
        this.putInScoreTable({data: "Correct", 
            row: 1, 
            col: iscCol,
            isHeader: true
        });
        this.putInScoreTable({data: "Tries", 
            row: 1, 
            col: nTriesCol,
            isHeader: true
        });
        this.putInScoreTable({data: "Score", 
            row: 1, 
            col: scoreCol,
            isHeader: true
        });
        
        let row = 0;

        for (const [i, question] of this.questionsList.entries()){

            row = i+2;

            let qScore = 0;
            
            //number
            let qDiv = doc.createElement('div');
            qDiv.innerHTML = `${i+1})`;
            this.putInScoreTable({data: qDiv, 
                row: row, 
                col: qCol});

            // user answer column
            let uaDiv = doc.createElement('div');

            // isCorrect column
            let iscDiv = doc.createElement('div');

            // nTries column
            let nTriesDiv = doc.createElement('div');
            let nTries = question.userResults.length;
            nTriesDiv.innerHTML = nTries;
            this.putInScoreTable({ data: nTriesDiv, 
                row: row, 
                col: nTriesCol});

            // score column
            let scoreDiv = doc.createElement('div');
            
            if (nTries > 0) {
                
                let lastTry = question.userResults[question.userResults.length-1];
                console.log("Last Try: ", lastTry);

                let ua = lastTry.userAnswer.getElement();
                uaDiv.innerHTML = "";
                uaDiv.appendChild(ua);
                // let s = "x"

                if (lastTry.isCorrect){
                    iscDiv.innerHTML = "✔";
                    iscDiv.style.backgroundColor = "aqua";
                    qScore += lastTry.score;
                    // s = new Fraction(lastTry.score,10);
                    nCorrect++;
                } else {
                    iscDiv.innerHTML = "✘";
                    iscDiv.style.backgroundColor = "lightpink";
                    qScore = 1;
                    // s = strToFraction("1/10");
                    nWrong++;
                }
                let s = new Fraction(qScore, 10);
                console.log("Score:", s);
                scoreDiv.appendChild(s.getElement());

            } else {
                uaDiv.innerHTML = "No Answer";
                scoreDiv.innerHTML = "0";
                qScore = 0;
                nNoAnswer++;
            }

            this.putInScoreTable({ data: uaDiv, 
                row: row, 
                col: uaCol });
            this.putInScoreTable({ data: iscDiv, 
                row: row, 
                col: iscCol});
            this.putInScoreTable({ data: scoreDiv, 
                row: row, 
                col: scoreCol});
            totalScore += qScore;
        }

        console.log(`Correct: ${nCorrect}; Wrong: ${nWrong}; No Answer: ${nNoAnswer}; Total Questions: ${nQuestions}`);
        console.log(`Final Score: ${totalScore}/${nQuestions*10}`);

        let fin = new Fraction(totalScore, nQuestions*10);
        let finElement = fin.getElement();
        finElement.style.borderTop = '4px double black';
        finElement.style.marginTop = '10px;';
        this.putInScoreTable({data: finElement, 
            row: row+1,
            col: scoreCol
        })
    }

    putInScoreTable({
        data = "", 
        row = 1, 
        col = 1,
        isHeader = false
    }){

        // can handle text, html text and div Elements
        let div = doc.createElement('div');
        if (typeof data === 'string') {
            div.innerHTML = data;
        } 
        else if (data instanceof Element) {
            div.appendChild(data);
        }
        div.style.gridRow = row;
        div.style.gridColumn = col;

        if (isHeader){
            div.style.borderBottom = "1px solid black";
        }
        this.scoreTable.appendChild(div);
    }

}





// 
//
//
// SECTION: FRACTIONS
//
//
//

let showElementBorders = false;

class Fraction {
    constructor(numerator=0, denominator=1) {
        this.isValid = false; 

        try {
            //check if denominator is a number
            denominator = parseInt(denominator);
            if (typeof denominator === "number" && Number.isFinite(denominator)) {
                this.denominator = denominator;
            } else {
                throw new Error(`Denominator is not a number: ${denominator}`);
            }

            //check if numerator is a number
            numerator = parseInt(numerator);
            if (typeof  numerator === "number" && Number.isFinite(numerator)) {
                this.numerator = numerator;
            } else {
                throw new Error(`Numerator is not a number: ${numerator}`);
            }

            //check for divide by zero error
            if (this.denominator !== 0){
                this.divideByZero = false;
            } else {
                this.reduced = undefined;
                this.divideByZero = true;
                throw new Error("Fraction: divide by zero");
            }

            // passed tests so:
            this.isValid = true;

        } catch (error) {
            this.isValid = false;
            console.log(error);
        }

        if (this.isValid) {
            if (this.isReducable()){
                this.reduced = this.reduce(); //reduced fraction
            } else {
                this.reduced = this;
            }

            // for negative fraction, make sure the numerator
            //   is negative and the denominator is positive.
            if (this.numerator/this.denominator < 0) {
                this.numerator = -1 * Math.abs(this.numerator);
                this.denominator = Math.abs(this.denominator);
            }
        }

    }

    getElement(){
        let frac = doc.createElement('span');
        frac.style.display = 'inline-block';
        frac.style.textAlign = "center";
        frac.style.verticalAlign = "middle";

        if (this.isValid) {
            let n = doc.createElement('span');
            n.style.display = 'block';
            n.style.borderBottom = '1px solid #000';
            n.style.padding = '0 5px';
            n.innerText = this.numerator;

            let d = doc.createElement('span');
            d.style.display = 'block';
            d.style.padding = '0 5px';
            if (typeof this.denominator === "number" 
                && Number.isFinite(this.denominator)){
                    d.innerText = this.denominator;
            } else {
                d.innerText = " ";
            }
            

            frac.appendChild(n);
            frac.appendChild(d);
        } else {
            let n = doc.createTextNode("NaF");
            frac.appendChild(n);
        }

        return frac;
    }

    insertElement(div_id, replace=false) {
        let div = doc.getElementById(div_id);
        if (replace) {
            div.innerHTML = "";
        } 
        div.appendChild(this.getElement());
    }

    isReducable() {
        if (this.divideByZero || !this.isValid) return false;

        const commonDivisor = gcd(Math.abs(this.numerator), Math.abs(this.denominator));
        const r = commonDivisor === 1 ? false : true;
        return r;
    }

    reduce() {
        // Reduce the fraction to its simplest form
        if (this.isValid) {
            if (this.isReducable){
                const commonDivisor = gcd(this.numerator,this.denominator);
                let numerator = this.numerator;
                let denominator = this.denominator;
                numerator /= commonDivisor;
                denominator /= commonDivisor;    
                return new Fraction(numerator, denominator);
            } else {
                return this;
            }
        } else {
            return false;
        }
    }

    //
    // cert above
    //
    isNegative(){
        let result = undefined;
        // console.log("isNegative (isValid?):", this.isValid)
        if (this.isValid){
            result = ( (this.numerator / this.denominator) < 0 ) ? true : false;
        }
        return result;
    }

    toMixed(){
        if (this.isValid){

            let wholeNumber = Math.floor(Math.abs(this.numerator) 
                                         / Math.abs(this.denominator));
            let remainder = Math.abs(this.numerator % this.denominator); 

            if (this.isNegative()){
                if (wholeNumber === 0){
                    remainder *= -1;
                } else {
                    wholeNumber *= -1;
                }
                
            } 
            let frac = new Fraction(remainder, this.denominator);
            return new mixedNumber(wholeNumber, frac.reduced);
    
        } else {
            return false;
        }
    }

    isImproper(){
        if (this.isValid && (this.numerator > this.denominator)) {
            return true;
        } else {
            return false;
        }
    }

    toString() {
        let txt = this.isValid ? `${this.numerator}/${this.denominator}` : "NaF";
        return txt;
    }

    toFloat(){
        return this.numerator/this.denominator;
    }

    insertString(div_id){
        let div = doc.getElementById(div_id);
        div.appendChild(doc.createTextNode(this.toString()));
    }
 
    isSameAs(frac, reduced=true){
        let result = false;
        if (!(frac instanceof Fraction)){
            console.log("ERROR: Fraction isSameAs, input is not a fraction.", frac);
            return false;
        }
        if (this.isValid && frac.isValid) {
            let f1 = reduced ? this.reduced : this;
            let f2 = reduced ? frac.reduced : frac;

            if ((f1.numerator === f2.numerator) &&
                (f1.denominator === f2.denominator)){
                result = true;
            } 
            if (f1.numerator === 0 && f2.numerator === 0){
                result = true;
            }
        }
        return result;
    }

    multiplyByWhole(whole){
        return new Fraction(this.numerator*whole, this.denominator);
    }
    getReciprocal(){
        return new Fraction(this.denominator, this.numerator);
    }
}

class mixedNumber{
    constructor(whole = 0, frac = new Fraction()){
        this.whole = parseInt(whole);
        if (typeof whole === "number" && Number.isFinite(whole)) {
            this.isValid = true;
        } else {
            this.isValid = false;
        }

        this.frac = frac;
        if (this.isValid && frac.isValid){
            this.isValid = true;
        } else {
            this.isValid = false;
        }
        
    }

    toFraction(){
        let n = this.frac.numerator;

        if (this.whole === 0){
            
        } else if (this.whole < 0) {
            n = this.whole * this.frac.denominator - n;
        } else {
            n += this.whole * this.frac.denominator;
        }

        return new Fraction(n, this.frac.denominator);

    }

    toMixed(){
        return this;
    }

    simplify(){
        let frac = this.toFraction();
        return frac.toMixed();
    }

    toString(full=false){
        let txt = '';
        if (full || this.whole !== 0){
            txt += `${this.whole} ${this.frac.toString()}`;
        } else {
            txt += this.frac.toString();
        }
        return txt;
    }

    insertString(div_id){
        let div = doc.getElementById(div_id);
        div.appendChild(doc.createTextNode(this.toString()));
    }

    toHTML(){
        if (this.whole === 0) {
            return this.frac.toHTML();
        } else if (this.frac.numerator === 0) {
            return this.whole;
        } else {
            return `${this.whole} ${this.frac.toHTML()}`;
        }
    }
    
    // to show in fraction form
    getElement(width=undefined) {
        let m = doc.createElement('span');
        m.style.display = 'inline-block';
        m.style.alignItems = 'center';
        if (width !== undefined){
            m.style.width = width;
        }
        
        if (this.whole !== 0 || this.frac.numerator === 0) {
            let whole = doc.createTextNode(this.whole);
            m.appendChild(whole);
        }

        if (this.frac.numerator !== 0){
            m.appendChild(this.frac.getElement());
        } 
        
        return m;
    }
    
    insertElement(div_id, replace=false, width='2em'){
        // console.log("REPLACE:", replace);
        let div = doc.getElementById(div_id);
        if (replace) div.innerHTML = "";
        div.appendChild(this.getElement(width));
    }

    isReducable(){
        return this.frac.isReducable();
    }

    isImproper(){
        return this.frac.isImproper();
    }

    isSameAs(input){
        let frac = this.toFraction();
        if (input instanceof Fraction){
            // good to go
        } else if (input instanceof mixedNumber) {
            input = input.toFraction();
        }
        return frac.isSameAs(input);
    }

}




function lcm(a, b) {
    // Least Common Multiple
    return (a * b) / gcd(a, b);
}

function addFractions(frac1, frac2, reduce=false) {
    // frac1 and frac2 should be objects with 'numerator' and 'denominator' properties
    const numerator1 = frac1.numerator;
    const denominator1 = frac1.denominator;
    const numerator2 = frac2.numerator;
    const denominator2 = frac2.denominator;

    // Find the least common multiple of the denominators
    const commonDenominator = lcm(denominator1, denominator2);

    // Adjust the numerators based on the common denominator
    const adjustedNumerator1 = numerator1 * (commonDenominator / denominator1);
    const adjustedNumerator2 = numerator2 * (commonDenominator / denominator2);

    // Sum the adjusted numerators
    const sumNumerator = adjustedNumerator1 + adjustedNumerator2;

    // Reduce the resulting fraction
    if (reduce){
        const commonDivisor = gcd(sumNumerator, commonDenominator);
        const reducedNumerator = sumNumerator / commonDivisor;
        const reducedDenominator = commonDenominator / commonDivisor;
        result = new Fraction(reducedNumerator, reducedDenominator);
    } else {
        result = new Fraction(sumNumerator, commonDenominator);
    }

    // Return the resulting fraction as an object
    return result;
}

function multiplyFractions(frac1, frac2){
    const numerator = frac1.numerator * frac2.numerator;
    const denominator = frac1.denominator * frac2.denominator;
    result = new Fraction(numerator, denominator);
    return result;
}

function divideFractions(frac1, frac2){
    const numerator = frac1.numerator * frac2.denominator;
    const denominator = frac1.denominator * frac2.numerator;
    result = new Fraction(numerator, denominator);
    return result;
}


function addMixedNumbers(m1, m2){

    let f1 = m1;
    let f2 = m2;

    let result = addFractions(m1.makeImproper(), m2.makeImproper())
    return result.mixed()

}

function subtractMixedNumbers(m1, m2){
    let f1 = m1.makeImproper();
    let f2 = m2.makeImproper().multiplyByWhole(-1);
    console.log(`Subtract Improper: (adding): ${f1.toString()},  ${f2.toString()}`)
    let result = addFractions(f1, f2)
    console.log(`Result: ${result.toString()} = ${result.mixed().toString()}`);
    return result.mixed()
}



function gridDiv(html="", gridClass=undefined){
    let div = doc.createElement('div');
    div.innerHTML = html;
    div.classList.add('question-item');
    if (gridClass !== undefined){
        div.classList.add(gridClass);
    } 
    return div;
}

function strToFraction(input, toFraction=true){
    return parseMixedNumber(input, toFraction);
}

/**
 * Parses a string into a whole number part, a numerator, and a denominator.
 * @param {string} input - The string to be parsed.
 * @returns {Object} An object containing the whole number, numerator, and denominator.
 */
function parseMixedNumber(input, toFraction=true) {
    if (typeof input !== 'string' || input.trim() === '') {
        throw new Error('Invalid input: input must be a non-empty string.');
    }

    let whole = 0;
    let frac = new Fraction();

    // remove multiple spaces
    input = input.replace(/\s+/g, ' ');
    // remove spaces before and after slash
    input = input.replace(/\s+\//g, '/');
    input = input.replace(/\/\s+/g, '/');
    // Split the string by spaces
    let parts = input.trim().split(' ');
    
    if (parts.length === 2) {
        // The second part is the fraction
        frac = parseFraction(parts[1]);

        // If there are two parts, the first part is the whole number
        if (parts[0] === '-') {
            whole = 0;
            frac = frac.multiplyByWhole(-1); // make fraction negative
        } else {
            whole = parseInt(parts[0], 10);
        }
        
        

    } else if (parts.length === 1) {
        // If there is only one part, it could be a whole number or a fraction
        if (parts[0].includes('/')) {
            frac = parseFraction(parts[0]);
        } else {
            // It's a whole number
            whole = parseInt(parts[0], 10);
        }
    } else {
        // throw new Error('3. Invalid input format.');
        whole = "NaF";
    }

    let result = new mixedNumber(whole, frac);

    if (toFraction){
        return result.toFraction()
    } else {
        return result;
    }
    
}

function parseFraction(input){
    if (typeof input !== 'string' || input.trim() === '') {
        console.log("parseFraction Error: 1")
        return new Fraction();
    }
    let fractionParts = input.split('/');
    if (fractionParts.length === 2) {
        let n = parseInt(fractionParts[0], 10);
        let d = parseInt(fractionParts[1], 10);
        //check if numbers
        if (typeof n === "number" && Number.isFinite(n)){
            numPart = n;
        } else {
            numPart = 0;
            console.log("Error: parseFraction: numerator not a number");
        }

        if (typeof d === "number" && Number.isFinite(d)){
            denomPart = d;
        } else {
            denomPart = 0;
            console.log("Error: parseFraction: denominator not a number");
        }
        return new Fraction(numPart, denomPart);
    } else {
        return new Fraction();
    }
}

// FUNCTIONS

function gcd(a, b) {
    // Greatest Common Divisor using Euclidean algorithm
    if (a !== 0){
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
    } else {
        a = 1;
    }
    return a;
}

function insertEqualSign(div_id){
    let div = document.getElementById(div_id);
    div.appendChild(document.createTextNode('='));
}

function subtractFractionFromWhole(whole, frac){

}

class FractionQuestion{

    constructor({
        fracs = [],
        operation = "+",
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true,
        notSimplifiedPenalty = 4  //penalty out of 10
    }) {
        // fracs is an array of Fraction or mixedNumber instances or string of fraction or mixed numbers

        this.fracsInput = fracs;
        this.notSimplifiedPenalty = notSimplifiedPenalty;
        this.fracs = [];
        this.col = 0;

        this.displayAsMixed = displayAsMixed;

 
        // Error checking
        for (let i in fracs){
            if (fracs[i] instanceof Fraction){
                this.fracs.push(fracs[i]);
            } else if (fracs[i] instanceof mixedNumber){
                this.fracs.push(fracs[i].toFraction());
            } else if ((typeof fracs[i] === 'string') && (strToFraction(fracs[i]).isValid)){
                let frac = strToFraction(fracs[i]);
                this.fracsInput[i] = frac;
                this.fracs.push( frac );
            } else {
                throw new Error(`Error: frac[${i}] (${fracs[i]}) needs to be a Fraction or mixedNumber or a fraction/mixed number in string form.`);
            }
        }

        if (operation === "-"){
            // - only works for two fractions at the moment
            this.operator = "-"
            this.fracs[1] = this.fracs[1].multiplyByWhole(-1);
            this.result = addFractions(this.fracs[0], this.fracs[1]);
        } 
        else if (operation === "+"){
            this.operator = "+";
            this.result = new Fraction();
            for (let i in this.fracs){
                this.result = addFractions(this.result, this.fracs[i]);
            }
        } 
        else if (operation === "x" || operation === "×"){
            this.operator = "×"
            this.result = new Fraction(1,1);
            for (let i in this.fracs){
                this.result = multiplyFractions(this.result, this.fracs[i]);
            }
        }
        else if (["/", "÷"].includes(operation)){
            this.operator = '÷';
            // - only works for two fractions at the moment
            this.result = divideFractions(this.fracs[0], this.fracs[1]);

        }
        else {
            throw new Error(`Incorrect operator (${operator}). Should be "+" or "-" or "x"`)
        }
        
        this.questionRow = 1;
        if (div_id !== undefined){
            this.insertIntoDiv(div_id, instructions);
        }

        //results tries array
        this.userResults = [];
        
    }

    insertIntoDiv(div_id, instructions=""){
        this.divContainer = doc.getElementById(div_id);
        this.nrows = 0;
        this.ncols = 8;

        // Add instructions
        if (instructions) {
            this.instructionsDiv = doc.createElement('div');
            this.instructionsDiv.innerHTML = instructions;
            this.divContainer.appendChild(this.instructionsDiv);
        }

        // Create div for question
        this.div = doc.createElement('div');
        this.div.style.display = 'grid';

        this.div.style.gridTemplateColumns = `repeat(${this.ncols}, auto)`;
        // this.div.style.gridTemplateRows = '2fr';
        this.div.classList.add("questionBox");
        // this.div.style.border = '1px solid red';
        // this.div.style.alignItems = 'center';

        this.answer = {};

        this.insertQuestionRow();

        this.userResultsDiv = doc.createElement('div');
        this.userResultsDiv.style.border = '1px solid green';
        this.userResultsDiv.innerHTML = "Results: "
        this.divContainer.appendChild(this.userResultsDiv);

    }

    insertInstructions(div_id){
        let instructions = 'Add:';

        let insDiv = doc.getElementById(div_id);
        insDiv.innerHTML = instructions;
    }

    insertQuestionRow(){
        // this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        // this.div.style.alignItems = "center";
        
        for (let i in this.fracsInput){
            this.col = 2*i+2;
            this.insertFraction(this.fracsInput[i], this.questionRow, this.col);
            this.col += 1;
            if (i < this.fracsInput.length-1){
                this.insertOperator(this.operator, this.questionRow, this.col);
            }
        }
        
        this.insertOperator("=", this.questionRow, this.col);
        this.equalCol = this.col + 1;
        this.insertAnswerTextInput(this.questionRow,this.equalCol);
        
        this.insertOperator("=", this.questionRow, this.col+2);
        this.insertAnswerDisplay(this.questionRow,this.col+3);
        
        this.divContainer.appendChild(this.div);

    }

    insertAnswerDisplay(r,c){
        this.answerTextDisplay = doc.createElement("span");
        this.answerTextDisplay.style.gridRow = r;
        this.answerTextDisplay.style.gridColumn = c;
        this.answerTextDisplay.style.backgroundColor = "aquamarine";
        this.answerTextDisplay.style.width = "5em";
        //this.answerTextDisplay.innerHTML = "hi";
        this.div.appendChild(this.answerTextDisplay);
    
    }

    insertAnswerTextInput(r,c){
        this.answerTextInput = doc.createElement("input");
        this.answerTextInput.type = "text";
        this.answerTextInput.style.gridRow = r;
        this.answerTextInput.style.gridColumn = c;
        this.answerTextInput.style.width = '5em';
        this.answerTextInput.style.backgroundColor = "lightblue";

        this.answerTextInput.classList.add("answerTextInput");

        this.answerTextInput.addEventListener("keyup", () => {
            this.answer = parseMixedNumber(this.answerTextInput.value, false);

            if (this.answer.isValid){
                this.answerTextDisplay.style.backgroundColor = 'lightgreen';
                this.answerTextDisplay.innerHTML = "";
                this.answerTextDisplay.appendChild(this.answer.getElement());
                this.answerTextInput.style.backgroundColor = 'lightblue';
            } else {
                this.answerTextDisplay.style.backgroundColor = 'darksalmon';
                this.answerTextInput.style.backgroundColor = 'darksalmon';
            }
        })
        this.answerTextInput.addEventListener('change', () => {
            this.answer = strToFraction(this.answerTextInput.value);
            this.checkAnswer();
        })

        this.div.appendChild(this.answerTextInput);
    }

    insertAnswerButton(r,c){
        this.div.appendChild(this.getAnswerButton(r,c));
    }

    insertFraction(frac, r, c){
        let div = this.displayAsMixed ? frac.toMixed().getElement() : frac.getElement();
        div.style.gridRow = r;
        div.style.gridColumn = c;
        if (showElementBorders) div.style.border = '1px solid blue';
        div.style.width = '3em';
        this.div.appendChild(div);
    }

    getTextSpan(txt, r, c){
        let div = doc.createElement('span');
        div.innerText = txt;
        div.style.gridRow = `${r}`;
        div.style.gridCol = `${c}`;
        if (showElementBorders) div.style.border = '1px solid blue';

        return div;
    }

    getAnswerButton(r, c){
        let div = doc.createElement('input');
        div.type = 'button';
        div.value = 'Check';
        div.style.gridColumn = c;
        div.style.gridRow = r;
        div.style.width = '6em';

        div.addEventListener('click', ()=> {
            this.checkAnswer();
        })

        return div;
    }


    insertOperator(txt, r, c){
        let div = this.getOperatorSpan(txt);
        div.style.gridRow = r;
        div.style.gridColumn = c;
        div.style.justifySelf = 'center';
        div.style.width = "1em";
        if (showElementBorders) div.style.border = '1px solid blue';

        this.div.appendChild(div);
    }

    getOperatorSpan(txt){
        let p = doc.createElement("span");
        p.style.display = 'flex';
        p.style.alignItems = 'center';
        p.style.paddingRight = '0.5em';
        p.style.paddingLeft = '0.5em';
        // p.style.border = '1px solid blue';
        p.innerText = txt;
        return p;
    }


    checkAnswer(){
        // Note: this.answer is continuously updated 
        //       with the updates of the input text box

        let note = '';
        let score = 0;
        
        this.userAnswer = strToFraction(this.answerTextInput.value, false);
        this.userAnswerFraction = this.userAnswer.toFraction();

        console.log("User Answer: ", this.userAnswer.toString(), this.userAnswerFraction instanceof Fraction);
        console.log("Computed answer: result: ", this.result.toString());

        if (this.userAnswer.isSameAs(this.result)){
            this.answerIsCorrect = true;
            score = 10;
            note = note + " is correct. ";
            let l_reducable = false;
            if (this.userAnswer.isReducable()){
                note = note + "But is reducable. ";
                l_reducable = true;
            }
            if (this.userAnswer.isImproper()){
                note = note + 'Reducable to a mixed or whole number.';
                l_reducable = true;
            }
            if (l_reducable) {
                score -= this.notSimplifiedPenalty;
            }
            
        } else {
            this.answerIsCorrect = false;
            score = 1;
            note += " is incorrect. "
        }
        
        let r = new fractionResult({
            userAnswer: this.userAnswer,
            correctAnswer: this.mixedSum,
            note: note,
            isCorrect: this.answerIsCorrect,
            score: score
        })
        this.userResults.push(r);
        this.insertResults();

    }

    insertResults(){
        this.userResultsDiv.innerHTML = "";
        for (const result of this.userResults) {
            let div = doc.createElement('div');
            div.appendChild(result['userAnswer'].getElement());
            div.appendChild(doc.createTextNode(result['note']));

            div.style.backgroundColor = result['isCorrect'] ? 'lightGreen' : 'darkSalmon';
            this.userResultsDiv.appendChild(div);
        }

    }

    insertCommentRow(html){
        this.nrows += 1;
        this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        
        let div = doc.createElement('span');
        div.style.border = '1px solid blue';
        //div.style.gridColumn = `1 / ${this.ncols+1}`;

        div.innerHTML = html;
        this.div.appendChild(div);
    }
    
}

class AdditionQuestion extends FractionQuestion {

    constructor({
        fracs = [],
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true
    }){

        let data = {
            fracs: fracs,
            div_id: div_id,
            instructions: instructions,
            displayAsMixed: displayAsMixed,
            operation: "+"
        }

        super(data);
    }
}

class SubtractionQuestion extends FractionQuestion {

    constructor({
        fracs = [],
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true
    }){

        let data = {
            fracs: fracs,
            div_id: div_id,
            instructions: instructions,
            displayAsMixed: displayAsMixed,
            operation: "-"
        }

        super(data);
    }
}

class MultiplicationQuestion extends FractionQuestion {

    constructor({
        fracs = [],
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true
    }){

        let data = {
            fracs: fracs,
            div_id: div_id,
            instructions: instructions,
            displayAsMixed: displayAsMixed,
            operation: "x"
        }

        super(data);
    }
}

class DivisionQuestion extends FractionQuestion {

    constructor({
        fracs = [],
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true
    }){

        let data = {
            fracs: fracs,
            div_id: div_id,
            instructions: instructions,
            displayAsMixed: displayAsMixed,
            operation: "/"
        }

        super(data);
    }
}



// generate a random fraction
function randomFraction({
        minNumerator = 0,
        maxNumerator = 9,
        minDenominator = 1,
        maxDenominator = 9,
        noZeroDenominator = true, 
        noZero = true,
        l_proper = true,
        noWholeNumber = true
    }){

        let d = randInt(minDenominator, maxDenominator, noZeroDenominator);

        let maxNum = l_proper ? d : maxNumerator;
        let n = randInt(minNumerator, maxNum, noZero);

        if (noWholeNumber && n === d) {
            let ct = 0;
            while (n === d && ct < 20){
                d = randInt(2, maxDenominator, noZeroDenominator);

                maxNum = l_proper ? d : maxNumerator;
                n = randInt(minNumerator, maxNum, noZero);
                ct++;
            }
        }
        
        return new Fraction(n, d);
        
}

class RandomFractionQuestion extends FractionQuestion {

    constructor({
        operation = "+",
        minNumerator = 0,
        maxNumerator = 9,
        minNumerator2 = minNumerator,
        maxNumerator2 = maxNumerator,
        minDenominator = 1,
        maxDenominator = 9,
        minDenominator2 = minDenominator,
        maxDenominator2 = maxDenominator,
        div_id = undefined,
        instructions = "", 
        displayAsMixed = true,
        noZeroDenominator = true, 
        noZero = true,
        l_proper = true,
        noWholeNumber = true,
        positiveResultForSubtraction = true
    }){

        let f1 = randomFraction({
            minNumerator: minNumerator,
            maxNumerator: maxNumerator,
            minDenominator: minDenominator,
            maxDenominator: maxDenominator, 
            noZeroDenominator: noZeroDenominator, 
            noZero: noZero,
            l_proper: l_proper,
            noWholeNumber: noWholeNumber
        })

        let f2 = randomFraction({
            minNumerator: minNumerator2,
            maxNumerator: maxNumerator2,
            minDenominator: minDenominator2,
            maxDenominator: maxDenominator2,
            noZeroDenominator: noZeroDenominator, 
            noZero: noZero,
            l_proper: l_proper,
            noWholeNumber: noWholeNumber
        })

        //SUBTRACTION SPECIAL CONDITIONS
        if (
            (operation === "-") &&
             positiveResultForSubtraction &&
            (f1.toFloat() < f2.toFloat())
        ){
            let ct = 0;
            while ((f1.toFloat() < f2.toFloat()) && ct < 20){
                f1 = randomFraction({
                    minNumerator: minNumerator,
                    maxNumerator: maxNumerator,
                    minDenominator: minDenominator,
                    maxDenominator: maxDenominator, 
                    noZeroDenominator: noZeroDenominator, 
                    noZero: noZero,
                    l_proper: l_proper,
                    noWholeNumber: noWholeNumber
                })
        
                f2 = randomFraction({
                    minNumerator: minNumerator2,
                    maxNumerator: maxNumerator2,
                    minDenominator: minDenominator2,
                    maxDenominator: maxDenominator2,
                    noZeroDenominator: noZeroDenominator, 
                    noZero: noZero,
                    l_proper: l_proper,
                    noWholeNumber: noWholeNumber
                })
                ct++;
               
            }
            
        }



        let fracs = [f1, f2];
        
        let data = {
            fracs: fracs,
            div_id: div_id,
            instructions: instructions,
            displayAsMixed: displayAsMixed,
            operation: operation
        }

        super(data);
    }
}

class fractionResult {

    constructor({
        userAnswer = undefined,
        correctAnswer = undefined,
        note = "",
        isCorrect = undefined, 
        score = 0
    }){
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
        this.note = note;
        this.isCorrect = isCorrect;
        this.score = score;
    }
}

function putInGrid(div, row, col){
    div.style.gridRow = row;
    div.style.gridColumn = col;
}







// 
//
//
// SECTION: ALGEBRA
//
//
//
// NOTES ON THE CLASSES
//
// A Variable has a letter and its exponent: "x^3"
// A Term has a coefficient (coeff) and an array of Variable's
// An AlgebraicExperssion has an array of Terms
// An Equation has an array of AlgebraicExperssion's

class Variable {
    constructor({
        character = "x",  // variable character
        exp = 1   // exponent
    }){
        this.character = character;
        this.exp = parseFloat(exp);
    }
    isSameAs(v){
        let test = ((this.character === v.character) && (this.exp === v.exp)) ? true : false;
        return test;
    }
    toString(){
        let s = this.character;
        if (String(this.exp) !== '1'){
            s = s + `^${this.exp}`;
        }
        return s;
    }
    getHTML({
        showAllExponents = false,
        afterSpace = ""
    }={}){
        let html = this.character;
        if (showAllExponents || this.exp != 1){
            html = html + `<sup>${this.exp}</sup>`;
        } 
        html = html + afterSpace;
        return html;
    }
    getSPAN({
        showAllExponents = false,
        margin = "3px"
    }={}){
        let s = document.createElement('span');
        s.innerHTML = this.getHTML({showAllExponents:showAllExponents});
        s.style.marginRight = margin;
        return s;
    }
}

function parseVariable(s){
    if (s.length === 1){
        return new Variable({
            character: s
        });
    }
    else if (s.includes("^")){
        let parts = s.split("^");
        return new Variable({
            character: parts[0], exp: parts[1]
        })
    }
    else {
        console.log("Parse Variable Error:", s);
        return undefined;
    }
    
   
}

function getNextVariable(s){
    // assumes no constant
    // returns the variable and the remaining string

    let v = s[0];
    s = s.slice(1);
    while ("0123456789.^".includes(s[0])){
        v = v + s[0];
        s = s.slice(1);
    }
    v = parseVariable(v);
    return [v, s];
}

function getVariables(s){
    //gets variables from string: assumes no constant
    let variables = [];
    let v = "";
    while (s.length > 0) {
        [variable, s] = getNextVariable(s);
        variables.push(variable);
    }
    return variables;
}

class Term {
    constructor({
        coeff = 1,          // a coefficient
        variables = [],      // a list of Varaibles
        cFrac = undefined   // coefficient as a fraction if applicable
    }={}) {
        this.coeff = coeff;
        this.variables = variables;
        this.cFrac = cFrac;
        if (cFrac instanceof Fraction){
            coeff = cFrac.toFloat();
        }
    }

    sort(){ //sort variables
        let tmp = this.variables;
        tmp.sort((a, b) => a.character.localeCompare(b.character));
        return new Term({
            coeff: this.coeff,
            variables: tmp
        });
    }

    isSameAs(term){
        if (term.coeff == this.coeff && this.isSimilarTo(term)){
            return true;
        } else {
            return false;
        }
    }

    isSimilarTo(term){
        // is term similar to (has the same variables as) this Term
        if (this.variables.length !== term.variables.length){
            return false;
        }
        let v1 = this.sort().variables;
        let v2 = term.sort().variables;
        for (let i in v1){
            if (!v1[i].isSameAs(v2[i])){
                return false;
            }
        }
        return true; // if it passes all checks
    }

    isConstant(){
        return this.variables.length > 0 ? false : true; 
    }

    divideByConstant(c){
        c = this.coeff / c;
        return new Term({
            coeff: c,
            variables: this.variables
        });
    }

    add(t){ // add term (t) to this term
        if (this.isSimilarTo(t)){
            let c = this.coeff + t.coeff;
            return new Term({
                coeff: c,
                variables: this.variables
            })
        }
        return false; // if not similar
    }

    simplify(){
        //combine varaibles x^2·x^3 = x^5
        let vSimp = [];
        for (let v of this.variables){
            let l_addToList = true;
            for (let [i,vs] of vSimp.entries()){
                if (v.character === vs.character) {
                    l_addToList = false;
                    vSimp[i].exp += v.exp;
                }
            }
            if (l_addToList) vSimp.push(v);
        }

        return new Term({
            coeff: this.coeff, 
            variables: vSimp
        });
    }

    toString(showSign=false){
        
        let sign = "";
        if (showSign || this.coeff < 0){
            sign = this.coeff > 0 ? "+" : "−";
        }

        //coefficient
        let c = Math.abs(this.coeff) + "";
        
        if (c === "1" && this.variables.length > 0) c = "";

        let s = sign + c;

        for (let v of this.variables){
            s = s + v.toString();
        }
        return s;
    }

    insertIntoDiv(div, {showDots=false, showSign=false}={}, signSpace='2px'){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 

        let signSpan = document.createElement('span');

        let sign = "";
        if (showSign || this.coeff < 0){
            sign = this.coeff > 0 ? "+" : "−";
        }

        //coefficient
        let c = Math.abs(this.coeff) + "";
        if (c === "1" && this.variables.length > 0) {
            c =  "";
        }

        if (this.cFrac instanceof Fraction){
            let fDiv = this.cFrac.getElement();
            signSpan.appendChild(fDiv);
        } else {
            signSpan.innerHTML = sign + c;
        }
        
        
        signSpan.style.marginRight = signSpace;
        div.appendChild(signSpan);

        if (showDots && this.variables.length > 0){
            appendDot(div);
        }

        for (let [i, v] of this.variables.entries()){
            div.appendChild(v.getSPAN());
            if (showDots && i < this.variables.length-1) {
                appendDot(div);
            }
        }

    }
}

function parseTerm(input="x"){
    // term must have coefficient first then variables, no mixing of coefficients and variables in the input string.
    let sign = 1;
    let c = "";
    let cFrac = undefined;
    let variables = [];
    //check for valid input string
    if (typeof input !== 'string' || input.trim() === '') {
        console.log("parseFraction Error: ", input);
        throw new Error("parseTerm Error.")
        // return false;
    }
    try {
        let s = input.trim();
        s = s.replace(/\s/g, '');
        
        // get constant
        for (const char of s){
            if ("0123456789.+-/".includes(char)){
                c = c + char;
                s = s.slice(1);
            } else {
                break;
            }
        }
        if (c.length === 0){
            c = 1;
            
        } else if (c === "+"){
            c = 1;
        } else if (c === '-'){
            c = -1;
        } else if (c.includes('/')){
            let frac = c.split("/");
            c = parseFloat(frac[0]) / parseFloat(frac[1]);
            if (frac.length === 2) {
                cFrac = new Fraction(parseInt(frac[0]), parseInt(frac[1]));
            }
            
        } else {
            c = parseFloat(c);
        }

        // get variables
        variables = getVariables(s);
        
        

    } catch (Error) {
        console.log("Error with parseTerm.", Error)
    }
    
    return new Term({
        coeff: c,
        variables: variables,
        cFrac: cFrac
    })
}

class AlgebraicExpression {
    constructor({
        terms = []      // a list of Term's
    }) {
        this.terms = terms;
    }

    sort(){
        let tmp = this.terms;
        tmp.sort((a, b) => a.variables.length - b.variables.length);
        return new AlgebraicExpression({
            terms: tmp
        })
    }

    divideByConstant(c){
        let newTerms = [];
        for (let t of this.terms){
            newTerms.push(t.divideByConstant(c));
        }
        return new AlgebraicExpression({terms: newTerms});
    }

    add(e){ //add Expression or Term (e) to this Expression
        if (e instanceof Term){ //if Term make Expression
            e = new AlgebraicExpression({terms:[e]});
        }
        if (!(e instanceof AlgebraicExpression)){
            console.log("add: e needs to be an Expression.")
            return false;
        }

        let expr = new AlgebraicExpression({terms: this.terms.concat(e.terms)});
        expr = expr.simplify();
        return expr;
    }

    toString(){
        let s = this.terms[0].toString();
        for (let [i, t] of this.terms.entries()){
            if (i > 0){
                s = s + t.toString(true);
            } 
        }
        return s;
    }

    simplify(){ // combine like terms
        let eSimp = [];
        for (let t of this.terms){
            let l_addToList = true;
            for (let [i,ts] of eSimp.entries()){
                if (t.isSimilarTo(ts)) {
                    l_addToList = false;
                    eSimp[i] = t.add(ts);
                }
            }
            if (l_addToList) eSimp.push(t);
        }

        // remove zero terms
        let simpTerms = [];
        for (let t of eSimp){
            if (String(t.coeff) !== "0"){
                simpTerms.push(t);
            }
        }
        // add a zero if not terms in expression
        if (simpTerms.length === 0){
            simpTerms.push(parseTerm("0"));
        }
        
        return new AlgebraicExpression({
            terms: simpTerms
        });
    }

    getDiv({showDots=false}={}){
        // div is either the Element or the element's id

        let d = document.createElement('span');

        let mods = {};
        for (let [i, t] of this.terms.entries()){
            if (i > 0){
                mods["showSign"] = true;
            }
            t.insertIntoDiv(d, mods);
        }
        return d;
    }
    insertIntoDiv(div, {showDots=false}={}){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 
        let d = document.createElement('span');

        div.appendChild(this.getDiv());
        // let mods = {};
        // for (let [i, t] of this.terms.entries()){
        //     if (i > 0){
        //         mods["showSign"] = true;
        //     }
        //     t.insertIntoDiv(d, mods);
        // }
        div.appendChild(d);
    }
}


function parseExpression(s){
    if (!checkForString(s)){
        return false;
    }

    s = s.replace(/\s/g, '');; // remove spaces
    let t = "";
    let terms = [];
    // console.log("s:", s)
    for (let c of s){
        // console.log("c,t:", c, t, t.length);
        if ('+-'.includes(c) && t.length > 0){
            terms.push(parseTerm(t));
            t = c;
        } else {
            t = t + c;
        }
    }
    terms.push(parseTerm(t));
    return new AlgebraicExpression({terms:terms});
}


class Equation{
    constructor({
        expressions = []    //list of AlgebraicExpressions
    }){
        this.expressions = expressions;
    }

    solveOneSimilarVariable({showSteps=false, showComments=true, div=""}={}){
        let gridDiv = div;
        let gridRow = 1;
        if (showSteps) {
            if (checkForString(div)){ // if string assume it's the element id
                gridDiv = document.getElementById(div);
            } 
            if (gridDiv === null){
                console.log("Invalid div:", div);
                return false;
            }
        }
        
        if (showSteps) {
            if (showComments){
                gridRow = this.addCommentToGrid({
                    gridDiv: gridDiv, 
                    gridRow: gridRow, 
                    comment: "Solve:"
                })
            }
            gridRow = this.insertIntoGrid(gridDiv, {gridRow: gridRow})
        };

        // console.log("Solving -1.", this.expressions[1]);
        // SIMPLIFY
        let eq = this.simplify();
        // console.log("Solving 0.", eq.expressions[1]);

        if (showSteps) {
            if (showComments){
                gridRow = eq.addCommentToGrid({
                    gridDiv: gridDiv, 
                    gridRow: gridRow, 
                    comment: "Simplify"
                })
            }
            gridRow = eq.insertIntoGrid(gridDiv, {gridRow:gridRow})
        }
        
        if (eq.hasOneSimilarVariable() === false){
            console.log("solveOneSimilarVariable: Error. multiple variables", this.toString());
            return undefined;
        }

        
        // CONSOLIDATE VARIABLE ON LEFT HAND SIDE
        // get all variable terms to the left hand side
        eq = eq.removeAllFromSide({whatToRemove:"variables", side:1});
        if (showSteps) {
            if (showComments){
                gridRow = eq.addCommentToGrid({
                    gridDiv: gridDiv, 
                    gridRow: gridRow, 
                    comment: "Move variables to left hand side:"
                })
            }
            gridRow = eq.insertIntoGrid(gridDiv, {gridRow:gridRow})
        }

        // console.log("Solving 1.", eq.expressions[1]);
        
        // remove constants from left hand side
        eq = eq.removeAllFromSide({whatToRemove:"constants", side:0});
        if (showSteps) {
            if (showComments){
                gridRow = eq.addCommentToGrid({
                    gridDiv: gridDiv, 
                    gridRow: gridRow, 
                    comment: "Move constants to right hand side:"
                })
            }
            gridRow = eq.insertIntoGrid(gridDiv, {gridRow:gridRow})
        }

        // console.log("Solving 2.", eq.expressions[1])
        // divide by coefficient
        let coeff = eq.expressions[0].terms[0].coeff;
    
        eq = eq.divideByConstant(coeff);
        if (showSteps) {
            if (showComments) {
                gridRow = eq.addCommentToGrid({
                    gridDiv: gridDiv, 
                    gridRow: gridRow, 
                    comment: "Divide by coefficient"
                })
            }
            gridRow = eq.insertIntoGrid(gridDiv, {gridRow:gridRow})
        }
        // console.log("Solving 3.", eq);
        // console.log("eq:", this.simplify().toString(), "||", eq.toString(), eq);

        return eq;

    }

    divideByConstant(c){
        let expr = [];
        for (let e of this.expressions){
            expr.push(e.divideByConstant(c));
        }
        return new Equation({
            expressions: expr
        });
    }

    removeAllFromSide({whatToRemove="variables", side=1}={}){ 
        //move all "variables" or "constants" (whatToRemove) from given side of equation: side: (left=0) (right=1)

        let expr = this.expressions;
        for (let [i, t] of this.expressions[side].terms.entries()){
            let test = t.isConstant();
            if (whatToRemove === "variables") test = !test;
            if (test){
                for (let [j, e] of this.expressions.entries()){
                    let newTerm = new Term({
                        coeff: t.coeff * -1,
                        variables: t.variables
                    })
                    expr[j] = expr[j].add(newTerm);
                }
            }
        }
        return new Equation({
            expressions: expr
        })
    }

    removeVariables(col=1){ //move all variables from given side of equation: col: (left=0) (right=1)
        let expr = this.expressions;
        for (let [i, t] of this.expressions[col].terms.entries()){
            console.log('i,t:', i,t);
            if (t.isConstant() === false){
                for (let [j, e] of this.expressions.entries()){
                    let newTerm = new Term({
                        coeff: t.coeff * -1,
                        variables: t.variables
                    })
                    expr[j] = expr[j].add(newTerm);
                }
            }
        }
        console.log('expr: ', expr[0].toString(), expr[1].toString());
        return new Equation({
            expressions: expr
        })
    }

    simplify(){
        let simpleExpressions = [];
        for (let e of this.expressions){
            simpleExpressions.push(e.simplify());
        }
        return new Equation({expressions: simpleExpressions});
    }

    hasOneSimilarVariable(){
        let testTerm = "";
        for (let e of this.expressions){
            for (let t of e.terms){
                if (t.isConstant() === false){
                    if (testTerm === ""){
                        testTerm = t;
                    } else {
                        if (testTerm.isSimilarTo(t) === false){
                            return false;
                        }
                    }
                }
            }
        }
        return true; //passed checks
    }

    toString(){
        let s = '';
        for (let [i,e] of this.expressions.entries()){
            s = s + e.toString();
            if (i < this.expressions.length -1){
                s = s + "=";
            }
        }
        return s;
    }

    getElement({showDots=false}={}){
        let d = document.createElement('span');

        let mods = {showDots:showDots};
        for (let [i, e] of this.expressions.entries()){
            e.insertIntoDiv(d, mods);
            if (i < this.expressions.length-1){
                appendString(d, "=");
            }
        }
        return d;
    }

    insertIntoDiv(div, {showDots=false}={}){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 
        
        let d = this.getElement({showDots:showDots});
        div.appendChild(d);
    }

    styleEquationGrid({div=undefined}={}){
        div.style.display = "grid";
        div.style.gridTemplateColumns =  '1.5em min-content 1.5em min-content'; 
        // g.style.gridTemplateRows = 'repeat(10, 1fr)';
        div.style.alignItems = "end";
    }

    addCommentToGrid({gridDiv=undefined, gridRow=1, comment=""}){
        let d = document.createElement('div');
        d.style.gridColumn = '1 / -1';
        d.style.gridRow = gridRow;
        d.innerHTML = comment;
        gridDiv.appendChild(d);
        return gridRow + 1;
    }
    getGridId(prefix, r, c){
        let id = `${prefix}_r${r}_c${c}`;
        let element = document.getElementById(id);
        if (element) element.remove();
        return id;
    }
    insertIntoGrid(gridDiv, {showDots=false, gridRow=1}={}){
        // div is either the Element or the element's id
        
        if (checkForString(gridDiv)){ // if string assume it's the element id
            let gridDiv_id = gridDiv;
            gridDiv = document.getElementById(gridDiv_id);
            gridDiv.id = gridDiv_id;
        } else {
            if (gridDiv.id === ''){
                throw new Error('gridDiv.id is undefined. Give the div an id.')
            }
           
        }
        

        this.styleEquationGrid({div: gridDiv});

        let mods = {showDots:showDots};
        let margin = "4px";
        let c = 2;
        
        for (let [i, e] of this.expressions.entries()){
            let eDiv = e.getDiv();
            eDiv.id = this.getGridId(gridDiv.id, gridRow,c);
            eDiv.classList.add("grid-item");
            eDiv.style.padding = '1px';
            eDiv.style.textAlign = 'center';

            eDiv.style.gridRow = gridRow;
            eDiv.style.gridColumn = c;
            
            let just = (i === 0) ? 'end' : 'start';
            eDiv.style.justifySelf = just;
            
            c = c + 1 ;
            gridDiv.appendChild(eDiv);
            // e.insertIntoDiv(d, mods);
            if (i < this.expressions.length-1){
                // let spn = document.createElement('div');
                // spn.textContent = "=";
                let spn = getEqualSignDiv();
                spn.id = this.getGridId(gridDiv.id, gridRow,c);
                spn.style.gridRow = gridRow;
                spn.style.gridColumn = c;
                spn.classList.add("grid-item");
                c = c + 1;
                
                gridDiv.appendChild(spn);
            }
        }
        //gridDiv.appendChild(g);
        return gridRow + 1;
    }

}

function parseEquation(s) {
    if (!checkForString(s)){
        return false;
    }
    let expressions = [];
    s = s.replace(/\s/g, '');; // remove spaces
    let xpString = s.split('=');
    for (let e of xpString){
        expr = parseExpression(e);
        if (expr !== false) {
            expressions.push(expr);
        }
    }
    return new Equation({expressions:expressions});
}


class AlgebraQuestion {

    constructor({
        equation = new Equation(),
        div = undefined,
        instructions = "Solve:"
     }={}) {
        let input = equation;
        let initDiv = div;
        this.userResults = [];

        //error checking and conversion
        if (checkForString(equation)) equation = parseEquation(equation);
        if (equation instanceof Equation){
            this.equation = equation;
            console.log("AlgebraQuestion:", input, '||', this.equation);
            this.solvedEquation = this.equation.solveOneSimilarVariable();
        } else {
            throw new Error(`${input}, is not a valid Equation instance.`)
        }


        if (div !== undefined) {
            this.divContainer = div;
            this.insertIntoDiv({div:this.divContainer, gridRow:1});
        }

    }

    insertIntoDiv({div="", gridRow=1}){
        if (checkForString(div)) div = document.getElementById(div);

        if (div instanceof Element){
            if (div.id !== ""){
                this.divContainer = div;
            } else {
                throw new Error('div.id is undefined');
            }
        } else {
            throw new Error(`AlgebraQuestion: div is not an Element on the page: ${initDiv}`);
        }

        this.divContainer.style.border = '1px solid red';
        
        // create div for question
        this.qDiv = document.createElement('div');
        this.qDiv.id = `${this.divContainer.id}_q`;
        this.divContainer.appendChild(this.qDiv);

        this.gridRow = this.equation.insertIntoGrid(this.qDiv, {gridRow:gridRow});

        this.insertAnswerInput();

        this.userResultsDiv = doc.createElement('div');
        this.userResultsDiv.style.border = '1px solid green';
        this.userResultsDiv.innerHTML = "Results: "
        this.divContainer.appendChild(this.userResultsDiv);
            
    }

    insertAnswerInput(){
        let c = 5;
        this.answerRow = this.gridRow+2;
        this.inputDiv = document.createElement("input");

        this.inputDiv.type = "text";
        this.inputDiv.style.gridRow = this.answerRow;
        this.inputDiv.style.gridColumn = c;
        this.inputDiv.style.width = '10em';
        this.inputDiv.style.backgroundColor = "lightblue";
        this.inputDiv.style.marginLeft = '2em';

        // this.inputDiv.classList.add("answerTextInput");

        this.inputDiv.addEventListener("keyup", () => {
            this.userEquation = parseEquation(this.inputDiv.value);
            this.userEquation.insertIntoGrid(this.qDiv, {gridRow:this.answerRow})

            let isValid = this.checkIfValidAnswer(this.userEquation);

            if (isValid){
                setValidStyle(this.inputDiv);
            } else {
                setInvalidStyle(this.inputDiv);
            }
        })

        this.inputDiv.addEventListener("change", () => {
            this.userEquation = parseEquation(this.inputDiv.value);
            console.log("userAnser", this.userEquation.expressions[0], this.userEquation.expressions[1]);
            
            let isValid = this.checkIfValidAnswer(this.userEquation, {printConsole:true});

            console.log("isValid? ", isValid);
            
            if (isValid){
                let result = this.checkAnswer(this.userEquation);
                if (result.isCorrect){

                }
            }
        });
        this.qDiv.appendChild(this.inputDiv);
    }

    checkAnswer(userAnswer){
        let note = "";
        let isCorrect = false;
        let score = 0;


        // check for correct value
        let correctValue = this.solvedEquation.expressions[1].terms[0].coeff;
        let userValue = userAnswer.expressions[1].terms[0].coeff;
        if (correctValue == userValue){
            isCorrect = true;
            score += 8;
            // note = note + " The value is correct."
        } else {
            note = note + ' is incorrect.'
        }

        // check for correct variable
        let correctTerm = this.solvedEquation.expressions[0].terms[0];
        let userTerm = userAnswer.expressions[0].terms[0];
        if (correctTerm.isSameAs(userTerm)){
            score += 2; 
            if (isCorrect) note = note + " is correct."
        } else {
            note = isCorrect? note + " Correct value, but you used a variable not in the equation." 
                            : note + " And you used a variable not in the equation."
        }

        console.log("Check answer:", correctValue, userValue, isCorrect, score);

        let r = new AlgebraResult({
            userAnswer: userAnswer,
            correctAnswer: this.solvedEquation,
            note: note,
            isCorrect: isCorrect,
            score: score
        })

        this.userResults.push(r);
        this.insertResults();
        
        return r;
    }

    insertResults(){
        this.userResultsDiv.innerHTML = "";
        for (const result of this.userResults) {
            let div = doc.createElement('div');
            // div.appendChild(result['userAnswer'].getElement());
            result['userAnswer'].insertIntoDiv(div);
            div.appendChild(doc.createTextNode(result['note']));

            div.style.backgroundColor = result['isCorrect'] ? 'lightGreen' : 'darkSalmon';
            this.userResultsDiv.appendChild(div);
        }

    }

    checkIfValidAnswer(userEqn, {printConsole=false}={}){
        let ansLHS = this.solvedEquation.expressions[0];
        let ansRHS = this.solvedEquation.expressions[1];
        let usrLHS = userEqn.expressions[0];
        let usrRHS = userEqn.expressions[1];
        //check if equation is valid: has two expressions 
        if (!(usrLHS instanceof AlgebraicExpression && usrRHS instanceof AlgebraicExpression)){
            if (printConsole) 
                console.log("Invalid equation:", userEqn.toString());
            return false;
        }
        // check if left hand side is a single variable
        if (usrLHS.terms.length !== 1){
            if (printConsole)
                console.log("A single variable (Term) should be to the left of the = sign.")
            return false;
        }
        // check if right hand side is a single constant
        if (usrRHS.terms[0].variables.length !== 0){
            if (printConsole) 
                console.log("A single value should be to the right of the = sign")
            return false;
        } else {
            if (!usrRHS.terms[0].isConstant()){
                if (printConsole)
                    console.log("The left side of the equation should be a constant");
                return false;
            }
        }
        if (printConsole) 
            console.log("Valid equation entered;", userEqn.toString())

        return true;
    }

}



class AlgebraResult {

    constructor({
        userAnswer = undefined,
        correctAnswer = undefined,
        note = "",
        isCorrect = undefined, 
        score = 0
    }){
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
        this.note = note;
        this.isCorrect = isCorrect;
        this.score = score;
    }
}


class RandomAlgebraQuestion extends AlgebraQuestion{

    constructor({
        type = 'Single Step',
        operation = "+",
        minResult = 0,
        maxResult = 10,
        variableSide = 'left',
        minConst = 0,
        maxConst = 10,
        variableComesFirst = true,
        useIntegers = true, 
        decimalPlaces = 1
    }){
        let str = '';
        console.log("operation:", operation)

        if (type === 'Single Step'){
            let x = getRandomVariableLetter();

            //get variable side value
            let result = randInt(minResult, maxResult);
            
            if (operation === '+') {
                let vsc = randInt(0, maxConst); //variable side constant
                let osc = result + vsc;
                let vs = '';
                if (variableComesFirst){
                    vs = x + operation + vsc;
                } else {
                    vs = vsc + operation + x;
                }
                if (variableSide === 'left'){
                    str = vs + "=" + osc;
                } else {
                    str = osc + "=" + vs;
                }
            } 
            else if (operation === '-'){
                let vsc = randInt(0, maxConst); //variable side constant
                let osc = result - vsc;
                let vs = x + operation + vsc;
                
                if (variableSide === 'left'){
                    str = vs + "=" + osc;
                } else {
                    str = osc + "=" + vs;
                }
            } else if (operation === 'x'){
                let vsc = randInt(minConst, maxConst, true); //variable side constant
                let ct = 0;
                while (ct < 20 && vsc === 1){ //try to exclude 1
                    vsc = randInt(minConst, maxConst, true);
                }
                let osc = result * vsc;

                let vs = vsc + operation;
                
                if (variableSide === 'left'){
                    str = vs + "=" + osc;
                } else {
                    str = osc + "=" + vs;
                }
            }
        }

        console.log(`Random (${operation}) equation:`, str);
        let eq = parseEquation(str);
        super({equation: eq});
    }

}




//
//
//  UTILITY FUNCTIONS
//
//

function checkForString(input){
    //check for valid input string
    if (typeof input !== 'string' || input.trim() === '') {
        // console.log("Invalid String", input);
        return false;
    } else {
        return true;
    }
}

function getDot(){
    let s = document.createElement('span');
    s.textContent = '·';
    return s;
}
function appendDot(div){
    if (checkForString(div)){ // if string assume it's the element id
        div = document.getElementById(div);
    }
    div.appendChild(getDot());
}
function appendString(div, s, {margin="4px", justifySelf='center', gridRow=undefined, gridCol=undefined}={}){
    if (checkForString(div)){ // if string assume it's the element id
        div = document.getElementById(div);
    }
    let spn = document.createElement('span');
    spn.style.marginLeft = margin;
    spn.style.marginRight = margin;
    spn.style.justifySelf = justifySelf;
    if (gridRow) spn.style.gridRow = gridRow;
    if (gridCol) spn.style.gridCol = gridCol;
    spn.textContent = s;
    div.appendChild(spn);
}

function getEqualSignDiv(style={
                                justifySelf: 'center',
                                alignSelf: 'center'
                            }){
    let div = document.createElement('div');
    Object.entries(style).forEach(([s, value]) => {
        div.style[s] = value;
    });
    div.textContent = "=";
    return div;

}

function appendHTML(div, html, {margin="4px"}={}){
    let spn = document.createElement('span');
    spn.style.marginLeft = margin;
    spn.style.marginRight = margin;
    spn.innerHTML = html;
    div.appendChild(spn);
}

function removeElement(id){
    let element = document.getElementById(id);
    if (element) element.remove();
}

function setValidStyle(div){
    div.style.backgroundColor = "lightblue";
}
function setInvalidStyle(div){
    div.style.backgroundColor = "darksalmon";
}


function getRandomVariableLetter(str='xyzabcmnpqrst') { //get a random variable letter
    const randomIndex = Math.floor(Math.random() * str.length);
    return str.charAt(randomIndex);
}

function randInt(min, max, noZero=false) {
    min = Math.ceil(min);   // Round up to ensure inclusive of the minimum
    max = Math.floor(max);  // Round down to ensure inclusive of the maximum
    
    let n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (noZero && n === 0) {
        let ct = 0;
        while (n === 0 && ct < 10){
            n = Math.floor(Math.random() * (max - min + 1)) + min;
            ct++;
        }
    }
    
    return n;
}
