var doc = document;
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
        displayAsMixed = true
    }) {
        // fracs is an array of Fraction or mixedNumber instances or string of fraction or mixed numbers

        this.fracsInput = fracs;
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

        let result = '';
        let color = 'white';

        this.userAnswer = strToFraction(this.answerTextInput.value, false);

        console.log("User Answer: ", this.answer.toString());
        console.log("Computed answer: result: ", this.result.toString());

        if (this.result.isSameAs(this.answer)){
            this.answerIsCorrect = true;
            result += " is correct. ";
            //console.log("Same");
        } else {
            this.answerIsCorrect = false;
            result += " is incorrect. "
        }

        let r = new fractionResult({
            userAnswer: this.userAnswer,
            correctAnswer: this.mixedSum,
            note: result,
            isCorrect: this.answerIsCorrect
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

// generate a random fraction
function randFrac({
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

        let f1 = randFrac({
            minNumerator: minNumerator,
            maxNumerator: maxNumerator,
            minDenominator: minDenominator,
            maxDenominator: maxDenominator, 
            noZeroDenominator: noZeroDenominator, 
            noZero: noZero,
            l_proper: l_proper,
            noWholeNumber: noWholeNumber
        })

        let f2 = randFrac({
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
                f1 = randFrac({
                    minNumerator: minNumerator,
                    maxNumerator: maxNumerator,
                    minDenominator: minDenominator,
                    maxDenominator: maxDenominator, 
                    noZeroDenominator: noZeroDenominator, 
                    noZero: noZero,
                    l_proper: l_proper,
                    noWholeNumber: noWholeNumber
                })
        
                f2 = randFrac({
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
        isCorrect = undefined
    }){
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
        this.note = note;
        this.isCorrect = isCorrect;
    }
}