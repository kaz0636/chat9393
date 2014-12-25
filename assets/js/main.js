(function() {

    "use strict";

    var
        milkcocoa = new MilkCocoa("https://io-ui43fb3ee.mlkcca.com"),
        $board = $('#board'),
        $textArea = $('#msg'),
        user_id,
        user_name;

    var room = location.hash.substr(1);
    if (room == "") {
        room = "_empty";
    }

    var dataStore = milkcocoa.dataStore("chat");
    var chatDataStore = dataStore.child(room);

    bootbox.setDefaults({
        locale: "ja"
    });

    /**
     * メッセージを送信する。
     * @param {string} id 登録ユーザーのID
     * @param {string} user 登録ユーザー名
     * @param {string} text メッセージ本文
     */
    function sendData(id, user, text) {
        chatDataStore.push({
            user_id: id,
            user: user,
            message: text,
            datetime: formatDate(new Date(), "YYYY-MM-DD hh:mm:ss")
        }, function(data) {
            $textArea.val("");
        });
    }

    /**
     * メッセージ行を追加する。
     * @param {object} data 追加するデータ
     */
    function addLine(data) {

        var line;

        line = '<dt>';
        line += data.user;
        if (data.user_id == user_id || data.user_id == 'anonymous') {
            line += '<a href="#" class="closeBtn"><i class="glyphicon glyphicon-remove"></i></a>';
        }
        line += '</dt>';
        line += '<dd id="' + data.id + '">';
        line += nl2br(h(data.message));
        line += '<div class="datetime">' + data.datetime + '</div>';
        line += '</dd>';

        $board.prepend(line);
    }

    /**
     * メッセージ行削除（ローカル）
     * @param {string} msgLine 削除するデータ
     */
    function delLine(msgLine) {

        var $dt = $(msgLine).parent(),
            $dd = $dt.next(),
            msgid = $dd.attr('id');

        $dd.addClass('delline');

        bootbox.confirm('メッセージを削除しますか？', function(result) {
            if (result) {
                $dt.remove();
                $dd.remove();
                chatDataStore.remove(msgid);
            } else {
                $dd.removeClass('delline');
            }
        });
    }

    /**
     * メッセージ行削除（リモート）
     * @param {object} data 削除するデータ
     */
    function delLineRemote(data) {

        var
            $dd = $('#' + data.id),
            $dt = $dd.prev();

        $dt.remove();
        $dd.remove();
    }

    /**
     * ログイン状態の確認と処理
     */
    function chkLogin() {
        milkcocoa.getCurrentUser(function(err, user) {
            if (!err) {
                loggedIn(user);
            } else {
                loggedOut();
            }
        });
    }

    /**
     * ログイン状態時の処理
     */
    function loggedIn(user) {
        user_id = user.id;
        user_name = user.option.name;
        $("#uname").text(user_name);
        $('#logOut').show();
        $('#logIn').hide();
    }

    /**
     * ログアウト状態時の処理
     */
    function loggedOut() {
        user_id = 'anonymous';
        user_name = '匿名@9393';
        $("#uname").text(user_name);
        $('#logOut').hide();
        $('#logIn').show();
    }

    /**
     * 改行を<br>タグに変換
     * @param {string} str 変換する文字列
     * @returns {string} 変換後の文字列
     */
    function nl2br(str) {
        return str.replace(/[\n\r]/g, "<br>");
    }

    /**
     * htmlタグのエスケープ処理
     * @param {string} str エスケープ処理をする文字列
     * @returns {string} エスケープ処理後の文字列
     */
    function h(val) {
        return $('<div />').text(val).html();
    }

    /**
     * 日付フォーマット処理
     * @param {(Date|string)} date 日付オブジェクトまたは日付文字列
     * @param {[string]} format フォーマット文字列
     * @returns {string} フォーマット後の文字列
     */
    function formatDate(date, format) {
        if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
        format = format.replace(/YYYY/g, date.getFullYear());
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        if (format.match(/S/g)) {
            var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
            var length = format.match(/S/g).length;
            for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
        }
        return format;
    }

    jQuery(function($) {

        /**
         * リモートでデータが追加された時のイベントをバインド
         */
        chatDataStore.on("push", function(data) {
            addLine(data.value);
        });

        /**
         * リモートでデータが削除された時のイベントをバインド
         */
        chatDataStore.on('remove', function(data) {
            delLineRemote(data);
        });

        /**
         * 送信ボタンが押された時のイベントをバインド
         */
        $('#btnSend').on('click', function() {

            var
                text = $textArea.val(),
                user = user_name,
                id = user_id ? user_id : 'anonymous';

            if (text) {
                sendData(id, user, text);
            }
            return false;
        });

        /**
         * メッセージ削除時のイベントをバインド
         */
        $(document).on('click', '.closeBtn', function() {
            delLine(this);
            return false;
        });

        /**
         * 登録ボタン（ダイアログ）を押した時のイベントをバインド
         */
        $('#regBtn').on('click', function() {

            var
                name = $('#rname').val(),
                email = $('#remail').val(),
                passwd = $('#rpasswd').val(),
                msg;

            if (!name) {
                msg = 'ユーザー名を入力してください。';
                bootbox.alert(msg);
                return false;
            }

            if (!passwd) {
                msg = 'パスワードを入力してください。';
                bootbox.alert(msg);
                return false;
            }

            milkcocoa.addAccount(email, passwd, {
                name: name
            }, function(err, user) {
                var msg;
                switch (err) {
                    case null:
                        msg = '仮登録が完了しました。\n確認用のメールを送信しましたので登録を完了してください。';
                        break;
                    case MilkCocoa.Error.AddAccount.FormatError:
                        msg = '無効な書式のメールアドレスです。\n正しい形式で入力してください。';
                        break;
                    case MilkCocoa.Error.AddAccount.AlreadyExist:
                        msg = '既に追加されているメールアドレスです。';
                        break;
                }
                bootbox.alert(msg);
            });
            return false;
        });

        /**
         * ログインボタン（ダイアログ）を押した時のイベントをバインド
         */
        $('#loginBtn').on('click', function() {

            var
                email = $('#lemail').val(),
                passwd = $('#lpasswd').val();

            milkcocoa.login(email, passwd, function(err, user) {
                var msg = '';
                if (err === MilkCocoa.Error.Login.FormatError) {
                    msg = 'メールアドレスの形式が無効です。\n正しい形式で入力してください。';
                } else if (err === MilkCocoa.Error.Login.LoginError) {
                    msg = '登録されていないメールアドレスか、無効なパスワードです。';
                } else if (err === MilkCocoa.Error.Login.EmailNotVerificated) {
                    msg = 'アカウントが仮登録の状態です。\n登録時にお送りしたメールを確認してください。';
                } else {
                    loggedIn(user);
                    window.location.reload();
                }
                if (msg) {
                    bootbox.alert(msg);
                }
            });
            return false;
        });

        /**
         * ログアウト処理のイベントをバインド
         */
        $('#loggedOut').on('click', function() {
            bootbox.confirm('ログアウトしますか？', function(result) {
                if (result) {
                    milkcocoa.logout(function(err) {
                        if (!err) {
                            loggedOut();
                            window.location.reload();
                        }
                    });
                }
            });
            return false;
        });

        /**
         * ダイアログ表示時の初期化処理
         */
        $('#loginModal').on('show.bs.modal', function(e) {
            $('#loginModalLabel').text('ログイン');
            $('#loginTab').addClass('active');
            $('#registerTab').removeClass('active');
        });

        /**
         * ダイアログ内タブ切り替え時の処理
         */
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var tabName = e.target.hash.substr(1);
            if (tabName == 'loginTab') {
                $('#loginModalLabel').text('ログイン');
            } else if (tabName == 'registerTab') {
                $('#loginModalLabel').text('登録');
            }
        });

        /**
         * ログイン状態の確認
         */
        chkLogin();

        /**
         * 初期のデータの表示
         */
        var query = chatDataStore.query();
        query.done(function(data) {
            data.forEach(function(value) {
                addLine(value);
            });
        });

    });
})();
