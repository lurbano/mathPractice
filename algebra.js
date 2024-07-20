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
        coeff = 1, // a coefficient
        variables = [new Variable()] // a list of varaibles
    }) {
        this.coeff = coeff;
        this.variables = variables;
    }

    insertIntoDiv(div, {showDots=false}={}){
        // div is either the Element or the element's id

        if (checkForString(div)){ // if string assume it's the element id
            div = document.getElementById(div);
        } 

        let d = document.createElement('span');
        d.innerHTML = this.coeff;
        div.appendChild(d);

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
        s = s.replace(' ', '');
        // check if negative
        if (s[0] === '-'){
            sign = -1;
            s = s.slice(1);
        }
        // get constant
        for (const char of s){
            if ("0123456789.".includes(char)){
                c = c + char;
                s = s.slice(1);
            } else {
                break;
            }
        }
        // get variables
        variables = getVariables(s);
        
        c = parseFloat(c) * sign;

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
        terms = [new Term] // a list of terms
    }) {
        this.tems = terms;
    }
}


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