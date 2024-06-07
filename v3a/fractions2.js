let doc = document;
let showElementBorders = false;

class Fraction {
    constructor(numerator=0, denominator=1) {
        this.numerator = parseInt(numerator);
        this.denominator = parseInt(denominator);
        // this.mixed = new mixedNumber(0, this);
        if (this.denominator !== 0){
            this.divideByZero = false;

            if (this.isReducable()){
                console.log('reducable')
                this.reduced = this.reduce(); //reduced fraction
            } else {
                console.log("not reducable")
                this.reduced = this;
            }

        } else {
            console.log("Error with fraction", this.numerator, this.denominator);
            this.reduced = undefined;
            this.divideByZero = true;
        }

    }

    getElement(){
        let frac = doc.createElement('span');
        frac.style.display = 'inline-block';
        frac.style.textAlign = "center";
        frac.style.verticalAlign = "middle";

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

        return frac;
    }

    insertElement(div_id) {
        let div = doc.getElementById(div_id);
        div.appendChild(this.getElement());
    }

    isReducable() {
        if (this.divideByZero) return false;

        const commonDivisor = gcd(this.numerator, this.denominator);
        // console.log(commonDivisor);
        const r = commonDivisor === 1 ? false : true;
        return r;
    }

    reduce() {
        // Reduce the fraction to its simplest form
        const commonDivisor = gcd(this.numerator,this.denominator);
        let numerator = this.numerator;
        let denominator = this.denominator;
        numerator /= commonDivisor;
        denominator /= commonDivisor;    
        return new Fraction(numerator, denominator);
    }

    //
    // cert above
    //

    mixed(){
        const wholeNumber = Math.floor(this.numerator / this.denominator);
        const remainder = this.numerator % this.denominator;
        return new mixedNumber(wholeNumber, new Fraction(remainder, this.denominator))
    }

    isImproper(){
        if (this.numerator > this.denominator) {
            return true;
        } else {
            return false;
        }
    }
    

    toMixedNumber() {
        const wholeNumber = Math.floor(this.numerator / this.denominator);
        const remainder = this.numerator % this.denominator;
        return new mixedNumber(wholeNumber, new Fraction(remainder, this.denominator))
    }

    toString() {
        return `${this.numerator}/${this.denominator}`;
    }
 
    isSameAs(frac, reduced=true){
        let result = false;
        let f1 = reduced ? this.reduced() : this;
        let f2 = reduced ? frac.reduced() : frac;

        if ((f1.numerator === f2.numerator) &&
            (f1.denominator === f2.denominator)){
            result = true;
        } 
        return result;
    }
}

class mixedNumber{
    constructor(whole = 0, frac = new Fraction()){
        this.whole = whole;
        this.frac = frac;

        console.log("test:", this.toString(), this.frac);
        
        if (this.frac.divideByZero){
            this.divideByZero = true;
            this.improper = new Fraction(0,0);
        } else {
            if (this.isReducable()){
                let w = this.whole + this.frac.mixed.whole;
                this.reduced = new mixedNumber(w, this.frac.mixed.frac);
            } else {
                this.reduced = this;
            }
    
            console.log("impropering: ", this.toString())
            this.improper = this.makeImproper();
        }
        
    
    }

    isReducable(){
        return this.frac.isImproper();
    }

    makeImproper(){
        console.log("improper:", this.toString());
        let n = this.frac.numerator;
        if (this.whole !== 0){
            console.log(">")
            n += this.whole * this.frac.denominator;
            return new Fraction(n, this.denominator);
        } else {
            console.log("===")
            return this.frac;
        }
        
    }

