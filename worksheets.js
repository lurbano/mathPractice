var doc = document;
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

        //score table

        // columns
        let qCol = 1; //question column
        let uaCol = 2; //user answer column
        let iscCol = 3; // is correct column
        let nTriesCol = 4; // number of tries
        let scoreCol = 5; // score column

        // headers
        this.putInScoreTable("#", 1, qCol); // question #
        this.putInScoreTable("Your Answer", 1, uaCol);
        this.putInScoreTable("Correct", 1, iscCol);
        this.putInScoreTable("Tries", 1, nTriesCol);
        this.putInScoreTable("Score", 1, scoreCol);


        for (const [i, question] of this.questionsList.entries()){

            let row = i+2;
            
            //number
            let qDiv = doc.createElement('div');
            qDiv.innerHTML = `${i+1})`;
            this.putInScoreTable(qDiv, row, qCol);

            // user answer column
            let uaDiv = doc.createElement('div');

            // isCorrect column
            let iscDiv = doc.createElement('div');

            // nTries column
            let nTriesDiv = doc.createElement('div');
            let nTries = question.userResults.length;

            // score column
            let scoreDiv = doc.createElement('div');
            
            if (nTries > 0) {
                let lastTry = question.userResults[question.userResults.length-1];
                console.log("Last Try: ", lastTry);

                let ua = lastTry.userAnswer.getElement();
                uaDiv.innerHTML = "";
                uaDiv.appendChild(ua);
                let s = "x"

                if (lastTry.isCorrect){
                    iscDiv.innerHTML = "✔";
                    iscDiv.style.backgroundColor = "aqua";
                    s = new Fraction(lastTry.score,10);
                    nCorrect++;
                } else {
                    iscDiv.innerHTML = "✘";
                    iscDiv.style.backgroundColor = "lightpink";
                    s = strToFraction("1/10");
                    nWrong++;
                }
                console.log("Score:", s);
                scoreDiv.appendChild(s.getElement());

            } else {
                uaDiv.innerHTML = "No Answer";
                scoreDiv.innerHTML = "0";
                nNoAnswer++;
            }

            this.putInScoreTable(uaDiv, row, uaCol);
            this.putInScoreTable(iscDiv, row, iscCol);
            this.putInScoreTable(scoreDiv, row, scoreCol);
        }

        console.log(`Correct: ${nCorrect}; Wrong: ${nWrong}; No Answer: ${nNoAnswer}; Total Questions: ${nQuestions}`);
    }

    putInScoreTable(data, row, col){
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
        this.scoreTable.appendChild(div);
    }

}