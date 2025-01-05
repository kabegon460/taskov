// Googleスプレッドシートの情報を設定
const spreadsheetId = "1E2cjy_nuYQ_EkKYtpWy78CAX-jxm5H82nhdWf3xqb7A"; // スプレッドシートのIDを入力
const apiKey = "AIzaSyBoPwl8z2jRwp4HZmCGUN5E1yhEeYUg3OY"; // Google Cloud Consoleで取得したAPIキーを入力
const sheetName = "シート1"; // シート名を指定（通常はSheet1）

let taskData = []; // スプレッドシートから取得したタスクデータ
let addedTasks = []; // 追加されたタスクリスト

// スプレッドシートからデータを取得
async function fetchTasks() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.values) {
            taskData = data.values.slice(1); // ヘッダー行を除外
            displayTasks(taskData);
        } else {
            console.error("データが見つかりませんでした");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}

// タスクリストを表示
function displayTasks(tasks) {
    const tableBody = document.querySelector("#task-table tbody");
    tableBody.innerHTML = ""; // テーブルの内容をクリア

    tasks.forEach(task => {
        const row = document.createElement("tr");

        // 完了チェックボックス
        const completeCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => {
            row.classList.toggle("hidden", checkbox.checked);
        });
        completeCell.appendChild(checkbox);

        // タスク名
        const taskNameCell = document.createElement("td");
        taskNameCell.textContent = task[2];

        // トレーダー
        const traderCell = document.createElement("td");
        traderCell.textContent = task[3];

        // マップ
        const mapCell = document.createElement("td");
        mapCell.textContent = task[4];

        // 目標
        const objectiveCell = document.createElement("td");
        objectiveCell.textContent = task[5];

        // 色選択
        const colorCell = document.createElement("td");
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = "#ffffff"; // デフォルトの色
        colorPicker.addEventListener("input", () => {
            row.style.backgroundColor = colorPicker.value;
        });
        colorCell.appendChild(colorPicker);

        // 行にセルを追加
        row.appendChild(completeCell);
        row.appendChild(taskNameCell);
        row.appendChild(traderCell);
        row.appendChild(mapCell);
        row.appendChild(objectiveCell);
        row.appendChild(colorCell);

        tableBody.appendChild(row);
    });
}

// 初回ロード時にデータを取得
fetchTasks();
