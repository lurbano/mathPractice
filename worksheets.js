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