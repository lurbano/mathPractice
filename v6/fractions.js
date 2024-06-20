let doc = document;
let showElementBorders = false;

class Fraction {
    constructor(numerator=0, denominator=1) {
        this.isValid = false;
        // this.isNegative = false;
        // console.log("Fraction 1:", numerator, denominator)
        

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

        // console.log("Fraction 2:", this.numerator, this.denominator)
        if (this.isValid) {
            if (this.isReducable()){
                this.reduced = this.reduce(); //reduced fraction
            } else {
                this.reduced = this;
            }

            // for negative fraction, make sure the numerator
            //   is negative and the denominator is positive.
            if (this.numerator/this.denominator < 0) {
                // this.isNegative = true;
                // console.log("negative:", this.numerator, this.denominator)
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
            // console.log(`making mixed(): ${this.numerator}/${this.denominator}`)
            // console.log(`making mixed(): whole = ${wholeNumber}, remainder=${remainder}`)
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
        }
        return result;
    }

    multiplyByWhole(whole){
        return new Fraction(this.numerator*whole, this.denominator);
    }
}

class mixedNumber{
    constructor(whole = 0, frac = new Fraction()){
        this.isValid = true;
        this.whole = whole;
        this.frac = frac;
    }

    toFraction(){
        let n = this.frac.numerator;
        // console.log("toFraction:", this.whole, n, "/", this.frac.denominator)
        if (this.whole === 0){
            return this;
        } else if (this.whole < 0) {
            n = this.whole * this.frac.denominator - n;
        } else {
            n += this.whole * this.frac.denominator;
        }
        // console.log("n", this.whole,  n, "/", this.frac.denominator)
        return new Fraction(n, this.frac.denominator);

    }

