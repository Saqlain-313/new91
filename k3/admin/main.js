const socket = io();

/* =========================================================
   PAGE LOAD / INIT
   ========================================================= */
$(window).on('load', function () {
    setTimeout(() => {
        $('#preloader').fadeOut(0);
    }, 100);
});

$(document).ready(function () {
    $(`a[href="${window.location.pathname}"]`).addClass('active');
    $(`a[href="${window.location.pathname}"]`).css('pointerEvents', 'none');

    // Default game ke liye timer socket connect karo
    const defaultGame = Number($('html').attr('data-change') || 1);
    connectK3Timer(defaultGame);
});

$('.back-to-tops').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
});

/* =========================================================
   HELPERS
   ========================================================= */
const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
};

function formatMoney(amount, separator = ',') {
    if (typeof amount !== 'number') {
        amount = Number(amount);
    }
    if (isNaN(amount)) return '';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/* =========================================================
   K3 TIMER SOCKET
   - Sirf ek baar connect, game change par switch
   - Event names server ke saath match
   ========================================================= */
let k3TimerSocket = null;
let k3CurrentGame = null;

function connectK3Timer(checkID) {
    if (k3TimerSocket && k3CurrentGame === checkID) return; // same game, skip

    if (k3TimerSocket) {
        k3TimerSocket.disconnect();
        k3TimerSocket = null;
    }

    k3CurrentGame = checkID;
    k3TimerSocket = io(); // same origin

    let eventName = '';
    if (checkID == 5)       eventName = 'timeUpdate_5';
    else if (checkID == 3)  eventName = 'timeUpdate_3';
    else if (checkID == 1)  eventName = 'timeUpdate_11';
    else if (checkID == 10) eventName = 'timeUpdate_30'; // ✅ server 30 emit karta hai
    else return;

    k3TimerSocket.on(eventName, (data) => {
        if (!data) return;
        const { minute, secondtime1, secondtime2 } = data;
        $(".time .time-sub:eq(1)").text(minute);
        $(".time .time-sub:eq(2)").text(secondtime1);
        $(".time .time-sub:eq(3)").text(secondtime2);
    });
}

/* =========================================================
   RENDER: LIST ORDER
   ========================================================= */
function showListOrder(datas) {
    let html = '';

    datas.map((data) => {
        let list_kq = '';
        let total = 0;
        String(data.result).split('').forEach((e) => {
            total += Number(e);
            list_kq += `<span data-v-a9660e98="" class="red box-xs"> ${e} </span>`;
        });
        html +=
        `
        <div data-v-a9660e98="" class="c-tc item van-row">
            <div data-v-a9660e98="" class="van-col van-col--8">
                <div data-v-a9660e98="" class="c-tc goItem">${data.period}</div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--5">
                <div data-v-a9660e98="" class="c-tc goItem" style="display: flex;justify-content: center;">
                    ${list_kq}
                    <span data-v-a9660e98="" class="red box-xs"> = </span>
                    <span data-v-a9660e98="" class="red box-xs" style="font-size: 14px"> ${total} </span>
                </div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--5">
                <div data-v-a9660e98="" class="c-tc goItem">
                    <span data-v-a9660e98=""> ${(total >= 3 && total <= 10) ? "Small" : "Big"} </span>
                </div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--5">
                <div data-v-a9660e98="" class="c-tc goItem">
                    <span data-v-a9660e98=""> ${(total % 2 == 0) ? "Even" : "Odd"} </span>
                </div>
            </div>
        </div>
        `;
    });
    $('#list-orders').html(html);
}

/* =========================================================
   RENDER: CHAT MESSAGES (bulk from AJAX)
   ========================================================= */
function messNewJoin2(datas) {
    let result = '';
    datas.map((data) => {
        if (data.typeGame == 'total') {
            result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
                <div class="direct-chat-text" style="background-color: #1eb93d"> Join Total (${data.bet}) with the A mount of money ${data.money}</div>
            `;
        }
        if (data.typeGame == 'three-same') {
            result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
                <div class="direct-chat-text" style="background-color: #1eb93d"> Join 3 same numbers(${data.bet}) with the A mount of money ${data.money}</div>
            `;
        }
        if (data.typeGame == 'two-same') {
            result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
                <div class="direct-chat-text" style="background-color: #1eb93d"> Join 2 same numbers(${data.bet}) with the A mount of money ${data.money}</div>
            `;
        }
        if (data.typeGame == 'unlike') {
            result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
                <div class="direct-chat-text" style="background-color: #1eb93d"> Join another number(${data.bet}) with the A mount of money ${data.money}</div>
            `;
        }
    });
    $('.direct-chat-msg').html(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

/* =========================================================
   RENDER: TOTAL MONEY (bulk from AJAX)
   ========================================================= */
function messNewJoin3(datas) {
    let total = 0, twoSame = 0, threeSame = 0, unlike = 0;

    datas.map((data) => {
        let typeGame = data.typeGame;
        let money = parseInt(data.money, 10);

        if (typeGame === "total") {
            total += money;
            $(`#total`).attr('totalMoney', total).text(total);
        }
        if (typeGame === "two-same") {
            twoSame += money;
            $(`#2-so-trung`).attr('totalMoney', twoSame).text(twoSame);
        }
        if (typeGame === "three-same") {
            threeSame += money;
            $(`#3-so-trung`).attr('totalMoney', threeSame).text(threeSame);
        }
        if (typeGame === "unlike") {
            unlike += money;
            $(`#khac-so`).attr('totalMoney', unlike).text(unlike);
        }
    });
}

/* =========================================================
   AJAX: LIST ORDERS  (polling + socket trigger)
   ========================================================= */
function callListOrder() {
    let game = $('html').attr('data-change');
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/k3/listOrders",
        data: { gameJoin: game },
        dataType: "json",
        success: function (response) {
            showListOrder(response.data.gameslist);
            messNewJoin2(response.bet);
            messNewJoin3(response.bet);

            let settings = response.settings[0];
            if (game == 1)  $('#ketQua').text('next result: ' + `${(settings.k3d   == '-1') ? 'Random' : settings.k3d}`);
            if (game == 3)  $('#ketQua').text('next result: ' + `${(settings.k3d3  == '-1') ? 'Random' : settings.k3d3}`);
            if (game == 5)  $('#ketQua').text('next result: ' + `${(settings.k3d5  == '-1') ? 'Random' : settings.k3d5}`);
            if (game == 10) $('#ketQua').text('next result: ' + `${(settings.k3d10 == '-1') ? 'Random' : settings.k3d10}`);

            $(".reservation-chunk-sub-num").text(response.period);
            $('#preloader').fadeOut(0);
        }
    });
}

// Polling (backup)
setInterval(callListOrder, 2000);
callListOrder();

/* =========================================================
   SOCKET: SINGLE BET EVENT (real-time append)
   ========================================================= */
function messNewJoin(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (data.game != game) return;

    let typeGame = '';
    if (data.gameJoin == 1) typeGame = 'total';
    if (data.gameJoin == 2) typeGame = 'two-same';
    if (data.gameJoin == 3) typeGame = 'three-same';
    if (data.gameJoin == 4) typeGame = 'unlike';

    let result = '';
    const amt = Number(data.money) * Number(data.xvalue);

    if (typeGame == 'total') {
        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
            <div class="direct-chat-text" style="background-color: #1eb93d"> Join Total(${data.listJoin}) with the A mount of money ${amt}</div>
        `;
    }
    if (typeGame == 'three-same') {
        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
            <div class="direct-chat-text" style="background-color: #1eb93d"> Join 3 same numbers(${data.listJoin}) with the A mount of money ${amt}</div>
        `;
    }
    if (typeGame == 'two-same') {
        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
            <div class="direct-chat-text" style="background-color: #1eb93d"> Join 2 same numbers(${data.listJoin}) with the A mount of money ${amt}</div>
        `;
    }
    if (typeGame == 'unlike') {
        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
            <div class="direct-chat-text" style="background-color: #1eb93d"> Join another number(${data.listJoin}) with the A mount of money ${amt}</div>
        `;
    }

    if (!result) return;

    $('.direct-chat-msg').append(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

/* =========================================================
   SOCKET: TOTAL MONEY UPDATE (real-time increment)
   ========================================================= */
function messNewJoin5(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (data.game != game) return;

    let typeGame = "";
    if (data.gameJoin == 1) typeGame = "total";
    if (data.gameJoin == 2) typeGame = "two-same";
    if (data.gameJoin == 3) typeGame = "three-same";
    if (data.gameJoin == 4) typeGame = "unlike";

    const add = Number(data.money) * Number(data.xvalue);

    const bump = (sel) => {
        let money = Number($(sel).attr('totalMoney') || 0) + add;
        $(sel).attr('totalMoney', money).text(money);
    };

    if (typeGame == "total")      bump('#total');
    if (typeGame == "two-same")   bump('#2-so-trung');
    if (typeGame == "three-same") bump('#3-so-trung');
    if (typeGame == "unlike")     bump('#khac-so');
}

/* =========================================================
   SOCKET LISTENERS — SINGLE MERGED HANDLER
   ========================================================= */
socket.on("data-server-k3", function (msg) {
    if (!msg) return;

    // Result / new round aaya — list refresh
    callListOrder();
    $('.direct-chat-msg').html('');

    // Real-time bet update
    messNewJoin(msg);
    messNewJoin5(msg);
});

/* =========================================================
   GAME SWITCH
   ========================================================= */
$('#manage .col-12').click(async function (e) {
    e.preventDefault();
    $('#preloader').fadeIn(0);

    let game = $(this).attr('data');
    $('html').attr('data-change', game);

    connectK3Timer(Number(game)); // ✅ timer socket switch

    await callListOrder();

    $('#manage .col-12').removeClass('block-click');
    $(this).addClass('block-click');
    $('#manage .col-12').find('.info-box-content').removeClass('active-game');
    $(this).find('.info-box-content').addClass('active-game');
});