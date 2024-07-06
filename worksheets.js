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
        console.log("Showing Scores")
        //this.scoreDiv.innerHTML = "";
        let ncols = 4
        this.scoreTable.innerHTML = "";
        this.scoreTable.style.display = 'grid';
        this.scoreTable.style.gridTemplateColumns = `repeat(${ncols}, auto)`;

        //score table
        for (const [i, question] of this.questionsList.entries()){

            let row = i+1;
            
            //number
            let qDiv = doc.createElement('div');
            qDiv.innerHTML = `${i+1})`;
            qDiv.style.gridRow = row;
            qDiv.style.gridColumn = 1;
            this.scoreTable.appendChild(qDiv);

            let uaDiv = doc.createElement('div');
            uaDiv.style.gridRow = row;
            uaDiv.style.gridColumn = 2;

            let nTries = question.userResults.length;
            console.log(row, question.userResults.length);
            if (nTries > 0) {
                let lastTry = question.userResults[question.userResults.length-1];
                let ua = lastTry.userAnswer.getElement();
                uaDiv.innerHTML = "";
                uaDiv.appendChild(ua);
            } else {
                uaDiv.innerHTML = "No Answer";
                
            }

            this.scoreTable.appendChild(uaDiv);
        }
    }

}