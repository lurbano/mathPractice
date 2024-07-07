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

        // if (liveScore){
        //     this.showScores();
        //     this.inputBoxes = doc.querySelector('.answerTextInput');

        //     this.inputBoxes.addEventListener("change", () => {
        //         console.log(this);
        //         setTimeout(() => {this.showScores()}, 500);
        //     })
        // }

        
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

        // headers
        this.putInScoreTable("#", 1, qCol); // question #
        this.putInScoreTable("Your Answer", 1, uaCol);
        this.putInScoreTable("Correct", 1, iscCol);


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

            let nTries = question.userResults.length;
            // console.log(row, question.userResults.length);
            if (nTries > 0) {
                let lastTry = question.userResults[question.userResults.length-1];

                let ua = lastTry.userAnswer.getElement();
                uaDiv.innerHTML = "";
                uaDiv.appendChild(ua);

                if (lastTry.isCorrect){
                    iscDiv.innerHTML = "✔";
                    iscDiv.style.backgroundColor = "aqua";
                    nCorrect++;
                } else {
                    iscDiv.innerHTML = "✘";
                    iscDiv.style.backgroundColor = "lightpink";
                    nWrong++;
                }
            } else {
                uaDiv.innerHTML = "No Answer";
                nNoAnswer++;
            }

            this.putInScoreTable(uaDiv, row, uaCol);
            this.putInScoreTable(iscDiv, row, iscCol);
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