let doc = document;

class Fraction {
    constructor(numerator, denominator) {
        this.numerator = parseInt(numerator);
        this.denominator = parseInt(denominator);

        if (this.denominator !== 0){
            this.divideByZero = false;
            if (this.isReducable()){
                this.reduced = this.reduce(); //reduced fraction
            } else {
                this.reduced = this;
            }
            if (this.isImproper()){
                this.mixed = this.toMixedNumber();
            } else {
                this.mixed = new mixedNumber(0, this);
            }
        } else {
            this.reduced = undefined;
            this.mixed = undefined;
            this.divideByZero = true;
        }
    }

    isImproper(){
        if (this.numerator > this.denominator) {
            return true;
        } else {
            return false;
        }
    }

    gcd() {
        let a = this.numerator;
        let b = this.denominator;
        // Greatest Common Divisor using Euclidean algorithm
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    isReducable() {
        const commonDivisor = this.gcd();
        // console.log(commonDivisor);
        const r = commonDivisor === 1 ? false : true;
        return r;
    }
    reduce() {
        // Reduce the fraction to its simplest form
        const commonDivisor = this.gcd();
        let numerator = this.numerator;
        let denominator = this.denominator;
        numerator /= commonDivisor;
        denominator /= commonDivisor;    
        return new Fraction(numerator, denominator);
    }

    toMixedNumber() {
        const wholeNumber = Math.floor(this.numerator / this.denominator);
        const remainder = this.numerator % this.denominator;
        return new mixedNumber(wholeNumber, new Fraction(remainder, this.denominator))
    }

    toString() {
        return `${this.numerator}/${this.denominator}`;
    }

    // toHTML() {
    //     console.log("outputting fraction...");
    //     return (
    //     `
    //     <span class="fraction">
    //         <span class="numerator">${this.numerator}</span>
    //         <span class="denominator">${this.denominator}</span>
    //     </span> 
    //     `)
    // }
    toHTML(){
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
        d.innerText = this.denominator;

        frac.appendChild(n);
        frac.appendChild(d);

        return frac;
    }

    insertById(div_id) {
        let div = doc.getElementById(div_id);
        div.appendChild(this.toHTML());
    }

}

class mixedNumber{
    constructor(whole, frac){
        this.whole = whole;
        this.frac = frac;
    }

    toString(){
        if (this.whole === 0) {
            return this.frac.toString();
        } else if (this.frac.numerator === 0) {
            return this.whole;
        } else {
            return `${this.whole} ${this.frac.toString()}`;
        }
        //return `${this.whole} ${this.frac.toString()}`;
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
    insertIntoDiv(div, className=undefined) {
        console.log(`Inserting ${className}:`);
        let m = doc.createElement('span');
        if (className !== undefined){
            m.classList.add(className);
        }
        let whole = doc.createTextNode(this.whole);
        m.appendChild(whole);

        let frac = doc.createElement('span');
        frac.className = 'fraction';

        let n = doc.createElement('span');
        n.className = 'numerator';
        n.innerText = this.frac.reduced.numerator;
        frac.appendChild(n);

        let d = doc.createElement('span');
        d.className = 'denominator';
        d.innerText = this.frac.reduced.denominator;
        frac.appendChild(d);

        m.appendChild(frac);
        div.appendChild(m); 
    }
}


function gcd(a, b) {
    // Greatest Common Divisor using Euclidean algorithm
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
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
    constructor(f1, f2, div_id){
        // f1 and f2 are Fraction instances
        this.divContainer = doc.getElementById(div_id);
        this.operator = "+"
        this.f1 = f1;
        this.f2 = f2;
        this.sum = addFractions(f1, f2);
        this.nrows = 0;
        this.ncols = 6;

        this.div = doc.createElement('div');
        this.div.style.display = 'grid';
        this.div.style.gridTemplateColumns = '15em 2em 2em 2em 2em 4em';
        this.div.style.gridTemplateRows = '1fr';
        this.div.style.border = '1px solid black';
        this.div.style.alignItems = 'center';

        this.answer = {};

        this.insertQuestionRow();

    }
    insertQuestionRow(){
        this.nrows += 1;
        this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        
        this.div.appendChild(doc.createTextNode('Question: '));
        this.div.appendChild(this.f1.toHTML());
        this.div.appendChild(this.getOperatorSpan("+"));
        this.div.appendChild(this.f2.toHTML());
        this.div.appendChild(this.getOperatorSpan("="));
        this.div.appendChild(this.getFractionInputs());
        
        this.divContainer.appendChild(this.div);

    }

    insertCommonDenominatorRow(){
        this.nrows += 1;
        this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        
        let LCM = lcm(this.f1.denominator, this.f2.denominator);

        let html = `Step 1 in addition is to find a common denominator.
                    In this case the lowest common denominator is ${LCM}`;

        this.insertCommentRow(html);
        this.div.appendChild(this.getCommonDenominatorButton());
    }

    getFractionInputs(){
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

        return frac;
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
                this.answer['denominator'] !== undefined) {
                    this.answer['fraction'] = new Fraction(this.answer['numerator'], this.answer['denominator']);
                    console.log("Answer: ", this.answer['fraction'].toString());
                    // add comment row
                    //this.insertCommentRow("Hi");
                    //add "show answer" button/row.
                    this.insertCommonDenominatorRow();
                }
        })

        return div;
    }

    insertCommentRow(html, rowSpan=1){
        this.nrows += rowSpan;
        this.div.style.gridTemplateRows = `repeat(${this.nrows}, 1fr)`;
        
        let div = doc.createElement('span');
        console.log(`${this.nrows-rowSpan+1} / ${this.nrows+1}`);
        div.style.gridRow = `${this.nrows-rowSpan} / ${this.nrows+1}`;
        div.style.border = '1px solid blue';
        //div.style.gridColumn = `1 / ${this.ncols+1}`;

        div.innerHTML = html;
        this.div.appendChild(div);
    }

    getCommonDenominatorButton(){
        let div = doc.createElement('input');
        div.type = 'button';
        div.value = 'Step 1: Common Denominator';

        return div;
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
    
}

class commonDenominatorButton{
    constructor(div_id,  r=1, c=1){
        this.div = doc.getElementById(div_id);
        this.button = doc.createElement("input");
        this.button.type = "button";
        this.button.value = 'Find common denominator';
        this.button.style.gridRow = r;
        this.button.style.gridColumn = c;


        this.div.appendChild(this.button);

    }
}


