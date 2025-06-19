// HTML要素の取得
const canvas = document.getElementById('game-board'); // ゲームボードのcanvas要素
const context = canvas.getContext('2d'); // 2D描画コンテキスト
const scoreElement = document.getElementById('score'); // スコア表示用のHTML要素

// ゲーム設定に関する定数
const ROWS = 20; // ゲームボードの行数
const COLS = 10; // ゲームボードの列数
const BLOCK_SIZE = 20; // 1ブロックのサイズ (ピクセル単位)

// ゲームボードの状態を保持する2次元配列
// 0: 空白セル, それ以外: 固定されたテトリミノの色情報
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// テトリミノの形状定義
const I_SHAPE = [ // I字型
    [1, 1, 1, 1]
];
const L_SHAPE = [ // L字型
    [1, 0, 0],
    [1, 1, 1]
];
const J_SHAPE = [ // J字型 (L字型の反対)
    [0, 0, 1],
    [1, 1, 1]
];
const T_SHAPE = [ // T字型
    [0, 1, 0],
    [1, 1, 1]
];
const O_SHAPE = [ // O字型 (正方形)
    [1, 1],
    [1, 1]
];
const S_SHAPE = [ // S字型
    [0, 1, 1],
    [1, 1, 0]
];
const Z_SHAPE = [ // Z字型 (S字型の反対)
    [1, 1, 0],
    [0, 1, 1]
];

// 全てのテトリミノの形状と色の組み合わせを定義した配列
const TETROMINOES = [
    { shape: I_SHAPE, color: 'cyan' },     // I字型 (水色)
    { shape: L_SHAPE, color: 'orange' },   // L字型 (オレンジ)
    { shape: J_SHAPE, color: 'blue' },     // J字型 (青)
    { shape: T_SHAPE, color: 'purple' },   // T字型 (紫)
    { shape: O_SHAPE, color: 'yellow' },   // O字型 (黄色)
    { shape: S_SHAPE, color: 'green' },    // S字型 (緑)
    { shape: Z_SHAPE, color: 'red' }       // Z字型 (赤)
];

// 現在操作中のテトリミノに関する変数
let currentTetromino; // 現在のテトリミノオブジェクト {shape, color}
let currentX;         // 現在のテトリミノのX座標 (ボード上の列インデックス)
let currentY;         // 現在のテトリミノのY座標 (ボード上の行インデックス)

/**
 * 新しいテトリミノをランダムに選択し、ボードの上部中央に配置する関数。
 */
function newTetromino() {
    const rand = Math.floor(Math.random() * TETROMINOES.length); // ランダムなインデックスを生成
    currentTetromino = TETROMINOES[rand]; // ランダムにテトリミノを選択
    // ボードの中央上部に配置するようにX座標を計算
    currentX = Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2);
    currentY = 0; // Y座標は最上段(0)に設定
}


// ゲームスコア
let score = 0;

/**
 * ゲームボード（固定されたブロック）を描画する関数。
 * canvasをクリアした後、board配列に基づいてブロックを描画する。
 */
