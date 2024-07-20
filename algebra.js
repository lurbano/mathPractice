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
        variables = []      // a list of Varaibles
    }) {
        this.coeff = coeff;
        this.variables = variables;
    }

    insertIntoDiv(div, {showDots=false, showSign=false}={}, signSpace='2px'){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 

        let signSpan = document.createElement('span');

        let sign = "";
        if (showSign){
            sign = this.coeff > 0 ? "+" : "−";
        }

        //coefficient
        let c = Math.abs(this.coeff) + "";
        if (c === "1") c = "";
        
        signSpan.innerHTML = sign + c;
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
            if ("0123456789.+-".includes(char)){
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
        variables: variables
    })
}

class AlgebraicExperssion {
    constructor({
        terms = []      // a list of Term's
    }) {
        this.terms = terms;
    }

    insertIntoDiv(div, {showDots=false}={}){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 
        let d = document.createElement('span');

        let mods = {};
        for (let [i, t] of this.terms.entries()){
            if (i > 0){
                mods["showSign"] = true;
            }
            t.insertIntoDiv(d, mods);
        }
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
    return new AlgebraicExperssion({terms:terms});
}


class Equation{
    constructor({
        expressions = []    //list of AlgebraicExpressions
    }){
        this.expressions = expressions;
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