    simplify(){
        let frac = this.toFraction();
        // console.log("Simplify: ", frac.toString(), frac.isNegative())
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
        // m.style.display = 'grid';
        // m.style.gridTemplateColumns = '1fr 1fr';
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


// function addMixedNumbers(m1, m2){
//     let whole = m1.whole + m2.whole;
//     let f1 = m1.frac;
//     let f2 = m2.frac;
//     if (m1.whole < 0 && !m1.frac.isNegative){
//         f1 = f1.multiplyByWhole(-1);
//     }
//     if (m2.whole < 0 && !m2.frac.isNegative){
//         f2 = f2.multiplyByWhole(-1);
//     }
//     let fracSum = addFractions(f1, f2);
//     whole += fracSum.mixed().whole;
//     return new mixedNumber(whole, fracSum.mixed().frac);
// }

function addMixedNumbers(m1, m2){

    let f1 = m1.makeImproper();
    let f2 = m2.makeImproper();
    console.log(`Improper: ${f1.toString()} + ${f2.toString()}`)
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

// function subtractMixedNumbers(m1, m2){
//     let whole = m1.whole - m2.whole;
    
//     if ((m1.whole < 0 && !m1.frac.isNegative)){
//         let newFrac = new Fraction(m1.frac.numerator * -1, m1.frac.denominator);
//         m1 = new mixedNumber(m1.whole, newFrac);
//     }

//     if (!(m2.whole < 0 && !m2.frac.isNegative)){
//         let newFrac = new Fraction(m2.frac.numerator * -1, m2.frac.denominator);
//         m2 = new mixedNumber(m2.whole, newFrac);
//     }
//     //console.log("newFrac2:", newFrac2.toString());
//     console.log("newMixed:", m1.toString(), m2.toString())

//     let fracSum = addFractions(m1.frac, m2.frac);
//     console.log('fracSum:', fracSum.toString(), ",", 
//                  fracSum.mixed().toString());
//     let mixedSum = new mixedNumber(whole+fracSum.mixed().whole, fracSum.mixed().frac);
//     console.log("subtract Result:", mixedSum.toString())
//     return mixedSum;
// }


function gridDiv(html="", gridClass=undefined){
    let div = doc.createElement('div');
    div.innerHTML = html;
    div.classList.add('question-item');
    if (gridClass !== undefined){
        div.classList.add(gridClass);
    } 
    return div;
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
        whole = parseInt(parts[0], 10);
        // The second part is the fraction
        frac = parseFraction(parts[1]);

    } else if (parts.length === 1) {
        // If there is only one part, it could be a whole number or a fraction
        if (parts[0].includes('/')) {
            frac = parseFraction(parts[0]);
        } else {
            // It's a whole number
            whole = parseInt(parts[0], 10);
        }
    } else {
        throw new Error('3. Invalid input format.');
    }

    let result = new mixedNumber(whole, frac);
    return result;
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

class additionQuestion{
    constructor(f1, f2, div_id, operation="+", showInstructions=true){
        // f1 and f2 are Fraction or mixedNumber instances

        this.f1 = f1 instanceof Fraction ? new mixedNumber(0, f1): f1;
        this.f2 = f2 instanceof Fraction ? new mixedNumber(0, f2): f2;

        // let a = b;

        this.divContainer = doc.getElementById(div_id);
        if (operation === "-"){
            this.operator = "-"
            this.mixedSum = subtractMixedNumbers(this.f1, this.f2);
        } else {
            this.operator = "+"
            this.mixedSum = addMixedNumbers(this.f1, this.f2);
        }
        
        console.log(`Q mixedSum: ${this.mixedSum.toString()}`);

        this.nrows = 0;
        this.ncols = 6;

        if (showInstructions) {
            this.instructionsDiv = doc.createElement('div');
            this.instructionsDiv.innerHTML = "Find the sum:";
            this.divContainer.appendChild(this.instructionsDiv);
        }

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

        //if (showInstructions) this.insertInstructions();
        this.insertControlsRow();
        this.insertQuestionRow();

        this.nResults = 0;
        this.results = [];
        this.resultsDiv = doc.createElement('div');
        this.resultsDiv.style.border = '1px solid green';
        this.resultsDiv.innerHTML = "Results: "
        this.divContainer.appendChild(this.resultsDiv);

    }
    insertInstructions(div_id){
        let instructions = 'Add:';
        // if (this.useMixedInputs){
        //     instructions += "Enter answers as a mixed number.<br>";
        // } else {
        //     instructions += "Enter answer as a fraction. The fraction may be improper.<br>";
        // }
        // if (this.useSimplifiedInputs){
        //     instructions += "Be sure to simplify your results.<br>"
        // }
        let insDiv = doc.getElementById(div_id);
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
        this.insertOperator(this.operator, 2, 3);
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
            this.answer = parseMixedNumber(this.answerTextInput.value);
            //this.answer.insertIntoDiv(this.answerTextDisplay);
            if (this.answer.isValid){
                this.answerTextDisplay.style.backgroundColor = 'lightgreen';
                this.answerTextDisplay.innerHTML = "";
                this.answerTextDisplay.appendChild(this.answer.getElement());
            } else {
                this.answerTextDisplay.style.backgroundColor = 'darksalmon';
            }
        })
        this.answerTextInput.addEventListener('change', () => {
            this.checkAnswer();
        })

        this.div.appendChild(this.answerTextInput);
    }

    insertAnswerButton(r,c){
        this.div.appendChild(this.getAnswerButton(r,c));
    }

    insertFraction(frac, r, c){
        let div = frac.getElement();
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

        console.log("User Answer: ", this.answer.toString());
        console.log("Computed answer: mixedSum: ", this.mixedSum.toString());

        if (this.mixedSum.isSameAs(this.answer)){
            this.answerIsCorrect = true;
            result += " is correct. ";
            //console.log("Same");
        } else {
            this.answerIsCorrect = false;
            result += " is incorrect. "
        }

        let r = {
            answer: this.answer,
            correctAnswer: this.mixedSum,
            note: result,
            isCorrect: this.answerIsCorrect
        }
        this.results.push(r);
        this.insertResults();

    }

    insertResults(){
        this.resultsDiv.innerHTML = "";
        for (const result of this.results) {
            let div = doc.createElement('div');
            div.appendChild(result['answer'].getElement());
            div.appendChild(doc.createTextNode(result['note']));

            div.style.backgroundColor = result['isCorrect'] ? 'lightGreen' : 'darkSalmon';
            this.resultsDiv.appendChild(div);
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