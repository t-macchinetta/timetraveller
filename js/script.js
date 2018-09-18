$(function () {
    //初期化
    var canvas_mouse_event = false; //スイッチ [ true=線を引く, false=線は引かない ]
    //var txy   = 10;               //iPadなどは15＋すると良いかも
    var oldX = 0; //１つ前の座標を代入するための変数
    var oldY = 0; //１つ前の座標を代入するための変数
    var bold_line = 3; //ラインの太さをここで指定
    var oldline = 3;
    var color = "#000"; //ラインの色をここで指定
    var alpha = 1; //透明度
    var oldalpha = 1;
    var imageData = 0;
    var oldData = [];
    var cnt = 0;

    var can = $("#drowarea")[0];
    var context = can.getContext("2d");
    var can2 = $("#plusarea")[0];
    var context2 = can2.getContext("2d");

    //最初は消しゴムモード
    context.globalCompositeOperation = 'destination-out';
    bold_line = 80;
    alpha = 0;

    //wrapの大きさを画面に合わせる
    //縦横比は3:2とする
    function fitting() {
        $('#wrap').height($(window).height() - 72);
        var ratio = $('#wrap').height() * 1.5;
        $('#wrap').width(ratio);
        //wrapの大きさを取得
        var container = $('#wrap')[0];
        sizing();
        //canvasの大きさを画面に揃える
        function sizing() {
            can.height = container.offsetHeight;
            can.width = container.offsetWidth;
            can2.height = container.offsetHeight;
            can2.width = container.offsetWidth;
        }
        //いい感じにフェードイン
        $('#wrap').hide();
        $('#wrap').fadeIn(1000);
        //最初の画像を読み込む
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.clearRect(0, 0, can.width, can.height);
        var img = new Image(); //新規画像オブジェクト
        img.src = 'b_img/canvas_texture_by_powerpuffjazz.jpg'; //読み込みたい画像のパス
        img.onload = function () {
            //画像の読み込みが終わったら、Canvasに画像を反映する。
            context.drawImage(img, 0, 0, can.width, can.height);
            context2.drawImage(img, 0, 0, can.width, can.height);
            context.globalCompositeOperation = 'destination-out';
            bold_line = 80;
            alpha = 0;
        }

    }
    fitting();
    //リサイズ時の処理
    $(window).on('resize', function () {
        fitting();
    });
    //ファイル読み込み時の処理
    $('#menu').on({
        'mouseenter': function () {
            //マウスオーバー時の処理
            $('#modal').fadeIn(1000);
            //            $('#modal').css('display', 'block');
        },
        'mouseleave': function () {
            // マウスアウト時の処理
            $('#modal').fadeOut(500);
            //            $('#modal').css('display', 'none');
        }
    });
    $("#file").on("change", function () {
        //Canvasに書けるようにしておく
        context.globalCompositeOperation = 'source-over';
        // フォームで選択されたファイルを取得
        var fileList = this.files;
        // Blob URLの作成
        var blobUrl = window.URL.createObjectURL(fileList[0]);
        //canvasを初期化して書き込む
        context.beginPath();
        context.clearRect(0, 0, can.width, can.height);

        //いい感じにフェードイン
        $('#wrap').hide();
        $('#wrap').fadeIn(1000);
        var img = new Image(); //新規画像オブジェクト
        img.src = blobUrl; //読み込みたい画像のパス
        img.onload = function () {
            //画像の読み込みが終わったら、Canvasに画像を反映する。
            context.drawImage(img, 0, 0, can.width, can.height);
            context2.drawImage(img, 0, 0, can2.width, can2.height);
            //画像をグレースケールにする
            var pics = context.getImageData(0, 0, can.width, can.height);
            //描画内容に対して、上記のグレースケールにする式を当てはめながらrgbの値を計算する
            var d = pics.data;
            for (var i = 0; i < d.length; i += 4) {
                var g = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
                //わかりやすいようにセピア色にしてみる
                d[i] = (g / 255) * 240;
                d[i + 1] = (g / 255) * 200;
                d[i + 2] = (g / 255) * 145;
                // d[i+3]に格納されたα値は変更しない
            }
            // 計算結果でCanvasの表示内容を更新する。
            context.putImageData(pics, 0, 0);
            //最初は消しゴムモード
            context.globalCompositeOperation = 'destination-out';
            bold_line = 80;
            alpha = 1;
            cnt = 0;
            oldData.length = 0;
            $('#file').val('');
        }
    });

    //マウスダウン時に書けるようにする
    $(can).on('mousedown', function (e) {
        oldX = e.offsetX;
        oldY = e.offsetY;
        canvas_mouse_event = true;
        imageData = context.getImageData(0, 0, can.width, can.height);
        oldData.push(imageData);
        cnt++;
    });

    //動かしている状態で描画する
    $(can).on('mousemove', function (e) {
        if (canvas_mouse_event == true) {
            var px = e.offsetX; //現在の座標を取得する
            var py = e.offsetY; //現在の座標を取得する
            context.strokeStyle = color;
            context.lineWidth = bold_line;
            context.globalAlpha = alpha;
            context.beginPath(); //座標をリセットする
            context.lineJoin = "round"; //書かないとジャギる
            context.lineCap = "round"; //書かないとジャギる
            context.moveTo(oldX, oldY); //開始地点
            context.lineTo(px, py); //終了地点
            context.stroke(); //一つ前の座標と現在の座標の間に線を引く
            context.closePath();
            oldX = px;
            oldY = py;
        }
    });

    //マウスを離したときの挙動
    $(can).on('mouseup', function (e) {
        canvas_mouse_event = false;
    });

    //カーソルがキャンバスから外れると描画を中止する
    $(can).on('mouseleave', function () {
        canvas_mouse_event = false;
    });


    //戻るボタンで一つ前へ戻る
    $('#back').on('click', function () {
        if (cnt > 0) {
            context.putImageData(oldData[cnt - 1], 0, 0);
            oldData.pop();
            cnt--;
        } else {
            oldData.length = 0;
            return;
        }
    });

    //クリアでタイトルと描画内容全消し
    $('#clear').on('click', function () {
        context.beginPath();
        context.clearRect(0, 0, can.width, can.height);
        $('#title').val('');
    });
    //removeで初期状態に戻す
    $('#remove').on('click', function () {
        context.beginPath();
        context.clearRect(0, 0, can.width, can.height);
        fitting();
        oldData.length = 0;
        $('#title').val('');
    });

});
