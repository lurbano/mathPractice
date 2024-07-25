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
        if (showSign){
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
        return false;
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
    for (let c of s){
        //console.log(c);
        if ('+-'.includes(c)){
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

        // SIMPLIFY
        let eq = this.simplify();
        console.log("eq:", eq.toString());
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
        console.log("eq:", eq.toString());

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

    insertIntoDiv(div, {showDots=false}={}){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 
        let d = document.createElement('span');

        let mods = {showDots:showDots};
        for (let [i, e] of this.expressions.entries()){
            e.insertIntoDiv(d, mods);
            if (i < this.expressions.length-1){
                appendString(d, "=");
            }
        }
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
            console.log("gridDiv.id:", gridDiv.id);
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
                // appendString(d, "=");
                let spn = document.createElement('div');
                spn.textContent = "=";
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

    // insertIntoGrid(gridDiv, {showDots=false, gridRow=1}={}){
    //     // div is either the Element or the element's id
        
    //     if (checkForString(gridDiv)){ // if string assume it's the element id
    //         gridDiv = document.getElementById(gridDiv);
    //     } 
        

    //     this.styleEquationGrid({div: gridDiv});

    //     let mods = {showDots:showDots};
    //     let margin = "4px";
    //     let c = 2;
        
    //     for (let [i, e] of this.expressions.entries()){
    //         let eDiv = e.getDiv();
    //         // eDiv.id = this.getGridId(gridRow,c);
    //         eDiv.classList.add("grid-item");
    //         eDiv.style.padding = '1px';
    //         eDiv.style.textAlign = 'center';

    //         eDiv.style.gridRow = gridRow;
    //         eDiv.style.gridColumn = c;
            
    //         let just = (i === 0) ? 'end' : 'start';
    //         eDiv.style.justifySelf = just;
            
    //         c = c + 1 ;
    //         gridDiv.appendChild(eDiv);
    //         // e.insertIntoDiv(d, mods);
    //         if (i < this.expressions.length-1){
    //             // appendString(d, "=");
    //             let spn = document.createElement('div');
    //             spn.textContent = "=";
    //             // spn.id = this.getGridId(gridRow,c);
    //             spn.style.gridRow = gridRow;
    //             spn.style.gridColumn = c;
    //             spn.classList.add("grid-item");
    //             c = c + 1;
                
    //             gridDiv.appendChild(spn);
    //         }
    //     }
    //     //gridDiv.appendChild(g);
    //     return gridRow + 1;
    // }
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

        //error checking and conversion
        if (checkForString(equation)) equation = parseEquation(equation);
        if (equation instanceof Equation){
            this.equation = equation;
            this.solvedEquation = this.equation.solveOneSimilarVariable();
        } else {
            throw new Error(`${input}, is not a valid Equation instance.`)
        }


        if (div !== undefined) {
            this.insertQuestion(div, 1);
            // if (checkForString(div)) div = document.getElementById(div);
            // if (div instanceof Element){
            //     if (div.id !== ""){
            //         this.div = div;
            //     } else {
            //         throw new Error('div.id is undefined');
            //     }
                
            // } else {
            //     throw new Error(`AlgebraQuestion: div is not an Element on the page: ${initDiv}`);
            // }
            
            // this.gridRow = this.equation.insertIntoGrid(this.div, {gridRow:1});

            // this.insertAnswerInput();
        }

    }

    insertQuestion(div, gridRow=1){
        if (checkForString(div)) div = document.getElementById(div);
            if (div instanceof Element){
                if (div.id !== ""){
                    this.div = div;
                } else {
                    throw new Error('div.id is undefined');
                }
                
            } else {
                throw new Error(`AlgebraQuestion: div is not an Element on the page: ${initDiv}`);
            }
            
            this.gridRow = this.equation.insertIntoGrid(this.div, {gridRow:gridRow});

            this.insertAnswerInput();
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
            this.userEquation.insertIntoGrid(this.div, {gridRow:this.answerRow})

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
        this.div.appendChild(this.inputDiv);
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
        }

        // check for correct variable
        let correctTerm = this.solvedEquation.expressions[0].terms[0];
        let userTerm = userAnswer.expressions[0].terms[0];
        if (correctTerm.isSameAs(userTerm)){
            score += 2;
        }

        console.log("Check answer:", correctValue, userValue, isCorrect, score);


        return new AlgebraResult({
            userAnswer: userAnswer,
            correctAnswer: this.solvedEquation,
            note: note,
            isCorrect: isCorrect,
            score: score
        })
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












//  UTILITY FUNCTIONS
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
function appendString(div, s, {margin="4px"}={}){
    if (checkForString(div)){ // if string assume it's the element id
        div = document.getElementById(div);
    }
    let spn = document.createElement('span');
    spn.style.marginLeft = margin;
    spn.style.marginRight = margin;
    spn.textContent = s;
    div.appendChild(spn);
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