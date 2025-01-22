let taskData = []; // スプレッドシートから取得したタスクデータ
let currentSortColumn = null; // 現在のソート対象列
let sortOrder = 1; // 昇順: 1, 降順: -1

const spreadsheetId = "1E2cjy_nuYQ_EkKYtpWy78CAX-jxm5H82nhdWf3xqb7A";
const apiKey = "AIzaSyBoPwl8z2jRwp4HZmCGUN5E1yhEeYUg3OY";
const sheetName = "シート1";

document.addEventListener("DOMContentLoaded", () => {
    loadTasksFromLocalStorage();
    addSortListeners();
    addSearchListener(); // 検索リスナーを追加

    // 初期アクセス時にはタスクを表示しない

    // リセットボタンのクリックイベントを追加
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            localStorage.clear(); // ローカルストレージをクリア
            taskData = []; // タスクデータをクリア
            displayTasks(taskData); // 空のタスクを表示してリセットを反映
        });
    }

    document.getElementById('add-task-button').addEventListener('click', function() {
        // タスク追加処理
        const taskNameInput = document.getElementById('task-search-input');
        const taskName = taskNameInput.value;

        if (taskName) {
            const taskTableBody = document.querySelector('#task-table tbody');
            const newRow = taskTableBody.insertRow();

            // 必要なセルを追加してタスク情報を設定
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            const cell5 = newRow.insertCell(4);
            const cell6 = newRow.insertCell(5);
            const cell7 = newRow.insertCell(6);

            cell1.innerHTML = '<input type="checkbox">';
            cell2.innerHTML = '色';
            cell3.innerHTML = `<a href="#">${taskName}</a>`;
            cell4.innerHTML = 'トレーダー';
            cell5.innerHTML = 'マップ';
            cell6.innerHTML = '目標';
            cell7.innerHTML = 'メモ';

            // タスク名検索の入力フィールドをクリア
            taskNameInput.value = '';
        }
    });
});

async function fetchTasks(query) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
        const data = await response.json();
        console.log("Fetched data:", data); // デバッグ用にデータを確認
        if (data.values) {
            // 検索クエリに一致するタスクをフィルタリング
            const newTasks = data.values.slice(1).filter(row => row.some(field => field.toLowerCase().includes(query.toLowerCase()))).map(row => [...row, "", "#ffffff"]); // 空のメモ欄とデフォルトの色を追加
            displaySearchResults(newTasks); // 検索結果を表示
        } else {
            console.error("データが見つかりませんでした");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}

// ローカルストレージにタスクデータを保存する関数
function saveTasksToLocalStorage() {
    localStorage.setItem("taskData", JSON.stringify(taskData));
}

// ローカルストレージからタスクデータを読み込む関数
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem("taskData");
    if (storedTasks) {
        taskData = JSON.parse(storedTasks);
        displayTasks(taskData); // タスクを表示
    }
}

// タスクを表示する関数
function displayTasks(tasks) {
    const tableBody = document.querySelector("#task-table tbody");
    tableBody.innerHTML = ""; // テーブルの内容をクリア

    tasks.forEach((task, index) => {
        const row = document.createElement("tr");

        row.style.backgroundColor = task[6] || "#ffffff"; // 保存された色を適用

        const completeCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task[7] || false; // 保存された完了状態を適用
        checkbox.addEventListener("change", () => {
            row.classList.toggle("hidden", checkbox.checked);
            taskData[index][7] = checkbox.checked; // 完了状態を保存
            saveTasksToLocalStorage(); // ローカルストレージに保存
        });
        completeCell.appendChild(checkbox);
        row.appendChild(completeCell);

        // 完了しているタスクは非表示にする
        if (checkbox.checked) {
            row.classList.add("hidden");
        }

        const colorCell = document.createElement("td");
        const colorSelect = document.createElement("select");
        const colors = [
            { name: "白", value: "#ffffff" },
            { name: "赤", value: "#ffcccc" },
            { name: "青", value: "#cce5ff" },
            { name: "緑", value: "#ccffcc" },
            { name: "黄", value: "#ffffcc" }
        ];

        colors.forEach(color => {
            const option = document.createElement("option");
            option.value = color.value;
            option.textContent = color.name;
            option.style.backgroundColor = color.value;
            option.style.color = (color.value === "#ffffff") ? "#000000" : "#000000";
            if (color.value === task[6]) {
                option.selected = true;
            }
            colorSelect.appendChild(option);
        });

        colorSelect.addEventListener("change", () => {
            taskData[index][6] = colorSelect.value; // 色を保存
            row.style.backgroundColor = colorSelect.value; // 色を適用
            saveTasksToLocalStorage(); // ローカルストレージに保存
        });

        colorCell.appendChild(colorSelect);
        row.appendChild(colorCell);

        const taskNameCell = document.createElement("td");
        const link = document.createElement("a");
        link.textContent = task[0];
        link.href = task[1];
        link.target = "_blank";
        taskNameCell.appendChild(link);

        const traderCell = document.createElement("td");
        traderCell.textContent = task[2];

        const mapCell = document.createElement("td");
        mapCell.textContent = task[3];

        const objectiveCell = document.createElement("td");
        objectiveCell.textContent = task[4];

        const memoCell = document.createElement("td");
        memoCell.contentEditable = true;
        memoCell.textContent = task[5] || "";
        memoCell.addEventListener("input", () => {
            taskData[index][5] = memoCell.textContent;
            saveTasksToLocalStorage(); // ローカルストレージに保存
        });

        row.appendChild(completeCell);
        row.appendChild(colorCell);
        row.appendChild(taskNameCell);
        row.appendChild(traderCell);
        row.appendChild(mapCell);
        row.appendChild(objectiveCell);
        row.appendChild(memoCell);

        tableBody.appendChild(row);
    });
}

