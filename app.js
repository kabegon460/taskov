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
            const confirmation = confirm('本当にリセットしますか？');
            if (confirmation) {
                localStorage.clear(); // ローカルストレージをクリア
                taskData = []; // タスクデータをクリア
                displayTasks(taskData); // 空のタスクを表示してリセットを反映
                console.log('リセットが実行されました');
            } else {
                console.log('リセットがキャンセルされました');
            }
        });
    }

    document.getElementById('add-task-button').addEventListener('click', function() {
        // タスク追加処理
        const taskNameInput = document.getElementById('task-search-input');
        const taskName = taskNameInput.value;

        if (taskName) {
            const taskTableBody = document.querySelector('#task-table tbody');
            const newRow = taskTableBody.insertRow(0); // 先頭に追加

            // 必要なセルを追加してタスク情報を設定
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            const cell5 = newRow.insertCell(4);
            const cell6 = newRow.insertCell(5);
            const cell7 = newRow.insertCell(6);
            const cell8 = newRow.insertCell(7);
            

            cell1.innerHTML = '<input type="checkbox">';
            cell2.innerHTML = '色';
            cell3.innerHTML = `<a href="#">${taskName}</a>`;
            cell4.innerHTML = 'kappa';
            cell5.innerHTML = 'トレーダー';
            cell6.innerHTML = 'マップ';
            cell7.innerHTML = '目標';
            cell8.innerHTML = 'メモ';

            // タスク名検索の入力フィールドをクリア
            taskNameInput.value = '';

            // タスクデータの先頭に追加
            taskData.unshift([taskName, '','kappa', 'トレーダー', 'マップ', '目標', 'メモ', '#ffffff', false]);
            saveTasksToLocalStorage(); // ローカルストレージに保存
            displayTasks(taskData); // タスクを表示
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const noteElement = document.getElementById('note');

    // 保存されたノートを表示
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteElement.value = savedNote;
    }

    // ノートの内容をローカルストレージに自動保存
    noteElement.addEventListener('input', function() {
        const note = noteElement.value;
        localStorage.setItem('note', note);
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
            const newTasks = data.values.slice(1).filter(row => row.some(field => field.toLowerCase().includes(query.toLowerCase()))).map(row => [...row, "", "#ffffff"].map(field => field.replace(/\n/g, '<br>'))); // 空のメモ欄とデフォルトの色を追加し、改行を <br> に変換
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

// タスクを追加する関数
function addTask(task) {
    task.id = generateUniqueId(); // タスクに一意のIDを追加
    taskData.unshift(task); // 新しいタスクを配列の先頭に追加
    saveTasksToLocalStorage(); // ローカルストレージに保存
    displayTasks(taskData); // テーブルを再描画
}

// タスクを表示する関数
function displayTasks(tasks) {
    const tableBody = document.querySelector("#task-table tbody");
    tableBody.innerHTML = ""; // テーブルの内容をクリア

    tasks.forEach((task) => {
        const row = document.createElement("tr");

        row.style.backgroundColor = task[7] || "#ffffff"; // 保存された色を適用

        const completeCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task[8] || false; // 保存された完了状態を適用
        checkbox.addEventListener("change", () => {
            row.classList.toggle("hidden", checkbox.checked);
            const taskIndex = taskData.findIndex(t => t.id === task.id);
            taskData[taskIndex][8] = checkbox.checked; // 完了状態を保存
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
            if (color.value === task[7]) {
                option.selected = true;
            }
            colorSelect.appendChild(option);
        });

        colorSelect.addEventListener("change", () => {
            const taskIndex = taskData.findIndex(t => t.id === task.id);
            taskData[taskIndex][7] = colorSelect.value; // 色を保存
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

        const kappaCell = document.createElement("td");
        kappaCell.textContent = task[2];

        const traderCell = document.createElement("td");
        traderCell.textContent = task[3];

        const mapCell = document.createElement("td");
        mapCell.innerHTML = task[4]; // innerHTMLを使用して改行を反映

        const objectiveCell = document.createElement("td");
        objectiveCell.innerHTML = task[5]; // innerHTMLを使用して改行を反映

        const memoCell = document.createElement("td");
        memoCell.contentEditable = true;
        memoCell.innerHTML = task[6] || ""; // innerHTMLを使用して改行を反映
        memoCell.addEventListener("input", () => {
            const taskIndex = taskData.findIndex(t => t.id === task.id);
            taskData[taskIndex][6] = memoCell.innerHTML.replace(/<br>/g, '\n'); // 改行を元に戻して保存
            saveTasksToLocalStorage(); // ローカルストレージに保存
        });

        row.appendChild(completeCell);
        row.appendChild(colorCell);
        row.appendChild(taskNameCell);
        row.appendChild(kappaCell);
        row.appendChild(traderCell);
        row.appendChild(mapCell);
        row.appendChild(objectiveCell);
        row.appendChild(memoCell);

        tableBody.appendChild(row); // 順序を保持して追加
    });
}

function addSortListeners() {
    const headers = document.querySelectorAll("#task-table thead th");
    console.log("Headers found:", headers.length); // デバッグ用
    headers.forEach((header, index) => {
        if (![1, 3, 4, 5].includes(index)) return; // 色、タスク名、トレーダー、マップのみソート可能
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
            saveTasksToLocalStorage(); // ソート後の順序を保存
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

    // ソート後の順序を保存
    taskData = rows.map(row => {
        const cells = row.children;
        return [
            cells[2].textContent.trim(), // タスク名
            cells[2].querySelector('a').href, // リンク
            cells[3].textContent.trim(), // Kappa
            cells[4].textContent.trim(), // トレーダー
            cells[5].textContent.trim(), // マップ
            cells[6].innerHTML.trim().replace(/\n/g, '<br>'), // 目標 (改行を反映)
            cells[7].textContent.trim(), // メモ
            row.style.backgroundColor, // 色
            cells[0].querySelector('input').checked // 完了状態
        ];
    });
    saveTasksToLocalStorage(); // ローカルストレージに保存
}

function addSearchListener() {
    const searchInput = document.getElementById("task-search-input"); // IDを修正
    const taskSuggestions = document.getElementById("task-suggestions");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            if (query.trim() !== '') {
                taskSuggestions.style.display = 'block';
            } else {
                taskSuggestions.style.display = 'none';
            }
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
            const searchInput = document.getElementById('task-search-input');
            searchInput.value = ''; // 検索入力欄をクリア

            // 手動でinputイベントを発火させる
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
            saveTasksToLocalStorage(); // ローカルストレージに保存
            displayTasks(taskData); // タスクを表示
        });
        searchResults.appendChild(resultItem);
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

    const kappaCell = document.createElement("td");
    kappaCell.textContent = task[2];

    const traderCell = document.createElement("td");
    traderCell.textContent = task[3];

    const mapCell = document.createElement("td");
    mapCell.innerHTML = task[4]; // innerHTMLを使用して改行を反映

    const objectiveCell = document.createElement("td");
    objectiveCell.innerHTML = task[5]; // innerHTMLを使用して改行を反映

    const memoCell = document.createElement("td");
    memoCell.contentEditable = true;
    memoCell.innerHTML = task[6] || ""; // innerHTMLを使用して改行を反映
    memoCell.addEventListener("input", () => {
        taskData[index][6] = memoCell.innerHTML.replace(/<br>/g, '\n'); // 改行を元に戻して保存
        saveTasksToLocalStorage(); // ローカルストレージに保存
    });

    row.appendChild(completeCell);
    row.appendChild(colorCell);
    row.appendChild(taskNameCell);
    row.appendChild(kappaCell);
    row.appendChild(traderCell);
    row.appendChild(mapCell);
    row.appendChild(objectiveCell);
    row.appendChild(memoCell);

    tableBody.insertBefore(row, tableBody.firstChild); // 先頭に追加
}

// 色を変更する関数
function changeColor(newColor) {
    // 色を変更するロジック
    document.body.style.backgroundColor = newColor;

    // selectのnameを保持するロジック
    const selectElement = document.querySelector('select[name="colorSelect"]');
    if (selectElement) {
        const selectedName = selectElement.name;
        console.log(`Selected name: ${selectedName}`);
    }
}

// タスクに一意のIDを生成する関数
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

