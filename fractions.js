let doc = document;
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
}
class Fraction {
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
        //this.reduce();
    }

    isImproper(){
        if (this.numerator > this.denominator) {
            return true;
        } else {
            return false;
        }
    }

    gcd(a, b) {
        // Greatest Common Divisor using Euclidean algorithm
        while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
        }
        return a;
    }

    reducable() {
        const commonDivisor = this.gcd(this.numerator, this.denominator);
        console.log(commonDivisor);
        const r = commonDivisor === 1 ? false : true;
        return r;
    }
    reduce() {
        // Reduce the fraction to its simplest form
        const commonDivisor = this.gcd(this.numerator, this.denominator);
        console.log("commonDivisor: ", commonDivisor);
        this.numerator /= commonDivisor;
        this.denominator /= commonDivisor;
        console.log(this.toString());
    }

    toMixedNumber() {
        const wholeNumber = Math.floor(this.numerator / this.denominator);
        const remainder = this.numerator % this.denominator;

        return new mixedNumber(wholeNumber, new Fraction(remainder, this.denominator))

    }

    toString() {
        return `${this.numerator}/${this.denominator}`;
    }

    toHTML() {
        console.log("outputting fraction...");
        return (
        `
        <span class="fraction">
            <span class="numerator">${this.numerator}</span>
            <span class="denominator">${this.denominator}</span>
        </span> 
        `)
    }

    insertIntoDiv(div, className=undefined) {
        console.log(`Inserting ${className}:`);
        let frac = doc.createElement('span');
        frac.className = 'fraction';
        if (className !== undefined){
            frac.classList.add(className);
        }

        let n = doc.createElement('span');
        n.className = 'numerator';
        n.innerText = this.numerator;
        frac.appendChild(n);

        let d = doc.createElement('span');
        d.className = 'denominator';
        d.innerText = this.denominator;
        frac.appendChild(d);

        div.appendChild(frac); 
    }


    answerSetup(div) {
        let ansDiv = doc.createElement("div");
        ansDiv.className = 'question-answer';
        let s = doc.createElement('span');
        s.classList.add('fraction');

        this.nInput = doc.createElement('input');
        this.nInput.className = "numerator";
        this.nInput.type = 'number';
        this.nInput.min = -1000;
        this.nInput.max = 1000;
        this.nInput.step = 1;
        this.nInput.style.width = '3em';
        s.appendChild(this.nInput);

        this.dInput = doc.createElement('input');
        this.dInput.className = "denominator";
        this.dInput.type = 'number';
        this.dInput.min = -1000;
        this.dInput.max = 1000;
        this.dInput.step = 1;
        this.dInput.style.width = '3em';
        s.appendChild(this.dInput);

        ansDiv.appendChild(s);
        div.appendChild(ansDiv);

        this.ansCheckButton = doc.createElement('input');
        this.ansCheckButton.type = "button";
        this.ansCheckButton.value = "Check Answer";
        this.ansCheckButton.className = 'question-ansCheckButton';

        this.ansCheckButton.addEventListener("click", () => {
            console.log(this.toString());
            this.insertIntoDiv(div, "question-ans-1");

            //check if simplifiable
            console.log("reducable? ", this.reducable());
            if (this.reducable) {
                //create simplify button
                this.simplifyButton = doc.createElement('input');
                this.simplifyButton.type = 'button';
                this.simplifyButton.value = "Simplify";
                this.simplifyButton.className = 'question-simplify-button';
                div.append(this.simplifyButton);

                
            }

        });

        div.appendChild(this.ansCheckButton);

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


class addQuestion{
    constructor(f1, f2){
        // f1 and f2 are Fraction's
        this.operator = "+"
        this.f1 = f1;
        this.f2 = f2;
        this.sum = addFractions(f1, f2);
    }
    questionHTML(){
        this.html = `${f1.toHTML()} + ${f2.toHTML()} =`;
        return this.html;
    }
    getDiv(id=0){
        let div = doc.createElement("div");
        div.id = `addQ${id}`;
        div.className = "question-container";
        
        div.appendChild(gridDiv(f1.toHTML(), "question-fraction1"));
        div.appendChild(gridDiv(this.operator, "question-operator"));
        div.appendChild(gridDiv(f2.toHTML(), "question-fraction2"));
        div.appendChild(gridDiv("=", "question-equals"));
        
        // answer
        //let ans = this.sum.answerDiv();
        //div.appendChild(this.sum.answerDiv());
        this.sum.answerSetup(div);

        return div;
    }
}