function addSortListeners() {
    const headers = document.querySelectorAll("#task-table thead th");
    console.log("Headers found:", headers.length); // デバッグ用
    headers.forEach((header, index) => {
        if (![1, 3, 4].includes(index)) return; // 色、タスク名、トレーダー、マップのみソート可能
        header.classList.add("sortable"); // ソート可能な列にクラスを追加
        header.addEventListener("click", () => {
            console.log(`Header clicked: Column ${index}`); // デバッグ用
            const isColorColumn = index === 1; // 色列のインデックス
            if (currentSortColumn === index) {
                sortOrder *= -1;
            } else {
                currentSortColumn = index;
                sortOrder = 1;
            }
            sortTable(index, isColorColumn);
        });
    });
}

function sortTable(columnIndex, isColorColumn = false) {
    console.log(`Sorting column: ${columnIndex}, Order: ${sortOrder}`); // デバッグ用

    const tableBody = document.querySelector("#task-table tbody");
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex].textContent.trim();
        const cellB = rowB.children[columnIndex].textContent.trim();

        const valueA = isColorColumn ? rowA.style.backgroundColor.toLowerCase() : cellA;
        const valueB = isColorColumn ? rowB.style.backgroundColor.toLowerCase() : cellB;

        if (valueA < valueB) return -1 * sortOrder;
        if (valueA > valueB) return 1 * sortOrder;
        return 0;
    });

    rows.forEach(row => tableBody.appendChild(row));
}

function addSearchListener() {
    const searchInput = document.getElementById("task-search-input"); // IDを修正
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            fetchTasks(query); // 検索クエリに基づいてタスクを取得
        });
    }
}

// 検索結果を表示する関数
function displaySearchResults(tasks) {
    const searchResults = document.getElementById("task-suggestions");
    searchResults.innerHTML = ""; // 検索結果の内容をクリア

    tasks.forEach((task, index) => {
        const resultItem = document.createElement("div");
        resultItem.textContent = task[0]; // タスクの名前を表示
        resultItem.addEventListener("click", () => {
            taskData.push(task); // タスクを追加
            saveTasksToLocalStorage(); // ローカルストレージに保存
            displayTasks(taskData); // タスクを表示
        });
        searchResults.appendChild(resultItem);
    });
}

function clearSuggestions() {
    const suggestionsList = document.querySelector("#task-suggestions");
    suggestionsList.innerHTML = ""; // 既存の提案をクリア
}

function displaySuggestions(suggestions) {
    const suggestionsList = document.querySelector("#task-suggestions");
    suggestionsList.innerHTML = ""; // 既存の提案をクリア

    suggestions.forEach((task, index) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = task[0]; // タスク名を表示
        suggestionItem.addEventListener("click", () => {
            addTaskToTable(task);
            suggestionsList.innerHTML = ""; // 提案リストをクリア
            document.querySelector("#task-search-input").value = ""; // 検索欄の文字を消去
        });
        suggestionsList.appendChild(suggestionItem);
    });
}

function addTaskToTable(task) {
    const tableBody = document.querySelector("#task-table tbody");
    const row = document.createElement("tr");

    row.style.backgroundColor = "#ffffff";

    const completeCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
        row.classList.toggle("hidden", checkbox.checked);
    });
    completeCell.appendChild(checkbox);

    const colorCell = document.createElement("td");
    const colorSelect = document.createElement("select");
    const colors = [
        { name: "白", value: "#ffffff" },
        { name: "赤", value: "#ffcccc" },
        { name: "青", value: "#cce5ff" },
        { name: "緑", value: "#ccffcc" },
        { name: "黄", value: "#ffffcc" }
    ];

    colors.forEach(color => {
        const option = document.createElement("option");
        option.value = color.value;
        option.textContent = color.name;
        option.style.backgroundColor = color.value;
        option.style.color = (color.value === "#ffffff") ? "#000000" : "#000000";
        colorSelect.appendChild(option);
    });

    colorSelect.addEventListener("change", () => {
        row.style.backgroundColor = colorSelect.value;
    });
    colorCell.appendChild(colorSelect);

    const taskNameCell = document.createElement("td");
    const link = document.createElement("a");
    link.textContent = task[0];
    link.href = task[1];
    link.target = "_blank";
    taskNameCell.appendChild(link);

    const traderCell = document.createElement("td");
    traderCell.textContent = task[2];

    const mapCell = document.createElement("td");
    mapCell.textContent = task[3];

    const objectiveCell = document.createElement("td");
    objectiveCell.textContent = task[4];

    const memoCell = document.createElement("td");
    memoCell.contentEditable = true;
    memoCell.textContent = task[5] || "";
    memoCell.addEventListener("input", () => {
        taskData[index][5] = memoCell.textContent;
    });

    row.appendChild(completeCell);
    row.appendChild(colorCell);
    row.appendChild(taskNameCell);
    row.appendChild(traderCell);
    row.appendChild(mapCell);
    row.appendChild(objectiveCell);
    row.appendChild(memoCell);

    tableBody.appendChild(row);
}