    toString(){
        // if (this.whole === 0) {
        //     return this.frac.toString();
        // } else if (this.frac.numerator === 0) {
        //     return this.whole;
        // } else {
        //     return `${this.whole} ${this.frac.toString()}`;
        // }
        return `${this.whole} ${this.frac.toString()}`;
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
    insertIntoDiv(div, width=undefined) {
        let m = doc.createElement('span');
        m.style.display = 'grid';
        m.style.gridTemplateColumns = '1fr 1fr';
        m.style.alignItems = 'center';
        if (width !== undefined){
            m.style.width = width;
        }
        
        if (this.whole !== 0) {
            let whole = doc.createTextNode(this.whole);
            m.appendChild(whole);
        }

        if (this.frac.numerator !== 0){
            m.appendChild(this.frac.getElement());
        }
        
        
        div.innerHTML = '';
        console.log("m:", m);
        div.appendChild(m); 
    }
    insertElement(div_id, width='2em'){
        let div = doc.getElementById(div_id);
        this.insertIntoDiv(div, width);
    }

    isSameAs(mixedNum, reduced=true){
        //compare other mixed number to this one
        // return true or false
        let result = false;
        if (this.whole === mixedNum.whole){
            if (this.frac.isSameAs(mixedNum.frac, reduced)){
                result = true;
            }
        } 
        return result;
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

    console.log("Checking to reduce.", sumNumerator, commonDenominator)
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
    console.log("Adding fractions:", result);
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
    let whole = m1.whole + m2.whole;
    console.log("Adding:", m1.frac.toString(), "+", m2.frac.toString());
    let fracSum = addFractions(m1.frac, m2.frac);
    console.log("Added (fracSum):", fracSum.toString());
    whole += fracSum.mixed().whole;
    console.log("added mixed numbers: ", whole, fracSum.mixed().frac.toString());
    return new mixedNumber(whole, fracSum.mixed().frac);
}

function gridDiv(html="", gridClass=undefined){
    console.log("gridClass: ", gridClass);
    let div = doc.createElement('div');
    div.innerHTML = html;
    div.classList.add('question-item');
    if (gridClass !== undefined){
        div.classList.add(gridClass);
    } 
    return div;
}


class additionQuestion{
    constructor(f1, f2, div_id, 
                inputType="text", showInstructions=true){
        // f1 and f2 are Fraction instances
        this.divContainer = doc.getElementById(div_id);
        this.operator = "+"
        this.f1 = f1;
        this.f2 = f2;
        this.inputType = inputType;
        // this.mixedSum = addMixedNumbers(f1.mixed(), f2.mixed());
        this.nrows = 0;
        this.ncols = 6;

        this.nResults = 0;
        this.results = '';
        this.div = doc.createElement('div');
        this.div.style.display = 'grid';
        //this.div.style.gridTemplateColumns = '15em 2em 2em 2em 2em 3em 2em 2em';
        this.div.style.gridTemplateColumns = "repeat(30, auto)";
        this.div.style.gridTemplateRows = '2fr';
        this.div.style.border = '1px solid red';
        this.div.style.alignItems = 'center';

        this.answer = {};
        this.showAnswerButton = false;

        this.useMixedInputs = false;
        this.useSimplifiedInputs = true;

        if (showInstructions) this.insertInstructions();
        this.insertControlsRow();
        this.insertQuestionRow();

    }
    insertInstructions(){
        let instructions = '';
        if (this.useMixedInputs){
            instructions += "Enter answers as a mixed number.<br>";
        } else {
            instructions += "Enter answer as a fraction. The fraction may be improper.<br>";
        }
        if (this.useSimplifiedInputs){
            instructions += "Be sure to simplify your results.<br>"
        }
        let insDiv = doc.getElementById('instructions');
        insDiv.innerHTML = instructions;
    }
    insertControlsRow(){
        // this.nrows += 1;
        // this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;

        // let checkDiv = this.getMixedCheckbox("Mixed Number");
        // checkDiv.style.gridRow = `1`;
        // checkDiv.style.gridColumn = '8';

        // this.div.appendChild(checkDiv);
    }
    insertQuestionRow(){
        this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        
        //this.div.appendChild(this.getTextSpan('Question: ',2,1));

        this.insertFraction(this.f1, 2, 2)
        this.insertOperator("+", 2, 3);
        this.insertFraction(this.f2, 2, 4);
        this.insertOperator("=", 2, 5);

        this.insertAnswerDisplay(2,8);

        this.insertAnswerTextInput(2,6);
        this.insertOperator("=", 2, 7);

        this.insertAnswerButton(2,9);
        
        // if (this.useMixedInputs){
        //     this.div.appendChild(this.getMixedInputs());
        // } else {
        //     // this.div.appendChild(this.getFractionInputs());
        //     this.insertFractionInputs(2,6);
        // }
        
        // this.div.appendChild(this.getAnswerButton());
        
        this.divContainer.appendChild(this.div);

    }

    insertAnswerDisplay(r,c){
        this.answerTextDisplay = doc.createElement("span");
        this.answerTextDisplay.style.gridRow = r;
        this.answerTextDisplay.style.gridColumn = c;
        this.answerTextDisplay.style.backgroundColor = "lightblue";
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

        this.answerTextInput.addEventListener("keyup", () => {
            this.answer = readStrToFraction(this.answerTextInput.value);
            this.answer.insertIntoDiv(this.answerTextDisplay);
        })

        // this.answerTextInput.addEventListener("change", () => {
        //     let result = readStrToFraction(this.answerTextInput.value);
        //     result.insertIntoDiv(this.answerTextDisplay);
        // })

        this.div.appendChild(this.answerTextInput);
    }

    insertAnswerButton(r,c){
        this.div.appendChild(this.getAnswerButton(r,c));
    }

    insertFraction(frac, r, c){
        let div = frac.toHTML();
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

    getMixedCheckbox(txt="check"){
        let div = doc.createElement('span');
        this.mixedCheckbox = doc.createElement('input');
        this.mixedCheckbox.type = 'checkbox';

        this.mixedCheckbox.addEventListener('change', () => {
            if (this.mixedCheckbox.checked){
                console.log("checked");

                let oppDiv = this.getOperatorSpan("=");
                oppDiv.style.gridRow = '2';
                oppDiv.style.gridColumn = '7';

                let mixedDiv = this.getMixedInputs();
                mixedDiv.style.gridRow = '2';
                mixedDiv.style.gridColumn = '8';

                this.div.appendChild(oppDiv);
                this.div.appendChild(mixedDiv);
            } else {
                console.log("not checked");
            }
        })

        div.appendChild(doc.createTextNode(txt));
        div.appendChild(this.mixedCheckbox);
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

    insertFractionInputs(r,c){
        let div = this.getFractionInputs();
        div.style.gridRow = r;
        div.style.gridColumn = c;
        if (showElementBorders) div.style.border = '1px solid green';

        this.div.appendChild(div);
    }
    getFractionInputs(){
        let frac = doc.createElement('span');
        frac.style.display = 'inline-block';
        frac.style.textAlign = "center";
        frac.style.verticalAlign = "middle";

        let n = doc.createElement('span');
        n.style.display = 'block';
        if (showElementBorders) n.style.borderBottom = '1px solid #000';
        n.style.padding = '0 5px';
        this.numeratorInput = this.getNumberInput('numerator')
        n.appendChild(this.numeratorInput);

        let d = doc.createElement('span');
        d.style.display = 'block';
        d.style.padding = '0 5px';
        this.denominatorInput = this.getNumberInput("denominator");
        d.appendChild(this.denominatorInput);

        frac.appendChild(n);
        frac.appendChild(d);

        return frac;
    }

    getMixedInputs(){

        let div = doc.createElement('span');

        this.wholeInput = this.getNumberInput('whole');
        div.appendChild(this.wholeInput);

        let frac = doc.createElement('span');
        frac.style.display = 'inline-block';
        frac.style.textAlign = "center";
        frac.style.verticalAlign = "middle";

        let n = doc.createElement('span');
        n.style.display = 'block';
        n.style.borderBottom = '1px solid #000';
        n.style.padding = '0 5px';
        this.numeratorInput = this.getNumberInput('numerator')
        n.appendChild(this.numeratorInput);

        let d = doc.createElement('span');
        d.style.display = 'block';
        d.style.padding = '0 5px';
        this.denominatorInput = this.getNumberInput("denominator");
        d.appendChild(this.denominatorInput);

        frac.appendChild(n);
        frac.appendChild(d);

        div.appendChild(frac);

        return div;
    }

    getNumberInput(id){
        let div = doc.createElement("input");
        div.id = id;
        div.style.width = '3em';
        div.type = 'number';
        div.min = -1000;
        div.max = 1000;
        div.step = 1;

        div.addEventListener('change', () => {
            let i = doc.getElementById(id);
            this.answer[id] = i.value;
            console.log(id, this.answer[id]);
            if (this.answer['numerator'] !== undefined && 
                this.answer['denominator'] !== undefined &&
                ((this.useMixedInputs && this.answer['whole'] !== undefined) ||
                  !this.useMixedInputs)) {

                    this.answer['fraction'] = new Fraction(this.answer['numerator'], this.answer['denominator']);
                    console.log("Answer: ", this.answer['fraction'].toString());
                    //this.checkAnswer();
                    if (!this.showAnswerButton){
                        this.showAnswerButton = true;
                        this.insertAnswerButton();
                    }
                    
                }
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

    // checkAnswer(){
    //     let frac = this.answer['fraction'];

    //     let result = '';
    //     let color = 'white';

    //     //check to see if the reduced fraction is the same
    //     if (this.sum.reduced.isSameAs(frac)){
    //         result += " is correct, in most simplified form.";
    //         color = 'springGreen';
    //     } else if (this.sum.reduced.isSameAs(frac.reduced)){
    //         result += ' can be simplified.';
    //         color = 'paleGreen';
    //     } else {
    //         result += ' is incorrect';
    //         color = 'pink';
    //     }

    //     // console.log(result);
    //     this.insertResults(result, color);

    // }

    checkAnswer(){
        let frac = this.answer['fraction'];

        let result = '';
        let color = 'white';

        console.log("Answer: ", this.answer.toString());
        console.log("mixedSum: ", this.mixedSum.toString());

        if (this.mixedSum.isSameAs(this.answer)){
            console.log("Same");
        } else {
            console.log("wrong");
        }

        // if (this.sum) Need an addMixedNumbers class

        // //check to see if the reduced fraction is the same
        // if (this.sum.reduced.isSameAs(frac)){
        //     result += " is correct, in most simplified form.";
        //     color = 'springGreen';
        // } else if (this.sum.reduced.isSameAs(frac.reduced)){
        //     result += ' can be simplified.';
        //     color = 'paleGreen';
        // } else {
        //     result += ' is incorrect';
        //     color = 'pink';
        // }

        // // console.log(result);
        // this.insertResults(result, color);

    }

    insertResults(result, color="white"){
        this.nResults += 1;
        let newDiv = doc.createElement("div");
        newDiv.appendChild(doc.createTextNode(`Try ${this.nResults}: `));
        newDiv.appendChild(this.answer['fraction'].toHTML());
        newDiv.appendChild(doc.createTextNode(result));
        newDiv.style.backgroundColor = color;

        //this.results += `Try ${this.nResults}: ${result} <br>`;
        let div = doc.getElementById('results');
        div.appendChild(newDiv);
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

/**
 * Parses a string into a whole number part, a numerator, and a denominator.
 * @param {string} input - The string to be parsed.
 * @returns {Object} An object containing the whole number, numerator, and denominator.
 */
function parseMixedNumber(input) {
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
        // If there are two parts, the first part is the whole number
        wholePart = parseInt(parts[0], 10);
        // The second part is the fraction
        frac = parseFraction(parts[1]);

        // let fractionParts = parts[1].split('/');
        // if (fractionParts.length === 2) {
        //     numPart = parseInt(fractionParts[0], 10);
        //     denomPart = parseInt(fractionParts[1], 10);
        // } else {
        //     throw new Error('1. Invalid fraction format.');
        // }
    } else if (parts.length === 1) {
        // If there is only one part, it could be a whole number or a fraction
        if (parts[0].includes('/')) {
            frac = parseFraction(parts[0]);
            // It's a fraction
            // let fractionParts = parts[0].split('/');
            // if (fractionParts.length === 2) {
            //     numPart = parseInt(fractionParts[0], 10);
            //     denomPart = parseInt(fractionParts[1], 10);
            // } else {
            //     throw new Error('2. Invalid fraction format.');
            // }
            
        } else {
            // It's a whole number
            wholePart = parseInt(parts[0], 10);
        }
    } else {
        throw new Error('3. Invalid input format.');
    }

    // let frac = new Fraction(numPart, denomPart);
    let result = new mixedNumber(wholePart, frac);
    console.log("Result:", result.toString());
    return result;
}

function parseFraction(input){
    if (typeof input !== 'string' || input.trim() === '') {
        console.log("parseFraction Error: 1")
        return new Fraction();
    }
    let fractionParts = input.split('/');
    console.log("parseFraction:", fractionParts);
    if (fractionParts.length === 2) {
        let n = parseInt(fractionParts[0], 10);
        let d = parseInt(fractionParts[1], 10);
        //check if numbers
        if (typeof n === "number" && Number.isFinite(n)){
            numPart = n;
        } else {
            numPart = 0;
            console.log("parseFraction: numerator not a number");
        }

        if (typeof d === "number" && Number.isFinite(d)){
            denomPart = d;
        } else {
            denomPart = 0;
            console.log("parseFraction: denominator not a number");
        }

        return new Fraction(numPart, denomPart);
    } else {
        console.log("parseFraction Error: ")
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
