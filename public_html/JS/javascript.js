var TIME_LIMIT = 300; 
var timerInterval;
var correctAnswers = {
    q1: "Чистую воду",                                    
    q2: "В чистом лесу",                           
    q3: ["Тихий разговор", "Пение птиц"],       
    q4: ["Открыть окно", "Вытереть пыль (сделать уборку)"],          
    q5: "Воздухом",           
    q6: "Чистой тёплой водой с мылом",                          
    q7: "Воздух",                                 
    q8: "2"                                     
};

var questionTexts = {
    q1: "Что лучше пить, чтобы не болеть?",
    q2: "Где приятно гулять?",
    q3: "Что не вредит ушам и слуху?",
    q4: "Что нужно делать, чтобы воздух в комнате был свежим и чистым?",
    q5: "Чем дышит человек?",
    q6: "Какой водой мыть руки?",
    q7: "Каждому человеку нужен чистый...",
    q8: "Сколько раз в день надо чистить зубы?"
};

var timeLeft = TIME_LIMIT;

/**
 * Обновляет отображение таймера на странице
 * При достижении 0 автоматически завершает тест
 * @function updateTimer
 * @returns {void}
 */
function updateTimer() {
    timeLeft = timeLeft - 1;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timeLeft = 0;
        finishTest();
        return;
    }

    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    document.getElementById("timer").textContent = minutes + ":" + seconds;
}

/**
 * Запускает обратный отсчёт таймера
 * Устанавливает интервал вызова updateTimer() каждую секунду
 * @function startTimer
 * @returns {void}
 */
function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Получает значение выбранного radio-элемента по имени группы
 * @function getRadioAnswer
 * @param {string} name - атрибут name группы radio-кнопок
 * @returns {string} Значение выбранного варианта или пустую строку, если
 *  ничего не выбрано
 */
function getRadioAnswer(name) {
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return "";
}

/**
 * Получает массив значений выбранных check box-элементов по имени группы
 * @function getCheckboxAnswers
 * @param {string} name - атрибут name группы чекбоксов
 * @returns {string[]} Массив выбранных значений (может быть пустым)
 */
function getCheckboxAnswers(name) {
    var checkboxes = document.getElementsByName(name);
    var selected = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selected.push(checkboxes[i].value);
        }
    }
    return selected;
}

/**
 * Получает значение выбранного option в элементе select
 * @function getSelectAnswer
 * @param {string} name - атрибут name элемента select
 * @returns {string} Значение выбранного option или пустую строку
 */
function getSelectAnswer(name) {
    var select = document.querySelector("select[name='" + name + "']");
    return select.value;
}

/**
 * Получает и обрабатывает значение текстового поля ввода
 * @function getTextAnswer
 * @param {string} name - атрибут name элемента input[type="text"]
 */
function getTextAnswer(name) {
    var input = document.querySelector("input[name='" + name + "']");
    return input.value.trim();
}

/**
 * Проверяет правильность ответа пользователя
 * Поддерживает сравнение строк (без учёта регистра) и массивов
 *  (полное совпадение)
 * 
 * @function checkAnswer
 * @param {string} qName - идентификатор вопроса 
 * @param {string|string[]} userAnswer - ответ пользователя 
 * @returns {boolean} true, если ответ полностью совпадает с правильным;
 * иначе false
 */