function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height); // canvas全体をクリア

    // board配列を走査して、値が0でないセル（固定ブロック）を描画
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) { // セルにブロックが存在する場合
                context.fillStyle = board[row][col]; // ブロックの色を設定
                // ブロックを塗りつぶしで描画
                context.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#333'; // ブロックの境界線の色
                // ブロックの境界線を描画
                context.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

/**
 * 現在操作中のテトリミノを描画する関数。
 */
function drawTetromino() {
    if (!currentTetromino) return; // 操作中のテトリミノがなければ何もしない

    context.fillStyle = currentTetromino.color; // テトリミノの色を設定
    context.strokeStyle = '#333'; // テトリミノの各ブロックの境界線の色

    // テトリミノの形状 (shape配列) に基づいて各ブロックを描画
    currentTetromino.shape.forEach((row, yOffset) => { // shapeの各行を走査
        row.forEach((value, xOffset) => { // shapeの各列（値）を走査
            if (value) { // valueが1（ブロックあり）の場合
                // ブロックを塗りつぶしで描画
                context.fillRect(
                    (currentX + xOffset) * BLOCK_SIZE, // X座標
                    (currentY + yOffset) * BLOCK_SIZE, // Y座標
                    BLOCK_SIZE, BLOCK_SIZE // 幅と高さ
                );
                // ブロックの境界線を描画
                context.strokeRect(
                    (currentX + xOffset) * BLOCK_SIZE,
                    (currentY + yOffset) * BLOCK_SIZE,
                    BLOCK_SIZE, BLOCK_SIZE
                );
            }
        });
    });
}

/**
 * スコアを更新し、HTMLのスコア表示を更新する関数。
 * @param {number} newScore - 更新後の新しいスコア。
 */
function updateScore(newScore) {
    score = newScore; // 内部スコア変数を更新
    scoreElement.textContent = score; // HTML表示を更新
}

/**
 * ゲーム画面全体（ボードと操作中テトリミノ）を描画するメイン関数。
 */
function draw() {
    drawBoard();     // ボード（固定ブロック）の描画
    drawTetromino(); // 操作中テトリミノの描画
}

/**
 * 指定されたオフセットと形状でテトリミノが移動可能かどうかを判定する関数。
 * 壁、床、または他の固定ブロックとの衝突をチェックする。
 * @param {number} offsetX - X方向の移動オフセット。
 * @param {number} offsetY - Y方向の移動オフセット。
 * @param {Array<Array<number>>} shape - 判定に使用するテトリミノの形状 (省略時は現在のテトリミノの形状)。
 * @returns {boolean} - 移動可能であればtrue、そうでなければfalse。
 */
function canMove(offsetX, offsetY, shape) {
    shape = shape || currentTetromino.shape; // shapeが指定されていなければ現在のテトリミノの形状を使用

    for (let y = 0; y < shape.length; y++) { // 形状の各行
        for (let x = 0; x < shape[y].length; x++) { // 形状の各列
            if (shape[y][x]) { // 形状内でブロックが存在する部分のみチェック
                let checkX = currentX + x + offsetX; // 移動後のX座標
                let checkY = currentY + y + offsetY; // 移動後のY座標

                // 1. 壁との衝突チェック
                if (checkX < 0 || checkX >= COLS || checkY >= ROWS) {
                    return false; // ボードの左右端または底辺を超えた場合
                }
                // 2. 上壁との衝突チェック (主に回転時にYが負になるケースを想定)
                if (checkY < 0) {
                    // Y座標が負になる移動は基本的に許可しない。
                    // 高度なウォールキックなどを実装する場合は、この条件の見直しが必要になることがある。
                    if (offsetY < 0 && (currentY + y + offsetY < 0) ) return false;
                }
                // 3. 他の固定ブロックとの衝突チェック
                //    checkYが0以上（ボード内）であり、かつその位置に既にブロック(board[checkY][checkX] !== 0)が存在する場合
                if (checkY >= 0 && board[checkY] && board[checkY][checkX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true; // 全てのチェックをパスすれば移動可能
}

/**
 * 現在のテトリミノを時計回りに90度回転させる関数。
 * 回転後に衝突する場合は、簡易的なウォールキック（左右への1マス移動）を試みる。
 */
function rotate() {
    const originalShape = currentTetromino.shape; // 回転前の形状を保持
    // 2次元配列を回転させる (転置行列を作成後、各行を反転)
    const newShape = originalShape[0].map((_, colIndex) =>
        originalShape.map(row => row[colIndex]).reverse()
    );

    // 回転後の形状で衝突判定
    if (canMove(0, 0, newShape)) { // その場で回転可能か
        currentTetromino.shape = newShape; // 回転後の形状を適用
    } else {
        // ウォールキック試行1: 右に1マスずらして回転可能か
        if (canMove(1, 0, newShape)) {
            currentX++; // 右に1マス移動
            currentTetromino.shape = newShape;
        }
        // ウォールキック試行2: 左に1マスずらして回転可能か
        else if (canMove(-1, 0, newShape)) {
            currentX--; // 左に1マス移動
            currentTetromino.shape = newShape;
        }
        // これ以上の複雑なウォールキックルールはここに追加検討
    }
}

/**
 * 操作中のテトリミノをゲームボードに固定する関数。
 * 固定後、ライン消去処理を呼び出し、新しいテトリミノを生成する。
 * 新しいテトリミノが生成不可（即座に衝突）の場合はゲームオーバーとする。
 */
function lockTetromino() {
    // 現在のテトリミノの形状と位置に基づいて、board配列に色情報を書き込む
    currentTetromino.shape.forEach((row, yOffset) => {
        row.forEach((value, xOffset) => {
            if (value) { // テトリミノのブロック部分のみ
                // ボードの範囲内であることを確認して書き込み
                if (currentY + yOffset >= 0 && currentY + yOffset < ROWS &&
                    currentX + xOffset >= 0 && currentX + xOffset < COLS) {
                    board[currentY + yOffset][currentX + xOffset] = currentTetromino.color;
                }
            }
        });
    });

    clearLines(); // ライン消去処理を実行

    newTetromino(); // 新しいテトリミノを生成
    // ゲームオーバー判定: 新しいテトリミノが初期位置で既に衝突しているか
    if (!canMove(0,0)) {
        gameRunning = false; // ゲーム実行フラグをfalseに設定
        console.log("Game Over: New tetromino cannot be placed."); // コンソールにゲームオーバー事由を記録
    }
}

/**
 * 揃ったラインを消去し、スコアを加算する関数。
 * 消去されたラインの上にあるブロックを下にずらす。
 */
function clearLines() {
    let linesCleared = 0; // 今回の処理で消去されたライン数
    // ボードの下の行から上の行に向かってチェック
    for (let r = ROWS - 1; r >= 0; r--) {
        // 行内の全てのセルが0でない（ブロックで埋まっている）かチェック
        if (board[r].every(cell => cell !== 0)) {
            linesCleared++; // 消去ライン数をカウントアップ
            board.splice(r, 1); // 揃った行を削除
            board.unshift(Array(COLS).fill(0)); // ボードの先頭に新しい空の行を追加
            r++; // spliceで配列の要素数が変わったため、同じインデックスを再チェック
        }
    }

    // 消去したライン数に応じてスコアを加算
    if (linesCleared > 0) {
        let points = 0;
        switch (linesCleared) {
            case 1: points = 100; break; // 1ライン
            case 2: points = 300; break; // 2ライン
            case 3: points = 500; break; // 3ライン
            case 4: points = 800; break; // 4ライン (テトリス)
        }
        updateScore(score + points); // スコアを更新
    }
}

// ゲームループ関連の変数
let dropCounter = 0;      // 落下タイミングを計るカウンター
let dropInterval = 1000;  // 通常の落下間隔 (ミリ秒)
let lastTime = 0;         // 前回のフレーム時間を保持
let gameRunning = true;   // ゲームが実行中かどうかのフラグ

/**
 * メインのゲームループ関数。
 * requestAnimationFrameを使用して繰り返し呼び出される。
 * テトリミノの落下処理、描画処理を行う。
 * @param {number} time - requestAnimationFrameから渡されるタイムスタンプ。
 */
function gameLoop(time = 0) {
    if (!gameRunning) { // ゲームが実行中でない場合 (ゲームオーバー時)
        drawGameOver(); // ゲームオーバー画面を描画してループを停止
        return;
    }

    const deltaTime = time - lastTime; // 前回フレームからの経過時間
    lastTime = time; // 今回のフレーム時間を保存

    dropCounter += deltaTime; // 落下カウンターに経過時間を加算

    // ソフトドロップが有効かどうかに応じて落下間隔を調整
    const currentDropInterval = (isSoftDropping ? dropInterval / 10 : dropInterval);

    // 落下カウンターが設定された落下間隔を超えたらブロックを1段落下させる
    if (dropCounter > currentDropInterval) {
        if (canMove(0, 1)) { // 1段下に移動可能か
            currentY++; // Y座標を増やして落下
        } else { // 移動できない場合 (床または他のブロックに衝突)
            lockTetromino(); // テトリミノを固定
            // lockTetromino内でゲームオーバーになる可能性があるので再チェック
            if (!gameRunning) {
                draw();         // 最後の盤面を描画
                drawGameOver(); // ゲームオーバーメッセージを表示
                return;         // ループを抜ける
            }
        }
        dropCounter = 0; // 落下カウンターをリセット
    }

    draw(); // ゲーム画面を再描画
    requestAnimationFrame(gameLoop); // 次のフレームでgameLoopを再度呼び出す
}

/**
 * ゲームオーバー画面を描画する関数。
 */
function drawGameOver() {
    // 半透明の黒い背景を画面中央に描画
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);

    // 「ゲームオーバー」のテキストを描画
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 20);

    // リスタート方法の案内テキストを描画
    context.font = '16px Arial';
    context.fillText('リフレッシュして再挑戦', canvas.width / 2, canvas.height / 2 + 20);
    console.log("Game Over displayed. Please refresh to restart.");
}

// キーボード入力の制御に関する変数
let isSoftDropping = false; // ソフトドロップ中かどうかのフラグ

// キーボードのキーが押されたときのイベントリスナー
document.addEventListener('keydown', event => {
    if (!gameRunning) return; // ゲームオーバー時は操作を無視

    switch (event.key) {
        case 'ArrowLeft': // 左矢印キー: 左に移動
            if (canMove(-1, 0)) {
                currentX--;
            }
            break;
        case 'ArrowRight': // 右矢印キー: 右に移動
            if (canMove(1, 0)) {
                currentX++;
            }
            break;
        case 'ArrowDown': // 下矢印キー: ソフトドロップ開始
            isSoftDropping = true;
            // 即座に1段落下させ、落下カウンターもリセットして連続的な落下を促す
            if (canMove(0, 1)) {
                currentY++;
                dropCounter = 0;
            } else {
                lockTetromino(); // 即座に固定される場合
            }
            break;
        case 'ArrowUp':   // 上矢印キー: 回転
        case ' ':         // スペースキー: 回転
            event.preventDefault(); // スペースキーによるページのスクロールを防止
            rotate();
            break;
    }
});

// キーボードのキーが離されたときのイベントリスナー
document.addEventListener('keyup', event => {
    if (event.key === 'ArrowDown') { // 下矢印キーが離されたら
        isSoftDropping = false; // ソフトドロップ状態を解除
    }
});


// ゲーム初期化処理
updateScore(0); // スコアを0で初期表示

// drawBoard();    // 初期ボードを描画（空の状態） // newTetrominoより前に描画すると最初のブロックが見えないことがあるので移動
newTetromino(); // 最初のテトリミノを生成
drawBoard();    // 最初のテトリミノ生成後にボードを描画

// 初期配置で既にゲームオーバーかどうかをチェック
// newTetromino()を2回呼んでいたのを1回に修正。最初のnewTetromino()で生成されたものでチェック。
if (!canMove(0,0)) {
    gameRunning = false; // ゲーム実行フラグをオフ
    draw();              // 現在の盤面（ブロックが置けない状態）を描画
    drawGameOver();      // ゲームオーバーメッセージを表示
} else {
    gameLoop(); // ゲームオーバーでなければメインループを開始
}
console.log("Tetris game initialized and started.");