function checkAnswer(qName, userAnswer) {
    var correct = correctAnswers[qName];
    if (correct instanceof Array) {
        if (!(userAnswer instanceof Array)) {
            return false;
        }
        if (userAnswer.length !== correct.length) {
            return false;
        }
        for (var i = 0; i < correct.length; i++) {
            var found = false;
            for (var j = 0; j < userAnswer.length; j++) {
                if (userAnswer[j] === correct[i]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }
   
    if (typeof correct === "string" && typeof userAnswer === "string") {
        return correct.toLowerCase() === userAnswer.toLowerCase();
    }

    return false;
}

/**
 * Форматирует ответ пользователя для отображения в таблице результатов
 * 
 * @function formatAnswer
 * @param {string|string[]} answer - ответ пользователя
 * @returns {string} Отформатированная строка: 
 * для пустого ответа: "(нет ответа)"
 * для массива: элементы через запятую
 * для строки: как есть
 */
function formatAnswer(answer) {
    if (answer instanceof Array) {
        if (answer.length === 0) {
            return "(нет ответа)";
        }
        return answer.join(", ");
    }
    if (answer === "" || answer === undefined) {
        return "(нет ответа)";
    }
    return answer;
}

/**
 * Форматирует правильный ответ для отображения в таблице
 * @function formatCorrect
 * @param {string|string[]} correct - правильный ответ из correctAnswers
 * @returns {string} Строка с правильным ответом (массив соединяется через 
 * запятую)
 */
function formatCorrect(correct) {
    if (correct instanceof Array) {
        return correct.join(", ");
    }
    return correct;
}

/**
 * Завершает тест: останавливает таймер, проверяет ответы, 
 * формирует и отображает таблицу результатов с итоговой оценкой
 * 
 * @function finishTest
 * @returns {void}
 * Очищает и заполняет tbody#results-body
 * Скрывает форму теста и таймер
 * Показывает блок результатов #results-block
 * Вычисляет и отображает процент правильных ответов
 */
function finishTest() {
    clearInterval(timerInterval);

    var questions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];
    var tbody = document.getElementById("results-body");
    tbody.innerHTML = "";

    var totalScore = 0;
    var maxScore = questions.length;
    
    document.getElementById("quiz-form").style.display = "none";
    document.getElementById("timer-block").style.display = "none";
    document.getElementById("results-block").style.display = "block";

    for (var i = 0; i < questions.length; i++) {
        var qName = questions[i];
        var userAnswer = "";
        
        if (qName === "q1" || qName === "q2") {
            userAnswer = getRadioAnswer(qName);
        } else if (qName === "q3" || qName === "q4") {
            userAnswer = getCheckboxAnswers(qName);
        } else if (qName === "q5" || qName === "q6") {
            userAnswer = getSelectAnswer(qName);
        } else if (qName === "q7" || qName === "q8") {
            userAnswer = getTextAnswer(qName);
        }

        var isCorrect = checkAnswer(qName, userAnswer);
        var points = isCorrect ? 1 : 0;
        totalScore = totalScore + points;
        
        var rowClass = "";
        if (userAnswer === "" || userAnswer.length === 0) {
            rowClass = "row-wrong";
        } else if (isCorrect) {
            rowClass = "row-correct";
        } else {
            rowClass = "row-wrong";
        }
        
        var tr = document.createElement("tr");
        tr.className = rowClass;

        var tdNum = document.createElement("td");
        tdNum.textContent = (i + 1);

        var tdQuestion = document.createElement("td");
        tdQuestion.textContent = questionTexts[qName];

        var tdUser = document.createElement("td");
        tdUser.textContent = formatAnswer(userAnswer);

        var tdCorrect = document.createElement("td");
        tdCorrect.textContent = formatCorrect(correctAnswers[qName]);

        var tdPoints = document.createElement("td");
        tdPoints.textContent = points + " / 1";

        tr.appendChild(tdNum);
        tr.appendChild(tdQuestion);
        tr.appendChild(tdUser);
        tr.appendChild(tdCorrect);
        tr.appendChild(tdPoints);

        tbody.appendChild(tr);
    }
    var summary = document.getElementById("score-summary");
    var percent = Math.round((totalScore / maxScore) * 100);

    var summaryColor = "";
    if (percent >= 80) {
        summaryColor = "#d4edda";
    } else if (percent >= 50) {
        summaryColor = "#fff3cd";
    } else {
        summaryColor = "#f8d7da";
    }

    summary.style.backgroundColor = summaryColor;
    summary.textContent = "Набрано баллов: " + totalScore + " из " + maxScore 
            + " (" + percent + "%)";
}

document.getElementById("submit-btn").addEventListener("click", function () {
    var confirmFinish = confirm("Вы уверены, что хотите завершить тест?");
    if (confirmFinish) {
        finishTest();
    }
});

document.getElementById("restart-btn").addEventListener("click", function () {
    location.reload();
});
startTimer();